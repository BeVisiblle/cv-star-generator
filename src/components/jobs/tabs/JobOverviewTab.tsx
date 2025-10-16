import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { 
  MapPin, 
  Briefcase, 
  Calendar, 
  Euro,
  Building2,
  User,
  Mail,
  Phone,
  Globe,
  FileText,
  FileCheck
} from "lucide-react";
import { DOCUMENT_TYPE_LABELS, type DocType } from "@/lib/document-types";
import { 
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { format } from "date-fns";

interface JobOverviewTabProps {
  job: any;
  company: any;
}

export function JobOverviewTab({ job, company }: JobOverviewTabProps) {
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
    <div className="max-w-7xl mx-auto">
      {/* Two Column Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-[1fr_380px] gap-6">
        {/* Left Column - Main Content */}
        <div className="space-y-6">
          {/* Über den Job */}
          <div>
            <h2 className="text-2xl font-bold mb-4">Über den Job</h2>
            
            <Accordion type="multiple" defaultValue={["tasks", "requirements", "benefits"]} className="w-full">
              {job.tasks_md && (
                <AccordionItem value="tasks">
                  <AccordionTrigger className="text-lg font-semibold hover:no-underline">
                    Aufgaben
                  </AccordionTrigger>
                  <AccordionContent>
                    <div className="prose prose-sm max-w-none pt-2">
                      <p className="whitespace-pre-wrap text-muted-foreground leading-relaxed">{job.tasks_md}</p>
                    </div>
                  </AccordionContent>
                </AccordionItem>
              )}

              {job.requirements_md && (
                <AccordionItem value="requirements">
                  <AccordionTrigger className="text-lg font-semibold hover:no-underline">
                    Anforderungen
                  </AccordionTrigger>
                  <AccordionContent>
                    <div className="prose prose-sm max-w-none pt-2">
                      <p className="whitespace-pre-wrap text-muted-foreground leading-relaxed">{job.requirements_md}</p>
                    </div>
                  </AccordionContent>
                </AccordionItem>
              )}

              {job.benefits_description && (
                <AccordionItem value="benefits">
                  <AccordionTrigger className="text-lg font-semibold hover:no-underline">
                    Benefits
                  </AccordionTrigger>
                  <AccordionContent>
                    <div className="prose prose-sm max-w-none pt-2">
                      <p className="whitespace-pre-wrap text-muted-foreground leading-relaxed">{job.benefits_description}</p>
                    </div>
                  </AccordionContent>
                </AccordionItem>
              )}
            </Accordion>
          </div>
        </div>

        {/* Right Sidebar */}
        <div className="space-y-6">
          {/* Job gepostet von */}
          <Card className="shadow-sm">
            <CardHeader className="pb-3">
              <CardTitle className="text-base">Job gepostet von</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center gap-3">
                {company?.logo_url && (
                  <img 
                    src={company.logo_url} 
                    alt={company.name}
                    className="w-12 h-12 object-contain rounded-lg border"
                  />
                )}
                <div>
                  <p className="font-semibold">{company?.name || "Unternehmen"}</p>
                  <p className="text-xs text-muted-foreground">Admin</p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Ansprechperson */}
          {(job.contact_person_name || job.contact_person_email) && (
            <Card className="shadow-sm">
              <CardHeader className="pb-3">
                <CardTitle className="text-base">Ansprechperson</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {job.contact_person_name && (
                  <div className="flex items-start gap-3">
                    <div className="flex-shrink-0 w-10 h-10 rounded-full bg-muted flex items-center justify-center">
                      <User className="h-5 w-5 text-muted-foreground" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="font-semibold text-sm">{job.contact_person_name}</p>
                      {job.contact_person_role && (
                        <p className="text-xs text-muted-foreground">{job.contact_person_role}</p>
                      )}
                    </div>
                  </div>
                )}
                <div className="space-y-2">
                  {job.contact_person_email && (
                    <div className="flex items-center gap-2">
                      <Mail className="h-4 w-4 text-muted-foreground flex-shrink-0" />
                      <a 
                        href={`mailto:${job.contact_person_email}`}
                        className="text-sm text-accent hover:underline truncate"
                      >
                        {job.contact_person_email}
                      </a>
                    </div>
                  )}
                  {job.contact_person_phone && (
                    <div className="flex items-center gap-2">
                      <Phone className="h-4 w-4 text-muted-foreground flex-shrink-0" />
                      <a 
                        href={`tel:${job.contact_person_phone}`}
                        className="text-sm text-accent hover:underline"
                      >
                        {job.contact_person_phone}
                      </a>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          )}

          {/* Job Details */}
          <Card className="shadow-sm">
            <CardHeader className="pb-3">
              <CardTitle className="text-base">Job Details</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              {job.industry && (
                <div className="flex items-start gap-3">
                  <Building2 className="h-4 w-4 text-muted-foreground mt-0.5 flex-shrink-0" />
                  <div className="flex-1">
                    <p className="text-xs text-muted-foreground">Branche</p>
                    <p className="text-sm font-medium">{job.industry}</p>
                  </div>
                </div>
              )}

              <div className="flex items-start gap-3">
                <Briefcase className="h-4 w-4 text-muted-foreground mt-0.5 flex-shrink-0" />
                <div className="flex-1">
                  <p className="text-xs text-muted-foreground">Anstellungsart</p>
                  <p className="text-sm font-medium">{getEmploymentTypeLabel(job.employment_type)}</p>
                </div>
              </div>

              {job.working_hours && (
                <div className="flex items-start gap-3">
                  <Calendar className="h-4 w-4 text-muted-foreground mt-0.5 flex-shrink-0" />
                  <div className="flex-1">
                    <p className="text-xs text-muted-foreground">Arbeitszeit</p>
                    <p className="text-sm font-medium">{job.working_hours} Std./Wo.</p>
                  </div>
                </div>
              )}

              <div className="flex items-start gap-3">
                <MapPin className="h-4 w-4 text-muted-foreground mt-0.5 flex-shrink-0" />
                <div className="flex-1">
                  <p className="text-xs text-muted-foreground">Standort</p>
                  <p className="text-sm font-medium">{job.city || "—"}</p>
                </div>
              </div>

              {job.salary_min && job.salary_max && (
                <div className="flex items-start gap-3">
                  <Euro className="h-4 w-4 text-muted-foreground mt-0.5 flex-shrink-0" />
                  <div className="flex-1">
                    <p className="text-xs text-muted-foreground">Gehalt</p>
                    <p className="text-sm font-medium">
                      {job.salary_min.toLocaleString()} - {job.salary_max.toLocaleString()} €
                    </p>
                  </div>
                </div>
              )}

              {job.start_date && (
                <div className="flex items-start gap-3">
                  <Calendar className="h-4 w-4 text-muted-foreground mt-0.5 flex-shrink-0" />
                  <div className="flex-1">
                    <p className="text-xs text-muted-foreground">Start</p>
                    <p className="text-sm font-medium">
                      {format(new Date(job.start_date), "dd.MM.yyyy")}
                    </p>
                  </div>
                </div>
              )}

              {job.work_mode && (
                <div className="flex items-start gap-3">
                  <Globe className="h-4 w-4 text-muted-foreground mt-0.5 flex-shrink-0" />
                  <div className="flex-1">
                    <p className="text-xs text-muted-foreground">Work Mode</p>
                    <Badge variant="secondary" className="rounded-full mt-1">
                      {getWorkModeLabel(job.work_mode)}
                    </Badge>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Document Requirements */}
          {((job.required_documents && Array.isArray(job.required_documents) && job.required_documents.length > 0) ||
            (job.optional_documents && Array.isArray(job.optional_documents) && job.optional_documents.length > 0)) && (
            <Card className="shadow-sm">
              <CardHeader className="pb-3">
                <div className="flex items-center gap-2">
                  <FileText className="h-4 w-4" />
                  <CardTitle className="text-base">Benötigte Dokumente</CardTitle>
                </div>
              </CardHeader>
              <CardContent className="space-y-3">
                {job.required_documents && job.required_documents.length > 0 && (
                  <div>
                    <p className="text-xs font-medium mb-2 flex items-center gap-2 text-red-600">
                      <FileCheck className="h-3 w-3" />
                      Pflicht:
                    </p>
                    <ul className="space-y-2">
                      {job.required_documents.map((doc: string, index: number) => (
                        <li key={index} className="text-sm flex items-center gap-2">
                          <div className="h-1.5 w-1.5 rounded-full bg-red-500 flex-shrink-0" />
                          {DOCUMENT_TYPE_LABELS[doc as DocType] || doc}
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
                
                {job.optional_documents && job.optional_documents.length > 0 && (
                  <div>
                    <p className="text-xs font-medium mb-2 text-muted-foreground">Optional:</p>
                    <ul className="space-y-2">
                      {job.optional_documents.map((doc: string, index: number) => (
                        <li key={index} className="text-sm text-muted-foreground flex items-center gap-2">
                          <div className="h-1.5 w-1.5 rounded-full bg-muted-foreground flex-shrink-0" />
                          {DOCUMENT_TYPE_LABELS[doc as DocType] || doc}
                        </li>
                      ))}
                    </ul>
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
