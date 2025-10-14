import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Calendar, MapPin, Building2, Mail, Phone, User, Briefcase } from "lucide-react";
import { format } from "date-fns";
import { de } from "date-fns/locale";

interface JobListingDetailsTabProps {
  job: any;
  company: any;
}

export function JobListingDetailsTab({ job, company }: JobListingDetailsTabProps) {
  const getWorkModeLabel = (mode: string) => {
    const labels: Record<string, string> = {
      remote: 'Remote',
      hybrid: 'Hybrid',
      onsite: 'Vor Ort',
    };
    return labels[mode] || mode;
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
      {/* Main Content */}
      <div className="lg:col-span-2 space-y-6">
        {/* About the job */}
        <Card>
          <CardHeader>
            <CardTitle>About the job</CardTitle>
          </CardHeader>
          <CardContent className="prose prose-sm max-w-none">
            <div className="whitespace-pre-wrap">{job.description_md || 'Keine Beschreibung vorhanden'}</div>
          </CardContent>
        </Card>

        {/* Responsibilities */}
        {job.tasks_md && (
          <Card>
            <CardHeader>
              <CardTitle>Aufgaben & Tätigkeiten</CardTitle>
            </CardHeader>
            <CardContent className="prose prose-sm max-w-none">
              <div className="whitespace-pre-wrap">{job.tasks_md}</div>
            </CardContent>
          </Card>
        )}

        {/* Requirements */}
        {job.requirements_md && (
          <Card>
            <CardHeader>
              <CardTitle>Anforderungen</CardTitle>
            </CardHeader>
            <CardContent className="prose prose-sm max-w-none">
              <div className="whitespace-pre-wrap">{job.requirements_md}</div>
            </CardContent>
          </Card>
        )}

        {/* Benefits */}
        {job.benefits_description && (
          <Card>
            <CardHeader>
              <CardTitle>Benefits</CardTitle>
            </CardHeader>
            <CardContent className="prose prose-sm max-w-none">
              <div className="whitespace-pre-wrap">{job.benefits_description}</div>
            </CardContent>
          </Card>
        )}
      </div>

      {/* Sidebar */}
      <div className="lg:col-span-1 space-y-4">
        {/* Job Posted By */}
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Job posted</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-3">
              <Avatar>
                <AvatarFallback>
                  <User className="h-4 w-4" />
                </AvatarFallback>
              </Avatar>
              <div>
                <p className="font-medium">{company?.name}</p>
                <p className="text-xs text-muted-foreground">
                  {format(new Date(job.created_at), 'PPP', { locale: de })}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Job Details */}
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Job details</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3 text-sm">
            {job.industry && (
              <div className="flex items-center gap-2">
                <Building2 className="h-4 w-4 text-muted-foreground" />
                <span>{job.industry}</span>
              </div>
            )}
            {job.city && (
              <div className="flex items-center gap-2">
                <MapPin className="h-4 w-4 text-muted-foreground" />
                <span>{job.city}</span>
              </div>
            )}
            {job.start_date && (
              <div className="flex items-center gap-2">
                <Calendar className="h-4 w-4 text-muted-foreground" />
                <span>Start: {format(new Date(job.start_date), 'PPP', { locale: de })}</span>
              </div>
            )}
            {job.work_mode && (
              <div className="flex items-center gap-2">
                <Briefcase className="h-4 w-4 text-muted-foreground" />
                <span>{getWorkModeLabel(job.work_mode)}</span>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Contact Person */}
        {(job.contact_person_name || job.contact_person_email) && (
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Kontaktperson</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3 text-sm">
              {job.contact_person_name && (
                <div className="flex items-center gap-2">
                  <User className="h-4 w-4 text-muted-foreground" />
                  <span>{job.contact_person_name}</span>
                </div>
              )}
              {job.contact_person_role && (
                <div className="flex items-center gap-2">
                  <Briefcase className="h-4 w-4 text-muted-foreground" />
                  <span>{job.contact_person_role}</span>
                </div>
              )}
              {job.contact_person_email && (
                <div className="flex items-center gap-2">
                  <Mail className="h-4 w-4 text-muted-foreground" />
                  <a href={`mailto:${job.contact_person_email}`} className="hover:underline">
                    {job.contact_person_email}
                  </a>
                </div>
              )}
              {job.contact_person_phone && (
                <div className="flex items-center gap-2">
                  <Phone className="h-4 w-4 text-muted-foreground" />
                  <a href={`tel:${job.contact_person_phone}`} className="hover:underline">
                    {job.contact_person_phone}
                  </a>
                </div>
              )}
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}
