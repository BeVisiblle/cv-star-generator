import { supabase } from "@/integrations/supabase/client";
import { useQuery } from "@tanstack/react-query";
import type { Profile } from "@/components/profile/ProfileCard";

type Variant = "dashboard" | "search" | "unlocked";

export function useProfiles(params: {
  companyId: string;
  variant: Variant;
  limit?: number;
  offset?: number;
  enabled?: boolean;
}) {
  const { companyId, variant, limit = 24, offset = 0, enabled = true } = params;

  return useQuery({
    queryKey: ["profiles-with-match", companyId, variant, limit, offset],
    enabled: !!companyId && enabled,
    queryFn: async (): Promise<Profile[]> => {
      const { data, error } = await supabase
        .rpc("profiles_with_match", {
          p_company_id: companyId,
          p_variant: variant,
          p_limit: limit,
          p_offset: offset,
        });

      if (error) throw error;

      // Calculate match scores dynamically using the new function
      const profilesWithMatch = await Promise.all(
        (data ?? []).map(async (r: any) => {
          const { data: matchScore } = await supabase.rpc("calculate_match_score", {
            p_profile_id: r.id,
            p_company_id: companyId,
          });

          return {
            id: r.id,
            name: r.name,
            avatar_url: r.avatar_url,
            role: r.role,
            city: r.city,
            fs: r.fs,
            seeking: r.seeking,
            skills: r.skills || [],
            match: matchScore ?? 0,
          };
        })
      );

      return profilesWithMatch;
    },
  });
}