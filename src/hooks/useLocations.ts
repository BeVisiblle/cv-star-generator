import { useState, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';

interface Location {
  city: string;
  lat: number;
  lng: number;
}

export function useLocations() {
  const [loading, setLoading] = useState(false);

  const searchLocations = useCallback(async (postalCode: string): Promise<Location[]> => {
    if (!postalCode || postalCode.length !== 5) {
      return [];
    }

    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('locations')
        .select('city, lat, lon')
        .eq('postal_code', postalCode);

      if (error) throw error;

      return data?.map(item => ({
        city: item.city,
        lat: item.lat,
        lng: item.lon
      })) || [];
    } catch (error) {
      console.error('Failed to search locations:', error);
      return [];
    } finally {
      setLoading(false);
    }
  }, []);

  return {
    searchLocations,
    loading
  };
}