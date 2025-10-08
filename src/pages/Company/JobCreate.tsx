import { useNavigate } from "react-router-dom";
import { useCompany } from "@/hooks/useCompany";
import { useCreateJob } from "@/hooks/useJobs";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { JobForm } from "@/components/jobs/JobForm";
import { ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function JobCreate() {
  const navigate = useNavigate();
  const { company } = useCompany();
  const createJob = useCreateJob(company?.id || '');

  const handleSubmit = async (data: any) => {
    await createJob.mutateAsync(data);
    navigate('/company/jobs');
  };

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
          <CardTitle>Neue Stellenanzeige erstellen</CardTitle>
        </CardHeader>
        <CardContent>
          <JobForm
            onSubmit={handleSubmit}
            onCancel={() => navigate('/company/jobs')}
            isLoading={createJob.isPending}
          />
        </CardContent>
      </Card>
    </div>
  );
}
