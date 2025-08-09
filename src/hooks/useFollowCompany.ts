import { useEffect, useState, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';

export function useFollowCompany(companyId?: string) {
  const { user } = useAuth();
  const [isFollowing, setIsFollowing] = useState(false);
  const [loading, setLoading] = useState(false);

  const fetchStatus = useCallback(async () => {
    if (!user || !companyId) return;
    const { data, error } = await supabase
      .from('follows')
      .select('id')
      .eq('follower_id', user.id)
      .eq('following_id', companyId)
      .maybeSingle();
    if (!error) setIsFollowing(!!data);
  }, [user, companyId]);

  useEffect(() => {
    setIsFollowing(false);
    if (!companyId) return;
    fetchStatus();
  }, [companyId, fetchStatus]);

  const toggleFollow = useCallback(async () => {
    if (!user || !companyId) {
      window.location.href = '/auth';
      return;
    }
    setLoading(true);
    try {
      if (isFollowing) {
        const { error } = await supabase
          .from('follows')
          .delete()
          .eq('follower_id', user.id)
          .eq('following_id', companyId);
        if (!error) setIsFollowing(false);
      } else {
        const { error } = await supabase
          .from('follows')
          .insert({ follower_id: user.id, following_id: companyId });
        if (!error) setIsFollowing(true);
      }
    } finally {
      setLoading(false);
    }
  }, [user, companyId, isFollowing]);

  return { isFollowing, loading, toggleFollow, refetch: fetchStatus };
}
