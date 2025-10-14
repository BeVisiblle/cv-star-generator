import { useState, useMemo } from "react";
import { useMyApplications, useWithdrawApplication, ApplicationStatus } from "@/hooks/useMyApplications";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { MoreVertical, Eye, XCircle, CheckCircle, Clock, AlertCircle } from "lucide-react";
import { formatDistanceToNow } from "date-fns";
import { de } from "date-fns/locale";
import { useNavigate } from "react-router-dom";

interface ApplicationsListProps {
  searchQuery: string;
}

export function ApplicationsList({ searchQuery }: ApplicationsListProps) {
  const { data: applications, isLoading } = useMyApplications();
  const withdrawMutation = useWithdrawApplication();
  const navigate = useNavigate();
  const [statusFilter, setStatusFilter] = useState<ApplicationStatus | "all">("all");

  const filteredApplications = useMemo(() => {
    if (!applications) return [];

    let filtered = applications;

    // Status filter
    if (statusFilter !== "all") {
      filtered = filtered.filter((app) => app.status === statusFilter);
    }

    // Search filter
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(
        (app) =>
          app.job?.title?.toLowerCase().includes(query) ||
          app.job?.company?.name?.toLowerCase().includes(query) ||
          app.job?.city?.toLowerCase().includes(query)
      );
    }

    return filtered;
  }, [applications, statusFilter, searchQuery]);

  const getStatusConfig = (status: ApplicationStatus) => {
    switch (status) {
      case "pending":
        return {
          label: "In Bearbeitung",
          variant: "secondary" as const,
          icon: Clock,
          color: "text-blue-600",
        };
      case "accepted":
        return {
          label: "Angenommen",
          variant: "default" as const,
          icon: CheckCircle,
          color: "text-green-600",
        };
      case "rejected":
        return {
          label: "Abgelehnt",
          variant: "destructive" as const,
          icon: XCircle,
          color: "text-red-600",
        };
      case "withdrawn":
        return {
          label: "Zurückgezogen",
          variant: "outline" as const,
          icon: AlertCircle,
          color: "text-gray-600",
        };
    }
  };

  if (isLoading) {
    return <div className="text-center py-12">Laden...</div>;
  }

  return (
    <div className="space-y-6">
      {/* Status Filter */}
      <div className="flex gap-2 flex-wrap">
        <Button
          variant={statusFilter === "all" ? "default" : "outline"}
          size="sm"
          onClick={() => setStatusFilter("all")}
          className="rounded-full"
        >
          Alle
        </Button>
        <Button
          variant={statusFilter === "pending" ? "default" : "outline"}
          size="sm"
          onClick={() => setStatusFilter("pending")}
          className="rounded-full"
        >
          In Bearbeitung
        </Button>
        <Button
          variant={statusFilter === "accepted" ? "default" : "outline"}
          size="sm"
          onClick={() => setStatusFilter("accepted")}
          className="rounded-full"
        >
          Angenommen
        </Button>
        <Button
          variant={statusFilter === "rejected" ? "default" : "outline"}
          size="sm"
          onClick={() => setStatusFilter("rejected")}
          className="rounded-full"
        >
          Abgelehnt
        </Button>
      </div>

      {/* Applications List */}
      {filteredApplications.length === 0 ? (
        <Card className="p-12 text-center">
          <p className="text-muted-foreground">Keine Bewerbungen gefunden</p>
        </Card>
      ) : (
        <div className="space-y-4">
          {filteredApplications.map((application) => {
            const statusConfig = getStatusConfig(application.status);
            const StatusIcon = statusConfig.icon;

            return (
              <Card
                key={application.id}
                className="p-6 hover:shadow-md transition-shadow cursor-pointer"
                onClick={() => navigate(`/jobs/${application.job_id}`)}
              >
                <div className="flex items-start gap-4">
                  {/* Company Logo */}
                  <Avatar className="h-16 w-16 rounded-lg">
                    <AvatarImage src={application.job?.company?.logo_url} />
                    <AvatarFallback className="rounded-lg">
                      {application.job?.company?.name?.charAt(0)}
                    </AvatarFallback>
                  </Avatar>

                  {/* Job Info */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between gap-4">
                      <div className="flex-1">
                        <h3 className="font-semibold text-lg mb-1 hover:text-primary">
                          {application.job?.title}
                        </h3>
                        <p className="text-sm text-muted-foreground">
                          {application.job?.company?.name}
                        </p>
                        <p className="text-sm text-muted-foreground">
                          {application.job?.city} • {application.job?.employment_type}
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
                              navigate(`/jobs/${application.job_id}`);
                            }}
                          >
                            <Eye className="h-4 w-4 mr-2" />
                            Job ansehen
                          </DropdownMenuItem>
                          {application.status === "pending" && (
                            <DropdownMenuItem
                              onClick={(e) => {
                                e.stopPropagation();
                                withdrawMutation.mutate(application.id);
                              }}
                              className="text-destructive"
                            >
                              <XCircle className="h-4 w-4 mr-2" />
                              Bewerbung zurückziehen
                            </DropdownMenuItem>
                          )}
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </div>

                    {/* Status and Date */}
                    <div className="flex items-center gap-3 mt-3">
                      <Badge variant={statusConfig.variant} className="flex items-center gap-1">
                        <StatusIcon className="h-3 w-3" />
                        {statusConfig.label}
                      </Badge>
                      <span className="text-sm text-muted-foreground">
                        vor {formatDistanceToNow(new Date(application.created_at), { locale: de })}
                      </span>
                      {!application.viewed_by_company && application.status === "pending" && (
                        <Badge variant="outline" className="text-xs">
                          Noch nicht gesehen
                        </Badge>
                      )}
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
