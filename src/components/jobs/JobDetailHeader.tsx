import { Button } from "@/components/ui/button";
import { JobStatusBadge } from "./JobStatusBadge";
import { ArrowLeft, MapPin, Briefcase } from "lucide-react";
import { useNavigate } from "react-router-dom";

interface JobDetailHeaderProps {
  job: any;
  company: any;
}

export function JobDetailHeader({ job, company }: JobDetailHeaderProps) {
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

  return (
    <div className="bg-white border-b">
      <div className="max-w-[1600px] mx-auto px-6 py-6">
        {/* Back Button */}
        <Button
          variant="ghost"
          onClick={() => navigate('/company/jobs')}
          className="mb-4"
        >
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back to listings
        </Button>

        {/* Header Content */}
        <div className="flex items-start justify-between gap-6">
          <div className="flex items-start gap-4 flex-1">
            {/* Company Logo */}
            {company?.logo_url && (
              <img
                src={company.logo_url}
                alt={company.name}
                className="h-16 w-16 rounded-lg object-cover border"
              />
            )}

            {/* Job Info */}
            <div className="flex-1">
              <h1 className="text-2xl font-bold mb-2">{job.title}</h1>
              <div className="flex items-center gap-4 text-sm text-muted-foreground mb-3">
                <span className="flex items-center gap-1">
                  <MapPin className="h-4 w-4" />
                  {job.city || '—'}
                </span>
                <span className="flex items-center gap-1">
                  <Briefcase className="h-4 w-4" />
                  {getEmploymentTypeLabel(job.employment_type)}
                </span>
              </div>
              <div className="flex items-center gap-3">
                <JobStatusBadge status={job.status} />
              </div>
            </div>
          </div>

          {/* Actions */}
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              onClick={() => navigate(`/company/jobs/${job.id}/edit`)}
            >
              Bearbeiten
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
