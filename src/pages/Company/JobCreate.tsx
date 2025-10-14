import { useNavigate } from "react-router-dom";
import { useCompany } from "@/hooks/useCompany";
import { useCreateJob } from "@/hooks/useJobs";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { JobFormProvider, useJobForm } from "@/contexts/JobFormContext";
import { JobFormWizard } from "@/components/jobs/wizard/JobFormWizard";
import { ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";

function JobCreateContent() {
  const navigate = useNavigate();
  const { company, loading } = useCompany();
  const createJob = useCreateJob(company?.id || '');
  const { formData } = useJobForm();

  const handleSubmit = async () => {
    if (!company?.id) {
      toast.error("Keine Firma gefunden. Bitte erstellen Sie zuerst ein Unternehmensprofil.");
      return;
    }
    await createJob.mutateAsync(formData);
    navigate('/company/jobs');
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (!company) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <p className="text-muted-foreground mb-4">Keine Firma gefunden</p>
          <Button onClick={() => navigate('/company/profile')}>
            Zum Unternehmensprofil
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
          <CardTitle>Neue Stellenanzeige erstellen</CardTitle>
        </CardHeader>
        <CardContent>
          <JobFormWizard
            onSubmit={handleSubmit}
            isLoading={createJob.isPending}
          />
        </CardContent>
      </Card>
    </div>
  );
}

export default function JobCreate() {
  return (
    <JobFormProvider>
      <JobCreateContent />
    </JobFormProvider>
  );
}
