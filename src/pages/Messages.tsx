
import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '@/context/AuthContext';
import Header from '@/components/Header';
import MessageList from '@/components/MessageList';
import { Message } from '@/types';
import { messageService } from '@/services/messageService';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

const Messages = () => {
  const { user, session } = useAuth();
  const [messages, setMessages] = useState<Message[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const { toast } = useToast();
  
  // Get the current user's email from the authenticated session
  const currentUserEmail = user?.email || (session?.user?.email || '');

  useEffect(() => {
    // Fetch messages from the database
    const fetchMessages = async () => {
      setIsLoading(true);
      try {
        if (!currentUserEmail) {
          console.log('No user email available, cannot fetch messages');
          setIsLoading(false);
          return;
        }
        
        console.log('Fetching messages with user email:', currentUserEmail);
        const fetchedMessages = await messageService.getMessages(currentUserEmail);
        console.log('Fetched messages:', fetchedMessages);
        setMessages(fetchedMessages);
        
        if (fetchedMessages.length === 0) {
          console.log('No messages found for user:', currentUserEmail);
        }
      } catch (error) {
        console.error('Error fetching messages:', error);
        toast({
          title: "Error",
          description: "Failed to load messages. Please try again.",
          variant: "destructive"
        });
      } finally {
        setIsLoading(false);
      }
    };

    if (currentUserEmail) {
      fetchMessages();
    } else {
      console.log('No user email available, skipping message fetch');
      setIsLoading(false);
    }
    
    // Set up realtime subscription for new messages
    const channel = supabase
      .channel('public:messages')
      .on('postgres_changes', 
        { 
          event: '*', 
          schema: 'public', 
          table: 'messages'
        }, 
        async (payload) => {
          console.log('Message table changed, payload:', payload);
          
          // Check if this message is for the current user
          const changedMsg = payload.new as any;
          if (changedMsg && currentUserEmail && 
              changedMsg.recipient_email === currentUserEmail) {
            console.log('New message received for user:', currentUserEmail);
            const updatedMessages = await messageService.getMessages(currentUserEmail);
            setMessages(updatedMessages);
            
            // If it's a new message, show a toast
            if (payload.eventType === 'INSERT') {
              toast({
                title: "New Message",
                description: "You've received a new message",
              });
            }
          }
        })
      .subscribe((status) => {
        console.log('Supabase realtime subscription status:', status);
      });
      
    return () => {
      // Clean up the subscription
      console.log('Cleaning up Supabase channel subscription');
      supabase.removeChannel(channel);
    };
  }, [currentUserEmail, toast]);

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      <Header 
        title="WhisperChain+" 
        userIdentifier={user?.username ? `@whisper_${user.id.slice(-4)}` : undefined} 
      />

      <div className={`p-4 mb-2 ${user?.role !== 'Moderator' ? 'pb-20' : ''}`}>
        <div className="mb-2">
          <h1 className="text-2xl font-bold">Secure Messages</h1>
          <p className="text-gray-600">Your private message inbox</p>
          {user?.username && (
            <p className="text-xs text-gray-500 mt-1">Showing messages for: {user.username}</p>
          )}
        </div>
        
        {isLoading ? (
          <div className="flex justify-center items-center py-8">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
          </div>
        ) : (
          <MessageList messages={messages} currentUserEmail={currentUserEmail} />
        )}
      </div>

      {/* Only show footer navigation for regular users, not moderators */}
      {user?.role !== 'Moderator' && (
        <footer className="fixed bottom-0 left-0 right-0 border-t border-gray-200 bg-white z-10">
          <div className="flex justify-around py-4">
            <Link 
              to="/send" 
              className="flex flex-col items-center py-2 px-6 text-primary"
            >
              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="h-6 w-6">
                <line x1="22" y1="2" x2="11" y2="13"></line>
                <polygon points="22 2 15 22 11 13 2 9 22 2"></polygon>
              </svg>
              <span className="mt-1 text-xs">Send</span>
            </Link>
            <Link 
              to="/messages" 
              className="flex flex-col items-center py-2 px-6 text-primary"
            >
              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="h-6 w-6">
                <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"></path>
              </svg>
              <span className="mt-1 text-xs">Messages</span>
            </Link>
          </div>
        </footer>
      )}
    </div>
  );
};

export default Messages;
