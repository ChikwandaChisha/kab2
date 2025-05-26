
import { Message } from '@/types';
import FlaggedMessage from '@/components/FlaggedMessage';

interface FlaggedMessagesListProps {
  messages: Message[];
  isLoading: boolean;
  onAction: () => void;
}

export const FlaggedMessagesList = ({ messages, isLoading, onAction }: FlaggedMessagesListProps) => {
  if (isLoading) {
    return (
      <div className="flex justify-center items-center py-8">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (messages.length === 0) {
    return (
      <div className="text-center py-8 bg-white rounded-lg shadow-sm">
        <p className="text-gray-500">No flagged messages to review</p>
      </div>
    );
  }

  return (
    <>
      {messages.map(message => (
        <FlaggedMessage 
          key={message.id} 
          message={message} 
          onAction={onAction}
        />
      ))}
    </>
  );
};
