import { useEffect, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';

export function useSupabaseInit() {
  const [isInitialized, setIsInitialized] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const initSupabase = async () => {
      try {
        console.log('Initializing Supabase...');
        
        // Test connection
        const { data, error } = await supabase
          .from('profiles')
          .select('count')
          .limit(1);
        
        if (error) {
          console.error('Supabase initialization error:', error);
          setError(error.message);
          return;
        }
        
        console.log('✅ Supabase initialized successfully');
        setIsInitialized(true);
        
      } catch (err) {
        console.error('❌ Supabase initialization failed:', err);
        setError(err instanceof Error ? err.message : 'Unknown error');
      }
    };

    initSupabase();
  }, []);

  return { isInitialized, error };
}
