import { useParams } from "react-router-dom";
import { useJob } from "@/hooks/useJobs";
import { useCompany } from "@/hooks/useCompany";
import { JobDetailHeader } from "@/components/jobs/JobDetailHeader";
import { JobDetailTabs } from "@/components/jobs/JobDetailTabs";

export default function JobDetail() {
  const { id } = useParams<{ id: string }>();
  const { data: job, isLoading: jobLoading, error: jobError } = useJob(id);
  const { company, loading: companyLoading } = useCompany();

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
      <JobDetailTabs job={job} company={company} />
    </div>
  );
}
