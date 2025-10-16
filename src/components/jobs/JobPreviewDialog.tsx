import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { MapPin, Briefcase, Calendar, Building2, Users, Languages, Award, FileText } from "lucide-react";
import { DOCUMENT_TYPE_LABELS } from "@/lib/document-types";

interface JobPreviewDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  job: any;
  company: any;
}

export function JobPreviewDialog({ open, onOpenChange, job, company }: JobPreviewDialogProps) {
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

  const getWorkModeLabel = (mode: string) => {
    const labels: Record<string, string> = {
      remote: 'Remote',
      office: 'Vor Ort',
      hybrid: 'Hybrid',
    };
    return labels[mode] || mode;
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Vorschau: Stellenanzeige</DialogTitle>
        </DialogHeader>

        <div className="space-y-6">
          {/* Header */}
          <div className="flex items-start gap-4 pb-6 border-b">
            {company?.logo_url ? (
              <img
                src={company.logo_url}
                alt={company.name}
                className="h-16 w-16 rounded-lg object-cover flex-shrink-0"
              />
            ) : (
              <div className="h-16 w-16 rounded-lg bg-muted flex items-center justify-center flex-shrink-0">
                <Building2 className="h-8 w-8 text-muted-foreground" />
              </div>
            )}
            
            <div className="flex-1">
              <h2 className="text-2xl font-bold mb-2">{job.title}</h2>
              <p className="text-lg text-muted-foreground mb-3">
                {company?.name || 'Unbekanntes Unternehmen'}
              </p>
              
              <div className="flex items-center gap-4 flex-wrap text-sm">
                {(job.city || job.state) && (
                  <span className="flex items-center gap-1">
                    <MapPin className="h-4 w-4" />
                    {job.city || job.state}
                  </span>
                )}
                <span className="flex items-center gap-1">
                  <Briefcase className="h-4 w-4" />
                  {getEmploymentTypeLabel(job.employment_type)}
                </span>
                {job.work_mode && (
                  <span className="flex items-center gap-1">
                    {getWorkModeLabel(job.work_mode)}
                  </span>
                )}
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Left Column */}
            <div className="lg:col-span-2 space-y-6">
              {/* Description */}
              {(job.description_md || job.tasks_md) && (
                <section>
                  <h3 className="text-lg font-bold mb-3">Über die Stelle</h3>
                  <div className="prose prose-sm max-w-none">
                    <p className="text-muted-foreground whitespace-pre-wrap">
                      {job.description_md || job.tasks_md}
                    </p>
                  </div>
                </section>
              )}

              {/* Requirements */}
              {job.requirements_md && (
                <section>
                  <h3 className="text-lg font-bold mb-3">Anforderungen</h3>
                  <div className="prose prose-sm max-w-none">
                    <p className="text-muted-foreground whitespace-pre-wrap">{job.requirements_md}</p>
                  </div>
                </section>
              )}

              {/* Benefits */}
              {job.benefits_description && (
                <section>
                  <h3 className="text-lg font-bold mb-3">Benefits</h3>
                  <div className="prose prose-sm max-w-none">
                    <p className="text-muted-foreground whitespace-pre-wrap">{job.benefits_description}</p>
                  </div>
                </section>
              )}
            </div>

            {/* Right Column - Sidebar */}
            <div className="space-y-4">
              {/* Salary */}
              {(job.salary_min || job.salary_max) && (
                <div className="p-4 border rounded-lg bg-card">
                  <h4 className="font-bold text-xl mb-1">
                    €{job.salary_min?.toLocaleString() || '?'} - €{job.salary_max?.toLocaleString() || '?'}
                  </h4>
                  <p className="text-sm text-muted-foreground">Durchschn. Gehalt</p>
                </div>
              )}

              {/* Job Details */}
              <div className="p-4 border rounded-lg bg-card space-y-3">
                <h4 className="font-semibold">Details</h4>
                
                {job.industry && (
                  <div className="flex items-start gap-3">
                    <Building2 className="h-4 w-4 text-muted-foreground mt-0.5" />
                    <div>
                      <p className="text-xs font-medium">Branche</p>
                      <p className="text-sm text-muted-foreground">{job.industry}</p>
                    </div>
                  </div>
                )}
                
                {job.start_date && (
                  <div className="flex items-start gap-3">
                    <Calendar className="h-4 w-4 text-muted-foreground mt-0.5" />
                    <div>
                      <p className="text-xs font-medium">Startdatum</p>
                      <p className="text-sm text-muted-foreground">
                        {new Date(job.start_date).toLocaleDateString('de-DE')}
                      </p>
                    </div>
                  </div>
                )}
              </div>

              {/* Skills */}
              {job.skills && Array.isArray(job.skills) && job.skills.length > 0 && (
                <div className="p-4 border rounded-lg bg-card">
                  <div className="flex items-center gap-2 mb-3">
                    <Award className="h-4 w-4" />
                    <h4 className="font-semibold">Fähigkeiten</h4>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {job.skills.map((skill: any, index: number) => (
                      <Badge key={index} variant="secondary" className="text-xs">
                        {typeof skill === 'string' ? skill : skill.name || ''}
                      </Badge>
                    ))}
                  </div>
                </div>
              )}

              {/* Languages */}
              {job.required_languages && Array.isArray(job.required_languages) && job.required_languages.length > 0 && (
                <div className="p-4 border rounded-lg bg-card">
                  <div className="flex items-center gap-2 mb-3">
                    <Languages className="h-4 w-4" />
                    <h4 className="font-semibold">Sprachen</h4>
                  </div>
                  <div className="space-y-1">
                    {job.required_languages.map((lang: any, index: number) => (
                      <div key={index} className="text-sm">
                        <span className="font-medium">{lang.language}</span>
                        {lang.level && <span className="text-muted-foreground"> - {lang.level}</span>}
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Required Documents */}
              {((job.required_documents && Array.isArray(job.required_documents) && job.required_documents.length > 0) ||
                (job.optional_documents && Array.isArray(job.optional_documents) && job.optional_documents.length > 0)) && (
                <div className="p-4 border rounded-lg bg-card">
                  <div className="flex items-center gap-2 mb-3">
                    <FileText className="h-4 w-4" />
                    <h4 className="font-semibold">Benötigte Dokumente</h4>
                  </div>
                  
                  {job.required_documents && job.required_documents.length > 0 && (
                    <div className="mb-3">
                      <p className="text-xs font-medium text-muted-foreground mb-2">Pflicht:</p>
                      <ul className="space-y-1">
                        {job.required_documents.map((doc: any, index: number) => {
                          const docType = typeof doc === 'string' ? doc : doc.type;
                          const docLabel = typeof doc === 'string' 
                            ? DOCUMENT_TYPE_LABELS[doc as keyof typeof DOCUMENT_TYPE_LABELS] || doc
                            : doc.label || DOCUMENT_TYPE_LABELS[doc.type as keyof typeof DOCUMENT_TYPE_LABELS] || doc.type;
                          return (
                            <li key={index} className="text-sm flex items-center gap-2">
                              <div className="h-1.5 w-1.5 rounded-full bg-red-500" />
                              {docLabel}
                            </li>
                          );
                        })}
                      </ul>
                    </div>
                  )}
                  
                  {job.optional_documents && job.optional_documents.length > 0 && (
                    <div>
                      <p className="text-xs font-medium text-muted-foreground mb-2">Optional:</p>
                      <ul className="space-y-1">
                        {job.optional_documents.map((doc: any, index: number) => {
                          const docLabel = typeof doc === 'string' 
                            ? DOCUMENT_TYPE_LABELS[doc as keyof typeof DOCUMENT_TYPE_LABELS] || doc
                            : doc.label || DOCUMENT_TYPE_LABELS[doc.type as keyof typeof DOCUMENT_TYPE_LABELS] || doc.type;
                          return (
                            <li key={index} className="text-sm text-muted-foreground flex items-center gap-2">
                              <div className="h-1.5 w-1.5 rounded-full bg-muted-foreground" />
                              {docLabel}
                            </li>
                          );
                        })}
                      </ul>
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
