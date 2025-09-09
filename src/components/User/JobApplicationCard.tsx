import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Eye, MapPin, Clock, Euro, Briefcase, Calendar, Star, CheckCircle, XCircle, FileText, ExternalLink } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

interface JobPost {
  id: string;
  title: string;
  job_type: string;
  description_md: string;
  work_mode: string;
  city: string;
  employment_type: string;
  salary_min?: number;
  salary_max?: number;
  salary_currency: string;
  salary_interval: string;
  start_immediately: boolean;
  start_date?: string;
  end_date?: string;
  hours_per_week_min?: number;
  hours_per_week_max?: number;
  tasks_description?: string;
  requirements_description?: string;
  benefits_description?: string;
  contact_person_name?: string;
  contact_person_email?: string;
  contact_person_phone?: string;
  published_at?: string;
  created_at: string;
  companies: {
    id: string;
    name: string;
    logo_url?: string;
  };
}

interface Application {
  id: string;
  job_post_id: string;
  status: string;
  cover_letter?: string;
  resume_url?: string;
  portfolio_url?: string;
  applied_at: string;
  viewed_by_company: boolean;
  viewed_at?: string;
  company_notes?: string;
  rejection_reason?: string;
  job_posts: JobPost;
}

interface JobApplicationCardProps {
  application: Application;
  onStatusUpdate?: () => void;
}

