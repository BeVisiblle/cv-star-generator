'use client';

import { useState, useEffect } from 'react';
import { useParams, useSearchParams } from 'next/navigation';
import { JobPreviewHeader } from '@/components/job-preview-header';
import { JobPreviewTabs } from '@/components/job-preview-tabs';
import { JobApplyDrawer } from '@/components/job-apply-drawer';
import { JobEditDrawer } from '@/components/job-edit-drawer';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { getMockJob } from '@/lib/mock';
import { Job, ViewerRole } from '@/lib/types';
import { useToast } from '@/hooks/use-toast';

export default function JobPreviewPage() {
  const params = useParams();
  const searchParams = useSearchParams();
  const { toast } = useToast();
  
  const [job, setJob] = useState<Job | null>(null);
  const [loading, setLoading] = useState(true);
  const [showApplyDrawer, setShowApplyDrawer] = useState(false);
  const [showEditDrawer, setShowEditDrawer] = useState(false);
  const [hasChanges, setHasChanges] = useState(false);
  
  const role = (searchParams.get('role') as ViewerRole) || 'user';
  const jobId = params.id as string;

  useEffect(() => {
    const fetchJob = async () => {
      setLoading(true);
      
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      const jobData = getMockJob(jobId);
      if (!jobData) {
        toast({
          title: "Job nicht gefunden",
          description: "Die angeforderte Stellenanzeige konnte nicht gefunden werden.",
          variant: "destructive",
        });
        return;
      }
      
      setJob(jobData);
      setLoading(false);
    };

    fetchJob();
  }, [jobId, toast]);

  const handleApply = () => {
    setShowApplyDrawer(true);
  };

  const handleEdit = () => {
    setShowEditDrawer(true);
  };

  const handlePreviewAsUser = () => {
    // In a real app, this would navigate to the user view
    window.open(`/jobs/${jobId}?role=user`, '_blank');
  };

  const handleSave = (updatedJob: Partial<Job>) => {
    setJob(prev => prev ? { ...prev, ...updatedJob } : null);
    setHasChanges(true);
  };

  const handleRepublish = () => {
    if (job) {
      setJob(prev => prev ? { 
        ...prev, 
        status: 'Published',
        postedAt: new Date().toISOString()
      } : null);
      setHasChanges(false);
      
      toast({
        title: "Job veröffentlicht",
        description: "Die Stellenanzeige wurde erfolgreich veröffentlicht.",
      });
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background">
        <div className="sticky top-0 z-10 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 border-b">
          <div className="max-w-6xl mx-auto px-4 py-4">
            <div className="flex items-start justify-between gap-4">
              <div className="flex items-start gap-4 min-w-0 flex-1">
                <Skeleton className="w-16 h-16 rounded-2xl" />
                <div className="min-w-0 flex-1">
                  <Skeleton className="h-8 w-3/4 mb-2" />
                  <Skeleton className="h-6 w-1/2 mb-3" />
                  <div className="flex items-center gap-3">
                    <Skeleton className="h-6 w-20" />
                    <Skeleton className="h-6 w-16" />
                    <Skeleton className="h-6 w-16" />
                  </div>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <Skeleton className="h-9 w-24" />
                <Skeleton className="h-9 w-24" />
              </div>
            </div>
          </div>
        </div>
        <div className="max-w-6xl mx-auto px-4 py-6">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="lg:col-span-2">
              <Skeleton className="h-96 w-full" />
            </div>
            <div className="space-y-6">
              <Skeleton className="h-32 w-full" />
              <Skeleton className="h-48 w-full" />
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (!job) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold mb-4">Job nicht gefunden</h1>
          <p className="text-muted-foreground mb-6">
            Die angeforderte Stellenanzeige konnte nicht gefunden werden.
          </p>
          <Button onClick={() => window.history.back()}>
            Zurück
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <JobPreviewHeader
        job={job}
        role={role}
        onApply={handleApply}
        onEdit={handleEdit}
        onPreviewAsUser={handlePreviewAsUser}
        onRepublish={handleRepublish}
        hasChanges={hasChanges}
      />
      
      <JobPreviewTabs job={job} />
      
      {/* Mobile Sticky CTA */}
      <div className="sticky bottom-0 z-10 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 border-t md:hidden">
        <div className="max-w-6xl mx-auto px-4 py-4">
          {role === "user" ? (
            <Button onClick={handleApply} className="w-full">
              Jetzt bewerben
            </Button>
          ) : (
            <Button onClick={handleEdit} className="w-full">
              Bearbeiten
            </Button>
          )}
        </div>
      </div>

      {/* Drawers */}
      <JobApplyDrawer
        open={showApplyDrawer}
        onOpenChange={setShowApplyDrawer}
        jobTitle={job.title}
        companyName={job.companyName}
      />
      
      <JobEditDrawer
        open={showEditDrawer}
        onOpenChange={setShowEditDrawer}
        job={job}
        onSave={handleSave}
        onRepublish={handleRepublish}
      />
    </div>
  );
}
