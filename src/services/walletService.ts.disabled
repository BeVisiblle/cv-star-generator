// Wallet Service for Token Management
import { supabase } from '@/integrations/supabase/client';
import { createHash } from 'crypto';

export interface Wallet {
  id: string;
  company_id: string;
  balance: number;
  updated_at: string;
}

export interface TokenTransaction {
  id: string;
  company_id: string;
  delta: number;
  reason: 'purchase' | 'unlock_basic' | 'unlock_contact' | 'manual_adjust';
  profile_id?: string;
  idempotency_key?: string;
  created_at: string;
}

export class WalletService {
  /**
   * Get wallet balance for current company
   */
  async getWallet(): Promise<Wallet | null> {
    try {
      const { data, error } = await supabase
        .from('company_token_wallets')
        .select('*')
        .single();

      if (error && error.code !== 'PGRST116') { // PGRST116 = no rows returned
        throw error;
      }

      return data;
    } catch (error) {
      console.error('Error fetching wallet:', error);
      throw error;
    }
  }

  /**
   * Ensure wallet exists for company (create with balance 0 if missing)
   */
  async ensureWallet(): Promise<Wallet> {
    try {
      const { data, error } = await supabase
        .from('company_token_wallets')
        .upsert({ balance: 0 })
        .select()
        .single();

      if (error) throw error;
      return data;
    } catch (error) {
      console.error('Error ensuring wallet:', error);
      throw error;
    }
  }

  /**
   * Get transaction history for current company
   */
  async getTransactions(limit = 50): Promise<TokenTransaction[]> {
    try {
      const { data, error } = await supabase
        .from('token_transactions')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(limit);

      if (error) throw error;
      return data || [];
    } catch (error) {
      console.error('Error fetching transactions:', error);
      throw error;
    }
  }

  /**
   * Add tokens to wallet (for purchases)
   */
  async addTokens(amount: number, reason: 'purchase' | 'manual_adjust' = 'manual_adjust'): Promise<void> {
    try {
      const { error } = await supabase.rpc('add_tokens_to_wallet', {
        p_amount: amount,
        p_reason: reason
      });

      if (error) throw error;
    } catch (error) {
      console.error('Error adding tokens:', error);
      throw error;
    }
  }
}
