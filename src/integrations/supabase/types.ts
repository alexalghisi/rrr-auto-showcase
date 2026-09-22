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
    PostgrestVersion: "14.5"
  }
  public: {
    Tables: {
      cars: {
        Row: {
          body_type: string | null
          color: string | null
          created_at: string
          currency: string
          description: string | null
          doors: number | null
          drivetrain: string | null
          engine_cc: number | null
          external_id: string | null
          featured: boolean
          features: string[]
          fingerprint: string | null
          fuel: string
          gearbox: string
          id: string
          images: string[]
          last_seen_at: string | null
          make: string
          mileage_km: number
          model: string
          power_hp: number | null
          price: number
          published: boolean
          slug: string
          source: string | null
          source_url: string | null
          status: string
          trim: string | null
          updated_at: string
          year: number
        }
        Insert: {
          body_type?: string | null
          color?: string | null
          created_at?: string
          currency?: string
          description?: string | null
          doors?: number | null
          drivetrain?: string | null
          engine_cc?: number | null
          external_id?: string | null
          featured?: boolean
          features?: string[]
          fingerprint?: string | null
          fuel?: string
          gearbox?: string
          id?: string
          images?: string[]
          last_seen_at?: string | null
          make: string
          mileage_km?: number
          model: string
          power_hp?: number | null
          price: number
          published?: boolean
          slug: string
          source?: string | null
          source_url?: string | null
          status?: string
          trim?: string | null
          updated_at?: string
          year: number
        }
        Update: {
          body_type?: string | null
          color?: string | null
          created_at?: string
          currency?: string
          description?: string | null
          doors?: number | null
          drivetrain?: string | null
          engine_cc?: number | null
          external_id?: string | null
          featured?: boolean
          features?: string[]
          fingerprint?: string | null
          fuel?: string
          gearbox?: string
          id?: string
          images?: string[]
          last_seen_at?: string | null
          make?: string
          mileage_km?: number
          model?: string
          power_hp?: number | null
          price?: number
          published?: boolean
          slug?: string
          source?: string | null
          source_url?: string | null
          status?: string
          trim?: string | null
          updated_at?: string
          year?: number
        }
        Relationships: []
      }
      competitor_reports: {
        Row: {
          created_at: string
          findings: Json
          gaps: Json
          id: string
          scanned_domains: string[]
          summary: string
        }
        Insert: {
          created_at?: string
          findings?: Json
          gaps?: Json
          id?: string
          scanned_domains?: string[]
          summary?: string
        }
        Update: {
          created_at?: string
          findings?: Json
          gaps?: Json
          id?: string
          scanned_domains?: string[]
          summary?: string
        }
        Relationships: []
      }
      competitors: {
        Row: {
          active: boolean
          created_at: string
          domain: string
          id: string
          label: string
        }
        Insert: {
          active?: boolean
          created_at?: string
          domain: string
          id?: string
          label?: string
        }
        Update: {
          active?: boolean
          created_at?: string
          domain?: string
          id?: string
          label?: string
        }
        Relationships: []
      }
      content_drafts: {
        Row: {
          body: string
          created_at: string
          description: string
          id: string
          kind: string
          slug: string
          status: string
          title: string
          topic: string
          updated_at: string
        }
        Insert: {
          body?: string
          created_at?: string
          description?: string
          id?: string
          kind?: string
          slug: string
          status?: string
          title: string
          topic: string
          updated_at?: string
        }
        Update: {
          body?: string
          created_at?: string
          description?: string
          id?: string
          kind?: string
          slug?: string
          status?: string
          title?: string
          topic?: string
          updated_at?: string
        }
        Relationships: []
      }
      import_runs: {
        Row: {
          created_at: string
          errors: string | null
          found: number
          id: string
          inserted: number
          skipped: number
          source: string
        }
        Insert: {
          created_at?: string
          errors?: string | null
          found?: number
          id?: string
          inserted?: number
          skipped?: number
          source: string
        }
        Update: {
          created_at?: string
          errors?: string | null
          found?: number
          id?: string
          inserted?: number
          skipped?: number
          source?: string
        }
        Relationships: []
      }
      leads: {
        Row: {
          car_slug: string | null
          car_title: string | null
          created_at: string
          details: Json
          email: string | null
          id: string
          kind: string
          message: string | null
          name: string | null
          phone: string | null
          status: string
        }
        Insert: {
          car_slug?: string | null
          car_title?: string | null
          created_at?: string
          details?: Json
          email?: string | null
          id?: string
          kind: string
          message?: string | null
          name?: string | null
          phone?: string | null
          status?: string
        }
        Update: {
          car_slug?: string | null
          car_title?: string | null
          created_at?: string
          details?: Json
          email?: string | null
          id?: string
          kind?: string
          message?: string | null
          name?: string | null
          phone?: string | null
          status?: string
        }
        Relationships: []
      }
      page_views: {
        Row: {
          car_slug: string | null
          created_at: string
          id: string
          path: string
        }
        Insert: {
          car_slug?: string | null
          created_at?: string
          id?: string
          path: string
        }
        Update: {
          car_slug?: string | null
          created_at?: string
          id?: string
          path?: string
        }
        Relationships: []
      }
      seo_page_content: {
        Row: {
          created_at: string
          id: string
          intro: string
          slug: string
          source: string
          stock_count: number
          updated_at: string
        }
        Insert: {
          created_at?: string
          id?: string
          intro: string
          slug: string
          source?: string
          stock_count?: number
          updated_at?: string
        }
        Update: {
          created_at?: string
          id?: string
          intro?: string
          slug?: string
          source?: string
          stock_count?: number
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
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      has_role: {
        Args: {
          _role: Database["public"]["Enums"]["app_role"]
          _user_id: string
        }
        Returns: boolean
      }
    }
    Enums: {
      app_role: "admin" | "user"
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
  TableName extends (DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never) = never,
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
  TableName extends (DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never) = never,
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
  TableName extends (DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never) = never,
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
  EnumName extends (DefaultSchemaEnumNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never) = never,
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
  CompositeTypeName extends (PublicCompositeTypeNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never) = never,
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
      app_role: ["admin", "user"],
    },
  },
} as const
