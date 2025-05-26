
import { Card, CardContent } from '@/components/ui/card';

interface MessageContentProps {
  decryptedContent: string | null;
  showContent: boolean;
  toggleContent: () => void;
  isDecrypting?: boolean;
}

export const MessageContent = ({ 
  decryptedContent, 
  showContent, 
  toggleContent,
  isDecrypting = false 
}: MessageContentProps) => {
  return (
    <>
      <div className="mb-4">
        <button 
          className="px-6 py-3 bg-primary text-white rounded-lg hover:bg-primary/90 transition-all duration-200 font-medium shadow-sm hover:shadow-md mb-4 disabled:opacity-50"
          onClick={toggleContent}
          disabled={isDecrypting}
        >
          {isDecrypting ? 'Decrypting...' : showContent ? 'Hide Content' : 'View Content'}
        </button>
        
        {showContent && (
          <Card className="border-l-4 border-l-primary shadow-md">
            <CardContent className="p-6">
              <div className="text-sm font-semibold text-primary mb-3 uppercase tracking-wide">
                Message Content
              </div>
              {isDecrypting ? (
                <div className="bg-blue-50 border border-blue-200 p-4 rounded-lg">
                  <div className="flex items-center space-x-2">
                    <div className="animate-spin h-4 w-4 border-2 border-blue-600 border-t-transparent rounded-full"></div>
                    <p className="text-blue-800 font-medium">Decrypting message content...</p>
                  </div>
                </div>
              ) : decryptedContent ? (
                <div className="bg-gray-50 p-4 rounded-lg">
                  <p className="text-gray-800 leading-relaxed whitespace-pre-wrap">{decryptedContent}</p>
                </div>
              ) : (
                <div className="bg-yellow-50 border border-yellow-200 p-4 rounded-lg">
                  <p className="text-yellow-800 italic font-medium">No decrypted content available - message may require recipient's private key for decryption</p>
                </div>
              )}
            </CardContent>
          </Card>
        )}
      </div>
    </>
  );
};
