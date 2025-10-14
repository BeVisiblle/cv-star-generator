import { useParams } from "react-router-dom";
import { useJob } from "@/hooks/useJobs";
import { useCompany } from "@/hooks/useCompany";
import { JobDetailHeader } from "@/components/jobs/JobDetailHeader";
import { JobDetailTabs } from "@/components/jobs/JobDetailTabs";

export default function JobDetail() {
  const { id } = useParams<{ id: string }>();
  const { data: job, isLoading: jobLoading } = useJob(id);
  const { company, loading: companyLoading } = useCompany();

  if (jobLoading || companyLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
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
    <div className="min-h-screen bg-gray-50">
      <JobDetailHeader job={job} company={company} />
      <JobDetailTabs job={job} company={company} />
    </div>
  );
}
