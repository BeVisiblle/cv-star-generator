import { useQuery } from "@tanstack/react-query";

export type Kpis = {
  revenue: number;
  dauUsers: number;
  dauCompanies: number;
  postsUsers: number;
  postsCompanies: number;
  avgLogin: number;
  unlockedProfiles: number;
};

export function useKpis(range: string) {
  // Mock initial data; replace with Supabase view/RPC later
  return useQuery({
    queryKey: ["kpis", range],
    queryFn: async () => {
      await new Promise((r) => setTimeout(r, 600));
      const mock: Kpis = {
        revenue: 12890,
        dauUsers: 842,
        dauCompanies: 113,
        postsUsers: 214,
        postsCompanies: 47,
        avgLogin: 9.6,
        unlockedProfiles: 73,
      };
      return mock;
    },
  });
}
