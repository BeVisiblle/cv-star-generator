import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';

interface Language {
  id: string;
  name: string;
  code: string;
}

export const useLanguages = () => {
  const [languages, setLanguages] = useState<Language[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchLanguages = async () => {
      try {
        setLoading(true);
        const { data, error: primaryError } = await supabase
          .from('languages')
          .select('id, name, code')
          .order('name');

        if (!primaryError && data && data.length > 0) {
          setLanguages(data);
          setError(null);
          return;
        }

        // Fallback to master table if primary fails or returns empty
        const { data: master, error: fallbackError } = await supabase
          .from('languages_master')
          .select('code, name_de')
          .order('name_de');

        if (fallbackError) {
          setError(primaryError?.message || fallbackError.message);
          setLanguages([]);
        } else {
          const mapped = (master || []).map((l: any) => ({
            id: `master-${l.code}`,
            name: l.name_de,
            code: l.code,
          }));
          setLanguages(mapped);
          setError(null);
        }
      } catch (err) {
        setError('Failed to fetch languages');
      } finally {
        setLoading(false);
      }
    };

    fetchLanguages();
  }, []);

  return {
    languages,
    loading,
    error
  };
};