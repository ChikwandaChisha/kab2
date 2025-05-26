
export type Role = 'User' | 'Moderator' | 'Admin';

export type User = {
  id: string;
  username: string;
  role: Role;
  isActive: boolean;
  createdAt: string;
  email?: string; // Added email property to User type
};

export type FlagDetails = {
  id: string;
  status: 'pending' | 'reviewed' | 'dismissed';
  flaggedAt: string;
  reason?: string;
  reviewedAt?: string;
  notes?: string;
};

export type Message = {
  id: string;
  tokenId: string;
  content: string;
  isEncrypted: boolean;
  timestamp: string;
  isFlagged: boolean;
  priority?: 'High' | 'Medium' | 'Low';
  senderEmail?: string; // Sender email to identify message source
  recipientEmail?: string; // Add recipient email to route message correctly
  flagDetails?: FlagDetails; // Add flag details to the message type
};

export type Token = {
  id: string;
  userId: string;
  isActive: boolean;
  createdAt: string;
};

export type AuditLog = {
  id: string;
  tokenId?: string;
  action: 'token_issued' | 'message_sent' | 'message_flagged' | 'token_frozen' | 'user_banned';
  timestamp: string;
  details?: string;
};
