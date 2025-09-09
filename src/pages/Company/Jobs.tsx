import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Plus, Briefcase, Settings, Archive, Eye, Save } from "lucide-react";
import { useCompany } from "@/hooks/useCompany";
import JobCreationWizard from "@/components/company/jobs/JobCreationWizard";
import { TokenStatus } from "@/components/Company/TokenStatus";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { CompanyJobCard } from "@/components/company/CompanyJobCard";

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

  const activeJobs = jobPosts.filter(job => job.is_active && job.is_public);
  const draftJobs = jobPosts.filter(job => !job.is_active);
  const inactiveJobs = jobPosts.filter(job => !job.is_public);

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

      {/* Token Status */}
      <TokenStatus />

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
          <TabsTrigger value="drafts" className="flex items-center gap-2">
            <Save className="h-4 w-4" />
            Entwürfe
            {draftJobs.length > 0 && (
              <Badge variant="outline" className="ml-1">
                {draftJobs.length}
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
                <CompanyJobCard
                  key={job.id}
                  job={job}
                  companyName={company.name || ''}
                  onJobUpdated={refetch}
                />
              ))}
            </div>
          )}
        </TabsContent>

        <TabsContent value="drafts" className="space-y-4">
          {draftJobs.length === 0 ? (
            <Card>
              <CardContent className="text-center py-8">
                <Save className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                <h3 className="text-lg font-semibold mb-2">Keine Entwürfe</h3>
                <p className="text-muted-foreground mb-4">
                  Speichern Sie Ihre Stellenanzeigen als Entwurf, um sie später zu bearbeiten.
                </p>
                <Button onClick={handleCreateJob}>
                  <Plus className="h-4 w-4 mr-2" />
                  Neue Stellenanzeige erstellen
                </Button>
              </CardContent>
            </Card>
          ) : (
            <div className="grid gap-6">
              {draftJobs.map((job) => (
                <CompanyJobCard
                  key={job.id}
                  job={job}
                  companyName={company.name || ''}
                  onJobUpdated={refetch}
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
                <CompanyJobCard
                  key={job.id}
                  job={job}
                  companyName={company.name || ''}
                  onJobUpdated={refetch}
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