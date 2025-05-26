export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  public: {
    Tables: {
      audit_logs: {
        Row: {
          created_at: string
          event_type: Database["public"]["Enums"]["audit_event_type"]
          id: string
          message_id: string | null
          metadata: Json | null
          recipient_id: string | null
          sender_token_id: string | null
          signature: string
          timestamp: string
        }
        Insert: {
          created_at?: string
          event_type?: Database["public"]["Enums"]["audit_event_type"]
          id?: string
          message_id?: string | null
          metadata?: Json | null
          recipient_id?: string | null
          sender_token_id?: string | null
          signature: string
          timestamp?: string
        }
        Update: {
          created_at?: string
          event_type?: Database["public"]["Enums"]["audit_event_type"]
          id?: string
          message_id?: string | null
          metadata?: Json | null
          recipient_id?: string | null
          sender_token_id?: string | null
          signature?: string
          timestamp?: string
        }
        Relationships: []
      }
      flagged_messages: {
        Row: {
          decrypted_content: string | null
          flagged_at: string
          flagged_by: string | null
          id: string
          message_id: string
          notes: string | null
          reason: string | null
          reviewed_at: string | null
          reviewed_by: string | null
          status: string
          token_id: string | null
        }
        Insert: {
          decrypted_content?: string | null
          flagged_at?: string
          flagged_by?: string | null
          id?: string
          message_id: string
          notes?: string | null
          reason?: string | null
          reviewed_at?: string | null
          reviewed_by?: string | null
          status?: string
          token_id?: string | null
        }
        Update: {
          decrypted_content?: string | null
          flagged_at?: string
          flagged_by?: string | null
          id?: string
          message_id?: string
          notes?: string | null
          reason?: string | null
          reviewed_at?: string | null
          reviewed_by?: string | null
          status?: string
          token_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "flagged_messages_message_id_fkey"
            columns: ["message_id"]
            isOneToOne: false
            referencedRelation: "messages"
            referencedColumns: ["id"]
          },
        ]
      }
      messages: {
        Row: {
          content: string
          id: string
          is_encrypted: boolean
          is_flagged: boolean
          priority: string | null
          recipient_email: string
          sender_email: string | null
          timestamp: string
          token_id: string
        }
        Insert: {
          content: string
          id?: string
          is_encrypted?: boolean
          is_flagged?: boolean
          priority?: string | null
          recipient_email: string
          sender_email?: string | null
          timestamp?: string
          token_id: string
        }
        Update: {
          content?: string
          id?: string
          is_encrypted?: boolean
          is_flagged?: boolean
          priority?: string | null
          recipient_email?: string
          sender_email?: string | null
          timestamp?: string
          token_id?: string
        }
        Relationships: []
      }
      messaging_restrictions: {
        Row: {
          created_at: string
          id: string
          reason: string
          recipient_email: string
          restricted_by: string
          sender_email: string
        }
        Insert: {
          created_at?: string
          id?: string
          reason: string
          recipient_email: string
          restricted_by: string
          sender_email: string
        }
        Update: {
          created_at?: string
          id?: string
          reason?: string
          recipient_email?: string
          restricted_by?: string
          sender_email?: string
        }
        Relationships: []
      }
      profiles: {
        Row: {
          created_at: string
          email: string | null
          id: string
          is_active: boolean
          public_key: string | null
          role: Database["public"]["Enums"]["app_role"]
          username: string
        }
        Insert: {
          created_at?: string
          email?: string | null
          id: string
          is_active?: boolean
          public_key?: string | null
          role?: Database["public"]["Enums"]["app_role"]
          username: string
        }
        Update: {
          created_at?: string
          email?: string | null
          id?: string
          is_active?: boolean
          public_key?: string | null
          role?: Database["public"]["Enums"]["app_role"]
          username?: string
        }
        Relationships: []
      }
      sender_flag_counts: {
        Row: {
          approved_flag_count: number
          created_at: string
          id: string
          sender_email: string
          updated_at: string
        }
        Insert: {
          approved_flag_count?: number
          created_at?: string
          id?: string
          sender_email: string
          updated_at?: string
        }
        Update: {
          approved_flag_count?: number
          created_at?: string
          id?: string
          sender_email?: string
          updated_at?: string
        }
        Relationships: []
      }
      user_bans: {
        Row: {
          banned_at: string
          banned_by: string
          expires_at: string | null
          id: string
          is_permanent: boolean
          reason: string
          user_id: string
        }
        Insert: {
          banned_at?: string
          banned_by: string
          expires_at?: string | null
          id?: string
          is_permanent?: boolean
          reason: string
          user_id: string
        }
        Update: {
          banned_at?: string
          banned_by?: string
          expires_at?: string | null
          id?: string
          is_permanent?: boolean
          reason?: string
          user_id?: string
        }
        Relationships: []
      }
    }
    Views: {
      auth_logs: {
        Row: {
          created_at: string | null
          event_type: Database["public"]["Enums"]["audit_event_type"] | null
          id: string | null
          message_id: string | null
          metadata: Json | null
          recipient_id: string | null
          sender_token_id: string | null
          signature: string | null
          timestamp: string | null
        }
        Insert: {
          created_at?: string | null
          event_type?: Database["public"]["Enums"]["audit_event_type"] | null
          id?: string | null
          message_id?: string | null
          metadata?: Json | null
          recipient_id?: string | null
          sender_token_id?: string | null
          signature?: string | null
          timestamp?: string | null
        }
        Update: {
          created_at?: string | null
          event_type?: Database["public"]["Enums"]["audit_event_type"] | null
          id?: string | null
          message_id?: string | null
          metadata?: Json | null
          recipient_id?: string | null
          sender_token_id?: string | null
          signature?: string | null
          timestamp?: string | null
        }
        Relationships: []
      }
      message_logs: {
        Row: {
          created_at: string | null
          event_type: Database["public"]["Enums"]["audit_event_type"] | null
          id: string | null
          message_id: string | null
          metadata: Json | null
          recipient_id: string | null
          sender_token_id: string | null
          signature: string | null
          timestamp: string | null
        }
        Insert: {
          created_at?: string | null
          event_type?: Database["public"]["Enums"]["audit_event_type"] | null
          id?: string | null
          message_id?: string | null
          metadata?: Json | null
          recipient_id?: string | null
          sender_token_id?: string | null
          signature?: string | null
          timestamp?: string | null
        }
        Update: {
          created_at?: string | null
          event_type?: Database["public"]["Enums"]["audit_event_type"] | null
          id?: string | null
          message_id?: string | null
          metadata?: Json | null
          recipient_id?: string | null
          sender_token_id?: string | null
          signature?: string | null
          timestamp?: string | null
        }
        Relationships: []
      }
      moderation_logs: {
        Row: {
          created_at: string | null
          event_type: Database["public"]["Enums"]["audit_event_type"] | null
          id: string | null
          message_id: string | null
          metadata: Json | null
          recipient_id: string | null
          sender_token_id: string | null
          signature: string | null
          timestamp: string | null
        }
        Insert: {
          created_at?: string | null
          event_type?: Database["public"]["Enums"]["audit_event_type"] | null
          id?: string | null
          message_id?: string | null
          metadata?: Json | null
          recipient_id?: string | null
          sender_token_id?: string | null
          signature?: string | null
          timestamp?: string | null
        }
        Update: {
          created_at?: string | null
          event_type?: Database["public"]["Enums"]["audit_event_type"] | null
          id?: string | null
          message_id?: string | null
          metadata?: Json | null
          recipient_id?: string | null
          sender_token_id?: string | null
          signature?: string | null
          timestamp?: string | null
        }
        Relationships: []
      }
    }
    Functions: {
      create_initial_admin: {
        Args: { admin_email: string; admin_password: string }
        Returns: string
      }
      demote_from_admin: {
        Args: { target_email: string; by_admin_id: string }
        Returns: boolean
      }
      demote_moderator: {
        Args: { user_email: string }
        Returns: boolean
      }
      generate_audit_signature: {
        Args: {
          p_timestamp: string
          p_event_type: string
          p_sender_token_id: string
          p_recipient_id: string
          p_message_id: string
          p_metadata: Json
        }
        Returns: string
      }
      get_profile_by_id: {
        Args: { user_id: string }
        Returns: {
          id: string
          username: string
          role: string
          is_active: boolean
          created_at: string
          email: string
        }[]
      }
      get_user_public_key: {
        Args: { p_email: string }
        Returns: string
      }
      get_user_role: {
        Args: { user_id: string }
        Returns: string
      }
      get_user_role_by_email: {
        Args: { user_email: string }
        Returns: Database["public"]["Enums"]["app_role"]
      }
      has_role: {
        Args: {
          user_id: string
          required_role: Database["public"]["Enums"]["app_role"]
        }
        Returns: boolean
      }
      increment_sender_flag_count: {
        Args: { sender_email: string }
        Returns: number
      }
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
      is_admin: {
        Args: { user_id: string }
        Returns: boolean
      }
      is_messaging_restricted: {
        Args: { sender_email: string; recipient_email: string }
        Returns: boolean
      }
      is_user_banned: {
        Args: { user_email: string }
        Returns: boolean
      }
      log_audit_event: {
        Args: {
          p_event_type: string
          p_sender_token_id?: string
          p_recipient_id?: string
          p_message_id?: string
          p_metadata?: Json
        }
        Returns: string
      }
      log_audit_event_v2: {
        Args: {
          p_event_type: Database["public"]["Enums"]["audit_event_type"]
          p_user_id?: string
          p_message_id?: string
          p_recipient_id?: string
          p_sender_id?: string
          p_metadata?: Json
        }
        Returns: string
      }
      lowercase_email: {
        Args: { email: string }
        Returns: string
      }
      needs_initial_admin_setup: {
        Args: Record<PropertyKey, never>
        Returns: boolean
      }
      promote_to_admin: {
        Args: { target_email: string; by_admin_id: string }
        Returns: boolean
      }
      promote_user_to_moderator: {
        Args: { user_email: string }
        Returns: boolean
      }
      store_user_public_key: {
        Args: { p_user_id: string; p_email: string; p_public_key: string }
        Returns: undefined
      }
      verify_audit_log_integrity: {
        Args: { p_log_id: string }
        Returns: boolean
      }
      verify_audit_log_integrity_v2: {
        Args: { p_log_id: string }
        Returns: Json
      }
    }
    Enums: {
      app_role: "User" | "Moderator" | "Admin"
      audit_event_type:
        | "signup"
        | "login"
        | "logout"
        | "send_message"
        | "decrypted_message"
        | "flag_message"
        | "viewed_message"
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

type DefaultSchema = Database[Extract<keyof Database, "public">]

export type Tables<
  DefaultSchemaTableNameOrOptions extends
    | keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
    | { schema: keyof Database },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof (Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        Database[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never = never,
> = DefaultSchemaTableNameOrOptions extends { schema: keyof Database }
  ? (Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
      Database[DefaultSchemaTableNameOrOptions["schema"]]["Views"])[TableName] extends {
      Row: infer R
    }
    ? R
    : never
  : DefaultSchemaTableNameOrOptions extends keyof (DefaultSchema["Tables"] &
        DefaultSchema["Views"])
    ? (DefaultSchema["Tables"] &
        DefaultSchema["Views"])[DefaultSchemaTableNameOrOptions] extends {
        Row: infer R
      }
      ? R
      : never
    : never

export type TablesInsert<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof Database },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends { schema: keyof Database }
  ? Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Insert: infer I
    }
    ? I
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Insert: infer I
      }
      ? I
      : never
    : never

export type TablesUpdate<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof Database },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends { schema: keyof Database }
  ? Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Update: infer U
    }
    ? U
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Update: infer U
      }
      ? U
      : never
    : never

export type Enums<
  DefaultSchemaEnumNameOrOptions extends
    | keyof DefaultSchema["Enums"]
    | { schema: keyof Database },
  EnumName extends DefaultSchemaEnumNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never = never,
> = DefaultSchemaEnumNameOrOptions extends { schema: keyof Database }
  ? Database[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema["Enums"]
    ? DefaultSchema["Enums"][DefaultSchemaEnumNameOrOptions]
    : never

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof DefaultSchema["CompositeTypes"]
    | { schema: keyof Database },
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never = never,
> = PublicCompositeTypeNameOrOptions extends { schema: keyof Database }
  ? Database[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema["CompositeTypes"]
    ? DefaultSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never

export const Constants = {
  public: {
    Enums: {
      app_role: ["User", "Moderator", "Admin"],
      audit_event_type: [
        "signup",
        "login",
        "logout",
        "send_message",
        "decrypted_message",
        "flag_message",
        "viewed_message",
      ],
    },
  },
} as const
