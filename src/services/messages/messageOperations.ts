
import { supabase } from '@/integrations/supabase/client';

/**
 * Get message data for flagged messages only
 */
export const getFlaggedMessageData = async (messageId: string) => {
  const { data: messageData, error: messageError } = await supabase
    .from('messages')
    .select('sender_email, recipient_email, token_id')
    .eq('id', messageId)
    .eq('is_flagged', true)
    .maybeSingle();
    
  console.log('Message lookup result:', { messageData, messageError });
  
  if (messageError || !messageData) {
    console.error('Could not access message data - this should not happen for flagged messages');
    return { messageData: null, error: messageError };
  }
  
  return { messageData, error: null };
};

/**
 * Update message flagged status
 */
export const updateMessageFlaggedStatus = async (tokenId: string) => {
  const { error: messageUpdateError } = await supabase
    .from('messages')
    .update({ is_flagged: true })
    .eq('token_id', tokenId);
    
  if (messageUpdateError) {
    console.error('Error updating message flag status:', messageUpdateError);
    return false;
  } else {
    console.log(`Successfully marked message with token ${tokenId} as flagged`);
    return true;
  }
};
