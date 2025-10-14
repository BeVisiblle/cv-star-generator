import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { JobOverviewTab } from "./tabs/JobOverviewTab";
import { JobCandidatesTab } from "./tabs/JobCandidatesTab";
import { JobScheduleTab } from "./tabs/JobScheduleTab";
import { JobAnalyticsTab } from "./tabs/JobAnalyticsTab";
import { JobRemovedCandidatesTab } from "./tabs/JobRemovedCandidatesTab";

interface JobDetailTabsProps {
  job: any;
  company: any;
}

export function JobDetailTabs({ job, company }: JobDetailTabsProps) {
  return (
    <div className="max-w-[1600px] mx-auto px-6 py-6">
      <Tabs defaultValue="overview" className="w-full">
        <TabsList className="grid w-full max-w-3xl grid-cols-5 mb-6">
          <TabsTrigger value="overview">Übersicht</TabsTrigger>
          <TabsTrigger value="candidates">Kandidaten</TabsTrigger>
          <TabsTrigger value="schedule">Planung</TabsTrigger>
          <TabsTrigger value="analytics">Analytics</TabsTrigger>
          <TabsTrigger value="removed">Archiv</TabsTrigger>
        </TabsList>

        <TabsContent value="overview">
          <JobOverviewTab job={job} company={company} />
        </TabsContent>

        <TabsContent value="candidates">
          <JobCandidatesTab jobId={job.id} />
        </TabsContent>

        <TabsContent value="schedule">
          <JobScheduleTab />
        </TabsContent>

        <TabsContent value="analytics">
          <JobAnalyticsTab jobId={job.id} />
        </TabsContent>

        <TabsContent value="removed">
          <JobRemovedCandidatesTab jobId={job.id} />
        </TabsContent>
      </Tabs>
    </div>
  );
}
