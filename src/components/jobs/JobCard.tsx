import { useNavigate } from "react-router-dom";
import { Card, CardContent } from "@/components/ui/card";
import { JobStatusBadge } from "./JobStatusBadge";
import { JobActionsMenu } from "./JobActionsMenu";
import { Briefcase, MapPin, Users } from "lucide-react";
import { formatDistanceToNow } from "date-fns";
import { de } from "date-fns/locale";

interface JobCardProps {
  job: any;
  onEdit: () => void;
  onPublish: () => void;
  onPause: () => void;
  onResume: () => void;
  onInactivate: () => void;
  onDelete: () => void;
}

export function JobCard({ 
  job, 
  onEdit, 
  onPublish, 
  onPause, 
  onResume, 
  onInactivate, 
  onDelete 
}: JobCardProps) {
  const navigate = useNavigate();

  const getEmploymentTypeLabel = (type: string) => {
    const labels: Record<string, string> = {
      fulltime: 'Vollzeit',
      parttime: 'Teilzeit',
      contract: 'Befristet',
      internship: 'Praktikum',
    };
    return labels[type] || type;
  };

  const applicationsCount = job.applications_count || 0;

  return (
    <Card 
      className="hover:shadow-md transition-shadow cursor-pointer group"
      onClick={() => navigate(`/company/jobs/${job.id}`)}
    >
      <CardContent className="p-6">
        <div className="flex justify-between items-start gap-4">
          <div className="flex-1 space-y-3">
            {/* Title */}
            <div>
              <h3 className="font-semibold text-lg group-hover:text-primary transition-colors">
                {job.title}
              </h3>
              <div className="flex items-center gap-3 text-sm text-muted-foreground mt-1">
                <span className="flex items-center gap-1">
                  <MapPin className="h-3.5 w-3.5" />
                  {job.city || '—'}
                </span>
                <span>•</span>
                <span>{getEmploymentTypeLabel(job.employment_type)}</span>
              </div>
            </div>

            {/* Status & Meta */}
            <div className="flex items-center gap-3 flex-wrap">
              <JobStatusBadge status={job.status} />
              <span className="text-xs text-muted-foreground">
                Erstellt {formatDistanceToNow(new Date(job.created_at), { 
                  addSuffix: true,
                  locale: de 
                })}
              </span>
            </div>

            {/* Applications Count */}
            {applicationsCount > 0 && (
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <Users className="h-4 w-4" />
                <span>{applicationsCount} Bewerber</span>
              </div>
            )}
          </div>

          {/* Actions Menu */}
          <div onClick={(e) => e.stopPropagation()}>
            <JobActionsMenu
              jobId={job.id}
              status={job.status}
              onEdit={onEdit}
              onPublish={onPublish}
              onPause={onPause}
              onResume={onResume}
              onInactivate={onInactivate}
              onDelete={onDelete}
            />
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
