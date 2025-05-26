
import { Message } from '@/types';
import { encryptionService } from '../encryptionService';
import { supabase } from '@/integrations/supabase/client';
import { auditHelpers } from '@/services/auditLogger';

/**
 * Sends a new message using the secure database function
 */
export const sendMessage = async (
  content: string,
  recipientEmail: string,
  senderEmail?: string
): Promise<Message> => {
  try {
    // Generate a token ID for the message
    const tokenId = encryptionService.generateToken();
    
    // Check if user is authenticated
    const { data: { session } } = await supabase.auth.getSession();
    if (!session) {
      throw new Error('User not authenticated');
    }

    // Get sender's email from session if not provided and normalize to lowercase
    const actualSenderEmail = (senderEmail || session.user.email)?.toLowerCase();
    if (!actualSenderEmail) {
      throw new Error('Sender email not found');
    }

    // Normalize recipient email to lowercase for consistent lookup
    const normalizedRecipientEmail = recipientEmail.toLowerCase();
    
    // Check if messaging is restricted - only check if the current sender is restricted from messaging this recipient
    // This allows recipients to still message back to blocked senders
    console.log('Checking if sender is restricted from messaging recipient:', actualSenderEmail, 'to', normalizedRecipientEmail);
    const { data: isRestricted, error: restrictionError } = await supabase.rpc(
      'is_messaging_restricted',
      { 
        sender_email: actualSenderEmail,
        recipient_email: normalizedRecipientEmail
      }
    );
    
    if (restrictionError) {
      console.error('Error checking messaging restrictions:', restrictionError);
      throw new Error('Could not verify messaging permissions');
    }
    
    if (isRestricted) {
      console.log('Sender is restricted from messaging this recipient');
      throw new Error('You are not allowed to send messages to this recipient due to previous violations.');
    }
    
    console.log('No messaging restrictions found, proceeding with message sending');
    console.log('Preparing to encrypt message for recipient:', normalizedRecipientEmail);
    
    // Use the database function to get recipient's public key
    const { data: publicKey, error: keyError } = await supabase.rpc(
      'get_user_public_key',
      { p_email: normalizedRecipientEmail }
    );
    
    if (keyError) {
      console.error('Error fetching recipient public key:', keyError);
      throw new Error('Could not find recipient\'s encryption key');
    }
    
    if (!publicKey) {
      console.error('No public key found for recipient:', normalizedRecipientEmail);
      throw new Error(`Recipient ${recipientEmail} has not registered or doesn't have encryption keys set up`);
    }
    
    console.log('Found recipient public key, proceeding with encryption');
    
    // Encrypt message with recipient's public key
    let encryptedContent: string;
    try {
      encryptedContent = encryptionService.encryptMessage(content, publicKey);
      console.log('Message encrypted successfully with recipient\'s public key');
    } catch (error) {
      console.error('Encryption failed:', error);
      throw new Error('Failed to encrypt message');
    }
    
    // Call the Supabase RPC function to insert the message
    const { data, error } = await supabase.rpc('insert_message', {
      p_token_id: tokenId,
      p_content: encryptedContent,
      p_is_encrypted: true,
      p_sender_email: actualSenderEmail,
      p_recipient_email: normalizedRecipientEmail
    });

    if (error) {
      console.error('Error sending message:', error);
      throw error;
    }

    console.log('Message sent successfully:', data);
    
    // Log message sent event
    await auditHelpers.logMessageSent(
      data, // message ID returned from insert_message
      session.user.id,
      normalizedRecipientEmail,
      tokenId
    );
    
    // Create the message object with the data we already have, without fetching
    const message: Message = {
      id: data, // The returned value is the UUID of the inserted message
      tokenId: tokenId,
      content: 'Encrypted Message', // Display "Encrypted Message" in the UI
      isEncrypted: true,
      timestamp: new Date().toISOString(),
      isFlagged: false,
      priority: undefined,
      senderEmail: actualSenderEmail,
      recipientEmail: normalizedRecipientEmail
    };
    
    console.log('Message sent successfully:', message);
    
    return message;
  } catch (error) {
    console.error('Error in sendMessage:', error);
    throw error;
  }
};
