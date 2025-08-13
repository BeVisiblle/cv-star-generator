import { useEffect, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';

export type CompanyLite = {
  id: string;
  name: string;
  logo_url?: string | null;
  industry?: string | null;
  main_location?: string | null;
  employee_count?: number | null;
};

export type SuggestedCompany = CompanyLite & { 
  reasons: string[];
  city?: string | null;
};

export function useCompaniesViews(profileId: string | null) {
  const [pending, setPending] = useState<CompanyLite[]>([]);
  const [following, setFollowing] = useState<CompanyLite[]>([]);
  const [suggested, setSuggested] = useState<SuggestedCompany[]>([]);
  const [loading, setLoading] = useState(true);

  const loadData = async () => {
    if (!profileId) {
      setLoading(false);
      return;
    }
    
    setLoading(true);
    
    try {
      // 1) Follow requests (Company -> Profile pending) - get company IDs first, then fetch company details
      const { data: reqs, error: reqsError } = await supabase
        .from('follows')
        .select('id, follower_id')
        .eq('followee_type', 'profile')
        .eq('followee_id', profileId)
        .eq('follower_type', 'company')
        .eq('status', 'pending')
        .order('created_at', { ascending: false });

      if (reqsError) {
        console.error('Error fetching follow requests:', reqsError);
      }

      // Get company details for follow requests
      let pendingCompanies: CompanyLite[] = [];
      if (reqs && reqs.length > 0) {
        const companyIds = reqs.map(r => r.follower_id);
        const { data: companies } = await supabase
          .from('companies')
          .select('id, name, logo_url, industry, main_location, employee_count')
          .in('id', companyIds);
        
        pendingCompanies = companies || [];
      }

      // 2) Followed companies (Profile -> Company accepted) - get company IDs first, then fetch company details
      const { data: fol, error: folError } = await supabase
        .from('follows')
        .select('id, followee_id')
        .eq('follower_type', 'profile')
        .eq('follower_id', profileId)
        .eq('followee_type', 'company')
        .eq('status', 'accepted')
        .order('created_at', { ascending: false });

      if (folError) {
        console.error('Error fetching followed companies:', folError);
      }

      // Get company details for followed companies
      let followedCompanies: CompanyLite[] = [];
      if (fol && fol.length > 0) {
        const companyIds = fol.map(f => f.followee_id);
        const { data: companies } = await supabase
          .from('companies')
          .select('id, name, logo_url, industry, main_location, employee_count')
          .in('id', companyIds);
        
        followedCompanies = companies || [];
      }

      // 3) Suggested companies
      const { data: sugg, error: suggError } = await supabase
        .rpc('suggest_companies_for_profile', { 
          p_profile_id: profileId, 
          p_limit: 12 
        });

      if (suggError) {
        console.error('Error fetching suggestions:', suggError);
      }

      setPending(pendingCompanies);
      setFollowing(followedCompanies);
      setSuggested((sugg as SuggestedCompany[]) ?? []);
    } catch (error) {
      console.error('Error loading companies data:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, [profileId]);

  const refetch = () => {
    if (profileId) {
      loadData();
    }
  };

  return { 
    loading, 
    pending, 
    following, 
    suggested,
    refetch
  };
}