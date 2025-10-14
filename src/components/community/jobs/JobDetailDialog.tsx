import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { Building2, MapPin, Clock, Briefcase, Calendar, Mail, Phone } from "lucide-react";
import { formatDistanceToNow, format } from "date-fns";
import { de } from "date-fns/locale";

interface JobDetailDialogProps {
  job: any;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function JobDetailDialog({ job, open, onOpenChange }: JobDetailDialogProps) {
  if (!job) return null;

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
      onsite: 'Vor Ort',
      hybrid: 'Hybrid',
      remote: 'Remote',
    };
    return labels[mode] || mode;
  };

  const timeAgo = job.created_at
    ? formatDistanceToNow(new Date(job.created_at), { addSuffix: true, locale: de })
    : '';

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <div className="flex items-start gap-4">
            {job.company?.logo_url ? (
              <img
                src={job.company.logo_url}
                alt={job.company.name}
                className="h-16 w-16 rounded-lg object-cover"
              />
            ) : (
              <div className="h-16 w-16 rounded-lg bg-muted flex items-center justify-center">
                <Building2 className="h-8 w-8 text-muted-foreground" />
              </div>
            )}
            <div className="flex-1">
              <DialogTitle className="text-2xl mb-2">{job.title}</DialogTitle>
              <p className="text-muted-foreground">{job.company?.name}</p>
            </div>
          </div>
        </DialogHeader>

        <div className="grid md:grid-cols-3 gap-6 mt-6">
          {/* Main Content */}
          <div className="md:col-span-2 space-y-6">
            {/* About the job */}
            {job.description_md && (
              <div>
                <h3 className="font-semibold mb-3">Über die Stelle</h3>
                <div className="prose prose-sm max-w-none">
                  <p className="text-muted-foreground whitespace-pre-wrap">{job.description_md}</p>
                </div>
              </div>
            )}

            {/* Requirements */}
            {job.must_have && job.must_have.length > 0 && (
              <div>
                <h3 className="font-semibold mb-3">Anforderungen</h3>
                <ul className="space-y-2">
                  {job.must_have.map((req: string, idx: number) => (
                    <li key={idx} className="flex items-start gap-2 text-sm text-muted-foreground">
                      <span className="text-primary mt-1">•</span>
                      <span>{req}</span>
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {/* Nice to have */}
            {job.nice_to_have && job.nice_to_have.length > 0 && (
              <div>
                <h3 className="font-semibold mb-3">Wünschenswert</h3>
                <ul className="space-y-2">
                  {job.nice_to_have.map((skill: string, idx: number) => (
                    <li key={idx} className="flex items-start gap-2 text-sm text-muted-foreground">
                      <span className="text-primary mt-1">•</span>
                      <span>{skill}</span>
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {/* Benefits */}
            {job.benefits && job.benefits.length > 0 && (
              <div>
                <h3 className="font-semibold mb-3">Benefits</h3>
                <ul className="space-y-2">
                  {job.benefits.map((benefit: string, idx: number) => (
                    <li key={idx} className="flex items-start gap-2 text-sm text-muted-foreground">
                      <span className="text-primary mt-1">•</span>
                      <span>{benefit}</span>
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </div>

          {/* Sidebar */}
          <div className="space-y-4">
            {/* Apply Button */}
            <Button className="w-full" size="lg">
              Jetzt bewerben
            </Button>

            {/* Job Details */}
            <Card>
              <CardHeader>
                <CardTitle className="text-base">Job details</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4 text-sm">
                <div className="flex items-start gap-3">
                  <Briefcase className="h-4 w-4 text-muted-foreground mt-0.5" />
                  <div>
                    <p className="text-muted-foreground text-xs">Beschäftigungsart</p>
                    <p className="font-medium">{getEmploymentTypeLabel(job.employment_type)}</p>
                  </div>
                </div>

                {(job.city || job.state) && (
                  <div className="flex items-start gap-3">
                    <MapPin className="h-4 w-4 text-muted-foreground mt-0.5" />
                    <div>
                      <p className="text-muted-foreground text-xs">Standort</p>
                      <p className="font-medium">{job.city || job.state}</p>
                    </div>
                  </div>
                )}

                {job.work_mode && (
                  <div className="flex items-start gap-3">
                    <Building2 className="h-4 w-4 text-muted-foreground mt-0.5" />
                    <div>
                      <p className="text-muted-foreground text-xs">Arbeitsmodell</p>
                      <p className="font-medium">{getWorkModeLabel(job.work_mode)}</p>
                    </div>
                  </div>
                )}

                {job.start_date && (
                  <div className="flex items-start gap-3">
                    <Calendar className="h-4 w-4 text-muted-foreground mt-0.5" />
                    <div>
                      <p className="text-muted-foreground text-xs">Startdatum</p>
                      <p className="font-medium">
                        {format(new Date(job.start_date), 'dd.MM.yyyy', { locale: de })}
                      </p>
                    </div>
                  </div>
                )}

                {timeAgo && (
                  <div className="flex items-start gap-3">
                    <Clock className="h-4 w-4 text-muted-foreground mt-0.5" />
                    <div>
                      <p className="text-muted-foreground text-xs">Veröffentlicht</p>
                      <p className="font-medium">{timeAgo}</p>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Contact Person */}
            {job.contact_name && (
              <Card>
                <CardHeader>
                  <CardTitle className="text-base">Ansprechpartner</CardTitle>
                </CardHeader>
                <CardContent className="space-y-3 text-sm">
                  <div>
                    <p className="font-medium">{job.contact_name}</p>
                    {job.contact_role && (
                      <p className="text-muted-foreground text-xs">{job.contact_role}</p>
                    )}
                  </div>
                  
                  {job.contact_email && (
                    <div className="flex items-center gap-2 text-muted-foreground">
                      <Mail className="h-4 w-4" />
                      <a href={`mailto:${job.contact_email}`} className="hover:text-primary">
                        {job.contact_email}
                      </a>
                    </div>
                  )}

                  {job.contact_phone && (
                    <div className="flex items-center gap-2 text-muted-foreground">
                      <Phone className="h-4 w-4" />
                      <a href={`tel:${job.contact_phone}`} className="hover:text-primary">
                        {job.contact_phone}
                      </a>
                    </div>
                  )}
                </CardContent>
              </Card>
            )}

            {/* Company Info */}
            {job.company && (
              <Card>
                <CardHeader>
                  <CardTitle className="text-base">Über {job.company.name}</CardTitle>
                </CardHeader>
                <CardContent className="text-sm">
                  <p className="text-muted-foreground line-clamp-4">
                    {job.company.description || 'Keine Unternehmensbeschreibung verfügbar.'}
                  </p>
                </CardContent>
              </Card>
            )}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
