import { useEffect, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

/** small debounce helper */
function useDebounced<T>(value: T, delay = 200) {
  const [v, setV] = useState(value);
  useEffect(() => {
    const t = setTimeout(() => setV(value), delay);
    return () => clearTimeout(t);
  }, [value, delay]);
  return v;
}

export type CompanyOption = {
  id: string;
  name: string;
  logo_url: string | null;
  slug: string;
  employer_profile?: boolean;
};

export function useSearchCompaniesForClaim(query: string, limit = 10) {
  const q = useDebounced(query.trim(), 200);
  return useQuery({
    queryKey: ["search_companies_for_claim", q, limit],
    enabled: q.length >= 1, // start searching from 1 char
    queryFn: async () => {
      try {
        const { data, error } = await supabase
          .from('companies')
          .select('id, name, logo_url, employer_profile')
          .ilike('name', `%${q}%`)
          .limit(limit);
        
        if (error) throw error;
        
        // Generate slugs client-side and map to expected format
        return (data || []).map(company => ({
          id: company.id,
          name: company.name,
          logo_url: company.logo_url,
          employer_profile: company.employer_profile || false,
          slug: company.name?.toLowerCase().replace(/[^a-z0-9]/g, '-').replace(/-+/g, '-') || company.id
        })) as CompanyOption[];
      } catch (error) {
        console.error('Error searching companies:', error);
        throw error;
      }
    },
    staleTime: 60_000,
  });
}