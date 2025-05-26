
import { logEvent } from '@/services/auditLogger';

/**
 * Log audit events - now using the centralized audit logger
 * @deprecated Use auditLogger.logEvent or auditHelpers instead
 */
export const logAudit = (tokenId: string, action: string) => {
  console.log(`[Deprecated] Audit log: ${action} for token ${tokenId} at ${new Date().toISOString()}`);
  console.log('Please use the new audit logging system: auditLogger.logEvent');
  
  // Route to new system based on action type
  if (action === 'message_sent') {
    // This will be handled by sendMessage service directly
    logEvent('send_message', { token_id: tokenId, action });
  } else if (action === 'message_flagged') {
    // This will be handled by flagOperations service directly
    logEvent('flag_message', { token_id: tokenId, action });
  } else {
    // Generic event logging
    logEvent('viewed_message', { token_id: tokenId, action });
  }
};
