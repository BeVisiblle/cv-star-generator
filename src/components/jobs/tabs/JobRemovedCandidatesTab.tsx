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
            vorname,
            nachname,
            email,
            profile_image,
            title
          )
        `)
        .eq("job_id", jobId)
        .in("status", ["rejected", "archived"])
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
              <div className="flex items-start gap-4">
                <Avatar>
                  <AvatarImage src={candidate?.profile_image} />
                  <AvatarFallback>
                    <User className="h-4 w-4" />
                  </AvatarFallback>
                </Avatar>
                <div className="flex-1">
                  <div className="flex items-center justify-between mb-2">
                    <h4 className="font-semibold">{candidate?.vorname || "Unbekannt"}</h4>
                    <span className="text-xs bg-muted px-2 py-1 rounded">
                      {application.status === "rejected" ? "Abgelehnt" : "Archiviert"}
                    </span>
                  </div>
                  <p className="text-sm text-muted-foreground">{candidate?.title || "—"}</p>
                  <div className="text-xs text-muted-foreground space-y-1 mt-2">
                    <div>
                      Aktualisiert: {formatDistanceToNow(new Date(application.updated_at), { 
                        addSuffix: true,
                        locale: de 
                      })}
                    </div>
                    {application.reason_short && (
                      <div>
                        Grund: {application.reason_short}
                        {application.reason_custom && ` - ${application.reason_custom}`}
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        );
      })}
    </div>
  );
}
