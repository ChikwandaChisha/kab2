
import { Message } from '@/types';
import MessageItem from './message/MessageItem';

interface MessageListProps {
  messages: Message[];
  currentUserEmail?: string;
  userRole?: 'User' | 'Moderator' | 'Admin';
}

const MessageList = ({ messages, currentUserEmail, userRole }: MessageListProps) => {
  const canViewMessage = (message: Message): boolean => {
    // Admins can only see flagged messages
    if (userRole === 'Admin' && !message.isFlagged) {
      return false;
    }
    
    // Moderators can see all messages
    if (userRole === 'Moderator') {
      return true;
    }
    
    // Regular users can see their own messages and unflagged messages
    return message.senderEmail === currentUserEmail || !message.isFlagged;
  };

  return (
    <div className="flex flex-col space-y-4">
      {messages.length === 0 ? (
        <div className="text-center py-8 text-gray-500">
          No messages available
        </div>
      ) : (
        messages
          .filter(canViewMessage)
          .map((message) => (
            <MessageItem 
              key={message.id}
              message={message}
              currentUserEmail={currentUserEmail}
              userRole={userRole}
            />
          ))
      )}
    </div>
  );
};

export default MessageList;
