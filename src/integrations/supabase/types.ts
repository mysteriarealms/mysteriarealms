export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  // Allows to automatically instantiate createClient with right options
  // instead of createClient<Database, { PostgrestVersion: 'XX' }>(URL, KEY)
  __InternalSupabase: {
    PostgrestVersion: "13.0.5"
  }
  public: {
    Tables: {
      article_views: {
        Row: {
          article_id: string
          fingerprint: string
          id: string
          ip_address: string | null
          viewed_at: string
        }
        Insert: {
          article_id: string
          fingerprint: string
          id?: string
          ip_address?: string | null
          viewed_at?: string
        }
        Update: {
          article_id?: string
          fingerprint?: string
          id?: string
          ip_address?: string | null
          viewed_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "article_views_article_id_fkey"
            columns: ["article_id"]
            isOneToOne: false
            referencedRelation: "articles"
            referencedColumns: ["id"]
          },
        ]
      }
      articles: {
        Row: {
          category_id: string | null
          content_en: string
          content_sq: string
          created_at: string
          excerpt_en: string | null
          excerpt_sq: string | null
          featured_image_url: string | null
          id: string
          meta_description_en: string | null
          meta_description_sq: string | null
          meta_title_en: string | null
          meta_title_sq: string | null
          published: boolean
          published_at: string | null
          reading_time_minutes: number | null
          slug: string
          title_en: string
          title_sq: string
          updated_at: string
          view_count: number
        }
        Insert: {
          category_id?: string | null
          content_en: string
          content_sq: string
          created_at?: string
          excerpt_en?: string | null
          excerpt_sq?: string | null
          featured_image_url?: string | null
          id?: string
          meta_description_en?: string | null
          meta_description_sq?: string | null
          meta_title_en?: string | null
          meta_title_sq?: string | null
          published?: boolean
          published_at?: string | null
          reading_time_minutes?: number | null
          slug: string
          title_en: string
          title_sq: string
          updated_at?: string
          view_count?: number
        }
        Update: {
          category_id?: string | null
          content_en?: string
          content_sq?: string
          created_at?: string
          excerpt_en?: string | null
          excerpt_sq?: string | null
          featured_image_url?: string | null
          id?: string
          meta_description_en?: string | null
          meta_description_sq?: string | null
          meta_title_en?: string | null
          meta_title_sq?: string | null
          published?: boolean
          published_at?: string | null
          reading_time_minutes?: number | null
          slug?: string
          title_en?: string
          title_sq?: string
          updated_at?: string
          view_count?: number
        }
        Relationships: [
          {
            foreignKeyName: "articles_category_id_fkey"
            columns: ["category_id"]
            isOneToOne: false
            referencedRelation: "categories"
            referencedColumns: ["id"]
          },
        ]
      }
      categories: {
        Row: {
          created_at: string
          description_en: string | null
          description_sq: string | null
          id: string
          name_en: string
          name_sq: string
          slug: string
        }
        Insert: {
          created_at?: string
          description_en?: string | null
          description_sq?: string | null
          id?: string
          name_en: string
          name_sq: string
          slug: string
        }
        Update: {
          created_at?: string
          description_en?: string | null
          description_sq?: string | null
          id?: string
          name_en?: string
          name_sq?: string
          slug?: string
        }
        Relationships: []
      }
      challenge_theories: {
        Row: {
          challenge_id: string
          created_at: string | null
          id: string
          is_winner: boolean | null
          theory_content: string
          updated_at: string | null
          upvotes: number | null
          user_email: string
          user_name: string
        }
        Insert: {
          challenge_id: string
          created_at?: string | null
          id?: string
          is_winner?: boolean | null
          theory_content: string
          updated_at?: string | null
          upvotes?: number | null
          user_email: string
          user_name: string
        }
        Update: {
          challenge_id?: string
          created_at?: string | null
          id?: string
          is_winner?: boolean | null
          theory_content?: string
          updated_at?: string | null
          upvotes?: number | null
          user_email?: string
          user_name?: string
        }
        Relationships: [
          {
            foreignKeyName: "challenge_theories_challenge_id_fkey"
            columns: ["challenge_id"]
            isOneToOne: false
            referencedRelation: "mystery_challenges"
            referencedColumns: ["id"]
          },
        ]
      }
      comments: {
        Row: {
          article_id: string
          content: string
          created_at: string
          email: string
          id: string
          is_approved: boolean
          is_email_verified: boolean
          name: string
          parent_comment_id: string | null
          updated_at: string
          verification_expires_at: string | null
          verification_token: string | null
        }
        Insert: {
          article_id: string
          content: string
          created_at?: string
          email: string
          id?: string
          is_approved?: boolean
          is_email_verified?: boolean
          name: string
          parent_comment_id?: string | null
          updated_at?: string
          verification_expires_at?: string | null
          verification_token?: string | null
        }
        Update: {
          article_id?: string
          content?: string
          created_at?: string
          email?: string
          id?: string
          is_approved?: boolean
          is_email_verified?: boolean
          name?: string
          parent_comment_id?: string | null
          updated_at?: string
          verification_expires_at?: string | null
          verification_token?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "comments_article_id_fkey"
            columns: ["article_id"]
            isOneToOne: false
            referencedRelation: "articles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "comments_parent_comment_id_fkey"
            columns: ["parent_comment_id"]
            isOneToOne: false
            referencedRelation: "comments"
            referencedColumns: ["id"]
          },
        ]
      }
      mystery_challenges: {
        Row: {
          clues_en: string | null
          clues_sq: string | null
          created_at: string | null
          deadline: string
          description_en: string
          description_sq: string
          featured_image_url: string | null
          id: string
          is_active: boolean | null
          title_en: string
          title_sq: string
          updated_at: string | null
          winner_id: string | null
        }
        Insert: {
          clues_en?: string | null
          clues_sq?: string | null
          created_at?: string | null
          deadline: string
          description_en: string
          description_sq: string
          featured_image_url?: string | null
          id?: string
          is_active?: boolean | null
          title_en: string
          title_sq: string
          updated_at?: string | null
          winner_id?: string | null
        }
        Update: {
          clues_en?: string | null
          clues_sq?: string | null
          created_at?: string | null
          deadline?: string
          description_en?: string
          description_sq?: string
          featured_image_url?: string | null
          id?: string
          is_active?: boolean | null
          title_en?: string
          title_sq?: string
          updated_at?: string | null
          winner_id?: string | null
        }
        Relationships: []
      }
      theory_votes: {
        Row: {
          created_at: string | null
          fingerprint: string | null
          id: string
          theory_id: string
          voter_email: string
        }
        Insert: {
          created_at?: string | null
          fingerprint?: string | null
          id?: string
          theory_id: string
          voter_email: string
        }
        Update: {
          created_at?: string | null
          fingerprint?: string | null
          id?: string
          theory_id?: string
          voter_email?: string
        }
        Relationships: [
          {
            foreignKeyName: "theory_votes_theory_id_fkey"
            columns: ["theory_id"]
            isOneToOne: false
            referencedRelation: "challenge_theories"
            referencedColumns: ["id"]
          },
        ]
      }
      user_reputation: {
        Row: {
          approved_comments: number
          badge_level: string
          created_at: string
          email: string
          first_comment_at: string
          id: string
          last_comment_at: string
          name: string
          reputation_score: number
          total_comments: number
          total_replies: number
          updated_at: string
        }
        Insert: {
          approved_comments?: number
          badge_level?: string
          created_at?: string
          email: string
          first_comment_at?: string
          id?: string
          last_comment_at?: string
          name: string
          reputation_score?: number
          total_comments?: number
          total_replies?: number
          updated_at?: string
        }
        Update: {
          approved_comments?: number
          badge_level?: string
          created_at?: string
          email?: string
          first_comment_at?: string
          id?: string
          last_comment_at?: string
          name?: string
          reputation_score?: number
          total_comments?: number
          total_replies?: number
          updated_at?: string
        }
        Relationships: []
      }
      user_roles: {
        Row: {
          created_at: string
          id: string
          role: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          role: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          role?: Database["public"]["Enums"]["app_role"]
          user_id?: string
        }
        Relationships: []
      }
      whitelisted_ips: {
        Row: {
          created_at: string
          created_by: string | null
          description: string | null
          id: string
          ip_address: string
          is_active: boolean
        }
        Insert: {
          created_at?: string
          created_by?: string | null
          description?: string | null
          id?: string
          ip_address: string
          is_active?: boolean
        }
        Update: {
          created_at?: string
          created_by?: string | null
          description?: string | null
          id?: string
          ip_address?: string
          is_active?: boolean
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      calculate_badge_level: { Args: { score: number }; Returns: string }
      has_role: {
        Args: {
          _role: Database["public"]["Enums"]["app_role"]
          _user_id: string
        }
        Returns: boolean
      }
      increment_view_count: { Args: { article_id: string }; Returns: undefined }
      is_ip_whitelisted: { Args: { check_ip: string }; Returns: boolean }
    }
    Enums: {
      app_role: "admin"
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

type DatabaseWithoutInternals = Omit<Database, "__InternalSupabase">

type DefaultSchema = DatabaseWithoutInternals[Extract<keyof Database, "public">]

export type Tables<
  DefaultSchemaTableNameOrOptions extends
    | keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
      DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])[TableName] extends {
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
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
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
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
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
    | { schema: keyof DatabaseWithoutInternals },
  EnumName extends DefaultSchemaEnumNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never = never,
> = DefaultSchemaEnumNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema["Enums"]
    ? DefaultSchema["Enums"][DefaultSchemaEnumNameOrOptions]
    : never

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof DefaultSchema["CompositeTypes"]
    | { schema: keyof DatabaseWithoutInternals },
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never = never,
> = PublicCompositeTypeNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema["CompositeTypes"]
    ? DefaultSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never

export const Constants = {
  public: {
    Enums: {
      app_role: ["admin"],
    },
  },
} as const
