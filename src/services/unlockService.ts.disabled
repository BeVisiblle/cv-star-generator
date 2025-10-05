// Unlock Service for Two-Step Profile Unlocking
import { supabase } from '@/integrations/supabase/client';

export interface UnlockState {
  basic: boolean;
  contact: boolean;
}

export interface UnlockOptions {
  profileId: string;
  jobPostingId?: string;
  generalInterest?: boolean;
}

export type UnlockResult = 
  | 'unlocked_basic'
  | 'unlocked_contact'
  | 'already_basic'
  | 'already_contact'
  | 'insufficient_funds'
  | 'idempotent_duplicate'
  | 'error';

export class UnlockService {
  /**
   * Generate idempotency key for unlock operations
   * Browser-compatible version using Web Crypto API
   */
  private async generateIdempotencyKey(parts: string[]): Promise<string> {
    const text = parts.join('|');
    const encoder = new TextEncoder();
    const data = encoder.encode(text);
    const hashBuffer = await crypto.subtle.digest('SHA-256', data);
    const hashArray = Array.from(new Uint8Array(hashBuffer));
    return hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
  }

  /**
   * Check unlock state for a profile
   */
  async getUnlockState(profileId: string): Promise<UnlockState> {
    try {
      const { data, error } = await supabase.rpc('rpc_is_unlocked', {
        p_profile: profileId
      });

      if (error) throw error;
      return data || { basic: false, contact: false };
    } catch (error) {
      console.error('Error checking unlock state:', error);
      return { basic: false, contact: false };
    }
  }

  /**
   * Unlock basic level (1 token)
   */
  async unlockBasic(options: UnlockOptions): Promise<UnlockResult> {
    try {
      const idempotencyKey = await this.generateIdempotencyKey([
        options.profileId,
        options.jobPostingId || 'general',
        'basic'
      ]);

      const { data, error } = await supabase.rpc('rpc_unlock_basic', {
        p_profile: options.profileId,
        p_idem: idempotencyKey,
        p_job: options.jobPostingId || null,
        p_general: !!options.generalInterest
      });

      if (error) throw error;
      return data as UnlockResult;
    } catch (error) {
      console.error('Error unlocking basic:', error);
      return 'error';
    }
  }

  /**
   * Unlock contact level (2 tokens)
   */
  async unlockContact(options: UnlockOptions): Promise<UnlockResult> {
    try {
      const idempotencyKey = await this.generateIdempotencyKey([
        options.profileId,
        options.jobPostingId || 'general',
        'contact'
      ]);

      const { data, error } = await supabase.rpc('rpc_unlock_contact', {
        p_profile: options.profileId,
        p_idem: idempotencyKey,
        p_job: options.jobPostingId || null,
        p_general: !!options.generalInterest
      });

      if (error) throw error;
      return data as UnlockResult;
    } catch (error) {
      console.error('Error unlocking contact:', error);
      return 'error';
    }
  }

  /**
   * Log profile view access
   */
  async logProfileView(profileId: string): Promise<void> {
    try {
      const { error } = await supabase.rpc('rpc_log_access', {
        p_profile: profileId,
        p_object_type: 'profile',
        p_object_id: null
      });

      if (error) throw error;
    } catch (error) {
      console.error('Error logging profile view:', error);
      // Don't throw - logging failures shouldn't break the UI
    }
  }

  /**
   * Log attachment download access
   */
  async logAttachmentDownload(profileId: string, fileId: string): Promise<void> {
    try {
      const { error } = await supabase.rpc('rpc_log_access', {
        p_profile: profileId,
        p_object_type: 'attachment',
        p_object_id: fileId
      });

      if (error) throw error;
    } catch (error) {
      console.error('Error logging attachment download:', error);
      // Don't throw - logging failures shouldn't break the UI
    }
  }

  /**
   * Get masked profile data (respects unlock levels)
   */
  async getMaskedProfile(profileId: string) {
    try {
      const { data, error } = await supabase
        .from('profiles_masked')
        .select('*')
        .eq('id', profileId)
        .single();

      if (error) throw error;
      return data;
    } catch (error) {
      console.error('Error fetching masked profile:', error);
      throw error;
    }
  }
}
