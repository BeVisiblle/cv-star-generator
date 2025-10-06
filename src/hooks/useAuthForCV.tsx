import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import type { User } from '@supabase/supabase-js';

// Simplified auth hook specifically for CV context to avoid circular imports
export const useAuthForCV = () => {
  const [user, setUser] = useState<User | null>(null);
  const [profile, setProfile] = useState<any | null>(null);

  useEffect(() => {
    let abortController = new AbortController();

    // Get current session
    supabase.auth.getSession().then(({ data: { session } }) => {
      setUser(session?.user ?? null);
      if (session?.user && !abortController.signal.aborted) {
        loadProfile(session.user.id);
      }
    });

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (event, session) => {
        setUser(session?.user ?? null);
        if (session?.user && !abortController.signal.aborted) {
          setTimeout(() => {
            if (!abortController.signal.aborted) {
              loadProfile(session.user.id);
            }
          }, 100);
        } else {
          setProfile(null);
        }
      }
    );

    return () => {
      abortController.abort();
      subscription.unsubscribe();
    };
  }, []);

  const loadProfile = async (userId: string) => {
    try {
      const { data: profile, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', userId)
        .maybeSingle();

      if (!error) {
        setProfile(profile);
      } else if (error.message !== 'AbortError: Fetch is aborted') {
        console.error('Error loading profile in CV context:', error);
      }
    } catch (error: any) {
      // Ignore AbortError - it's expected when component unmounts
      if (error?.name !== 'AbortError' && error?.message !== 'Fetch is aborted') {
        console.error('Error loading profile in CV context:', error);
      }
    }
  };

  return { user, profile };
};