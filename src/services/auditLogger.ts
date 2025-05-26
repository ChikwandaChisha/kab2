
import { supabase } from '@/integrations/supabase/client';

export type AuditEventType = 
  | 'signup'
  | 'login'
  | 'logout'
  | 'send_message'
  | 'decrypted_message'
  | 'flag_message'
  | 'viewed_message';

export interface AuditMetadata {
  user_id?: string;
  message_id?: string;
  recipient_id?: string;
  sender_id?: string;
  reason?: string;
  recipient_email?: string;
  sender_email?: string;
  token_id?: string;
  ip_address?: string;
  user_agent?: string;
  [key: string]: any;
}

/**
 * Universal audit logging function that automatically adds timestamp
 * and routes to the correct destination with tamper-resistant features
 */
export const logEvent = async (
  eventType: AuditEventType,
  metadata: AuditMetadata = {}
): Promise<string | null> => {
  try {
    console.log(`[Audit] Attempting to log event: ${eventType}`, metadata);
    
    // Get current session for user context
    const { data: { session }, error: sessionError } = await supabase.auth.getSession();
    
    if (sessionError) {
      console.error('[Audit] Session error:', sessionError);
    }
    
    const currentUserId = session?.user?.id || null;
    console.log('[Audit] Current user ID:', currentUserId);
    
    // Enhance metadata with session context if available
    const enhancedMetadata = {
      ...metadata,
      timestamp: new Date().toISOString(),
      session_user_id: currentUserId,
    };
    
    console.log('[Audit] Enhanced metadata:', enhancedMetadata);
    
    // Call the database function with proper typing
    const { data: logId, error } = await supabase.rpc('log_audit_event_v2', {
      p_event_type: eventType as any, // Cast to any to match the enum type
      p_user_id: metadata.user_id || currentUserId,
      p_message_id: metadata.message_id || null,
      p_recipient_id: metadata.recipient_id || metadata.recipient_email || null,
      p_sender_id: metadata.sender_id || currentUserId,
      p_metadata: enhancedMetadata
    });
    
    if (error) {
      console.error('[Audit] Database function error:', error);
      return null;
    }
    
    console.log(`[Audit] Successfully logged event ${eventType} with ID:`, logId);
    return logId;
  } catch (error) {
    console.error('[Audit] Unexpected error logging event:', error);
    return null;
  }
};

/**
 * Verify the integrity of an audit log entry
 */
export const verifyLogIntegrity = async (logId: string): Promise<any> => {
  try {
    const { data, error } = await supabase.rpc('verify_audit_log_integrity_v2', {
      p_log_id: logId
    });
    
    if (error) {
      console.error('[Audit] Failed to verify log integrity:', error);
      return null;
    }
    
    return data;
  } catch (error) {
    console.error('[Audit] Error verifying log integrity:', error);
    return null;
  }
};

/**
 * Retrieve audit logs by category
 */
export const getAuditLogs = async (
  category?: 'auth' | 'message' | 'moderation' | 'all',
  limit: number = 50
): Promise<any[]> => {
  try {
    let query;
    
    switch (category) {
      case 'auth':
        query = supabase.from('auth_logs').select('*');
        break;
      case 'message':
        query = supabase.from('message_logs').select('*');
        break;
      case 'moderation':
        query = supabase.from('moderation_logs').select('*');
        break;
      default:
        query = supabase.from('audit_logs').select('*');
    }
    
    const { data, error } = await query
      .order('timestamp', { ascending: false })
      .limit(limit);
    
    if (error) {
      console.error('[Audit] Failed to retrieve audit logs:', error);
      return [];
    }
    
    return data || [];
  } catch (error) {
    console.error('[Audit] Error retrieving audit logs:', error);
    return [];
  }
};

/**
 * Helper functions for specific event types
 */
export const auditHelpers = {
  logSignup: (userEmail: string, userId: string) => 
    logEvent('signup', { 
      user_id: userId, 
      recipient_id: userEmail,
      action: 'user_registered'
    }),
    
  logLogin: (userEmail: string, userId: string) => 
    logEvent('login', { 
      user_id: userId, 
      recipient_id: userEmail,
      action: 'user_authenticated'
    }),
    
  logLogout: (userEmail: string, userId: string) => 
    logEvent('logout', { 
      user_id: userId, 
      recipient_id: userEmail,
      action: 'user_signed_out'
    }),
    
  logMessageSent: (messageId: string, senderId: string, recipientEmail: string, tokenId: string) => 
    logEvent('send_message', { 
      message_id: messageId,
      sender_id: senderId,
      recipient_id: recipientEmail,
      token_id: tokenId,
      action: 'message_sent'
    }),
    
  logMessageViewed: (messageId: string, userId: string, tokenId: string) => 
    logEvent('viewed_message', { 
      message_id: messageId,
      user_id: userId,
      token_id: tokenId,
      action: 'message_opened'
    }),
    
  logMessageDecrypted: (messageId: string, userId: string, tokenId: string, isModerator = false) => 
    logEvent('decrypted_message', { 
      message_id: messageId,
      user_id: userId,
      token_id: tokenId,
      action: isModerator ? 'moderator_decryption' : 'user_decryption',
      moderator_action: isModerator
    }),
    
  logMessageFlagged: (messageId: string, flaggedBy: string, reason: string, tokenId: string) => 
    logEvent('flag_message', { 
      message_id: messageId,
      user_id: flaggedBy,
      token_id: tokenId,
      reason: reason,
      action: 'message_flagged'
    })
};
