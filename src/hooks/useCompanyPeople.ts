import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

export type CompanyPerson = {
  user_id: string;
  full_name: string;
  vorname: string | null;
  nachname: string | null;
  avatar_url: string | null;
  headline: string | null;
  created_at: string;
};

export function useCompanyPeople(companyId?: string) {
  return useQuery({
    queryKey: ["company_people_public", companyId],
    enabled: !!companyId,
    queryFn: async (): Promise<CompanyPerson[]> => {
      const { data, error } = await supabase
        .rpc("company_people_public", { p_company_id: companyId! });
      
      if (error) throw error;
      
      return data || [];
    },
    staleTime: 30_000,
  });
}