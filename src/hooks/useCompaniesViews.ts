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
      // 1) Follow requests (Company -> Profile pending)
      const { data: reqs, error: reqsError } = await supabase
        .from('follows')
        .select(`
          id,
          companies:follower_id (
            id, 
            name, 
            logo_url, 
            industry, 
            main_location, 
            employee_count
          )
        `)
        .eq('followee_type', 'profile')
        .eq('followee_id', profileId)
        .eq('follower_type', 'company')
        .eq('status', 'pending')
        .order('created_at', { ascending: false });

      if (reqsError) {
        console.error('Error fetching follow requests:', reqsError);
      }

      // 2) Followed companies (Profile -> Company accepted)
      const { data: fol, error: folError } = await supabase
        .from('follows')
        .select(`
          id,
          companies:followee_id (
            id, 
            name, 
            logo_url, 
            industry, 
            main_location, 
            employee_count
          )
        `)
        .eq('follower_type', 'profile')
        .eq('follower_id', profileId)
        .eq('followee_type', 'company')
        .eq('status', 'accepted')
        .order('created_at', { ascending: false });

      if (folError) {
        console.error('Error fetching followed companies:', folError);
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

      setPending((reqs ?? []).map((r: any) => r.companies as CompanyLite).filter(Boolean));
      setFollowing((fol ?? []).map((r: any) => r.companies as CompanyLite).filter(Boolean));
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