import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Eye, Users, CheckCircle } from "lucide-react";

interface JobAnalyticsTabProps {
  jobId: string;
}

export function JobAnalyticsTab({ jobId }: JobAnalyticsTabProps) {
  const { data: stats, isLoading } = useQuery({
    queryKey: ["job-stats", jobId],
    queryFn: async () => {
      const { data: applications, error } = await supabase
        .from("applications")
        .select("status")
        .eq("job_id", jobId);

      if (error) throw error;

      return {
        total: applications?.length || 0,
        approved: applications?.filter(a => a.status === "hired").length || 0,
        views: 0, // Placeholder - can be implemented later
      };
    },
  });

  const StatCard = ({ icon: Icon, title, value, change }: any) => (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between pb-2">
        <CardTitle className="text-sm font-medium text-muted-foreground">{title}</CardTitle>
        <Icon className="h-4 w-4 text-muted-foreground" />
      </CardHeader>
      <CardContent>
        <div className="text-2xl font-bold">{value}</div>
        {change && (
          <p className="text-xs text-muted-foreground mt-1">
            {change}
          </p>
        )}
      </CardContent>
    </Card>
  );

  if (isLoading) {
    return (
      <div className="text-center py-12">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <StatCard
          icon={Eye}
          title="Job views"
          value={stats?.views || 0}
          change="+12% from last month"
        />
        <StatCard
          icon={Users}
          title="Job Applicants"
          value={stats?.total || 0}
          change="+8% from last month"
        />
        <StatCard
          icon={CheckCircle}
          title="Approved CVs"
          value={stats?.approved || 0}
          change="+5% from last month"
        />
      </div>

      {/* Trending Countries Placeholder */}
      <Card>
        <CardHeader>
          <CardTitle>Trending countries</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center py-8 text-muted-foreground">
            Detaillierte Analysen werden in Kürze verfügbar sein
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
