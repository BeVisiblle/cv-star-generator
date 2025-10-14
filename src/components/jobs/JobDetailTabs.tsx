import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { JobCandidatesTab } from "./tabs/JobCandidatesTab";
import { JobListingDetailsTab } from "./tabs/JobListingDetailsTab";
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
      <Tabs defaultValue="candidates" className="w-full">
        <TabsList className="grid w-full max-w-2xl grid-cols-5 mb-6">
          <TabsTrigger value="candidates">Job candidates</TabsTrigger>
          <TabsTrigger value="details">Listing details</TabsTrigger>
          <TabsTrigger value="schedule">Schedule</TabsTrigger>
          <TabsTrigger value="analytics">Analytics</TabsTrigger>
          <TabsTrigger value="removed">Removed</TabsTrigger>
        </TabsList>

        <TabsContent value="candidates">
          <JobCandidatesTab jobId={job.id} />
        </TabsContent>

        <TabsContent value="details">
          <JobListingDetailsTab job={job} company={company} />
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
