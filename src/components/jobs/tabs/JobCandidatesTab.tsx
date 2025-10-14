import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Star, User } from "lucide-react";
import { formatDistanceToNow } from "date-fns";
import { de } from "date-fns/locale";

interface JobCandidatesTabProps {
  jobId: string;
}

export function JobCandidatesTab({ jobId }: JobCandidatesTabProps) {
  const { data: applications, isLoading } = useQuery({
    queryKey: ["job-applications", jobId],
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
        .order("created_at", { ascending: false });

      if (error) throw error;
      return data;
    },
  });

  const newCandidates = applications?.filter(a => a.stage === "new") || [];
  const interviews = applications?.filter(a => a.stage === "interview") || [];
  const approved = applications?.filter(a => a.stage === "approved") || [];

  const CandidateCard = ({ application }: { application: any }) => {
    const candidate = application.candidates;
    return (
      <Card className="hover:shadow-md transition-shadow">
        <CardContent className="p-4">
          <div className="flex items-start justify-between gap-3">
            <div className="flex items-start gap-3 flex-1">
              <Avatar>
                <AvatarImage src={candidate?.profile_image} />
                <AvatarFallback>
                  <User className="h-4 w-4" />
                </AvatarFallback>
              </Avatar>
              <div className="flex-1 min-w-0">
                <h4 className="font-semibold truncate">{candidate?.full_name || "Unbekannt"}</h4>
                <p className="text-sm text-muted-foreground truncate">{candidate?.title || "—"}</p>
                <p className="text-xs text-muted-foreground mt-1">
                  {formatDistanceToNow(new Date(application.created_at), { 
                    addSuffix: true,
                    locale: de 
                  })}
                </p>
              </div>
            </div>
            <button className="text-muted-foreground hover:text-yellow-500 transition-colors">
              <Star className="h-4 w-4" />
            </button>
          </div>
        </CardContent>
      </Card>
    );
  };

  if (isLoading) {
    return (
      <div className="text-center py-12">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto"></div>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
      {/* New Candidates */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">New candidates</CardTitle>
          <p className="text-sm text-muted-foreground">{newCandidates.length} Kandidaten</p>
        </CardHeader>
        <CardContent className="space-y-3">
          {newCandidates.length > 0 ? (
            newCandidates.map(app => <CandidateCard key={app.id} application={app} />)
          ) : (
            <p className="text-sm text-muted-foreground text-center py-8">
              Keine neuen Kandidaten
            </p>
          )}
        </CardContent>
      </Card>

      {/* Interviews */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Interviews</CardTitle>
          <p className="text-sm text-muted-foreground">{interviews.length} Kandidaten</p>
        </CardHeader>
        <CardContent className="space-y-3">
          {interviews.length > 0 ? (
            interviews.map(app => <CandidateCard key={app.id} application={app} />)
          ) : (
            <p className="text-sm text-muted-foreground text-center py-8">
              Keine Interviews geplant
            </p>
          )}
        </CardContent>
      </Card>

      {/* Approved */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Approved candidates</CardTitle>
          <p className="text-sm text-muted-foreground">{approved.length} Kandidaten</p>
        </CardHeader>
        <CardContent className="space-y-3">
          {approved.length > 0 ? (
            approved.map(app => <CandidateCard key={app.id} application={app} />)
          ) : (
            <p className="text-sm text-muted-foreground text-center py-8">
              Keine genehmigten Kandidaten
            </p>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
