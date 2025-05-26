import { Message } from '@/types';
import { messageService } from '@/services/messageService';
import { useToast } from '@/hooks/use-toast';
import { useState, useEffect } from 'react';
import { FlaggedMessageDetails } from '@/types/mod';
import { FlagDetails } from './mod/FlagDetails';
import { MessageContent } from './mod/MessageContent';
import { FlaggedMessageActions } from './mod/FlaggedMessageActions';
import { FlaggedMessageHeader } from './mod/FlaggedMessageHeader';
import { logEvent } from '@/services/auditLogger';
import { useAuth } from '@/context/AuthContext';

interface FlaggedMessageProps {
  message: Message;
  onAction: () => void;
}

const FlaggedMessage = ({ message, onAction }: FlaggedMessageProps) => {
  const { toast } = useToast();
  const { user } = useAuth();
  const [showContent, setShowContent] = useState(false);
  const [hasLoggedView, setHasLoggedView] = useState(false);
  const [decryptedContent, setDecryptedContent] = useState<string | null>(null);
  const [isDecrypting, setIsDecrypting] = useState(false);
  
  // Log when moderator views a flagged message (only once per component mount)
  useEffect(() => {
    if (!hasLoggedView) {
      logEvent('viewed_message', {
        message_id: message.id,
        token_id: message.tokenId,
        action: 'moderator_viewed_flagged_message',
        moderator_action: true,
        sender_email: message.senderEmail,
        recipient_email: message.recipientEmail
      });
      setHasLoggedView(true);
    }
  }, [message.id, message.tokenId, message.senderEmail, message.recipientEmail, hasLoggedView]);

  // Set the decrypted content directly from the message content
  useEffect(() => {
    console.log('Setting decrypted content from message:', message.content);
    setDecryptedContent(message.content);
  }, [message.content]);
  
  const messageDetails: FlaggedMessageDetails = {
    decryptedContent: decryptedContent,
    senderUsername: 'Anonymous', // Always show as anonymous
    recipientUsername: 'Anonymous', // Always show as anonymous
    flaggedAt: message.flagDetails?.flaggedAt || message.timestamp,
    reason: message.flagDetails?.reason || 'User reported content'
  };
  
  const handleFreezeToken = async () => {
    try {
      const success = await messageService.freezeToken(message.tokenId);
      if (success) {
        toast({
          title: "Token Frozen",
          description: `Token ${message.tokenId} has been frozen and messaging restricted`,
        });
        onAction();
      } else {
        toast({
          title: "Action Failed",
          description: "Could not freeze the token",
          variant: "destructive"
        });
      }
    } catch (error) {
      toast({
        title: "Action Failed",
        description: "Could not freeze the token",
        variant: "destructive"
      });
    }
  };
  
  const handleDismiss = async () => {
    try {
      const success = await messageService.dismissFlag(message.tokenId);
      if (success) {
        toast({
          title: "Flag Dismissed",
          description: "The flag has been dismissed",
        });
        onAction();
      } else {
        toast({
          title: "Action Failed",
          description: "Could not dismiss the flag",
          variant: "destructive"
        });
      }
    } catch (error) {
      toast({
        title: "Action Failed",
        description: "Could not dismiss the flag",
        variant: "destructive"
      });
    }
  };

  const toggleContent = () => setShowContent(!showContent);
  
  return (
    <div className="bg-white rounded-lg p-4 shadow-sm border border-gray-100 mb-4">
      <FlaggedMessageHeader message={message} />
      
      <FlagDetails messageDetails={messageDetails} />
      
      <MessageContent 
        decryptedContent={decryptedContent}
        showContent={showContent}
        toggleContent={toggleContent}
        isDecrypting={isDecrypting}
      />
      
      <FlaggedMessageActions 
        onFreeze={handleFreezeToken}
        onDismiss={handleDismiss}
        viewContentButton={null}
      />
    </div>
  );
};

export default FlaggedMessage;
