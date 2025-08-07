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
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      [_ in never]: never
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
