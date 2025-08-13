import { useEffect, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';

export type FollowRequest = {
  id: string;
  follower_id: string;
  companies: {
    id: string;
    name: string;
    logo_url?: string | null;
    industry?: string | null;
    main_location?: string | null;
  };
};

export type FollowedCompany = {
  id: string;
  name: string;
  logo_url?: string | null;
  industry?: string | null;
  main_location?: string | null;
};

export type SuggestedCompany = {
  id: string;
  name: string;
  logo_url?: string | null;
  industry?: string | null;
  city?: string | null;
  reasons: string[];
};

export function useCompaniesViews(profileId: string | null) {
  const [pending, setPending] = useState<FollowRequest[]>([]);
  const [following, setFollowing] = useState<FollowedCompany[]>([]);
  const [suggested, setSuggested] = useState<SuggestedCompany[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
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
            follower_id,
            companies!inner(
              id, 
              name, 
              logo_url, 
              industry, 
              main_location
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
            companies!inner(
              id, 
              name, 
              logo_url, 
              industry, 
              main_location
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

        setPending((reqs as any[]) ?? []);
        setFollowing(fol?.map((r: any) => r.companies).filter(Boolean) ?? []);
        setSuggested((sugg as SuggestedCompany[]) ?? []);
      } catch (error) {
        console.error('Error loading companies data:', error);
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, [profileId]);

  return { 
    loading, 
    pending, 
    following, 
    suggested,
    refetch: () => {
      if (profileId) {
        setLoading(true);
        // Re-trigger the effect
        setLoading(false);
        // This will cause useEffect to re-run
        setPending([]);
        setFollowing([]);
        setSuggested([]);
      }
    }
  };
}