import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Plus, Briefcase, Settings, Archive, Eye } from "lucide-react";
import { useCompany } from "@/hooks/useCompany";
import JobCreationWizard from "@/components/company/jobs/JobCreationWizard";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { JobCard } from "@/components/public/JobCard";

export default function CompanyJobs() {
  const { company, loading: companyLoading } = useCompany();
  const [showJobPostDialog, setShowJobPostDialog] = useState(false);

  // Fetch company job posts
  const { data: jobPosts = [], isLoading, refetch } = useQuery({
    queryKey: ['company-job-posts', company?.id],
    queryFn: async () => {
      if (!company?.id) return [];
      
      const { data, error } = await supabase
        .from('job_posts')
        .select('*')
        .eq('company_id', company.id)
        .order('created_at', { ascending: false });

      if (error) throw error;
      return data || [];
    },
    enabled: !!company?.id
  });

  const activeJobs = jobPosts.filter(job => job.is_active);
  const inactiveJobs = jobPosts.filter(job => !job.is_active);
  const publicJobs = jobPosts.filter(job => job.is_public);

  const handleCreateJob = () => {
    setShowJobPostDialog(true);
  };

  const handleJobCreated = () => {
    refetch();
    setShowJobPostDialog(false);
  };

  if (companyLoading || isLoading) {
    return (
      <div className="flex items-center justify-center min-h-96">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (!company) {
    return (
      <div className="text-center py-12">
        <Briefcase className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
        <h2 className="text-xl font-semibold mb-2">Kein Unternehmen gefunden</h2>
      </div>
    );
  }

  return (
    <div className="p-3 md:p-6 min-h-screen bg-background space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Stellenanzeigen</h1>
          <p className="text-muted-foreground">
            Verwalten Sie Ihre Stellenausschreibungen und finden Sie passende Bewerber
          </p>
        </div>
        <Button onClick={handleCreateJob}>
          <Plus className="h-4 w-4 mr-2" />
          Neue Stellenanzeige erstellen
        </Button>
      </div>

      {/* Job Posts List */}
      <Tabs defaultValue="active" className="space-y-6">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="active" className="flex items-center gap-2">
            <Eye className="h-4 w-4" />
            Aktiv
            {activeJobs.length > 0 && (
              <Badge variant="outline" className="ml-1">
                {activeJobs.length}
              </Badge>
            )}
          </TabsTrigger>
          <TabsTrigger value="inactive" className="flex items-center gap-2">
            <Settings className="h-4 w-4" />
            Inaktiv
            {inactiveJobs.length > 0 && (
              <Badge variant="outline" className="ml-1">
                {inactiveJobs.length}
              </Badge>
            )}
          </TabsTrigger>
          <TabsTrigger value="public" className="flex items-center gap-2">
            <Archive className="h-4 w-4" />
            Öffentlich
            {publicJobs.length > 0 && (
              <Badge variant="outline" className="ml-1">
                {publicJobs.length}
              </Badge>
            )}
          </TabsTrigger>
        </TabsList>

        <TabsContent value="active" className="space-y-4">
          {activeJobs.length === 0 ? (
            <Card>
              <CardContent className="text-center py-8">
                <Briefcase className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                <h3 className="text-lg font-semibold mb-2">Noch keine aktiven Stellenanzeigen</h3>
                <p className="text-muted-foreground mb-4">
                  Erstellen Sie Ihre erste Stellenanzeige, um passende Kandidaten zu finden.
                </p>
                <Button onClick={handleCreateJob}>
                  <Plus className="h-4 w-4 mr-2" />
                  Erste Stellenanzeige erstellen
                </Button>
              </CardContent>
            </Card>
          ) : (
            <div className="grid gap-6">
              {activeJobs.map((job) => (
                <JobCard
                  key={job.id}
                  job={{
                    id: job.id,
                    title: job.title,
                    company_name: company.name || '',
                    city: job.city || '',
                    category: job.category,
                    work_mode: job.work_mode,
                    employment: job.employment,
                    salary_min: job.salary_min,
                    salary_max: job.salary_max,
                    salary_currency: job.salary_currency,
                    salary_interval: job.salary_interval,
                    published_at: job.created_at,
                    description_md: job.description_md,
                    slug: job.slug
                  }}
                />
              ))}
            </div>
          )}
        </TabsContent>

        <TabsContent value="inactive" className="space-y-4">
          {inactiveJobs.length === 0 ? (
            <Card>
              <CardContent className="text-center py-8">
                <Settings className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                <h3 className="text-lg font-semibold mb-2">Keine inaktiven Stellenanzeigen</h3>
                <p className="text-muted-foreground">
                  Inaktive Stellenanzeigen werden hier angezeigt.
                </p>
              </CardContent>
            </Card>
          ) : (
            <div className="grid gap-6">
              {inactiveJobs.map((job) => (
                <JobCard
                  key={job.id}
                  job={{
                    id: job.id,
                    title: job.title,
                    company_name: company.name || '',
                    city: job.city || '',
                    category: job.category,
                    work_mode: job.work_mode,
                    employment: job.employment,
                    salary_min: job.salary_min,
                    salary_max: job.salary_max,
                    salary_currency: job.salary_currency,
                    salary_interval: job.salary_interval,
                    published_at: job.created_at,
                    description_md: job.description_md,
                    slug: job.slug
                  }}
                />
              ))}
            </div>
          )}
        </TabsContent>

        <TabsContent value="public" className="space-y-4">
          {publicJobs.length === 0 ? (
            <Card>
              <CardContent className="text-center py-8">
                <Archive className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                <h3 className="text-lg font-semibold mb-2">Keine öffentlichen Stellenanzeigen</h3>
                <p className="text-muted-foreground">
                  Öffentlich sichtbare Stellenanzeigen werden hier angezeigt.
                </p>
              </CardContent>
            </Card>
          ) : (
            <div className="grid gap-6">
              {publicJobs.map((job) => (
                <JobCard
                  key={job.id}
                  job={{
                    id: job.id,
                    title: job.title,
                    company_name: company.name || '',
                    city: job.city || '',
                    category: job.category,
                    work_mode: job.work_mode,
                    employment: job.employment,
                    salary_min: job.salary_min,
                    salary_max: job.salary_max,
                    salary_currency: job.salary_currency,
                    salary_interval: job.salary_interval,
                    published_at: job.created_at,
                    description_md: job.description_md,
                    slug: job.slug
                  }}
                />
              ))}
            </div>
          )}
        </TabsContent>
      </Tabs>

      {/* Job Creation Wizard */}
      <JobCreationWizard
        open={showJobPostDialog}
        onOpenChange={setShowJobPostDialog}
        onJobCreated={handleJobCreated}
      />
    </div>
  );
}