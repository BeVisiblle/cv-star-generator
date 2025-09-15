import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { MatchCard } from './MatchCard';
import { LoadingSkeleton } from '@/components/shared/LoadingSkeleton';
import { Button } from '@/components/ui/button';
import { RefreshCw } from 'lucide-react';
import { fetchTopMatches, refreshTopMatches } from '@/lib/api/companyMatching';
import { trackCompanyMatchingEvent } from '@/lib/telemetry';

interface TopMatchesProps {
  jobId: string;
}

export function TopMatches({ jobId }: TopMatchesProps) {
  const {
    data: matches,
    isLoading,
    error,
    refetch
  } = useQuery({
    queryKey: ['topmatches', jobId],
    queryFn: () => fetchTopMatches(jobId),
    refetchOnWindowFocus: false
  });

  const handleRefresh = async () => {
    try {
      trackCompanyMatchingEvent('refresh', { jobId });
      await refreshTopMatches(jobId);
      refetch();
    } catch (error) {
      console.error('Refresh error:', error);
    }
  };

  const handleUnlock = async (candidateId: string) => {
    try {
      trackCompanyMatchingEvent('unlock', { jobId, candidateId });
      // Implementation would go here
    } catch (error) {
      console.error('Unlock error:', error);
    }
  };

  const handleReject = async (candidateId: string, reason: string) => {
    try {
      trackCompanyMatchingEvent('reject', { jobId, candidateId, reason });
      // Implementation would go here
    } catch (error) {
      console.error('Reject error:', error);
    }
  };

  const handleSuppress = async (candidateId: string) => {
    try {
      trackCompanyMatchingEvent('suppress', { jobId, candidateId });
      // Implementation would go here
    } catch (error) {
      console.error('Suppress error:', error);
    }
  };

  if (isLoading) {
    return <LoadingSkeleton rows={3} />;
  }

  if (error) {
    return (
      <div className="text-center py-8">
        <p className="text-red-600 mb-4">Fehler beim Laden der Matches</p>
        <Button onClick={handleRefresh}>
          <RefreshCw className="w-4 h-4 mr-2" />
          Neu laden
        </Button>
      </div>
    );
  }

  if (!matches || matches.length === 0) {
    return (
      <div className="text-center py-12">
        <h3 className="text-lg font-medium text-gray-900 mb-2">
          Keine Matches verfügbar
        </h3>
        <p className="text-gray-600 mb-4">
          Lass die KI neue Kandidaten für diese Stelle finden.
        </p>
        <Button onClick={handleRefresh}>
          <RefreshCw className="w-4 h-4 mr-2" />
          Matches berechnen
        </Button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-lg font-semibold">
          Top {matches.length} Kandidaten
        </h2>
        <Button variant="outline" onClick={handleRefresh}>
          <RefreshCw className="w-4 h-4 mr-2" />
          Neuberechnung
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {matches.map((match) => (
          <MatchCard
            key={match.candidate_id}
            match={match}
            onUnlock={() => handleUnlock(match.candidate_id)}
            onReject={(reason) => handleReject(match.candidate_id, reason)}
            onSuppress={() => handleSuppress(match.candidate_id)}
          />
        ))}
      </div>
    </div>
  );
}
