import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';

interface Company {
  id: string;
  name: string;
  logo_url?: string;
  header_image?: string;
  description?: string;
  size_range?: string;
  industry?: string;
  founded_year?: number;
  main_location?: string;
  additional_locations?: any;
  website_url?: string;
  plan_type?: string;
  active_tokens: number;
  seats: number;
  subscription_status: string;
  created_at: string;
  updated_at: string;
}

interface CompanyUser {
  id: string;
  user_id: string;
  company_id: string;
  role: string;
  invited_at: string;
  accepted_at?: string;
}

export const useCompany = () => {
  const { user } = useAuth();
  const [company, setCompany] = useState<Company | null>(null);
  const [companyUser, setCompanyUser] = useState<CompanyUser | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (user) {
      loadCompanyData();
    }
  }, [user]);

  const loadCompanyData = async () => {
    try {
      setLoading(true);
      setError(null);

      const { data: companyUserData, error: companyUserError } = await supabase
        .from('company_users')
        .select(`
          *,
          companies (*)
        `)
        .eq('user_id', user?.id)
        .single();

      if (companyUserError) {
        if (companyUserError.code === 'PGRST116') {
          // No company found for user
          setCompany(null);
          setCompanyUser(null);
        } else {
          throw companyUserError;
        }
      } else {
        setCompanyUser(companyUserData);
        setCompany(companyUserData.companies);
      }
    } catch (err: any) {
      console.error('Error loading company data:', err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const updateCompany = async (updates: Partial<Company>) => {
    if (!company) return;

    try {
      const { error } = await supabase
        .from('companies')
        .update(updates)
        .eq('id', company.id);

      if (error) throw error;

      setCompany({ ...company, ...updates });
      return { success: true };
    } catch (err: any) {
      console.error('Error updating company:', err);
      return { success: false, error: err.message };
    }
  };

  const useToken = async (profileId: string) => {
    if (!company) return { success: false, error: 'No company found' };

    try {
      // Check if token already used for this profile
      const { data: existingToken } = await supabase
        .from('tokens_used')
        .select('id')
        .eq('company_id', company.id)
        .eq('profile_id', profileId)
        .single();

      if (existingToken) {
        return { success: false, error: 'Token already used for this profile' };
      }

      if (company.active_tokens <= 0) {
        return { success: false, error: 'No active tokens available' };
      }

      // Use token
      const { error: tokenError } = await supabase
        .from('tokens_used')
        .insert({
          company_id: company.id,
          profile_id: profileId,
        });

      if (tokenError) throw tokenError;

      // Update company active tokens
      const { error: updateError } = await supabase
        .from('companies')
        .update({ active_tokens: company.active_tokens - 1 })
        .eq('id', company.id);

      if (updateError) throw updateError;

      setCompany({ ...company, active_tokens: company.active_tokens - 1 });
      
      return { success: true };
    } catch (err: any) {
      console.error('Error using token:', err);
      return { success: false, error: err.message };
    }
  };

  const hasUsedToken = async (profileId: string): Promise<boolean> => {
    if (!company) return false;

    try {
      const { data } = await supabase
        .from('tokens_used')
        .select('id')
        .eq('company_id', company.id)
        .eq('profile_id', profileId)
        .single();

      return !!data;
    } catch {
      return false;
    }
  };

  return {
    company,
    companyUser,
    loading,
    error,
    updateCompany,
    useToken,
    hasUsedToken,
    refetch: loadCompanyData,
  };
};