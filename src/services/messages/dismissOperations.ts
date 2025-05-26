
import { supabase } from '@/integrations/supabase/client';
import { logEvent } from '@/services/auditLogger';

/**
 * Dismiss flag on a message (for moderators)
 */
export const dismissFlag = async (tokenId: string): Promise<boolean> => {
  try {
    console.log('Dismissing flag for token:', tokenId);
    
    // Get current user session
    const { data: { session } } = await supabase.auth.getSession();
    if (!session) {
      console.error('No authenticated session');
      return false;
    }
    
    // Get the flagged message details before dismissing
    const { data: flaggedMessage, error: flaggedError } = await supabase
      .from('flagged_messages')
      .select('*')
      .eq('token_id', tokenId)
      .eq('status', 'pending')
      .single();
      
    if (flaggedError || !flaggedMessage) {
      console.error('Error finding flagged message:', flaggedError);
      return false;
    }
    
    // Update the flagged_messages entry using token_id
    const { error: flagError } = await supabase
      .from('flagged_messages')
      .update({ 
        status: 'dismissed',
        reviewed_at: new Date().toISOString(),
        reviewed_by: session.user.id,
        notes: 'Flag dismissed by moderator'
      })
      .eq('token_id', tokenId)
      .eq('status', 'pending');
      
    if (flagError) {
      console.error('Error updating flagged_messages entry:', flagError);
      return false;
    }
    
    // Also update the message to remove the flagged status
    const { error: messageError } = await supabase
      .from('messages')
      .update({ 
        is_flagged: false,
        priority: null
      })
      .eq('token_id', tokenId);
      
    if (messageError) {
      console.error('Error updating message flag status:', messageError);
      // Continue despite error since the main dismissal was successful
    }
    
    // Log moderator action for dismissing flagged message
    await logEvent('flag_message', {
      user_id: session.user.id,
      token_id: tokenId,
      message_id: flaggedMessage.message_id,
      action: 'moderator_dismissed_flagged_message',
      moderator_action: true,
      decision: 'dismissed',
      reason: flaggedMessage.reason || 'No reason provided'
    });
    
    console.log(`Flag dismissed for token ${tokenId}`);
    return true;
  } catch (error) {
    console.error('Error in dismissFlag operation:', error);
    return false;
  }
};
