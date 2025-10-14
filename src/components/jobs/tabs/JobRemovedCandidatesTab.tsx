import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { User, UserX } from "lucide-react";
import { formatDistanceToNow } from "date-fns";
import { de } from "date-fns/locale";

interface JobRemovedCandidatesTabProps {
  jobId: string;
}

export function JobRemovedCandidatesTab({ jobId }: JobRemovedCandidatesTabProps) {
  const { data: removedApplications, isLoading } = useQuery({
    queryKey: ["job-removed-applications", jobId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("applications")
        .select(`
          *,
          candidates (
            id,
            full_name,
            email,
            profile_image,
            title
          )
        `)
        .eq("job_id", jobId)
        .eq("stage", "rejected")
        .order("updated_at", { ascending: false });

      if (error) throw error;
      return data;
    },
  });

  if (isLoading) {
    return (
      <div className="text-center py-12">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto"></div>
      </div>
    );
  }

  if (!removedApplications || removedApplications.length === 0) {
    return (
      <Card>
        <CardContent className="flex flex-col items-center justify-center py-12">
          <UserX className="h-16 w-16 text-muted-foreground mb-4" />
          <p className="text-muted-foreground">Keine entfernten Kandidaten</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-4">
      {removedApplications.map((application) => {
        const candidate = application.candidates;
        return (
          <Card key={application.id}>
            <CardContent className="p-4">
              <div className="flex items-center gap-4">
                <Avatar>
                  <AvatarImage src={candidate?.profile_image} />
                  <AvatarFallback>
                    <User className="h-4 w-4" />
                  </AvatarFallback>
                </Avatar>
                <div className="flex-1">
                  <h4 className="font-semibold">{candidate?.full_name || "Unbekannt"}</h4>
                  <p className="text-sm text-muted-foreground">{candidate?.title || "—"}</p>
                  <p className="text-xs text-muted-foreground mt-1">
                    Entfernt {formatDistanceToNow(new Date(application.updated_at), { 
                      addSuffix: true,
                      locale: de 
                    })}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        );
      })}
    </div>
  );
}
