
import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Header from '@/components/Header';
import { useAuth } from '@/context/AuthContext';
import { messageService } from '@/services/messageService';
import { useToast } from '@/hooks/use-toast';
import { Input } from '@/components/ui/input';
import { Send } from 'lucide-react'; 
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import { supabase } from '@/integrations/supabase/client';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";

const SendMessage = () => {
  const { user } = useAuth();
  const [recipientEmail, setRecipientEmail] = useState('');
  const [message, setMessage] = useState('');
  const [charCount, setCharCount] = useState(0);
  const [isSending, setIsSending] = useState(false);
  const [userSession, setUserSession] = useState(null);
  const [showBlockedDialog, setShowBlockedDialog] = useState(false);
  const navigate = useNavigate();
  const { toast } = useToast();
  
  // Get the current user's email
  const currentUserEmail = user?.email || 'anonymous@example.com';
  
  // Fetch the current session to verify authentication
  useEffect(() => {
    const checkSession = async () => {
      const { data, error } = await supabase.auth.getSession();
      if (data?.session) {
        console.log("Active session found:", data.session.user.id);
        setUserSession(data.session);
      } else {
        console.log("No active session found:", error);
      }
    };
    
    checkSession();
  }, []);
  
  const handleMessageChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const text = e.target.value;
    if (text.length <= 200) { // Character limit of 200
      setMessage(text);
      setCharCount(text.length);
    }
  };
  
  const handleSendMessage = async () => {
    if (!recipientEmail) {
      toast({
        title: "Recipient Email Required",
        description: "Please enter the recipient's email address",
        variant: "destructive"
      });
      return;
    }
    
    if (!message.trim()) {
      toast({
        title: "Empty Message",
        description: "Please enter a message to send",
        variant: "destructive"
      });
      return;
    }
    
    setIsSending(true);
    
    try {
      // Log authentication details for debugging
      const { data: sessionData } = await supabase.auth.getSession();
      console.log('Current session status:', sessionData?.session ? 'Authenticated' : 'Not authenticated');
      console.log('Sending message from:', currentUserEmail, 'to:', recipientEmail);
      
      const result = await messageService.sendMessage(message, recipientEmail, currentUserEmail);
      
      console.log('Message sent successfully, response:', result);
      
      toast({
        title: "Message Sent",
        description: "Your encrypted message has been sent successfully",
      });
      
      // Clear fields after successful send
      setMessage('');
      setCharCount(0);
      setRecipientEmail('');
      
      // Navigate after a small delay to ensure toast is visible
      setTimeout(() => navigate('/messages'), 1000);
    } catch (error) {
      console.error('Error sending message:', error);
      
      let errorMessage = "Could not send your message";
      if (error instanceof Error) {
        errorMessage = error.message;
        console.error('Error details:', error);
        
        // Check if the error is about messaging restrictions
        if (errorMessage.includes('not allowed to send messages to this recipient due to previous violations')) {
          setShowBlockedDialog(true);
          setIsSending(false);
          return;
        }
      }
      
      toast({
        title: "Send Failed",
        description: errorMessage,
        variant: "destructive"
      });
    } finally {
      setIsSending(false);
    }
  };
  
  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      <Header 
        title="WhisperChain+" 
        userIdentifier={user?.username ? `Token Available` : undefined}
      />
      
      <div className="p-4 flex-grow">
        <div className="bg-white rounded-lg shadow-sm p-6 max-w-2xl mx-auto">
          <h1 className="text-2xl font-bold mb-6">Send Secure Message</h1>
          
          {!userSession && (
            <div className="bg-yellow-50 border border-yellow-200 rounded p-4 mb-4">
              <p className="text-yellow-700">
                You are sending a message without being properly authenticated. Your message may be rejected.
              </p>
            </div>
          )}
          
          <div className="mb-4">
            <label className="block text-gray-700 mb-2">Recipient Email</label>
            <Input
              type="email"
              placeholder="Enter recipient's email address"
              value={recipientEmail}
              onChange={(e) => setRecipientEmail(e.target.value)}
              className="w-full"
              required
            />
          </div>
          
          <div className="mb-6">
            <label className="block text-gray-700 mb-2">Your Message</label>
            <div className="relative">
              <Textarea
                className="w-full px-4 py-2 border border-gray-300 rounded-md resize-none focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary"
                placeholder="Type your anonymous message here..."
                rows={6}
                value={message}
                onChange={handleMessageChange}
                required
              />
              <div className="absolute bottom-2 right-2 text-gray-500 text-sm">
                {charCount}/200
              </div>
            </div>
          </div>
          
          <div className="bg-gray-50 p-4 rounded-md mb-6 flex items-start">
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="h-5 w-5 text-green-500 mr-2 mt-0.5">
              <rect x="3" y="11" width="18" height="11" rx="2" ry="2"></rect>
              <path d="M7 11V7a5 5 0 0 1 10 0v4"></path>
            </svg>
            <span className="text-gray-600 text-sm">
              End-to-end encrypted with recipient's public key
            </span>
          </div>
          
          <Button
            className={`w-full py-3 ${isSending ? 'opacity-70 cursor-not-allowed' : ''}`}
            onClick={handleSendMessage}
            disabled={isSending}
          >
            <Send className="h-5 w-5 mr-2" />
            {isSending ? 'Sending...' : 'Send Secure Message'}
          </Button>
        </div>
        
        <div className="mt-8 mx-auto max-w-2xl text-center text-gray-600 flex items-center justify-center">
          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="h-4 w-4 mr-2">
            <path d="M19 21v-2a4 4 0 0 0-4-4H9a4 4 0 0 0-4 4v2"></path>
            <path d="M16 3.13a4 4 0 0 1 0 7.75"></path>
            <circle cx="12" cy="9" r="4"></circle>
          </svg>
          Your identity remains anonymous
        </div>
      </div>
      
      {/* Only show footer navigation for regular users, not moderators */}
      {user?.role !== 'Moderator' && (
        <footer className="mt-auto border-t border-gray-200 bg-white">
          <div className="flex justify-around py-4">
            <div className="flex flex-col items-center py-2 px-6 text-primary">
              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="h-6 w-6">
                <line x1="22" y1="2" x2="11" y2="13"></line>
                <polygon points="22 2 15 22 11 13 2 9 22 2"></polygon>
              </svg>
              <span className="mt-1 text-xs">Send</span>
            </div>
            <div 
              onClick={() => navigate('/messages')}
              className="flex flex-col items-center py-2 px-6 text-gray-500 cursor-pointer"
            >
              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="h-6 w-6">
                <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"></path>
              </svg>
              <span className="mt-1 text-xs">Messages</span>
            </div>
          </div>
        </footer>
      )}

      {/* Blocked User Dialog */}
      <AlertDialog open={showBlockedDialog} onOpenChange={setShowBlockedDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle className="text-red-600">This user blocked you</AlertDialogTitle>
            <AlertDialogDescription>
              You cannot send messages to this recipient. This restriction was put in place due to previous content violations.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogAction onClick={() => setShowBlockedDialog(false)}>
            OK
          </AlertDialogAction>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
};

export default SendMessage;
