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
};

export function useSearchCompaniesForClaim(query: string, limit = 10) {
  const q = useDebounced(query.trim(), 200);
  return useQuery({
    queryKey: ["search_companies_for_claim", q, limit],
    enabled: q.length >= 2, // start searching from 2 chars
    queryFn: async () => {
      const { data, error } = await supabase.rpc("search_companies_for_claim", {
        q,
        limit,
      });
      if (error) throw error;
      return (data ?? []) as CompanyOption[];
    },
    staleTime: 60_000,
  });
}