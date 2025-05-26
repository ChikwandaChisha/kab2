
import { supabase } from '@/integrations/supabase/client';

/**
 * Create a messaging restriction between sender and recipient
 */
export const createMessagingRestriction = async (
  senderEmail: string,
  recipientEmail: string,
  tokenId: string,
  userId: string
) => {
  console.log(`Creating messaging restriction: ${senderEmail} -> ${recipientEmail}`);
  
  const { error: restrictionError, data: restrictionData } = await supabase
    .from('messaging_restrictions')
    .insert({
      sender_email: senderEmail,
      recipient_email: recipientEmail,
      reason: `Token ${tokenId} frozen by moderator`,
      restricted_by: userId
    })
    .select();
    
  if (restrictionError) {
    console.error('Error creating messaging restriction:', restrictionError);
    return { success: false, error: restrictionError, data: null };
  }
  
  console.log(`Messaging restriction created successfully:`, restrictionData);
  return { success: true, error: null, data: restrictionData };
};
