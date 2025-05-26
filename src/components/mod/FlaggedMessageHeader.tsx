
import { Message } from '@/types';

interface FlaggedMessageHeaderProps {
  message: Message;
}

export const FlaggedMessageHeader = ({ message }: FlaggedMessageHeaderProps) => {
  return (
    <div className="flex justify-between items-start mb-3">
      <div className="flex items-center">
        <svg className="h-5 w-5 text-red-600 mr-2" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M4 15s1-1 4-1 5 2 8 2 4-1 4-1V3s-1 1-4 1-5-2-8-2-4 1-4 1z"></path>
          <line x1="4" y1="22" x2="4" y2="15"></line>
        </svg>
        <span className="text-gray-600 font-medium">Token ID: {message.tokenId}</span>
      </div>
      
      <div className={`px-3 py-1 text-sm rounded-full ${
        message.priority === 'High' 
          ? 'bg-red-100 text-red-700' 
          : message.priority === 'Medium' 
            ? 'bg-yellow-100 text-yellow-700' 
            : 'bg-blue-100 text-blue-700'
      }`}>
        {message.priority} Priority
      </div>
    </div>
  );
};
