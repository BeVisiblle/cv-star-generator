import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Search, Filter, Briefcase, Clock, Star, XCircle, CheckCircle } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import JobApplicationCard from '@/components/User/JobApplicationCard';

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
  job_posts: {
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
  };
}

export default function Applications() {
  const { toast } = useToast();
  const [applications, setApplications] = useState<Application[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');

  useEffect(() => {
    loadApplications();
  }, []);

  const loadApplications = async () => {
    try {
      setLoading(true);
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const { data, error } = await supabase
        .from('applications')
        .select(`
          *,
          job_posts:job_post_id (
            *,
            companies:company_id (
              id,
              name,
              logo_url
            )
          )
        `)
        .eq('user_id', user.id)
        .order('applied_at', { ascending: false });

      if (error) throw error;
      setApplications((data || []) as any);
    } catch (error: any) {
      console.error('Error loading applications:', error);
      toast({
        title: "Fehler",
        description: "Bewerbungen konnten nicht geladen werden.",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const filteredApplications = applications.filter(app => {
    const matchesSearch = app.job_posts.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         app.job_posts.companies.name.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === 'all' || app.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const getStatusCounts = () => {
    const counts = {
      all: applications.length,
      applied: 0,
      shortlisted: 0,
      rejected: 0,
      hired: 0,
      withdrawn: 0
    };

    applications.forEach(app => {
      counts[app.status as keyof typeof counts]++;
    });

    return counts;
  };

  const statusCounts = getStatusCounts();

  if (loading) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
          <p>Lade Bewerbungen...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto p-6 space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Meine Bewerbungen</h1>
        <p className="text-muted-foreground mt-2">
          Verwalten Sie Ihre Bewerbungen und verfolgen Sie den Status
        </p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <Briefcase className="h-4 w-4 text-blue-500" />
              <div>
                <p className="text-sm text-muted-foreground">Gesamt</p>
                <p className="text-2xl font-bold">{statusCounts.all}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <Clock className="h-4 w-4 text-yellow-500" />
              <div>
                <p className="text-sm text-muted-foreground">Beworben</p>
                <p className="text-2xl font-bold">{statusCounts.applied}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <Star className="h-4 w-4 text-green-500" />
              <div>
                <p className="text-sm text-muted-foreground">Engere Auswahl</p>
                <p className="text-2xl font-bold">{statusCounts.shortlisted}</p>
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
                <p className="text-2xl font-bold">{statusCounts.rejected}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <CheckCircle className="h-4 w-4 text-green-600" />
              <div>
                <p className="text-sm text-muted-foreground">Angenommen</p>
                <p className="text-2xl font-bold">{statusCounts.hired}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Search and Filter */}
      <Card>
        <CardContent className="p-4">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Nach Stellenanzeigen oder Unternehmen suchen..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
            <div className="flex gap-2">
              <Button
                variant={statusFilter === 'all' ? 'default' : 'outline'}
                size="sm"
                onClick={() => setStatusFilter('all')}
              >
                Alle ({statusCounts.all})
              </Button>
              <Button
                variant={statusFilter === 'applied' ? 'default' : 'outline'}
                size="sm"
                onClick={() => setStatusFilter('applied')}
              >
                Beworben ({statusCounts.applied})
              </Button>
              <Button
                variant={statusFilter === 'shortlisted' ? 'default' : 'outline'}
                size="sm"
                onClick={() => setStatusFilter('shortlisted')}
              >
                Auswahl ({statusCounts.shortlisted})
              </Button>
              <Button
                variant={statusFilter === 'rejected' ? 'default' : 'outline'}
                size="sm"
                onClick={() => setStatusFilter('rejected')}
              >
                Abgelehnt ({statusCounts.rejected})
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Applications List */}
      <div className="space-y-4">
        {filteredApplications.length === 0 ? (
          <Card>
            <CardContent className="p-8 text-center">
              <Briefcase className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
              <h3 className="text-lg font-semibold mb-2">
                {searchTerm || statusFilter !== 'all' ? 'Keine Bewerbungen gefunden' : 'Noch keine Bewerbungen'}
              </h3>
              <p className="text-muted-foreground">
                {searchTerm || statusFilter !== 'all' 
                  ? 'Versuchen Sie andere Suchbegriffe oder Filter.'
                  : 'Bewerben Sie sich auf interessante Stellenanzeigen, um sie hier zu verfolgen.'
                }
              </p>
            </CardContent>
          </Card>
        ) : (
          filteredApplications.map((application) => (
            <JobApplicationCard
              key={application.id}
              application={application}
              onStatusUpdate={loadApplications}
            />
          ))
        )}
      </div>
    </div>
  );
}
