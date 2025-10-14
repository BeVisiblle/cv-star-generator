import { useMemo } from "react";
import { useSavedJobs, useToggleSaveJob } from "@/hooks/useSavedJobs";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { MoreVertical, Eye, Bookmark, AlertCircle } from "lucide-react";
import { formatDistanceToNow } from "date-fns";
import { de } from "date-fns/locale";
import { useNavigate } from "react-router-dom";

interface SavedJobsListProps {
  searchQuery: string;
}

export function SavedJobsList({ searchQuery }: SavedJobsListProps) {
  const { data: savedJobs, isLoading } = useSavedJobs();
  const toggleSaveMutation = useToggleSaveJob();
  const navigate = useNavigate();

  const filteredJobs = useMemo(() => {
    if (!savedJobs) return [];

    let filtered = savedJobs;

    // Search filter
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(
        (item) =>
          item.job?.title?.toLowerCase().includes(query) ||
          item.job?.company?.name?.toLowerCase().includes(query) ||
          item.job?.city?.toLowerCase().includes(query)
      );
    }

    return filtered;
  }, [savedJobs, searchQuery]);

  if (isLoading) {
    return <div className="text-center py-12">Laden...</div>;
  }

  return (
    <div className="space-y-6">
      {/* Filter Button */}
      <div className="flex gap-2">
        <Button variant="default" size="sm" className="rounded-full">
          Alle ({filteredJobs.length})
        </Button>
      </div>

      {/* Saved Jobs List */}
      {filteredJobs.length === 0 ? (
        <Card className="p-12 text-center">
          <Bookmark className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
          <p className="text-muted-foreground">Keine gespeicherten Jobs gefunden</p>
        </Card>
      ) : (
        <div className="space-y-4">
          {filteredJobs.map((savedJob) => {
            const isActive = savedJob.job?.is_active;

            return (
              <Card
                key={savedJob.id}
                className="p-6 hover:shadow-md transition-shadow cursor-pointer"
                onClick={() => navigate(`/jobs/${savedJob.job_id}`)}
              >
                <div className="flex items-start gap-4">
                  {/* Company Logo */}
                  <Avatar className="h-16 w-16 rounded-lg">
                    <AvatarImage src={savedJob.job?.company?.logo_url} />
                    <AvatarFallback className="rounded-lg">
                      {savedJob.job?.company?.name?.charAt(0)}
                    </AvatarFallback>
                  </Avatar>

                  {/* Job Info */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between gap-4">
                      <div className="flex-1">
                        <h3 className="font-semibold text-lg mb-1 hover:text-primary">
                          {savedJob.job?.title}
                        </h3>
                        <p className="text-sm text-muted-foreground">
                          {savedJob.job?.company?.name}
                        </p>
                        <p className="text-sm text-muted-foreground">
                          {savedJob.job?.city} • {savedJob.job?.employment_type}
                        </p>
                      </div>

                      {/* Actions Menu */}
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild onClick={(e) => e.stopPropagation()}>
                          <Button variant="ghost" size="icon">
                            <MoreVertical className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem
                            onClick={(e) => {
                              e.stopPropagation();
                              navigate(`/jobs/${savedJob.job_id}`);
                            }}
                          >
                            <Eye className="h-4 w-4 mr-2" />
                            Job ansehen
                          </DropdownMenuItem>
                          <DropdownMenuItem
                            onClick={(e) => {
                              e.stopPropagation();
                              toggleSaveMutation.mutate({ jobId: savedJob.job_id, isSaved: true });
                            }}
                            className="text-destructive"
                          >
                            <Bookmark className="h-4 w-4 mr-2" />
                            Aus Favoriten entfernen
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </div>

                    {/* Date and Status */}
                    <div className="flex items-center gap-3 mt-3">
                      {!isActive && (
                        <Badge variant="outline" className="flex items-center gap-1 text-orange-600">
                          <AlertCircle className="h-3 w-3" />
                          Nicht mehr aktiv
                        </Badge>
                      )}
                      <span className="text-sm text-muted-foreground">
                        Gespeichert vor {formatDistanceToNow(new Date(savedJob.created_at), { locale: de })}
                      </span>
                    </div>
                  </div>
                </div>
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );
}
