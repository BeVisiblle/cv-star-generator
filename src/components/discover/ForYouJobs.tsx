import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { JobCard } from '@/components/jobs/JobCard';
import { LoadingSkeleton } from '@/components/shared/LoadingSkeleton';
import { Button } from '@/components/ui/button';
import { RefreshCw } from 'lucide-react';
import { fetchForYou, refreshForYou } from '@/lib/api/matching';
import { buildWhyBullets } from '@/utils/whyBullets';
import { trackForYouEvent } from '@/lib/telemetry';

interface ForYouJobsProps {
  candidateId: string;
}

export function ForYouJobs({ candidateId }: ForYouJobsProps) {
  const {
    data: jobs,
    isLoading,
    error,
    refetch
  } = useQuery({
    queryKey: ['foryou', candidateId],
    queryFn: () => fetchForYou(candidateId),
    refetchOnWindowFocus: false
  });

  const handleRefresh = async () => {
    try {
      trackForYouEvent('refresh', { candidateId });
      await refreshForYou(candidateId);
      refetch();
    } catch (error) {
      console.error('Refresh error:', error);
    }
  };

  const handleApply = async (jobId: string) => {
    // Implementation would go here
    trackForYouEvent('apply', { candidateId, jobId });
  };

  if (isLoading) {
    return <LoadingSkeleton rows={5} />;
  }

  if (error) {
    return (
      <div className="text-center py-8">
        <p className="text-red-600 mb-4">Fehler beim Laden der Empfehlungen</p>
        <Button onClick={handleRefresh}>
          <RefreshCw className="w-4 h-4 mr-2" />
          Neu laden
        </Button>
      </div>
    );
  }

  if (!jobs || jobs.length === 0) {
    return (
      <div className="text-center py-12">
        <h3 className="text-lg font-medium text-gray-900 mb-2">
          Keine Empfehlungen verfügbar
        </h3>
        <p className="text-gray-600 mb-4">
          Vervollständige dein Profil, um personalisierte Jobempfehlungen zu erhalten.
        </p>
        <Button onClick={handleRefresh}>
          <RefreshCw className="w-4 h-4 mr-2" />
          Empfehlungen aktualisieren
        </Button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-lg font-semibold">
          {jobs.length} personalisierte Empfehlungen
        </h2>
        <Button variant="outline" onClick={handleRefresh}>
          <RefreshCw className="w-4 h-4 mr-2" />
          Aktualisieren
        </Button>
      </div>

      <div className="space-y-4">
        {jobs.map((job) => (
          <div key={job.id} className="relative">
            <JobCard
              job={job}
              candidateId={candidateId}
              onApply={handleApply}
            />
            
            {/* Why bullets */}
            {job.explanation && (
              <div className="mt-3 p-3 bg-blue-50 rounded-md">
                <h4 className="text-sm font-medium text-blue-900 mb-2">
                  Warum passt dieser Job zu dir?
                </h4>
                <ul className="space-y-1">
                  {buildWhyBullets(job.explanation).map((bullet, index) => (
                    <li key={index} className="text-sm text-blue-800">
                      • {bullet}
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
