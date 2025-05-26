
export interface FlaggedMessageDetails {
  decryptedContent: string | null;
  senderUsername: string | null;
  recipientUsername: string | null;
  flaggedAt: string;
  reason: string | null;
}
