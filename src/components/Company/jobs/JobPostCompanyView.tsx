import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Eye, Users, MapPin, Clock, Euro, Briefcase, Calendar, Star, CheckCircle, XCircle, X } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useCompany } from '@/hooks/useCompany';
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
  is_active: boolean;
  is_public: boolean;
  is_draft: boolean;
  published_at?: string;
  created_at: string;
  skills?: any[];
  languages?: any[];
  internship_data?: any;
  apprenticeship_data?: any;
  professional_data?: any;
}

interface Application {
  id: string;
  user_id: string;
  status: string;
  cover_letter?: string;
  resume_url?: string;
  portfolio_url?: string;
  applied_at: string;
  viewed_by_company: boolean;
  viewed_at?: string;
  company_notes?: string;
  rejection_reason?: string;
  profiles: {
    id: string;
    vorname: string;
    nachname: string;
    full_name: string;
    avatar_url?: string;
    branche?: string;
    status?: string;
    ausbildungsberuf?: string;
    aktueller_beruf?: string;
  };
}

interface JobPostCompanyViewProps {
  jobId: string;
  onClose: () => void;
}

export default function JobPostCompanyView({ jobId, onClose }: JobPostCompanyViewProps) {
  const { company } = useCompany();
  const { toast } = useToast();
  const [jobPost, setJobPost] = useState<JobPost | null>(null);
  const [applications, setApplications] = useState<Application[]>([]);
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({
    totalViews: 0,
    totalApplications: 0,
    shortlisted: 0,
    rejected: 0
  });

  useEffect(() => {
    if (jobId) {
      loadJobPost();
      loadApplications();
      loadStats();
    }
  }, [jobId]);

  const loadJobPost = async () => {
    try {
      const { data, error } = await supabase
        .from('job_posts')
        .select('*')
        .eq('id', jobId)
        .eq('company_id', company?.id)
        .single();

      if (error) throw error;
      setJobPost(data);
    } catch (error: any) {
      console.error('Error loading job post:', error);
      toast({
        title: "Fehler",
        description: "Stellenanzeige konnte nicht geladen werden.",
        variant: "destructive"
      });
    }
  };

  const loadApplications = async () => {
    try {
      const { data, error } = await (supabase as any)
        .from('applications')
        .select(`
          *,
          profiles:user_id (
            id,
            vorname,
            nachname,
            full_name,
            avatar_url,
            branche,
            status,
            ausbildungsberuf,
            aktueller_beruf
          )
        `)
        .eq('job_post_id', jobId)
        .order('applied_at', { ascending: false });

      if (error) throw error;
      setApplications((data || []) as any);
    } catch (error: any) {
      console.error('Error loading applications:', error);
    }
  };

  const loadStats = async () => {
    try {
      // Load view statistics
      const { data: viewsData, error: viewsError } = await (supabase as any)
        .from('job_post_views')
        .select('id')
        .eq('job_post_id', jobId);

      if (viewsError) throw viewsError;

      // Load application statistics
      const { data: applicationsData, error: applicationsError } = await (supabase as any)
        .from('applications')
        .select('status')
        .eq('job_post_id', jobId);

      if (applicationsError) throw applicationsError;

      const shortlisted = applicationsData?.filter(app => app.status === 'shortlisted').length || 0;
      const rejected = applicationsData?.filter(app => app.status === 'rejected').length || 0;

      setStats({
        totalViews: viewsData?.length || 0,
        totalApplications: applicationsData?.length || 0,
        shortlisted,
        rejected
      });
    } catch (error: any) {
      console.error('Error loading stats:', error);
    }
  };

  const updateApplicationStatus = async (applicationId: string, status: string, notes?: string) => {
    try {
      const { error } = await supabase
        .from('applications')
        .update({
          status,
          company_notes: notes,
          viewed_by_company: true,
          viewed_at: new Date().toISOString()
        })
        .eq('id', applicationId);

      if (error) throw error;

      // Reload applications
      await loadApplications();
      await loadStats();

      toast({
        title: "Status aktualisiert",
        description: `Bewerbung wurde als ${status === 'shortlisted' ? 'in die engere Auswahl' : 'abgelehnt'} markiert.`
      });
    } catch (error: any) {
      console.error('Error updating application status:', error);
      toast({
        title: "Fehler",
        description: "Status konnte nicht aktualisiert werden.",
        variant: "destructive"
      });
    }
  };

  const toggleJobStatus = async () => {
    if (!jobPost) return;

    try {
      const { error } = await supabase
        .from('job_posts')
        .update({
          is_active: !jobPost.is_active,
          is_public: !jobPost.is_active ? true : jobPost.is_public
        })
        .eq('id', jobId);

      if (error) throw error;

      await loadJobPost();
      toast({
        title: "Status geändert",
        description: `Stellenanzeige wurde ${!jobPost.is_active ? 'aktiviert' : 'deaktiviert'}.`
      });
    } catch (error: any) {
      console.error('Error updating job status:', error);
      toast({
        title: "Fehler",
        description: "Status konnte nicht geändert werden.",
        variant: "destructive"
      });
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
          <p>Lade Stellenanzeige...</p>
        </div>
      </div>
    );
  }

  if (!jobPost) {
    return (
      <div className="text-center p-8">
        <p className="text-muted-foreground">Stellenanzeige nicht gefunden.</p>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Button variant="outline" onClick={onClose} className="flex items-center gap-2">
            <X className="h-4 w-4" />
            Zurück
          </Button>
          <div>
            <h1 className="text-2xl font-bold">{jobPost.title}</h1>
            <div className="flex items-center gap-2 mt-2">
              <Badge variant={jobPost.is_active ? "default" : "secondary"}>
                {jobPost.is_active ? "Aktiv" : "Inaktiv"}
              </Badge>
              <Badge variant={jobPost.is_public ? "default" : "outline"}>
                {jobPost.is_public ? "Öffentlich" : "Privat"}
              </Badge>
              {jobPost.is_draft && (
                <Badge variant="outline">Entwurf</Badge>
              )}
            </div>
          </div>
        </div>
        <div className="flex gap-2">
          <Button
            variant={jobPost.is_active ? "destructive" : "default"}
            onClick={toggleJobStatus}
          >
            {jobPost.is_active ? "Deaktivieren" : "Aktivieren"}
          </Button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <Eye className="h-4 w-4 text-blue-500" />
              <div>
                <p className="text-sm text-muted-foreground">Aufrufe</p>
                <p className="text-2xl font-bold">{stats.totalViews}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <Users className="h-4 w-4 text-green-500" />
              <div>
                <p className="text-sm text-muted-foreground">Bewerbungen</p>
                <p className="text-2xl font-bold">{stats.totalApplications}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <Star className="h-4 w-4 text-yellow-500" />
              <div>
                <p className="text-sm text-muted-foreground">Engere Auswahl</p>
                <p className="text-2xl font-bold">{stats.shortlisted}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <XCircle className="h-4 w-4 text-red-500" />
              <div>
                <p className="text-sm text-muted-foreground">Abgelehnt</p>
                <p className="text-2xl font-bold">{stats.rejected}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="preview" className="space-y-4">
        <TabsList>
          <TabsTrigger value="preview">Vorschau (User-Sicht)</TabsTrigger>
          <TabsTrigger value="applications">Bewerbungen ({applications.length})</TabsTrigger>
          <TabsTrigger value="analytics">Analytics</TabsTrigger>
        </TabsList>

        <TabsContent value="preview" className="space-y-4">
          {/* User View Preview */}
          <Card>
            <CardHeader>
              <CardTitle>So sehen User Ihre Stellenanzeige</CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Job Header */}
              <div className="space-y-4">
                <div className="flex items-start justify-between">
                  <div>
                    <h2 className="text-2xl font-bold">{jobPost.title}</h2>
                    <div className="flex items-center gap-4 mt-2 text-sm text-muted-foreground">
                      <div className="flex items-center gap-1">
                        <MapPin className="h-4 w-4" />
                        {jobPost.city}
                      </div>
                      <div className="flex items-center gap-1">
                        <Briefcase className="h-4 w-4" />
                        {jobPost.employment_type}
                      </div>
                      <div className="flex items-center gap-1">
                        <Clock className="h-4 w-4" />
                        {jobPost.work_mode}
                      </div>
                    </div>
                  </div>
                  <div className="text-right">
                    {jobPost.salary_min && jobPost.salary_max && (
                      <div className="text-lg font-semibold">
                        {jobPost.salary_min / 100} - {jobPost.salary_max / 100} {jobPost.salary_currency}
                        <span className="text-sm text-muted-foreground"> / {jobPost.salary_interval}</span>
                      </div>
                    )}
                  </div>
                </div>
              </div>

              {/* Job Description */}
              <div className="space-y-4">
                <div>
                  <h3 className="text-lg font-semibold mb-2">Beschreibung</h3>
                  <div className="prose max-w-none">
                    {jobPost.description_md ? (
                      <div dangerouslySetInnerHTML={{ __html: jobPost.description_md }} />
                    ) : (
                      <p className="text-muted-foreground">Keine Beschreibung verfügbar</p>
                    )}
                  </div>
                </div>

                {jobPost.tasks_description && (
                  <div>
                    <h3 className="text-lg font-semibold mb-2">Aufgaben</h3>
                    <p className="text-muted-foreground">{jobPost.tasks_description}</p>
                  </div>
                )}

                {jobPost.requirements_description && (
                  <div>
                    <h3 className="text-lg font-semibold mb-2">Anforderungen</h3>
                    <p className="text-muted-foreground">{jobPost.requirements_description}</p>
                  </div>
                )}

                {jobPost.benefits_description && (
                  <div>
                    <h3 className="text-lg font-semibold mb-2">Vorteile</h3>
                    <p className="text-muted-foreground">{jobPost.benefits_description}</p>
                  </div>
                )}
              </div>

              {/* Contact Information */}
              {jobPost.contact_person_name && (
                <div className="border-t pt-4">
                  <h3 className="text-lg font-semibold mb-2">Kontakt</h3>
                  <div className="space-y-1">
                    <p><strong>Ansprechpartner:</strong> {jobPost.contact_person_name}</p>
                    {jobPost.contact_person_email && (
                      <p><strong>E-Mail:</strong> {jobPost.contact_person_email}</p>
                    )}
                    {jobPost.contact_person_phone && (
                      <p><strong>Telefon:</strong> {jobPost.contact_person_phone}</p>
                    )}
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="applications" className="space-y-4">
          {/* Applications List */}
          <div className="space-y-4">
            {applications.length === 0 ? (
              <Card>
                <CardContent className="p-8 text-center">
                  <Users className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
                  <h3 className="text-lg font-semibold mb-2">Noch keine Bewerbungen</h3>
                  <p className="text-muted-foreground">
                    Sobald sich Kandidaten auf diese Stelle bewerben, erscheinen sie hier.
                  </p>
                </CardContent>
              </Card>
            ) : (
              applications.map((application) => (
                <Card key={application.id}>
                  <CardContent className="p-6">
                    <div className="flex items-start justify-between">
                      <div className="flex items-start gap-4">
                        <div className="w-12 h-12 rounded-full bg-muted flex items-center justify-center">
                          {application.profiles.avatar_url ? (
                            <img
                              src={application.profiles.avatar_url}
                              alt={application.profiles.full_name}
                              className="w-12 h-12 rounded-full object-cover"
                            />
                          ) : (
                            <span className="text-lg font-semibold">
                              {application.profiles.full_name?.charAt(0)}
                            </span>
                          )}
                        </div>
                        <div className="space-y-1">
                          <h3 className="text-lg font-semibold">{application.profiles.full_name}</h3>
                          <div className="flex items-center gap-4 text-sm text-muted-foreground">
                            <span>{application.profiles.branche}</span>
                            <span>{application.profiles.status}</span>
                            {application.profiles.ausbildungsberuf && (
                              <span>{application.profiles.ausbildungsberuf}</span>
                            )}
                            {application.profiles.aktueller_beruf && (
                              <span>{application.profiles.aktueller_beruf}</span>
                            )}
                          </div>
                          <div className="flex items-center gap-2">
                            <Badge variant={
                              application.status === 'shortlisted' ? 'default' :
                              application.status === 'rejected' ? 'destructive' :
                              'secondary'
                            }>
                              {application.status === 'shortlisted' ? 'Engere Auswahl' :
                               application.status === 'rejected' ? 'Abgelehnt' :
                               'Beworben'}
                            </Badge>
                            <span className="text-xs text-muted-foreground">
                              Beworben am {new Date(application.applied_at).toLocaleDateString('de-DE')}
                            </span>
                          </div>
                        </div>
                      </div>
                      <div className="flex gap-2">
                        {application.status === 'applied' && (
                          <>
                            <Button
                              size="sm"
                              onClick={() => updateApplicationStatus(application.id, 'shortlisted')}
                            >
                              <CheckCircle className="h-4 w-4 mr-1" />
                              Auswählen
                            </Button>
                            <Button
                              size="sm"
                              variant="destructive"
                              onClick={() => updateApplicationStatus(application.id, 'rejected')}
                            >
                              <XCircle className="h-4 w-4 mr-1" />
                              Ablehnen
                            </Button>
                          </>
                        )}
                        {application.status === 'shortlisted' && (
                          <Button
                            size="sm"
                            variant="destructive"
                            onClick={() => updateApplicationStatus(application.id, 'rejected')}
                          >
                            <XCircle className="h-4 w-4 mr-1" />
                            Ablehnen
                          </Button>
                        )}
                      </div>
                    </div>
                    
                    {application.cover_letter && (
                      <div className="mt-4 p-4 bg-muted rounded-lg">
                        <h4 className="font-semibold mb-2">Anschreiben</h4>
                        <p className="text-sm text-muted-foreground">{application.cover_letter}</p>
                      </div>
                    )}
                  </CardContent>
                </Card>
              ))
            )}
          </div>
        </TabsContent>

        <TabsContent value="analytics" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Analytics</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <h3 className="font-semibold mb-2">Aufrufe</h3>
                  <p className="text-2xl font-bold">{stats.totalViews}</p>
                </div>
                <div>
                  <h3 className="font-semibold mb-2">Bewerbungen</h3>
                  <p className="text-2xl font-bold">{stats.totalApplications}</p>
                </div>
                <div>
                  <h3 className="font-semibold mb-2">Engere Auswahl</h3>
                  <p className="text-2xl font-bold text-yellow-600">{stats.shortlisted}</p>
                </div>
                <div>
                  <h3 className="font-semibold mb-2">Abgelehnt</h3>
                  <p className="text-2xl font-bold text-red-600">{stats.rejected}</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
