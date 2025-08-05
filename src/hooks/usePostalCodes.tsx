import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';

interface PostalCode {
  id: string;
  plz: string;
  ort: string;
  bundesland: string;
}

export const usePostalCodes = () => {
  const [postalCodes, setPostalCodes] = useState<PostalCode[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchPostalCodes = async () => {
      try {
        setLoading(true);
        const { data, error } = await supabase
          .from('postal_codes')
          .select('id, plz, ort, bundesland')
          .order('plz');

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

    fetchPostalCodes();
  }, []);

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