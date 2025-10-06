import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';

interface PostalCode {
  id: string;
  plz: string;
  ort: string;
  bundesland: string;
}

export const useLazyPostalCodes = (searchQuery: string) => {
  const [postalCodes, setPostalCodes] = useState<PostalCode[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    // Only search if we have at least 3 characters
    if (!searchQuery || searchQuery.length < 3) {
      setPostalCodes([]);
      setLoading(false);
      return;
    }

    const fetchPostalCodes = async () => {
      try {
        setLoading(true);
        setError(null);

        const { data, error } = await supabase
          .from('postal_codes')
          .select('id, plz, ort, bundesland')
          .ilike('plz', `${searchQuery}%`)
          .order('plz')
          .limit(50);

        if (error) {
          setError(error.message);
        } else {
          setPostalCodes(data || []);
        }
      } catch (err) {
        setError('Failed to fetch postal codes');
      } finally {
        setLoading(false);
      }
    };

    // Debounce the search
    const timeoutId = setTimeout(() => {
      fetchPostalCodes();
    }, 300);

    return () => clearTimeout(timeoutId);
  }, [searchQuery]);

  const findLocationByPLZ = (plz: string) => {
    return postalCodes.find(code => code.plz === plz);
  };

  return {
    postalCodes,
    loading,
    error,
    findLocationByPLZ
  };
};
