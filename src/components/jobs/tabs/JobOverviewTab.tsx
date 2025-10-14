import { useNavigate } from "react-router-dom";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { 
  MapPin, 
  Briefcase, 
  Calendar, 
  Euro,
  Building2,
  Edit
} from "lucide-react";
import { format } from "date-fns";
import { de } from "date-fns/locale";

interface JobOverviewTabProps {
  job: any;
  company: any;
}

export function JobOverviewTab({ job, company }: JobOverviewTabProps) {
  const navigate = useNavigate();

  const getEmploymentTypeLabel = (type: string) => {
    const labels: Record<string, string> = {
      apprenticeship: "Ausbildung",
      dual_study: "Duales Studium",
      internship: "Praktikum",
      fulltime: "Vollzeit",
      parttime: "Teilzeit",
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
    <div className="max-w-5xl mx-auto">
      {/* Preview Notice */}
      <Card className="mb-6 border-primary/50 bg-primary/5">
        <CardContent className="p-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="font-semibold text-lg mb-1">Kandidaten-Vorschau</h3>
              <p className="text-sm text-muted-foreground">
                So sehen Kandidaten Ihre Stellenanzeige
              </p>
            </div>
            <Button 
              onClick={() => navigate(`/company/jobs/${job.id}/edit`)}
              className="gap-2"
            >
              <Edit className="h-4 w-4" />
              Bearbeiten
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Job Header */}
      <Card className="mb-6">
        <CardContent className="p-6">
          <div className="flex items-start gap-4 mb-6">
            {company?.logo_url && (
              <img 
                src={company.logo_url} 
                alt={company.name}
                className="w-16 h-16 object-contain rounded-lg border"
              />
            )}
            <div className="flex-1">
              <h1 className="text-3xl font-bold mb-2">{job.title}</h1>
              <div className="flex flex-wrap gap-4 text-muted-foreground">
                <div className="flex items-center gap-2">
                  <Building2 className="h-4 w-4" />
                  <span>{company?.name || "Unternehmen"}</span>
                </div>
                <div className="flex items-center gap-2">
                  <MapPin className="h-4 w-4" />
                  <span>{job.city || "Standort nicht angegeben"}</span>
                </div>
                <div className="flex items-center gap-2">
                  <Briefcase className="h-4 w-4" />
                  <span>{getEmploymentTypeLabel(job.employment_type)}</span>
                </div>
              </div>
            </div>
          </div>

          {/* Job Meta Info */}
          <div className="flex flex-wrap gap-4 mb-6">
            {job.salary_min && job.salary_max && (
              <div className="flex items-center gap-2 text-sm">
                <Euro className="h-4 w-4 text-muted-foreground" />
                <span className="font-medium">
                  {job.salary_min.toLocaleString()} - {job.salary_max.toLocaleString()} € / Jahr
                </span>
              </div>
            )}
            {job.start_date && (
              <div className="flex items-center gap-2 text-sm">
                <Calendar className="h-4 w-4 text-muted-foreground" />
                <span>
                  Start: {format(new Date(job.start_date), "dd. MMMM yyyy", { locale: de })}
                </span>
              </div>
            )}
            {job.work_mode && (
              <Badge variant="secondary">
                {getWorkModeLabel(job.work_mode)}
              </Badge>
            )}
          </div>

          {/* Job Details Grid */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 p-4 bg-muted/50 rounded-lg">
            <div>
              <p className="text-sm text-muted-foreground mb-1">Branche</p>
              <p className="font-medium">{job.industry || "—"}</p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground mb-1">Anstellungsart</p>
              <p className="font-medium">{getEmploymentTypeLabel(job.employment_type)}</p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground mb-1">Arbeitszeit</p>
              <p className="font-medium">{job.working_hours || "—"} Std./Woche</p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground mb-1">Standort</p>
              <p className="font-medium">{job.city || "—"}</p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Job Description */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-6">
          {/* About the Job */}
          {job.description_md && (
            <Card>
              <CardContent className="p-6">
                <h2 className="text-xl font-semibold mb-4">Über die Stelle</h2>
                <div className="prose prose-sm max-w-none">
                  <p className="whitespace-pre-wrap">{job.description_md}</p>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Responsibilities */}
          {job.tasks_md && (
            <Card>
              <CardContent className="p-6">
                <h2 className="text-xl font-semibold mb-4">Aufgaben</h2>
                <div className="prose prose-sm max-w-none">
                  <p className="whitespace-pre-wrap">{job.tasks_md}</p>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Requirements */}
          {job.requirements_md && (
            <Card>
              <CardContent className="p-6">
                <h2 className="text-xl font-semibold mb-4">Anforderungen</h2>
                <div className="prose prose-sm max-w-none">
                  <p className="whitespace-pre-wrap">{job.requirements_md}</p>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Benefits */}
          {job.benefits_description && (
            <Card>
              <CardContent className="p-6">
                <h2 className="text-xl font-semibold mb-4">Benefits</h2>
                <div className="prose prose-sm max-w-none">
                  <p className="whitespace-pre-wrap">{job.benefits_description}</p>
                </div>
              </CardContent>
            </Card>
          )}
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Company Info */}
          <Card>
            <CardContent className="p-6">
              <h3 className="font-semibold mb-4">Über das Unternehmen</h3>
              {company?.logo_url && (
                <img 
                  src={company.logo_url} 
                  alt={company.name}
                  className="w-full h-32 object-contain mb-4 rounded-lg border"
                />
              )}
              <h4 className="font-semibold text-lg mb-2">{company?.name}</h4>
              {company?.description && (
                <p className="text-sm text-muted-foreground mb-4">{company.description}</p>
              )}
              {company?.industry && (
                <div className="mb-2">
                  <p className="text-sm text-muted-foreground">Branche</p>
                  <p className="font-medium">{company.industry}</p>
                </div>
              )}
              {company?.size_range && (
                <div className="mb-2">
                  <p className="text-sm text-muted-foreground">Unternehmensgröße</p>
                  <p className="font-medium">{company.size_range}</p>
                </div>
              )}
              {company?.website_url && (
                <a 
                  href={company.website_url} 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="text-sm text-primary hover:underline"
                >
                  Website besuchen →
                </a>
              )}
            </CardContent>
          </Card>

          {/* Contact Person */}
          {(job.contact_person_name || job.contact_person_email) && (
            <Card>
              <CardContent className="p-6">
                <h3 className="font-semibold mb-4">Ansprechperson</h3>
                {job.contact_person_name && (
                  <div className="mb-3">
                    <p className="font-medium">{job.contact_person_name}</p>
                    {job.contact_person_role && (
                      <p className="text-sm text-muted-foreground">{job.contact_person_role}</p>
                    )}
                  </div>
                )}
                {job.contact_person_email && (
                  <div className="mb-2">
                    <p className="text-sm text-muted-foreground">E-Mail</p>
                    <a 
                      href={`mailto:${job.contact_person_email}`}
                      className="text-sm text-primary hover:underline"
                    >
                      {job.contact_person_email}
                    </a>
                  </div>
                )}
                {job.contact_person_phone && (
                  <div>
                    <p className="text-sm text-muted-foreground">Telefon</p>
                    <a 
                      href={`tel:${job.contact_person_phone}`}
                      className="text-sm text-primary hover:underline"
                    >
                      {job.contact_person_phone}
                    </a>
                  </div>
                )}
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
}
