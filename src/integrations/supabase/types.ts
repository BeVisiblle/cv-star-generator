export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  // Allows to automatically instanciate createClient with right options
  // instead of createClient<Database, { PostgrestVersion: 'XX' }>(URL, KEY)
  __InternalSupabase: {
    PostgrestVersion: "12.2.12 (cd3cf9e)"
  }
  public: {
    Tables: {
      companies: {
        Row: {
          active_tokens: number | null
          additional_locations: Json | null
          created_at: string | null
          description: string | null
          founded_year: number | null
          header_image: string | null
          id: string
          industry: string | null
          logo_url: string | null
          main_location: string | null
          name: string
          plan_type: string | null
          seats: number | null
          size_range: string | null
          subscription_status: string | null
          updated_at: string | null
          website_url: string | null
        }
        Insert: {
          active_tokens?: number | null
          additional_locations?: Json | null
          created_at?: string | null
          description?: string | null
          founded_year?: number | null
          header_image?: string | null
          id?: string
          industry?: string | null
          logo_url?: string | null
          main_location?: string | null
          name: string
          plan_type?: string | null
          seats?: number | null
          size_range?: string | null
          subscription_status?: string | null
          updated_at?: string | null
          website_url?: string | null
        }
        Update: {
          active_tokens?: number | null
          additional_locations?: Json | null
          created_at?: string | null
          description?: string | null
          founded_year?: number | null
          header_image?: string | null
          id?: string
          industry?: string | null
          logo_url?: string | null
          main_location?: string | null
          name?: string
          plan_type?: string | null
          seats?: number | null
          size_range?: string | null
          subscription_status?: string | null
          updated_at?: string | null
          website_url?: string | null
        }
        Relationships: []
      }
      company_posts: {
        Row: {
          company_id: string | null
          content: string
          created_at: string | null
          id: string
          media_url: string | null
          visibility: string | null
        }
        Insert: {
          company_id?: string | null
          content: string
          created_at?: string | null
          id?: string
          media_url?: string | null
          visibility?: string | null
        }
        Update: {
          company_id?: string | null
          content?: string
          created_at?: string | null
          id?: string
          media_url?: string | null
          visibility?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "company_posts_company_id_fkey"
            columns: ["company_id"]
            isOneToOne: false
            referencedRelation: "companies"
            referencedColumns: ["id"]
          },
        ]
      }
      company_settings: {
        Row: {
          company_id: string | null
          created_at: string | null
          id: string
          notification_prefs: Json | null
          target_industries: Json | null
          target_locations: Json | null
          target_status: Json | null
          updated_at: string | null
        }
        Insert: {
          company_id?: string | null
          created_at?: string | null
          id?: string
          notification_prefs?: Json | null
          target_industries?: Json | null
          target_locations?: Json | null
          target_status?: Json | null
          updated_at?: string | null
        }
        Update: {
          company_id?: string | null
          created_at?: string | null
          id?: string
          notification_prefs?: Json | null
          target_industries?: Json | null
          target_locations?: Json | null
          target_status?: Json | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "company_settings_company_id_fkey"
            columns: ["company_id"]
            isOneToOne: true
            referencedRelation: "companies"
            referencedColumns: ["id"]
          },
        ]
      }
      company_users: {
        Row: {
          accepted_at: string | null
          company_id: string | null
          id: string
          invited_at: string | null
          role: string | null
          user_id: string | null
        }
        Insert: {
          accepted_at?: string | null
          company_id?: string | null
          id?: string
          invited_at?: string | null
          role?: string | null
          user_id?: string | null
        }
        Update: {
          accepted_at?: string | null
          company_id?: string | null
          id?: string
          invited_at?: string | null
          role?: string | null
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "company_users_company_id_fkey"
            columns: ["company_id"]
            isOneToOne: false
            referencedRelation: "companies"
            referencedColumns: ["id"]
          },
        ]
      }
      follows: {
        Row: {
          created_at: string | null
          follower_id: string
          following_id: string
          id: string
        }
        Insert: {
          created_at?: string | null
          follower_id: string
          following_id: string
          id?: string
        }
        Update: {
          created_at?: string | null
          follower_id?: string
          following_id?: string
          id?: string
        }
        Relationships: [
          {
            foreignKeyName: "follows_follower_id_fkey"
            columns: ["follower_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "follows_following_id_fkey"
            columns: ["following_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      languages: {
        Row: {
          code: string | null
          created_at: string | null
          id: string
          name: string
        }
        Insert: {
          code?: string | null
          created_at?: string | null
          id?: string
          name: string
        }
        Update: {
          code?: string | null
          created_at?: string | null
          id?: string
          name?: string
        }
        Relationships: []
      }
      matches: {
        Row: {
          company_id: string | null
          created_at: string | null
          id: string
          matched_at: string | null
          profile_id: string | null
          status: string | null
        }
        Insert: {
          company_id?: string | null
          created_at?: string | null
          id?: string
          matched_at?: string | null
          profile_id?: string | null
          status?: string | null
        }
        Update: {
          company_id?: string | null
          created_at?: string | null
          id?: string
          matched_at?: string | null
          profile_id?: string | null
          status?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "matches_company_id_fkey"
            columns: ["company_id"]
            isOneToOne: false
            referencedRelation: "companies"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "matches_profile_id_fkey"
            columns: ["profile_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      postal_codes: {
        Row: {
          bundesland: string | null
          created_at: string | null
          id: string
          ort: string
          plz: string
        }
        Insert: {
          bundesland?: string | null
          created_at?: string | null
          id?: string
          ort: string
          plz: string
        }
        Update: {
          bundesland?: string | null
          created_at?: string | null
          id?: string
          ort?: string
          plz?: string
        }
        Relationships: []
      }
      posts: {
        Row: {
          content: string
          created_at: string | null
          id: string
          image_url: string | null
          updated_at: string | null
          user_id: string
        }
        Insert: {
          content: string
          created_at?: string | null
          id?: string
          image_url?: string | null
          updated_at?: string | null
          user_id: string
        }
        Update: {
          content?: string
          created_at?: string | null
          id?: string
          image_url?: string | null
          updated_at?: string | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "posts_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      profiles: {
        Row: {
          abschlussjahr: string | null
          abschlussjahr_ausgelernt: string | null
          account_created: boolean | null
          aktueller_beruf: string | null
          ausbildungsberuf: string | null
          ausbildungsbetrieb: string | null
          avatar_url: string | null
          berufserfahrung: Json | null
          bio: string | null
          branche: string | null
          cover_image_url: string | null
          created_at: string | null
          cv_url: string | null
          driver_license_class: string | null
          einwilligung: boolean | null
          email: string | null
          faehigkeiten: Json | null
          geburtsdatum: string | null
          geplanter_abschluss: string | null
          has_drivers_license: boolean | null
          has_own_vehicle: boolean | null
          hausnummer: string | null
          headline: string | null
          id: string
          kenntnisse: string | null
          layout: number | null
          motivation: string | null
          nachname: string | null
          ort: string | null
          plz: string | null
          praktische_erfahrung: string | null
          profile_complete: boolean | null
          profile_published: boolean | null
          schulbildung: Json | null
          schule: string | null
          sprachen: Json | null
          startjahr: string | null
          status: string | null
          strasse: string | null
          target_year: string | null
          telefon: string | null
          uebermich: string | null
          updated_at: string | null
          visibility_industry: Json | null
          visibility_region: Json | null
          voraussichtliches_ende: string | null
          vorname: string | null
        }
        Insert: {
          abschlussjahr?: string | null
          abschlussjahr_ausgelernt?: string | null
          account_created?: boolean | null
          aktueller_beruf?: string | null
          ausbildungsberuf?: string | null
          ausbildungsbetrieb?: string | null
          avatar_url?: string | null
          berufserfahrung?: Json | null
          bio?: string | null
          branche?: string | null
          cover_image_url?: string | null
          created_at?: string | null
          cv_url?: string | null
          driver_license_class?: string | null
          einwilligung?: boolean | null
          email?: string | null
          faehigkeiten?: Json | null
          geburtsdatum?: string | null
          geplanter_abschluss?: string | null
          has_drivers_license?: boolean | null
          has_own_vehicle?: boolean | null
          hausnummer?: string | null
          headline?: string | null
          id: string
          kenntnisse?: string | null
          layout?: number | null
          motivation?: string | null
          nachname?: string | null
          ort?: string | null
          plz?: string | null
          praktische_erfahrung?: string | null
          profile_complete?: boolean | null
          profile_published?: boolean | null
          schulbildung?: Json | null
          schule?: string | null
          sprachen?: Json | null
          startjahr?: string | null
          status?: string | null
          strasse?: string | null
          target_year?: string | null
          telefon?: string | null
          uebermich?: string | null
          updated_at?: string | null
          visibility_industry?: Json | null
          visibility_region?: Json | null
          voraussichtliches_ende?: string | null
          vorname?: string | null
        }
        Update: {
          abschlussjahr?: string | null
          abschlussjahr_ausgelernt?: string | null
          account_created?: boolean | null
          aktueller_beruf?: string | null
          ausbildungsberuf?: string | null
          ausbildungsbetrieb?: string | null
          avatar_url?: string | null
          berufserfahrung?: Json | null
          bio?: string | null
          branche?: string | null
          cover_image_url?: string | null
          created_at?: string | null
          cv_url?: string | null
          driver_license_class?: string | null
          einwilligung?: boolean | null
          email?: string | null
          faehigkeiten?: Json | null
          geburtsdatum?: string | null
          geplanter_abschluss?: string | null
          has_drivers_license?: boolean | null
          has_own_vehicle?: boolean | null
          hausnummer?: string | null
          headline?: string | null
          id?: string
          kenntnisse?: string | null
          layout?: number | null
          motivation?: string | null
          nachname?: string | null
          ort?: string | null
          plz?: string | null
          praktische_erfahrung?: string | null
          profile_complete?: boolean | null
          profile_published?: boolean | null
          schulbildung?: Json | null
          schule?: string | null
          sprachen?: Json | null
          startjahr?: string | null
          status?: string | null
          strasse?: string | null
          target_year?: string | null
          telefon?: string | null
          uebermich?: string | null
          updated_at?: string | null
          visibility_industry?: Json | null
          visibility_region?: Json | null
          voraussichtliches_ende?: string | null
          vorname?: string | null
        }
        Relationships: []
      }
      school_types: {
        Row: {
          category: string | null
          created_at: string | null
          id: string
          name: string
        }
        Insert: {
          category?: string | null
          created_at?: string | null
          id?: string
          name: string
        }
        Update: {
          category?: string | null
          created_at?: string | null
          id?: string
          name?: string
        }
        Relationships: []
      }
      skills: {
        Row: {
          branch: string | null
          category: string | null
          created_at: string | null
          id: string
          name: string
          status_level: string | null
        }
        Insert: {
          branch?: string | null
          category?: string | null
          created_at?: string | null
          id?: string
          name: string
          status_level?: string | null
        }
        Update: {
          branch?: string | null
          category?: string | null
          created_at?: string | null
          id?: string
          name?: string
          status_level?: string | null
        }
        Relationships: []
      }
      subscriptions: {
        Row: {
          company_id: string | null
          created_at: string | null
          end_date: string | null
          id: string
          is_active: boolean | null
          plan_id: string
          price_yearly: number | null
          seat_count: number | null
          start_date: string | null
          token_per_month: number | null
        }
        Insert: {
          company_id?: string | null
          created_at?: string | null
          end_date?: string | null
          id?: string
          is_active?: boolean | null
          plan_id: string
          price_yearly?: number | null
          seat_count?: number | null
          start_date?: string | null
          token_per_month?: number | null
        }
        Update: {
          company_id?: string | null
          created_at?: string | null
          end_date?: string | null
          id?: string
          is_active?: boolean | null
          plan_id?: string
          price_yearly?: number | null
          seat_count?: number | null
          start_date?: string | null
          token_per_month?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "subscriptions_company_id_fkey"
            columns: ["company_id"]
            isOneToOne: false
            referencedRelation: "companies"
            referencedColumns: ["id"]
          },
        ]
      }
      tokens_used: {
        Row: {
          company_id: string | null
          id: string
          profile_id: string | null
          used_at: string | null
        }
        Insert: {
          company_id?: string | null
          id?: string
          profile_id?: string | null
          used_at?: string | null
        }
        Update: {
          company_id?: string | null
          id?: string
          profile_id?: string | null
          used_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "tokens_used_company_id_fkey"
            columns: ["company_id"]
            isOneToOne: false
            referencedRelation: "companies"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "tokens_used_profile_id_fkey"
            columns: ["profile_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      user_documents: {
        Row: {
          document_type: string
          file_size: number
          file_type: string
          filename: string
          id: string
          original_name: string
          uploaded_at: string
          user_id: string
        }
        Insert: {
          document_type: string
          file_size: number
          file_type: string
          filename: string
          id?: string
          original_name: string
          uploaded_at?: string
          user_id: string
        }
        Update: {
          document_type?: string
          file_size?: number
          file_type?: string
          filename?: string
          id?: string
          original_name?: string
          uploaded_at?: string
          user_id?: string
        }
        Relationships: []
      }
      user_types: {
        Row: {
          created_at: string | null
          id: string
          user_id: string
          user_type: string
        }
        Insert: {
          created_at?: string | null
          id?: string
          user_id: string
          user_type: string
        }
        Update: {
          created_at?: string | null
          id?: string
          user_id?: string
          user_type?: string
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      get_user_companies: {
        Args: Record<PropertyKey, never>
        Returns: {
          company_id: string
        }[]
      }
      get_user_company_id: {
        Args: Record<PropertyKey, never>
        Returns: string
      }
      is_company_admin: {
        Args: { check_company_id: string }
        Returns: boolean
      }
      is_company_member: {
        Args: Record<PropertyKey, never>
        Returns: boolean
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
    Enums: {},
  },
} as const
