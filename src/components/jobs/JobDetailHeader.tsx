import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ArrowLeft, MapPin, Briefcase, Euro, Calendar, Edit, Eye, User } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { JobStatusBadge } from "./JobStatusBadge";
import { format } from "date-fns";
import { de } from "date-fns/locale";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { JobPreviewDialog } from "./JobPreviewDialog";
interface JobDetailHeaderProps {
  job: any;
  company: any;
}
export function JobDetailHeader({
  job,
  company
}: JobDetailHeaderProps) {
  const navigate = useNavigate();
  const [previewOpen, setPreviewOpen] = useState(false);

  // Fetch applications count
  const {
    data: applicationsCount = 0
  } = useQuery({
    queryKey: ["applications-count", job.id],
    queryFn: async () => {
      const {
        count
      } = await supabase.from("applications").select("*", {
        count: "exact",
        head: true
      }).eq("job_post_id", job.id);
      return count || 0;
    }
  });

  // Fetch unlocked profiles count
  const {
    data: unlockedCount = 0
  } = useQuery({
    queryKey: ["unlocked-count", job.id],
    queryFn: async () => {
      const {
        count
      } = await supabase.from("applications").select("*", {
        count: "exact",
        head: true
      }).eq("job_post_id", job.id).eq("viewed_by_company", true);
      return count || 0;
    }
  });
  const getEmploymentTypeLabel = (type: string) => {
    const labels: Record<string, string> = {
      apprenticeship: 'Ausbildung',
      dual_study: 'Duales Studium',
      internship: 'Praktikum',
      fulltime: 'Vollzeit',
      parttime: 'Teilzeit',
      contract: 'Befristet'
    };
    return labels[type] || type;
  };
  const getWorkModeLabel = (mode: string) => {
    const labels: Record<string, string> = {
      remote: "Remote",
      hybrid: "Hybrid",
      onsite: "Vor Ort"
    };
    return labels[mode] || mode;
  };
  return <TooltipProvider>
      <div className="bg-background border-b">
        <div className="max-w-[1600px] mx-auto px-6 py-6">
          {/* Top Bar with Back Button and Action Buttons */}
          <div className="flex items-center justify-between mb-6">
            <Button variant="ghost" size="sm" onClick={() => navigate(-1)} className="-ml-2">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Zurück
            </Button>

            {/* Action Buttons - Right Side */}
            <div className="flex items-center gap-2">
              <Button variant="outline" size="sm" onClick={() => setPreviewOpen(true)}>
                <Eye className="h-4 w-4 mr-2" />
                Vorschau
              </Button>
              <Button size="sm" onClick={() => navigate(`/company/jobs/${job.id}/edit`)}>
                <Edit className="h-4 w-4 mr-2" />
                Bearbeiten
              </Button>
            </div>
          </div>

          {/* Main Header */}
          <div className="grid grid-cols-1 lg:grid-cols-[1fr_auto] gap-8">
            {/* Left: Job Info */}
            <div className="space-y-4">
              {/* Logo + Title */}
              <div className="flex items-start gap-4">
                {company?.logo_url && <div className="flex-shrink-0">
                    <img src={company.logo_url} alt={company.name} className="w-20 h-20 object-contain rounded-lg border" />
                  </div>}
                <div className="flex-1 min-w-0">
                  <h1 className="text-3xl font-bold mb-2">{job.title}</h1>
                  
                  {/* Meta Info Line 1 */}
                  <div className="flex flex-wrap items-center gap-2 text-sm text-muted-foreground mb-2">
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
                    {job.salary_min && job.salary_max && <div className="flex items-center gap-1.5">
                        <Euro className="h-4 w-4 text-muted-foreground" />
                        <span className="font-medium">
                          {job.salary_min.toLocaleString()} - {job.salary_max.toLocaleString()} €
                        </span>
                      </div>}
                    {job.start_date && <>
                        <span className="text-muted-foreground">|</span>
                        <div className="flex items-center gap-1.5">
                          <Calendar className="h-4 w-4 text-muted-foreground" />
                          <span>Start: {format(new Date(job.start_date), "dd.MM.yyyy")}</span>
                        </div>
                      </>}
                    {job.work_mode && <>
                        <span className="text-muted-foreground">|</span>
                        <Badge variant="secondary" className="rounded-full">
                          {getWorkModeLabel(job.work_mode)}
                        </Badge>
                      </>}
                  </div>

                  {/* Counters */}
                  <div className="flex items-center gap-4 text-sm">
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

            {/* Right: Simple Status Info (NO CARDS) */}
            <div className="space-y-4 lg:min-w-[220px]">
              {/* Zugeordnet */}
              <div>
                <p className="text-xs text-muted-foreground mb-2">Zugeordnet</p>
                <div className="flex items-center gap-2">
                  {company?.logo_url && <img src={company.logo_url} alt={company.name} className="w-8 h-8 object-contain rounded" />}
                  <span className="text-sm font-medium">{company?.name}</span>
                </div>
              </div>

              {/* Status with Tooltip for Dates */}
              <div>
                <p className="text-xs text-muted-foreground mb-2">Status</p>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <div className="inline-block cursor-help">
                      <JobStatusBadge status={job.status} className="rounded-full" />
                    </div>
                  </TooltipTrigger>
                  <TooltipContent side="left" className="text-xs space-y-1">
                    {job.created_at && <p>
                        <span className="text-muted-foreground">Erstellt am:</span>{" "}
                        <span className="font-medium">
                          {format(new Date(job.created_at), "dd.MM.yyyy", { locale: de })}
                        </span>
                      </p>}
                    {job.updated_at && <p>
                        <span className="text-muted-foreground">Geändert am:</span>{" "}
                        <span className="font-medium">
                          {format(new Date(job.updated_at), "dd.MM.yyyy", { locale: de })}
                        </span>
                      </p>}
                  </TooltipContent>
                </Tooltip>
              </div>
            </div>
          </div>
        </div>
      </div>

      <JobPreviewDialog
        open={previewOpen}
        onOpenChange={setPreviewOpen}
        job={job}
        company={company}
      />
    </TooltipProvider>;
}