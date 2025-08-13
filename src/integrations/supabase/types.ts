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
            foreignKeyName: "fk_candidate_contacts_profile"
            columns: ["candidate_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
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
            foreignKeyName: "fk_candidate_notes_profile"
            columns: ["candidate_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      companies: {
        Row: {
          account_status: string
          active_tokens: number | null
          additional_locations: Json | null
          contact_person: string | null
          country: string | null
          created_at: string | null
          description: string | null
          employee_count: number | null
          founded_year: number | null
          header_image: string | null
          id: string
          industry: string | null
          instagram_url: string | null
          linkedin_url: string | null
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
          phone: string | null
          plan_type: string | null
          primary_email: string | null
          seats: number | null
          size_range: string | null
          subscription_status: string | null
          updated_at: string | null
          website_url: string | null
        }
        Insert: {
          account_status?: string
          active_tokens?: number | null
          additional_locations?: Json | null
          contact_person?: string | null
          country?: string | null
          created_at?: string | null
          description?: string | null
          employee_count?: number | null
          founded_year?: number | null
          header_image?: string | null
          id?: string
          industry?: string | null
          instagram_url?: string | null
          linkedin_url?: string | null
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
          phone?: string | null
          plan_type?: string | null
          primary_email?: string | null
          seats?: number | null
          size_range?: string | null
          subscription_status?: string | null
          updated_at?: string | null
          website_url?: string | null
        }
        Update: {
          account_status?: string
          active_tokens?: number | null
          additional_locations?: Json | null
          contact_person?: string | null
          country?: string | null
          created_at?: string | null
          description?: string | null
          employee_count?: number | null
          founded_year?: number | null
          header_image?: string | null
          id?: string
          industry?: string | null
          instagram_url?: string | null
          linkedin_url?: string | null
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
          phone?: string | null
          plan_type?: string | null
          primary_email?: string | null
          seats?: number | null
          size_range?: string | null
          subscription_status?: string | null
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
        ]
      }
      company_candidates: {
        Row: {
          candidate_id: string
          company_id: string
          created_at: string
          id: string
          last_touched_at: string | null
          next_action_at: string | null
          next_action_note: string | null
          owner_user_id: string | null
          source: string | null
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
          next_action_at?: string | null
          next_action_note?: string | null
          owner_user_id?: string | null
          source?: string | null
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
          next_action_at?: string | null
          next_action_note?: string | null
          owner_user_id?: string | null
          source?: string | null
          stage?: string
          unlocked_at?: string | null
          unlocked_by_user_id?: string | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "fk_company_candidates_company"
            columns: ["company_id"]
            isOneToOne: false
            referencedRelation: "companies"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "fk_company_candidates_profile"
            columns: ["candidate_id"]
            isOneToOne: false
            referencedRelation: "profiles"
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
            foreignKeyName: "company_follow_prefs_profile_id_fkey"
            columns: ["profile_id"]
            isOneToOne: false
            referencedRelation: "profiles"
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
            foreignKeyName: "company_tags_tag_id_fkey"
            columns: ["tag_id"]
            isOneToOne: false
            referencedRelation: "vocab_tags"
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
          max_seats: number
          monthly_price_cents: number
          name: string
        }
        Insert: {
          active?: boolean
          id: string
          included_seats?: number
          included_tokens?: number
          max_seats?: number
          monthly_price_cents: number
          name: string
        }
        Update: {
          active?: boolean
          id?: string
          included_seats?: number
          included_tokens?: number
          max_seats?: number
          monthly_price_cents?: number
          name?: string
        }
        Relationships: []
      }
      post_comments: {
        Row: {
          content: string
          created_at: string
          id: string
          parent_comment_id: string | null
          post_id: string
          updated_at: string
          user_id: string
        }
        Insert: {
          content: string
          created_at?: string
          id?: string
          parent_comment_id?: string | null
          post_id: string
          updated_at?: string
          user_id: string
        }
        Update: {
          content?: string
          created_at?: string
          id?: string
          parent_comment_id?: string | null
          post_id?: string
          updated_at?: string
          user_id?: string
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
        Relationships: [
          {
            foreignKeyName: "post_documents_post_id_fkey"
            columns: ["post_id"]
            isOneToOne: false
            referencedRelation: "posts"
            referencedColumns: ["id"]
          },
        ]
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
        Relationships: [
          {
            foreignKeyName: "post_events_post_id_fkey"
            columns: ["post_id"]
            isOneToOne: true
            referencedRelation: "posts"
            referencedColumns: ["id"]
          },
        ]
      }
      post_likes: {
        Row: {
          created_at: string
          id: string
          post_id: string
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          post_id: string
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          post_id?: string
          user_id?: string
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
        Relationships: [
          {
            foreignKeyName: "post_media_post_id_fkey"
            columns: ["post_id"]
            isOneToOne: false
            referencedRelation: "posts"
            referencedColumns: ["id"]
          },
        ]
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
        Relationships: [
          {
            foreignKeyName: "post_polls_post_id_fkey"
            columns: ["post_id"]
            isOneToOne: true
            referencedRelation: "posts"
            referencedColumns: ["id"]
          },
        ]
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
        Relationships: [
          {
            foreignKeyName: "post_reposts_post_id_fkey"
            columns: ["post_id"]
            isOneToOne: false
            referencedRelation: "posts"
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
          author_id: string | null
          author_type: string
          celebration: boolean
          content: string
          created_at: string | null
          id: string
          image_url: string | null
          link_url: string | null
          published_at: string
          scheduled_at: string | null
          status: string
          updated_at: string | null
          user_id: string
          visibility: string
        }
        Insert: {
          author_id?: string | null
          author_type?: string
          celebration?: boolean
          content: string
          created_at?: string | null
          id?: string
          image_url?: string | null
          link_url?: string | null
          published_at?: string
          scheduled_at?: string | null
          status?: string
          updated_at?: string | null
          user_id: string
          visibility?: string
        }
        Update: {
          author_id?: string | null
          author_type?: string
          celebration?: boolean
          content?: string
          created_at?: string | null
          id?: string
          image_url?: string | null
          link_url?: string | null
          published_at?: string
          scheduled_at?: string | null
          status?: string
          updated_at?: string | null
          user_id?: string
          visibility?: string
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
            foreignKeyName: "profile_tags_tag_id_fkey"
            columns: ["tag_id"]
            isOneToOne: false
            referencedRelation: "vocab_tags"
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
          job_search_preferences: string[]
          kenntnisse: string | null
          layout: number | null
          location_id: number | null
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
          job_search_preferences?: string[]
          kenntnisse?: string | null
          layout?: number | null
          location_id?: number | null
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
          job_search_preferences?: string[]
          kenntnisse?: string | null
          layout?: number | null
          location_id?: number | null
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
        Relationships: [
          {
            foreignKeyName: "profiles_location_id_fkey"
            columns: ["location_id"]
            isOneToOne: false
            referencedRelation: "locations"
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
        ]
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
    }
    Functions: {
      _postgis_deprecate: {
        Args: { oldname: string; newname: string; version: string }
        Returns: undefined
      }
      _postgis_index_extent: {
        Args: { tbl: unknown; col: string }
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
        Args: { tbl: unknown; att_name: string; geom: unknown; mode?: string }
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
          g1: unknown
          clip?: unknown
          tolerance?: number
          return_polygons?: boolean
        }
        Returns: unknown
      }
      _st_within: {
        Args: { geom1: unknown; geom2: unknown }
        Returns: boolean
      }
      add_seats: {
        Args: { _company_id: string; _add: number; _client_request_id?: string }
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
              schema_name: string
              table_name: string
              column_name: string
              new_srid_in: number
              new_type: string
              new_dim: number
              use_typmod?: boolean
            }
          | {
              schema_name: string
              table_name: string
              column_name: string
              new_srid: number
              new_type: string
              new_dim: number
              use_typmod?: boolean
            }
          | {
              table_name: string
              column_name: string
              new_srid: number
              new_type: string
              new_dim: number
              use_typmod?: boolean
            }
        Returns: string
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
      bytea: {
        Args: { "": unknown } | { "": unknown }
        Returns: string
      }
      can_access_conversation: {
        Args: { _conv_id: string; _uid: string }
        Returns: boolean
      }
      can_view_post: {
        Args: { _post_id: string; _viewer: string }
        Returns: boolean
      }
      change_plan: {
        Args: {
          _company_id: string
          _to_plan: string
          _client_request_id?: string
        }
        Returns: {
          plan_id: string
          seats: number
          token_balance: number
        }[]
      }
      consume_tokens: {
        Args: {
          _company_id: string
          _qty: number
          _reason: string
          _ref?: string
          _client_request_id?: string
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
      create_company_account: {
        Args: {
          p_name: string
          p_primary_email: string
          p_industry: string
          p_city: string
          p_country: string
          p_size_range: string
          p_contact_person: string
          p_phone: string
          p_website: string
          p_created_by: string
        }
        Returns: string
      }
      disablelongtransactions: {
        Args: Record<PropertyKey, never>
        Returns: string
      }
      dropgeometrycolumn: {
        Args:
          | {
              catalog_name: string
              schema_name: string
              table_name: string
              column_name: string
            }
          | { schema_name: string; table_name: string; column_name: string }
          | { table_name: string; column_name: string }
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
      equals: {
        Args: { geom1: unknown; geom2: unknown }
        Returns: boolean
      }
      find_locations_within_radius: {
        Args: { p_center_location_id: number; p_radius_km: number }
        Returns: {
          location_id: number
          distance_km: number
        }[]
      }
      find_profile_ids_within_radius: {
        Args: { p_center_location_id: number; p_radius_km: number }
        Returns: {
          profile_id: string
          distance_km: number
        }[]
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
      get_companies_public: {
        Args: { search?: string; limit_count?: number; offset_count?: number }
        Returns: {
          id: string
          name: string
          logo_url: string
          header_image: string
          description: string
          industry: string
          size_range: string
          main_location: string
          country: string
          website_url: string
          linkedin_url: string
          instagram_url: string
          created_at: string
        }[]
      }
      get_companies_public_by_ids: {
        Args: { ids: string[] }
        Returns: {
          id: string
          name: string
          logo_url: string
          industry: string
          main_location: string
        }[]
      }
      get_company_public: {
        Args: { p_id: string }
        Returns: {
          id: string
          name: string
          logo_url: string
          header_image: string
          description: string
          mission_statement: string
          industry: string
          size_range: string
          employee_count: number
          main_location: string
          country: string
          website_url: string
          linkedin_url: string
          instagram_url: string
          created_at: string
        }[]
      }
      get_feed: {
        Args: {
          viewer_id: string
          after_published?: string
          after_id?: string
          limit_count?: number
        }
        Returns: {
          author_id: string | null
          author_type: string
          celebration: boolean
          content: string
          created_at: string | null
          id: string
          image_url: string | null
          link_url: string | null
          published_at: string
          scheduled_at: string | null
          status: string
          updated_at: string | null
          user_id: string
          visibility: string
        }[]
      }
      get_feed_sorted: {
        Args: {
          viewer_id: string
          after_published?: string
          after_id?: string
          limit_count?: number
          sort?: string
        }
        Returns: {
          id: string
          user_id: string
          author_type: string
          author_id: string
          content: string
          image_url: string
          published_at: string
          visibility: string
          status: string
          created_at: string
          updated_at: string
          celebration: boolean
          link_url: string
          scheduled_at: string
          like_count: number
          comment_count: number
          repost_count: number
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
      get_users_near_company: {
        Args: { p_company_id: string; p_radius_km: number }
        Returns: {
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
          job_search_preferences: string[]
          kenntnisse: string | null
          layout: number | null
          location_id: number | null
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
        }[]
      }
      get_users_near_location: {
        Args: { p_loc_id: number; p_radius_km: number }
        Returns: {
          profile_id: string
          distance_km: number
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
      has_company_access: {
        Args: { _company_id: string }
        Returns: boolean
      }
      is_company_admin: {
        Args: { check_company_id: string }
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
      is_connected: {
        Args: { _u1: string; _u2: string }
        Returns: boolean
      }
      is_content_editor: {
        Args: { _uid?: string }
        Returns: boolean
      }
      json: {
        Args: { "": unknown }
        Returns: Json
      }
      jsonb: {
        Args: { "": unknown }
        Returns: Json
      }
      longtransactionsenabled: {
        Args: Record<PropertyKey, never>
        Returns: boolean
      }
      match_candidates_for_company: {
        Args: { p_company: string; p_limit?: number }
        Returns: {
          profile_id: string
          display_name: string
          score: number
          reasons: string[]
        }[]
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
        Args: { geomschema: string; geomtable: string; geomcolumn: string }
        Returns: number
      }
      postgis_constraint_srid: {
        Args: { geomschema: string; geomtable: string; geomcolumn: string }
        Returns: number
      }
      postgis_constraint_type: {
        Args: { geomschema: string; geomtable: string; geomcolumn: string }
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
          geomname: string
          coord_dimension: number
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
      purchase_tokens: {
        Args: { _company_id: string; _qty: number; _client_request_id?: string }
        Returns: {
          new_balance: number
          paid_cents: number
        }[]
      }
      resolve_location_id: {
        Args: { p_postal_code: string; p_city: string; p_country_code?: string }
        Returns: number
      }
      search_candidates_within_radius: {
        Args: { lat_input: number; lon_input: number; radius_km: number }
        Returns: {
          profile_id: string
          city: string
          postal_code: string
          distance_km: number
        }[]
      }
      search_companies_within_radius: {
        Args: { lat_input: number; lon_input: number; radius_km: number }
        Returns: {
          company_id: string
          name: string
          city: string
          postal_code: string
          distance_km: number
        }[]
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
              r: Record<string, unknown>
              geom_column?: string
              maxdecimaldigits?: number
              pretty_bool?: boolean
            }
        Returns: string
      }
      st_asgml: {
        Args:
          | { "": string }
          | {
              geog: unknown
              maxdecimaldigits?: number
              options?: number
              nprefix?: string
              id?: string
            }
          | { geom: unknown; maxdecimaldigits?: number; options?: number }
          | {
              version: number
              geog: unknown
              maxdecimaldigits?: number
              options?: number
              nprefix?: string
              id?: string
            }
          | {
              version: number
              geom: unknown
              maxdecimaldigits?: number
              options?: number
              nprefix?: string
              id?: string
            }
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
        Args: { geom: unknown; format?: string }
        Returns: string
      }
      st_asmvtgeom: {
        Args: {
          geom: unknown
          bounds: unknown
          extent?: number
          buffer?: number
          clip_geom?: boolean
        }
        Returns: unknown
      }
      st_assvg: {
        Args:
          | { "": string }
          | { geog: unknown; rel?: number; maxdecimaldigits?: number }
          | { geom: unknown; rel?: number; maxdecimaldigits?: number }
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
              prec_z?: number
              prec_m?: number
              with_sizes?: boolean
              with_boxes?: boolean
            }
          | {
              geom: unknown
              prec?: number
              prec_z?: number
              prec_m?: number
              with_sizes?: boolean
              with_boxes?: boolean
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
        Args: { geom: unknown; fits?: boolean }
        Returns: unknown
      }
      st_buffer: {
        Args:
          | { geom: unknown; radius: number; options?: string }
          | { geom: unknown; radius: number; quadsegs: number }
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
        Args: { geom: unknown; box: unknown }
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
          param_geom: unknown
          param_pctconvex: number
          param_allow_holes?: boolean
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
        Args: { geom: unknown; tol?: number; toltype?: number; flags?: number }
        Returns: unknown
      }
      st_delaunaytriangles: {
        Args: { g1: unknown; tolerance?: number; flags?: number }
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
          | { geom: unknown; dx: number; dy: number; dz?: number; dm?: number }
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
        Args: { geom: unknown; zvalue?: number; mvalue?: number }
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
          g: unknown
          tolerance?: number
          max_iter?: number
          fail_if_not_converged?: boolean
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
        Args: { size: number; cell_i: number; cell_j: number; origin?: unknown }
        Returns: unknown
      }
      st_hexagongrid: {
        Args: { size: number; bounds: unknown }
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
        Args: { geom: unknown; flags?: number }
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
        Args: { letters: string; font?: Json }
        Returns: unknown
      }
      st_linecrossingdirection: {
        Args: { line1: unknown; line2: unknown }
        Returns: number
      }
      st_linefromencodedpolyline: {
        Args: { txtin: string; nprecision?: number }
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
        Args: { geometry: unknown; measure: number; leftrightoffset?: number }
        Returns: unknown
      }
      st_locatebetween: {
        Args: {
          geometry: unknown
          frommeasure: number
          tomeasure: number
          leftrightoffset?: number
        }
        Returns: unknown
      }
      st_locatebetweenelevations: {
        Args: { geometry: unknown; fromelevation: number; toelevation: number }
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
        Args: { line: unknown; distance: number; params?: string }
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
          xcoordinate: number
          ycoordinate: number
          mcoordinate: number
          srid?: number
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
          xcoordinate: number
          ycoordinate: number
          zcoordinate: number
          srid?: number
        }
        Returns: unknown
      }
      st_pointzm: {
        Args: {
          xcoordinate: number
          ycoordinate: number
          zcoordinate: number
          mcoordinate: number
          srid?: number
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
        Args: { geog: unknown; distance: number; azimuth: number }
        Returns: unknown
      }
      st_quantizecoordinates: {
        Args: {
          g: unknown
          prec_x: number
          prec_y?: number
          prec_z?: number
          prec_m?: number
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
        Args: { geom: unknown; vertex_fraction: number; is_outer?: boolean }
        Returns: unknown
      }
      st_split: {
        Args: { geom1: unknown; geom2: unknown }
        Returns: unknown
      }
      st_square: {
        Args: { size: number; cell_i: number; cell_j: number; origin?: unknown }
        Returns: unknown
      }
      st_squaregrid: {
        Args: { size: number; bounds: unknown }
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
        Args: { geom: unknown; maxvertices?: number; gridsize?: number }
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
          zoom: number
          x: number
          y: number
          bounds?: unknown
          margin?: number
        }
        Returns: unknown
      }
      st_touches: {
        Args: { geom1: unknown; geom2: unknown }
        Returns: boolean
      }
      st_transform: {
        Args:
          | { geom: unknown; from_proj: string; to_proj: string }
          | { geom: unknown; from_proj: string; to_srid: number }
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
        Args: { g1: unknown; tolerance?: number; extend_to?: unknown }
        Returns: unknown
      }
      st_voronoipolygons: {
        Args: { g1: unknown; tolerance?: number; extend_to?: unknown }
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
        Args: { geom: unknown; wrap: number; move: number }
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
        Args: { p_viewer: string; p_limit?: number }
        Returns: {
          id: string
          name: string
          logo_url: string
          industry: string
          main_location: string
          score: number
        }[]
      }
      suggest_people: {
        Args: { p_viewer: string; p_limit?: number }
        Returns: {
          id: string
          display_name: string
          avatar_url: string
          status: string
          branche: string
          ort: string
          score: number
        }[]
      }
      suggestions_touch: {
        Args: { p_viewer: string; p_type: string; p_target: string }
        Returns: undefined
      }
      text: {
        Args: { "": unknown }
        Returns: string
      }
      unlockrows: {
        Args: { "": string }
        Returns: number
      }
      updategeometrysrid: {
        Args: {
          catalogn_name: string
          schema_name: string
          table_name: string
          column_name: string
          new_srid_in: number
        }
        Returns: string
      }
      upsert_location_with_coords: {
        Args: {
          p_postal_code: string
          p_city: string
          p_state: string
          p_country_code: string
          p_lat: number
          p_lon: number
        }
        Returns: number
      }
      use_token: {
        Args: { p_profile_id: string }
        Returns: {
          token_id: string
          remaining_tokens: number
        }[]
      }
      viewer_first_degree: {
        Args: { viewer: string }
        Returns: {
          id: string
        }[]
      }
      viewer_second_degree: {
        Args: { viewer: string }
        Returns: {
          id: string
        }[]
      }
    }
    Enums: {
      app_role: "admin" | "editor" | "viewer"
      follow_entity: "profile" | "company"
      follow_status: "pending" | "accepted" | "rejected" | "blocked"
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
      app_role: ["admin", "editor", "viewer"],
      follow_entity: ["profile", "company"],
      follow_status: ["pending", "accepted", "rejected", "blocked"],
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
