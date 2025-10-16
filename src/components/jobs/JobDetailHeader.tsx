import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ArrowLeft, MapPin, Briefcase, Euro, Calendar, Edit, Eye, User } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { JobStatusBadge } from "./JobStatusBadge";
import { format } from "date-fns";
import { de } from "date-fns/locale";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

interface JobDetailHeaderProps {
  job: any;
  company: any;
}

export function JobDetailHeader({ job, company }: JobDetailHeaderProps) {
  const navigate = useNavigate();

  // Fetch applications count
  const { data: applicationsCount = 0 } = useQuery({
    queryKey: ["applications-count", job.id],
    queryFn: async () => {
      const { count } = await supabase
        .from("applications")
        .select("*", { count: "exact", head: true })
        .eq("job_post_id", job.id);
      return count || 0;
    },
  });

  // Fetch unlocked profiles count
  const { data: unlockedCount = 0 } = useQuery({
    queryKey: ["unlocked-count", job.id],
    queryFn: async () => {
      const { count } = await supabase
        .from("applications")
        .select("*", { count: "exact", head: true })
        .eq("job_post_id", job.id)
        .eq("viewed_by_company", true);
      return count || 0;
    },
  });

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

  const getWorkModeLabel = (mode: string) => {
    const labels: Record<string, string> = {
      remote: "Remote",
      hybrid: "Hybrid",
      onsite: "Vor Ort",
    };
    return labels[mode] || mode;
  };

  return (
    <div className="bg-background border-b">
      <div className="max-w-[1600px] mx-auto px-6 py-6">
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

        {/* Main Header with Sidebar */}
        <div className="grid grid-cols-1 lg:grid-cols-[1fr_280px] gap-6">
          {/* Left: Job Info */}
          <div className="space-y-4">
            {/* Logo + Title */}
            <div className="flex items-start gap-4">
              {company?.logo_url && (
                <div className="flex-shrink-0">
                  <img 
                    src={company.logo_url} 
                    alt={company.name}
                    className="w-20 h-20 object-contain rounded-lg border"
                  />
                </div>
              )}
              <div className="flex-1 min-w-0">
                <h1 className="text-3xl font-bold mb-2">{job.title}</h1>
                
                {/* Meta Info Line 1 */}
                <div className="flex flex-wrap items-center gap-2 text-sm text-muted-foreground mb-2">
                  {job.contact_person_name && (
                    <>
                      <div className="flex items-center gap-1.5">
                        <User className="h-4 w-4" />
                        <span>{job.contact_person_name}</span>
                      </div>
                      <span>•</span>
                    </>
                  )}
                  <div className="flex items-center gap-1.5">
                    <MapPin className="h-4 w-4" />
                    <span>{job.city || '—'}</span>
                  </div>
                  <span>•</span>
                  <div className="flex items-center gap-1.5">
                    <Briefcase className="h-4 w-4" />
                    <span>{getEmploymentTypeLabel(job.employment_type)}</span>
                  </div>
                </div>

                {/* Meta Info Line 2 */}
                <div className="flex flex-wrap items-center gap-3 text-sm mb-4">
                  {job.salary_min && job.salary_max && (
                    <div className="flex items-center gap-1.5">
                      <Euro className="h-4 w-4 text-muted-foreground" />
                      <span className="font-medium">
                        {job.salary_min.toLocaleString()} - {job.salary_max.toLocaleString()} €
                      </span>
                    </div>
                  )}
                  {job.start_date && (
                    <>
                      <span className="text-muted-foreground">|</span>
                      <div className="flex items-center gap-1.5">
                        <Calendar className="h-4 w-4 text-muted-foreground" />
                        <span>Start: {format(new Date(job.start_date), "dd.MM.yyyy")}</span>
                      </div>
                    </>
                  )}
                  {job.work_mode && (
                    <>
                      <span className="text-muted-foreground">|</span>
                      <Badge variant="secondary" className="rounded-full">
                        {getWorkModeLabel(job.work_mode)}
                      </Badge>
                    </>
                  )}
                </div>

                {/* Info Boxes */}
                <div className="grid grid-cols-3 gap-3">
                  <div className="bg-muted/30 rounded-lg p-3">
                    <p className="text-xs text-muted-foreground mb-1">Branche</p>
                    <p className="font-medium text-sm">{job.industry || "—"}</p>
                  </div>
                  <div className="bg-muted/30 rounded-lg p-3">
                    <p className="text-xs text-muted-foreground mb-1">Anstellungsart</p>
                    <p className="font-medium text-sm">{getEmploymentTypeLabel(job.employment_type)}</p>
                  </div>
                  <div className="bg-muted/30 rounded-lg p-3">
                    <p className="text-xs text-muted-foreground mb-1">Arbeitszeit</p>
                    <p className="font-medium text-sm">{job.working_hours || "—"} Std./Wo.</p>
                  </div>
                </div>

                {/* Counters */}
                <div className="flex items-center gap-4 mt-4 text-sm">
                  <div>
                    <span className="font-semibold">{applicationsCount}</span>
                    <span className="text-muted-foreground ml-1">Bewerber</span>
                  </div>
                  <span className="text-muted-foreground">•</span>
                  <div>
                    <span className="font-semibold">{unlockedCount}</span>
                    <span className="text-muted-foreground ml-1">Freigeschaltet</span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Right: Status Sidebar */}
          <div className="space-y-4">
            {/* Zugeordnet */}
            <div className="bg-muted/20 rounded-lg p-4 border">
              <p className="text-xs text-muted-foreground mb-2">Zugeordnet</p>
              <div className="flex items-center gap-2">
                {company?.logo_url && (
                  <img 
                    src={company.logo_url} 
                    alt={company.name}
                    className="w-8 h-8 object-contain rounded"
                  />
                )}
              </div>
            </div>

            {/* Status Box */}
            <div className="bg-muted/20 rounded-lg p-4 border space-y-3">
              <div>
                <p className="text-xs text-muted-foreground mb-2">Status</p>
                <JobStatusBadge status={job.status} className="rounded-full" />
              </div>
              
              {job.created_at && (
                <div>
                  <p className="text-xs text-muted-foreground mb-1">Erstellt am</p>
                  <p className="text-sm font-medium">
                    {format(new Date(job.created_at), "dd.MM.yyyy", { locale: de })}
                  </p>
                </div>
              )}
              
              {job.updated_at && (
                <div>
                  <p className="text-xs text-muted-foreground mb-1">Geändert am</p>
                  <p className="text-sm font-medium">
                    {format(new Date(job.updated_at), "dd.MM.yyyy", { locale: de })}
                  </p>
                </div>
              )}
            </div>

            {/* Action Buttons */}
            <div className="space-y-2">
              <Button
                onClick={() => navigate(`/company/jobs/${job.id}/edit`)}
                className="w-full gap-2"
              >
                <Edit className="h-4 w-4" />
                Bearbeiten
              </Button>
              <Button
                variant="outline"
                onClick={() => navigate(`/jobs/${job.id}`)}
                className="w-full gap-2"
              >
                <Eye className="h-4 w-4" />
                Vorschau
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
