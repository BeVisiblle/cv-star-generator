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
    PostgrestVersion: "12.2.3 (519615d)"
  }
  public: {
    Tables: {
      application_contacts: {
        Row: {
          application_id: string
          contact_date: string
          contact_type: string
          created_at: string
          created_by: string
          id: string
          notes: string | null
        }
        Insert: {
          application_id: string
          contact_date?: string
          contact_type: string
          created_at?: string
          created_by: string
          id?: string
          notes?: string | null
        }
        Update: {
          application_id?: string
          contact_date?: string
          contact_type?: string
          created_at?: string
          created_by?: string
          id?: string
          notes?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "application_contacts_application_id_fkey"
            columns: ["application_id"]
            isOneToOne: false
            referencedRelation: "applications"
            referencedColumns: ["id"]
          },
        ]
      }
      application_history: {
        Row: {
          application_id: string
          changed_by: string
          created_at: string
          id: string
          status: Database["public"]["Enums"]["application_status"]
        }
        Insert: {
          application_id: string
          changed_by: string
          created_at?: string
          id?: string
          status: Database["public"]["Enums"]["application_status"]
        }
        Update: {
          application_id?: string
          changed_by?: string
          created_at?: string
          id?: string
          status?: Database["public"]["Enums"]["application_status"]
        }
        Relationships: [
          {
            foreignKeyName: "application_history_application_id_fkey"
            columns: ["application_id"]
            isOneToOne: false
            referencedRelation: "applications"
            referencedColumns: ["id"]
          },
        ]
      }
      application_notes: {
        Row: {
          application_id: string
          created_at: string
          created_by: string
          id: string
          note: string
        }
        Insert: {
          application_id: string
          created_at?: string
          created_by: string
          id?: string
          note: string
        }
        Update: {
          application_id?: string
          created_at?: string
          created_by?: string
          id?: string
          note?: string
        }
        Relationships: [
          {
            foreignKeyName: "application_notes_application_id_fkey"
            columns: ["application_id"]
            isOneToOne: false
            referencedRelation: "applications"
            referencedColumns: ["id"]
          },
        ]
      }
      applications: {
        Row: {
          applied_at: string | null
          company_id: string | null
          company_name: string
          degree: string | null
          description: string | null
          id: string
          interview_date: string | null
          job_title: string
          job_type: string
          location: string
          rejection_reason: string | null
          rejection_sent: boolean | null
          skills: string[] | null
          status: Database["public"]["Enums"]["application_status"] | null
          user_id: string | null
        }
        Insert: {
          applied_at?: string | null
          company_id?: string | null
          company_name: string
          degree?: string | null
          description?: string | null
          id?: string
          interview_date?: string | null
          job_title: string
          job_type: string
          location: string
          rejection_reason?: string | null
          rejection_sent?: boolean | null
          skills?: string[] | null
          status?: Database["public"]["Enums"]["application_status"] | null
          user_id?: string | null
        }
        Update: {
          applied_at?: string | null
          company_id?: string | null
          company_name?: string
          degree?: string | null
          description?: string | null
          id?: string
          interview_date?: string | null
          job_title?: string
          job_type?: string
          location?: string
          rejection_reason?: string | null
          rejection_sent?: boolean | null
          skills?: string[] | null
          status?: Database["public"]["Enums"]["application_status"] | null
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "applications_company_id_fkey"
            columns: ["company_id"]
            isOneToOne: false
            referencedRelation: "companies"
            referencedColumns: ["id"]
          },
        ]
      }
      badges: {
        Row: {
          badge_name: string
          badge_type: Database["public"]["Enums"]["badge_type"]
          description: string
          earned_at: string | null
          icon_name: string
          id: string
          user_id: string
        }
        Insert: {
          badge_name: string
          badge_type: Database["public"]["Enums"]["badge_type"]
          description: string
          earned_at?: string | null
          icon_name: string
          id?: string
          user_id: string
        }
        Update: {
          badge_name?: string
          badge_type?: Database["public"]["Enums"]["badge_type"]
          description?: string
          earned_at?: string | null
          icon_name?: string
          id?: string
          user_id?: string
        }
        Relationships: []
      }
      chapters: {
        Row: {
          created_at: string | null
          description: string
          difficulty: string | null
          estimated_time: number
          feedback: Json | null
          focus_area: string | null
          id: string
          is_ai_generated: boolean | null
          order_index: number
          prerequisite_id: string | null
          title: string
        }
        Insert: {
          created_at?: string | null
          description: string
          difficulty?: string | null
          estimated_time: number
          feedback?: Json | null
          focus_area?: string | null
          id?: string
          is_ai_generated?: boolean | null
          order_index: number
          prerequisite_id?: string | null
          title: string
        }
        Update: {
          created_at?: string | null
          description?: string
          difficulty?: string | null
          estimated_time?: number
          feedback?: Json | null
          focus_area?: string | null
          id?: string
          is_ai_generated?: boolean | null
          order_index?: number
          prerequisite_id?: string | null
          title?: string
        }
        Relationships: [
          {
            foreignKeyName: "chapters_prerequisite_id_fkey"
            columns: ["prerequisite_id"]
            isOneToOne: false
            referencedRelation: "chapters"
            referencedColumns: ["id"]
          },
        ]
      }
      companies: {
        Row: {
          benefits: string[] | null
          city: string | null
          company_size: string | null
          contact_email: string | null
          contact_phone: string | null
          created_at: string
          culture_values: string[] | null
          description: string | null
          dsgvo_consent_at: string | null
          founding_year: number | null
          id: string
          industry: Database["public"]["Enums"]["industry_type"] | null
          locations: string[] | null
          logo_url: string | null
          name: string
          phone: string | null
          postal_code: string | null
          social_media: Json | null
          updated_at: string
          website: string | null
        }
        Insert: {
          benefits?: string[] | null
          city?: string | null
          company_size?: string | null
          contact_email?: string | null
          contact_phone?: string | null
          created_at?: string
          culture_values?: string[] | null
          description?: string | null
          dsgvo_consent_at?: string | null
          founding_year?: number | null
          id?: string
          industry?: Database["public"]["Enums"]["industry_type"] | null
          locations?: string[] | null
          logo_url?: string | null
          name: string
          phone?: string | null
          postal_code?: string | null
          social_media?: Json | null
          updated_at?: string
          website?: string | null
        }
        Update: {
          benefits?: string[] | null
          city?: string | null
          company_size?: string | null
          contact_email?: string | null
          contact_phone?: string | null
          created_at?: string
          culture_values?: string[] | null
          description?: string | null
          dsgvo_consent_at?: string | null
          founding_year?: number | null
          id?: string
          industry?: Database["public"]["Enums"]["industry_type"] | null
          locations?: string[] | null
          logo_url?: string | null
          name?: string
          phone?: string | null
          postal_code?: string | null
          social_media?: Json | null
          updated_at?: string
          website?: string | null
        }
        Relationships: []
      }
      cv_analysis: {
        Row: {
          created_at: string
          cv_url: string
          id: string
          question_type: string
          questions: Json
          user_id: string
        }
        Insert: {
          created_at?: string
          cv_url: string
          id?: string
          question_type?: string
          questions: Json
          user_id: string
        }
        Update: {
          created_at?: string
          cv_url?: string
          id?: string
          question_type?: string
          questions?: Json
          user_id?: string
        }
        Relationships: []
      }
      education_entries: {
        Row: {
          created_at: string | null
          degree: string
          description: string | null
          end_date: string | null
          field_of_study: string | null
          grade: string | null
          id: string
          school_name: string
          start_date: string
          updated_at: string | null
          user_id: string | null
        }
        Insert: {
          created_at?: string | null
          degree: string
          description?: string | null
          end_date?: string | null
          field_of_study?: string | null
          grade?: string | null
          id?: string
          school_name: string
          start_date: string
          updated_at?: string | null
          user_id?: string | null
        }
        Update: {
          created_at?: string | null
          degree?: string
          description?: string | null
          end_date?: string | null
          field_of_study?: string | null
          grade?: string | null
          id?: string
          school_name?: string
          start_date?: string
          updated_at?: string | null
          user_id?: string | null
        }
        Relationships: []
      }
      employer_profiles: {
        Row: {
          company_id: string | null
          created_at: string
          department: string | null
          id: string
          role: string | null
          updated_at: string
        }
        Insert: {
          company_id?: string | null
          created_at?: string
          department?: string | null
          id: string
          role?: string | null
          updated_at?: string
        }
        Update: {
          company_id?: string | null
          created_at?: string
          department?: string | null
          id?: string
          role?: string | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "employer_profiles_company_id_fkey"
            columns: ["company_id"]
            isOneToOne: false
            referencedRelation: "companies"
            referencedColumns: ["id"]
          },
        ]
      }
      interview_simulations: {
        Row: {
          created_at: string
          feedback: Json | null
          id: string
          metrics: Json | null
          recording_url: string | null
          transcription: string | null
          updated_at: string
          user_id: string
          video_url: string | null
        }
        Insert: {
          created_at?: string
          feedback?: Json | null
          id?: string
          metrics?: Json | null
          recording_url?: string | null
          transcription?: string | null
          updated_at?: string
          user_id: string
          video_url?: string | null
        }
        Update: {
          created_at?: string
          feedback?: Json | null
          id?: string
          metrics?: Json | null
          recording_url?: string | null
          transcription?: string | null
          updated_at?: string
          user_id?: string
          video_url?: string | null
        }
        Relationships: []
      }
      job_benefits: {
        Row: {
          created_at: string
          description: string | null
          id: string
          job_posting_id: string | null
          title: string
          type: string | null
        }
        Insert: {
          created_at?: string
          description?: string | null
          id?: string
          job_posting_id?: string | null
          title: string
          type?: string | null
        }
        Update: {
          created_at?: string
          description?: string | null
          id?: string
          job_posting_id?: string | null
          title?: string
          type?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "job_benefits_job_posting_id_fkey"
            columns: ["job_posting_id"]
            isOneToOne: false
            referencedRelation: "job_postings"
            referencedColumns: ["id"]
          },
        ]
      }
      job_postings: {
        Row: {
          applicant_count: number | null
          benefits: string[] | null
          company_id: string | null
          created_at: string
          description: string
          education_level:
            | Database["public"]["Enums"]["education_level"][]
            | null
          id: string
          industry_sector: string | null
          location: string
          radius: number | null
          required_degree: string | null
          requirements: string[] | null
          salary: string | null
          skills: string[] | null
          start_date: string | null
          status: string | null
          title: string
          type: string
          updated_at: string
        }
        Insert: {
          applicant_count?: number | null
          benefits?: string[] | null
          company_id?: string | null
          created_at?: string
          description: string
          education_level?:
            | Database["public"]["Enums"]["education_level"][]
            | null
          id?: string
          industry_sector?: string | null
          location: string
          radius?: number | null
          required_degree?: string | null
          requirements?: string[] | null
          salary?: string | null
          skills?: string[] | null
          start_date?: string | null
          status?: string | null
          title: string
          type: string
          updated_at?: string
        }
        Update: {
          applicant_count?: number | null
          benefits?: string[] | null
          company_id?: string | null
          created_at?: string
          description?: string
          education_level?:
            | Database["public"]["Enums"]["education_level"][]
            | null
          id?: string
          industry_sector?: string | null
          location?: string
          radius?: number | null
          required_degree?: string | null
          requirements?: string[] | null
          salary?: string | null
          skills?: string[] | null
          start_date?: string | null
          status?: string | null
          title?: string
          type?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "job_postings_company_id_fkey"
            columns: ["company_id"]
            isOneToOne: false
            referencedRelation: "companies"
            referencedColumns: ["id"]
          },
        ]
      }
      notifications: {
        Row: {
          created_at: string
          id: string
          link: string
          message: string
          read: boolean | null
          title: string
          type: string
          updated_at: string
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          link: string
          message: string
          read?: boolean | null
          title: string
          type: string
          updated_at?: string
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          link?: string
          message?: string
          read?: boolean | null
          title?: string
          type?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      profile_views: {
        Row: {
          id: string
          profile_id: string | null
          viewed_at: string | null
          viewer_id: string | null
        }
        Insert: {
          id?: string
          profile_id?: string | null
          viewed_at?: string | null
          viewer_id?: string | null
        }
        Update: {
          id?: string
          profile_id?: string | null
          viewed_at?: string | null
          viewer_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "profile_views_profile_id_fkey"
            columns: ["profile_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "profile_views_viewer_id_fkey"
            columns: ["viewer_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      profiles: {
        Row: {
          about_me: string | null
          ausbildung_ende: string | null
          ausbildung_start: string | null
          ausbildungsberuf: string | null
          ausbildungsjahr: number | null
          avatar_url: string | null
          certifications: Json | null
          city: string | null
          created_at: string
          cv_url: string | null
          dsgvo_consent_at: string | null
          education: string | null
          email: string | null
          full_name: string | null
          id: string
          industry: Database["public"]["Enums"]["industry_type"] | null
          industry_interest: string | null
          language_skills: Json | null
          location: string | null
          occupation: string | null
          phone: string | null
          postal_code: string | null
          preparation_level:
            | Database["public"]["Enums"]["preparation_level"]
            | null
          profile_views: number | null
          school_id: string | null
          skills: string[] | null
          state_id: number | null
          updated_at: string
          user_type: string | null
          username: string | null
        }
        Insert: {
          about_me?: string | null
          ausbildung_ende?: string | null
          ausbildung_start?: string | null
          ausbildungsberuf?: string | null
          ausbildungsjahr?: number | null
          avatar_url?: string | null
          certifications?: Json | null
          city?: string | null
          created_at?: string
          cv_url?: string | null
          dsgvo_consent_at?: string | null
          education?: string | null
          email?: string | null
          full_name?: string | null
          id: string
          industry?: Database["public"]["Enums"]["industry_type"] | null
          industry_interest?: string | null
          language_skills?: Json | null
          location?: string | null
          occupation?: string | null
          phone?: string | null
          postal_code?: string | null
          preparation_level?:
            | Database["public"]["Enums"]["preparation_level"]
            | null
          profile_views?: number | null
          school_id?: string | null
          skills?: string[] | null
          state_id?: number | null
          updated_at?: string
          user_type?: string | null
          username?: string | null
        }
        Update: {
          about_me?: string | null
          ausbildung_ende?: string | null
          ausbildung_start?: string | null
          ausbildungsberuf?: string | null
          ausbildungsjahr?: number | null
          avatar_url?: string | null
          certifications?: Json | null
          city?: string | null
          created_at?: string
          cv_url?: string | null
          dsgvo_consent_at?: string | null
          education?: string | null
          email?: string | null
          full_name?: string | null
          id?: string
          industry?: Database["public"]["Enums"]["industry_type"] | null
          industry_interest?: string | null
          language_skills?: Json | null
          location?: string | null
          occupation?: string | null
          phone?: string | null
          postal_code?: string | null
          preparation_level?:
            | Database["public"]["Enums"]["preparation_level"]
            | null
          profile_views?: number | null
          school_id?: string | null
          skills?: string[] | null
          state_id?: number | null
          updated_at?: string
          user_type?: string | null
          username?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "profiles_school_id_fkey"
            columns: ["school_id"]
            isOneToOne: false
            referencedRelation: "schools"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "profiles_state_id_fkey"
            columns: ["state_id"]
            isOneToOne: false
            referencedRelation: "states"
            referencedColumns: ["id"]
          },
        ]
      }
      resume_entries: {
        Row: {
          company_name: string
          created_at: string | null
          description: string | null
          end_date: string | null
          id: string
          position: string
          start_date: string
          type: string
          updated_at: string | null
          user_id: string | null
        }
        Insert: {
          company_name: string
          created_at?: string | null
          description?: string | null
          end_date?: string | null
          id?: string
          position: string
          start_date: string
          type: string
          updated_at?: string | null
          user_id?: string | null
        }
        Update: {
          company_name?: string
          created_at?: string | null
          description?: string | null
          end_date?: string | null
          id?: string
          position?: string
          start_date?: string
          type?: string
          updated_at?: string | null
          user_id?: string | null
        }
        Relationships: []
      }
      schools: {
        Row: {
          city: string | null
          created_at: string
          id: string
          name: string
          postal_code: string | null
          state_id: number
          type: string | null
          updated_at: string
        }
        Insert: {
          city?: string | null
          created_at?: string
          id?: string
          name: string
          postal_code?: string | null
          state_id: number
          type?: string | null
          updated_at?: string
        }
        Update: {
          city?: string | null
          created_at?: string
          id?: string
          name?: string
          postal_code?: string | null
          state_id?: number
          type?: string | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "schools_state_id_fkey"
            columns: ["state_id"]
            isOneToOne: false
            referencedRelation: "states"
            referencedColumns: ["id"]
          },
        ]
      }
      sessions: {
        Row: {
          created_at: string
          device_info: Json | null
          expires_at: string
          id: string
          ip_address: string | null
          last_activity_at: string
          refresh_token: string
          user_id: string
        }
        Insert: {
          created_at?: string
          device_info?: Json | null
          expires_at: string
          id?: string
          ip_address?: string | null
          last_activity_at?: string
          refresh_token: string
          user_id: string
        }
        Update: {
          created_at?: string
          device_info?: Json | null
          expires_at?: string
          id?: string
          ip_address?: string | null
          last_activity_at?: string
          refresh_token?: string
          user_id?: string
        }
        Relationships: []
      }
      states: {
        Row: {
          code: string
          id: number
          name: string
        }
        Insert: {
          code: string
          id?: number
          name: string
        }
        Update: {
          code?: string
          id?: number
          name?: string
        }
        Relationships: []
      }
      tasks: {
        Row: {
          ai_feedback: Json | null
          chapter_id: string
          content: Json
          created_at: string | null
          description: string
          id: string
          metrics: Json | null
          minimum_time: number
          order_index: number
          required_time_seconds: number | null
          task_type: Database["public"]["Enums"]["task_type"]
          title: string
        }
        Insert: {
          ai_feedback?: Json | null
          chapter_id: string
          content?: Json
          created_at?: string | null
          description: string
          id?: string
          metrics?: Json | null
          minimum_time: number
          order_index: number
          required_time_seconds?: number | null
          task_type: Database["public"]["Enums"]["task_type"]
          title: string
        }
        Update: {
          ai_feedback?: Json | null
          chapter_id?: string
          content?: Json
          created_at?: string | null
          description?: string
          id?: string
          metrics?: Json | null
          minimum_time?: number
          order_index?: number
          required_time_seconds?: number | null
          task_type?: Database["public"]["Enums"]["task_type"]
          title?: string
        }
        Relationships: [
          {
            foreignKeyName: "tasks_chapter_id_fkey"
            columns: ["chapter_id"]
            isOneToOne: false
            referencedRelation: "chapters"
            referencedColumns: ["id"]
          },
        ]
      }
      user_activity: {
        Row: {
          created_at: string | null
          id: string
          last_login: string | null
          last_page_visited: string | null
          updated_at: string | null
        }
        Insert: {
          created_at?: string | null
          id: string
          last_login?: string | null
          last_page_visited?: string | null
          updated_at?: string | null
        }
        Update: {
          created_at?: string | null
          id?: string
          last_login?: string | null
          last_page_visited?: string | null
          updated_at?: string | null
        }
        Relationships: []
      }
      user_preferences: {
        Row: {
          created_at: string
          id: string
          industry_preferences: string[] | null
          job_types: string[] | null
          maximum_salary: number | null
          minimum_salary: number | null
          preferred_locations: string[] | null
          remote_preference: string | null
          updated_at: string
          user_id: string | null
        }
        Insert: {
          created_at?: string
          id?: string
          industry_preferences?: string[] | null
          job_types?: string[] | null
          maximum_salary?: number | null
          minimum_salary?: number | null
          preferred_locations?: string[] | null
          remote_preference?: string | null
          updated_at?: string
          user_id?: string | null
        }
        Update: {
          created_at?: string
          id?: string
          industry_preferences?: string[] | null
          job_types?: string[] | null
          maximum_salary?: number | null
          minimum_salary?: number | null
          preferred_locations?: string[] | null
          remote_preference?: string | null
          updated_at?: string
          user_id?: string | null
        }
        Relationships: []
      }
      user_progress: {
        Row: {
          chapter_id: string
          completed_at: string | null
          created_at: string | null
          id: string
          last_accessed_at: string | null
          status: string
          task_id: string | null
          time_spent: number | null
          user_id: string
        }
        Insert: {
          chapter_id: string
          completed_at?: string | null
          created_at?: string | null
          id?: string
          last_accessed_at?: string | null
          status?: string
          task_id?: string | null
          time_spent?: number | null
          user_id: string
        }
        Update: {
          chapter_id?: string
          completed_at?: string | null
          created_at?: string | null
          id?: string
          last_accessed_at?: string | null
          status?: string
          task_id?: string | null
          time_spent?: number | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "user_progress_chapter_id_fkey"
            columns: ["chapter_id"]
            isOneToOne: false
            referencedRelation: "chapters"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "user_progress_task_id_fkey"
            columns: ["task_id"]
            isOneToOne: false
            referencedRelation: "tasks"
            referencedColumns: ["id"]
          },
        ]
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      cleanup_expired_sessions: {
        Args: Record<PropertyKey, never>
        Returns: undefined
      }
      gtrgm_compress: {
        Args: { "": unknown }
        Returns: unknown
      }
      gtrgm_decompress: {
        Args: { "": unknown }
        Returns: unknown
      }
      gtrgm_in: {
        Args: { "": unknown }
        Returns: unknown
      }
      gtrgm_options: {
        Args: { "": unknown }
        Returns: undefined
      }
      gtrgm_out: {
        Args: { "": unknown }
        Returns: unknown
      }
      set_limit: {
        Args: { "": number }
        Returns: number
      }
      show_limit: {
        Args: Record<PropertyKey, never>
        Returns: number
      }
      show_trgm: {
        Args: { "": string }
        Returns: string[]
      }
    }
    Enums: {
      application_status:
        | "applied"
        | "viewed"
        | "contacted"
        | "approved"
        | "interviewing"
        | "rejected"
        | "hired"
        | "accepted"
      badge_type: "completion" | "streak" | "skill" | "milestone"
      education_level:
        | "hauptschulabschluss"
        | "realschulabschluss"
        | "fachabitur"
        | "abitur"
        | "ausbildung"
        | "bachelor"
        | "master"
      industry_type:
        | "technology"
        | "healthcare"
        | "finance"
        | "education"
        | "retail"
        | "manufacturing"
        | "other"
      preparation_level: "beginner" | "intermediate" | "advanced"
      task_type: "video" | "voice_response" | "quiz" | "interactive" | "text"
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
      application_status: [
        "applied",
        "viewed",
        "contacted",
        "approved",
        "interviewing",
        "rejected",
        "hired",
        "accepted",
      ],
      badge_type: ["completion", "streak", "skill", "milestone"],
      education_level: [
        "hauptschulabschluss",
        "realschulabschluss",
        "fachabitur",
        "abitur",
        "ausbildung",
        "bachelor",
        "master",
      ],
      industry_type: [
        "technology",
        "healthcare",
        "finance",
        "education",
        "retail",
        "manufacturing",
        "other",
      ],
      preparation_level: ["beginner", "intermediate", "advanced"],
      task_type: ["video", "voice_response", "quiz", "interactive", "text"],
    },
  },
} as const
