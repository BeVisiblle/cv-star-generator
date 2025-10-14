import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Building2, MapPin, Clock, MoreVertical } from "lucide-react";
import { formatDistanceToNow } from "date-fns";
import { de } from "date-fns/locale";

interface PublicJobCardProps {
  job: any;
  onClick: () => void;
}

export function PublicJobCard({ job, onClick }: PublicJobCardProps) {
  const getEmploymentTypeLabel = (type: string) => {
    const labels: Record<string, string> = {
      full_time: 'Vollzeit',
      part_time: 'Teilzeit',
      apprenticeship: 'Ausbildung',
      dual_study: 'Duales Studium',
      internship: 'Praktikum',
    };
    return labels[type] || type;
  };

  const timeAgo = job.created_at 
    ? formatDistanceToNow(new Date(job.created_at), { addSuffix: true, locale: de })
    : '';

  return (
    <Card 
      className="p-6 hover:shadow-lg transition-shadow cursor-pointer group border-border"
      onClick={onClick}
    >
      <div className="space-y-4">
        {/* Header */}
        <div className="flex items-start justify-between gap-4">
          <div className="flex items-start gap-3 flex-1">
            {job.company?.logo_url ? (
              <img
                src={job.company.logo_url}
                alt={job.company.name}
                className="h-12 w-12 rounded-lg object-cover flex-shrink-0"
              />
            ) : (
              <div className="h-12 w-12 rounded-lg bg-muted flex items-center justify-center flex-shrink-0">
                <Building2 className="h-6 w-6 text-muted-foreground" />
              </div>
            )}
            <div className="flex-1 min-w-0">
              <h3 className="font-semibold text-base group-hover:text-primary transition-colors line-clamp-1">
                {job.title}
              </h3>
              <p className="text-sm text-muted-foreground mt-0.5">
                {job.company?.name || 'Unbekanntes Unternehmen'}
              </p>
            </div>
          </div>
          <button className="p-1 hover:bg-muted rounded opacity-0 group-hover:opacity-100 transition-opacity">
            <MoreVertical className="h-4 w-4 text-muted-foreground" />
          </button>
        </div>

        {/* Description */}
        {job.description_md && (
          <p className="text-sm text-muted-foreground line-clamp-2">
            {job.description_md}
          </p>
        )}

        {/* Footer */}
        <div className="flex items-center gap-3 flex-wrap text-sm">
          <Badge variant="secondary" className="font-normal">
            {getEmploymentTypeLabel(job.employment_type)}
          </Badge>
          
          {(job.city || job.state) && (
            <span className="flex items-center gap-1 text-muted-foreground">
              <MapPin className="h-3.5 w-3.5" />
              {job.city || job.state}
            </span>
          )}

          {timeAgo && (
            <span className="flex items-center gap-1 text-muted-foreground">
              <Clock className="h-3.5 w-3.5" />
              {timeAgo}
            </span>
          )}
        </div>

        {/* Salary Range if available */}
        {(job.salary_min || job.salary_max) && (
          <div className="pt-2 border-t">
            <p className="text-sm font-medium">
              €{job.salary_min?.toLocaleString() || '?'} - €{job.salary_max?.toLocaleString() || '?'}
            </p>
          </div>
        )}
      </div>
    </Card>
  );
}
