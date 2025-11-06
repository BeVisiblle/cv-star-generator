import { useState } from "react";
import { useParams } from "react-router-dom";
import { useJob } from "@/hooks/useJobs";
import { useCompany } from "@/hooks/useCompany";
import { JobDetailHeader } from "@/components/jobs/JobDetailHeader";
import { JobApplicationTabs } from "@/components/jobs/JobApplicationTabs";
import { JobOverviewTab } from "@/components/jobs/JobOverviewTab";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

export default function JobDetail() {
  const { id } = useParams<{ id: string }>();
  const { data: job, isLoading: jobLoading, error: jobError } = useJob(id);
  const { company, loading: companyLoading } = useCompany();
  const [activeTab, setActiveTab] = useState("overview");

  console.log("JobDetail:", { id, job, jobLoading, jobError, company, companyLoading });

  if (jobLoading || companyLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (jobError) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <p className="text-red-500 mb-2">Fehler beim Laden</p>
          <p className="text-sm text-muted-foreground">{(jobError as Error).message}</p>
        </div>
      </div>
    );
  }

  if (!job) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <p className="text-muted-foreground">Stellenanzeige nicht gefunden</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <JobDetailHeader job={job} company={company} />
      
      {/* Main Tabs */}
      <div className="border-b bg-background sticky top-0 z-10">
        <div className="max-w-[1600px] mx-auto px-6">
          <Tabs value={activeTab} onValueChange={setActiveTab}>
            <TabsList className="h-12 bg-transparent border-b-0 w-full justify-start rounded-none">
              <TabsTrigger 
                value="overview" 
                className="data-[state=active]:border-b-2 data-[state=active]:border-primary rounded-none bg-transparent"
              >
                Übersicht
              </TabsTrigger>
              <TabsTrigger 
                value="candidates" 
                className="data-[state=active]:border-b-2 data-[state=active]:border-primary rounded-none bg-transparent"
              >
                Kandidaten
              </TabsTrigger>
              <TabsTrigger 
                value="analytics" 
                className="data-[state=active]:border-b-2 data-[state=active]:border-primary rounded-none bg-transparent"
              >
                Analytics
              </TabsTrigger>
              <TabsTrigger 
                value="settings" 
                className="data-[state=active]:border-b-2 data-[state=active]:border-primary rounded-none bg-transparent"
              >
                Planung
              </TabsTrigger>
            </TabsList>
          </Tabs>
        </div>
      </div>

      {/* Tab Content */}
      <div className="max-w-[1600px] mx-auto px-6 py-8">
        {activeTab === "overview" && <JobOverviewTab job={job} company={company} />}
        {activeTab === "candidates" && (
          <JobApplicationTabs 
            jobId={job.id} 
            companyId={company.id}
            job={{
              title: job.title,
              city: job.city,
              employment_type: job.employment_type,
              industry: job.industry,
            }}
          />
        )}
        {activeTab === "analytics" && (
          <div className="text-center py-12 text-muted-foreground">
            Analytics coming soon...
          </div>
        )}
        {activeTab === "settings" && (
          <div className="text-center py-12 text-muted-foreground">
            Planung coming soon...
          </div>
        )}
      </div>
    </div>
  );
}
