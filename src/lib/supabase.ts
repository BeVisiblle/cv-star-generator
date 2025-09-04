import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || 'https://koymmvuhcxlvcuoyjnvv.supabase.co';
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || '';

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

// Database type definitions
export type Database = {
  public: {
    Tables: {
      groups: {
        Row: {
          id: string;
          title: string;
          description: string | null;
          type: 'course' | 'exam' | 'profession';
          visibility: 'public' | 'private' | 'hidden';
          school: string | null;
          course_code: string | null;
          region: string | null;
          cover_image: string | null;
          created_by: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          title: string;
          description?: string | null;
          type: 'course' | 'exam' | 'profession';
          visibility?: 'public' | 'private' | 'hidden';
          school?: string | null;
          course_code?: string | null;
          region?: string | null;
          cover_image?: string | null;
          created_by?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          title?: string;
          description?: string | null;
          type?: 'course' | 'exam' | 'profession';
          visibility?: 'public' | 'private' | 'hidden';
          school?: string | null;
          course_code?: string | null;
          region?: string | null;
          cover_image?: string | null;
          created_by?: string | null;
          created_at?: string;
          updated_at?: string;
        };
      };
      group_members: {
        Row: {
          group_id: string;
          user_id: string;
          role: 'owner' | 'moderator' | 'member';
          status: 'active' | 'pending' | 'banned';
          joined_at: string;
        };
        Insert: {
          group_id: string;
          user_id: string;
          role?: 'owner' | 'moderator' | 'member';
          status?: 'active' | 'pending' | 'banned';
          joined_at?: string;
        };
        Update: {
          group_id?: string;
          user_id?: string;
          role?: 'owner' | 'moderator' | 'member';
          status?: 'active' | 'pending' | 'banned';
          joined_at?: string;
        };
      };
      posts: {
        Row: {
          id: string;
          group_id: string;
          author_id: string | null;
          type: 'thread' | 'question' | 'resource' | 'event' | 'poll';
          title: string | null;
          body: string | null;
          meta: any;
          pinned: boolean;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          group_id: string;
          author_id?: string | null;
          type: 'thread' | 'question' | 'resource' | 'event' | 'poll';
          title?: string | null;
          body?: string | null;
          meta?: any;
          pinned?: boolean;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          group_id?: string;
          author_id?: string | null;
          type?: 'thread' | 'question' | 'resource' | 'event' | 'poll';
          title?: string | null;
          body?: string | null;
          meta?: any;
          pinned?: boolean;
          created_at?: string;
          updated_at?: string;
        };
      };
      files: {
        Row: {
          id: string;
          group_id: string;
          uploader_id: string | null;
          filename: string;
          mime_type: string | null;
          byte_size: number | null;
          checksum: string;
          version: number;
          storage_path: string;
          source: string | null;
          license: string | null;
          created_at: string;
        };
        Insert: {
          id?: string;
          group_id: string;
          uploader_id?: string | null;
          filename: string;
          mime_type?: string | null;
          byte_size?: number | null;
          checksum: string;
          version?: number;
          storage_path: string;
          source?: string | null;
          license?: string | null;
          created_at?: string;
        };
        Update: {
          id?: string;
          group_id?: string;
          uploader_id?: string | null;
          filename?: string;
          mime_type?: string | null;
          byte_size?: number | null;
          checksum?: string;
          version?: number;
          storage_path?: string;
          source?: string | null;
          license?: string | null;
          created_at?: string;
        };
      };
      file_pages: {
        Row: {
          id: string;
          file_id: string;
          page_number: number;
          text: string | null;
          bbox: any | null;
          thumb_path: string | null;
          created_at: string;
        };
        Insert: {
          id?: string;
          file_id: string;
          page_number: number;
          text?: string | null;
          bbox?: any | null;
          thumb_path?: string | null;
          created_at?: string;
        };
        Update: {
          id?: string;
          file_id?: string;
          page_number?: number;
          text?: string | null;
          bbox?: any | null;
          thumb_path?: string | null;
          created_at?: string;
        };
      };
      questions: {
        Row: {
          id: string;
          group_id: string;
          author_id: string | null;
          file_id: string | null;
          page_id: string | null;
          anchor: any | null;
          title: string;
          body: string | null;
          tags: string[];
          status: 'open' | 'answered' | 'solved' | 'outdated';
          accepted_answer_id: string | null;
          created_at: string;
        };
        Insert: {
          id?: string;
          group_id: string;
          author_id?: string | null;
          file_id?: string | null;
          page_id?: string | null;
          anchor?: any | null;
          title: string;
          body?: string | null;
          tags?: string[];
          status?: 'open' | 'answered' | 'solved' | 'outdated';
          accepted_answer_id?: string | null;
          created_at?: string;
        };
        Update: {
          id?: string;
          group_id?: string;
          author_id?: string | null;
          file_id?: string | null;
          page_id?: string | null;
          anchor?: any | null;
          title?: string;
          body?: string | null;
          tags?: string[];
          status?: 'open' | 'answered' | 'solved' | 'outdated';
          accepted_answer_id?: string | null;
          created_at?: string;
        };
      };
      answers: {
        Row: {
          id: string;
          question_id: string;
          author_id: string | null;
          body: string;
          is_accepted: boolean;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          question_id: string;
          author_id?: string | null;
          body: string;
          is_accepted?: boolean;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          question_id?: string;
          author_id?: string | null;
          body?: string;
          is_accepted?: boolean;
          created_at?: string;
          updated_at?: string;
        };
      };
      annotations: {
        Row: {
          id: string;
          file_id: string;
          page_id: string;
          author_id: string | null;
          anchor: any;
          quote: string | null;
          note: string | null;
          visibility: 'private' | 'group';
          created_at: string;
        };
        Insert: {
          id?: string;
          file_id: string;
          page_id: string;
          author_id?: string | null;
          anchor: any;
          quote?: string | null;
          note?: string | null;
          visibility?: 'private' | 'group';
          created_at?: string;
        };
        Update: {
          id?: string;
          file_id?: string;
          page_id?: string;
          author_id?: string | null;
          anchor?: any;
          quote?: string | null;
          note?: string | null;
          visibility?: 'private' | 'group';
          created_at?: string;
        };
      };
      votes: {
        Row: {
          id: string;
          entity_type: 'post' | 'question' | 'answer';
          entity_id: string;
          user_id: string;
          value: -1 | 1;
          created_at: string;
        };
        Insert: {
          id?: string;
          entity_type: 'post' | 'question' | 'answer';
          entity_id: string;
          user_id: string;
          value: -1 | 1;
          created_at?: string;
        };
        Update: {
          id?: string;
          entity_type?: 'post' | 'question' | 'answer';
          entity_id?: string;
          user_id?: string;
          value?: -1 | 1;
          created_at?: string;
        };
      };
      reports: {
        Row: {
          id: string;
          entity_type: string | null;
          entity_id: string | null;
          reporter_id: string | null;
          reason: string | null;
          status: string;
          created_at: string;
        };
        Insert: {
          id?: string;
          entity_type?: string | null;
          entity_id?: string | null;
          reporter_id?: string | null;
          reason?: string | null;
          status?: string;
          created_at?: string;
        };
        Update: {
          id?: string;
          entity_type?: string | null;
          entity_id?: string | null;
          reporter_id?: string | null;
          reason?: string | null;
          status?: string;
          created_at?: string;
        };
      };
      notifications: {
        Row: {
          id: string;
          user_id: string;
          kind: string | null;
          payload: any | null;
          read_at: string | null;
          created_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          kind?: string | null;
          payload?: any | null;
          read_at?: string | null;
          created_at?: string;
        };
        Update: {
          id?: string;
          user_id?: string;
          kind?: string | null;
          payload?: any | null;
          read_at?: string | null;
          created_at?: string;
        };
      };
      credit_wallets: {
        Row: {
          user_id: string;
          balance: number;
          updated_at: string;
        };
        Insert: {
          user_id: string;
          balance?: number;
          updated_at?: string;
        };
        Update: {
          user_id?: string;
          balance?: number;
          updated_at?: string;
        };
      };
      credit_transactions: {
        Row: {
          id: string;
          user_id: string;
          delta: number;
          reason: string | null;
          meta: any | null;
          created_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          delta: number;
          reason?: string | null;
          meta?: any | null;
          created_at?: string;
        };
        Update: {
          id?: string;
          user_id?: string;
          delta?: number;
          reason?: string | null;
          meta?: any | null;
          created_at?: string;
        };
      };
    };
    Views: {
      [_ in never]: never;
    };
    Functions: {
      is_group_member: {
        Args: {
          p_group_id: string;
          p_user_id?: string;
        };
        Returns: boolean;
      };
      is_group_moderator: {
        Args: {
          p_group_id: string;
          p_user_id?: string;
        };
        Returns: boolean;
      };
      get_group_member_count: {
        Args: {
          p_group_id: string;
        };
        Returns: number;
      };
      create_notification: {
        Args: {
          p_user_id: string;
          p_kind: string;
          p_payload: any;
        };
        Returns: string;
      };
      add_credits: {
        Args: {
          p_user_id: string;
          p_delta: number;
          p_reason: string;
          p_meta?: any;
        };
        Returns: boolean;
      };
    };
    Enums: {
      [_ in never]: never;
    };
  };
};
