import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "./useAuth";

export type CompanyInterest = {
  id: string;
  company_id: string;
  job_id: string;
  unlocked_at: string;
  company: {
    id: string;
    name: string;
    logo_url?: string;
    industry?: string;
  };
  job: {
    id: string;
    title: string;
    city?: string;
  };
};

export function useCompanyInterests() {
  const { user } = useAuth();

  return useQuery({
    queryKey: ["company-interests", user?.id],
    enabled: !!user?.id,
    queryFn: async () => {
      // Get companies that unlocked the user based on a job
      const { data, error } = await supabase
        .from("company_candidates")
        .select(`
          id,
          company_id,
          unlocked_at,
          candidate:candidates!candidate_id (
            user_id
          ),
          company:companies!company_id (
            id,
            name,
            logo_url,
            industry
          )
        `)
        .not("unlocked_at", "is", null)
        .order("unlocked_at", { ascending: false });

      if (error) throw error;

      // Filter for current user
      const userInterests = (data as any[])?.filter(
        (item) => item.candidate?.user_id === user!.id
      );

      return userInterests as unknown as CompanyInterest[];
    },
  });
}
