import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';

export function useLoginCounter() {
  const { user } = useAuth();
  const [loginCount, setLoginCount] = useState(0);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) {
      setLoading(false);
      return;
    }

    const updateLoginCount = async () => {
      try {
        // Get current login count
        const { data: profile } = await supabase
          .from('profiles')
          .select('login_count')
          .eq('id', user.id)
          .single();

        const currentCount = (profile?.login_count || 0) + 1;

        // Update login count
        const { error } = await supabase
          .from('profiles')
          .update({ login_count: currentCount })
          .eq('id', user.id);

        if (!error) {
          setLoginCount(currentCount);
        }
      } catch (error) {
        console.error('Failed to update login count:', error);
      } finally {
        setLoading(false);
      }
    };

    updateLoginCount();
  }, [user]);

  return { loginCount, loading };
}