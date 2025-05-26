import { Message } from '@/types';
import { supabase } from '@/integrations/supabase/client';
import { encryptionService } from '../encryptionService';

/**
 * Get messages for a user (only received messages)
 */
export const getMessages = async (userEmail: string): Promise<Message[]> => {
  if (!userEmail) {
    console.warn('No user email provided to getMessages');
    return [];
  }

  try {
    // Check authentication status
    const { data: sessionData } = await supabase.auth.getSession();
    const isAuthenticated = !!sessionData?.session;
    console.log('Authentication status before fetching messages:', isAuthenticated ? 'Authenticated' : 'Not authenticated');

    if (!isAuthenticated) {
      console.warn('User not authenticated when fetching messages');
      return [];
    }

    // Fetch messages where the user is the recipient
    const { data: messages, error } = await supabase
      .from('messages')
      .select('*')
      .eq('recipient_email', userEmail)
      .order('timestamp', { ascending: false });

    if (error) {
      console.error('Error fetching messages:', error);
      return [];
    }

    if (!messages || messages.length === 0) {
      console.log('No messages found for user:', userEmail);
      return [];
    }

    console.log(`Found ${messages.length} messages for user:`, userEmail);

    // Return messages without decrypting them
    const processedMessages = messages.map(message => ({
      id: message.id,
      tokenId: message.token_id,
      content: message.content,
      isEncrypted: message.is_encrypted,
      timestamp: message.timestamp,
      isFlagged: message.is_flagged,
      priority: message.priority as "High" | "Medium" | "Low" | undefined,
      senderEmail: message.sender_email,
      recipientEmail: message.recipient_email
    }));

    return processedMessages;
  } catch (error) {
    console.error('Error in getMessages:', error);
    return [];
  }
};

/**
 * Get all flagged messages (for moderators)
 */
export const getFlaggedMessages = async (): Promise<Message[]> => {
  try {
    // Get flagged messages with their details from the flagged_messages table
    const { data, error } = await supabase
      .from('messages')
      .select(`
        *,
        flagged_messages:flagged_messages(
          id,
          flagged_by,
          reason,
          status,
          flagged_at,
          reviewed_at,
          reviewed_by,
          notes
        )
      `)
      .eq('is_flagged', true)
      .order('timestamp', { ascending: false });
      
    if (error) {
      console.error('Error fetching flagged messages:', error);
      return [];
    }
    
    // Convert from snake_case (database) to camelCase (frontend)
    return (data || []).map(msg => ({
      id: msg.id,
      tokenId: msg.token_id,
      content: msg.content,
      isEncrypted: msg.is_encrypted,
      timestamp: msg.timestamp,
      isFlagged: msg.is_flagged,
      priority: msg.priority as "High" | "Medium" | "Low" | undefined,
      senderEmail: msg.sender_email,
      recipientEmail: msg.recipient_email,
      flagDetails: msg.flagged_messages && msg.flagged_messages.length > 0 ? {
        id: msg.flagged_messages[0].id,
        status: msg.flagged_messages[0].status as 'pending' | 'reviewed' | 'dismissed',
        flaggedAt: msg.flagged_messages[0].flagged_at,
        reason: msg.flagged_messages[0].reason,
        reviewedAt: msg.flagged_messages[0].reviewed_at,
        notes: msg.flagged_messages[0].notes
      } : undefined
    }));
  } catch (error) {
    console.error('Error in getFlaggedMessages:', error);
    return [];
  }
};
