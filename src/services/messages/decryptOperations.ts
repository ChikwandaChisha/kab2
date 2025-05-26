
import { Message } from '@/types';
import { supabase } from '@/integrations/supabase/client';
import { encryptionService } from '@/services/encryptionService';
import { auditHelpers } from '@/services/auditLogger';

/**
 * Decrypt a message for the intended recipient
 */
export const decryptMessage = async (messageId: string, userEmail: string): Promise<Message | undefined> => {
  // First get the encrypted message
  const { data, error } = await supabase
    .from('messages')
    .select('*')
    .eq('id', messageId)
    .single();
    
  if (error || !data.is_encrypted) {
    console.error('Error fetching message for decryption:', error);
    return undefined;
  }
  
  // Check if this user is the intended recipient
  if (data.recipient_email !== userEmail) {
    console.error('User is not the intended recipient of this message');
    return undefined;
  }
  
  // Get current session for audit logging
  const { data: { session } } = await supabase.auth.getSession();
  const currentUserId = session?.user?.id;
  
  // Check if user is a moderator
  const { data: profile } = await supabase
    .from('profiles')
    .select('role')
    .eq('id', currentUserId)
    .single();
    
  const isModerator = profile?.role === 'Moderator' || profile?.role === 'Admin';
  
  // Decrypt the message content
  const decryptedContent = encryptionService.decryptMessage(data.content, userEmail);
  console.log('Attempted to decrypt message, result:', 
    decryptedContent === 'Failed to decrypt: No private key available' ? 'No private key found' : 'Success');
  
  // Log decryption event
  if (currentUserId) {
    await auditHelpers.logMessageDecrypted(
      messageId,
      currentUserId,
      data.token_id,
      isModerator
    );
  }
  
  // Return a message with the decrypted content
  return {
    id: data.id,
    tokenId: data.token_id,
    content: decryptedContent || 'Decryption failed',
    isEncrypted: false,
    timestamp: data.timestamp,
    isFlagged: data.is_flagged,
    priority: data.priority as "High" | "Medium" | "Low" | undefined,
    senderEmail: data.sender_email,
    recipientEmail: data.recipient_email
  };
};
