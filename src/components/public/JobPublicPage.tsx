import React, { useEffect, useState } from 'react';
import { useParams, useSearchParams } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { MapPin, Building, Clock, Euro, Users, Calendar, Loader2 } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import ShareJobButton from './ShareJobButton';

interface JobDetail {
  id: string;
  title: string;
  company_name: string;
  description_md: string | null;
  tasks_description: string | null;
  requirements_description: string | null;
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
  company_id?: string; // Add company_id for sharing
}

export default function JobPublicPage() {
  const { slug } = useParams();
  const [searchParams] = useSearchParams();
  const { toast } = useToast();
  
  const [job, setJob] = useState<JobDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [applying, setApplying] = useState(false);
  const [applicationSuccess, setApplicationSuccess] = useState(false);
  
  // Application form state
  const [showApplicationModal, setShowApplicationModal] = useState(
    searchParams.get('apply') === '1'
  );
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [coverLetter, setCoverLetter] = useState('');

  useEffect(() => {
    if (slug) {
      loadJob();
    }
  }, [slug]);

  async function loadJob() {
    try {
      const { data, error } = await supabase
        .from('job_posts')
        .select(`
          id, title, description_md, tasks_description, requirements_description,
          job_type, work_mode, employment_type, city, country,
          salary_currency, salary_min, salary_max, salary_interval,
          published_at, company_id,
          companies!inner(name)
        `)
        .eq('id', slug) // Use ID instead of slug for now
        .eq('is_public', true)
        .eq('is_active', true)
        .maybeSingle();

      if (error) throw error;
      
      if (data) {
        setJob({
          ...data,
          company_name: (data.companies as any)?.name || 'Unbekanntes Unternehmen'
        });
      }
    } catch (error) {
      console.error('Error loading job:', error);
      toast({
        title: "Fehler",
        description: "Die Stellenanzeige konnte nicht geladen werden.",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  }

  async function handleOneClickApply() {
    if (!job || !fullName.trim() || !email.trim()) {
      toast({
        title: "Fehlende Angaben",
        description: "Bitte füllen Sie alle Pflichtfelder aus.",
        variant: "destructive"
      });
      return;
    }

    setApplying(true);
    try {
      const { data, error } = await supabase.rpc('apply_one_click', {
        p_job: job.id,
        p_full_name: fullName.trim(),
        p_email: email.trim(),
        p_phone: phone.trim() || null
      });

      if (error) throw error;

      setApplicationSuccess(true);
      toast({
        title: "Bewerbung erfolgreich!",
        description: "Ihre Bewerbung wurde erfolgreich versendet.",
      });
    } catch (error: any) {
      console.error('Error applying:', error);
      toast({
        title: "Fehler bei der Bewerbung",
        description: error.message || "Es gab einen Fehler beim Senden Ihrer Bewerbung.",
        variant: "destructive"
      });
    } finally {
      setApplying(false);
    }
  }

  const formatSalary = () => {
    if (!job || (!job.salary_min && !job.salary_max)) return null;
    
    const currency = job.salary_currency === 'EUR' ? '€' : job.salary_currency;
    const interval = job.salary_interval === 'month' ? '/Monat' : 
                    job.salary_interval === 'year' ? '/Jahr' : 
                    job.salary_interval === 'hour' ? '/Std' : '';

    if (job.salary_min && job.salary_max) {
      return `${currency}${job.salary_min.toLocaleString()} - ${currency}${job.salary_max.toLocaleString()} ${interval}`;
    } else if (job.salary_min) {
      return `ab ${currency}${job.salary_min.toLocaleString()} ${interval}`;
    } else if (job.salary_max) {
      return `bis ${currency}${job.salary_max.toLocaleString()} ${interval}`;
    }
    return null;
  };

  if (loading) {
    return (
      <div className="max-w-4xl mx-auto p-6">
        <div className="animate-pulse space-y-6">
          <div className="h-8 bg-muted rounded w-2/3"></div>
          <div className="h-4 bg-muted rounded w-1/3"></div>
          <div className="space-y-3">
            {Array.from({ length: 8 }).map((_, i) => (
              <div key={i} className="h-4 bg-muted rounded"></div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  if (!job) {
    return (
      <div className="max-w-4xl mx-auto p-6 text-center">
        <h1 className="text-2xl font-bold mb-4">Stellenanzeige nicht gefunden</h1>
        <p className="text-muted-foreground">
          Die gewünschte Stellenanzeige ist nicht verfügbar oder wurde entfernt.
        </p>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto p-6 space-y-8">
      {/* Header */}
      <div className="space-y-4">
        <div className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
          <div className="space-y-2">
            <h1 className="text-3xl font-bold">{job.title}</h1>
            <div className="flex items-center gap-2 text-lg text-muted-foreground">
              <Building className="h-5 w-5" />
              <span>{job.company_name}</span>
            </div>
          </div>
          
          <div className="flex flex-col gap-2 md:items-end">
            <Button 
              size="lg"
              onClick={() => setShowApplicationModal(true)}
              className="w-full md:w-auto"
            >
              Jetzt bewerben
            </Button>
            <p className="text-sm text-muted-foreground text-center md:text-right">
              Bewerbung in nur 2 Minuten
            </p>
          </div>
        </div>

        {/* Job Meta Info */}
        <div className="flex flex-wrap gap-4 text-sm text-muted-foreground">
          {job.city && (
            <div className="flex items-center gap-2">
              <MapPin className="h-4 w-4" />
              <span>{job.city}{job.country && `, ${job.country}`}</span>
            </div>
          )}
          
          {formatSalary() && (
            <div className="flex items-center gap-2">
              <Euro className="h-4 w-4" />
              <span>{formatSalary()}</span>
            </div>
          )}
          
          <div className="flex items-center gap-2">
            <Clock className="h-4 w-4" />
            <span>Veröffentlicht am {new Date(job.published_at).toLocaleDateString('de-DE')}</span>
          </div>
        </div>

        {/* Badges */}
        <div className="flex flex-wrap gap-2">
          <Badge variant="secondary">{job.job_type}</Badge>
          <Badge variant="outline">{job.employment_type}</Badge>
          <Badge variant="outline">{job.work_mode}</Badge>
        </div>
      </div>

      <Separator />

      {/* Job Content */}
      <div className="space-y-8">
        {job.description_md && (
          <Card>
            <CardHeader>
              <CardTitle>Über die Position</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="prose prose-sm max-w-none">
                {job.description_md.split('\n').map((paragraph, index) => (
                  <p key={index} className="mb-4 last:mb-0">
                    {paragraph}
                  </p>
                ))}
              </div>
            </CardContent>
          </Card>
        )}

        {job.tasks_description && (
          <Card>
            <CardHeader>
              <CardTitle>Ihre Aufgaben</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="prose prose-sm max-w-none">
                {job.tasks_description.split('\n').map((task, index) => (
                  <p key={index} className="mb-4 last:mb-0">
                    {task}
                  </p>
                ))}
              </div>
            </CardContent>
          </Card>
        )}

        {job.requirements_description && (
          <Card>
            <CardHeader>
              <CardTitle>Das bringen Sie mit</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="prose prose-sm max-w-none">
                {job.requirements_description.split('\n').map((requirement, index) => (
                  <p key={index} className="mb-4 last:mb-0">
                    {requirement}
                  </p>
                ))}
              </div>
            </CardContent>
          </Card>
        )}
      </div>

      {/* CTA */}
      <Card>
        <CardContent className="p-6 text-center space-y-4">
          <h3 className="text-xl font-semibold">Interessiert?</h3>
          <p className="text-muted-foreground">
            Bewerben Sie sich jetzt mit nur wenigen Klicks – ohne langwierige Registrierung.
          </p>
          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <Button 
              size="lg"
              onClick={() => setShowApplicationModal(true)}
            >
              Jetzt bewerben
            </Button>
            {job.company_id && (
              <ShareJobButton 
                jobId={job.id} 
                orgId={job.company_id}
                size="lg"
                variant="outline"
              />
            )}
          </div>
        </CardContent>
      </Card>

      {/* Application Modal */}
      <Dialog open={showApplicationModal} onOpenChange={setShowApplicationModal}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>
              {applicationSuccess ? 'Bewerbung versendet!' : 'Schnell bewerben'}
            </DialogTitle>
          </DialogHeader>
          
          {applicationSuccess ? (
            <div className="space-y-4 text-center">
              <div className="text-green-600 text-4xl">✓</div>
              <p>Ihre Bewerbung wurde erfolgreich versendet!</p>
              <p className="text-sm text-muted-foreground">
                Das Unternehmen wird sich in Kürze bei Ihnen melden.
              </p>
            </div>
          ) : (
            <div className="space-y-4">
              <p className="text-sm text-muted-foreground">
                Füllen Sie die folgenden Felder aus, um sich zu bewerben:
              </p>
              
              <div className="space-y-3">
                <div>
                  <label className="text-sm font-medium">Name *</label>
                  <Input
                    placeholder="Vor- und Nachname"
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                    disabled={applying}
                  />
                </div>
                
                <div>
                  <label className="text-sm font-medium">E-Mail *</label>
                  <Input
                    type="email"
                    placeholder="ihre@email.de"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    disabled={applying}
                  />
                </div>
                
                <div>
                  <label className="text-sm font-medium">Telefon</label>
                  <Input
                    type="tel"
                    placeholder="Ihre Telefonnummer"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    disabled={applying}
                  />
                </div>
              </div>
            </div>
          )}
          
          <DialogFooter>
            {applicationSuccess ? (
              <Button onClick={() => {
                setShowApplicationModal(false);
                setApplicationSuccess(false);
                setFullName('');
                setEmail('');
                setPhone('');
              }}>
                Schließen
              </Button>
            ) : (
              <>
                <Button variant="outline" onClick={() => setShowApplicationModal(false)}>
                  Abbrechen
                </Button>
                <Button 
                  onClick={handleOneClickApply}
                  disabled={applying || !fullName.trim() || !email.trim()}
                >
                  {applying && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                  {applying ? 'Wird gesendet...' : 'Bewerbung senden'}
                </Button>
              </>
            )}
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}