import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ArrowLeft, MapPin, Briefcase, Clock, Edit, Users } from "lucide-react";
import { useNavigate } from "react-router-dom";

interface JobDetailHeaderProps {
  job: any;
  company: any;
}

export function JobDetailHeader({ job, company }: JobDetailHeaderProps) {
  const navigate = useNavigate();

  const getEmploymentTypeLabel = (type: string) => {
    const labels: Record<string, string> = {
      apprenticeship: 'Ausbildung',
      dual_study: 'Duales Studium',
      internship: 'Praktikum',
      fulltime: 'Vollzeit',
      parttime: 'Teilzeit',
      contract: 'Befristet',
    };
    return labels[type] || type;
  };

  const getStatusBadge = (status: string) => {
    const statusConfig: Record<string, { label: string; variant: 'default' | 'secondary' | 'destructive' | 'outline' }> = {
      published: { label: 'Aktiv', variant: 'default' },
      draft: { label: 'Entwurf', variant: 'secondary' },
      archived: { label: 'Archiviert', variant: 'outline' },
    };
    return statusConfig[status] || { label: status, variant: 'outline' };
  };

  const statusBadge = getStatusBadge(job.status);

  return (
    <div className="bg-background border-b sticky top-0 z-10">
      <div className="max-w-[1600px] mx-auto px-6 py-4">
        {/* Back Button */}
        <Button
          variant="ghost"
          size="sm"
          onClick={() => navigate('/company/jobs')}
          className="mb-4 -ml-2"
        >
          <ArrowLeft className="h-4 w-4 mr-2" />
          Zurück zu allen Anzeigen
        </Button>

        {/* Header Content */}
        <div className="flex items-start justify-between gap-6">
          <div className="flex-1">
            {/* Job Title */}
            <h1 className="text-3xl font-bold mb-2">{job.title}</h1>
            
            {/* Subline */}
            <div className="flex flex-wrap items-center gap-3 text-sm text-muted-foreground mb-4">
              <span className="flex items-center gap-1.5">
                <MapPin className="h-4 w-4" />
                {job.city || '—'}
              </span>
              <span>•</span>
              <span className="flex items-center gap-1.5">
                <Briefcase className="h-4 w-4" />
                {getEmploymentTypeLabel(job.employment_type)}
              </span>
              <span>•</span>
              <span className="flex items-center gap-1.5">
                <Clock className="h-4 w-4" />
                {statusBadge.label}
              </span>
            </div>
          </div>

          {/* Right Actions */}
          <div className="flex items-center gap-3">
            {/* Status Badge */}
            <Badge 
              variant={statusBadge.variant}
              className="px-4 py-1.5 rounded-full font-medium"
            >
              {statusBadge.label}
            </Badge>

            {/* Edit Button */}
            <Button
              onClick={() => navigate(`/company/jobs/${job.id}/edit`)}
              className="gap-2"
            >
              <Edit className="h-4 w-4" />
              Bearbeiten
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
