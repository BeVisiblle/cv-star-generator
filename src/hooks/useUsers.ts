import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

export type UserStatusFilter = "all" | "published" | "incomplete";

export interface AdminUser {
  id: string;
  email: string | null;
  created_at: string | null;
  profile_complete: boolean | null;
  profile_published: boolean | null;
  avatar_url: string | null;
}

export interface UseUsersParams {
  search?: string;
  status?: UserStatusFilter;
  page?: number;
  pageSize?: number;
}

export function useUsers({ search = "", status = "all", page = 1, pageSize = 10 }: UseUsersParams) {
  return useQuery({
    queryKey: ["admin-users", { search, status, page, pageSize }],
    queryFn: async () => {
      const from = (page - 1) * pageSize;
      const to = from + pageSize - 1;

      let query = supabase
        .from("profiles")
        .select("id,email,created_at,profile_complete,profile_published,avatar_url", { count: "exact" })
        .order("created_at", { ascending: false })
        .range(from, to);

      if (search.trim()) {
        query = query.ilike("email", `%${search.trim()}%`);
      }

      if (status === "published") {
        query = query.eq("profile_published", true);
      } else if (status === "incomplete") {
        query = query.eq("profile_complete", false);
      }

      const { data, error, count } = await query;
      if (error) throw error;
      return { users: (data || []) as AdminUser[], total: count || 0 };
    },
    staleTime: 30_000,
  });
}
