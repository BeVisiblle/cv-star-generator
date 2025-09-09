import React, { useEffect, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { MapPin, Building, Clock, Euro, Users, Calendar, Edit } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

interface JobDetail {
  id: string;
  title: string;
  company_name: string;
  description_md: string | null;
  tasks_description: string | null;
  requirements_description: string | null;
  benefits_description: string | null;
  job_type: string;
  work_mode: string;
  employment_type: string;
  city: string;
  country: string;
  salary_currency: string;
  salary_min: number | null;
  salary_max: number | null;
  salary_interval: string;
  published_at: string;
  company_id?: string;
  contact_person_name: string | null;
  contact_person_email: string | null;
  contact_person_phone: string | null;
  application_deadline: string | null;
  application_url: string | null;
  application_email: string | null;
  application_instructions: string | null;
  skills: string[] | null;
  languages: string[] | null;
  tags: string[] | null;
}

interface JobUserPreviewProps {
  jobId: string;
  onEdit?: () => void;
  showEditButton?: boolean;
}

export default function JobUserPreview({ jobId, onEdit, showEditButton = false }: JobUserPreviewProps) {
  const { toast } = useToast();
  const [job, setJob] = useState<JobDetail | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!jobId) return;

    const fetchJob = async () => {
      try {
        const { data, error } = await supabase
          .from('job_posts')
          .select(`
            *,
            companies!inner(name)
          `)
          .eq('id', jobId)
          .single();

        if (error) throw error;

        setJob({
          ...data,
          company_name: data.companies?.name || 'Unbekanntes Unternehmen'
        });
      } catch (error) {
        console.error('Error fetching job:', error);
        toast({
          title: 'Fehler',
          description: 'Stellenanzeige konnte nicht geladen werden.',
          variant: 'destructive',
        });
      } finally {
        setLoading(false);
      }
    };

    fetchJob();
  }, [jobId, toast]);

  const formatSalary = () => {
    if (!job?.salary_min && !job?.salary_max) return 'Gehalt auf Anfrage';
    
    const currency = job?.salary_currency || 'EUR';
    const interval = job?.salary_interval === 'year' ? 'Jahr' : 'Monat';
    
    if (job?.salary_min && job?.salary_max) {
      return `${job.salary_min.toLocaleString()} - ${job.salary_max.toLocaleString()} ${currency}/${interval}`;
    } else if (job?.salary_min) {
      return `ab ${job.salary_min.toLocaleString()} ${currency}/${interval}`;
    } else if (job?.salary_max) {
      return `bis ${job.salary_max.toLocaleString()} ${currency}/${interval}`;
    }
    
    return 'Gehalt auf Anfrage';
  };

  const getWorkModeLabel = (mode: string) => {
    const modes: { [key: string]: string } = {
      'onsite': 'Vor Ort',
      'remote': 'Remote',
      'hybrid': 'Hybrid'
    };
    return modes[mode] || mode;
  };

  const getEmploymentTypeLabel = (type: string) => {
    const types: { [key: string]: string } = {
      'fulltime': 'Vollzeit',
      'parttime': 'Teilzeit',
      'contract': 'Vertrag',
      'internship': 'Praktikum',
      'apprenticeship': 'Ausbildung'
    };
    return types[type] || type;
  };

  const getJobTypeLabel = (type: string) => {
    const types: { [key: string]: string } = {
      'professional': 'Fachkraft',
      'apprenticeship': 'Ausbildung',
      'internship': 'Praktikum'
    };
    return types[type] || type;
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-96">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (!job) {
    return (
      <div className="text-center p-8">
        <h2 className="text-xl font-semibold mb-4">Stellenanzeige nicht gefunden</h2>
        <p className="text-muted-foreground">Die angeforderte Stellenanzeige konnte nicht geladen werden.</p>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">{job.title}</h1>
          <p className="text-lg text-muted-foreground mt-2">{job.company_name}</p>
        </div>
        {showEditButton && onEdit && (
          <Button onClick={onEdit} className="flex items-center gap-2">
            <Edit className="h-4 w-4" />
            Bearbeiten
          </Button>
        )}
      </div>

      {/* Job Info Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <Building className="h-5 w-5 text-muted-foreground" />
              <div>
                <p className="text-sm text-muted-foreground">Unternehmen</p>
                <p className="font-semibold">{job.company_name}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <MapPin className="h-5 w-5 text-muted-foreground" />
              <div>
                <p className="text-sm text-muted-foreground">Standort</p>
                <p className="font-semibold">{job.city}, {job.country}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <Clock className="h-5 w-5 text-muted-foreground" />
              <div>
                <p className="text-sm text-muted-foreground">Arbeitsmodus</p>
                <p className="font-semibold">{getWorkModeLabel(job.work_mode)}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <Euro className="h-5 w-5 text-muted-foreground" />
              <div>
                <p className="text-sm text-muted-foreground">Gehalt</p>
                <p className="font-semibold">{formatSalary()}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Job Details */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-6">
          {/* Description */}
          <Card>
            <CardHeader>
              <CardTitle>Stellenbeschreibung</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="prose max-w-none">
                {job.description_md ? (
                  <div dangerouslySetInnerHTML={{ __html: job.description_md }} />
                ) : (
                  <p className="text-muted-foreground">Keine Beschreibung verfügbar.</p>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Tasks */}
          {job.tasks_description && (
            <Card>
              <CardHeader>
                <CardTitle>Aufgaben</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="prose max-w-none">
                  <div dangerouslySetInnerHTML={{ __html: job.tasks_description }} />
                </div>
              </CardContent>
            </Card>
          )}

          {/* Requirements */}
          {job.requirements_description && (
            <Card>
              <CardHeader>
                <CardTitle>Anforderungen</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="prose max-w-none">
                  <div dangerouslySetInnerHTML={{ __html: job.requirements_description }} />
                </div>
              </CardContent>
            </Card>
          )}

          {/* Benefits */}
          {job.benefits_description && (
            <Card>
              <CardHeader>
                <CardTitle>Leistungen</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="prose max-w-none">
                  <div dangerouslySetInnerHTML={{ __html: job.benefits_description }} />
                </div>
              </CardContent>
            </Card>
          )}
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Job Type & Employment */}
          <Card>
            <CardHeader>
              <CardTitle>Job-Details</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <p className="text-sm text-muted-foreground">Kategorie</p>
                <p className="font-semibold">{getJobTypeLabel(job.job_type)}</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Anstellungsart</p>
                <p className="font-semibold">{getEmploymentTypeLabel(job.employment_type)}</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Veröffentlicht</p>
                <p className="font-semibold">
                  {new Date(job.published_at).toLocaleDateString('de-DE')}
                </p>
              </div>
            </CardContent>
          </Card>

          {/* Skills */}
          {job.skills && job.skills.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle>Fähigkeiten</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex flex-wrap gap-2">
                  {job.skills.map((skill, index) => (
                    <Badge key={index} variant="secondary">
                      {skill}
                    </Badge>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}

          {/* Languages */}
          {job.languages && job.languages.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle>Sprachen</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex flex-wrap gap-2">
                  {job.languages.map((language, index) => (
                    <Badge key={index} variant="outline">
                      {language}
                    </Badge>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}

          {/* Contact Information */}
          <Card>
            <CardHeader>
              <CardTitle>Kontakt</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              {job.contact_person_name && (
                <div>
                  <p className="text-sm text-muted-foreground">Ansprechpartner</p>
                  <p className="font-semibold">{job.contact_person_name}</p>
                </div>
              )}
              {job.contact_person_email && (
                <div>
                  <p className="text-sm text-muted-foreground">E-Mail</p>
                  <p className="font-semibold">{job.contact_person_email}</p>
                </div>
              )}
              {job.contact_person_phone && (
                <div>
                  <p className="text-sm text-muted-foreground">Telefon</p>
                  <p className="font-semibold">{job.contact_person_phone}</p>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Application Info */}
          <Card>
            <CardHeader>
              <CardTitle>Bewerbung</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              {job.application_deadline && (
                <div>
                  <p className="text-sm text-muted-foreground">Bewerbungsfrist</p>
                  <p className="font-semibold">
                    {new Date(job.application_deadline).toLocaleDateString('de-DE')}
                  </p>
                </div>
              )}
              {job.application_url && (
                <div>
                  <p className="text-sm text-muted-foreground">Bewerbungs-URL</p>
                  <a 
                    href={job.application_url} 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="text-primary hover:underline"
                  >
                    {job.application_url}
                  </a>
                </div>
              )}
              {job.application_email && (
                <div>
                  <p className="text-sm text-muted-foreground">Bewerbungs-E-Mail</p>
                  <p className="font-semibold">{job.application_email}</p>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
