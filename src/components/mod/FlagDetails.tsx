
import { FlaggedMessageDetails } from '@/types/mod';

interface FlagDetailsProps {
  messageDetails: FlaggedMessageDetails | null;
}

export const FlagDetails = ({ messageDetails }: FlagDetailsProps) => {
  if (!messageDetails) return null;
  
  return (
    <div className="mb-3 space-y-2">
      <div className="flex items-center text-gray-500 text-sm">
        <svg className="h-4 w-4 mr-1" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <circle cx="12" cy="12" r="10"></circle>
          <polyline points="12 6 12 12 16 14"></polyline>
        </svg>
        Flagged: {new Date(messageDetails.flaggedAt).toLocaleString()}
      </div>
      <div className="text-gray-500 text-sm">
        Reason: {messageDetails.reason}
      </div>
    </div>
  );
};
