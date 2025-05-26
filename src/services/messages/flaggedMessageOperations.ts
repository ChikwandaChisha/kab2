
import { supabase } from '@/integrations/supabase/client';

/**
 * Get flagged message details by token ID
 */
export const getFlaggedMessageByToken = async (tokenId: string) => {
  const { data: flaggedMessage, error: flaggedError } = await supabase
    .from('flagged_messages')
    .select('*')
    .eq('token_id', tokenId)
    .eq('status', 'pending')
    .maybeSingle();
    
  if (flaggedError) {
    console.error('Error finding flagged message:', flaggedError);
    return { flaggedMessage: null, error: flaggedError };
  }
  
  return { flaggedMessage, error: null };
};

/**
 * Update flagged message status to reviewed
 */
export const updateFlaggedMessageStatus = async (
  tokenId: string, 
  userId: string, 
  notes: string
) => {
  const { error: updateError } = await supabase
    .from('flagged_messages')
    .update({ 
      status: 'reviewed',
      reviewed_at: new Date().toISOString(),
      reviewed_by: userId,
      notes
    })
    .eq('token_id', tokenId)
    .eq('status', 'pending');
    
  if (updateError) {
    console.error('Error updating flagged message status:', updateError);
    return false;
  }
  
  console.log('Successfully updated flagged message status to reviewed');
  return true;
};

/**
 * Update flagged message with error notes
 */
export const updateFlaggedMessageWithError = async (
  tokenId: string,
  userId: string,
  errorMessage: string
) => {
  const { error: updateError } = await supabase
    .from('flagged_messages')
    .update({ 
      status: 'reviewed',
      reviewed_at: new Date().toISOString(),
      reviewed_by: userId,
      notes: errorMessage
    })
    .eq('token_id', tokenId)
    .eq('status', 'pending');
    
  if (updateError) {
    console.error('Error updating flagged message status:', updateError);
  }
  
  return !updateError;
};
