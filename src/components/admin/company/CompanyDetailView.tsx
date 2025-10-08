import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { CompanyOverview } from "./CompanyOverview";
import { PlanManager } from "./PlanManager";
import { SeatManager } from "./SeatManager";
import { CompanyActivityLog } from "./CompanyActivityLog";
import { CompanyJobsList } from "./CompanyJobsList";
import { CompanyNotesPanel } from "./CompanyNotesPanel";

interface CompanyDetailViewProps {
  companyId: string;
}

export function CompanyDetailView({ companyId }: CompanyDetailViewProps) {
  return (
    <Tabs defaultValue="overview" className="w-full">
      <TabsList className="grid w-full grid-cols-6">
        <TabsTrigger value="overview">Übersicht</TabsTrigger>
        <TabsTrigger value="plan">Plan & Tokens</TabsTrigger>
        <TabsTrigger value="team">Team</TabsTrigger>
        <TabsTrigger value="jobs">Stellen</TabsTrigger>
        <TabsTrigger value="activity">Aktivität</TabsTrigger>
        <TabsTrigger value="notes">Notizen</TabsTrigger>
      </TabsList>

      <TabsContent value="overview" className="space-y-4 mt-6">
        <CompanyOverview companyId={companyId} />
      </TabsContent>

      <TabsContent value="plan" className="space-y-4 mt-6">
        <PlanManager companyId={companyId} />
      </TabsContent>

      <TabsContent value="team" className="space-y-4 mt-6">
        <SeatManager companyId={companyId} />
      </TabsContent>

      <TabsContent value="jobs" className="space-y-4 mt-6">
        <CompanyJobsList companyId={companyId} />
      </TabsContent>

      <TabsContent value="activity" className="space-y-4 mt-6">
        <CompanyActivityLog companyId={companyId} />
      </TabsContent>

      <TabsContent value="notes" className="space-y-4 mt-6">
        <CompanyNotesPanel companyId={companyId} />
      </TabsContent>
    </Tabs>
  );
}
