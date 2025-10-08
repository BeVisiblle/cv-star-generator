import { useNavigate, useParams } from "react-router-dom";
import { useCompany } from "@/hooks/useCompany";
import { useJob, useUpdateJob } from "@/hooks/useJobs";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { JobForm } from "@/components/jobs/JobForm";
import { ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function JobEdit() {
  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>();
  const { company } = useCompany();
  const { data: job, isLoading } = useJob(id);
  const updateJob = useUpdateJob();

  const handleSubmit = async (data: any) => {
    if (!id) return;
    await updateJob.mutateAsync({ jobId: id, updates: data });
    navigate('/company/jobs');
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (!job) {
    return (
      <div className="px-3 sm:px-6 py-6 max-w-[1000px] mx-auto">
        <div className="text-center">
          <p className="text-muted-foreground">Stellenanzeige nicht gefunden</p>
          <Button onClick={() => navigate('/company/jobs')} className="mt-4">
            Zurück zur Übersicht
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="px-3 sm:px-6 py-6 max-w-[1000px] mx-auto">
      <Button
        variant="ghost"
        onClick={() => navigate('/company/jobs')}
        className="mb-4"
      >
        <ArrowLeft className="h-4 w-4 mr-2" />
        Zurück
      </Button>

      <Card>
        <CardHeader>
          <CardTitle>Stellenanzeige bearbeiten</CardTitle>
        </CardHeader>
        <CardContent>
          <JobForm
            initialData={job}
            onSubmit={handleSubmit}
            onCancel={() => navigate('/company/jobs')}
            isLoading={updateJob.isPending}
          />
        </CardContent>
      </Card>
    </div>
  );
}