export default function JobApplicationCard({ application, onStatusUpdate }: JobApplicationCardProps) {
  const { toast } = useToast();
  const [isApplying, setIsApplying] = useState(false);
  const [coverLetter, setCoverLetter] = useState(application.cover_letter || '');
  const [resumeFile, setResumeFile] = useState<File | null>(null);
  const [portfolioUrl, setPortfolioUrl] = useState(application.portfolio_url || '');

  const handleApply = async () => {
    if (!coverLetter.trim()) {
      toast({
        title: "Anschreiben erforderlich",
        description: "Bitte geben Sie ein Anschreiben ein.",
        variant: "destructive"
      });
      return;
    }

    setIsApplying(true);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Nicht angemeldet');

      // Upload resume if provided
      let resumeUrl = application.resume_url;
      if (resumeFile) {
        const fileExt = resumeFile.name.split('.').pop();
        const fileName = `${user.id}/${application.job_post_id}/resume.${fileExt}`;
        
        const { error: uploadError } = await supabase.storage
          .from('resumes')
          .upload(fileName, resumeFile);

        if (uploadError) throw uploadError;

        const { data: { publicUrl } } = supabase.storage
          .from('resumes')
          .getPublicUrl(fileName);

        resumeUrl = publicUrl;
      }

      // Create or update application
      const { error } = await (supabase as any)
        .from('applications')
        .upsert({
          id: application.id,
          job_post_id: application.job_post_id,
          user_id: user.id,
          company_id: application.job_posts.companies.id,
          cover_letter: coverLetter.trim(),
          resume_url: resumeUrl,
          portfolio_url: portfolioUrl || null,
          status: 'applied',
          applied_at: new Date().toISOString()
        });

      if (error) throw error;

      // Track job post view
      await (supabase as any)
        .from('job_post_views')
        .insert({
          job_post_id: application.job_post_id,
          user_id: user.id
        });

      toast({
        title: "Bewerbung abgesendet",
        description: "Ihre Bewerbung wurde erfolgreich übermittelt."
      });

      if (onStatusUpdate) onStatusUpdate();
    } catch (error: any) {
      console.error('Error applying:', error);
      toast({
        title: "Fehler",
        description: "Bewerbung konnte nicht abgesendet werden.",
        variant: "destructive"
      });
    } finally {
      setIsApplying(false);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'shortlisted':
        return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'rejected':
        return 'bg-red-100 text-red-800 border-red-200';
      case 'hired':
        return 'bg-green-100 text-green-800 border-green-200';
      default:
        return 'bg-blue-100 text-blue-800 border-blue-200';
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'applied':
        return 'Beworben';
      case 'shortlisted':
        return 'In der engeren Auswahl';
      case 'rejected':
        return 'Abgelehnt';
      case 'hired':
        return 'Angenommen';
      case 'withdrawn':
        return 'Zurückgezogen';
      default:
        return status;
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'shortlisted':
        return <Star className="h-4 w-4" />;
      case 'rejected':
        return <XCircle className="h-4 w-4" />;
      case 'hired':
        return <CheckCircle className="h-4 w-4" />;
      default:
        return <Clock className="h-4 w-4" />;
    }
  };

  return (
    <Card className="w-full">
      <CardContent className="p-6">
        <div className="flex items-start justify-between mb-4">
          <div className="flex items-start gap-4">
            <div className="w-12 h-12 rounded-lg bg-muted flex items-center justify-center">
              {application.job_posts.companies.logo_url ? (
                <img
                  src={application.job_posts.companies.logo_url}
                  alt={application.job_posts.companies.name}
                  className="w-12 h-12 rounded-lg object-cover"
                />
              ) : (
                <span className="text-lg font-semibold">
                  {application.job_posts.companies.name.charAt(0)}
                </span>
              )}
            </div>
            <div>
              <h3 className="text-lg font-semibold">{application.job_posts.title}</h3>
              <p className="text-sm text-muted-foreground">{application.job_posts.companies.name}</p>
              <div className="flex items-center gap-4 mt-1 text-sm text-muted-foreground">
                <div className="flex items-center gap-1">
                  <MapPin className="h-3 w-3" />
                  {application.job_posts.city}
                </div>
                <div className="flex items-center gap-1">
                  <Briefcase className="h-3 w-3" />
                  {application.job_posts.employment_type}
                </div>
                <div className="flex items-center gap-1">
                  <Clock className="h-3 w-3" />
                  {application.job_posts.work_mode}
                </div>
              </div>
            </div>
          </div>
          <div className="text-right">
            {application.job_posts.salary_min && application.job_posts.salary_max && (
              <div className="text-sm font-semibold">
                {application.job_posts.salary_min / 100} - {application.job_posts.salary_max / 100} {application.job_posts.salary_currency}
                <span className="text-xs text-muted-foreground"> / {application.job_posts.salary_interval}</span>
              </div>
            )}
          </div>
        </div>

        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <Badge className={getStatusColor(application.status)}>
              <span className="flex items-center gap-1">
                {getStatusIcon(application.status)}
                {getStatusText(application.status)}
              </span>
            </Badge>
            {application.viewed_by_company && (
              <Badge variant="outline" className="text-green-600 border-green-200">
                <Eye className="h-3 w-3 mr-1" />
                Gesehen
              </Badge>
            )}
          </div>
          <div className="text-sm text-muted-foreground">
            Beworben am {new Date(application.applied_at).toLocaleDateString('de-DE')}
          </div>
        </div>

        {application.company_notes && (
          <div className="mb-4 p-3 bg-muted rounded-lg">
            <h4 className="text-sm font-semibold mb-1">Notiz vom Unternehmen:</h4>
            <p className="text-sm text-muted-foreground">{application.company_notes}</p>
          </div>
        )}

        {application.rejection_reason && (
          <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg">
            <h4 className="text-sm font-semibold mb-1 text-red-800">Ablehnungsgrund:</h4>
            <p className="text-sm text-red-700">{application.rejection_reason}</p>
          </div>
        )}

        <div className="flex gap-2">
          <Dialog>
            <DialogTrigger asChild>
              <Button variant="outline" size="sm">
                <FileText className="h-4 w-4 mr-1" />
                Details anzeigen
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
              <DialogHeader>
                <DialogTitle>{application.job_posts.title}</DialogTitle>
              </DialogHeader>
              <div className="space-y-6">
                {/* Job Description */}
                <div>
                  <h3 className="text-lg font-semibold mb-2">Beschreibung</h3>
                  <div className="prose max-w-none">
                    {application.job_posts.description_md ? (
                      <div dangerouslySetInnerHTML={{ __html: application.job_posts.description_md }} />
                    ) : (
                      <p className="text-muted-foreground">Keine Beschreibung verfügbar</p>
                    )}
                  </div>
                </div>

                {/* Tasks */}
                {application.job_posts.tasks_description && (
                  <div>
                    <h3 className="text-lg font-semibold mb-2">Aufgaben</h3>
                    <p className="text-muted-foreground">{application.job_posts.tasks_description}</p>
                  </div>
                )}

                {/* Requirements */}
                {application.job_posts.requirements_description && (
                  <div>
                    <h3 className="text-lg font-semibold mb-2">Anforderungen</h3>
                    <p className="text-muted-foreground">{application.job_posts.requirements_description}</p>
                  </div>
                )}

                {/* Benefits */}
                {application.job_posts.benefits_description && (
                  <div>
                    <h3 className="text-lg font-semibold mb-2">Vorteile</h3>
                    <p className="text-muted-foreground">{application.job_posts.benefits_description}</p>
                  </div>
                )}

                {/* Contact */}
                {application.job_posts.contact_person_name && (
                  <div>
                    <h3 className="text-lg font-semibold mb-2">Kontakt</h3>
                    <div className="space-y-1">
                      <p><strong>Ansprechpartner:</strong> {application.job_posts.contact_person_name}</p>
                      {application.job_posts.contact_person_email && (
                        <p><strong>E-Mail:</strong> {application.job_posts.contact_person_email}</p>
                      )}
                      {application.job_posts.contact_person_phone && (
                        <p><strong>Telefon:</strong> {application.job_posts.contact_person_phone}</p>
                      )}
                    </div>
                  </div>
                )}

                {/* Application Details */}
                <div className="border-t pt-4">
                  <h3 className="text-lg font-semibold mb-2">Ihre Bewerbung</h3>
                  {application.cover_letter && (
                    <div className="mb-4">
                      <h4 className="font-semibold mb-1">Anschreiben:</h4>
                      <p className="text-sm text-muted-foreground whitespace-pre-wrap">{application.cover_letter}</p>
                    </div>
                  )}
                  {application.resume_url && (
                    <div className="mb-4">
                      <h4 className="font-semibold mb-1">Lebenslauf:</h4>
                      <a
                        href={application.resume_url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-blue-600 hover:underline flex items-center gap-1"
                      >
                        <ExternalLink className="h-3 w-3" />
                        Lebenslauf anzeigen
                      </a>
                    </div>
                  )}
                  {application.portfolio_url && (
                    <div className="mb-4">
                      <h4 className="font-semibold mb-1">Portfolio:</h4>
                      <a
                        href={application.portfolio_url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-blue-600 hover:underline flex items-center gap-1"
                      >
                        <ExternalLink className="h-3 w-3" />
                        Portfolio anzeigen
                      </a>
                    </div>
                  )}
                </div>
              </div>
            </DialogContent>
          </Dialog>

          {application.status === 'applied' && (
            <Button
              variant="destructive"
              size="sm"
              onClick={async () => {
                try {
                  const { error } = await supabase
                    .from('applications')
                    .update({ status: 'withdrawn' })
                    .eq('id', application.id);

                  if (error) throw error;

                  toast({
                    title: "Bewerbung zurückgezogen",
                    description: "Ihre Bewerbung wurde erfolgreich zurückgezogen."
                  });

                  if (onStatusUpdate) onStatusUpdate();
                } catch (error: any) {
                  console.error('Error withdrawing application:', error);
                  toast({
                    title: "Fehler",
                    description: "Bewerbung konnte nicht zurückgezogen werden.",
                    variant: "destructive"
                  });
                }
              }}
            >
              Zurückziehen
            </Button>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
