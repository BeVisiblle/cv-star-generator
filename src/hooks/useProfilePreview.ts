import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

interface MaskedProfile {
  id: string;
  name: string;
  avatar_url: string | null;
  role: string | null;
  city: string | null;
  age: number | null;
  status: string | null;
  branche: string | null;
  skills: string[] | null;
  bio_preview: string | null;
  email: string | null;
  phone: string | null;
  full_address: string | null;
  is_unlocked: boolean;
  unlocked_at: string | null;
}

export function useProfilePreview(profileId: string | null, companyId: string | null) {
  return useQuery({
    queryKey: ["profile-preview", profileId, companyId],
    enabled: !!profileId && !!companyId,
    queryFn: async (): Promise<MaskedProfile | null> => {
      if (!profileId || !companyId) return null;

      const { data, error } = await supabase.rpc("get_profile_preview", {
        p_profile_id: profileId,
        p_company_id: companyId,
      });

      if (error) throw error;
      
      return data?.[0] || null;
    },
  });
}
