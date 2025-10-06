import { useCallback, useEffect, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';

// Hook for company members to show interest (follow) in a user profile
// Uses company_user_interests table with RLS
export function useCompanyInterest(targetUserId?: string) {
  const { user } = useAuth();
  const [companyId, setCompanyId] = useState<string | null>(null);
  const [interested, setInterested] = useState(false);
  const [loading, setLoading] = useState(false);

  // Determine acting company (fetch from company_users)
  useEffect(() => {
    const load = async () => {
      if (!user) return;
      const { data, error } = await supabase
        .from('company_users')
        .select('company_id')
        .eq('user_id', user.id)
        .limit(1)
        .maybeSingle();
      if (!error && data) setCompanyId(data.company_id);
    };
    load();
  }, [user]);

  const fetchStatus = useCallback(async () => {
    if (!user || !targetUserId || !companyId) return;
    const { data, error } = await supabase
      .from('company_user_interests')
      .select('id')
      .eq('company_id', companyId)
      .eq('user_id', targetUserId)
      .maybeSingle();
    if (!error) setInterested(!!data);
  }, [user, targetUserId, companyId]);

  useEffect(() => {
    setInterested(false);
    fetchStatus();
  }, [fetchStatus]);

  const toggle = useCallback(async () => {
    if (!user) {
      window.location.href = '/auth';
      return;
    }
    if (!targetUserId || !companyId) return;
    setLoading(true);
    try {
      if (interested) {
        const { error } = await supabase
          .from('company_user_interests')
          .delete()
          .eq('company_id', companyId)
          .eq('user_id', targetUserId);
        if (!error) setInterested(false);
      } else {
        const { error } = await supabase
          .from('company_user_interests')
          .insert({ company_id: companyId, user_id: targetUserId, created_by: user.id });
        if (!error) setInterested(true);
      }
    } finally {
      setLoading(false);
    }
  }, [user, targetUserId, companyId, interested]);

  return { interested, loading, toggle, refetch: fetchStatus };
}
