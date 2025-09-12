import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

export type CompanyPerson = {
  user_id: string;
  full_name: string;
  vorname: string | null;
  nachname: string | null;
  avatar_url: string | null;
  created_at: string;
};

export function useCompanyPeople(companyId?: string) {
  return useQuery({
    queryKey: ["company_people_public", companyId],
    enabled: !!companyId,
    queryFn: async (): Promise<CompanyPerson[]> => {
      const { data, error } = await supabase
        .from("profiles_public")
        .select("id, full_name, vorname, nachname, avatar_url, employment_status")
        .eq("company_id", companyId!);
      
      if (error) throw error;
      
      return (data || []).map(item => ({
        user_id: item.id,
        full_name: item.full_name,
        vorname: item.vorname,
        nachname: item.nachname,
        avatar_url: item.avatar_url,
        created_at: new Date().toISOString()
      }));
    },
    staleTime: 30_000,
  });
}