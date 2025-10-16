import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";

export function useIsCompanyOwner(companyId?: string) {
  const { user } = useAuth();
  
  return useQuery({
    queryKey: ["is-company-owner", companyId, user?.id],
    queryFn: async () => {
      if (!companyId || !user?.id) return false;
      
      const { data } = await supabase
        .from("company_users")
        .select("role")
        .eq("company_id", companyId)
        .eq("user_id", user.id)
        .maybeSingle();
      
      return data?.role === "admin";
    },
    enabled: !!companyId && !!user?.id,
  });
}
