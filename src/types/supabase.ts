export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export interface Database {
  public: {
    Tables: {
      users: {
        Row: {
          id: string
          email: string
          public_key: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id: string
          email: string
          public_key?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          email?: string
          public_key?: string | null
          created_at?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "users_id_fkey"
            columns: ["id"]
            referencedRelation: "users"
            referencedColumns: ["id"]
          }
        ]
      }
      messages: {
        Row: {
          id: string
          token_id: string
          content: string
          is_encrypted: boolean
          timestamp: string
          is_flagged: boolean
          priority: string | null
          sender_email: string
          recipient_email: string
        }
        Insert: {
          id?: string
          token_id: string
          content: string
          is_encrypted: boolean
          timestamp?: string
          is_flagged?: boolean
          priority?: string | null
          sender_email: string
          recipient_email: string
        }
        Update: {
          id?: string
          token_id?: string
          content?: string
          is_encrypted?: boolean
          timestamp?: string
          is_flagged?: boolean
          priority?: string | null
          sender_email?: string
          recipient_email?: string
        }
        Relationships: []
      }
      flagged_messages: {
        Row: {
          id: string
          message_id: string
          flagged_by: string
          flagged_at: string
          reason: string
          notes: string | null
          status: string
          reviewed_by: string | null
          reviewed_at: string | null
        }
        Insert: {
          id?: string
          message_id: string
          flagged_by: string
          flagged_at?: string
          reason: string
          notes?: string | null
          status?: string
          reviewed_by?: string | null
          reviewed_at?: string | null
        }
        Update: {
          id?: string
          message_id?: string
          flagged_by?: string
          flagged_at?: string
          reason?: string
          notes?: string | null
          status?: string
          reviewed_by?: string | null
          reviewed_at?: string | null
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      insert_message: {
        Args: {
          p_token_id: string
          p_content: string
          p_is_encrypted: boolean
          p_sender_email: string
          p_recipient_email: string
        }
        Returns: string
      }
    }
    Enums: {
      [_ in never]: never
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
} 