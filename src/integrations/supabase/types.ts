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
    PostgrestVersion: "12.2.12 (cd3cf9e)"
  }
  public: {
    Tables: {
      analytics_events: {
        Row: {
          button_label: string | null
          button_type: string | null
          created_at: string
          event_name: string
          event_type: string
          id: string
          metadata: Json | null
          page_path: string | null
          page_url: string | null
          referrer: string | null
          session_id: string | null
          user_agent: string | null
        }
        Insert: {
          button_label?: string | null
          button_type?: string | null
          created_at?: string
          event_name: string
          event_type: string
          id?: string
          metadata?: Json | null
          page_path?: string | null
          page_url?: string | null
          referrer?: string | null
          session_id?: string | null
          user_agent?: string | null
        }
        Update: {
          button_label?: string | null
          button_type?: string | null
          created_at?: string
          event_name?: string
          event_type?: string
          id?: string
          metadata?: Json | null
          page_path?: string | null
          page_url?: string | null
          referrer?: string | null
          session_id?: string | null
          user_agent?: string | null
        }
        Relationships: []
      }
      annotations: {
        Row: {
          anchor: Json
          author_id: string | null
          created_at: string
          file_id: string
          id: string
          note: string | null
          page_id: string
          quote: string | null
          visibility: string
        }
        Insert: {
          anchor: Json
          author_id?: string | null
          created_at?: string
          file_id: string
          id?: string
          note?: string | null
          page_id: string
          quote?: string | null
          visibility?: string
        }
        Update: {
          anchor?: Json
          author_id?: string | null
          created_at?: string
          file_id?: string
          id?: string
          note?: string | null
          page_id?: string
          quote?: string | null
          visibility?: string
        }
        Relationships: [
          {
            foreignKeyName: "annotations_file_id_fkey"
            columns: ["file_id"]
            isOneToOne: false
            referencedRelation: "files"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "annotations_page_id_fkey"
            columns: ["page_id"]
            isOneToOne: false
            referencedRelation: "file_pages"
            referencedColumns: ["id"]
          },
        ]
      }
      answers: {
        Row: {
          author_id: string | null
          body: string
          created_at: string
          id: string
          is_accepted: boolean
          question_id: string
          updated_at: string
        }
        Insert: {
          author_id?: string | null
          body: string
          created_at?: string
          id?: string
          is_accepted?: boolean
          question_id: string
          updated_at?: string
        }
        Update: {
          author_id?: string | null
          body?: string
          created_at?: string
          id?: string
          is_accepted?: boolean
          question_id?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "answers_question_id_fkey"
            columns: ["question_id"]
            isOneToOne: false
            referencedRelation: "questions"
            referencedColumns: ["id"]
          },
        ]
      }
      app_settings: {
        Row: {
          id: boolean
          require_password_after_verify: boolean
        }
        Insert: {
          id?: boolean
          require_password_after_verify?: boolean
        }
        Update: {
          id?: boolean
          require_password_after_verify?: boolean
        }
        Relationships: []
      }
      application_events: {
        Row: {
          actor_id: string | null
          application_id: string
          created_at: string
          id: number
          payload: Json | null
          type: string
        }
        Insert: {
          actor_id?: string | null
          application_id: string
          created_at?: string
          id?: number
          payload?: Json | null
          type: string
        }
        Update: {
          actor_id?: string | null
          application_id?: string
          created_at?: string
          id?: number
          payload?: Json | null
          type?: string
        }
        Relationships: [
          {
            foreignKeyName: "application_events_application_id_fkey"
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
          candidate_id: string
          company_id: string
          cover_letter: string | null
          created_at: string
          id: string
          job_id: string
          job_post_id: string | null
          portfolio_url: string | null
          resume_url: string | null
          source: string
          stage: string
          status: string | null
          unread: boolean
          updated_at: string
          user_id: string | null
          viewed_by_company: boolean | null
        }
        Insert: {
          applied_at?: string | null
          candidate_id: string
          company_id: string
          cover_letter?: string | null
          created_at?: string
          id?: string
          job_id: string
          job_post_id?: string | null
          portfolio_url?: string | null
          resume_url?: string | null
          source?: string
          stage?: string
          status?: string | null
          unread?: boolean
          updated_at?: string
          user_id?: string | null
          viewed_by_company?: boolean | null
        }
        Update: {
          applied_at?: string | null
          candidate_id?: string
          company_id?: string
          cover_letter?: string | null
          created_at?: string
          id?: string
          job_id?: string
          job_post_id?: string | null
          portfolio_url?: string | null
          resume_url?: string | null
          source?: string
          stage?: string
          status?: string | null
          unread?: boolean
          updated_at?: string
          user_id?: string | null
          viewed_by_company?: boolean | null
        }
        Relationships: [
          {
            foreignKeyName: "applications_candidate_id_fkey"
            columns: ["candidate_id"]
            isOneToOne: false
            referencedRelation: "candidates"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "applications_company_id_fkey"
            columns: ["company_id"]
            isOneToOne: false
            referencedRelation: "companies"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "applications_company_id_fkey"
            columns: ["company_id"]
            isOneToOne: false
            referencedRelation: "companies_public_secure"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "applications_company_id_fkey"
            columns: ["company_id"]
            isOneToOne: false
            referencedRelation: "company_need_quota"
            referencedColumns: ["company_id"]
          },
          {
            foreignKeyName: "applications_company_id_fkey"
            columns: ["company_id"]
            isOneToOne: false
            referencedRelation: "company_unlock_stats"
            referencedColumns: ["company_id"]
          },
          {
            foreignKeyName: "applications_company_id_fkey"
            columns: ["company_id"]
            isOneToOne: false
            referencedRelation: "v_company_profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "applications_job_id_fkey"
            columns: ["job_id"]
            isOneToOne: false
            referencedRelation: "job_posts"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "applications_job_id_fkey"
            columns: ["job_id"]
            isOneToOne: false
            referencedRelation: "public_job_listings"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "applications_job_post_id_fkey"
            columns: ["job_post_id"]
            isOneToOne: false
            referencedRelation: "job_posts"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "applications_job_post_id_fkey"
            columns: ["job_post_id"]
            isOneToOne: false
            referencedRelation: "public_job_listings"
            referencedColumns: ["id"]
          },
        ]
      }
      billing_events: {
        Row: {
          created_at: string
          event_type: string
          id: string
          org_id: string | null
          payload: Json
        }
        Insert: {
          created_at?: string
          event_type: string
          id?: string
          org_id?: string | null
          payload?: Json
        }
        Update: {
          created_at?: string
          event_type?: string
          id?: string
          org_id?: string | null
          payload?: Json
        }
        Relationships: [
          {
            foreignKeyName: "billing_events_org_id_fkey"
            columns: ["org_id"]
            isOneToOne: false
            referencedRelation: "companies"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "billing_events_org_id_fkey"
            columns: ["org_id"]
            isOneToOne: false
            referencedRelation: "companies_public_secure"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "billing_events_org_id_fkey"
            columns: ["org_id"]
            isOneToOne: false
            referencedRelation: "company_need_quota"
            referencedColumns: ["company_id"]
          },
          {
            foreignKeyName: "billing_events_org_id_fkey"
            columns: ["org_id"]
            isOneToOne: false
            referencedRelation: "company_unlock_stats"
            referencedColumns: ["company_id"]
          },
          {
            foreignKeyName: "billing_events_org_id_fkey"
            columns: ["org_id"]
            isOneToOne: false
            referencedRelation: "v_company_profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      blocks: {
        Row: {
          blocked_id: string
          blocker_id: string
          created_at: string
        }
        Insert: {
          blocked_id: string
          blocker_id: string
          created_at?: string
        }
        Update: {
          blocked_id?: string
          blocker_id?: string
          created_at?: string
        }
        Relationships: []
      }
      candidate_contacts: {
        Row: {
          candidate_id: string
          channel: string
          company_id: string
          created_at: string
          created_by: string
          id: string
          outcome: string | null
        }
        Insert: {
          candidate_id: string
          channel: string
          company_id: string
          created_at?: string
          created_by: string
          id?: string
          outcome?: string | null
        }
        Update: {
          candidate_id?: string
          channel?: string
          company_id?: string
          created_at?: string
          created_by?: string
          id?: string
          outcome?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "fk_candidate_contacts_company"
            columns: ["company_id"]
            isOneToOne: false
            referencedRelation: "companies"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "fk_candidate_contacts_company"
            columns: ["company_id"]
            isOneToOne: false
            referencedRelation: "companies_public_secure"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "fk_candidate_contacts_company"
            columns: ["company_id"]
            isOneToOne: false
            referencedRelation: "company_need_quota"
            referencedColumns: ["company_id"]
          },
          {
            foreignKeyName: "fk_candidate_contacts_company"
            columns: ["company_id"]
            isOneToOne: false
            referencedRelation: "company_unlock_stats"
            referencedColumns: ["company_id"]
          },
          {
            foreignKeyName: "fk_candidate_contacts_company"
            columns: ["company_id"]
            isOneToOne: false
            referencedRelation: "v_company_profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "fk_candidate_contacts_profile"
            columns: ["candidate_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "fk_candidate_contacts_profile"
            columns: ["candidate_id"]
            isOneToOne: false
            referencedRelation: "profiles_public"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "fk_candidate_contacts_profile"
            columns: ["candidate_id"]
            isOneToOne: false
            referencedRelation: "profiles_public_secure"
            referencedColumns: ["id"]
          },
        ]
      }
      candidate_languages: {
        Row: {
          candidate_id: string
          created_at: string | null
          id: string
          language: string
          level: string
        }
        Insert: {
          candidate_id: string
          created_at?: string | null
          id?: string
          language: string
          level: string
        }
        Update: {
          candidate_id?: string
          created_at?: string | null
          id?: string
          language?: string
          level?: string
        }
        Relationships: [
          {
            foreignKeyName: "candidate_languages_candidate_id_fkey"
            columns: ["candidate_id"]
            isOneToOne: false
            referencedRelation: "candidate_profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      candidate_licenses: {
        Row: {
          candidate_id: string
          created_at: string | null
          id: string
          license: string
          obtained_at: string | null
        }
        Insert: {
          candidate_id: string
          created_at?: string | null
          id?: string
          license: string
          obtained_at?: string | null
        }
        Update: {
          candidate_id?: string
          created_at?: string | null
          id?: string
          license?: string
          obtained_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "candidate_licenses_candidate_id_fkey"
            columns: ["candidate_id"]
            isOneToOne: false
            referencedRelation: "candidate_profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      candidate_match_cache: {
        Row: {
          candidate_id: string
          created_at: string
          explanation: Json | null
          id: string
          is_explore: boolean | null
          job_id: string
          rank: number | null
          score: number
          updated_at: string
        }
        Insert: {
          candidate_id: string
          created_at?: string
          explanation?: Json | null
          id?: string
          is_explore?: boolean | null
          job_id: string
          rank?: number | null
          score: number
          updated_at?: string
        }
        Update: {
          candidate_id?: string
          created_at?: string
          explanation?: Json | null
          id?: string
          is_explore?: boolean | null
          job_id?: string
          rank?: number | null
          score?: number
          updated_at?: string
        }
        Relationships: []
      }
      candidate_notes: {
        Row: {
          body: string
          candidate_id: string
          company_id: string
          created_at: string
          created_by: string
          id: string
          updated_at: string
        }
        Insert: {
          body: string
          candidate_id: string
          company_id: string
          created_at?: string
          created_by: string
          id?: string
          updated_at?: string
        }
        Update: {
          body?: string
          candidate_id?: string
          company_id?: string
          created_at?: string
          created_by?: string
          id?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "fk_candidate_notes_company"
            columns: ["company_id"]
            isOneToOne: false
            referencedRelation: "companies"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "fk_candidate_notes_company"
            columns: ["company_id"]
            isOneToOne: false
            referencedRelation: "companies_public_secure"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "fk_candidate_notes_company"
            columns: ["company_id"]
            isOneToOne: false
            referencedRelation: "company_need_quota"
            referencedColumns: ["company_id"]
          },
          {
            foreignKeyName: "fk_candidate_notes_company"
            columns: ["company_id"]
            isOneToOne: false
            referencedRelation: "company_unlock_stats"
            referencedColumns: ["company_id"]
          },
          {
            foreignKeyName: "fk_candidate_notes_company"
            columns: ["company_id"]
            isOneToOne: false
            referencedRelation: "v_company_profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "fk_candidate_notes_profile"
            columns: ["candidate_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "fk_candidate_notes_profile"
            columns: ["candidate_id"]
            isOneToOne: false
            referencedRelation: "profiles_public"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "fk_candidate_notes_profile"
            columns: ["candidate_id"]
            isOneToOne: false
            referencedRelation: "profiles_public_secure"
            referencedColumns: ["id"]
          },
        ]
      }
      candidate_profiles: {
        Row: {
          availability_date: string | null
          created_at: string | null
          id: string
          location_geog: unknown | null
          profession_id: string | null
          seniority: string | null
          target_groups: string[] | null
          updated_at: string | null
          user_id: string | null
        }
        Insert: {
          availability_date?: string | null
          created_at?: string | null
          id?: string
          location_geog?: unknown | null
          profession_id?: string | null
          seniority?: string | null
          target_groups?: string[] | null
          updated_at?: string | null
          user_id?: string | null
        }
        Update: {
          availability_date?: string | null
          created_at?: string | null
          id?: string
          location_geog?: unknown | null
          profession_id?: string | null
          seniority?: string | null
          target_groups?: string[] | null
          updated_at?: string | null
          user_id?: string | null
        }
        Relationships: []
      }
      candidate_skills: {
        Row: {
          candidate_id: string
          created_at: string | null
          id: string
          level: string | null
          skill: string
        }
        Insert: {
          candidate_id: string
          created_at?: string | null
          id?: string
          level?: string | null
          skill: string
        }
        Update: {
          candidate_id?: string
          created_at?: string | null
          id?: string
          level?: string | null
          skill?: string
        }
        Relationships: [
          {
            foreignKeyName: "candidate_skills_candidate_id_fkey"
            columns: ["candidate_id"]
            isOneToOne: false
            referencedRelation: "candidate_profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      candidates: {
        Row: {
          availability_status: string | null
          bio: string | null
          bio_short: string | null
          certifications: string[] | null
          city: string | null
          company_id: string
          company_name: string | null
          country: string | null
          created_at: string
          cv_url: string | null
          education: string[] | null
          email: string | null
          experience_years: number | null
          full_name: string | null
          github_url: string | null
          id: string
          industry: string | null
          is_verified: boolean | null
          language_level: string | null
          languages: string[] | null
          linkedin_url: string | null
          location: string | null
          mutual_connections: number | null
          nachname: string | null
          phone: string | null
          portfolio_url: string | null
          preferred_work_type: string | null
          profile_image: string | null
          salary_expectation_max: number | null
          salary_expectation_min: number | null
          skills: string[] | null
          stage: string | null
          title: string | null
          user_id: string | null
          vorname: string | null
          website_url: string | null
        }
        Insert: {
          availability_status?: string | null
          bio?: string | null
          bio_short?: string | null
          certifications?: string[] | null
          city?: string | null
          company_id: string
          company_name?: string | null
          country?: string | null
          created_at?: string
          cv_url?: string | null
          education?: string[] | null
          email?: string | null
          experience_years?: number | null
          full_name?: string | null
          github_url?: string | null
          id?: string
          industry?: string | null
          is_verified?: boolean | null
          language_level?: string | null
          languages?: string[] | null
          linkedin_url?: string | null
          location?: string | null
          mutual_connections?: number | null
          nachname?: string | null
          phone?: string | null
          portfolio_url?: string | null
          preferred_work_type?: string | null
          profile_image?: string | null
          salary_expectation_max?: number | null
          salary_expectation_min?: number | null
          skills?: string[] | null
          stage?: string | null
          title?: string | null
          user_id?: string | null
          vorname?: string | null
          website_url?: string | null
        }
        Update: {
          availability_status?: string | null
          bio?: string | null
          bio_short?: string | null
          certifications?: string[] | null
          city?: string | null
          company_id?: string
          company_name?: string | null
          country?: string | null
          created_at?: string
          cv_url?: string | null
          education?: string[] | null
          email?: string | null
          experience_years?: number | null
          full_name?: string | null
          github_url?: string | null
          id?: string
          industry?: string | null
          is_verified?: boolean | null
          language_level?: string | null
          languages?: string[] | null
          linkedin_url?: string | null
          location?: string | null
          mutual_connections?: number | null
          nachname?: string | null
          phone?: string | null
          portfolio_url?: string | null
          preferred_work_type?: string | null
          profile_image?: string | null
          salary_expectation_max?: number | null
          salary_expectation_min?: number | null
          skills?: string[] | null
          stage?: string | null
          title?: string | null
          user_id?: string | null
          vorname?: string | null
          website_url?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "candidates_company_id_fkey"
            columns: ["company_id"]
            isOneToOne: false
            referencedRelation: "companies"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "candidates_company_id_fkey"
            columns: ["company_id"]
            isOneToOne: false
            referencedRelation: "companies_public_secure"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "candidates_company_id_fkey"
            columns: ["company_id"]
            isOneToOne: false
            referencedRelation: "company_need_quota"
            referencedColumns: ["company_id"]
          },
          {
            foreignKeyName: "candidates_company_id_fkey"
            columns: ["company_id"]
            isOneToOne: false
            referencedRelation: "company_unlock_stats"
            referencedColumns: ["company_id"]
          },
          {
            foreignKeyName: "candidates_company_id_fkey"
            columns: ["company_id"]
            isOneToOne: false
            referencedRelation: "v_company_profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      comment_likes: {
        Row: {
          comment_id: string
          created_at: string | null
          user_id: string
        }
        Insert: {
          comment_id: string
          created_at?: string | null
          user_id: string
        }
        Update: {
          comment_id?: string
          created_at?: string | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "comment_likes_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "comment_likes_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles_public"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "comment_likes_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles_public_secure"
            referencedColumns: ["id"]
          },
        ]
      }
      community_job_limits: {
        Row: {
          company_id: string
          job_id: string
          shares_used: number | null
          week_start: string
        }
        Insert: {
          company_id: string
          job_id: string
          shares_used?: number | null
          week_start: string
        }
        Update: {
          company_id?: string
          job_id?: string
          shares_used?: number | null
          week_start?: string
        }
        Relationships: [
          {
            foreignKeyName: "community_job_limits_company_id_fkey"
            columns: ["company_id"]
            isOneToOne: false
            referencedRelation: "companies"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "community_job_limits_company_id_fkey"
            columns: ["company_id"]
            isOneToOne: false
            referencedRelation: "companies_public_secure"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "community_job_limits_company_id_fkey"
            columns: ["company_id"]
            isOneToOne: false
            referencedRelation: "company_need_quota"
            referencedColumns: ["company_id"]
          },
          {
            foreignKeyName: "community_job_limits_company_id_fkey"
            columns: ["company_id"]
            isOneToOne: false
            referencedRelation: "company_unlock_stats"
            referencedColumns: ["company_id"]
          },
          {
            foreignKeyName: "community_job_limits_company_id_fkey"
            columns: ["company_id"]
            isOneToOne: false
            referencedRelation: "v_company_profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "community_job_limits_job_id_fkey"
            columns: ["job_id"]
            isOneToOne: false
            referencedRelation: "job_posts"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "community_job_limits_job_id_fkey"
            columns: ["job_id"]
            isOneToOne: false
            referencedRelation: "public_job_listings"
            referencedColumns: ["id"]
          },
        ]
      }
      community_posts_backup: {
        Row: {
          actor_company_id: string | null
          actor_user_id: string | null
          applies_enabled: boolean | null
          body_md: string | null
          comment_count: number | null
          created_at: string | null
          id: string | null
          job_id: string | null
          like_count: number | null
          media: Json | null
          post_kind: Database["public"]["Enums"]["post_kind"] | null
          scheduled_at: string | null
          share_count: number | null
          status: string | null
          updated_at: string | null
          visibility: Database["public"]["Enums"]["post_visibility"] | null
        }
        Insert: {
          actor_company_id?: string | null
          actor_user_id?: string | null
          applies_enabled?: boolean | null
          body_md?: string | null
          comment_count?: number | null
          created_at?: string | null
          id?: string | null
          job_id?: string | null
          like_count?: number | null
          media?: Json | null
          post_kind?: Database["public"]["Enums"]["post_kind"] | null
          scheduled_at?: string | null
          share_count?: number | null
          status?: string | null
          updated_at?: string | null
          visibility?: Database["public"]["Enums"]["post_visibility"] | null
        }
        Update: {
          actor_company_id?: string | null
          actor_user_id?: string | null
          applies_enabled?: boolean | null
          body_md?: string | null
          comment_count?: number | null
          created_at?: string | null
          id?: string | null
          job_id?: string | null
          like_count?: number | null
          media?: Json | null
          post_kind?: Database["public"]["Enums"]["post_kind"] | null
          scheduled_at?: string | null
          share_count?: number | null
          status?: string | null
          updated_at?: string | null
          visibility?: Database["public"]["Enums"]["post_visibility"] | null
        }
        Relationships: []
      }
      community_preferences: {
        Row: {
          blocked_ids: string[] | null
          created_at: string | null
          muted_company_ids: string[] | null
          muted_user_ids: string[] | null
          origin_filter: string | null
          radius_km: number | null
          show_company_posts: boolean | null
          show_job_shares: boolean | null
          show_user_posts: boolean | null
          updated_at: string | null
          user_id: string
        }
        Insert: {
          blocked_ids?: string[] | null
          created_at?: string | null
          muted_company_ids?: string[] | null
          muted_user_ids?: string[] | null
          origin_filter?: string | null
          radius_km?: number | null
          show_company_posts?: boolean | null
          show_job_shares?: boolean | null
          show_user_posts?: boolean | null
          updated_at?: string | null
          user_id: string
        }
        Update: {
          blocked_ids?: string[] | null
          created_at?: string | null
          muted_company_ids?: string[] | null
          muted_user_ids?: string[] | null
          origin_filter?: string | null
          radius_km?: number | null
          show_company_posts?: boolean | null
          show_job_shares?: boolean | null
          show_user_posts?: boolean | null
          updated_at?: string | null
          user_id?: string
        }
        Relationships: []
      }
      companies: {
        Row: {
          account_status: string
          active_tokens: number | null
          additional_locations: Json | null
          contact_person: string | null
          contact_position: string | null
          country: string | null
          created_at: string | null
          current_plan_id: string | null
          description: string | null
          employee_count: number | null
          employer_profile: boolean | null
          founded_year: number | null
          frozen_at: string | null
          frozen_reason: string | null
          header_image: string | null
          id: string
          industry: string | null
          instagram_url: string | null
          linkedin_url: string | null
          location: string | null
          location_id: number | null
          location_radius_km: number | null
          logo_url: string | null
          main_location: string | null
          matching_about: string | null
          matching_benefits_text: string | null
          matching_must_text: string | null
          matching_nice_text: string | null
          mission_statement: string | null
          name: string
          need_credits: number | null
          onboarding_checklist: Json | null
          onboarding_completed: boolean | null
          onboarding_step: number | null
          package_id: string | null
          phone: string | null
          plan: Database["public"]["Enums"]["plan_code"] | null
          plan_status: string | null
          plan_type: string | null
          primary_email: string | null
          seats: number | null
          selected_plan_id: string | null
          size_range: string | null
          stripe_customer_id: string | null
          subscription_status: string | null
          target_groups: Json | null
          token_balance: number | null
          updated_at: string | null
          website_url: string | null
        }
        Insert: {
          account_status?: string
          active_tokens?: number | null
          additional_locations?: Json | null
          contact_person?: string | null
          contact_position?: string | null
          country?: string | null
          created_at?: string | null
          current_plan_id?: string | null
          description?: string | null
          employee_count?: number | null
          employer_profile?: boolean | null
          founded_year?: number | null
          frozen_at?: string | null
          frozen_reason?: string | null
          header_image?: string | null
          id?: string
          industry?: string | null
          instagram_url?: string | null
          linkedin_url?: string | null
          location?: string | null
          location_id?: number | null
          location_radius_km?: number | null
          logo_url?: string | null
          main_location?: string | null
          matching_about?: string | null
          matching_benefits_text?: string | null
          matching_must_text?: string | null
          matching_nice_text?: string | null
          mission_statement?: string | null
          name: string
          need_credits?: number | null
          onboarding_checklist?: Json | null
          onboarding_completed?: boolean | null
          onboarding_step?: number | null
          package_id?: string | null
          phone?: string | null
          plan?: Database["public"]["Enums"]["plan_code"] | null
          plan_status?: string | null
          plan_type?: string | null
          primary_email?: string | null
          seats?: number | null
          selected_plan_id?: string | null
          size_range?: string | null
          stripe_customer_id?: string | null
          subscription_status?: string | null
          target_groups?: Json | null
          token_balance?: number | null
          updated_at?: string | null
          website_url?: string | null
        }
        Update: {
          account_status?: string
          active_tokens?: number | null
          additional_locations?: Json | null
          contact_person?: string | null
          contact_position?: string | null
          country?: string | null
          created_at?: string | null
          current_plan_id?: string | null
          description?: string | null
          employee_count?: number | null
          employer_profile?: boolean | null
          founded_year?: number | null
          frozen_at?: string | null
          frozen_reason?: string | null
          header_image?: string | null
          id?: string
          industry?: string | null
          instagram_url?: string | null
          linkedin_url?: string | null
          location?: string | null
          location_id?: number | null
          location_radius_km?: number | null
          logo_url?: string | null
          main_location?: string | null
          matching_about?: string | null
          matching_benefits_text?: string | null
          matching_must_text?: string | null
          matching_nice_text?: string | null
          mission_statement?: string | null
          name?: string
          need_credits?: number | null
          onboarding_checklist?: Json | null
          onboarding_completed?: boolean | null
          onboarding_step?: number | null
          package_id?: string | null
          phone?: string | null
          plan?: Database["public"]["Enums"]["plan_code"] | null
          plan_status?: string | null
          plan_type?: string | null
          primary_email?: string | null
          seats?: number | null
          selected_plan_id?: string | null
          size_range?: string | null
          stripe_customer_id?: string | null
          subscription_status?: string | null
          target_groups?: Json | null
          token_balance?: number | null
          updated_at?: string | null
          website_url?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "companies_location_id_fkey"
            columns: ["location_id"]
            isOneToOne: false
            referencedRelation: "locations"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "companies_package_id_fkey"
            columns: ["package_id"]
            isOneToOne: false
            referencedRelation: "company_packages"
            referencedColumns: ["id"]
          },
        ]
      }
      company_activity: {
        Row: {
          actor_user_id: string
          company_id: string
          created_at: string
          id: string
          payload: Json
          type: string
        }
        Insert: {
          actor_user_id: string
          company_id: string
          created_at?: string
          id?: string
          payload?: Json
          type: string
        }
        Update: {
          actor_user_id?: string
          company_id?: string
          created_at?: string
          id?: string
          payload?: Json
          type?: string
        }
        Relationships: [
          {
            foreignKeyName: "fk_company_activity_company"
            columns: ["company_id"]
            isOneToOne: false
            referencedRelation: "companies"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "fk_company_activity_company"
            columns: ["company_id"]
            isOneToOne: false
            referencedRelation: "companies_public_secure"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "fk_company_activity_company"
            columns: ["company_id"]
            isOneToOne: false
            referencedRelation: "company_need_quota"
            referencedColumns: ["company_id"]
          },
          {
            foreignKeyName: "fk_company_activity_company"
            columns: ["company_id"]
            isOneToOne: false
            referencedRelation: "company_unlock_stats"
            referencedColumns: ["company_id"]
          },
          {
            foreignKeyName: "fk_company_activity_company"
            columns: ["company_id"]
            isOneToOne: false
            referencedRelation: "v_company_profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      company_candidates: {
        Row: {
          candidate_id: string
          company_id: string
          created_at: string
          id: string
          last_touched_at: string | null
          match_score: number | null
          next_action_at: string | null
          next_action_note: string | null
          owner_user_id: string | null
          source: string | null
          source_need_id: string | null
          stage: string
          unlocked_at: string | null
          unlocked_by_user_id: string | null
          updated_at: string
        }
        Insert: {
          candidate_id: string
          company_id: string
          created_at?: string
          id?: string
          last_touched_at?: string | null
          match_score?: number | null
          next_action_at?: string | null
          next_action_note?: string | null
          owner_user_id?: string | null
          source?: string | null
          source_need_id?: string | null
          stage?: string
          unlocked_at?: string | null
          unlocked_by_user_id?: string | null
          updated_at?: string
        }
        Update: {
          candidate_id?: string
          company_id?: string
          created_at?: string
          id?: string
          last_touched_at?: string | null
          match_score?: number | null
          next_action_at?: string | null
          next_action_note?: string | null
          owner_user_id?: string | null
          source?: string | null
          source_need_id?: string | null
          stage?: string
          unlocked_at?: string | null
          unlocked_by_user_id?: string | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "company_candidates_source_need_id_fkey"
            columns: ["source_need_id"]
            isOneToOne: false
            referencedRelation: "company_needs"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "fk_company_candidates_company"
            columns: ["company_id"]
            isOneToOne: false
            referencedRelation: "companies"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "fk_company_candidates_company"
            columns: ["company_id"]
            isOneToOne: false
            referencedRelation: "companies_public_secure"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "fk_company_candidates_company"
            columns: ["company_id"]
            isOneToOne: false
            referencedRelation: "company_need_quota"
            referencedColumns: ["company_id"]
          },
          {
            foreignKeyName: "fk_company_candidates_company"
            columns: ["company_id"]
            isOneToOne: false
            referencedRelation: "company_unlock_stats"
            referencedColumns: ["company_id"]
          },
          {
            foreignKeyName: "fk_company_candidates_company"
            columns: ["company_id"]
            isOneToOne: false
            referencedRelation: "v_company_profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "fk_company_candidates_profile"
            columns: ["candidate_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "fk_company_candidates_profile"
            columns: ["candidate_id"]
            isOneToOne: false
            referencedRelation: "profiles_public"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "fk_company_candidates_profile"
            columns: ["candidate_id"]
            isOneToOne: false
            referencedRelation: "profiles_public_secure"
            referencedColumns: ["id"]
          },
        ]
      }
      company_employment_requests: {
        Row: {
          company_id: string
          confirmed_by: string | null
          created_at: string
          id: string
          status: string
          user_id: string
        }
        Insert: {
          company_id: string
          confirmed_by?: string | null
          created_at?: string
          id?: string
          status?: string
          user_id: string
        }
        Update: {
          company_id?: string
          confirmed_by?: string | null
          created_at?: string
          id?: string
          status?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "company_employment_requests_company_id_fkey"
            columns: ["company_id"]
            isOneToOne: false
            referencedRelation: "companies"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "company_employment_requests_company_id_fkey"
            columns: ["company_id"]
            isOneToOne: false
            referencedRelation: "companies_public_secure"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "company_employment_requests_company_id_fkey"
            columns: ["company_id"]
            isOneToOne: false
            referencedRelation: "company_need_quota"
            referencedColumns: ["company_id"]
          },
          {
            foreignKeyName: "company_employment_requests_company_id_fkey"
            columns: ["company_id"]
            isOneToOne: false
            referencedRelation: "company_unlock_stats"
            referencedColumns: ["company_id"]
          },
          {
            foreignKeyName: "company_employment_requests_company_id_fkey"
            columns: ["company_id"]
            isOneToOne: false
            referencedRelation: "v_company_profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "company_employment_requests_confirmed_by_fkey"
            columns: ["confirmed_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "company_employment_requests_confirmed_by_fkey"
            columns: ["confirmed_by"]
            isOneToOne: false
            referencedRelation: "profiles_public"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "company_employment_requests_confirmed_by_fkey"
            columns: ["confirmed_by"]
            isOneToOne: false
            referencedRelation: "profiles_public_secure"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "company_employment_requests_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "company_employment_requests_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles_public"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "company_employment_requests_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles_public_secure"
            referencedColumns: ["id"]
          },
        ]
      }
      company_follow_prefs: {
        Row: {
          bell: string
          company_id: string
          created_at: string
          id: string
          profile_id: string
          updated_at: string
        }
        Insert: {
          bell?: string
          company_id: string
          created_at?: string
          id?: string
          profile_id: string
          updated_at?: string
        }
        Update: {
          bell?: string
          company_id?: string
          created_at?: string
          id?: string
          profile_id?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "company_follow_prefs_company_id_fkey"
            columns: ["company_id"]
            isOneToOne: false
            referencedRelation: "companies"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "company_follow_prefs_company_id_fkey"
            columns: ["company_id"]
            isOneToOne: false
            referencedRelation: "companies_public_secure"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "company_follow_prefs_company_id_fkey"
            columns: ["company_id"]
            isOneToOne: false
            referencedRelation: "company_need_quota"
            referencedColumns: ["company_id"]
          },
          {
            foreignKeyName: "company_follow_prefs_company_id_fkey"
            columns: ["company_id"]
            isOneToOne: false
            referencedRelation: "company_unlock_stats"
            referencedColumns: ["company_id"]
          },
          {
            foreignKeyName: "company_follow_prefs_company_id_fkey"
            columns: ["company_id"]
            isOneToOne: false
            referencedRelation: "v_company_profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "company_follow_prefs_profile_id_fkey"
            columns: ["profile_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "company_follow_prefs_profile_id_fkey"
            columns: ["profile_id"]
            isOneToOne: false
            referencedRelation: "profiles_public"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "company_follow_prefs_profile_id_fkey"
            columns: ["profile_id"]
            isOneToOne: false
            referencedRelation: "profiles_public_secure"
            referencedColumns: ["id"]
          },
        ]
      }
      company_needs: {
        Row: {
          company_id: string
          created_at: string | null
          employment_type: string
          id: string
          location_geog: unknown | null
          name: string
          profession_id: string | null
          radius_km: number
          seniority: string | null
          start_date: string | null
          updated_at: string | null
          visibility: string
        }
        Insert: {
          company_id: string
          created_at?: string | null
          employment_type?: string
          id?: string
          location_geog?: unknown | null
          name: string
          profession_id?: string | null
          radius_km?: number
          seniority?: string | null
          start_date?: string | null
          updated_at?: string | null
          visibility?: string
        }
        Update: {
          company_id?: string
          created_at?: string | null
          employment_type?: string
          id?: string
          location_geog?: unknown | null
          name?: string
          profession_id?: string | null
          radius_km?: number
          seniority?: string | null
          start_date?: string | null
          updated_at?: string | null
          visibility?: string
        }
        Relationships: [
          {
            foreignKeyName: "company_needs_company_id_fkey"
            columns: ["company_id"]
            isOneToOne: false
            referencedRelation: "companies"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "company_needs_company_id_fkey"
            columns: ["company_id"]
            isOneToOne: false
            referencedRelation: "companies_public_secure"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "company_needs_company_id_fkey"
            columns: ["company_id"]
            isOneToOne: false
            referencedRelation: "company_need_quota"
            referencedColumns: ["company_id"]
          },
          {
            foreignKeyName: "company_needs_company_id_fkey"
            columns: ["company_id"]
            isOneToOne: false
            referencedRelation: "company_unlock_stats"
            referencedColumns: ["company_id"]
          },
          {
            foreignKeyName: "company_needs_company_id_fkey"
            columns: ["company_id"]
            isOneToOne: false
            referencedRelation: "v_company_profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      company_notes: {
        Row: {
          admin_id: string
          company_id: string
          created_at: string
          id: string
          note: string
          updated_at: string
        }
        Insert: {
          admin_id: string
          company_id: string
          created_at?: string
          id?: string
          note: string
          updated_at?: string
        }
        Update: {
          admin_id?: string
          company_id?: string
          created_at?: string
          id?: string
          note?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "company_notes_company_id_fkey"
            columns: ["company_id"]
            isOneToOne: false
            referencedRelation: "companies"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "company_notes_company_id_fkey"
            columns: ["company_id"]
            isOneToOne: false
            referencedRelation: "companies_public_secure"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "company_notes_company_id_fkey"
            columns: ["company_id"]
            isOneToOne: false
            referencedRelation: "company_need_quota"
            referencedColumns: ["company_id"]
          },
          {
            foreignKeyName: "company_notes_company_id_fkey"
            columns: ["company_id"]
            isOneToOne: false
            referencedRelation: "company_unlock_stats"
            referencedColumns: ["company_id"]
          },
          {
            foreignKeyName: "company_notes_company_id_fkey"
            columns: ["company_id"]
            isOneToOne: false
            referencedRelation: "v_company_profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      company_packages: {
        Row: {
          active: boolean
          code: string
          created_at: string | null
          extra_need_price_cents: number
          id: string
          included_needs: number
          monthly_price_cents: number
          name: string
        }
        Insert: {
          active?: boolean
          code: string
          created_at?: string | null
          extra_need_price_cents?: number
          id: string
          included_needs?: number
          monthly_price_cents?: number
          name: string
        }
        Update: {
          active?: boolean
          code?: string
          created_at?: string | null
          extra_need_price_cents?: number
          id?: string
          included_needs?: number
          monthly_price_cents?: number
          name?: string
        }
        Relationships: []
      }
      company_pipelines: {
        Row: {
          company_id: string
          created_at: string | null
          id: string
          name: string
        }
        Insert: {
          company_id: string
          created_at?: string | null
          id?: string
          name?: string
        }
        Update: {
          company_id?: string
          created_at?: string | null
          id?: string
          name?: string
        }
        Relationships: [
          {
            foreignKeyName: "company_pipelines_company_id_fkey"
            columns: ["company_id"]
            isOneToOne: true
            referencedRelation: "companies"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "company_pipelines_company_id_fkey"
            columns: ["company_id"]
            isOneToOne: true
            referencedRelation: "companies_public_secure"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "company_pipelines_company_id_fkey"
            columns: ["company_id"]
            isOneToOne: true
            referencedRelation: "company_need_quota"
            referencedColumns: ["company_id"]
          },
          {
            foreignKeyName: "company_pipelines_company_id_fkey"
            columns: ["company_id"]
            isOneToOne: true
            referencedRelation: "company_unlock_stats"
            referencedColumns: ["company_id"]
          },
          {
            foreignKeyName: "company_pipelines_company_id_fkey"
            columns: ["company_id"]
            isOneToOne: true
            referencedRelation: "v_company_profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      company_plan_assignments: {
        Row: {
          assigned_by: string | null
          billing_cycle: string | null
          company_id: string
          created_at: string
          custom_jobs: number | null
          custom_price_monthly_cents: number | null
          custom_price_yearly_cents: number | null
          custom_seats: number | null
          custom_tokens: number | null
          id: string
          is_active: boolean
          next_refill_date: string | null
          notes: string | null
          plan_id: string
          updated_at: string
          valid_from: string
          valid_until: string | null
        }
        Insert: {
          assigned_by?: string | null
          billing_cycle?: string | null
          company_id: string
          created_at?: string
          custom_jobs?: number | null
          custom_price_monthly_cents?: number | null
          custom_price_yearly_cents?: number | null
          custom_seats?: number | null
          custom_tokens?: number | null
          id?: string
          is_active?: boolean
          next_refill_date?: string | null
          notes?: string | null
          plan_id: string
          updated_at?: string
          valid_from?: string
          valid_until?: string | null
        }
        Update: {
          assigned_by?: string | null
          billing_cycle?: string | null
          company_id?: string
          created_at?: string
          custom_jobs?: number | null
          custom_price_monthly_cents?: number | null
          custom_price_yearly_cents?: number | null
          custom_seats?: number | null
          custom_tokens?: number | null
          id?: string
          is_active?: boolean
          next_refill_date?: string | null
          notes?: string | null
          plan_id?: string
          updated_at?: string
          valid_from?: string
          valid_until?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "company_plan_assignments_company_id_fkey"
            columns: ["company_id"]
            isOneToOne: false
            referencedRelation: "companies"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "company_plan_assignments_company_id_fkey"
            columns: ["company_id"]
            isOneToOne: false
            referencedRelation: "companies_public_secure"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "company_plan_assignments_company_id_fkey"
            columns: ["company_id"]
            isOneToOne: false
            referencedRelation: "company_need_quota"
            referencedColumns: ["company_id"]
          },
          {
            foreignKeyName: "company_plan_assignments_company_id_fkey"
            columns: ["company_id"]
            isOneToOne: false
            referencedRelation: "company_unlock_stats"
            referencedColumns: ["company_id"]
          },
          {
            foreignKeyName: "company_plan_assignments_company_id_fkey"
            columns: ["company_id"]
            isOneToOne: false
            referencedRelation: "v_company_profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "company_plan_assignments_plan_id_fkey"
            columns: ["plan_id"]
            isOneToOne: false
            referencedRelation: "subscription_plans"
            referencedColumns: ["id"]
          },
        ]
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
          {
            foreignKeyName: "company_posts_company_id_fkey"
            columns: ["company_id"]
            isOneToOne: false
            referencedRelation: "companies_public_secure"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "company_posts_company_id_fkey"
            columns: ["company_id"]
            isOneToOne: false
            referencedRelation: "company_need_quota"
            referencedColumns: ["company_id"]
          },
          {
            foreignKeyName: "company_posts_company_id_fkey"
            columns: ["company_id"]
            isOneToOne: false
            referencedRelation: "company_unlock_stats"
            referencedColumns: ["company_id"]
          },
          {
            foreignKeyName: "company_posts_company_id_fkey"
            columns: ["company_id"]
            isOneToOne: false
            referencedRelation: "v_company_profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      company_purchases: {
        Row: {
          amount_cents: number
          company_id: string
          completed_at: string | null
          created_at: string | null
          id: string
          item_qty: number
          item_type: string
          status: string
        }
        Insert: {
          amount_cents: number
          company_id: string
          completed_at?: string | null
          created_at?: string | null
          id?: string
          item_qty?: number
          item_type: string
          status?: string
        }
        Update: {
          amount_cents?: number
          company_id?: string
          completed_at?: string | null
          created_at?: string | null
          id?: string
          item_qty?: number
          item_type?: string
          status?: string
        }
        Relationships: [
          {
            foreignKeyName: "company_purchases_company_id_fkey"
            columns: ["company_id"]
            isOneToOne: false
            referencedRelation: "companies"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "company_purchases_company_id_fkey"
            columns: ["company_id"]
            isOneToOne: false
            referencedRelation: "companies_public_secure"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "company_purchases_company_id_fkey"
            columns: ["company_id"]
            isOneToOne: false
            referencedRelation: "company_need_quota"
            referencedColumns: ["company_id"]
          },
          {
            foreignKeyName: "company_purchases_company_id_fkey"
            columns: ["company_id"]
            isOneToOne: false
            referencedRelation: "company_unlock_stats"
            referencedColumns: ["company_id"]
          },
          {
            foreignKeyName: "company_purchases_company_id_fkey"
            columns: ["company_id"]
            isOneToOne: false
            referencedRelation: "v_company_profiles"
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
          {
            foreignKeyName: "company_settings_company_id_fkey"
            columns: ["company_id"]
            isOneToOne: true
            referencedRelation: "companies_public_secure"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "company_settings_company_id_fkey"
            columns: ["company_id"]
            isOneToOne: true
            referencedRelation: "company_need_quota"
            referencedColumns: ["company_id"]
          },
          {
            foreignKeyName: "company_settings_company_id_fkey"
            columns: ["company_id"]
            isOneToOne: true
            referencedRelation: "company_unlock_stats"
            referencedColumns: ["company_id"]
          },
          {
            foreignKeyName: "company_settings_company_id_fkey"
            columns: ["company_id"]
            isOneToOne: true
            referencedRelation: "v_company_profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      company_subscriptions: {
        Row: {
          company_id: string
          created_at: string
          plan_id: string
          renews_at: string | null
          seats: number
          status: string
          token_balance: number
          updated_at: string
        }
        Insert: {
          company_id: string
          created_at?: string
          plan_id: string
          renews_at?: string | null
          seats?: number
          status?: string
          token_balance?: number
          updated_at?: string
        }
        Update: {
          company_id?: string
          created_at?: string
          plan_id?: string
          renews_at?: string | null
          seats?: number
          status?: string
          token_balance?: number
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "company_subscriptions_company_id_fkey"
            columns: ["company_id"]
            isOneToOne: true
            referencedRelation: "companies"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "company_subscriptions_company_id_fkey"
            columns: ["company_id"]
            isOneToOne: true
            referencedRelation: "companies_public_secure"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "company_subscriptions_company_id_fkey"
            columns: ["company_id"]
            isOneToOne: true
            referencedRelation: "company_need_quota"
            referencedColumns: ["company_id"]
          },
          {
            foreignKeyName: "company_subscriptions_company_id_fkey"
            columns: ["company_id"]
            isOneToOne: true
            referencedRelation: "company_unlock_stats"
            referencedColumns: ["company_id"]
          },
          {
            foreignKeyName: "company_subscriptions_company_id_fkey"
            columns: ["company_id"]
            isOneToOne: true
            referencedRelation: "v_company_profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "company_subscriptions_plan_id_fkey"
            columns: ["plan_id"]
            isOneToOne: false
            referencedRelation: "plans"
            referencedColumns: ["id"]
          },
        ]
      }
      company_tags: {
        Row: {
          company_id: string
          created_at: string
          tag_id: string
        }
        Insert: {
          company_id: string
          created_at?: string
          tag_id: string
        }
        Update: {
          company_id?: string
          created_at?: string
          tag_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "company_tags_company_id_fkey"
            columns: ["company_id"]
            isOneToOne: false
            referencedRelation: "companies"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "company_tags_company_id_fkey"
            columns: ["company_id"]
            isOneToOne: false
            referencedRelation: "companies_public_secure"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "company_tags_company_id_fkey"
            columns: ["company_id"]
            isOneToOne: false
            referencedRelation: "company_need_quota"
            referencedColumns: ["company_id"]
          },
          {
            foreignKeyName: "company_tags_company_id_fkey"
            columns: ["company_id"]
            isOneToOne: false
            referencedRelation: "company_unlock_stats"
            referencedColumns: ["company_id"]
          },
          {
            foreignKeyName: "company_tags_company_id_fkey"
            columns: ["company_id"]
            isOneToOne: false
            referencedRelation: "v_company_profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "company_tags_tag_id_fkey"
            columns: ["tag_id"]
            isOneToOne: false
            referencedRelation: "vocab_tags"
            referencedColumns: ["id"]
          },
        ]
      }
      company_token_wallets: {
        Row: {
          balance: number
          company_id: string
          created_at: string | null
          id: string
          tokens_used: number | null
          updated_at: string | null
        }
        Insert: {
          balance?: number
          company_id: string
          created_at?: string | null
          id?: string
          tokens_used?: number | null
          updated_at?: string | null
        }
        Update: {
          balance?: number
          company_id?: string
          created_at?: string | null
          id?: string
          tokens_used?: number | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "company_token_wallets_company_id_fkey"
            columns: ["company_id"]
            isOneToOne: true
            referencedRelation: "companies"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "company_token_wallets_company_id_fkey"
            columns: ["company_id"]
            isOneToOne: true
            referencedRelation: "companies_public_secure"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "company_token_wallets_company_id_fkey"
            columns: ["company_id"]
            isOneToOne: true
            referencedRelation: "company_need_quota"
            referencedColumns: ["company_id"]
          },
          {
            foreignKeyName: "company_token_wallets_company_id_fkey"
            columns: ["company_id"]
            isOneToOne: true
            referencedRelation: "company_unlock_stats"
            referencedColumns: ["company_id"]
          },
          {
            foreignKeyName: "company_token_wallets_company_id_fkey"
            columns: ["company_id"]
            isOneToOne: true
            referencedRelation: "v_company_profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      company_user_interests: {
        Row: {
          company_id: string
          created_at: string
          created_by: string
          id: string
          user_id: string
        }
        Insert: {
          company_id: string
          created_at?: string
          created_by: string
          id?: string
          user_id: string
        }
        Update: {
          company_id?: string
          created_at?: string
          created_by?: string
          id?: string
          user_id?: string
        }
        Relationships: []
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
          {
            foreignKeyName: "company_users_company_id_fkey"
            columns: ["company_id"]
            isOneToOne: false
            referencedRelation: "companies_public_secure"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "company_users_company_id_fkey"
            columns: ["company_id"]
            isOneToOne: false
            referencedRelation: "company_need_quota"
            referencedColumns: ["company_id"]
          },
          {
            foreignKeyName: "company_users_company_id_fkey"
            columns: ["company_id"]
            isOneToOne: false
            referencedRelation: "company_unlock_stats"
            referencedColumns: ["company_id"]
          },
          {
            foreignKeyName: "company_users_company_id_fkey"
            columns: ["company_id"]
            isOneToOne: false
            referencedRelation: "v_company_profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      connections: {
        Row: {
          addressee_id: string
          created_at: string
          requester_id: string
          responded_at: string | null
          status: string
        }
        Insert: {
          addressee_id: string
          created_at?: string
          requester_id: string
          responded_at?: string | null
          status?: string
        }
        Update: {
          addressee_id?: string
          created_at?: string
          requester_id?: string
          responded_at?: string | null
          status?: string
        }
        Relationships: []
      }
      conversations: {
        Row: {
          a_id: string
          b_id: string
          created_at: string
          id: string
          last_message_at: string | null
        }
        Insert: {
          a_id: string
          b_id: string
          created_at?: string
          id?: string
          last_message_at?: string | null
        }
        Update: {
          a_id?: string
          b_id?: string
          created_at?: string
          id?: string
          last_message_at?: string | null
        }
        Relationships: []
      }
      data_access_log: {
        Row: {
          action: string
          at: string | null
          company_id: string
          id: string
          object_id: string | null
          object_type: string
          profile_id: string
        }
        Insert: {
          action: string
          at?: string | null
          company_id: string
          id?: string
          object_id?: string | null
          object_type: string
          profile_id: string
        }
        Update: {
          action?: string
          at?: string | null
          company_id?: string
          id?: string
          object_id?: string | null
          object_type?: string
          profile_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "data_access_log_company_id_fkey"
            columns: ["company_id"]
            isOneToOne: false
            referencedRelation: "companies"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "data_access_log_company_id_fkey"
            columns: ["company_id"]
            isOneToOne: false
            referencedRelation: "companies_public_secure"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "data_access_log_company_id_fkey"
            columns: ["company_id"]
            isOneToOne: false
            referencedRelation: "company_need_quota"
            referencedColumns: ["company_id"]
          },
          {
            foreignKeyName: "data_access_log_company_id_fkey"
            columns: ["company_id"]
            isOneToOne: false
            referencedRelation: "company_unlock_stats"
            referencedColumns: ["company_id"]
          },
          {
            foreignKeyName: "data_access_log_company_id_fkey"
            columns: ["company_id"]
            isOneToOne: false
            referencedRelation: "v_company_profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "data_access_log_profile_id_fkey"
            columns: ["profile_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "data_access_log_profile_id_fkey"
            columns: ["profile_id"]
            isOneToOne: false
            referencedRelation: "profiles_public"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "data_access_log_profile_id_fkey"
            columns: ["profile_id"]
            isOneToOne: false
            referencedRelation: "profiles_public_secure"
            referencedColumns: ["id"]
          },
        ]
      }
      file_pages: {
        Row: {
          bbox: Json | null
          created_at: string
          file_id: string
          id: string
          page_number: number
          text: string | null
          thumb_path: string | null
        }
        Insert: {
          bbox?: Json | null
          created_at?: string
          file_id: string
          id?: string
          page_number: number
          text?: string | null
          thumb_path?: string | null
        }
        Update: {
          bbox?: Json | null
          created_at?: string
          file_id?: string
          id?: string
          page_number?: number
          text?: string | null
          thumb_path?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "file_pages_file_id_fkey"
            columns: ["file_id"]
            isOneToOne: false
            referencedRelation: "files"
            referencedColumns: ["id"]
          },
        ]
      }
      files: {
        Row: {
          byte_size: number | null
          checksum: string
          created_at: string
          filename: string
          group_id: string
          id: string
          license: string | null
          mime_type: string | null
          source: string | null
          storage_path: string
          uploader_id: string | null
          version: number
        }
        Insert: {
          byte_size?: number | null
          checksum: string
          created_at?: string
          filename: string
          group_id: string
          id?: string
          license?: string | null
          mime_type?: string | null
          source?: string | null
          storage_path: string
          uploader_id?: string | null
          version?: number
        }
        Update: {
          byte_size?: number | null
          checksum?: string
          created_at?: string
          filename?: string
          group_id?: string
          id?: string
          license?: string | null
          mime_type?: string | null
          source?: string | null
          storage_path?: string
          uploader_id?: string | null
          version?: number
        }
        Relationships: [
          {
            foreignKeyName: "files_group_id_fkey"
            columns: ["group_id"]
            isOneToOne: false
            referencedRelation: "groups"
            referencedColumns: ["id"]
          },
        ]
      }
      follow_request_counters: {
        Row: {
          company_id: string
          count: number
          day: string
          updated_at: string
        }
        Insert: {
          company_id: string
          count?: number
          day?: string
          updated_at?: string
        }
        Update: {
          company_id?: string
          count?: number
          day?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "follow_request_counters_company_id_fkey"
            columns: ["company_id"]
            isOneToOne: true
            referencedRelation: "companies"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "follow_request_counters_company_id_fkey"
            columns: ["company_id"]
            isOneToOne: true
            referencedRelation: "companies_public_secure"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "follow_request_counters_company_id_fkey"
            columns: ["company_id"]
            isOneToOne: true
            referencedRelation: "company_need_quota"
            referencedColumns: ["company_id"]
          },
          {
            foreignKeyName: "follow_request_counters_company_id_fkey"
            columns: ["company_id"]
            isOneToOne: true
            referencedRelation: "company_unlock_stats"
            referencedColumns: ["company_id"]
          },
          {
            foreignKeyName: "follow_request_counters_company_id_fkey"
            columns: ["company_id"]
            isOneToOne: true
            referencedRelation: "v_company_profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      follows: {
        Row: {
          created_at: string
          followee_id: string
          followee_type: Database["public"]["Enums"]["follow_entity"]
          follower_id: string
          follower_type: Database["public"]["Enums"]["follow_entity"]
          id: string
          status: Database["public"]["Enums"]["follow_status"]
          updated_at: string
        }
        Insert: {
          created_at?: string
          followee_id: string
          followee_type: Database["public"]["Enums"]["follow_entity"]
          follower_id: string
          follower_type: Database["public"]["Enums"]["follow_entity"]
          id?: string
          status?: Database["public"]["Enums"]["follow_status"]
          updated_at?: string
        }
        Update: {
          created_at?: string
          followee_id?: string
          followee_type?: Database["public"]["Enums"]["follow_entity"]
          follower_id?: string
          follower_type?: Database["public"]["Enums"]["follow_entity"]
          id?: string
          status?: Database["public"]["Enums"]["follow_status"]
          updated_at?: string
        }
        Relationships: []
      }
      group_join_requests: {
        Row: {
          group_id: string
          id: string
          message: string | null
          requested_at: string
          responded_at: string | null
          responded_by: string | null
          status: string
          user_id: string
        }
        Insert: {
          group_id: string
          id?: string
          message?: string | null
          requested_at?: string
          responded_at?: string | null
          responded_by?: string | null
          status?: string
          user_id: string
        }
        Update: {
          group_id?: string
          id?: string
          message?: string | null
          requested_at?: string
          responded_at?: string | null
          responded_by?: string | null
          status?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "group_join_requests_group_id_fkey"
            columns: ["group_id"]
            isOneToOne: false
            referencedRelation: "groups"
            referencedColumns: ["id"]
          },
        ]
      }
      group_members: {
        Row: {
          group_id: string
          joined_at: string
          role: string
          status: string
          user_id: string
        }
        Insert: {
          group_id: string
          joined_at?: string
          role?: string
          status?: string
          user_id: string
        }
        Update: {
          group_id?: string
          joined_at?: string
          role?: string
          status?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "group_members_group_id_fkey"
            columns: ["group_id"]
            isOneToOne: false
            referencedRelation: "groups"
            referencedColumns: ["id"]
          },
        ]
      }
      groups: {
        Row: {
          allow_member_invites: boolean | null
          course_code: string | null
          cover_image: string | null
          created_at: string
          created_by: string | null
          description: string | null
          id: string
          max_members: number | null
          region: string | null
          require_approval: boolean | null
          school: string | null
          title: string
          type: string
          updated_at: string
          visibility: string
        }
        Insert: {
          allow_member_invites?: boolean | null
          course_code?: string | null
          cover_image?: string | null
          created_at?: string
          created_by?: string | null
          description?: string | null
          id?: string
          max_members?: number | null
          region?: string | null
          require_approval?: boolean | null
          school?: string | null
          title: string
          type?: string
          updated_at?: string
          visibility?: string
        }
        Update: {
          allow_member_invites?: boolean | null
          course_code?: string | null
          cover_image?: string | null
          created_at?: string
          created_by?: string | null
          description?: string | null
          id?: string
          max_members?: number | null
          region?: string | null
          require_approval?: boolean | null
          school?: string | null
          title?: string
          type?: string
          updated_at?: string
          visibility?: string
        }
        Relationships: []
      }
      job_certifications: {
        Row: {
          certification_name: string
          created_at: string | null
          id: string
          is_required: boolean | null
          issuing_authority: string | null
          job_id: string | null
        }
        Insert: {
          certification_name: string
          created_at?: string | null
          id?: string
          is_required?: boolean | null
          issuing_authority?: string | null
          job_id?: string | null
        }
        Update: {
          certification_name?: string
          created_at?: string | null
          id?: string
          is_required?: boolean | null
          issuing_authority?: string | null
          job_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "job_certifications_job_id_fkey"
            columns: ["job_id"]
            isOneToOne: false
            referencedRelation: "job_posts"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "job_certifications_job_id_fkey"
            columns: ["job_id"]
            isOneToOne: false
            referencedRelation: "public_job_listings"
            referencedColumns: ["id"]
          },
        ]
      }
      job_driving_licenses: {
        Row: {
          created_at: string | null
          id: string
          is_required: boolean | null
          job_id: string | null
          license_class: string
        }
        Insert: {
          created_at?: string | null
          id?: string
          is_required?: boolean | null
          job_id?: string | null
          license_class: string
        }
        Update: {
          created_at?: string | null
          id?: string
          is_required?: boolean | null
          job_id?: string | null
          license_class?: string
        }
        Relationships: [
          {
            foreignKeyName: "job_driving_licenses_job_id_fkey"
            columns: ["job_id"]
            isOneToOne: false
            referencedRelation: "job_posts"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "job_driving_licenses_job_id_fkey"
            columns: ["job_id"]
            isOneToOne: false
            referencedRelation: "public_job_listings"
            referencedColumns: ["id"]
          },
        ]
      }
      job_languages: {
        Row: {
          created_at: string | null
          id: string
          is_required: boolean | null
          job_id: string | null
          language: string
          level: string | null
        }
        Insert: {
          created_at?: string | null
          id?: string
          is_required?: boolean | null
          job_id?: string | null
          language: string
          level?: string | null
        }
        Update: {
          created_at?: string | null
          id?: string
          is_required?: boolean | null
          job_id?: string | null
          language?: string
          level?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "job_languages_job_id_fkey"
            columns: ["job_id"]
            isOneToOne: false
            referencedRelation: "job_posts"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "job_languages_job_id_fkey"
            columns: ["job_id"]
            isOneToOne: false
            referencedRelation: "public_job_listings"
            referencedColumns: ["id"]
          },
        ]
      }
      job_locations: {
        Row: {
          city: string
          country: string
          created_at: string
          id: string
          is_remote: boolean | null
          job_id: string
        }
        Insert: {
          city: string
          country: string
          created_at?: string
          id?: string
          is_remote?: boolean | null
          job_id: string
        }
        Update: {
          city?: string
          country?: string
          created_at?: string
          id?: string
          is_remote?: boolean | null
          job_id?: string
        }
        Relationships: []
      }
      job_post_apprenticeships: {
        Row: {
          apprenticeship_profession: string
          chamber: string | null
          created_at: string | null
          duration_months: number | null
          exam_support: boolean | null
          id: string
          job_id: string | null
          minimum_education: string | null
          rotation_plan: string | null
          salary_year_1_cents: number | null
          salary_year_2_cents: number | null
          salary_year_3_cents: number | null
          salary_year_4_cents: number | null
          training_start_date: string | null
          vocational_school: string | null
        }
        Insert: {
          apprenticeship_profession: string
          chamber?: string | null
          created_at?: string | null
          duration_months?: number | null
          exam_support?: boolean | null
          id?: string
          job_id?: string | null
          minimum_education?: string | null
          rotation_plan?: string | null
          salary_year_1_cents?: number | null
          salary_year_2_cents?: number | null
          salary_year_3_cents?: number | null
          salary_year_4_cents?: number | null
          training_start_date?: string | null
          vocational_school?: string | null
        }
        Update: {
          apprenticeship_profession?: string
          chamber?: string | null
          created_at?: string | null
          duration_months?: number | null
          exam_support?: boolean | null
          id?: string
          job_id?: string | null
          minimum_education?: string | null
          rotation_plan?: string | null
          salary_year_1_cents?: number | null
          salary_year_2_cents?: number | null
          salary_year_3_cents?: number | null
          salary_year_4_cents?: number | null
          training_start_date?: string | null
          vocational_school?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "job_post_apprenticeships_job_id_fkey"
            columns: ["job_id"]
            isOneToOne: false
            referencedRelation: "job_posts"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "job_post_apprenticeships_job_id_fkey"
            columns: ["job_id"]
            isOneToOne: false
            referencedRelation: "public_job_listings"
            referencedColumns: ["id"]
          },
        ]
      }
      job_post_internships: {
        Row: {
          created_at: string | null
          duration_weeks_max: number | null
          duration_weeks_min: number | null
          enrollment_required: boolean | null
          field_of_study: string | null
          id: string
          internship_type: string | null
          job_id: string | null
          learning_objectives: string | null
          mentor_assigned: boolean | null
        }
        Insert: {
          created_at?: string | null
          duration_weeks_max?: number | null
          duration_weeks_min?: number | null
          enrollment_required?: boolean | null
          field_of_study?: string | null
          id?: string
          internship_type?: string | null
          job_id?: string | null
          learning_objectives?: string | null
          mentor_assigned?: boolean | null
        }
        Update: {
          created_at?: string | null
          duration_weeks_max?: number | null
          duration_weeks_min?: number | null
          enrollment_required?: boolean | null
          field_of_study?: string | null
          id?: string
          internship_type?: string | null
          job_id?: string | null
          learning_objectives?: string | null
          mentor_assigned?: boolean | null
        }
        Relationships: [
          {
            foreignKeyName: "job_post_internships_job_id_fkey"
            columns: ["job_id"]
            isOneToOne: false
            referencedRelation: "job_posts"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "job_post_internships_job_id_fkey"
            columns: ["job_id"]
            isOneToOne: false
            referencedRelation: "public_job_listings"
            referencedColumns: ["id"]
          },
        ]
      }
      job_post_professionals: {
        Row: {
          created_at: string | null
          degree_required: boolean | null
          id: string
          job_id: string | null
          min_experience_years: number | null
          minimum_degree: string | null
          on_call_duty: boolean | null
          probation_period_months: number | null
          professional_qualification: string | null
          relocation_assistance: boolean | null
          shift_work: boolean | null
          weekend_work: boolean | null
        }
        Insert: {
          created_at?: string | null
          degree_required?: boolean | null
          id?: string
          job_id?: string | null
          min_experience_years?: number | null
          minimum_degree?: string | null
          on_call_duty?: boolean | null
          probation_period_months?: number | null
          professional_qualification?: string | null
          relocation_assistance?: boolean | null
          shift_work?: boolean | null
          weekend_work?: boolean | null
        }
        Update: {
          created_at?: string | null
          degree_required?: boolean | null
          id?: string
          job_id?: string | null
          min_experience_years?: number | null
          minimum_degree?: string | null
          on_call_duty?: boolean | null
          probation_period_months?: number | null
          professional_qualification?: string | null
          relocation_assistance?: boolean | null
          shift_work?: boolean | null
          weekend_work?: boolean | null
        }
        Relationships: [
          {
            foreignKeyName: "job_post_professionals_job_id_fkey"
            columns: ["job_id"]
            isOneToOne: false
            referencedRelation: "job_posts"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "job_post_professionals_job_id_fkey"
            columns: ["job_id"]
            isOneToOne: false
            referencedRelation: "public_job_listings"
            referencedColumns: ["id"]
          },
        ]
      }
      job_post_views: {
        Row: {
          created_at: string | null
          id: string
          ip_address: unknown | null
          job_post_id: string | null
          user_agent: string | null
          user_id: string | null
        }
        Insert: {
          created_at?: string | null
          id?: string
          ip_address?: unknown | null
          job_post_id?: string | null
          user_agent?: string | null
          user_id?: string | null
        }
        Update: {
          created_at?: string | null
          id?: string
          ip_address?: unknown | null
          job_post_id?: string | null
          user_agent?: string | null
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "job_post_views_job_post_id_fkey"
            columns: ["job_post_id"]
            isOneToOne: false
            referencedRelation: "job_posts"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "job_post_views_job_post_id_fkey"
            columns: ["job_post_id"]
            isOneToOne: false
            referencedRelation: "public_job_listings"
            referencedColumns: ["id"]
          },
        ]
      }
      job_postings: {
        Row: {
          company_id: string
          created_at: string | null
          description: string | null
          employment_type: string | null
          id: string
          location: string | null
          title: string
          updated_at: string | null
        }
        Insert: {
          company_id: string
          created_at?: string | null
          description?: string | null
          employment_type?: string | null
          id?: string
          location?: string | null
          title: string
          updated_at?: string | null
        }
        Update: {
          company_id?: string
          created_at?: string | null
          description?: string | null
          employment_type?: string | null
          id?: string
          location?: string | null
          title?: string
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "job_postings_company_id_fkey"
            columns: ["company_id"]
            isOneToOne: false
            referencedRelation: "companies"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "job_postings_company_id_fkey"
            columns: ["company_id"]
            isOneToOne: false
            referencedRelation: "companies_public_secure"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "job_postings_company_id_fkey"
            columns: ["company_id"]
            isOneToOne: false
            referencedRelation: "company_need_quota"
            referencedColumns: ["company_id"]
          },
          {
            foreignKeyName: "job_postings_company_id_fkey"
            columns: ["company_id"]
            isOneToOne: false
            referencedRelation: "company_unlock_stats"
            referencedColumns: ["company_id"]
          },
          {
            foreignKeyName: "job_postings_company_id_fkey"
            columns: ["company_id"]
            isOneToOne: false
            referencedRelation: "v_company_profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      job_posts: {
        Row: {
          address_number: string | null
          address_street: string | null
          application_count: number | null
          application_deadline: string | null
          application_email: string | null
          application_instructions: string | null
          application_url: string | null
          apprenticeship_data: Json | null
          barrier_free_access: boolean | null
          benefits_description: string | null
          category: string | null
          certifications: Json | null
          city: string | null
          commute_distance_km: number | null
          company_description: string | null
          company_id: string
          contact_person_email: string | null
          contact_person_name: string | null
          contact_person_phone: string | null
          contact_person_photo_url: string | null
          contact_person_role: string | null
          country: string | null
          created_at: string
          description_md: string | null
          driving_licenses: Json | null
          duration_months: number | null
          employment: string | null
          employment_type: string | null
          end_date: string | null
          external_id: string | null
          featured_until: string | null
          hours_per_week_max: number | null
          hours_per_week_min: number | null
          id: string
          internship_data: Json | null
          is_active: boolean
          is_draft: boolean | null
          is_featured: boolean | null
          is_public: boolean
          is_urgent: boolean | null
          job_type: string | null
          languages: Json | null
          location_lat: number | null
          location_lng: number | null
          parking_available: boolean | null
          postal_code: string | null
          professional_data: Json | null
          public_transport: boolean | null
          published_at: string | null
          relocation_support: boolean | null
          requirements_description: string | null
          requirements_md: string | null
          role_family: string | null
          salary_currency: string | null
          salary_interval: string | null
          salary_max: number | null
          salary_min: number | null
          skills: Json | null
          slug: string | null
          source: string | null
          start_date: string | null
          start_immediately: boolean | null
          state: string | null
          tags: string[] | null
          tasks_description: string | null
          tasks_md: string | null
          team_department: string | null
          title: string
          travel_percentage: number | null
          updated_at: string
          view_count: number | null
          visa_sponsorship: boolean | null
          work_mode: string | null
        }
        Insert: {
          address_number?: string | null
          address_street?: string | null
          application_count?: number | null
          application_deadline?: string | null
          application_email?: string | null
          application_instructions?: string | null
          application_url?: string | null
          apprenticeship_data?: Json | null
          barrier_free_access?: boolean | null
          benefits_description?: string | null
          category?: string | null
          certifications?: Json | null
          city?: string | null
          commute_distance_km?: number | null
          company_description?: string | null
          company_id: string
          contact_person_email?: string | null
          contact_person_name?: string | null
          contact_person_phone?: string | null
          contact_person_photo_url?: string | null
          contact_person_role?: string | null
          country?: string | null
          created_at?: string
          description_md?: string | null
          driving_licenses?: Json | null
          duration_months?: number | null
          employment?: string | null
          employment_type?: string | null
          end_date?: string | null
          external_id?: string | null
          featured_until?: string | null
          hours_per_week_max?: number | null
          hours_per_week_min?: number | null
          id?: string
          internship_data?: Json | null
          is_active?: boolean
          is_draft?: boolean | null
          is_featured?: boolean | null
          is_public?: boolean
          is_urgent?: boolean | null
          job_type?: string | null
          languages?: Json | null
          location_lat?: number | null
          location_lng?: number | null
          parking_available?: boolean | null
          postal_code?: string | null
          professional_data?: Json | null
          public_transport?: boolean | null
          published_at?: string | null
          relocation_support?: boolean | null
          requirements_description?: string | null
          requirements_md?: string | null
          role_family?: string | null
          salary_currency?: string | null
          salary_interval?: string | null
          salary_max?: number | null
          salary_min?: number | null
          skills?: Json | null
          slug?: string | null
          source?: string | null
          start_date?: string | null
          start_immediately?: boolean | null
          state?: string | null
          tags?: string[] | null
          tasks_description?: string | null
          tasks_md?: string | null
          team_department?: string | null
          title: string
          travel_percentage?: number | null
          updated_at?: string
          view_count?: number | null
          visa_sponsorship?: boolean | null
          work_mode?: string | null
        }
        Update: {
          address_number?: string | null
          address_street?: string | null
          application_count?: number | null
          application_deadline?: string | null
          application_email?: string | null
          application_instructions?: string | null
          application_url?: string | null
          apprenticeship_data?: Json | null
          barrier_free_access?: boolean | null
          benefits_description?: string | null
          category?: string | null
          certifications?: Json | null
          city?: string | null
          commute_distance_km?: number | null
          company_description?: string | null
          company_id?: string
          contact_person_email?: string | null
          contact_person_name?: string | null
          contact_person_phone?: string | null
          contact_person_photo_url?: string | null
          contact_person_role?: string | null
          country?: string | null
          created_at?: string
          description_md?: string | null
          driving_licenses?: Json | null
          duration_months?: number | null
          employment?: string | null
          employment_type?: string | null
          end_date?: string | null
          external_id?: string | null
          featured_until?: string | null
          hours_per_week_max?: number | null
          hours_per_week_min?: number | null
          id?: string
          internship_data?: Json | null
          is_active?: boolean
          is_draft?: boolean | null
          is_featured?: boolean | null
          is_public?: boolean
          is_urgent?: boolean | null
          job_type?: string | null
          languages?: Json | null
          location_lat?: number | null
          location_lng?: number | null
          parking_available?: boolean | null
          postal_code?: string | null
          professional_data?: Json | null
          public_transport?: boolean | null
          published_at?: string | null
          relocation_support?: boolean | null
          requirements_description?: string | null
          requirements_md?: string | null
          role_family?: string | null
          salary_currency?: string | null
          salary_interval?: string | null
          salary_max?: number | null
          salary_min?: number | null
          skills?: Json | null
          slug?: string | null
          source?: string | null
          start_date?: string | null
          start_immediately?: boolean | null
          state?: string | null
          tags?: string[] | null
          tasks_description?: string | null
          tasks_md?: string | null
          team_department?: string | null
          title?: string
          travel_percentage?: number | null
          updated_at?: string
          view_count?: number | null
          visa_sponsorship?: boolean | null
          work_mode?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "job_posts_company_id_fkey"
            columns: ["company_id"]
            isOneToOne: false
            referencedRelation: "companies"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "job_posts_company_id_fkey"
            columns: ["company_id"]
            isOneToOne: false
            referencedRelation: "companies_public_secure"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "job_posts_company_id_fkey"
            columns: ["company_id"]
            isOneToOne: false
            referencedRelation: "company_need_quota"
            referencedColumns: ["company_id"]
          },
          {
            foreignKeyName: "job_posts_company_id_fkey"
            columns: ["company_id"]
            isOneToOne: false
            referencedRelation: "company_unlock_stats"
            referencedColumns: ["company_id"]
          },
          {
            foreignKeyName: "job_posts_company_id_fkey"
            columns: ["company_id"]
            isOneToOne: false
            referencedRelation: "v_company_profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      job_skills: {
        Row: {
          created_at: string | null
          id: string
          is_required: boolean | null
          job_id: string | null
          skill_level: number | null
          skill_name: string
        }
        Insert: {
          created_at?: string | null
          id?: string
          is_required?: boolean | null
          job_id?: string | null
          skill_level?: number | null
          skill_name: string
        }
        Update: {
          created_at?: string | null
          id?: string
          is_required?: boolean | null
          job_id?: string | null
          skill_level?: number | null
          skill_name?: string
        }
        Relationships: [
          {
            foreignKeyName: "job_skills_job_id_fkey"
            columns: ["job_id"]
            isOneToOne: false
            referencedRelation: "job_posts"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "job_skills_job_id_fkey"
            columns: ["job_id"]
            isOneToOne: false
            referencedRelation: "public_job_listings"
            referencedColumns: ["id"]
          },
        ]
      }
      jobs: {
        Row: {
          benefits: string | null
          company_id: string
          created_at: string
          currency: string | null
          description: string | null
          employment_type: string
          expires_at: string | null
          id: string
          is_active: boolean
          is_public: boolean
          requirements: string | null
          salary_max: number | null
          salary_min: number | null
          seniority: string | null
          title: string
          updated_at: string
        }
        Insert: {
          benefits?: string | null
          company_id: string
          created_at?: string
          currency?: string | null
          description?: string | null
          employment_type?: string
          expires_at?: string | null
          id?: string
          is_active?: boolean
          is_public?: boolean
          requirements?: string | null
          salary_max?: number | null
          salary_min?: number | null
          seniority?: string | null
          title: string
          updated_at?: string
        }
        Update: {
          benefits?: string | null
          company_id?: string
          created_at?: string
          currency?: string | null
          description?: string | null
          employment_type?: string
          expires_at?: string | null
          id?: string
          is_active?: boolean
          is_public?: boolean
          requirements?: string | null
          salary_max?: number | null
          salary_min?: number | null
          seniority?: string | null
          title?: string
          updated_at?: string
        }
        Relationships: []
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
      languages_master: {
        Row: {
          code: string
          name_de: string
          name_en: string
        }
        Insert: {
          code: string
          name_de: string
          name_en: string
        }
        Update: {
          code?: string
          name_de?: string
          name_en?: string
        }
        Relationships: []
      }
      linkedin_comment_likes: {
        Row: {
          comment_id: string
          created_at: string | null
          user_id: string
        }
        Insert: {
          comment_id: string
          created_at?: string | null
          user_id: string
        }
        Update: {
          comment_id?: string
          created_at?: string | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "linkedin_comment_likes_comment_id_fkey"
            columns: ["comment_id"]
            isOneToOne: false
            referencedRelation: "linkedin_comments"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "linkedin_comment_likes_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "linkedin_comment_likes_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles_public"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "linkedin_comment_likes_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles_public_secure"
            referencedColumns: ["id"]
          },
        ]
      }
      linkedin_comments: {
        Row: {
          attachments: Json | null
          author_id: string
          body: string
          created_at: string | null
          id: string
          like_count: number
          parent_id: string | null
          post_id: string
          reply_count: number
        }
        Insert: {
          attachments?: Json | null
          author_id: string
          body: string
          created_at?: string | null
          id?: string
          like_count?: number
          parent_id?: string | null
          post_id: string
          reply_count?: number
        }
        Update: {
          attachments?: Json | null
          author_id?: string
          body?: string
          created_at?: string | null
          id?: string
          like_count?: number
          parent_id?: string | null
          post_id?: string
          reply_count?: number
        }
        Relationships: [
          {
            foreignKeyName: "linkedin_comments_author_id_fkey"
            columns: ["author_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "linkedin_comments_author_id_fkey"
            columns: ["author_id"]
            isOneToOne: false
            referencedRelation: "profiles_public"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "linkedin_comments_author_id_fkey"
            columns: ["author_id"]
            isOneToOne: false
            referencedRelation: "profiles_public_secure"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "linkedin_comments_parent_id_fkey"
            columns: ["parent_id"]
            isOneToOne: false
            referencedRelation: "linkedin_comments"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "linkedin_comments_post_id_fkey"
            columns: ["post_id"]
            isOneToOne: false
            referencedRelation: "linkedin_posts"
            referencedColumns: ["id"]
          },
        ]
      }
      linkedin_company_posts: {
        Row: {
          attachments: Json | null
          author_id: string
          body: string
          comment_count: number
          company_id: string
          created_at: string | null
          id: string
          job_id: string | null
          like_count: number
        }
        Insert: {
          attachments?: Json | null
          author_id: string
          body: string
          comment_count?: number
          company_id: string
          created_at?: string | null
          id?: string
          job_id?: string | null
          like_count?: number
        }
        Update: {
          attachments?: Json | null
          author_id?: string
          body?: string
          comment_count?: number
          company_id?: string
          created_at?: string | null
          id?: string
          job_id?: string | null
          like_count?: number
        }
        Relationships: [
          {
            foreignKeyName: "linkedin_company_posts_author_id_fkey"
            columns: ["author_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "linkedin_company_posts_author_id_fkey"
            columns: ["author_id"]
            isOneToOne: false
            referencedRelation: "profiles_public"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "linkedin_company_posts_author_id_fkey"
            columns: ["author_id"]
            isOneToOne: false
            referencedRelation: "profiles_public_secure"
            referencedColumns: ["id"]
          },
        ]
      }
      linkedin_post_likes: {
        Row: {
          created_at: string | null
          post_id: string
          user_id: string
        }
        Insert: {
          created_at?: string | null
          post_id: string
          user_id: string
        }
        Update: {
          created_at?: string | null
          post_id?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "linkedin_post_likes_post_id_fkey"
            columns: ["post_id"]
            isOneToOne: false
            referencedRelation: "linkedin_posts"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "linkedin_post_likes_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "linkedin_post_likes_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles_public"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "linkedin_post_likes_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles_public_secure"
            referencedColumns: ["id"]
          },
        ]
      }
      linkedin_posts: {
        Row: {
          attachments: Json | null
          author_id: string
          body: string
          comment_count: number
          created_at: string | null
          id: string
          like_count: number
          repost_count: number
          updated_at: string | null
          visibility: string | null
        }
        Insert: {
          attachments?: Json | null
          author_id: string
          body: string
          comment_count?: number
          created_at?: string | null
          id?: string
          like_count?: number
          repost_count?: number
          updated_at?: string | null
          visibility?: string | null
        }
        Update: {
          attachments?: Json | null
          author_id?: string
          body?: string
          comment_count?: number
          created_at?: string | null
          id?: string
          like_count?: number
          repost_count?: number
          updated_at?: string | null
          visibility?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "linkedin_posts_author_id_fkey"
            columns: ["author_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "linkedin_posts_author_id_fkey"
            columns: ["author_id"]
            isOneToOne: false
            referencedRelation: "profiles_public"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "linkedin_posts_author_id_fkey"
            columns: ["author_id"]
            isOneToOne: false
            referencedRelation: "profiles_public_secure"
            referencedColumns: ["id"]
          },
        ]
      }
      locations: {
        Row: {
          city: string
          country_code: string
          geog: unknown | null
          id: number
          lat: number
          lon: number
          postal_code: string
          state: string | null
        }
        Insert: {
          city: string
          country_code: string
          geog?: unknown | null
          id?: number
          lat: number
          lon: number
          postal_code: string
          state?: string | null
        }
        Update: {
          city?: string
          country_code?: string
          geog?: unknown | null
          id?: number
          lat?: number
          lon?: number
          postal_code?: string
          state?: string | null
        }
        Relationships: []
      }
      match_cache: {
        Row: {
          candidate_id: string
          created_at: string
          explanation: Json | null
          id: string
          is_explore: boolean | null
          job_id: string
          rank: number | null
          score: number
          updated_at: string
        }
        Insert: {
          candidate_id: string
          created_at?: string
          explanation?: Json | null
          id?: string
          is_explore?: boolean | null
          job_id: string
          rank?: number | null
          score: number
          updated_at?: string
        }
        Update: {
          candidate_id?: string
          created_at?: string
          explanation?: Json | null
          id?: string
          is_explore?: boolean | null
          job_id?: string
          rank?: number | null
          score?: number
          updated_at?: string
        }
        Relationships: []
      }
      match_feedback: {
        Row: {
          candidate_id: string
          company_id: string
          created_at: string
          created_by: string
          feedback_type: string
          id: string
          job_id: string
          reason_code: string | null
        }
        Insert: {
          candidate_id: string
          company_id: string
          created_at?: string
          created_by: string
          feedback_type: string
          id?: string
          job_id: string
          reason_code?: string | null
        }
        Update: {
          candidate_id?: string
          company_id?: string
          created_at?: string
          created_by?: string
          feedback_type?: string
          id?: string
          job_id?: string
          reason_code?: string | null
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
            foreignKeyName: "matches_company_id_fkey"
            columns: ["company_id"]
            isOneToOne: false
            referencedRelation: "companies_public_secure"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "matches_company_id_fkey"
            columns: ["company_id"]
            isOneToOne: false
            referencedRelation: "company_need_quota"
            referencedColumns: ["company_id"]
          },
          {
            foreignKeyName: "matches_company_id_fkey"
            columns: ["company_id"]
            isOneToOne: false
            referencedRelation: "company_unlock_stats"
            referencedColumns: ["company_id"]
          },
          {
            foreignKeyName: "matches_company_id_fkey"
            columns: ["company_id"]
            isOneToOne: false
            referencedRelation: "v_company_profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "matches_profile_id_fkey"
            columns: ["profile_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "matches_profile_id_fkey"
            columns: ["profile_id"]
            isOneToOne: false
            referencedRelation: "profiles_public"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "matches_profile_id_fkey"
            columns: ["profile_id"]
            isOneToOne: false
            referencedRelation: "profiles_public_secure"
            referencedColumns: ["id"]
          },
        ]
      }
      messages: {
        Row: {
          content: string
          conversation_id: string
          created_at: string
          id: string
          sender_id: string
        }
        Insert: {
          content: string
          conversation_id: string
          created_at?: string
          id?: string
          sender_id: string
        }
        Update: {
          content?: string
          conversation_id?: string
          created_at?: string
          id?: string
          sender_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "messages_conversation_id_fkey"
            columns: ["conversation_id"]
            isOneToOne: false
            referencedRelation: "conversations"
            referencedColumns: ["id"]
          },
        ]
      }
      need_languages: {
        Row: {
          created_at: string | null
          id: string
          language: string
          level: string
          need_id: string
          type: string
        }
        Insert: {
          created_at?: string | null
          id?: string
          language: string
          level: string
          need_id: string
          type: string
        }
        Update: {
          created_at?: string | null
          id?: string
          language?: string
          level?: string
          need_id?: string
          type?: string
        }
        Relationships: [
          {
            foreignKeyName: "need_languages_need_id_fkey"
            columns: ["need_id"]
            isOneToOne: false
            referencedRelation: "company_needs"
            referencedColumns: ["id"]
          },
        ]
      }
      need_licenses: {
        Row: {
          created_at: string | null
          id: string
          license: string
          need_id: string
          type: string
        }
        Insert: {
          created_at?: string | null
          id?: string
          license: string
          need_id: string
          type: string
        }
        Update: {
          created_at?: string | null
          id?: string
          license?: string
          need_id?: string
          type?: string
        }
        Relationships: [
          {
            foreignKeyName: "need_licenses_need_id_fkey"
            columns: ["need_id"]
            isOneToOne: false
            referencedRelation: "company_needs"
            referencedColumns: ["id"]
          },
        ]
      }
      need_matches: {
        Row: {
          breakdown: Json | null
          candidate_id: string
          computed_at: string | null
          id: string
          need_id: string
          passed_gates: boolean | null
          score: number
        }
        Insert: {
          breakdown?: Json | null
          candidate_id: string
          computed_at?: string | null
          id?: string
          need_id: string
          passed_gates?: boolean | null
          score?: number
        }
        Update: {
          breakdown?: Json | null
          candidate_id?: string
          computed_at?: string | null
          id?: string
          need_id?: string
          passed_gates?: boolean | null
          score?: number
        }
        Relationships: [
          {
            foreignKeyName: "need_matches_candidate_id_fkey"
            columns: ["candidate_id"]
            isOneToOne: false
            referencedRelation: "candidate_profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "need_matches_need_id_fkey"
            columns: ["need_id"]
            isOneToOne: false
            referencedRelation: "company_needs"
            referencedColumns: ["id"]
          },
        ]
      }
      need_skills: {
        Row: {
          created_at: string | null
          id: string
          need_id: string
          skill: string
          type: string
        }
        Insert: {
          created_at?: string | null
          id?: string
          need_id: string
          skill: string
          type: string
        }
        Update: {
          created_at?: string | null
          id?: string
          need_id?: string
          skill?: string
          type?: string
        }
        Relationships: [
          {
            foreignKeyName: "need_skills_need_id_fkey"
            columns: ["need_id"]
            isOneToOne: false
            referencedRelation: "company_needs"
            referencedColumns: ["id"]
          },
        ]
      }
      need_target_groups: {
        Row: {
          created_at: string | null
          id: string
          need_id: string
          target_group: string
        }
        Insert: {
          created_at?: string | null
          id?: string
          need_id: string
          target_group: string
        }
        Update: {
          created_at?: string | null
          id?: string
          need_id?: string
          target_group?: string
        }
        Relationships: [
          {
            foreignKeyName: "need_target_groups_need_id_fkey"
            columns: ["need_id"]
            isOneToOne: false
            referencedRelation: "company_needs"
            referencedColumns: ["id"]
          },
        ]
      }
      notification_prefs: {
        Row: {
          created_at: string
          email: boolean
          id: string
          in_app: boolean
          type: Database["public"]["Enums"]["notif_type"]
          updated_at: string
          user_id: string
        }
        Insert: {
          created_at?: string
          email?: boolean
          id?: string
          in_app?: boolean
          type: Database["public"]["Enums"]["notif_type"]
          updated_at?: string
          user_id: string
        }
        Update: {
          created_at?: string
          email?: boolean
          id?: string
          in_app?: boolean
          type?: Database["public"]["Enums"]["notif_type"]
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "notification_prefs_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "notification_prefs_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles_public"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "notification_prefs_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles_public_secure"
            referencedColumns: ["id"]
          },
        ]
      }
      notifications: {
        Row: {
          actor_id: string | null
          actor_type: Database["public"]["Enums"]["notif_recipient"] | null
          body: string | null
          channels: Database["public"]["Enums"]["notif_channel"][] | null
          created_at: string
          group_key: string | null
          id: string
          payload: Json | null
          priority: number | null
          read_at: string | null
          recipient_id: string
          recipient_type: Database["public"]["Enums"]["notif_recipient"]
          seen_at: string | null
          title: string
          type: Database["public"]["Enums"]["notif_type"]
        }
        Insert: {
          actor_id?: string | null
          actor_type?: Database["public"]["Enums"]["notif_recipient"] | null
          body?: string | null
          channels?: Database["public"]["Enums"]["notif_channel"][] | null
          created_at?: string
          group_key?: string | null
          id?: string
          payload?: Json | null
          priority?: number | null
          read_at?: string | null
          recipient_id: string
          recipient_type: Database["public"]["Enums"]["notif_recipient"]
          seen_at?: string | null
          title: string
          type: Database["public"]["Enums"]["notif_type"]
        }
        Update: {
          actor_id?: string | null
          actor_type?: Database["public"]["Enums"]["notif_recipient"] | null
          body?: string | null
          channels?: Database["public"]["Enums"]["notif_channel"][] | null
          created_at?: string
          group_key?: string | null
          id?: string
          payload?: Json | null
          priority?: number | null
          read_at?: string | null
          recipient_id?: string
          recipient_type?: Database["public"]["Enums"]["notif_recipient"]
          seen_at?: string | null
          title?: string
          type?: Database["public"]["Enums"]["notif_type"]
        }
        Relationships: []
      }
      onboarding_sessions: {
        Row: {
          claimed_by: string | null
          completed: boolean
          created_at: string
          email: string
          id: string
          org_id: string | null
          payload: Json
          selected_plan: Database["public"]["Enums"]["plan_code"] | null
          stripe_status: string | null
          updated_at: string
        }
        Insert: {
          claimed_by?: string | null
          completed?: boolean
          created_at?: string
          email: string
          id?: string
          org_id?: string | null
          payload?: Json
          selected_plan?: Database["public"]["Enums"]["plan_code"] | null
          stripe_status?: string | null
          updated_at?: string
        }
        Update: {
          claimed_by?: string | null
          completed?: boolean
          created_at?: string
          email?: string
          id?: string
          org_id?: string | null
          payload?: Json
          selected_plan?: Database["public"]["Enums"]["plan_code"] | null
          stripe_status?: string | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "onboarding_sessions_org_id_fkey"
            columns: ["org_id"]
            isOneToOne: false
            referencedRelation: "companies"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "onboarding_sessions_org_id_fkey"
            columns: ["org_id"]
            isOneToOne: false
            referencedRelation: "companies_public_secure"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "onboarding_sessions_org_id_fkey"
            columns: ["org_id"]
            isOneToOne: false
            referencedRelation: "company_need_quota"
            referencedColumns: ["company_id"]
          },
          {
            foreignKeyName: "onboarding_sessions_org_id_fkey"
            columns: ["org_id"]
            isOneToOne: false
            referencedRelation: "company_unlock_stats"
            referencedColumns: ["company_id"]
          },
          {
            foreignKeyName: "onboarding_sessions_org_id_fkey"
            columns: ["org_id"]
            isOneToOne: false
            referencedRelation: "v_company_profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      org_entitlements: {
        Row: {
          ads_enabled: boolean
          created_at: string
          job_postings_limit: number
          matching_tier: string | null
          org_id: string
          unlock_tokens_total: number
          unlock_tokens_used: number
          updated_at: string
        }
        Insert: {
          ads_enabled?: boolean
          created_at?: string
          job_postings_limit?: number
          matching_tier?: string | null
          org_id: string
          unlock_tokens_total?: number
          unlock_tokens_used?: number
          updated_at?: string
        }
        Update: {
          ads_enabled?: boolean
          created_at?: string
          job_postings_limit?: number
          matching_tier?: string | null
          org_id?: string
          unlock_tokens_total?: number
          unlock_tokens_used?: number
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "org_entitlements_org_id_fkey"
            columns: ["org_id"]
            isOneToOne: true
            referencedRelation: "companies"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "org_entitlements_org_id_fkey"
            columns: ["org_id"]
            isOneToOne: true
            referencedRelation: "companies_public_secure"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "org_entitlements_org_id_fkey"
            columns: ["org_id"]
            isOneToOne: true
            referencedRelation: "company_need_quota"
            referencedColumns: ["company_id"]
          },
          {
            foreignKeyName: "org_entitlements_org_id_fkey"
            columns: ["org_id"]
            isOneToOne: true
            referencedRelation: "company_unlock_stats"
            referencedColumns: ["company_id"]
          },
          {
            foreignKeyName: "org_entitlements_org_id_fkey"
            columns: ["org_id"]
            isOneToOne: true
            referencedRelation: "v_company_profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      org_preferences: {
        Row: {
          created_at: string
          looking_for: Database["public"]["Enums"]["looking_tag"][]
          org_id: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          looking_for?: Database["public"]["Enums"]["looking_tag"][]
          org_id: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          looking_for?: Database["public"]["Enums"]["looking_tag"][]
          org_id?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "org_preferences_org_id_fkey"
            columns: ["org_id"]
            isOneToOne: true
            referencedRelation: "companies"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "org_preferences_org_id_fkey"
            columns: ["org_id"]
            isOneToOne: true
            referencedRelation: "companies_public_secure"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "org_preferences_org_id_fkey"
            columns: ["org_id"]
            isOneToOne: true
            referencedRelation: "company_need_quota"
            referencedColumns: ["company_id"]
          },
          {
            foreignKeyName: "org_preferences_org_id_fkey"
            columns: ["org_id"]
            isOneToOne: true
            referencedRelation: "company_unlock_stats"
            referencedColumns: ["company_id"]
          },
          {
            foreignKeyName: "org_preferences_org_id_fkey"
            columns: ["org_id"]
            isOneToOne: true
            referencedRelation: "v_company_profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      page_revisions: {
        Row: {
          changed_at: string
          changed_by: string
          content_html: string | null
          content_markdown: string | null
          id: string
          page_id: string
        }
        Insert: {
          changed_at?: string
          changed_by: string
          content_html?: string | null
          content_markdown?: string | null
          id?: string
          page_id: string
        }
        Update: {
          changed_at?: string
          changed_by?: string
          content_html?: string | null
          content_markdown?: string | null
          id?: string
          page_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "page_revisions_page_id_fkey"
            columns: ["page_id"]
            isOneToOne: false
            referencedRelation: "pages"
            referencedColumns: ["id"]
          },
        ]
      }
      page_views: {
        Row: {
          id: number
          ip_hash: string | null
          page_id: string
          user_agent: string | null
          viewed_at: string
        }
        Insert: {
          id?: number
          ip_hash?: string | null
          page_id: string
          user_agent?: string | null
          viewed_at?: string
        }
        Update: {
          id?: number
          ip_hash?: string | null
          page_id?: string
          user_agent?: string | null
          viewed_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "page_views_page_id_fkey"
            columns: ["page_id"]
            isOneToOne: false
            referencedRelation: "pages"
            referencedColumns: ["id"]
          },
        ]
      }
      pages: {
        Row: {
          author_id: string
          category: string | null
          content_html: string | null
          content_markdown: string | null
          created_at: string
          featured_image_url: string | null
          id: string
          keywords: string[] | null
          meta_description: string
          meta_title: string
          page_type: string
          publish_at: string | null
          slug: string
          status: string
          tags: string[] | null
          title: string
          updated_at: string
        }
        Insert: {
          author_id: string
          category?: string | null
          content_html?: string | null
          content_markdown?: string | null
          created_at?: string
          featured_image_url?: string | null
          id?: string
          keywords?: string[] | null
          meta_description: string
          meta_title: string
          page_type?: string
          publish_at?: string | null
          slug: string
          status?: string
          tags?: string[] | null
          title: string
          updated_at?: string
        }
        Update: {
          author_id?: string
          category?: string | null
          content_html?: string | null
          content_markdown?: string | null
          created_at?: string
          featured_image_url?: string | null
          id?: string
          keywords?: string[] | null
          meta_description?: string
          meta_title?: string
          page_type?: string
          publish_at?: string | null
          slug?: string
          status?: string
          tags?: string[] | null
          title?: string
          updated_at?: string
        }
        Relationships: []
      }
      pipeline_items: {
        Row: {
          added_at: string | null
          company_id: string
          id: string
          position: number | null
          profile_id: string
          stage_id: string
        }
        Insert: {
          added_at?: string | null
          company_id: string
          id?: string
          position?: number | null
          profile_id: string
          stage_id: string
        }
        Update: {
          added_at?: string | null
          company_id?: string
          id?: string
          position?: number | null
          profile_id?: string
          stage_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "pipeline_items_company_id_fkey"
            columns: ["company_id"]
            isOneToOne: false
            referencedRelation: "companies"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "pipeline_items_company_id_fkey"
            columns: ["company_id"]
            isOneToOne: false
            referencedRelation: "companies_public_secure"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "pipeline_items_company_id_fkey"
            columns: ["company_id"]
            isOneToOne: false
            referencedRelation: "company_need_quota"
            referencedColumns: ["company_id"]
          },
          {
            foreignKeyName: "pipeline_items_company_id_fkey"
            columns: ["company_id"]
            isOneToOne: false
            referencedRelation: "company_unlock_stats"
            referencedColumns: ["company_id"]
          },
          {
            foreignKeyName: "pipeline_items_company_id_fkey"
            columns: ["company_id"]
            isOneToOne: false
            referencedRelation: "v_company_profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "pipeline_items_profile_id_fkey"
            columns: ["profile_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "pipeline_items_profile_id_fkey"
            columns: ["profile_id"]
            isOneToOne: false
            referencedRelation: "profiles_public"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "pipeline_items_profile_id_fkey"
            columns: ["profile_id"]
            isOneToOne: false
            referencedRelation: "profiles_public_secure"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "pipeline_items_stage_id_fkey"
            columns: ["stage_id"]
            isOneToOne: false
            referencedRelation: "pipeline_stages"
            referencedColumns: ["id"]
          },
        ]
      }
      pipeline_stages: {
        Row: {
          color: string | null
          created_at: string | null
          id: string
          name: string
          pipeline_id: string
          position: number
        }
        Insert: {
          color?: string | null
          created_at?: string | null
          id?: string
          name: string
          pipeline_id: string
          position: number
        }
        Update: {
          color?: string | null
          created_at?: string | null
          id?: string
          name?: string
          pipeline_id?: string
          position?: number
        }
        Relationships: [
          {
            foreignKeyName: "pipeline_stages_pipeline_id_fkey"
            columns: ["pipeline_id"]
            isOneToOne: false
            referencedRelation: "company_pipelines"
            referencedColumns: ["id"]
          },
        ]
      }
      plan_changes: {
        Row: {
          client_request_id: string | null
          company_id: string
          created_at: string
          from_plan: string | null
          id: number
          to_plan: string
        }
        Insert: {
          client_request_id?: string | null
          company_id: string
          created_at?: string
          from_plan?: string | null
          id?: number
          to_plan: string
        }
        Update: {
          client_request_id?: string | null
          company_id?: string
          created_at?: string
          from_plan?: string | null
          id?: number
          to_plan?: string
        }
        Relationships: [
          {
            foreignKeyName: "plan_changes_company_id_fkey"
            columns: ["company_id"]
            isOneToOne: false
            referencedRelation: "companies"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "plan_changes_company_id_fkey"
            columns: ["company_id"]
            isOneToOne: false
            referencedRelation: "companies_public_secure"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "plan_changes_company_id_fkey"
            columns: ["company_id"]
            isOneToOne: false
            referencedRelation: "company_need_quota"
            referencedColumns: ["company_id"]
          },
          {
            foreignKeyName: "plan_changes_company_id_fkey"
            columns: ["company_id"]
            isOneToOne: false
            referencedRelation: "company_unlock_stats"
            referencedColumns: ["company_id"]
          },
          {
            foreignKeyName: "plan_changes_company_id_fkey"
            columns: ["company_id"]
            isOneToOne: false
            referencedRelation: "v_company_profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "plan_changes_from_plan_fkey"
            columns: ["from_plan"]
            isOneToOne: false
            referencedRelation: "plans"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "plan_changes_to_plan_fkey"
            columns: ["to_plan"]
            isOneToOne: false
            referencedRelation: "plans"
            referencedColumns: ["id"]
          },
        ]
      }
      plans: {
        Row: {
          active: boolean
          id: string
          included_seats: number
          included_tokens: number
          max_job_posts: number | null
          max_seats: number
          monthly_price_cents: number
          name: string
          tokens_per_post: number | null
        }
        Insert: {
          active?: boolean
          id: string
          included_seats?: number
          included_tokens?: number
          max_job_posts?: number | null
          max_seats?: number
          monthly_price_cents: number
          name: string
          tokens_per_post?: number | null
        }
        Update: {
          active?: boolean
          id?: string
          included_seats?: number
          included_tokens?: number
          max_job_posts?: number | null
          max_seats?: number
          monthly_price_cents?: number
          name?: string
          tokens_per_post?: number | null
        }
        Relationships: []
      }
      post_comments: {
        Row: {
          content: string
          created_at: string | null
          id: string
          like_count: number | null
          parent_comment_id: string | null
          post_id: string | null
          updated_at: string | null
          user_id: string | null
        }
        Insert: {
          content: string
          created_at?: string | null
          id?: string
          like_count?: number | null
          parent_comment_id?: string | null
          post_id?: string | null
          updated_at?: string | null
          user_id?: string | null
        }
        Update: {
          content?: string
          created_at?: string | null
          id?: string
          like_count?: number | null
          parent_comment_id?: string | null
          post_id?: string | null
          updated_at?: string | null
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "post_comments_parent_comment_id_fkey"
            columns: ["parent_comment_id"]
            isOneToOne: false
            referencedRelation: "post_comments"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "post_comments_post_id_fkey"
            columns: ["post_id"]
            isOneToOne: false
            referencedRelation: "posts"
            referencedColumns: ["id"]
          },
        ]
      }
      post_documents: {
        Row: {
          created_at: string
          file_name: string
          file_size: number
          id: string
          post_id: string
          storage_path: string
        }
        Insert: {
          created_at?: string
          file_name: string
          file_size: number
          id?: string
          post_id: string
          storage_path: string
        }
        Update: {
          created_at?: string
          file_name?: string
          file_size?: number
          id?: string
          post_id?: string
          storage_path?: string
        }
        Relationships: []
      }
      post_events: {
        Row: {
          created_at: string
          end_at: string
          id: string
          is_online: boolean
          link_url: string | null
          location: string | null
          post_id: string
          start_at: string
          title: string
        }
        Insert: {
          created_at?: string
          end_at: string
          id?: string
          is_online?: boolean
          link_url?: string | null
          location?: string | null
          post_id: string
          start_at: string
          title: string
        }
        Update: {
          created_at?: string
          end_at?: string
          id?: string
          is_online?: boolean
          link_url?: string | null
          location?: string | null
          post_id?: string
          start_at?: string
          title?: string
        }
        Relationships: []
      }
      post_likes: {
        Row: {
          created_at: string | null
          id: string
          post_id: string | null
          user_id: string | null
        }
        Insert: {
          created_at?: string | null
          id?: string
          post_id?: string | null
          user_id?: string | null
        }
        Update: {
          created_at?: string | null
          id?: string
          post_id?: string | null
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "post_likes_post_id_fkey"
            columns: ["post_id"]
            isOneToOne: false
            referencedRelation: "posts"
            referencedColumns: ["id"]
          },
        ]
      }
      post_media: {
        Row: {
          created_at: string
          duration_ms: number | null
          height: number | null
          id: string
          post_id: string
          storage_path: string
          type: string
          width: number | null
        }
        Insert: {
          created_at?: string
          duration_ms?: number | null
          height?: number | null
          id?: string
          post_id: string
          storage_path: string
          type: string
          width?: number | null
        }
        Update: {
          created_at?: string
          duration_ms?: number | null
          height?: number | null
          id?: string
          post_id?: string
          storage_path?: string
          type?: string
          width?: number | null
        }
        Relationships: []
      }
      post_poll_options: {
        Row: {
          id: string
          option_text: string
          poll_id: string
        }
        Insert: {
          id?: string
          option_text: string
          poll_id: string
        }
        Update: {
          id?: string
          option_text?: string
          poll_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "post_poll_options_poll_id_fkey"
            columns: ["poll_id"]
            isOneToOne: false
            referencedRelation: "post_polls"
            referencedColumns: ["id"]
          },
        ]
      }
      post_poll_votes: {
        Row: {
          created_at: string
          option_id: string
          poll_id: string
          voter_id: string
        }
        Insert: {
          created_at?: string
          option_id: string
          poll_id: string
          voter_id: string
        }
        Update: {
          created_at?: string
          option_id?: string
          poll_id?: string
          voter_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "post_poll_votes_option_id_fkey"
            columns: ["option_id"]
            isOneToOne: false
            referencedRelation: "post_poll_options"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "post_poll_votes_poll_id_fkey"
            columns: ["poll_id"]
            isOneToOne: false
            referencedRelation: "post_polls"
            referencedColumns: ["id"]
          },
        ]
      }
      post_polls: {
        Row: {
          created_at: string
          ends_at: string
          id: string
          post_id: string
          question: string
        }
        Insert: {
          created_at?: string
          ends_at: string
          id?: string
          post_id: string
          question: string
        }
        Update: {
          created_at?: string
          ends_at?: string
          id?: string
          post_id?: string
          question?: string
        }
        Relationships: []
      }
      post_reposts: {
        Row: {
          created_at: string
          id: string
          post_id: string
          reposter_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          post_id: string
          reposter_id: string
        }
        Update: {
          created_at?: string
          id?: string
          post_id?: string
          reposter_id?: string
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
          documents: Json | null
          id: string
          image_url: string | null
          media: Json | null
          updated_at: string | null
          user_id: string | null
        }
        Insert: {
          content: string
          created_at?: string | null
          documents?: Json | null
          id?: string
          image_url?: string | null
          media?: Json | null
          updated_at?: string | null
          user_id?: string | null
        }
        Update: {
          content?: string
          created_at?: string | null
          documents?: Json | null
          id?: string
          image_url?: string | null
          media?: Json | null
          updated_at?: string | null
          user_id?: string | null
        }
        Relationships: []
      }
      posts_backup: {
        Row: {
          author_id: string | null
          author_type: string | null
          celebration: boolean | null
          content: string | null
          created_at: string | null
          id: string | null
          image_url: string | null
          link_url: string | null
          published_at: string | null
          scheduled_at: string | null
          status: string | null
          updated_at: string | null
          user_id: string | null
          visibility: string | null
        }
        Insert: {
          author_id?: string | null
          author_type?: string | null
          celebration?: boolean | null
          content?: string | null
          created_at?: string | null
          id?: string | null
          image_url?: string | null
          link_url?: string | null
          published_at?: string | null
          scheduled_at?: string | null
          status?: string | null
          updated_at?: string | null
          user_id?: string | null
          visibility?: string | null
        }
        Update: {
          author_id?: string | null
          author_type?: string | null
          celebration?: boolean | null
          content?: string | null
          created_at?: string | null
          id?: string | null
          image_url?: string | null
          link_url?: string | null
          published_at?: string | null
          scheduled_at?: string | null
          status?: string | null
          updated_at?: string | null
          user_id?: string | null
          visibility?: string | null
        }
        Relationships: []
      }
      profile_tags: {
        Row: {
          created_at: string
          profile_id: string
          tag_id: string
        }
        Insert: {
          created_at?: string
          profile_id: string
          tag_id: string
        }
        Update: {
          created_at?: string
          profile_id?: string
          tag_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "profile_tags_profile_id_fkey"
            columns: ["profile_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "profile_tags_profile_id_fkey"
            columns: ["profile_id"]
            isOneToOne: false
            referencedRelation: "profiles_public"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "profile_tags_profile_id_fkey"
            columns: ["profile_id"]
            isOneToOne: false
            referencedRelation: "profiles_public_secure"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "profile_tags_tag_id_fkey"
            columns: ["tag_id"]
            isOneToOne: false
            referencedRelation: "vocab_tags"
            referencedColumns: ["id"]
          },
        ]
      }
      profile_unlocks: {
        Row: {
          company_id: string
          general_interest: boolean
          id: string
          job_posting_id: string | null
          level: string
          profile_id: string
          unlocked_at: string
        }
        Insert: {
          company_id: string
          general_interest?: boolean
          id?: string
          job_posting_id?: string | null
          level: string
          profile_id: string
          unlocked_at?: string
        }
        Update: {
          company_id?: string
          general_interest?: boolean
          id?: string
          job_posting_id?: string | null
          level?: string
          profile_id?: string
          unlocked_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "fk_profile_unlocks_job_posting_id"
            columns: ["job_posting_id"]
            isOneToOne: false
            referencedRelation: "job_postings"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "profile_unlocks_company_id_fkey"
            columns: ["company_id"]
            isOneToOne: false
            referencedRelation: "companies"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "profile_unlocks_company_id_fkey"
            columns: ["company_id"]
            isOneToOne: false
            referencedRelation: "companies_public_secure"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "profile_unlocks_company_id_fkey"
            columns: ["company_id"]
            isOneToOne: false
            referencedRelation: "company_need_quota"
            referencedColumns: ["company_id"]
          },
          {
            foreignKeyName: "profile_unlocks_company_id_fkey"
            columns: ["company_id"]
            isOneToOne: false
            referencedRelation: "company_unlock_stats"
            referencedColumns: ["company_id"]
          },
          {
            foreignKeyName: "profile_unlocks_company_id_fkey"
            columns: ["company_id"]
            isOneToOne: false
            referencedRelation: "v_company_profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "profile_unlocks_profile_id_fkey"
            columns: ["profile_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "profile_unlocks_profile_id_fkey"
            columns: ["profile_id"]
            isOneToOne: false
            referencedRelation: "profiles_public"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "profile_unlocks_profile_id_fkey"
            columns: ["profile_id"]
            isOneToOne: false
            referencedRelation: "profiles_public_secure"
            referencedColumns: ["id"]
          },
        ]
      }
      profiles: {
        Row: {
          abschlussjahr: string | null
          abschlussjahr_ausgelernt: string | null
          account_created: boolean | null
          address_confirmed: boolean | null
          aktueller_beruf: string | null
          ausbildungsberuf: string | null
          ausbildungsbetrieb: string | null
          avatar_url: string | null
          berufserfahrung: Json | null
          bio: string | null
          branche: string | null
          company_name: string | null
          consent_date: string | null
          cover_image_url: string | null
          created_at: string | null
          current_company_id: string | null
          cv_url: string | null
          data_processing_consent: boolean | null
          data_retention_until: string | null
          display_name: string | null
          driver_license_class: string | null
          einwilligung: boolean | null
          email: string | null
          employer_free: string | null
          employer_slogan: string | null
          employment_status: string | null
          faehigkeiten: Json | null
          first_dashboard_seen: boolean | null
          first_name: string | null
          first_profile_saved: boolean | null
          full_name: string | null
          geburtsdatum: string | null
          geplanter_abschluss: string | null
          has_drivers_license: boolean | null
          has_own_vehicle: boolean | null
          hausnummer: string | null
          headline: string | null
          house_number: string | null
          id: string
          job_search_preferences: string[]
          job_title: string | null
          kenntnisse: string | null
          last_name: string | null
          latitude: number | null
          layout: number | null
          location_id: number | null
          login_count: number | null
          longitude: number | null
          marketing_consent: boolean | null
          motivation: string | null
          nachname: string | null
          onboarding_completed: boolean | null
          open_to_work: boolean | null
          ort: string | null
          plz: string | null
          postal_code: string | null
          praktische_erfahrung: string | null
          profile_complete: boolean | null
          profile_published: boolean | null
          public_employment_visible: boolean | null
          public_profile_consent: boolean | null
          schulbildung: Json | null
          schule: string | null
          sprachen: Json | null
          startjahr: string | null
          status: string | null
          strasse: string | null
          street: string | null
          target_year: string | null
          telefon: string | null
          uebermich: string | null
          updated_at: string | null
          visibility_industry: Json | null
          visibility_mode: string | null
          visibility_prompt_shown: boolean | null
          visibility_region: Json | null
          voraussichtliches_ende: string | null
          vorname: string | null
        }
        Insert: {
          abschlussjahr?: string | null
          abschlussjahr_ausgelernt?: string | null
          account_created?: boolean | null
          address_confirmed?: boolean | null
          aktueller_beruf?: string | null
          ausbildungsberuf?: string | null
          ausbildungsbetrieb?: string | null
          avatar_url?: string | null
          berufserfahrung?: Json | null
          bio?: string | null
          branche?: string | null
          company_name?: string | null
          consent_date?: string | null
          cover_image_url?: string | null
          created_at?: string | null
          current_company_id?: string | null
          cv_url?: string | null
          data_processing_consent?: boolean | null
          data_retention_until?: string | null
          display_name?: string | null
          driver_license_class?: string | null
          einwilligung?: boolean | null
          email?: string | null
          employer_free?: string | null
          employer_slogan?: string | null
          employment_status?: string | null
          faehigkeiten?: Json | null
          first_dashboard_seen?: boolean | null
          first_name?: string | null
          first_profile_saved?: boolean | null
          full_name?: string | null
          geburtsdatum?: string | null
          geplanter_abschluss?: string | null
          has_drivers_license?: boolean | null
          has_own_vehicle?: boolean | null
          hausnummer?: string | null
          headline?: string | null
          house_number?: string | null
          id: string
          job_search_preferences?: string[]
          job_title?: string | null
          kenntnisse?: string | null
          last_name?: string | null
          latitude?: number | null
          layout?: number | null
          location_id?: number | null
          login_count?: number | null
          longitude?: number | null
          marketing_consent?: boolean | null
          motivation?: string | null
          nachname?: string | null
          onboarding_completed?: boolean | null
          open_to_work?: boolean | null
          ort?: string | null
          plz?: string | null
          postal_code?: string | null
          praktische_erfahrung?: string | null
          profile_complete?: boolean | null
          profile_published?: boolean | null
          public_employment_visible?: boolean | null
          public_profile_consent?: boolean | null
          schulbildung?: Json | null
          schule?: string | null
          sprachen?: Json | null
          startjahr?: string | null
          status?: string | null
          strasse?: string | null
          street?: string | null
          target_year?: string | null
          telefon?: string | null
          uebermich?: string | null
          updated_at?: string | null
          visibility_industry?: Json | null
          visibility_mode?: string | null
          visibility_prompt_shown?: boolean | null
          visibility_region?: Json | null
          voraussichtliches_ende?: string | null
          vorname?: string | null
        }
        Update: {
          abschlussjahr?: string | null
          abschlussjahr_ausgelernt?: string | null
          account_created?: boolean | null
          address_confirmed?: boolean | null
          aktueller_beruf?: string | null
          ausbildungsberuf?: string | null
          ausbildungsbetrieb?: string | null
          avatar_url?: string | null
          berufserfahrung?: Json | null
          bio?: string | null
          branche?: string | null
          company_name?: string | null
          consent_date?: string | null
          cover_image_url?: string | null
          created_at?: string | null
          current_company_id?: string | null
          cv_url?: string | null
          data_processing_consent?: boolean | null
          data_retention_until?: string | null
          display_name?: string | null
          driver_license_class?: string | null
          einwilligung?: boolean | null
          email?: string | null
          employer_free?: string | null
          employer_slogan?: string | null
          employment_status?: string | null
          faehigkeiten?: Json | null
          first_dashboard_seen?: boolean | null
          first_name?: string | null
          first_profile_saved?: boolean | null
          full_name?: string | null
          geburtsdatum?: string | null
          geplanter_abschluss?: string | null
          has_drivers_license?: boolean | null
          has_own_vehicle?: boolean | null
          hausnummer?: string | null
          headline?: string | null
          house_number?: string | null
          id?: string
          job_search_preferences?: string[]
          job_title?: string | null
          kenntnisse?: string | null
          last_name?: string | null
          latitude?: number | null
          layout?: number | null
          location_id?: number | null
          login_count?: number | null
          longitude?: number | null
          marketing_consent?: boolean | null
          motivation?: string | null
          nachname?: string | null
          onboarding_completed?: boolean | null
          open_to_work?: boolean | null
          ort?: string | null
          plz?: string | null
          postal_code?: string | null
          praktische_erfahrung?: string | null
          profile_complete?: boolean | null
          profile_published?: boolean | null
          public_employment_visible?: boolean | null
          public_profile_consent?: boolean | null
          schulbildung?: Json | null
          schule?: string | null
          sprachen?: Json | null
          startjahr?: string | null
          status?: string | null
          strasse?: string | null
          street?: string | null
          target_year?: string | null
          telefon?: string | null
          uebermich?: string | null
          updated_at?: string | null
          visibility_industry?: Json | null
          visibility_mode?: string | null
          visibility_prompt_shown?: boolean | null
          visibility_region?: Json | null
          voraussichtliches_ende?: string | null
          vorname?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "profiles_current_company_id_fkey"
            columns: ["current_company_id"]
            isOneToOne: false
            referencedRelation: "companies"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "profiles_current_company_id_fkey"
            columns: ["current_company_id"]
            isOneToOne: false
            referencedRelation: "companies_public_secure"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "profiles_current_company_id_fkey"
            columns: ["current_company_id"]
            isOneToOne: false
            referencedRelation: "company_need_quota"
            referencedColumns: ["company_id"]
          },
          {
            foreignKeyName: "profiles_current_company_id_fkey"
            columns: ["current_company_id"]
            isOneToOne: false
            referencedRelation: "company_unlock_stats"
            referencedColumns: ["company_id"]
          },
          {
            foreignKeyName: "profiles_current_company_id_fkey"
            columns: ["current_company_id"]
            isOneToOne: false
            referencedRelation: "v_company_profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "profiles_location_id_fkey"
            columns: ["location_id"]
            isOneToOne: false
            referencedRelation: "locations"
            referencedColumns: ["id"]
          },
        ]
      }
      questions: {
        Row: {
          accepted_answer_id: string | null
          anchor: Json | null
          author_id: string | null
          body: string | null
          created_at: string
          file_id: string | null
          group_id: string
          id: string
          page_id: string | null
          status: string
          tags: string[] | null
          title: string
        }
        Insert: {
          accepted_answer_id?: string | null
          anchor?: Json | null
          author_id?: string | null
          body?: string | null
          created_at?: string
          file_id?: string | null
          group_id: string
          id?: string
          page_id?: string | null
          status?: string
          tags?: string[] | null
          title: string
        }
        Update: {
          accepted_answer_id?: string | null
          anchor?: Json | null
          author_id?: string | null
          body?: string | null
          created_at?: string
          file_id?: string | null
          group_id?: string
          id?: string
          page_id?: string | null
          status?: string
          tags?: string[] | null
          title?: string
        }
        Relationships: [
          {
            foreignKeyName: "questions_file_id_fkey"
            columns: ["file_id"]
            isOneToOne: false
            referencedRelation: "files"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "questions_group_id_fkey"
            columns: ["group_id"]
            isOneToOne: false
            referencedRelation: "groups"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "questions_page_id_fkey"
            columns: ["page_id"]
            isOneToOne: false
            referencedRelation: "file_pages"
            referencedColumns: ["id"]
          },
        ]
      }
      rate_limit_counters: {
        Row: {
          action: string
          count: number
          created_at: string
          id: string
          updated_at: string
          user_id: string
          window_start: string
        }
        Insert: {
          action: string
          count?: number
          created_at?: string
          id?: string
          updated_at?: string
          user_id: string
          window_start: string
        }
        Update: {
          action?: string
          count?: number
          created_at?: string
          id?: string
          updated_at?: string
          user_id?: string
          window_start?: string
        }
        Relationships: []
      }
      recently_viewed_profiles: {
        Row: {
          company_id: string
          id: string
          profile_id: string
          viewed_at: string
        }
        Insert: {
          company_id: string
          id?: string
          profile_id: string
          viewed_at?: string
        }
        Update: {
          company_id?: string
          id?: string
          profile_id?: string
          viewed_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "recently_viewed_profiles_company_id_fkey"
            columns: ["company_id"]
            isOneToOne: false
            referencedRelation: "companies"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "recently_viewed_profiles_company_id_fkey"
            columns: ["company_id"]
            isOneToOne: false
            referencedRelation: "companies_public_secure"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "recently_viewed_profiles_company_id_fkey"
            columns: ["company_id"]
            isOneToOne: false
            referencedRelation: "company_need_quota"
            referencedColumns: ["company_id"]
          },
          {
            foreignKeyName: "recently_viewed_profiles_company_id_fkey"
            columns: ["company_id"]
            isOneToOne: false
            referencedRelation: "company_unlock_stats"
            referencedColumns: ["company_id"]
          },
          {
            foreignKeyName: "recently_viewed_profiles_company_id_fkey"
            columns: ["company_id"]
            isOneToOne: false
            referencedRelation: "v_company_profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "recently_viewed_profiles_profile_id_fkey"
            columns: ["profile_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "recently_viewed_profiles_profile_id_fkey"
            columns: ["profile_id"]
            isOneToOne: false
            referencedRelation: "profiles_public"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "recently_viewed_profiles_profile_id_fkey"
            columns: ["profile_id"]
            isOneToOne: false
            referencedRelation: "profiles_public_secure"
            referencedColumns: ["id"]
          },
        ]
      }
      requirement_profiles: {
        Row: {
          category: string
          city: string | null
          company_id: string
          country: string | null
          created_at: string
          description_md: string | null
          duration_months: number | null
          employment: string | null
          hours_per_week_max: number | null
          hours_per_week_min: number | null
          id: string
          postal_code: string | null
          ready_for_publish: boolean
          requirements_md: string | null
          salary_currency: string | null
          salary_interval: string | null
          salary_max: number | null
          salary_min: number | null
          state: string | null
          tasks_md: string | null
          title: string
          updated_at: string
          work_mode: string | null
        }
        Insert: {
          category?: string
          city?: string | null
          company_id: string
          country?: string | null
          created_at?: string
          description_md?: string | null
          duration_months?: number | null
          employment?: string | null
          hours_per_week_max?: number | null
          hours_per_week_min?: number | null
          id?: string
          postal_code?: string | null
          ready_for_publish?: boolean
          requirements_md?: string | null
          salary_currency?: string | null
          salary_interval?: string | null
          salary_max?: number | null
          salary_min?: number | null
          state?: string | null
          tasks_md?: string | null
          title: string
          updated_at?: string
          work_mode?: string | null
        }
        Update: {
          category?: string
          city?: string | null
          company_id?: string
          country?: string | null
          created_at?: string
          description_md?: string | null
          duration_months?: number | null
          employment?: string | null
          hours_per_week_max?: number | null
          hours_per_week_min?: number | null
          id?: string
          postal_code?: string | null
          ready_for_publish?: boolean
          requirements_md?: string | null
          salary_currency?: string | null
          salary_interval?: string | null
          salary_max?: number | null
          salary_min?: number | null
          state?: string | null
          tasks_md?: string | null
          title?: string
          updated_at?: string
          work_mode?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "requirement_profiles_company_id_fkey"
            columns: ["company_id"]
            isOneToOne: false
            referencedRelation: "companies"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "requirement_profiles_company_id_fkey"
            columns: ["company_id"]
            isOneToOne: false
            referencedRelation: "companies_public_secure"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "requirement_profiles_company_id_fkey"
            columns: ["company_id"]
            isOneToOne: false
            referencedRelation: "company_need_quota"
            referencedColumns: ["company_id"]
          },
          {
            foreignKeyName: "requirement_profiles_company_id_fkey"
            columns: ["company_id"]
            isOneToOne: false
            referencedRelation: "company_unlock_stats"
            referencedColumns: ["company_id"]
          },
          {
            foreignKeyName: "requirement_profiles_company_id_fkey"
            columns: ["company_id"]
            isOneToOne: false
            referencedRelation: "v_company_profiles"
            referencedColumns: ["id"]
          },
        ]
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
      seat_ledger: {
        Row: {
          client_request_id: string | null
          company_id: string
          created_at: string
          delta: number
          id: number
          reason: string
        }
        Insert: {
          client_request_id?: string | null
          company_id: string
          created_at?: string
          delta: number
          id?: number
          reason: string
        }
        Update: {
          client_request_id?: string | null
          company_id?: string
          created_at?: string
          delta?: number
          id?: number
          reason?: string
        }
        Relationships: [
          {
            foreignKeyName: "seat_ledger_company_id_fkey"
            columns: ["company_id"]
            isOneToOne: false
            referencedRelation: "companies"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "seat_ledger_company_id_fkey"
            columns: ["company_id"]
            isOneToOne: false
            referencedRelation: "companies_public_secure"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "seat_ledger_company_id_fkey"
            columns: ["company_id"]
            isOneToOne: false
            referencedRelation: "company_need_quota"
            referencedColumns: ["company_id"]
          },
          {
            foreignKeyName: "seat_ledger_company_id_fkey"
            columns: ["company_id"]
            isOneToOne: false
            referencedRelation: "company_unlock_stats"
            referencedColumns: ["company_id"]
          },
          {
            foreignKeyName: "seat_ledger_company_id_fkey"
            columns: ["company_id"]
            isOneToOne: false
            referencedRelation: "v_company_profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      seat_pricing_tiers: {
        Row: {
          active: boolean
          id: number
          min_seats: number
          plan_id: string
          seat_price_cents: number
        }
        Insert: {
          active?: boolean
          id?: number
          min_seats: number
          plan_id: string
          seat_price_cents: number
        }
        Update: {
          active?: boolean
          id?: number
          min_seats?: number
          plan_id?: string
          seat_price_cents?: number
        }
        Relationships: [
          {
            foreignKeyName: "seat_pricing_tiers_plan_id_fkey"
            columns: ["plan_id"]
            isOneToOne: false
            referencedRelation: "plans"
            referencedColumns: ["id"]
          },
        ]
      }
      security_audit_log: {
        Row: {
          action: string
          created_at: string
          id: string
          ip_address: unknown | null
          resource_id: string | null
          resource_type: string
          user_agent: string | null
          user_id: string | null
        }
        Insert: {
          action: string
          created_at?: string
          id?: string
          ip_address?: unknown | null
          resource_id?: string | null
          resource_type: string
          user_agent?: string | null
          user_id?: string | null
        }
        Update: {
          action?: string
          created_at?: string
          id?: string
          ip_address?: unknown | null
          resource_id?: string | null
          resource_type?: string
          user_agent?: string | null
          user_id?: string | null
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
      skills_master: {
        Row: {
          category: string | null
          id: number
          name: string
          name_de: string | null
        }
        Insert: {
          category?: string | null
          id?: number
          name: string
          name_de?: string | null
        }
        Update: {
          category?: string | null
          id?: number
          name?: string
          name_de?: string | null
        }
        Relationships: []
      }
      spatial_ref_sys: {
        Row: {
          auth_name: string | null
          auth_srid: number | null
          proj4text: string | null
          srid: number
          srtext: string | null
        }
        Insert: {
          auth_name?: string | null
          auth_srid?: number | null
          proj4text?: string | null
          srid: number
          srtext?: string | null
        }
        Update: {
          auth_name?: string | null
          auth_srid?: number | null
          proj4text?: string | null
          srid?: number
          srtext?: string | null
        }
        Relationships: []
      }
      subscription_plans: {
        Row: {
          active: boolean
          created_at: string
          features: Json | null
          id: string
          included_jobs: number
          included_seats: number
          included_tokens: number
          name: string
          price_monthly_cents: number
          price_yearly_cents: number
        }
        Insert: {
          active?: boolean
          created_at?: string
          features?: Json | null
          id: string
          included_jobs?: number
          included_seats?: number
          included_tokens?: number
          name: string
          price_monthly_cents?: number
          price_yearly_cents?: number
        }
        Update: {
          active?: boolean
          created_at?: string
          features?: Json | null
          id?: string
          included_jobs?: number
          included_seats?: number
          included_tokens?: number
          name?: string
          price_monthly_cents?: number
          price_yearly_cents?: number
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
          {
            foreignKeyName: "subscriptions_company_id_fkey"
            columns: ["company_id"]
            isOneToOne: false
            referencedRelation: "companies_public_secure"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "subscriptions_company_id_fkey"
            columns: ["company_id"]
            isOneToOne: false
            referencedRelation: "company_need_quota"
            referencedColumns: ["company_id"]
          },
          {
            foreignKeyName: "subscriptions_company_id_fkey"
            columns: ["company_id"]
            isOneToOne: false
            referencedRelation: "company_unlock_stats"
            referencedColumns: ["company_id"]
          },
          {
            foreignKeyName: "subscriptions_company_id_fkey"
            columns: ["company_id"]
            isOneToOne: false
            referencedRelation: "v_company_profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      suggestions_history: {
        Row: {
          last_seen_at: string
          profile_id: string
          target_id: string
          target_type: string
        }
        Insert: {
          last_seen_at?: string
          profile_id: string
          target_id: string
          target_type: string
        }
        Update: {
          last_seen_at?: string
          profile_id?: string
          target_id?: string
          target_type?: string
        }
        Relationships: []
      }
      suppression: {
        Row: {
          candidate_id: string
          created_at: string
          created_by: string
          id: string
          job_id: string
          reason: string
          suppressed_until: string
        }
        Insert: {
          candidate_id: string
          created_at?: string
          created_by: string
          id?: string
          job_id: string
          reason?: string
          suppressed_until: string
        }
        Update: {
          candidate_id?: string
          created_at?: string
          created_by?: string
          id?: string
          job_id?: string
          reason?: string
          suppressed_until?: string
        }
        Relationships: []
      }
      token_ledger: {
        Row: {
          client_request_id: string | null
          company_id: string
          created_at: string
          delta: number
          id: number
          reason: string
          ref: string | null
        }
        Insert: {
          client_request_id?: string | null
          company_id: string
          created_at?: string
          delta: number
          id?: number
          reason: string
          ref?: string | null
        }
        Update: {
          client_request_id?: string | null
          company_id?: string
          created_at?: string
          delta?: number
          id?: number
          reason?: string
          ref?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "token_ledger_company_id_fkey"
            columns: ["company_id"]
            isOneToOne: false
            referencedRelation: "companies"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "token_ledger_company_id_fkey"
            columns: ["company_id"]
            isOneToOne: false
            referencedRelation: "companies_public_secure"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "token_ledger_company_id_fkey"
            columns: ["company_id"]
            isOneToOne: false
            referencedRelation: "company_need_quota"
            referencedColumns: ["company_id"]
          },
          {
            foreignKeyName: "token_ledger_company_id_fkey"
            columns: ["company_id"]
            isOneToOne: false
            referencedRelation: "company_unlock_stats"
            referencedColumns: ["company_id"]
          },
          {
            foreignKeyName: "token_ledger_company_id_fkey"
            columns: ["company_id"]
            isOneToOne: false
            referencedRelation: "v_company_profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      token_packages: {
        Row: {
          active: boolean | null
          created_at: string | null
          credits: number
          id: string
          price_cents: number
        }
        Insert: {
          active?: boolean | null
          created_at?: string | null
          credits: number
          id?: string
          price_cents: number
        }
        Update: {
          active?: boolean | null
          created_at?: string | null
          credits?: number
          id?: string
          price_cents?: number
        }
        Relationships: []
      }
      token_pricing_tiers: {
        Row: {
          active: boolean
          id: number
          min_qty: number
          unit_price_cents: number
        }
        Insert: {
          active?: boolean
          id?: number
          min_qty: number
          unit_price_cents: number
        }
        Update: {
          active?: boolean
          id?: number
          min_qty?: number
          unit_price_cents?: number
        }
        Relationships: []
      }
      token_transactions: {
        Row: {
          company_id: string
          created_at: string | null
          delta: number
          id: string
          idempotency_key: string | null
          profile_id: string | null
          reason: string
        }
        Insert: {
          company_id: string
          created_at?: string | null
          delta: number
          id?: string
          idempotency_key?: string | null
          profile_id?: string | null
          reason: string
        }
        Update: {
          company_id?: string
          created_at?: string | null
          delta?: number
          id?: string
          idempotency_key?: string | null
          profile_id?: string | null
          reason?: string
        }
        Relationships: [
          {
            foreignKeyName: "token_transactions_company_id_fkey"
            columns: ["company_id"]
            isOneToOne: false
            referencedRelation: "companies"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "token_transactions_company_id_fkey"
            columns: ["company_id"]
            isOneToOne: false
            referencedRelation: "companies_public_secure"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "token_transactions_company_id_fkey"
            columns: ["company_id"]
            isOneToOne: false
            referencedRelation: "company_need_quota"
            referencedColumns: ["company_id"]
          },
          {
            foreignKeyName: "token_transactions_company_id_fkey"
            columns: ["company_id"]
            isOneToOne: false
            referencedRelation: "company_unlock_stats"
            referencedColumns: ["company_id"]
          },
          {
            foreignKeyName: "token_transactions_company_id_fkey"
            columns: ["company_id"]
            isOneToOne: false
            referencedRelation: "v_company_profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "token_transactions_profile_id_fkey"
            columns: ["profile_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "token_transactions_profile_id_fkey"
            columns: ["profile_id"]
            isOneToOne: false
            referencedRelation: "profiles_public"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "token_transactions_profile_id_fkey"
            columns: ["profile_id"]
            isOneToOne: false
            referencedRelation: "profiles_public_secure"
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
            foreignKeyName: "tokens_used_company_id_fkey"
            columns: ["company_id"]
            isOneToOne: false
            referencedRelation: "companies_public_secure"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "tokens_used_company_id_fkey"
            columns: ["company_id"]
            isOneToOne: false
            referencedRelation: "company_need_quota"
            referencedColumns: ["company_id"]
          },
          {
            foreignKeyName: "tokens_used_company_id_fkey"
            columns: ["company_id"]
            isOneToOne: false
            referencedRelation: "company_unlock_stats"
            referencedColumns: ["company_id"]
          },
          {
            foreignKeyName: "tokens_used_company_id_fkey"
            columns: ["company_id"]
            isOneToOne: false
            referencedRelation: "v_company_profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "tokens_used_profile_id_fkey"
            columns: ["profile_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "tokens_used_profile_id_fkey"
            columns: ["profile_id"]
            isOneToOne: false
            referencedRelation: "profiles_public"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "tokens_used_profile_id_fkey"
            columns: ["profile_id"]
            isOneToOne: false
            referencedRelation: "profiles_public_secure"
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
      vocab_tags: {
        Row: {
          created_at: string
          id: string
          key: string
          label: string
          type: Database["public"]["Enums"]["tag_type"]
        }
        Insert: {
          created_at?: string
          id?: string
          key: string
          label: string
          type: Database["public"]["Enums"]["tag_type"]
        }
        Update: {
          created_at?: string
          id?: string
          key?: string
          label?: string
          type?: Database["public"]["Enums"]["tag_type"]
        }
        Relationships: []
      }
    }
    Views: {
      analytics_summary: {
        Row: {
          count: number | null
          date: string | null
          event_name: string | null
          event_type: string | null
        }
        Relationships: []
      }
      companies_public_secure: {
        Row: {
          created_at: string | null
          description: string | null
          founded_year: number | null
          id: string | null
          industry: string | null
          logo_url: string | null
          main_location: string | null
          name: string | null
          size_range: string | null
          website_url: string | null
        }
        Insert: {
          created_at?: string | null
          description?: string | null
          founded_year?: number | null
          id?: string | null
          industry?: string | null
          logo_url?: string | null
          main_location?: string | null
          name?: string | null
          size_range?: string | null
          website_url?: string | null
        }
        Update: {
          created_at?: string | null
          description?: string | null
          founded_year?: number | null
          id?: string | null
          industry?: string | null
          logo_url?: string | null
          main_location?: string | null
          name?: string | null
          size_range?: string | null
          website_url?: string | null
        }
        Relationships: []
      }
      company_conversion: {
        Row: {
          company_id: string | null
          conversion_rate_percent: number | null
          total_accepted: number | null
          total_declined: number | null
          total_pending: number | null
          total_requests: number | null
        }
        Relationships: [
          {
            foreignKeyName: "company_employment_requests_company_id_fkey"
            columns: ["company_id"]
            isOneToOne: false
            referencedRelation: "companies"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "company_employment_requests_company_id_fkey"
            columns: ["company_id"]
            isOneToOne: false
            referencedRelation: "companies_public_secure"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "company_employment_requests_company_id_fkey"
            columns: ["company_id"]
            isOneToOne: false
            referencedRelation: "company_need_quota"
            referencedColumns: ["company_id"]
          },
          {
            foreignKeyName: "company_employment_requests_company_id_fkey"
            columns: ["company_id"]
            isOneToOne: false
            referencedRelation: "company_unlock_stats"
            referencedColumns: ["company_id"]
          },
          {
            foreignKeyName: "company_employment_requests_company_id_fkey"
            columns: ["company_id"]
            isOneToOne: false
            referencedRelation: "v_company_profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      company_need_quota: {
        Row: {
          company_id: string | null
          included_needs: number | null
          need_credits: number | null
          remaining_needs: number | null
          used_needs: number | null
        }
        Relationships: []
      }
      company_token_stats: {
        Row: {
          available_tokens: number | null
          company_id: string | null
          tokens_used: number | null
          total_received: number | null
        }
        Insert: {
          available_tokens?: number | null
          company_id?: string | null
          tokens_used?: number | null
          total_received?: never
        }
        Update: {
          available_tokens?: number | null
          company_id?: string | null
          tokens_used?: number | null
          total_received?: never
        }
        Relationships: [
          {
            foreignKeyName: "company_token_wallets_company_id_fkey"
            columns: ["company_id"]
            isOneToOne: true
            referencedRelation: "companies"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "company_token_wallets_company_id_fkey"
            columns: ["company_id"]
            isOneToOne: true
            referencedRelation: "companies_public_secure"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "company_token_wallets_company_id_fkey"
            columns: ["company_id"]
            isOneToOne: true
            referencedRelation: "company_need_quota"
            referencedColumns: ["company_id"]
          },
          {
            foreignKeyName: "company_token_wallets_company_id_fkey"
            columns: ["company_id"]
            isOneToOne: true
            referencedRelation: "company_unlock_stats"
            referencedColumns: ["company_id"]
          },
          {
            foreignKeyName: "company_token_wallets_company_id_fkey"
            columns: ["company_id"]
            isOneToOne: true
            referencedRelation: "v_company_profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      company_unlock_stats: {
        Row: {
          active_tokens: number | null
          company_id: string | null
          company_name: string | null
          profiles_unlocked: number | null
          token_balance: number | null
          total_applications: number | null
          total_candidates: number | null
          unlocked_count: number | null
        }
        Relationships: []
      }
      geography_columns: {
        Row: {
          coord_dimension: number | null
          f_geography_column: unknown | null
          f_table_catalog: unknown | null
          f_table_name: unknown | null
          f_table_schema: unknown | null
          srid: number | null
          type: string | null
        }
        Relationships: []
      }
      geometry_columns: {
        Row: {
          coord_dimension: number | null
          f_geometry_column: unknown | null
          f_table_catalog: string | null
          f_table_name: unknown | null
          f_table_schema: unknown | null
          srid: number | null
          type: string | null
        }
        Insert: {
          coord_dimension?: number | null
          f_geometry_column?: unknown | null
          f_table_catalog?: string | null
          f_table_name?: unknown | null
          f_table_schema?: unknown | null
          srid?: number | null
          type?: string | null
        }
        Update: {
          coord_dimension?: number | null
          f_geometry_column?: unknown | null
          f_table_catalog?: string | null
          f_table_name?: unknown | null
          f_table_schema?: unknown | null
          srid?: number | null
          type?: string | null
        }
        Relationships: []
      }
      profiles_public: {
        Row: {
          avatar_url: string | null
          company_id: string | null
          company_logo: string | null
          company_name: string | null
          employment_status: string | null
          full_name: string | null
          id: string | null
          nachname: string | null
          vorname: string | null
        }
        Relationships: []
      }
      profiles_public_secure: {
        Row: {
          avatar_url: string | null
          branche: string | null
          company_id: string | null
          company_logo: string | null
          company_name: string | null
          employment_status: string | null
          full_name: string | null
          id: string | null
          nachname: string | null
          ort: string | null
          public_employment_visible: boolean | null
          public_profile_consent: boolean | null
          status: string | null
          vorname: string | null
        }
        Relationships: []
      }
      public_job_listings: {
        Row: {
          category: string | null
          city: string | null
          company_id: string | null
          company_name: string | null
          country: string | null
          description_snippet: string | null
          employment: string | null
          id: string | null
          published_at: string | null
          salary_currency: string | null
          salary_interval: string | null
          salary_max: number | null
          salary_min: number | null
          slug: string | null
          title: string | null
          work_mode: string | null
        }
        Relationships: [
          {
            foreignKeyName: "job_posts_company_id_fkey"
            columns: ["company_id"]
            isOneToOne: false
            referencedRelation: "companies"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "job_posts_company_id_fkey"
            columns: ["company_id"]
            isOneToOne: false
            referencedRelation: "companies_public_secure"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "job_posts_company_id_fkey"
            columns: ["company_id"]
            isOneToOne: false
            referencedRelation: "company_need_quota"
            referencedColumns: ["company_id"]
          },
          {
            foreignKeyName: "job_posts_company_id_fkey"
            columns: ["company_id"]
            isOneToOne: false
            referencedRelation: "company_unlock_stats"
            referencedColumns: ["company_id"]
          },
          {
            foreignKeyName: "job_posts_company_id_fkey"
            columns: ["company_id"]
            isOneToOne: false
            referencedRelation: "v_company_profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      v_company_profiles: {
        Row: {
          created_at: string | null
          description: string | null
          email: string | null
          id: string | null
          industry: string | null
          logo_url: string | null
          name: string | null
          role: string | null
          size_range: string | null
          updated_at: string | null
          user_id: string | null
        }
        Relationships: []
      }
    }
    Functions: {
      _add_col_if_missing: {
        Args: {
          p_column_def: string
          p_column_name: string
          p_table_name: string
        }
        Returns: undefined
      }
      _postgis_deprecate: {
        Args: { newname: string; oldname: string; version: string }
        Returns: undefined
      }
      _postgis_index_extent: {
        Args: { col: string; tbl: unknown }
        Returns: unknown
      }
      _postgis_pgsql_version: {
        Args: Record<PropertyKey, never>
        Returns: string
      }
      _postgis_scripts_pgsql_version: {
        Args: Record<PropertyKey, never>
        Returns: string
      }
      _postgis_selectivity: {
        Args: { att_name: string; geom: unknown; mode?: string; tbl: unknown }
        Returns: number
      }
      _st_3dintersects: {
        Args: { geom1: unknown; geom2: unknown }
        Returns: boolean
      }
      _st_bestsrid: {
        Args: { "": unknown }
        Returns: number
      }
      _st_contains: {
        Args: { geom1: unknown; geom2: unknown }
        Returns: boolean
      }
      _st_containsproperly: {
        Args: { geom1: unknown; geom2: unknown }
        Returns: boolean
      }
      _st_coveredby: {
        Args:
          | { geog1: unknown; geog2: unknown }
          | { geom1: unknown; geom2: unknown }
        Returns: boolean
      }
      _st_covers: {
        Args:
          | { geog1: unknown; geog2: unknown }
          | { geom1: unknown; geom2: unknown }
        Returns: boolean
      }
      _st_crosses: {
        Args: { geom1: unknown; geom2: unknown }
        Returns: boolean
      }
      _st_dwithin: {
        Args: {
          geog1: unknown
          geog2: unknown
          tolerance: number
          use_spheroid?: boolean
        }
        Returns: boolean
      }
      _st_equals: {
        Args: { geom1: unknown; geom2: unknown }
        Returns: boolean
      }
      _st_intersects: {
        Args: { geom1: unknown; geom2: unknown }
        Returns: boolean
      }
      _st_linecrossingdirection: {
        Args: { line1: unknown; line2: unknown }
        Returns: number
      }
      _st_longestline: {
        Args: { geom1: unknown; geom2: unknown }
        Returns: unknown
      }
      _st_maxdistance: {
        Args: { geom1: unknown; geom2: unknown }
        Returns: number
      }
      _st_orderingequals: {
        Args: { geom1: unknown; geom2: unknown }
        Returns: boolean
      }
      _st_overlaps: {
        Args: { geom1: unknown; geom2: unknown }
        Returns: boolean
      }
      _st_pointoutside: {
        Args: { "": unknown }
        Returns: unknown
      }
      _st_sortablehash: {
        Args: { geom: unknown }
        Returns: number
      }
      _st_touches: {
        Args: { geom1: unknown; geom2: unknown }
        Returns: boolean
      }
      _st_voronoi: {
        Args: {
          clip?: unknown
          g1: unknown
          return_polygons?: boolean
          tolerance?: number
        }
        Returns: unknown
      }
      _st_within: {
        Args: { geom1: unknown; geom2: unknown }
        Returns: boolean
      }
      add_community_comment: {
        Args:
          | {
              p_author_company_id?: string
              p_author_user_id?: string
              p_body_md: string
              p_parent_comment_id?: string
              p_post_id: string
            }
          | {
              p_author_user_id: string
              p_body_md: string
              p_parent_comment_id?: string
              p_post_id: string
            }
        Returns: string
      }
      add_company_user: {
        Args: { p_company_id: string; p_role?: string; p_user_id: string }
        Returns: undefined
      }
      add_linkedin_comment: {
        Args: {
          p_author_user_id: string
          p_body_md: string
          p_parent_comment_id?: string
          p_post_id: string
        }
        Returns: string
      }
      add_seats: {
        Args: { _add: number; _client_request_id?: string; _company_id: string }
        Returns: {
          new_seats: number
          paid_cents: number
        }[]
      }
      addauth: {
        Args: { "": string }
        Returns: boolean
      }
      addgeometrycolumn: {
        Args:
          | {
              catalog_name: string
              column_name: string
              new_dim: number
              new_srid_in: number
              new_type: string
              schema_name: string
              table_name: string
              use_typmod?: boolean
            }
          | {
              column_name: string
              new_dim: number
              new_srid: number
              new_type: string
              schema_name: string
              table_name: string
              use_typmod?: boolean
            }
          | {
              column_name: string
              new_dim: number
              new_srid: number
              new_type: string
              table_name: string
              use_typmod?: boolean
            }
        Returns: string
      }
      admin_add_tokens: {
        Args: { p_amount: number; p_company_id: string; p_reason?: string }
        Returns: undefined
      }
      admin_assign_plan: {
        Args: {
          p_billing_cycle?: string
          p_company_id: string
          p_custom_jobs?: number
          p_custom_price_monthly_cents?: number
          p_custom_price_yearly_cents?: number
          p_custom_seats?: number
          p_custom_tokens?: number
          p_notes?: string
          p_plan_id: string
          p_valid_from?: string
          p_valid_until?: string
        }
        Returns: undefined
      }
      apply_entitlements: {
        Args: {
          p_org_id: string
          p_plan: Database["public"]["Enums"]["plan_code"]
        }
        Returns: undefined
      }
      apply_from_community_post: {
        Args: {
          p_applicant_user_id: string
          p_cv_url?: string
          p_email: string
          p_full_name: string
          p_phone?: string
          p_post_id: string
        }
        Returns: string
      }
      apply_one_click: {
        Args: {
          p_cv_url?: string
          p_email: string
          p_full_name: string
          p_job: string
          p_phone?: string
        }
        Returns: string
      }
      approve_join_request: {
        Args: { approve: boolean; request_id: string }
        Returns: boolean
      }
      auto_freeze_unverified_companies: {
        Args: Record<PropertyKey, never>
        Returns: undefined
      }
      box: {
        Args: { "": unknown } | { "": unknown }
        Returns: unknown
      }
      box2d: {
        Args: { "": unknown } | { "": unknown }
        Returns: unknown
      }
      box2d_in: {
        Args: { "": unknown }
        Returns: unknown
      }
      box2d_out: {
        Args: { "": unknown }
        Returns: unknown
      }
      box2df_in: {
        Args: { "": unknown }
        Returns: unknown
      }
      box2df_out: {
        Args: { "": unknown }
        Returns: unknown
      }
      box3d: {
        Args: { "": unknown } | { "": unknown }
        Returns: unknown
      }
      box3d_in: {
        Args: { "": unknown }
        Returns: unknown
      }
      box3d_out: {
        Args: { "": unknown }
        Returns: unknown
      }
      box3dtobox: {
        Args: { "": unknown }
        Returns: unknown
      }
      bulk_stage_update: {
        Args: {
          p_company_id: string
          p_note?: string
          p_profile_ids: string[]
          p_stage: string
        }
        Returns: undefined
      }
      bytea: {
        Args: { "": unknown } | { "": unknown }
        Returns: string
      }
      can_access_conversation: {
        Args: { _conv_id: string; _uid: string }
        Returns: boolean
      }
      can_view_community_post: {
        Args: { p_post_id: string; p_viewer_id: string }
        Returns: boolean
      }
      can_view_post: {
        Args: { _post_id: string; _viewer: string }
        Returns: boolean
      }
      change_plan: {
        Args: {
          _client_request_id?: string
          _company_id: string
          _to_plan: string
        }
        Returns: {
          plan_id: string
          seats: number
          token_balance: number
        }[]
      }
      cleanup_expired_data: {
        Args: Record<PropertyKey, never>
        Returns: undefined
      }
      company_people_secure: {
        Args: { p_company_id: string }
        Returns: {
          avatar_url: string
          created_at: string
          full_name: string
          headline: string
          nachname: string
          user_id: string
          vorname: string
        }[]
      }
      compute_match_percent: {
        Args: {
          candidate_city: string
          candidate_skills: Json
          company_id: string
        }
        Returns: number
      }
      compute_need_candidate_score: {
        Args: { p_candidate_id: string; p_need_id: string }
        Returns: Json
      }
      consume_tokens: {
        Args: {
          _client_request_id?: string
          _company_id: string
          _qty: number
          _reason: string
          _ref?: string
        }
        Returns: number
      }
      coords_for_plz: {
        Args: { plz_input: string }
        Returns: {
          city: string
          lat: number
          lon: number
        }[]
      }
      create_community_post: {
        Args:
          | {
              p_actor_company_id?: string
              p_actor_user_id?: string
              p_body_md: string
              p_job_id?: string
              p_media?: Json
              p_visibility?: Database["public"]["Enums"]["post_visibility"]
            }
          | {
              p_actor_company_id?: string
              p_actor_user_id?: string
              p_body_md?: string
              p_job_id?: string
              p_media?: Json
              p_mentions?: Json
              p_post_kind?: Database["public"]["Enums"]["post_kind"]
              p_visibility?: Database["public"]["Enums"]["post_visibility"]
            }
        Returns: string
      }
      create_company_account: {
        Args: {
          p_city: string
          p_contact_person: string
          p_country: string
          p_created_by: string
          p_industry?: string
          p_name: string
          p_phone: string
          p_primary_email: string
          p_size_range: string
          p_website?: string
        }
        Returns: string
      }
      create_company_profile: {
        Args: {
          p_company_id: string
          p_contact_person?: string
          p_description?: string
          p_industry?: string
          p_location?: string
          p_name: string
          p_phone?: string
          p_website?: string
        }
        Returns: undefined
      }
      deduct_company_tokens: {
        Args: { company_uuid: string; token_amount: number }
        Returns: boolean
      }
      disablelongtransactions: {
        Args: Record<PropertyKey, never>
        Returns: string
      }
      dropgeometrycolumn: {
        Args:
          | {
              catalog_name: string
              column_name: string
              schema_name: string
              table_name: string
            }
          | { column_name: string; schema_name: string; table_name: string }
          | { column_name: string; table_name: string }
        Returns: string
      }
      dropgeometrytable: {
        Args:
          | { catalog_name: string; schema_name: string; table_name: string }
          | { schema_name: string; table_name: string }
          | { table_name: string }
        Returns: string
      }
      enablelongtransactions: {
        Args: Record<PropertyKey, never>
        Returns: string
      }
      ensure_community_preferences: {
        Args: { p_user_id: string }
        Returns: undefined
      }
      ensure_company_wallet: {
        Args: { p_company_id: string }
        Returns: string
      }
      ensure_job_slug: {
        Args: { p_job: string }
        Returns: string
      }
      equals: {
        Args: { geom1: unknown; geom2: unknown }
        Returns: boolean
      }
      finalize_onboarding_from_session: {
        Args: { p_session: string }
        Returns: string
      }
      find_locations_within_radius: {
        Args: { p_center_location_id: number; p_radius_km: number }
        Returns: {
          distance_km: number
          location_id: number
        }[]
      }
      find_profile_ids_within_radius: {
        Args: { p_center_location_id: number; p_radius_km: number }
        Returns: {
          distance_km: number
          profile_id: string
        }[]
      }
      fix_company_user_metadata: {
        Args: Record<PropertyKey, never>
        Returns: undefined
      }
      freeze_company_account: {
        Args: { p_company_id: string; p_reason: string }
        Returns: undefined
      }
      geography: {
        Args: { "": string } | { "": unknown }
        Returns: unknown
      }
      geography_analyze: {
        Args: { "": unknown }
        Returns: boolean
      }
      geography_gist_compress: {
        Args: { "": unknown }
        Returns: unknown
      }
      geography_gist_decompress: {
        Args: { "": unknown }
        Returns: unknown
      }
      geography_out: {
        Args: { "": unknown }
        Returns: unknown
      }
      geography_send: {
        Args: { "": unknown }
        Returns: string
      }
      geography_spgist_compress_nd: {
        Args: { "": unknown }
        Returns: unknown
      }
      geography_typmod_in: {
        Args: { "": unknown[] }
        Returns: number
      }
      geography_typmod_out: {
        Args: { "": number }
        Returns: unknown
      }
      geometry: {
        Args:
          | { "": string }
          | { "": string }
          | { "": unknown }
          | { "": unknown }
          | { "": unknown }
          | { "": unknown }
          | { "": unknown }
          | { "": unknown }
        Returns: unknown
      }
      geometry_above: {
        Args: { geom1: unknown; geom2: unknown }
        Returns: boolean
      }
      geometry_analyze: {
        Args: { "": unknown }
        Returns: boolean
      }
      geometry_below: {
        Args: { geom1: unknown; geom2: unknown }
        Returns: boolean
      }
      geometry_cmp: {
        Args: { geom1: unknown; geom2: unknown }
        Returns: number
      }
      geometry_contained_3d: {
        Args: { geom1: unknown; geom2: unknown }
        Returns: boolean
      }
      geometry_contains: {
        Args: { geom1: unknown; geom2: unknown }
        Returns: boolean
      }
      geometry_contains_3d: {
        Args: { geom1: unknown; geom2: unknown }
        Returns: boolean
      }
      geometry_distance_box: {
        Args: { geom1: unknown; geom2: unknown }
        Returns: number
      }
      geometry_distance_centroid: {
        Args: { geom1: unknown; geom2: unknown }
        Returns: number
      }
      geometry_eq: {
        Args: { geom1: unknown; geom2: unknown }
        Returns: boolean
      }
      geometry_ge: {
        Args: { geom1: unknown; geom2: unknown }
        Returns: boolean
      }
      geometry_gist_compress_2d: {
        Args: { "": unknown }
        Returns: unknown
      }
      geometry_gist_compress_nd: {
        Args: { "": unknown }
        Returns: unknown
      }
      geometry_gist_decompress_2d: {
        Args: { "": unknown }
        Returns: unknown
      }
      geometry_gist_decompress_nd: {
        Args: { "": unknown }
        Returns: unknown
      }
      geometry_gist_sortsupport_2d: {
        Args: { "": unknown }
        Returns: undefined
      }
      geometry_gt: {
        Args: { geom1: unknown; geom2: unknown }
        Returns: boolean
      }
      geometry_hash: {
        Args: { "": unknown }
        Returns: number
      }
      geometry_in: {
        Args: { "": unknown }
        Returns: unknown
      }
      geometry_le: {
        Args: { geom1: unknown; geom2: unknown }
        Returns: boolean
      }
      geometry_left: {
        Args: { geom1: unknown; geom2: unknown }
        Returns: boolean
      }
      geometry_lt: {
        Args: { geom1: unknown; geom2: unknown }
        Returns: boolean
      }
      geometry_out: {
        Args: { "": unknown }
        Returns: unknown
      }
      geometry_overabove: {
        Args: { geom1: unknown; geom2: unknown }
        Returns: boolean
      }
      geometry_overbelow: {
        Args: { geom1: unknown; geom2: unknown }
        Returns: boolean
      }
      geometry_overlaps: {
        Args: { geom1: unknown; geom2: unknown }
        Returns: boolean
      }
      geometry_overlaps_3d: {
        Args: { geom1: unknown; geom2: unknown }
        Returns: boolean
      }
      geometry_overleft: {
        Args: { geom1: unknown; geom2: unknown }
        Returns: boolean
      }
      geometry_overright: {
        Args: { geom1: unknown; geom2: unknown }
        Returns: boolean
      }
      geometry_recv: {
        Args: { "": unknown }
        Returns: unknown
      }
      geometry_right: {
        Args: { geom1: unknown; geom2: unknown }
        Returns: boolean
      }
      geometry_same: {
        Args: { geom1: unknown; geom2: unknown }
        Returns: boolean
      }
      geometry_same_3d: {
        Args: { geom1: unknown; geom2: unknown }
        Returns: boolean
      }
      geometry_send: {
        Args: { "": unknown }
        Returns: string
      }
      geometry_sortsupport: {
        Args: { "": unknown }
        Returns: undefined
      }
      geometry_spgist_compress_2d: {
        Args: { "": unknown }
        Returns: unknown
      }
      geometry_spgist_compress_3d: {
        Args: { "": unknown }
        Returns: unknown
      }
      geometry_spgist_compress_nd: {
        Args: { "": unknown }
        Returns: unknown
      }
      geometry_typmod_in: {
        Args: { "": unknown[] }
        Returns: number
      }
      geometry_typmod_out: {
        Args: { "": number }
        Returns: unknown
      }
      geometry_within: {
        Args: { geom1: unknown; geom2: unknown }
        Returns: boolean
      }
      geometrytype: {
        Args: { "": unknown } | { "": unknown }
        Returns: string
      }
      geomfromewkb: {
        Args: { "": string }
        Returns: unknown
      }
      geomfromewkt: {
        Args: { "": string }
        Returns: unknown
      }
      get_active_company_plan: {
        Args: { p_company_id: string }
        Returns: {
          billing_cycle: string
          jobs: number
          plan_id: string
          plan_name: string
          price_monthly_cents: number
          price_yearly_cents: number
          seats: number
          tokens: number
          valid_until: string
        }[]
      }
      get_activity_for_org: {
        Args: { p_limit?: number; p_offset?: number; p_org: string }
        Returns: {
          actor_org_id: string
          actor_user_id: string
          body_md: string
          comment_count: number
          comment_id: string
          created_at: string
          job_id: string
          kind: string
          like_count: number
          post_kind: Database["public"]["Enums"]["post_kind"]
          ref_id: string
          share_count: number
          share_id: string
        }[]
      }
      get_activity_for_user: {
        Args: { p_limit?: number; p_offset?: number; p_user: string }
        Returns: {
          actor_org_id: string
          actor_user_id: string
          body_md: string
          comment_count: number
          comment_id: string
          created_at: string
          job_id: string
          kind: string
          like_count: number
          post_kind: Database["public"]["Enums"]["post_kind"]
          ref_id: string
          share_count: number
          share_id: string
        }[]
      }
      get_authorized_applications: {
        Args: { p_company_id: string; p_requester_id: string }
        Returns: {
          application_id: string
          applied_at: string
          candidate_id: string
          candidate_name: string
          cover_letter: string
          job_id: string
          resume_url: string
          status: string
        }[]
      }
      get_authorized_candidates: {
        Args: { p_company_id: string; p_requester_id: string }
        Returns: {
          availability_date: string
          avatar_url: string
          candidate_id: string
          city: string
          experience_level: string
          full_name: string
          headline: string
          skills: string[]
        }[]
      }
      get_community_feed: {
        Args: { p_limit?: number; p_offset?: number; p_user_id: string }
        Returns: {
          actor_company_id: string
          actor_user_id: string
          applies_enabled: boolean
          body_md: string
          comment_count: number
          created_at: string
          id: string
          job_id: string
          like_count: number
          media: Json
          post_kind: Database["public"]["Enums"]["post_kind"]
          share_count: number
          updated_at: string
          visibility: Database["public"]["Enums"]["post_visibility"]
        }[]
      }
      get_community_preferences: {
        Args: { p_user_id: string }
        Returns: {
          blocked_ids: string[] | null
          created_at: string | null
          muted_company_ids: string[] | null
          muted_user_ids: string[] | null
          origin_filter: string | null
          radius_km: number | null
          show_company_posts: boolean | null
          show_job_shares: boolean | null
          show_user_posts: boolean | null
          updated_at: string | null
          user_id: string
        }
      }
      get_companies_public: {
        Args: { limit_count?: number; offset_count?: number; search?: string }
        Returns: {
          country: string
          created_at: string
          description: string
          header_image: string
          id: string
          industry: string
          instagram_url: string
          linkedin_url: string
          logo_url: string
          main_location: string
          name: string
          size_range: string
          website_url: string
        }[]
      }
      get_companies_public_by_ids: {
        Args: { ids: string[] }
        Returns: {
          id: string
          industry: string
          logo_url: string
          main_location: string
          name: string
        }[]
      }
      get_company_need_quota: {
        Args: { p_company_id: string }
        Returns: {
          company_id: string
          included_needs: number
          need_credits: number
          remaining_needs: number
          used_needs: number
        }[]
      }
      get_company_posts: {
        Args: { company_uuid: string }
        Returns: {
          comments_count: number
          content: string
          created_at: string
          id: string
          likes_count: number
        }[]
      }
      get_company_public: {
        Args: { p_id: string }
        Returns: {
          country: string
          created_at: string
          description: string
          employee_count: number
          header_image: string
          id: string
          industry: string
          instagram_url: string
          linkedin_url: string
          logo_url: string
          main_location: string
          mission_statement: string
          name: string
          size_range: string
          website_url: string
        }[]
      }
      get_company_token_balance: {
        Args: { company_uuid: string }
        Returns: number
      }
      get_feed_sorted: {
        Args: {
          after_id?: string
          after_published?: string
          limit_count?: number
          sort?: string
          viewer_id: string
        }
        Returns: {
          author_id: string
          author_type: string
          celebration: boolean
          comment_count: number
          content: string
          created_at: string
          id: string
          image_url: string
          like_count: number
          link_url: string
          published_at: string
          repost_count: number
          scheduled_at: string
          status: string
          updated_at: string
          user_id: string
          visibility: string
        }[]
      }
      get_matches_for_need: {
        Args: { p_limit?: number; p_need_id: string }
        Returns: {
          breakdown: Json
          candidate_id: string
          passed_gates: boolean
          score: number
        }[]
      }
      get_proj4_from_srid: {
        Args: { "": number }
        Returns: string
      }
      get_token_unit_price_cents: {
        Args: { qty: number }
        Returns: number
      }
      get_user_company_id: {
        Args: Record<PropertyKey, never>
        Returns: string
      }
      get_user_company_role: {
        Args: { _company_id: string; _user_id: string }
        Returns: string
      }
      get_user_posts: {
        Args: { user_uuid: string }
        Returns: {
          comments_count: number
          content: string
          created_at: string
          id: string
          likes_count: number
        }[]
      }
      get_users_near_company: {
        Args: { p_company_id: string; p_radius_km: number }
        Returns: {
          abschlussjahr: string | null
          abschlussjahr_ausgelernt: string | null
          account_created: boolean | null
          address_confirmed: boolean | null
          aktueller_beruf: string | null
          ausbildungsberuf: string | null
          ausbildungsbetrieb: string | null
          avatar_url: string | null
          berufserfahrung: Json | null
          bio: string | null
          branche: string | null
          company_name: string | null
          consent_date: string | null
          cover_image_url: string | null
          created_at: string | null
          current_company_id: string | null
          cv_url: string | null
          data_processing_consent: boolean | null
          data_retention_until: string | null
          display_name: string | null
          driver_license_class: string | null
          einwilligung: boolean | null
          email: string | null
          employer_free: string | null
          employer_slogan: string | null
          employment_status: string | null
          faehigkeiten: Json | null
          first_dashboard_seen: boolean | null
          first_name: string | null
          first_profile_saved: boolean | null
          full_name: string | null
          geburtsdatum: string | null
          geplanter_abschluss: string | null
          has_drivers_license: boolean | null
          has_own_vehicle: boolean | null
          hausnummer: string | null
          headline: string | null
          house_number: string | null
          id: string
          job_search_preferences: string[]
          job_title: string | null
          kenntnisse: string | null
          last_name: string | null
          latitude: number | null
          layout: number | null
          location_id: number | null
          login_count: number | null
          longitude: number | null
          marketing_consent: boolean | null
          motivation: string | null
          nachname: string | null
          onboarding_completed: boolean | null
          open_to_work: boolean | null
          ort: string | null
          plz: string | null
          postal_code: string | null
          praktische_erfahrung: string | null
          profile_complete: boolean | null
          profile_published: boolean | null
          public_employment_visible: boolean | null
          public_profile_consent: boolean | null
          schulbildung: Json | null
          schule: string | null
          sprachen: Json | null
          startjahr: string | null
          status: string | null
          strasse: string | null
          street: string | null
          target_year: string | null
          telefon: string | null
          uebermich: string | null
          updated_at: string | null
          visibility_industry: Json | null
          visibility_mode: string | null
          visibility_prompt_shown: boolean | null
          visibility_region: Json | null
          voraussichtliches_ende: string | null
          vorname: string | null
        }[]
      }
      get_users_near_location: {
        Args: { p_loc_id: number; p_radius_km: number }
        Returns: {
          distance_km: number
          profile_id: string
        }[]
      }
      gettransactionid: {
        Args: Record<PropertyKey, never>
        Returns: unknown
      }
      gidx_in: {
        Args: { "": unknown }
        Returns: unknown
      }
      gidx_out: {
        Args: { "": unknown }
        Returns: unknown
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
      has_company_access: {
        Args: { _company_id: string }
        Returns: boolean
      }
      has_role: {
        Args: {
          _role: Database["public"]["Enums"]["app_role"]
          _user_id: string
        }
        Returns: boolean
      }
      increment_login_count: {
        Args: { user_id: string }
        Returns: number
      }
      is_company_admin: {
        Args: { _company_id: string }
        Returns: boolean
      }
      is_company_member: {
        Args: Record<PropertyKey, never>
        Returns: boolean
      }
      is_company_member_uid: {
        Args: { _uid: string }
        Returns: boolean
      }
      is_company_user: {
        Args: Record<PropertyKey, never>
        Returns: boolean
      }
      is_connected: {
        Args: { _u1: string; _u2: string }
        Returns: boolean
      }
      is_content_editor: {
        Args: { _uid?: string }
        Returns: boolean
      }
      is_group_member: {
        Args: { _group_id: string }
        Returns: boolean
      }
      is_public_group: {
        Args: { _group_id: string }
        Returns: boolean
      }
      join_group: {
        Args: { group_uuid: string; join_message?: string }
        Returns: string
      }
      json: {
        Args: { "": unknown }
        Returns: Json
      }
      jsonb: {
        Args: { "": unknown }
        Returns: Json
      }
      log_security_event: {
        Args: {
          p_action: string
          p_resource_id?: string
          p_resource_type: string
        }
        Returns: undefined
      }
      longtransactionsenabled: {
        Args: Record<PropertyKey, never>
        Returns: boolean
      }
      match_candidates_for_company: {
        Args: { p_company: string; p_limit?: number }
        Returns: {
          display_name: string
          profile_id: string
          reasons: string[]
          score: number
        }[]
      }
      must_set_password: {
        Args: Record<PropertyKey, never>
        Returns: boolean
      }
      path: {
        Args: { "": unknown }
        Returns: unknown
      }
      pgis_asflatgeobuf_finalfn: {
        Args: { "": unknown }
        Returns: string
      }
      pgis_asgeobuf_finalfn: {
        Args: { "": unknown }
        Returns: string
      }
      pgis_asmvt_finalfn: {
        Args: { "": unknown }
        Returns: string
      }
      pgis_asmvt_serialfn: {
        Args: { "": unknown }
        Returns: string
      }
      pgis_geometry_clusterintersecting_finalfn: {
        Args: { "": unknown }
        Returns: unknown[]
      }
      pgis_geometry_clusterwithin_finalfn: {
        Args: { "": unknown }
        Returns: unknown[]
      }
      pgis_geometry_collect_finalfn: {
        Args: { "": unknown }
        Returns: unknown
      }
      pgis_geometry_makeline_finalfn: {
        Args: { "": unknown }
        Returns: unknown
      }
      pgis_geometry_polygonize_finalfn: {
        Args: { "": unknown }
        Returns: unknown
      }
      pgis_geometry_union_parallel_finalfn: {
        Args: { "": unknown }
        Returns: unknown
      }
      pgis_geometry_union_parallel_serialfn: {
        Args: { "": unknown }
        Returns: string
      }
      point: {
        Args: { "": unknown }
        Returns: unknown
      }
      polygon: {
        Args: { "": unknown }
        Returns: unknown
      }
      populate_geometry_columns: {
        Args:
          | { tbl_oid: unknown; use_typmod?: boolean }
          | { use_typmod?: boolean }
        Returns: string
      }
      postgis_addbbox: {
        Args: { "": unknown }
        Returns: unknown
      }
      postgis_constraint_dims: {
        Args: { geomcolumn: string; geomschema: string; geomtable: string }
        Returns: number
      }
      postgis_constraint_srid: {
        Args: { geomcolumn: string; geomschema: string; geomtable: string }
        Returns: number
      }
      postgis_constraint_type: {
        Args: { geomcolumn: string; geomschema: string; geomtable: string }
        Returns: string
      }
      postgis_dropbbox: {
        Args: { "": unknown }
        Returns: unknown
      }
      postgis_extensions_upgrade: {
        Args: Record<PropertyKey, never>
        Returns: string
      }
      postgis_full_version: {
        Args: Record<PropertyKey, never>
        Returns: string
      }
      postgis_geos_noop: {
        Args: { "": unknown }
        Returns: unknown
      }
      postgis_geos_version: {
        Args: Record<PropertyKey, never>
        Returns: string
      }
      postgis_getbbox: {
        Args: { "": unknown }
        Returns: unknown
      }
      postgis_hasbbox: {
        Args: { "": unknown }
        Returns: boolean
      }
      postgis_index_supportfn: {
        Args: { "": unknown }
        Returns: unknown
      }
      postgis_lib_build_date: {
        Args: Record<PropertyKey, never>
        Returns: string
      }
      postgis_lib_revision: {
        Args: Record<PropertyKey, never>
        Returns: string
      }
      postgis_lib_version: {
        Args: Record<PropertyKey, never>
        Returns: string
      }
      postgis_libjson_version: {
        Args: Record<PropertyKey, never>
        Returns: string
      }
      postgis_liblwgeom_version: {
        Args: Record<PropertyKey, never>
        Returns: string
      }
      postgis_libprotobuf_version: {
        Args: Record<PropertyKey, never>
        Returns: string
      }
      postgis_libxml_version: {
        Args: Record<PropertyKey, never>
        Returns: string
      }
      postgis_noop: {
        Args: { "": unknown }
        Returns: unknown
      }
      postgis_proj_version: {
        Args: Record<PropertyKey, never>
        Returns: string
      }
      postgis_scripts_build_date: {
        Args: Record<PropertyKey, never>
        Returns: string
      }
      postgis_scripts_installed: {
        Args: Record<PropertyKey, never>
        Returns: string
      }
      postgis_scripts_released: {
        Args: Record<PropertyKey, never>
        Returns: string
      }
      postgis_svn_version: {
        Args: Record<PropertyKey, never>
        Returns: string
      }
      postgis_type_name: {
        Args: {
          coord_dimension: number
          geomname: string
          use_new_name?: boolean
        }
        Returns: string
      }
      postgis_typmod_dims: {
        Args: { "": number }
        Returns: number
      }
      postgis_typmod_srid: {
        Args: { "": number }
        Returns: number
      }
      postgis_typmod_type: {
        Args: { "": number }
        Returns: string
      }
      postgis_version: {
        Args: Record<PropertyKey, never>
        Returns: string
      }
      postgis_wagyu_version: {
        Args: Record<PropertyKey, never>
        Returns: string
      }
      profiles_with_match: {
        Args: {
          p_company_id: string
          p_limit?: number
          p_offset?: number
          p_variant?: string
        }
        Returns: {
          avatar_url: string
          city: string
          fs: string
          id: string
          match: number
          name: string
          role: string
          seeking: string
          skills: string[]
        }[]
      }
      publish_requirement_profile: {
        Args: { p_profile: string; p_public?: boolean }
        Returns: string
      }
      purchase_tokens: {
        Args: { _client_request_id?: string; _company_id: string; _qty: number }
        Returns: {
          new_balance: number
          paid_cents: number
        }[]
      }
      refill_monthly_tokens: {
        Args: Record<PropertyKey, never>
        Returns: undefined
      }
      resolve_location_id: {
        Args: { p_city: string; p_country_code?: string; p_postal_code: string }
        Returns: number
      }
      search_candidates_within_radius: {
        Args: { lat_input: number; lon_input: number; radius_km: number }
        Returns: {
          city: string
          distance_km: number
          postal_code: string
          profile_id: string
        }[]
      }
      search_companies_for_claim: {
        Args: { limit?: number; q?: string }
        Returns: {
          id: string
          logo_url: string
          name: string
          slug: string
        }[]
      }
      search_companies_within_radius: {
        Args: { lat_input: number; lon_input: number; radius_km: number }
        Returns: {
          city: string
          company_id: string
          distance_km: number
          name: string
          postal_code: string
        }[]
      }
      set_community_preferences: {
        Args: {
          p_muted_company_ids?: string[]
          p_muted_user_ids?: string[]
          p_origin_filter?: string
          p_radius_km?: number
          p_show_company_posts?: boolean
          p_show_job_shares?: boolean
          p_show_user_posts?: boolean
          p_user_id: string
        }
        Returns: {
          blocked_ids: string[] | null
          created_at: string | null
          muted_company_ids: string[] | null
          muted_user_ids: string[] | null
          origin_filter: string | null
          radius_km: number | null
          show_company_posts: boolean | null
          show_job_shares: boolean | null
          show_user_posts: boolean | null
          updated_at: string | null
          user_id: string
        }
      }
      set_limit: {
        Args: { "": number }
        Returns: number
      }
      share_community_post: {
        Args:
          | {
              p_comment?: string
              p_post_id: string
              p_sharer_company_id?: string
              p_sharer_user_id?: string
            }
          | { p_post_id: string; p_sharer_user_id: string }
        Returns: string
      }
      share_job_as_post: {
        Args: {
          p_company_id: string
          p_custom_message?: string
          p_job_id: string
          p_visibility?: Database["public"]["Enums"]["post_visibility"]
        }
        Returns: string
      }
      show_limit: {
        Args: Record<PropertyKey, never>
        Returns: number
      }
      show_trgm: {
        Args: { "": string }
        Returns: string[]
      }
      slugify: {
        Args: { txt: string }
        Returns: string
      }
      spheroid_in: {
        Args: { "": unknown }
        Returns: unknown
      }
      spheroid_out: {
        Args: { "": unknown }
        Returns: unknown
      }
      st_3dclosestpoint: {
        Args: { geom1: unknown; geom2: unknown }
        Returns: unknown
      }
      st_3ddistance: {
        Args: { geom1: unknown; geom2: unknown }
        Returns: number
      }
      st_3dintersects: {
        Args: { geom1: unknown; geom2: unknown }
        Returns: boolean
      }
      st_3dlength: {
        Args: { "": unknown }
        Returns: number
      }
      st_3dlongestline: {
        Args: { geom1: unknown; geom2: unknown }
        Returns: unknown
      }
      st_3dmakebox: {
        Args: { geom1: unknown; geom2: unknown }
        Returns: unknown
      }
      st_3dmaxdistance: {
        Args: { geom1: unknown; geom2: unknown }
        Returns: number
      }
      st_3dperimeter: {
        Args: { "": unknown }
        Returns: number
      }
      st_3dshortestline: {
        Args: { geom1: unknown; geom2: unknown }
        Returns: unknown
      }
      st_addpoint: {
        Args: { geom1: unknown; geom2: unknown }
        Returns: unknown
      }
      st_angle: {
        Args:
          | { line1: unknown; line2: unknown }
          | { pt1: unknown; pt2: unknown; pt3: unknown; pt4?: unknown }
        Returns: number
      }
      st_area: {
        Args:
          | { "": string }
          | { "": unknown }
          | { geog: unknown; use_spheroid?: boolean }
        Returns: number
      }
      st_area2d: {
        Args: { "": unknown }
        Returns: number
      }
      st_asbinary: {
        Args: { "": unknown } | { "": unknown }
        Returns: string
      }
      st_asencodedpolyline: {
        Args: { geom: unknown; nprecision?: number }
        Returns: string
      }
      st_asewkb: {
        Args: { "": unknown }
        Returns: string
      }
      st_asewkt: {
        Args: { "": string } | { "": unknown } | { "": unknown }
        Returns: string
      }
      st_asgeojson: {
        Args:
          | { "": string }
          | { geog: unknown; maxdecimaldigits?: number; options?: number }
          | { geom: unknown; maxdecimaldigits?: number; options?: number }
          | {
              geom_column?: string
              maxdecimaldigits?: number
              pretty_bool?: boolean
              r: Record<string, unknown>
            }
        Returns: string
      }
      st_asgml: {
        Args:
          | { "": string }
          | {
              geog: unknown
              id?: string
              maxdecimaldigits?: number
              nprefix?: string
              options?: number
            }
          | {
              geog: unknown
              id?: string
              maxdecimaldigits?: number
              nprefix?: string
              options?: number
              version: number
            }
          | {
              geom: unknown
              id?: string
              maxdecimaldigits?: number
              nprefix?: string
              options?: number
              version: number
            }
          | { geom: unknown; maxdecimaldigits?: number; options?: number }
        Returns: string
      }
      st_ashexewkb: {
        Args: { "": unknown }
        Returns: string
      }
      st_askml: {
        Args:
          | { "": string }
          | { geog: unknown; maxdecimaldigits?: number; nprefix?: string }
          | { geom: unknown; maxdecimaldigits?: number; nprefix?: string }
        Returns: string
      }
      st_aslatlontext: {
        Args: { geom: unknown; tmpl?: string }
        Returns: string
      }
      st_asmarc21: {
        Args: { format?: string; geom: unknown }
        Returns: string
      }
      st_asmvtgeom: {
        Args: {
          bounds: unknown
          buffer?: number
          clip_geom?: boolean
          extent?: number
          geom: unknown
        }
        Returns: unknown
      }
      st_assvg: {
        Args:
          | { "": string }
          | { geog: unknown; maxdecimaldigits?: number; rel?: number }
          | { geom: unknown; maxdecimaldigits?: number; rel?: number }
        Returns: string
      }
      st_astext: {
        Args: { "": string } | { "": unknown } | { "": unknown }
        Returns: string
      }
      st_astwkb: {
        Args:
          | {
              geom: unknown[]
              ids: number[]
              prec?: number
              prec_m?: number
              prec_z?: number
              with_boxes?: boolean
              with_sizes?: boolean
            }
          | {
              geom: unknown
              prec?: number
              prec_m?: number
              prec_z?: number
              with_boxes?: boolean
              with_sizes?: boolean
            }
        Returns: string
      }
      st_asx3d: {
        Args: { geom: unknown; maxdecimaldigits?: number; options?: number }
        Returns: string
      }
      st_azimuth: {
        Args:
          | { geog1: unknown; geog2: unknown }
          | { geom1: unknown; geom2: unknown }
        Returns: number
      }
      st_boundary: {
        Args: { "": unknown }
        Returns: unknown
      }
      st_boundingdiagonal: {
        Args: { fits?: boolean; geom: unknown }
        Returns: unknown
      }
      st_buffer: {
        Args:
          | { geom: unknown; options?: string; radius: number }
          | { geom: unknown; quadsegs: number; radius: number }
        Returns: unknown
      }
      st_buildarea: {
        Args: { "": unknown }
        Returns: unknown
      }
      st_centroid: {
        Args: { "": string } | { "": unknown }
        Returns: unknown
      }
      st_cleangeometry: {
        Args: { "": unknown }
        Returns: unknown
      }
      st_clipbybox2d: {
        Args: { box: unknown; geom: unknown }
        Returns: unknown
      }
      st_closestpoint: {
        Args: { geom1: unknown; geom2: unknown }
        Returns: unknown
      }
      st_clusterintersecting: {
        Args: { "": unknown[] }
        Returns: unknown[]
      }
      st_collect: {
        Args: { "": unknown[] } | { geom1: unknown; geom2: unknown }
        Returns: unknown
      }
      st_collectionextract: {
        Args: { "": unknown }
        Returns: unknown
      }
      st_collectionhomogenize: {
        Args: { "": unknown }
        Returns: unknown
      }
      st_concavehull: {
        Args: {
          param_allow_holes?: boolean
          param_geom: unknown
          param_pctconvex: number
        }
        Returns: unknown
      }
      st_contains: {
        Args: { geom1: unknown; geom2: unknown }
        Returns: boolean
      }
      st_containsproperly: {
        Args: { geom1: unknown; geom2: unknown }
        Returns: boolean
      }
      st_convexhull: {
        Args: { "": unknown }
        Returns: unknown
      }
      st_coorddim: {
        Args: { geometry: unknown }
        Returns: number
      }
      st_coveredby: {
        Args:
          | { geog1: unknown; geog2: unknown }
          | { geom1: unknown; geom2: unknown }
        Returns: boolean
      }
      st_covers: {
        Args:
          | { geog1: unknown; geog2: unknown }
          | { geom1: unknown; geom2: unknown }
        Returns: boolean
      }
      st_crosses: {
        Args: { geom1: unknown; geom2: unknown }
        Returns: boolean
      }
      st_curvetoline: {
        Args: { flags?: number; geom: unknown; tol?: number; toltype?: number }
        Returns: unknown
      }
      st_delaunaytriangles: {
        Args: { flags?: number; g1: unknown; tolerance?: number }
        Returns: unknown
      }
      st_difference: {
        Args: { geom1: unknown; geom2: unknown; gridsize?: number }
        Returns: unknown
      }
      st_dimension: {
        Args: { "": unknown }
        Returns: number
      }
      st_disjoint: {
        Args: { geom1: unknown; geom2: unknown }
        Returns: boolean
      }
      st_distance: {
        Args:
          | { geog1: unknown; geog2: unknown; use_spheroid?: boolean }
          | { geom1: unknown; geom2: unknown }
        Returns: number
      }
      st_distancesphere: {
        Args:
          | { geom1: unknown; geom2: unknown }
          | { geom1: unknown; geom2: unknown; radius: number }
        Returns: number
      }
      st_distancespheroid: {
        Args: { geom1: unknown; geom2: unknown }
        Returns: number
      }
      st_dump: {
        Args: { "": unknown }
        Returns: Database["public"]["CompositeTypes"]["geometry_dump"][]
      }
      st_dumppoints: {
        Args: { "": unknown }
        Returns: Database["public"]["CompositeTypes"]["geometry_dump"][]
      }
      st_dumprings: {
        Args: { "": unknown }
        Returns: Database["public"]["CompositeTypes"]["geometry_dump"][]
      }
      st_dumpsegments: {
        Args: { "": unknown }
        Returns: Database["public"]["CompositeTypes"]["geometry_dump"][]
      }
      st_dwithin: {
        Args: {
          geog1: unknown
          geog2: unknown
          tolerance: number
          use_spheroid?: boolean
        }
        Returns: boolean
      }
      st_endpoint: {
        Args: { "": unknown }
        Returns: unknown
      }
      st_envelope: {
        Args: { "": unknown }
        Returns: unknown
      }
      st_equals: {
        Args: { geom1: unknown; geom2: unknown }
        Returns: boolean
      }
      st_expand: {
        Args:
          | { box: unknown; dx: number; dy: number }
          | { box: unknown; dx: number; dy: number; dz?: number }
          | { dm?: number; dx: number; dy: number; dz?: number; geom: unknown }
        Returns: unknown
      }
      st_exteriorring: {
        Args: { "": unknown }
        Returns: unknown
      }
      st_flipcoordinates: {
        Args: { "": unknown }
        Returns: unknown
      }
      st_force2d: {
        Args: { "": unknown }
        Returns: unknown
      }
      st_force3d: {
        Args: { geom: unknown; zvalue?: number }
        Returns: unknown
      }
      st_force3dm: {
        Args: { geom: unknown; mvalue?: number }
        Returns: unknown
      }
      st_force3dz: {
        Args: { geom: unknown; zvalue?: number }
        Returns: unknown
      }
      st_force4d: {
        Args: { geom: unknown; mvalue?: number; zvalue?: number }
        Returns: unknown
      }
      st_forcecollection: {
        Args: { "": unknown }
        Returns: unknown
      }
      st_forcecurve: {
        Args: { "": unknown }
        Returns: unknown
      }
      st_forcepolygonccw: {
        Args: { "": unknown }
        Returns: unknown
      }
      st_forcepolygoncw: {
        Args: { "": unknown }
        Returns: unknown
      }
      st_forcerhr: {
        Args: { "": unknown }
        Returns: unknown
      }
      st_forcesfs: {
        Args: { "": unknown }
        Returns: unknown
      }
      st_generatepoints: {
        Args:
          | { area: unknown; npoints: number }
          | { area: unknown; npoints: number; seed: number }
        Returns: unknown
      }
      st_geogfromtext: {
        Args: { "": string }
        Returns: unknown
      }
      st_geogfromwkb: {
        Args: { "": string }
        Returns: unknown
      }
      st_geographyfromtext: {
        Args: { "": string }
        Returns: unknown
      }
      st_geohash: {
        Args:
          | { geog: unknown; maxchars?: number }
          | { geom: unknown; maxchars?: number }
        Returns: string
      }
      st_geomcollfromtext: {
        Args: { "": string }
        Returns: unknown
      }
      st_geomcollfromwkb: {
        Args: { "": string }
        Returns: unknown
      }
      st_geometricmedian: {
        Args: {
          fail_if_not_converged?: boolean
          g: unknown
          max_iter?: number
          tolerance?: number
        }
        Returns: unknown
      }
      st_geometryfromtext: {
        Args: { "": string }
        Returns: unknown
      }
      st_geometrytype: {
        Args: { "": unknown }
        Returns: string
      }
      st_geomfromewkb: {
        Args: { "": string }
        Returns: unknown
      }
      st_geomfromewkt: {
        Args: { "": string }
        Returns: unknown
      }
      st_geomfromgeojson: {
        Args: { "": Json } | { "": Json } | { "": string }
        Returns: unknown
      }
      st_geomfromgml: {
        Args: { "": string }
        Returns: unknown
      }
      st_geomfromkml: {
        Args: { "": string }
        Returns: unknown
      }
      st_geomfrommarc21: {
        Args: { marc21xml: string }
        Returns: unknown
      }
      st_geomfromtext: {
        Args: { "": string }
        Returns: unknown
      }
      st_geomfromtwkb: {
        Args: { "": string }
        Returns: unknown
      }
      st_geomfromwkb: {
        Args: { "": string }
        Returns: unknown
      }
      st_gmltosql: {
        Args: { "": string }
        Returns: unknown
      }
      st_hasarc: {
        Args: { geometry: unknown }
        Returns: boolean
      }
      st_hausdorffdistance: {
        Args: { geom1: unknown; geom2: unknown }
        Returns: number
      }
      st_hexagon: {
        Args: { cell_i: number; cell_j: number; origin?: unknown; size: number }
        Returns: unknown
      }
      st_hexagongrid: {
        Args: { bounds: unknown; size: number }
        Returns: Record<string, unknown>[]
      }
      st_interpolatepoint: {
        Args: { line: unknown; point: unknown }
        Returns: number
      }
      st_intersection: {
        Args: { geom1: unknown; geom2: unknown; gridsize?: number }
        Returns: unknown
      }
      st_intersects: {
        Args:
          | { geog1: unknown; geog2: unknown }
          | { geom1: unknown; geom2: unknown }
        Returns: boolean
      }
      st_isclosed: {
        Args: { "": unknown }
        Returns: boolean
      }
      st_iscollection: {
        Args: { "": unknown }
        Returns: boolean
      }
      st_isempty: {
        Args: { "": unknown }
        Returns: boolean
      }
      st_ispolygonccw: {
        Args: { "": unknown }
        Returns: boolean
      }
      st_ispolygoncw: {
        Args: { "": unknown }
        Returns: boolean
      }
      st_isring: {
        Args: { "": unknown }
        Returns: boolean
      }
      st_issimple: {
        Args: { "": unknown }
        Returns: boolean
      }
      st_isvalid: {
        Args: { "": unknown }
        Returns: boolean
      }
      st_isvaliddetail: {
        Args: { flags?: number; geom: unknown }
        Returns: Database["public"]["CompositeTypes"]["valid_detail"]
      }
      st_isvalidreason: {
        Args: { "": unknown }
        Returns: string
      }
      st_isvalidtrajectory: {
        Args: { "": unknown }
        Returns: boolean
      }
      st_length: {
        Args:
          | { "": string }
          | { "": unknown }
          | { geog: unknown; use_spheroid?: boolean }
        Returns: number
      }
      st_length2d: {
        Args: { "": unknown }
        Returns: number
      }
      st_letters: {
        Args: { font?: Json; letters: string }
        Returns: unknown
      }
      st_linecrossingdirection: {
        Args: { line1: unknown; line2: unknown }
        Returns: number
      }
      st_linefromencodedpolyline: {
        Args: { nprecision?: number; txtin: string }
        Returns: unknown
      }
      st_linefrommultipoint: {
        Args: { "": unknown }
        Returns: unknown
      }
      st_linefromtext: {
        Args: { "": string }
        Returns: unknown
      }
      st_linefromwkb: {
        Args: { "": string }
        Returns: unknown
      }
      st_linelocatepoint: {
        Args: { geom1: unknown; geom2: unknown }
        Returns: number
      }
      st_linemerge: {
        Args: { "": unknown }
        Returns: unknown
      }
      st_linestringfromwkb: {
        Args: { "": string }
        Returns: unknown
      }
      st_linetocurve: {
        Args: { geometry: unknown }
        Returns: unknown
      }
      st_locatealong: {
        Args: { geometry: unknown; leftrightoffset?: number; measure: number }
        Returns: unknown
      }
      st_locatebetween: {
        Args: {
          frommeasure: number
          geometry: unknown
          leftrightoffset?: number
          tomeasure: number
        }
        Returns: unknown
      }
      st_locatebetweenelevations: {
        Args: { fromelevation: number; geometry: unknown; toelevation: number }
        Returns: unknown
      }
      st_longestline: {
        Args: { geom1: unknown; geom2: unknown }
        Returns: unknown
      }
      st_m: {
        Args: { "": unknown }
        Returns: number
      }
      st_makebox2d: {
        Args: { geom1: unknown; geom2: unknown }
        Returns: unknown
      }
      st_makeline: {
        Args: { "": unknown[] } | { geom1: unknown; geom2: unknown }
        Returns: unknown
      }
      st_makepolygon: {
        Args: { "": unknown }
        Returns: unknown
      }
      st_makevalid: {
        Args: { "": unknown } | { geom: unknown; params: string }
        Returns: unknown
      }
      st_maxdistance: {
        Args: { geom1: unknown; geom2: unknown }
        Returns: number
      }
      st_maximuminscribedcircle: {
        Args: { "": unknown }
        Returns: Record<string, unknown>
      }
      st_memsize: {
        Args: { "": unknown }
        Returns: number
      }
      st_minimumboundingcircle: {
        Args: { inputgeom: unknown; segs_per_quarter?: number }
        Returns: unknown
      }
      st_minimumboundingradius: {
        Args: { "": unknown }
        Returns: Record<string, unknown>
      }
      st_minimumclearance: {
        Args: { "": unknown }
        Returns: number
      }
      st_minimumclearanceline: {
        Args: { "": unknown }
        Returns: unknown
      }
      st_mlinefromtext: {
        Args: { "": string }
        Returns: unknown
      }
      st_mlinefromwkb: {
        Args: { "": string }
        Returns: unknown
      }
      st_mpointfromtext: {
        Args: { "": string }
        Returns: unknown
      }
      st_mpointfromwkb: {
        Args: { "": string }
        Returns: unknown
      }
      st_mpolyfromtext: {
        Args: { "": string }
        Returns: unknown
      }
      st_mpolyfromwkb: {
        Args: { "": string }
        Returns: unknown
      }
      st_multi: {
        Args: { "": unknown }
        Returns: unknown
      }
      st_multilinefromwkb: {
        Args: { "": string }
        Returns: unknown
      }
      st_multilinestringfromtext: {
        Args: { "": string }
        Returns: unknown
      }
      st_multipointfromtext: {
        Args: { "": string }
        Returns: unknown
      }
      st_multipointfromwkb: {
        Args: { "": string }
        Returns: unknown
      }
      st_multipolyfromwkb: {
        Args: { "": string }
        Returns: unknown
      }
      st_multipolygonfromtext: {
        Args: { "": string }
        Returns: unknown
      }
      st_ndims: {
        Args: { "": unknown }
        Returns: number
      }
      st_node: {
        Args: { g: unknown }
        Returns: unknown
      }
      st_normalize: {
        Args: { geom: unknown }
        Returns: unknown
      }
      st_npoints: {
        Args: { "": unknown }
        Returns: number
      }
      st_nrings: {
        Args: { "": unknown }
        Returns: number
      }
      st_numgeometries: {
        Args: { "": unknown }
        Returns: number
      }
      st_numinteriorring: {
        Args: { "": unknown }
        Returns: number
      }
      st_numinteriorrings: {
        Args: { "": unknown }
        Returns: number
      }
      st_numpatches: {
        Args: { "": unknown }
        Returns: number
      }
      st_numpoints: {
        Args: { "": unknown }
        Returns: number
      }
      st_offsetcurve: {
        Args: { distance: number; line: unknown; params?: string }
        Returns: unknown
      }
      st_orderingequals: {
        Args: { geom1: unknown; geom2: unknown }
        Returns: boolean
      }
      st_orientedenvelope: {
        Args: { "": unknown }
        Returns: unknown
      }
      st_overlaps: {
        Args: { geom1: unknown; geom2: unknown }
        Returns: boolean
      }
      st_perimeter: {
        Args: { "": unknown } | { geog: unknown; use_spheroid?: boolean }
        Returns: number
      }
      st_perimeter2d: {
        Args: { "": unknown }
        Returns: number
      }
      st_pointfromtext: {
        Args: { "": string }
        Returns: unknown
      }
      st_pointfromwkb: {
        Args: { "": string }
        Returns: unknown
      }
      st_pointm: {
        Args: {
          mcoordinate: number
          srid?: number
          xcoordinate: number
          ycoordinate: number
        }
        Returns: unknown
      }
      st_pointonsurface: {
        Args: { "": unknown }
        Returns: unknown
      }
      st_points: {
        Args: { "": unknown }
        Returns: unknown
      }
      st_pointz: {
        Args: {
          srid?: number
          xcoordinate: number
          ycoordinate: number
          zcoordinate: number
        }
        Returns: unknown
      }
      st_pointzm: {
        Args: {
          mcoordinate: number
          srid?: number
          xcoordinate: number
          ycoordinate: number
          zcoordinate: number
        }
        Returns: unknown
      }
      st_polyfromtext: {
        Args: { "": string }
        Returns: unknown
      }
      st_polyfromwkb: {
        Args: { "": string }
        Returns: unknown
      }
      st_polygonfromtext: {
        Args: { "": string }
        Returns: unknown
      }
      st_polygonfromwkb: {
        Args: { "": string }
        Returns: unknown
      }
      st_polygonize: {
        Args: { "": unknown[] }
        Returns: unknown
      }
      st_project: {
        Args: { azimuth: number; distance: number; geog: unknown }
        Returns: unknown
      }
      st_quantizecoordinates: {
        Args: {
          g: unknown
          prec_m?: number
          prec_x: number
          prec_y?: number
          prec_z?: number
        }
        Returns: unknown
      }
      st_reduceprecision: {
        Args: { geom: unknown; gridsize: number }
        Returns: unknown
      }
      st_relate: {
        Args: { geom1: unknown; geom2: unknown }
        Returns: string
      }
      st_removerepeatedpoints: {
        Args: { geom: unknown; tolerance?: number }
        Returns: unknown
      }
      st_reverse: {
        Args: { "": unknown }
        Returns: unknown
      }
      st_segmentize: {
        Args: { geog: unknown; max_segment_length: number }
        Returns: unknown
      }
      st_setsrid: {
        Args: { geog: unknown; srid: number } | { geom: unknown; srid: number }
        Returns: unknown
      }
      st_sharedpaths: {
        Args: { geom1: unknown; geom2: unknown }
        Returns: unknown
      }
      st_shiftlongitude: {
        Args: { "": unknown }
        Returns: unknown
      }
      st_shortestline: {
        Args: { geom1: unknown; geom2: unknown }
        Returns: unknown
      }
      st_simplifypolygonhull: {
        Args: { geom: unknown; is_outer?: boolean; vertex_fraction: number }
        Returns: unknown
      }
      st_split: {
        Args: { geom1: unknown; geom2: unknown }
        Returns: unknown
      }
      st_square: {
        Args: { cell_i: number; cell_j: number; origin?: unknown; size: number }
        Returns: unknown
      }
      st_squaregrid: {
        Args: { bounds: unknown; size: number }
        Returns: Record<string, unknown>[]
      }
      st_srid: {
        Args: { geog: unknown } | { geom: unknown }
        Returns: number
      }
      st_startpoint: {
        Args: { "": unknown }
        Returns: unknown
      }
      st_subdivide: {
        Args: { geom: unknown; gridsize?: number; maxvertices?: number }
        Returns: unknown[]
      }
      st_summary: {
        Args: { "": unknown } | { "": unknown }
        Returns: string
      }
      st_swapordinates: {
        Args: { geom: unknown; ords: unknown }
        Returns: unknown
      }
      st_symdifference: {
        Args: { geom1: unknown; geom2: unknown; gridsize?: number }
        Returns: unknown
      }
      st_symmetricdifference: {
        Args: { geom1: unknown; geom2: unknown }
        Returns: unknown
      }
      st_tileenvelope: {
        Args: {
          bounds?: unknown
          margin?: number
          x: number
          y: number
          zoom: number
        }
        Returns: unknown
      }
      st_touches: {
        Args: { geom1: unknown; geom2: unknown }
        Returns: boolean
      }
      st_transform: {
        Args:
          | { from_proj: string; geom: unknown; to_proj: string }
          | { from_proj: string; geom: unknown; to_srid: number }
          | { geom: unknown; to_proj: string }
        Returns: unknown
      }
      st_triangulatepolygon: {
        Args: { g1: unknown }
        Returns: unknown
      }
      st_union: {
        Args:
          | { "": unknown[] }
          | { geom1: unknown; geom2: unknown }
          | { geom1: unknown; geom2: unknown; gridsize: number }
        Returns: unknown
      }
      st_voronoilines: {
        Args: { extend_to?: unknown; g1: unknown; tolerance?: number }
        Returns: unknown
      }
      st_voronoipolygons: {
        Args: { extend_to?: unknown; g1: unknown; tolerance?: number }
        Returns: unknown
      }
      st_within: {
        Args: { geom1: unknown; geom2: unknown }
        Returns: boolean
      }
      st_wkbtosql: {
        Args: { wkb: string }
        Returns: unknown
      }
      st_wkttosql: {
        Args: { "": string }
        Returns: unknown
      }
      st_wrapx: {
        Args: { geom: unknown; move: number; wrap: number }
        Returns: unknown
      }
      st_x: {
        Args: { "": unknown }
        Returns: number
      }
      st_xmax: {
        Args: { "": unknown }
        Returns: number
      }
      st_xmin: {
        Args: { "": unknown }
        Returns: number
      }
      st_y: {
        Args: { "": unknown }
        Returns: number
      }
      st_ymax: {
        Args: { "": unknown }
        Returns: number
      }
      st_ymin: {
        Args: { "": unknown }
        Returns: number
      }
      st_z: {
        Args: { "": unknown }
        Returns: number
      }
      st_zmax: {
        Args: { "": unknown }
        Returns: number
      }
      st_zmflag: {
        Args: { "": unknown }
        Returns: number
      }
      st_zmin: {
        Args: { "": unknown }
        Returns: number
      }
      suggest_companies: {
        Args: { p_limit?: number; p_profile_id: string }
        Returns: {
          city: string
          id: string
          industry: string
          logo_url: string
          name: string
          reasons: string[]
        }[]
      }
      suggest_companies_for_profile: {
        Args: { p_limit?: number; p_profile_id: string }
        Returns: {
          city: string
          friend_count: number
          id: string
          industry: string
          logo_url: string
          name: string
          reasons: string[]
        }[]
      }
      suggest_people: {
        Args: { p_limit?: number; p_viewer: string }
        Returns: {
          avatar_url: string
          branche: string
          display_name: string
          id: string
          ort: string
          score: number
          status: string
        }[]
      }
      suggestions_touch: {
        Args: { p_target: string; p_type: string; p_viewer: string }
        Returns: undefined
      }
      text: {
        Args: { "": unknown }
        Returns: string
      }
      toggle_community_like: {
        Args:
          | {
              p_liker_company_id?: string
              p_liker_user_id?: string
              p_post_id: string
            }
          | { p_liker_user_id: string; p_post_id: string }
        Returns: Json
      }
      toggle_linkedin_like: {
        Args: { p_liker_user_id: string; p_post_id: string }
        Returns: Json
      }
      unfollow_company: {
        Args: { p_company_id: string; p_profile_id: string }
        Returns: undefined
      }
      unlockrows: {
        Args: { "": string }
        Returns: number
      }
      updategeometrysrid: {
        Args: {
          catalogn_name: string
          column_name: string
          new_srid_in: number
          schema_name: string
          table_name: string
        }
        Returns: string
      }
      upsert_location_with_coords: {
        Args: {
          p_city: string
          p_country_code: string
          p_lat: number
          p_lon: number
          p_postal_code: string
          p_state: string
        }
        Returns: number
      }
      use_company_token: {
        Args: { p_company_id: string; p_profile_id: string }
        Returns: Json
      }
      use_token: {
        Args: { p_profile_id: string }
        Returns: {
          remaining_tokens: number
          token_id: string
        }[]
      }
      verify_company_account: {
        Args: { p_company_id: string }
        Returns: undefined
      }
      viewer_first_degree: {
        Args: { user_id: string }
        Returns: {
          profile_id: string
        }[]
      }
      viewer_second_degree: {
        Args: { user_id: string }
        Returns: {
          profile_id: string
        }[]
      }
    }
    Enums: {
      actor_kind: "user" | "company"
      app_role: "admin" | "editor" | "viewer"
      company_size_band: "1-9" | "10-49" | "50-249" | "250-999" | "1000+"
      follow_entity: "profile" | "company"
      follow_status: "pending" | "accepted" | "rejected" | "blocked"
      looking_tag: "Praktikanten" | "Auszubildende" | "Fachkräfte"
      notif_channel: "in_app" | "email"
      notif_recipient: "profile" | "company"
      notif_type:
        | "company_unlocked_you"
        | "follow_request_received"
        | "pipeline_move_for_you"
        | "post_interaction"
        | "profile_incomplete_reminder"
        | "weekly_digest_user"
        | "new_matches_available"
        | "follow_accepted_chat_unlocked"
        | "candidate_response_to_unlock"
        | "pipeline_activity_team"
        | "low_tokens"
        | "weekly_digest_company"
        | "billing_update"
        | "product_update"
      plan_code: "free" | "starter" | "premium"
      post_kind: "text" | "media" | "job_share" | "poll"
      post_visibility: "public" | "followers" | "connections" | "org_only"
      tag_type:
        | "profession"
        | "target_group"
        | "benefit"
        | "must"
        | "nice"
        | "work_env"
    }
    CompositeTypes: {
      geometry_dump: {
        path: number[] | null
        geom: unknown | null
      }
      valid_detail: {
        valid: boolean | null
        reason: string | null
        location: unknown | null
      }
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
      actor_kind: ["user", "company"],
      app_role: ["admin", "editor", "viewer"],
      company_size_band: ["1-9", "10-49", "50-249", "250-999", "1000+"],
      follow_entity: ["profile", "company"],
      follow_status: ["pending", "accepted", "rejected", "blocked"],
      looking_tag: ["Praktikanten", "Auszubildende", "Fachkräfte"],
      notif_channel: ["in_app", "email"],
      notif_recipient: ["profile", "company"],
      notif_type: [
        "company_unlocked_you",
        "follow_request_received",
        "pipeline_move_for_you",
        "post_interaction",
        "profile_incomplete_reminder",
        "weekly_digest_user",
        "new_matches_available",
        "follow_accepted_chat_unlocked",
        "candidate_response_to_unlock",
        "pipeline_activity_team",
        "low_tokens",
        "weekly_digest_company",
        "billing_update",
        "product_update",
      ],
      plan_code: ["free", "starter", "premium"],
      post_kind: ["text", "media", "job_share", "poll"],
      post_visibility: ["public", "followers", "connections", "org_only"],
      tag_type: [
        "profession",
        "target_group",
        "benefit",
        "must",
        "nice",
        "work_env",
      ],
    },
  },
} as const
