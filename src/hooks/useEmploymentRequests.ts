import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

export type EmploymentRequest = {
  id: string;
  user_id: string;
  company_id: string;
  status: "pending" | "accepted" | "declined";
  created_at: string;
  confirmed_by?: string | null;
  company?: {
    id: string;
    name: string;
    logo_url?: string | null;
  };
  user_profile?: {
    id: string;
    vorname?: string | null;
    nachname?: string | null;
    headline?: string | null;
  };
};

export function useEmploymentRequests(userId?: string) {
  return useQuery({
    queryKey: ["employment_requests", userId],
    enabled: !!userId,
    queryFn: async () => {
      const { data, error } = await supabase
        .from("company_employment_requests")
        .select(`
          id,
          user_id,
          company_id,
          status,
          created_at,
          confirmed_by,
          companies (
            id,
            name,
            logo_url
          )
        `)
        .eq("user_id", userId!)
        .order("created_at", { ascending: false });

      if (error) throw error;
      return data as any[] || [];
    },
    staleTime: 30_000,
  });
}

export function useCompanyEmploymentRequests(companyId?: string) {
  return useQuery({
    queryKey: ["company_employment_requests", companyId],
    enabled: !!companyId,
    queryFn: async () => {
      const { data, error } = await supabase
        .from("company_employment_requests")
        .select(`
          id,
          user_id,
          company_id,
          status,
          created_at,
          confirmed_by,
          profiles (
            id,
            vorname,
            nachname,
            headline
          )
        `)
        .eq("company_id", companyId!)
        .order("created_at", { ascending: false });

      if (error) throw error;
      return data as any[] || [];
    },
    staleTime: 30_000,
  });
}