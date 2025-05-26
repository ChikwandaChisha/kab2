
// Export all message-related services from this central file
import { sendMessage } from './messages/sendMessage';
import { getMessages, getFlaggedMessages } from './messages/retrieveMessages';
import { flagMessage, dismissFlag, decryptMessage, updateDecryptedContent } from './messages/messageActions';
import { freezeToken } from './messages/freezeTokenOperations';
import { logAudit } from './messages/auditService';

// Re-export all functions as a single service object
export const messageService = {
  sendMessage,
  getMessages,
  flagMessage,
  decryptMessage,
  updateDecryptedContent,
  logAudit,
  getFlaggedMessages,
  freezeToken,
  dismissFlag
};
