
import { useState, useEffect } from 'react';
import { Message } from '@/types';
import { supabase } from '@/integrations/supabase/client';

export const useFlaggedMessages = () => {
  const [flaggedMessages, setFlaggedMessages] = useState<Message[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  const fetchFlaggedMessages = async () => {
    setIsLoading(true);
    try {
      console.log('Fetching flagged messages...');
      
      // Get pending flagged messages with their corresponding message data
      const { data: flaggedData, error: flaggedError } = await supabase
        .from('flagged_messages')
        .select(`
          id,
          message_id,
          status,
          flagged_at,
          reason,
          decrypted_content,
          token_id
        `)
        .eq('status', 'pending')
        .order('flagged_at', { ascending: false });
      
      if (flaggedError) {
        console.error('Error fetching flagged message entries:', flaggedError);
        setFlaggedMessages([]);
        return;
      }
      
      console.log('Found flagged messages entries:', flaggedData);
      
      if (!flaggedData || flaggedData.length === 0) {
        console.log('No pending flagged message entries found');
        setFlaggedMessages([]);
        return;
      }
      
      // Get the actual message data for each flagged message
      const messageIds = flaggedData.map(entry => entry.message_id);
      const { data: messagesData, error: messagesError } = await supabase
        .from('messages')
        .select('*')
        .in('id', messageIds);
      
      if (messagesError) {
        console.error('Error fetching message data:', messagesError);
        setFlaggedMessages([]);
        return;
      }
      
      console.log('Found message data:', messagesData);
      
      // Combine flagged message data with actual message data
      const messages: Message[] = flaggedData.map((flagEntry) => {
        const messageData = messagesData?.find(msg => msg.id === flagEntry.message_id);
        
        // Use decrypted_content from flagged_messages if available, otherwise use message content
        const content = flagEntry.decrypted_content || messageData?.content || 'No content available';
        
        console.log(`Message ${flagEntry.message_id}: using content="${content.substring(0, 50)}..."`);
        
        return {
          id: flagEntry.message_id,
          tokenId: flagEntry.token_id || messageData?.token_id || 'unknown',
          content: content,
          isEncrypted: messageData?.is_encrypted || false,
          timestamp: messageData?.timestamp || flagEntry.flagged_at,
          isFlagged: true,
          priority: messageData?.priority as 'High' | 'Medium' | 'Low' | undefined || 'Medium',
          senderEmail: messageData?.sender_email,
          recipientEmail: messageData?.recipient_email,
          flagDetails: {
            id: flagEntry.id,
            status: flagEntry.status as 'pending' | 'reviewed' | 'dismissed',
            flaggedAt: flagEntry.flagged_at,
            reason: flagEntry.reason || 'User reported content'
          }
        };
      });
      
      console.log('Final converted flagged messages:', messages);
      setFlaggedMessages(messages);
    } catch (error) {
      console.error('Error in fetchFlaggedMessages:', error);
      setFlaggedMessages([]);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchFlaggedMessages();
  }, []);

  const refreshFlaggedMessages = () => {
    console.log('Refreshing flagged messages...');
    fetchFlaggedMessages();
  };

  return {
    flaggedMessages,
    isLoading,
    refreshFlaggedMessages
  };
};
