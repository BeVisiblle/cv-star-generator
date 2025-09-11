import React, { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';

interface SimpleCompany {
  id: string;
  name: string | null;
  logo_url: string | null;
  industry: string | null;
  main_location: string | null;
}

export function useGatedCompanyRecommendations(limit: number = 3) {
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [items, setItems] = useState<SimpleCompany[]>([]);
  const [following, setFollowing] = useState<Set<string>>(new Set());
  const [gatedCompanies, setGatedCompanies] = useState<Set<string>>(new Set());
  const [viewTimes, setViewTimes] = useState<Map<string, number>>(new Map());
  const [hasScrolled, setHasScrolled] = useState<Set<string>>(new Set());

  // Load companies and filter out already followed ones
  useEffect(() => {
    const load = async () => {
      setLoading(true);
      try {
        // Load more companies to ensure we have enough after filtering
        const { data, error } = await supabase
          .rpc('get_companies_public', { search: null, limit_count: 20, offset_count: 0 });
        
        if (error) throw error;
        
        const companies = ((data as any[]) || []).map(d => ({ 
          id: d.id, 
          name: d.name, 
          logo_url: d.logo_url, 
          industry: d.industry, 
          main_location: d.main_location 
        }));
        
        setItems(companies);
        setGatedCompanies(new Set(companies.map(c => c.id)));
      } catch (e) {
        console.warn("Company recommendations restricted by RLS or error.", e);
        setItems([]);
      } finally {
        setLoading(false);
      }
    };
    load();
  }, []);

  // Load followed companies
  useEffect(() => {
    const loadFollows = async () => {
      try {
        if (!user || items.length === 0) {
          setFollowing(new Set());
          return;
        }
        
        const ids = items.map(i => i.id);
        const { data, error } = await supabase
          .from('follows')
          .select('followee_id')
          .eq('follower_id', user.id)
          .eq('follower_type', 'profile')
          .eq('followee_type', 'company')
          .in('followee_id', ids);
          
        if (!error && data) {
          setFollowing(new Set((data as any[]).map((d: any) => d.followee_id as string)));
        }
      } catch (e) {
        console.error(e);
      }
    };
    loadFollows();
  }, [items, user]);

  // Track view time for a company
  const startViewTracking = useCallback((companyId: string) => {
    setViewTimes(prev => new Map(prev.set(companyId, Date.now())));
  }, []);

  // Mark company as scrolled
  const markAsScrolled = useCallback((companyId: string) => {
    setHasScrolled(prev => new Set(prev.add(companyId)));
  }, []);

  // Check if follow button should be enabled
  const isFollowEnabled = useCallback((companyId: string) => {
    const viewTime = viewTimes.get(companyId);
    const hasBeenScrolled = hasScrolled.has(companyId);
    const hasViewedFor30s = viewTime && (Date.now() - viewTime) >= 30000;
    
    return hasViewedFor30s && hasBeenScrolled;
  }, [viewTimes, hasScrolled]);

  // Follow/unfollow company
  const toggleFollow = useCallback(async (companyId: string) => {
    if (!user) {
      window.location.href = '/auth';
      return;
    }

    try {
      if (following.has(companyId)) {
        const { error } = await supabase.from('follows')
          .delete()
          .eq('follower_id', user.id)
          .eq('followee_id', companyId)
          .eq('follower_type', 'profile')
          .eq('followee_type', 'company');
          
        if (!error) {
          setFollowing(prev => {
            const newSet = new Set(prev);
            newSet.delete(companyId);
            return newSet;
          });
        }
      } else {
        const { error } = await supabase.from('follows').insert({
          follower_id: user.id,
          followee_id: companyId,
          follower_type: 'profile',
          followee_type: 'company',
          status: 'accepted'
        });
        
        if (!error) {
          setFollowing(prev => new Set(prev.add(companyId)));
        }
      }
    } catch (e) {
      console.error(e);
    }
  }, [user, following]);

  // Get filtered companies (not following, up to limit)
  const visibleCompanies = React.useMemo(() => {
    return items
      .filter(company => !following.has(company.id))
      .slice(0, limit);
  }, [items, following, limit]);

  return {
    loading,
    companies: visibleCompanies,
    following,
    gatedCompanies,
    isFollowEnabled,
    startViewTracking,
    markAsScrolled,
    toggleFollow
  };
}