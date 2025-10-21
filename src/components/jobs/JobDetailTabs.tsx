import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { JobOverviewTab } from "./tabs/JobOverviewTab";
import { JobCandidatesTab } from "./tabs/JobCandidatesTab";
import { JobScheduleTab } from "./tabs/JobScheduleTab";
import { JobAnalyticsTab } from "./tabs/JobAnalyticsTab";
import { JobRemovedCandidatesTab } from "./tabs/JobRemovedCandidatesTab";
import { useEffect, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";

interface JobDetailTabsProps {
  job: any;
  company: any;
}

export function JobDetailTabs({ job, company }: JobDetailTabsProps) {
  const location = useLocation();
  const navigate = useNavigate();
  
  // Map URL tab parameter to actual tab value
  const tabMapping: Record<string, string> = {
    'bewerber': 'candidates',
    'kandidaten': 'candidates',
    'planung': 'schedule',
    'analytics': 'analytics',
    'archiv': 'removed',
    'overview': 'overview',
  };

  const [activeTab, setActiveTab] = useState<string>(() => {
    const params = new URLSearchParams(location.search);
    const tabParam = params.get('tab');
    return tabParam ? (tabMapping[tabParam] || 'overview') : 'overview';
  });

  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const tabParam = params.get('tab');
    if (tabParam) {
      const mappedTab = tabMapping[tabParam];
      if (mappedTab && mappedTab !== activeTab) {
        setActiveTab(mappedTab);
      }
    }
  }, [location.search]);

  const handleTabChange = (value: string) => {
    setActiveTab(value);
    // Optionally update URL
    const params = new URLSearchParams(location.search);
    const reverseMapping: Record<string, string> = {
      'candidates': 'bewerber',
      'schedule': 'planung',
      'analytics': 'analytics',
      'removed': 'archiv',
      'overview': 'overview',
    };
    if (reverseMapping[value]) {
      params.set('tab', reverseMapping[value]);
      navigate(`${location.pathname}?${params.toString()}`, { replace: true });
    }
  };

  return (
    <div className="mx-auto max-w-[1600px] px-6 py-6">
      <Tabs value={activeTab} onValueChange={handleTabChange} className="w-full">
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
