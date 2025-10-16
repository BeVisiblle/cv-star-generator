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
    <div className="mx-auto max-w-[1600px] px-6 py-6">
      <Tabs defaultValue="overview" className="w-full">
        <TabsList className="mb-6 inline-flex h-10 w-full max-w-3xl items-center justify-start rounded-none border-b bg-transparent p-0">
          <TabsTrigger
            value="overview"
            className="rounded-none border-b-2 border-transparent bg-transparent px-4 pb-3 pt-2 font-medium text-muted-foreground transition-all data-[state=active]:border-primary data-[state=active]:bg-transparent data-[state=active]:text-primary hover:text-foreground"
          >
            Übersicht
          </TabsTrigger>
          <TabsTrigger
            value="candidates"
            className="rounded-none border-b-2 border-transparent bg-transparent px-4 pb-3 pt-2 font-medium text-muted-foreground transition-all data-[state=active]:border-primary data-[state=active]:bg-transparent data-[state=active]:text-primary hover:text-foreground"
          >
            Kandidaten
          </TabsTrigger>
          <TabsTrigger
            value="schedule"
            className="rounded-none border-b-2 border-transparent bg-transparent px-4 pb-3 pt-2 font-medium text-muted-foreground transition-all data-[state=active]:border-primary data-[state=active]:bg-transparent data-[state=active]:text-primary hover:text-foreground"
          >
            Planung
          </TabsTrigger>
          <TabsTrigger
            value="analytics"
            className="rounded-none border-b-2 border-transparent bg-transparent px-4 pb-3 pt-2 font-medium text-muted-foreground transition-all data-[state=active]:border-primary data-[state=active]:bg-transparent data-[state=active]:text-primary hover:text-foreground"
          >
            Analytics
          </TabsTrigger>
          <TabsTrigger
            value="removed"
            className="rounded-none border-b-2 border-transparent bg-transparent px-4 pb-3 pt-2 font-medium text-muted-foreground transition-all data-[state=active]:border-primary data-[state=active]:bg-transparent data-[state=active]:text-primary hover:text-foreground"
          >
            Archiv
          </TabsTrigger>
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
