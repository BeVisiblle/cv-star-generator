import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';

export const useSupabaseInit = () => {
  const [isInitialized, setIsInitialized] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const initSupabase = async () => {
      try {
        // Test Supabase connection with timeout
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), 3000);

        const { data, error } = await supabase
          .from('profiles')
          .select('count')
          .limit(1)
          .abortSignal(controller.signal);

        clearTimeout(timeoutId);

        if (error) {
          console.warn('Supabase connection warning:', error.message);
          setError(`Verbindungswarnung: ${error.message}`);
        }
        
        setIsInitialized(true);
      } catch (err) {
        console.error('Supabase init error:', err);
        setError('Verbindungsfehler - Notfall-Modus aktiviert');
        setIsInitialized(true); // Still allow app to work
      }
    };

    initSupabase();
  }, []);

  return { isInitialized, error };
};
