
import { Message } from '@/types';
import { supabase } from '@/integrations/supabase/client';
import { logEvent } from '@/services/auditLogger';
import { encryptionService } from '@/services/encryptionService';

/**
 * Flag a message for review
 */
export const flagMessage = async (messageId: string): Promise<Message | undefined> => {
  try {
    console.log('Starting flagMessage operation for message ID:', messageId);
    
    // First check if the message is already flagged in the flagged_messages table
    const { data: existingFlag, error: checkError } = await supabase
      .from('flagged_messages')
      .select('*')
      .eq('message_id', messageId)
      .maybeSingle();
      
    if (checkError) {
      console.error('Error checking for existing flag:', checkError);
      // Continue with flagging since this is just a check
    } else if (existingFlag) {
      console.log('Message already flagged:', messageId);
      // Return the already flagged message with its existing data
      const { data: messageData } = await supabase
        .from('messages')
        .select('*')
        .eq('id', messageId)
        .maybeSingle();
      
      if (messageData) {
        return {
          id: messageData.id,
          tokenId: messageData.token_id,
          content: messageData.content,
          isEncrypted: messageData.is_encrypted,
          timestamp: messageData.timestamp,
          isFlagged: true, // It's already flagged
          priority: messageData.priority as "High" | "Medium" | "Low" | undefined,
          senderEmail: messageData.sender_email,
          recipientEmail: messageData.recipient_email,
          flagDetails: {
            id: existingFlag.message_id,
            status: existingFlag.status as 'pending' | 'reviewed' | 'dismissed',
            flaggedAt: existingFlag.flagged_at,
            reason: existingFlag.reason || ''
          }
        };
      }
      return undefined;
    }

    // Get the message details
    const { data: messageData, error: fetchError } = await supabase
      .from('messages')
      .select('*')
      .eq('id', messageId)
      .maybeSingle();
      
    if (fetchError) {
      console.error('Error fetching message for flagging:', fetchError);
      console.error('Fetch error details:', JSON.stringify(fetchError, null, 2));
      return undefined;
    }
    
    if (!messageData) {
      console.error('No message found with ID:', messageId);
      return undefined;
    }

    console.log('Found message to flag:', messageData);
    
    // Update the message record first
    const { error: updateError } = await supabase
      .from('messages')
      .update({ 
        is_flagged: true,
        priority: 'Medium' 
      })
      .eq('id', messageId);
      
    if (updateError) {
      console.error('Error updating message as flagged:', updateError);
      console.error('Update error details:', JSON.stringify(updateError, null, 2));
      // Continue anyway to try inserting the flagged_messages record
      console.log('Will continue to create flagged_messages entry despite message update error');
    } else {
      console.log('Successfully updated message flag status');
    }

    // Get current user for flagged_by field
    const { data: { session } } = await supabase.auth.getSession();
    const currentUserId = session?.user?.id;
    
    console.log('Current user ID for flagging:', currentUserId);
    
    // Try to decrypt the message if it's encrypted
    let decryptedContent = messageData.content;
    if (messageData.is_encrypted && messageData.recipient_email) {
      console.log('Attempting to decrypt message for recipient:', messageData.recipient_email);
      try {
        const decrypted = encryptionService.decryptMessage(messageData.content, messageData.recipient_email);
        if (decrypted && !decrypted.includes('Failed to decrypt')) {
          console.log('Successfully decrypted message content');
          decryptedContent = decrypted;
        } else {
          console.log('Could not decrypt message, will store encrypted content');
          decryptedContent = '[ENCRYPTED] Content requires decryption keys for full review';
        }
      } catch (decryptError) {
        console.error('Decryption error:', decryptError);
        decryptedContent = '[ENCRYPTED] Content requires decryption keys for full review';
      }
    }
    
    // Create an entry in the flagged_messages table
    const flaggedMessageData = {
      message_id: messageId,
      token_id: messageData.token_id,
      flagged_by: currentUserId || null,
      reason: 'User reported content',
      status: 'pending',
      decrypted_content: decryptedContent,
      flagged_at: new Date().toISOString()
    };

    console.log('Inserting flagged message data:', flaggedMessageData);

    const { data: flaggedData, error: flagError } = await supabase
      .from('flagged_messages')
      .insert(flaggedMessageData)
      .select()
      .single();

    if (flagError) {
      console.error('Error creating flagged message entry:', flagError);
      console.error('Flag error details:', JSON.stringify(flagError, null, 2));
      return undefined;
    } else {
      console.log('Successfully created flagged message entry:', flaggedData);
    }
    
    // Log flag event
    if (currentUserId) {
      try {
        await logEvent('flag_message', {
          message_id: messageId,
          user_id: currentUserId,
          token_id: messageData.token_id,
          action: 'message_flagged',
          reason: 'User reported content'
        });
        console.log('Successfully logged flag event');
      } catch (logError) {
        console.error('Error logging flag event:', logError);
      }
    }
    
    // Get the updated message data
    const { data: updatedMessage } = await supabase
      .from('messages')
      .select('*')
      .eq('id', messageId)
      .maybeSingle();
    
    if (!updatedMessage) {
      console.error('Could not fetch updated message data');
      return undefined;
    }
    
    // Convert from snake_case (database) to camelCase (frontend)
    const message: Message = {
      id: updatedMessage.id,
      tokenId: updatedMessage.token_id,
      content: updatedMessage.content,
      isEncrypted: updatedMessage.is_encrypted,
      timestamp: updatedMessage.timestamp,
      isFlagged: true, // Force this to true even if update failed
      priority: updatedMessage.priority as "High" | "Medium" | "Low" | undefined,
      senderEmail: updatedMessage.sender_email,
      recipientEmail: updatedMessage.recipient_email,
      flagDetails: {
        id: flaggedData.message_id,
        status: flaggedData.status as 'pending' | 'reviewed' | 'dismissed',
        flaggedAt: flaggedData.flagged_at,
        reason: flaggedData.reason || ''
      }
    };
    
    console.log('Flag operation completed successfully for message:', message.id);
    return message;
  } catch (error) {
    console.error('Error in flagMessage operation:', error);
    console.error('Full error details:', JSON.stringify(error, null, 2));
    return undefined;
  }
};

/**
 * Update a message's decrypted content in the flagged_messages table
 */
export const updateDecryptedContent = async (messageId: string, decryptedContent: string): Promise<boolean> => {
  try {
    const { error } = await supabase
      .from('flagged_messages')
      .update({ decrypted_content: decryptedContent })
      .eq('message_id', messageId);
      
    if (error) {
      console.error('Error updating decrypted content:', error);
      return false;
    }
    
    console.log('Successfully updated decrypted content for message:', messageId);
    return true;
  } catch (error) {
    console.error('Error in updateDecryptedContent operation:', error);
    return false;
  }
};
