
import { supabase } from '@/integrations/supabase/client';
import { logEvent } from '@/services/auditLogger';
import { getFlaggedMessageByToken, updateFlaggedMessageStatus, updateFlaggedMessageWithError } from './flaggedMessageOperations';
import { createMessagingRestriction } from './messagingRestrictionOperations';

/**
 * Freeze token (for moderators) and create messaging restriction
 */
export const freezeToken = async (tokenId: string): Promise<boolean> => {
  console.log(`Freezing token ${tokenId}...`);
  console.log(`Token ID type: ${typeof tokenId}, length: ${tokenId.length}, value: "${tokenId}"`);
  
  try {
    // Get current user session
    const { data: { session } } = await supabase.auth.getSession();
    if (!session) {
      console.error('No authenticated session');
      return false;
    }
    
    console.log('Current user session:', session.user.id, session.user.email);
    
    // Get the flagged message details
    const { flaggedMessage, error: flaggedError } = await getFlaggedMessageByToken(tokenId);
    
    if (flaggedError || !flaggedMessage) {
      console.error('Error finding flagged message:', flaggedError);
      return false;
    }
    
    console.log('Found flagged message:', flaggedMessage);
    
    // Get the message data using the message_id from flagged message
    const { data: messageData, error: messageError } = await supabase
      .from('messages')
      .select('sender_email, recipient_email, token_id, id')
      .eq('id', flaggedMessage.message_id)
      .maybeSingle();
    
    console.log('Message query result:', { messageData, messageError });
    
    if (messageError || !messageData) {
      console.error('Could not access message data:', messageError);
      
      // Update flagged message with error
      await updateFlaggedMessageWithError(
        tokenId,
        session.user.id,
        `Token ${tokenId} frozen but messaging restriction could not be created - message not found`
      );
      
      // Log the failure
      await logEvent('flag_message', {
        user_id: session.user.id,
        token_id: tokenId,
        message_id: flaggedMessage.message_id,
        action: 'moderator_reviewed_flagged_message',
        moderator_action: true,
        decision: 'frozen',
        error: 'message_not_found',
        reason: `Token frozen but messaging restriction creation failed: message not found`
      });
      
      return false;
    }
    
    const senderEmail = messageData.sender_email;
    const recipientEmail = messageData.recipient_email;
    
    console.log('Found message emails:', { senderEmail, recipientEmail });
    
    // Create the messaging restriction
    const { success: restrictionSuccess, error: restrictionError } = await createMessagingRestriction(
      senderEmail,
      recipientEmail,
      tokenId,
      session.user.id
    );
    
    if (!restrictionSuccess) {
      console.error('Failed to create messaging restriction:', restrictionError);
      
      // Update flagged message with error
      await updateFlaggedMessageWithError(
        tokenId,
        session.user.id,
        `Token ${tokenId} frozen but messaging restriction creation failed: ${restrictionError?.message}`
      );
      
      // Log failure
      await logEvent('flag_message', {
        user_id: session.user.id,
        token_id: tokenId,
        sender_email: senderEmail,
        recipient_email: recipientEmail,
        action: 'moderator_reviewed_flagged_message',
        moderator_action: true,
        decision: 'frozen',
        error: 'messaging_restriction_creation_failed',
        reason: `Messaging restriction creation failed: ${restrictionError?.message}`
      });
      
      return false;
    }
    
    console.log('Messaging restriction created successfully');
    
    // Update the flagged message status to reviewed
    const statusUpdateSuccess = await updateFlaggedMessageStatus(
      tokenId,
      session.user.id,
      `Token ${tokenId} frozen by moderator and messaging restriction created between ${senderEmail} and ${recipientEmail}`
    );
    
    if (!statusUpdateSuccess) {
      console.error('Failed to update flagged message status');
      return false;
    }
    
    // Log successful action
    await logEvent('flag_message', {
      user_id: session.user.id,
      token_id: tokenId,
      sender_email: senderEmail,
      recipient_email: recipientEmail,
      action: 'moderator_reviewed_flagged_message',
      moderator_action: true,
      decision: 'frozen',
      restriction_created: true,
      reason: `Token frozen and messaging restriction created between ${senderEmail} and ${recipientEmail}`
    });
    
    console.log(`Token ${tokenId} frozen and messaging restriction created successfully`);
    return true;
  } catch (error) {
    console.error('Error in freezeToken operation:', error);
    return false;
  }
};
