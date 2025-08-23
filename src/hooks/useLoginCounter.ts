import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';

export function useLoginCounter() {
  const { user } = useAuth();
  const [loginCount, setLoginCount] = useState(0);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!user?.id) {
      setLoading(false);
      return;
    }

    const updateLoginCount = async () => {
      setLoading(true);
      try {
        // Call the database function to increment login count
        const { data, error } = await supabase.rpc('increment_login_count', {
          user_id: user.id
        });

        if (error) {
          console.error('Failed to increment login count:', error);
          setLoginCount(0);
        } else {
          setLoginCount(data || 0);
        }
      } catch (error) {
        console.error('Unexpected error incrementing login count:', error);
        setLoginCount(0);
      } finally {
        setLoading(false);
      }
    };

    updateLoginCount();
  }, [user?.id]);

  return { loginCount, loading };
}