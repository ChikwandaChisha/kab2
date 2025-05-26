
import { useState } from 'react';
import { useToast } from '@/hooks/use-toast';
import { encryptionService } from '@/services/encryptionService';
import { Message } from '@/types';

interface DecryptButtonProps {
  message: Message;
  currentUserEmail?: string;
  onDecryptSuccess: (decryptedContent: string) => void;
  onDecryptError: (error: string) => void;
}

export const DecryptButton = ({ 
  message, 
  currentUserEmail, 
  onDecryptSuccess, 
  onDecryptError 
}: DecryptButtonProps) => {
  const [isDecrypting, setIsDecrypting] = useState(false);
  const { toast } = useToast();

  const handleDecrypt = async () => {
    if (!currentUserEmail) {
      toast({
        title: "Authentication Required",
        description: "You need to be logged in to decrypt messages",
        variant: "destructive"
      });
      return;
    }
    
    try {
      setIsDecrypting(true);
      
      // Make sure the message content is available
      if (!message.content) {
        throw new Error("Message content is empty or missing");
      }
      
      console.log(`Attempting to decrypt message with content of length: ${message.content.length}`);
      
      // Decrypt using the current user's private key
      const decryptedContent = encryptionService.decryptMessage(message.content, currentUserEmail);
      
      // Check for error messages returned as strings
      if (typeof decryptedContent === 'string' && decryptedContent.startsWith('Failed to decrypt')) {
        console.error('Decryption returned an error:', decryptedContent);
        onDecryptError(decryptedContent.replace('Failed to decrypt message: ', ''));
        throw new Error(decryptedContent);
      }

      console.log('Message successfully decrypted');
      onDecryptSuccess(decryptedContent);
      
      toast({
        title: "Message Decrypted",
        description: "Message has been successfully decrypted with your private key",
      });
    } catch (error) {
      console.error('Decryption error:', error);
      
      const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
      onDecryptError(errorMessage);
      
      toast({
        title: "Decryption Failed",
        description: errorMessage || "Could not decrypt the message with your private key",
        variant: "destructive"
      });
    } finally {
      setIsDecrypting(false);
    }
  };

  return (
    <button
      onClick={handleDecrypt}
      disabled={isDecrypting}
      className={`flex items-center space-x-1 px-4 py-2 text-sm bg-primary text-white hover:bg-primary-hover rounded transition-colors ${
        isDecrypting ? 'opacity-50 cursor-not-allowed' : ''
      }`}
    >
      {isDecrypting ? (
        <>
          <svg className="animate-spin h-4 w-4" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
          </svg>
          <span>Opening...</span>
        </>
      ) : (
        <>
          <svg className="h-4 w-4" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <rect x="3" y="11" width="18" height="11" rx="2" ry="2"></rect>
            <path d="M7 11V7a5 5 0 0 1 10 0v4"></path>
          </svg>
          <span>Open</span>
        </>
      )}
    </button>
  );
};
