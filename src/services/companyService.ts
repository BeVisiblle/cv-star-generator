import { supabase } from '@/integrations/supabase/client';
import type { CompanyLite, CompanyProfile, SuggestedCompany, CompaniesViewData } from '@/types/company';

export interface CompanyServiceResponse<T> {
  data: T;
  error?: string;
}

/**
 * Service for handling company-related API calls
 * Centralizes all Supabase interactions for companies
 */
export class CompanyService {
  /**
   * Fetch companies by IDs
   */
  static async fetchCompaniesByIds(companyIds: string[]): Promise<CompanyServiceResponse<CompanyLite[]>> {
    if (companyIds.length === 0) {
      return { data: [] };
    }

    try {
      const { data, error } = await supabase
        .from('companies')
        .select('id, name, logo_url, industry, main_location, employee_count')
        .in('id', companyIds);

      if (error) {
        console.error('CompanyService.fetchCompaniesByIds:', error);
        return { data: [], error: error.message };
      }

      return { data: (data || []) as CompanyLite[] };
    } catch (error) {
      console.error('CompanyService.fetchCompaniesByIds:', error);
      return { 
        data: [], 
        error: error instanceof Error ? error.message : 'Unknown error' 
      };
    }
  }

  /**
   * Fetch full company profile by ID
   */
  static async fetchCompanyProfile(companyId: string): Promise<CompanyServiceResponse<CompanyProfile | null>> {
    try {
      const { data, error } = await supabase
        .from('companies')
        .select('*')
        .eq('id', companyId)
        .single();

      if (error) {
        console.error('CompanyService.fetchCompanyProfile:', error);
        return { data: null, error: error.message };
      }

      return { data: data as CompanyProfile };
    } catch (error) {
      console.error('CompanyService.fetchCompanyProfile:', error);
      return { 
        data: null, 
        error: error instanceof Error ? error.message : 'Unknown error' 
      };
    }
  }

  /**
   * Fetch follow requests for a profile (companies wanting to follow the profile)
   */
  static async fetchFollowRequests(profileId: string): Promise<CompanyServiceResponse<CompanyLite[]>> {
    try {
      // Get follow request IDs
      const { data: requests, error: requestsError } = await supabase
        .from('follows')
        .select('follower_id')
        .eq('followee_type', 'profile')
        .eq('followee_id', profileId)
        .eq('follower_type', 'company')
        .eq('status', 'pending')
        .order('created_at', { ascending: false });

      if (requestsError) {
        console.error('CompanyService.fetchFollowRequests:', requestsError);
        return { data: [], error: requestsError.message };
      }

      if (!requests || requests.length === 0) {
        return { data: [] };
      }

      // Fetch company details
      const companyIds = requests.map(r => r.follower_id);
      return this.fetchCompaniesByIds(companyIds);
    } catch (error) {
      console.error('CompanyService.fetchFollowRequests:', error);
      return { 
        data: [], 
        error: error instanceof Error ? error.message : 'Unknown error' 
      };
    }
  }

  /**
   * Fetch companies followed by a profile
   */
  static async fetchFollowedCompanies(profileId: string): Promise<CompanyServiceResponse<CompanyLite[]>> {
    try {
      // Get followed company IDs
      const { data: follows, error: followsError } = await supabase
        .from('follows')
        .select('followee_id')
        .eq('follower_type', 'profile')
        .eq('follower_id', profileId)
        .eq('followee_type', 'company')
        .eq('status', 'accepted')
        .order('created_at', { ascending: false });

      if (followsError) {
        console.error('CompanyService.fetchFollowedCompanies:', followsError);
        return { data: [], error: followsError.message };
      }

      if (!follows || follows.length === 0) {
        return { data: [] };
      }

      // Fetch company details
      const companyIds = follows.map(f => f.followee_id);
      return this.fetchCompaniesByIds(companyIds);
    } catch (error) {
      console.error('CompanyService.fetchFollowedCompanies:', error);
      return { 
        data: [], 
        error: error instanceof Error ? error.message : 'Unknown error' 
      };
    }
  }

  /**
   * Fetch suggested companies for a profile
   */
  static async fetchSuggestedCompanies(profileId: string, limit = 12): Promise<CompanyServiceResponse<SuggestedCompany[]>> {
    try {
      const { data, error } = await supabase
        .rpc('suggest_companies_for_profile', { 
          p_profile_id: profileId, 
          p_limit: limit 
        });

      if (error) {
        console.error('CompanyService.fetchSuggestedCompanies:', error);
        return { data: [], error: error.message };
      }

      return { data: (data || []) as SuggestedCompany[] };
    } catch (error) {
      console.error('CompanyService.fetchSuggestedCompanies:', error);
      return { 
        data: [], 
        error: error instanceof Error ? error.message : 'Unknown error' 
      };
    }
  }

  /**
   * Fetch all company views data for a profile (requests, following, suggested)
   */
  static async fetchCompaniesViewData(profileId: string): Promise<CompanyServiceResponse<CompaniesViewData>> {
    try {
      const [requestsResult, followingResult, suggestedResult] = await Promise.all([
        this.fetchFollowRequests(profileId),
        this.fetchFollowedCompanies(profileId),
        this.fetchSuggestedCompanies(profileId)
      ]);

      // Collect all errors
      const errors = [requestsResult.error, followingResult.error, suggestedResult.error]
        .filter(Boolean);

      return {
        data: {
          pending: requestsResult.data,
          following: followingResult.data,
          suggested: suggestedResult.data
        },
        error: errors.length > 0 ? errors.join('; ') : undefined
      };
    } catch (error) {
      console.error('CompanyService.fetchCompaniesViewData:', error);
      return {
        data: { pending: [], following: [], suggested: [] },
        error: error instanceof Error ? error.message : 'Unknown error'
      };
    }
  }
}