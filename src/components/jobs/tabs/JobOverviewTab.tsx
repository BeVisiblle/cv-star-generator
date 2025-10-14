import { useNavigate } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
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
  Eye,
  FileCheck,
  AlertCircle,
  Globe
} from "lucide-react";
import { 
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
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
    <div className="max-w-7xl mx-auto">
      {/* Preview Notice */}
      <Card className="mb-6 border-accent/20 bg-accent/5">
        <CardContent className="p-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Eye className="h-5 w-5 text-accent" />
              <div>
                <h3 className="font-semibold mb-0.5">Kandidaten-Vorschau</h3>
                <p className="text-sm text-muted-foreground">
                  So sehen Kandidaten Ihre Stellenanzeige
                </p>
              </div>
            </div>
            <Button 
              variant="outline"
              onClick={() => navigate(`/jobs/${job.id}`)}
              className="gap-2"
            >
              <Eye className="h-4 w-4" />
              Vorschau öffnen
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Two Column Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column - Main Content (70%) */}
        <div className="lg:col-span-2 space-y-6">
          {/* Job Header Card */}
          <Card className="shadow-sm">
            <CardContent className="p-6">
              <div className="flex items-start gap-4 mb-6">
                {company?.logo_url && (
                  <div className="flex-shrink-0">
                    <img 
                      src={company.logo_url} 
                      alt={company.name}
                      className="w-14 h-14 object-contain rounded-lg border"
                    />
                  </div>
                )}
                <div className="flex-1 min-w-0">
                  <h2 className="text-2xl font-bold mb-2">{job.title}</h2>
                  <div className="flex flex-wrap gap-3 text-sm text-muted-foreground">
                    <div className="flex items-center gap-1.5">
                      <Building2 className="h-4 w-4" />
                      <span>{company?.name || "Unternehmen"}</span>
                    </div>
                    <span>•</span>
                    <div className="flex items-center gap-1.5">
                      <MapPin className="h-4 w-4" />
                      <span>{job.city || "Standort nicht angegeben"}</span>
                    </div>
                    <span>•</span>
                    <div className="flex items-center gap-1.5">
                      <Briefcase className="h-4 w-4" />
                      <span>{getEmploymentTypeLabel(job.employment_type)}</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Key Info */}
              <div className="flex flex-wrap gap-4 pb-4 border-b">
                {job.salary_min && job.salary_max && (
                  <div className="flex items-center gap-2">
                    <Euro className="h-4 w-4 text-muted-foreground" />
                    <span className="text-sm font-medium">
                      {job.salary_min.toLocaleString()} - {job.salary_max.toLocaleString()} €
                    </span>
                  </div>
                )}
                {job.start_date && (
                  <div className="flex items-center gap-2">
                    <Calendar className="h-4 w-4 text-muted-foreground" />
                    <span className="text-sm">
                      Start: {format(new Date(job.start_date), "dd.MM.yyyy")}
                    </span>
                  </div>
                )}
                {job.work_mode && (
                  <Badge variant="secondary" className="rounded-full">
                    {getWorkModeLabel(job.work_mode)}
                  </Badge>
                )}
              </div>

              {/* Metadata Grid */}
              <div className="grid grid-cols-3 gap-4 mt-4">
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
            </CardContent>
          </Card>

          {/* Job Details Accordion */}
          <Card className="shadow-sm">
            <CardContent className="p-6">
              <Accordion type="multiple" defaultValue={["description", "tasks"]} className="w-full">
                {job.description_md && (
                  <AccordionItem value="description">
                    <AccordionTrigger className="text-lg font-semibold hover:no-underline">
                      Über die Stelle
                    </AccordionTrigger>
                    <AccordionContent>
                      <div className="prose prose-sm max-w-none pt-2">
                        <p className="whitespace-pre-wrap text-muted-foreground">{job.description_md}</p>
                      </div>
                    </AccordionContent>
                  </AccordionItem>
                )}

                {job.tasks_md && (
                  <AccordionItem value="tasks">
                    <AccordionTrigger className="text-lg font-semibold hover:no-underline">
                      Aufgaben
                    </AccordionTrigger>
                    <AccordionContent>
                      <div className="prose prose-sm max-w-none pt-2">
                        <p className="whitespace-pre-wrap text-muted-foreground">{job.tasks_md}</p>
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
                        <p className="whitespace-pre-wrap text-muted-foreground">{job.requirements_md}</p>
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
                        <p className="whitespace-pre-wrap text-muted-foreground">{job.benefits_description}</p>
                      </div>
                    </AccordionContent>
                  </AccordionItem>
                )}
              </Accordion>
            </CardContent>
          </Card>
        </div>

        {/* Right Sidebar (30%) */}
        <div className="space-y-6">
          {/* Job Status Widget */}
          <Card className="shadow-sm">
            <CardHeader className="pb-3">
              <CardTitle className="text-base">Jobstatus</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div>
                <p className="text-xs text-muted-foreground mb-1">Status</p>
                <Badge variant={job.status === 'published' ? 'default' : 'secondary'} className="rounded-full">
                  {job.status === 'published' ? 'Aktiv' : job.status === 'draft' ? 'Entwurf' : 'Archiviert'}
                </Badge>
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
            </CardContent>
          </Card>

          {/* Contact Person */}
          {(job.contact_person_name || job.contact_person_email) && (
            <Card className="shadow-sm">
              <CardHeader className="pb-3">
                <CardTitle className="text-base">Ansprechpartner</CardTitle>
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

          {/* Document Requirements Card */}
          {((job.required_documents && Array.isArray(job.required_documents) && job.required_documents.length > 0) ||
            (job.optional_documents && Array.isArray(job.optional_documents) && job.optional_documents.length > 0)) && (
            <Card className="shadow-sm">
              <CardHeader className="pb-3">
                <CardTitle className="text-base flex items-center gap-2">
                  <FileCheck className="h-4 w-4" />
                  Bewerbungsunterlagen
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {job.required_documents && Array.isArray(job.required_documents) && job.required_documents.length > 0 && (
                  <div>
                    <div className="text-xs text-muted-foreground mb-2 flex items-center gap-1.5">
                      <AlertCircle className="h-3 w-3 text-destructive" />
                      Pflichtdokumente:
                    </div>
                    <div className="flex flex-wrap gap-1.5">
                      {(job.required_documents as Array<{ type: string; label: string }>).map((doc, idx) => (
                        <Badge key={idx} variant="destructive" className="text-xs rounded-full">
                          {doc.label}
                        </Badge>
                      ))}
                    </div>
                  </div>
                )}
                
                {job.optional_documents && Array.isArray(job.optional_documents) && job.optional_documents.length > 0 && (
                  <div>
                    <div className="text-xs text-muted-foreground mb-2">Optional:</div>
                    <div className="flex flex-wrap gap-1.5">
                      {(job.optional_documents as Array<{ type: string; label: string }>).map((doc, idx) => (
                        <Badge key={idx} variant="secondary" className="text-xs rounded-full">
                          {doc.label}
                        </Badge>
                      ))}
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          )}

          {/* Skills & Qualifications Card */}
          {((job.must_have && job.must_have.length > 0) || 
            (job.nice_to_have && job.nice_to_have.length > 0) ||
            (job.languages && job.languages.length > 0) ||
            (job.required_certificates && job.required_certificates.length > 0) ||
            (job.required_licenses && job.required_licenses.length > 0)) && (
            <Card className="shadow-sm">
              <CardHeader className="pb-3">
                <CardTitle className="text-base">Anforderungen</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {/* Skills */}
                {((job.must_have && job.must_have.length > 0) || (job.nice_to_have && job.nice_to_have.length > 0)) && (
                  <div>
                    <p className="text-xs text-muted-foreground mb-2">Fähigkeiten:</p>
                    <div className="space-y-2">
                      {job.must_have && job.must_have.length > 0 && (
                        <div className="flex flex-wrap gap-1.5">
                          {job.must_have.map((skill: string, idx: number) => (
                            <Badge key={idx} variant="default" className="text-xs rounded-full">
                              {skill}
                            </Badge>
                          ))}
                        </div>
                      )}
                      {job.nice_to_have && job.nice_to_have.length > 0 && (
                        <div className="flex flex-wrap gap-1.5">
                          {job.nice_to_have.map((skill: string, idx: number) => (
                            <Badge key={idx} variant="secondary" className="text-xs rounded-full">
                              {skill}
                            </Badge>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>
                )}

                {/* Languages */}
                {job.languages && Array.isArray(job.languages) && job.languages.length > 0 && (
                  <div>
                    <p className="text-xs text-muted-foreground mb-2">Sprachen:</p>
                    <div className="flex flex-wrap gap-1.5">
                      {job.languages.map((lang: any, idx: number) => (
                        <Badge key={idx} variant="outline" className="text-xs rounded-full">
                          <Globe className="h-3 w-3 mr-1" />
                          {typeof lang === 'string' ? lang : `${lang.language} (${lang.level})`}
                        </Badge>
                      ))}
                    </div>
                  </div>
                )}

                {/* Certificates */}
                {job.required_certificates && job.required_certificates.length > 0 && (
                  <div>
                    <p className="text-xs text-muted-foreground mb-2">Zertifikate:</p>
                    <div className="flex flex-wrap gap-1.5">
                      {job.required_certificates.map((cert: string, idx: number) => (
                        <Badge key={idx} variant="outline" className="text-xs rounded-full">
                          {cert}
                        </Badge>
                      ))}
                    </div>
                  </div>
                )}

                {/* Licenses */}
                {job.required_licenses && job.required_licenses.length > 0 && (
                  <div>
                    <p className="text-xs text-muted-foreground mb-2">Führerscheine:</p>
                    <div className="flex flex-wrap gap-1.5">
                      {job.required_licenses.map((license: string, idx: number) => (
                        <Badge key={idx} variant="outline" className="text-xs rounded-full">
                          {license}
                        </Badge>
                      ))}
                    </div>
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
