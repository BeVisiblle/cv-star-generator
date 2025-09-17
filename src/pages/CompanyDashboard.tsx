import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { JobCreateWizard } from '@/components/jobs/JobCreateWizard';
import { JobList } from '@/components/jobs/JobList';
import { TopMatches } from '@/components/match/TopMatches';
import { createClient } from '@/lib/supabase';
import { Plus, Briefcase, Users, BarChart3 } from 'lucide-react';

interface Company {
  id: string;
  name: string;
  slug: string;
  industry: string;
  size_range: string;
}

interface Job {
  id: string;
  title: string;
  description: string;
  track: string;
  contract_type: string;
  is_active: boolean;
  created_at: string;
  quality_score: number;
}

export default function CompanyDashboard() {
  const [company, setCompany] = useState<Company | null>(null);
  const [jobs, setJobs] = useState<Job[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('overview');

  useEffect(() => {
    loadCompanyData();
  }, []);

  const loadCompanyData = async () => {
    try {
      const supabase = createClient();
      
      // Get current user's company
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      // Get company data
      const { data: companyData } = await supabase
        .from('company_users')
        .select(`
          company_id,
          companies (
            id,
            name,
            slug,
            industry,
            size_range
          )
        `)
        .eq('user_id', user.id)
        .single();

      if (companyData) {
        setCompany(companyData.companies);
        
        // Load company's jobs
        const { data: jobsData } = await supabase
          .from('jobs')
          .select('*')
          .eq('company_id', companyData.company_id)
          .order('created_at', { ascending: false });
        
        setJobs(jobsData || []);
      }
    } catch (error) {
      console.error('Error loading company data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleJobSave = async (jobData: any) => {
    try {
      const supabase = createClient();
      
      // Get current user's company
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const { data: companyUser } = await supabase
        .from('company_users')
        .select('company_id')
        .eq('user_id', user.id)
        .single();

      if (!companyUser) return;

      // Save job draft
      const { error } = await supabase
        .from('jobs')
        .insert({
          company_id: companyUser.company_id,
          title: jobData.title,
          description: jobData.description,
          track: jobData.track,
          contract_type: jobData.contract_type,
          is_remote: jobData.is_remote,
          salary_min: jobData.salary_min ? parseInt(jobData.salary_min) : null,
          salary_max: jobData.salary_max ? parseInt(jobData.salary_max) : null,
          benefits: jobData.benefits,
          is_active: false, // Draft
          min_experience_months: jobData.min_experience_months
        });

      if (error) throw error;

      // Reload jobs
      await loadCompanyData();
      
      alert('Job als Entwurf gespeichert!');
    } catch (error) {
      console.error('Error saving job:', error);
      alert('Fehler beim Speichern des Jobs');
    }
  };

  const handleJobPublish = async (jobData: any) => {
    try {
      const supabase = createClient();
      
      // Get current user's company
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const { data: companyUser } = await supabase
        .from('company_users')
        .select('company_id')
        .eq('user_id', user.id)
        .single();

      if (!companyUser) return;

      // Publish job
      const { error } = await supabase
        .from('jobs')
        .insert({
          company_id: companyUser.company_id,
          title: jobData.title,
          description: jobData.description,
          track: jobData.track,
          contract_type: jobData.contract_type,
          is_remote: jobData.is_remote,
          salary_min: jobData.salary_min ? parseInt(jobData.salary_min) : null,
          salary_max: jobData.salary_max ? parseInt(jobData.salary_max) : null,
          benefits: jobData.benefits,
          is_active: true, // Published
          min_experience_months: jobData.min_experience_months
        });

      if (error) throw error;

      // Reload jobs
      await loadCompanyData();
      
      alert('Job erfolgreich veröffentlicht!');
    } catch (error) {
      console.error('Error publishing job:', error);
      alert('Fehler beim Veröffentlichen des Jobs');
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 p-6">
        <div className="max-w-7xl mx-auto">
          <div className="animate-pulse">
            <div className="h-8 bg-gray-200 rounded w-1/3 mb-6"></div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {[1, 2, 3].map((i) => (
                <div key={i} className="h-32 bg-gray-200 rounded"></div>
              ))}
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (!company) {
    return (
      <div className="min-h-screen bg-gray-50 p-6">
        <div className="max-w-7xl mx-auto">
          <Card>
            <CardContent className="p-8 text-center">
              <h2 className="text-2xl font-bold mb-4">Kein Unternehmen gefunden</h2>
              <p className="text-gray-600 mb-6">
                Du bist noch keinem Unternehmen zugeordnet. Kontaktiere den Administrator.
              </p>
              <Button onClick={() => window.location.href = '/'}>
                Zurück zur Startseite
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">{company.name}</h1>
          <p className="text-gray-600 mt-2">
            {company.industry} • {company.size_range} Mitarbeiter
          </p>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center">
                <Briefcase className="h-8 w-8 text-blue-600" />
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">Aktive Jobs</p>
                  <p className="text-2xl font-bold text-gray-900">
                    {jobs.filter(job => job.is_active).length}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center">
                <Users className="h-8 w-8 text-green-600" />
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">Bewerbungen</p>
                  <p className="text-2xl font-bold text-gray-900">0</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center">
                <BarChart3 className="h-8 w-8 text-purple-600" />
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">Durchschnitt</p>
                  <p className="text-2xl font-bold text-gray-900">
                    {jobs.length > 0 ? 
                      (jobs.reduce((sum, job) => sum + (job.quality_score || 0), 0) / jobs.length * 100).toFixed(0) + '%' 
                      : '0%'
                    }
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center">
                <Plus className="h-8 w-8 text-orange-600" />
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">Entwürfe</p>
                  <p className="text-2xl font-bold text-gray-900">
                    {jobs.filter(job => !job.is_active).length}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Main Content */}
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="overview">Übersicht</TabsTrigger>
            <TabsTrigger value="jobs">Jobs</TabsTrigger>
            <TabsTrigger value="create">Job erstellen</TabsTrigger>
            <TabsTrigger value="matches">Matches</TabsTrigger>
          </TabsList>

          <TabsContent value="overview" className="mt-6">
            <Card>
              <CardHeader>
                <CardTitle>Willkommen bei {company.name}</CardTitle>
                <CardDescription>
                  Verwalte deine Stellenanzeigen und finde die besten Kandidaten
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <h3 className="font-semibold mb-4">Neueste Jobs</h3>
                    {jobs.slice(0, 3).map((job) => (
                      <div key={job.id} className="border rounded-lg p-4 mb-3">
                        <h4 className="font-medium">{job.title}</h4>
                        <p className="text-sm text-gray-600">{job.track}</p>
                        <p className="text-sm text-gray-500">
                          {job.is_active ? 'Aktiv' : 'Entwurf'} • 
                          Qualität: {(job.quality_score || 0) * 100}%
                        </p>
                      </div>
                    ))}
                  </div>
                  
                  <div>
                    <h3 className="font-semibold mb-4">Schnellaktionen</h3>
                    <div className="space-y-3">
                      <Button 
                        onClick={() => setActiveTab('create')}
                        className="w-full"
                      >
                        <Plus className="h-4 w-4 mr-2" />
                        Neuen Job erstellen
                      </Button>
                      <Button 
                        onClick={() => setActiveTab('matches')}
                        variant="outline"
                        className="w-full"
                      >
                        <Users className="h-4 w-4 mr-2" />
                        Top Matches ansehen
                      </Button>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="jobs" className="mt-6">
            <Card>
              <CardHeader>
                <CardTitle>Deine Jobs</CardTitle>
                <CardDescription>
                  Verwalte deine Stellenanzeigen
                </CardDescription>
              </CardHeader>
              <CardContent>
                {jobs.length === 0 ? (
                  <div className="text-center py-8">
                    <Briefcase className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                    <h3 className="text-lg font-medium text-gray-900 mb-2">Noch keine Jobs</h3>
                    <p className="text-gray-600 mb-4">Erstelle deinen ersten Job</p>
                    <Button onClick={() => setActiveTab('create')}>
                      <Plus className="h-4 w-4 mr-2" />
                      Job erstellen
                    </Button>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {jobs.map((job) => (
                      <div key={job.id} className="border rounded-lg p-4">
                        <div className="flex justify-between items-start">
                          <div>
                            <h3 className="font-semibold text-lg">{job.title}</h3>
                            <p className="text-gray-600">{job.track} • {job.contract_type}</p>
                            <p className="text-sm text-gray-500 mt-2">
                              Qualität: {(job.quality_score || 0) * 100}% • 
                              Erstellt: {new Date(job.created_at).toLocaleDateString('de-DE')}
                            </p>
                          </div>
                          <div className="flex items-center space-x-2">
                            <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                              job.is_active 
                                ? 'bg-green-100 text-green-800' 
                                : 'bg-yellow-100 text-yellow-800'
                            }`}>
                              {job.is_active ? 'Aktiv' : 'Entwurf'}
                            </span>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="create" className="mt-6">
            <Card>
              <CardHeader>
                <CardTitle>Neuen Job erstellen</CardTitle>
                <CardDescription>
                  Erstelle eine neue Stellenanzeige mit dem Job Wizard
                </CardDescription>
              </CardHeader>
              <CardContent>
                <JobCreateWizard 
                  onSave={handleJobSave}
                  onPublish={handleJobPublish}
                />
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="matches" className="mt-6">
            <Card>
              <CardHeader>
                <CardTitle>Top Matches</CardTitle>
                <CardDescription>
                  Finde die besten Kandidaten für deine Jobs
                </CardDescription>
              </CardHeader>
              <CardContent>
                {jobs.filter(job => job.is_active).length === 0 ? (
                  <div className="text-center py-8">
                    <Users className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                    <h3 className="text-lg font-medium text-gray-900 mb-2">Keine aktiven Jobs</h3>
                    <p className="text-gray-600 mb-4">Veröffentliche Jobs um Matches zu sehen</p>
                    <Button onClick={() => setActiveTab('create')}>
                      <Plus className="h-4 w-4 mr-2" />
                      Job erstellen
                    </Button>
                  </div>
                ) : (
                  <div className="space-y-6">
                    {jobs.filter(job => job.is_active).map((job) => (
                      <div key={job.id}>
                        <h3 className="font-semibold text-lg mb-4">{job.title}</h3>
                        <TopMatches jobId={job.id} />
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}