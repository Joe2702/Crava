// Generated from the Supabase schema. Regenerate after any migration.
export type Database = {
  public: {
    Tables: {
      skills: {
        Row: {
          id: string
          name_en: string
          name_ar: string
          category_en: string
          category_ar: string
          coach_name_en: string
          coach_name_ar: string
          sort_order: number
          is_published: boolean
          created_at: string
        }
        Insert: never
        Update: never
        Relationships: []
      }
      levels: {
        Row: {
          id: string
          skill_id: string
          idx: number
          name_en: string
          name_ar: string
          video_id: string | null
          duration_s: number | null
          is_published: boolean
        }
        Insert: never
        Update: never
        Relationships: []
      }
      drills: {
        Row: {
          id: string
          level_id: string
          idx: number
          name_en: string
          name_ar: string
          meta_en: string
          meta_ar: string
          is_required: boolean
        }
        Insert: never
        Update: never
        Relationships: []
      }
      profiles: {
        Row: {
          id: string
          display_name: string | null
          locale: string
          city: string | null
          notif_enabled: boolean
          onboarded_at: string | null
          created_at: string
        }
        Insert: {
          id: string
          display_name?: string | null
          locale?: string
          city?: string | null
          notif_enabled?: boolean
          onboarded_at?: string | null
        }
        Update: {
          display_name?: string | null
          locale?: string
          city?: string | null
          notif_enabled?: boolean
          onboarded_at?: string | null
        }
        Relationships: []
      }
      user_stats: {
        Row: {
          user_id: string
          xp: number
          streak_count: number
          last_session_date: string | null
          updated_at: string
        }
        Insert: { user_id: string }
        Update: never
        Relationships: []
      }
      user_drill_completions: {
        Row: { user_id: string; drill_id: string; completed_at: string }
        Insert: { user_id: string; drill_id: string; completed_at?: string }
        Update: never
        Relationships: []
      }
      user_level_completions: {
        Row: { user_id: string; level_id: string; completed_at: string }
        Insert: { user_id: string; level_id: string; completed_at?: string }
        Update: never
        Relationships: []
      }
      entitlements: {
        Row: {
          user_id: string
          product_id: string
          status: 'active' | 'trialing' | 'expired' | 'cancelled' | 'grace'
          source: 'ios' | 'android' | 'web' | 'promo'
          expires_at: string | null
          rc_app_user_id: string | null
          updated_at: string
        }
        Insert: never
        Update: never
        Relationships: []
      }
    }
    Views: Record<never, never>
    Functions: {
      complete_level: {
        Args: { p_level_id: string }
        Returns: { xp: number; streak_count: number; already_completed: boolean }[]
      }
    }
    Enums: Record<never, never>
    CompositeTypes: Record<never, never>
  }
}

export type Tables<T extends keyof Database['public']['Tables']> =
  Database['public']['Tables'][T]['Row']
