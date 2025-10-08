import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Lock, Users, Briefcase, Eye } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";

interface UnlockStatisticsProps {
  companyId: string;
}

export function UnlockStatistics({ companyId }: UnlockStatisticsProps) {
  const { data: stats, isLoading } = useQuery({
    queryKey: ["company-unlock-stats", companyId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("company_unlock_stats")
        .select("*")
        .eq("company_id", companyId)
        .single();

      if (error) throw error;
      return data;
    },
  });

  if (isLoading) {
    return (
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {[...Array(4)].map((_, i) => (
          <Skeleton key={i} className="h-32" />
        ))}
      </div>
    );
  }

  const statCards = [
    {
      title: "Freigeschaltete Profile",
      value: stats?.unlocked_count || 0,
      icon: Lock,
      description: "Kontakte freigeschaltet",
    },
    {
      title: "Kandidaten gesamt",
      value: stats?.total_candidates || 0,
      icon: Users,
      description: "Im Pipeline",
    },
    {
      title: "Bewerbungen",
      value: stats?.total_applications || 0,
      icon: Briefcase,
      description: "Eingegangene Bewerbungen",
    },
    {
      title: "Profile angesehen",
      value: stats?.profiles_unlocked || 0,
      icon: Eye,
      description: "Vollständige Profile",
    },
  ];

  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
      {statCards.map((stat) => (
        <Card key={stat.title}>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">{stat.title}</CardTitle>
            <stat.icon className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stat.value}</div>
            <p className="text-xs text-muted-foreground">{stat.description}</p>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
