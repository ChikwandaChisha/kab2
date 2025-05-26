

import { Message } from '@/types';
import { useState } from 'react';
import { DecryptButton } from './DecryptButton';
import { messageService } from '@/services/messageService';
import { useToast } from '@/hooks/use-toast';
import { Flag } from 'lucide-react';

interface MessageItemProps {
  message: Message;
  currentUserEmail?: string;
  userRole?: 'User' | 'Moderator' | 'Admin';
}

const MessageItem = ({ message, currentUserEmail, userRole }: MessageItemProps) => {
  const [decryptedContent, setDecryptedContent] = useState<string | null>(null);
  const { toast } = useToast();

  const handleDecryptSuccess = (content: string) => {
    setDecryptedContent(content);
  };

  const handleDecryptError = (error: string) => {
    toast({
      title: "Decryption Failed",
      description: error,
      variant: "destructive"
    });
  };

  const handleFlag = async () => {
    try {
      const success = await messageService.flagMessage(message.id);
      if (success) {
        toast({
          title: "Message Flagged",
          description: "The message has been flagged for review",
        });
      }
    } catch (error) {
      toast({
        title: "Flag Failed",
        description: "Could not flag this message",
        variant: "destructive"
      });
    }
  };

  const isFromCurrentUser = message.senderEmail === currentUserEmail;
  const showContent = !message.isEncrypted || decryptedContent;
  const displayContent = decryptedContent || message.content;

  return (
    <div className="bg-white rounded-lg p-4 shadow-sm border border-gray-100">
      <div className="flex justify-between items-start mb-3">
        <div className="flex items-center space-x-2">
          <div className={`w-3 h-3 rounded-full ${
            message.isFlagged ? 'bg-red-500' : 'bg-green-500'
          }`}></div>
          {isFromCurrentUser && (
            <>
              <span className="text-sm text-gray-600">
                Token: {message.tokenId}
              </span>
              <span className="text-xs text-gray-500">
                (Sent by you)
              </span>
            </>
          )}
          {!isFromCurrentUser && (
            <span className="text-sm text-gray-600">
              Received message
            </span>
          )}
        </div>
        
        <div className="flex items-center space-x-2">
          {message.priority && (
            <span className={`px-2 py-1 text-xs rounded-full ${
              message.priority === 'High' 
                ? 'bg-red-100 text-red-700' 
                : message.priority === 'Medium' 
                  ? 'bg-yellow-100 text-yellow-700' 
                  : 'bg-blue-100 text-blue-700'
            }`}>
              {message.priority}
            </span>
          )}
          <span className="text-xs text-gray-500">
            {new Date(message.timestamp).toLocaleString()}
          </span>
        </div>
      </div>

      {showContent ? (
        <div className="mb-3">
          <p className="text-gray-800">{displayContent}</p>
        </div>
      ) : (
        <div className="mb-3">
          <p className="text-gray-500 italic">Encrypted message</p>
        </div>
      )}

      <div className="flex justify-between items-center">
        <div className="flex space-x-2">
          {message.isEncrypted && !decryptedContent && (
            <DecryptButton 
              message={message}
              currentUserEmail={currentUserEmail}
              onDecryptSuccess={handleDecryptSuccess}
              onDecryptError={handleDecryptError}
            />
          )}
        </div>
        
        <div className="flex items-center space-x-2">
          {message.isFlagged && (
            <span className="text-xs text-red-600 font-medium">
              Flagged for review
            </span>
          )}
          {userRole !== 'Moderator' && !isFromCurrentUser && !message.isFlagged && (
            <button
              onClick={handleFlag}
              className="flex items-center space-x-1 px-3 py-2 text-sm text-red-600 hover:bg-red-50 rounded transition-colors"
              title="Flag message"
            >
              <Flag size={16} />
              <span>Flag</span>
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

export default MessageItem;

