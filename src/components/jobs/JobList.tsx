import React, { useState, useEffect, useRef } from 'react';
import { useInfiniteQuery } from '@tanstack/react-query';
import { JobCard } from './JobCard';
import { JobFilters } from './filters/JobFilters';
import { LoadingSkeleton } from '@/components/shared/LoadingSkeleton';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { searchOpenJobs, applyToJob, toggleSavedJob, toggleCompanyFollow, JobsSearchFilters } from '@/lib/api/jobsSearch';
import { trackJobSearchEvent } from '@/lib/telemetry';

interface JobListProps {
  candidateId: string;
}

export function JobList({ candidateId }: JobListProps) {
  const [filters, setFilters] = useState<JobsSearchFilters>({
    track: '',
    remote_only: false,
    benefits_any: [],
    shifts_any: [],
    contract_types: [],
    radius_km: 25,
    order_by: 'newest'
  });

  const loadMoreRef = useRef<HTMLDivElement>(null);

  const {
    data,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
    isLoading,
    error,
    refetch
  } = useInfiniteQuery({
    queryKey: ['jobs', candidateId, filters],
    queryFn: async ({ pageParam = 0 }) => {
      const result = await searchOpenJobs(candidateId, pageParam, 20, filters);
      return {
        jobs: result,
        nextCursor: result.length === 20 ? pageParam + 20 : undefined
      };
    },
    getNextPageParam: (lastPage) => lastPage.nextCursor,
    initialPageParam: 0
  });

  // Infinite scroll
  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting && hasNextPage && !isFetchingNextPage) {
          fetchNextPage();
          trackJobSearchEvent('load_more', { 
            candidateId, 
            page: Math.floor((data?.pages.length || 0) * 20 / 20)
          });
        }
      },
      { threshold: 0.1 }
    );

    if (loadMoreRef.current) {
      observer.observe(loadMoreRef.current);
    }

    return () => observer.disconnect();
  }, [hasNextPage, isFetchingNextPage, fetchNextPage, data?.pages.length, candidateId]);

  // Debounced filter changes
  useEffect(() => {
    const timeoutId = setTimeout(() => {
      trackJobSearchEvent('search', { candidateId, filters });
    }, 300);

    return () => clearTimeout(timeoutId);
  }, [filters, candidateId]);

  const handleApply = async (jobId: string) => {
    try {
      await applyToJob(candidateId, jobId);
      trackJobSearchEvent('apply', { candidateId, jobId });
      // Show success toast
    } catch (error) {
      console.error('Apply error:', error);
      // Show error toast
    }
  };

  const handleSave = async (jobId: string) => {
    try {
      await toggleSavedJob(candidateId, jobId);
      trackJobSearchEvent('save', { candidateId, jobId });
    } catch (error) {
      console.error('Save error:', error);
    }
  };

  const handleFollow = async (companyId: string) => {
    try {
      await toggleCompanyFollow(candidateId, companyId);
      trackJobSearchEvent('follow', { candidateId, companyId });
    } catch (error) {
      console.error('Follow error:', error);
    }
  };

  const allJobs = data?.pages.flatMap(page => page.jobs) || [];

  if (isLoading) {
    return (
      <div className="space-y-4">
        <JobFilters
          filters={filters}
          onFiltersChange={setFilters}
          hasLocation={true}
        />
        <LoadingSkeleton rows={6} />
      </div>
    );
  }

  if (error) {
    return (
      <Alert>
        <AlertDescription>
          Fehler beim Laden der Jobs: {error.message}
        </AlertDescription>
      </Alert>
    );
  }

  return (
    <div className="space-y-6">
      {/* Filters */}
      <JobFilters
        filters={filters}
        onFiltersChange={setFilters}
        hasLocation={true}
      />

      {/* Jobs List */}
      <div className="space-y-4">
        {allJobs.length === 0 ? (
          <div className="text-center py-12">
            <h3 className="text-lg font-medium text-gray-900 mb-2">
              Keine Jobs gefunden
            </h3>
            <p className="text-gray-600">
              Versuche andere Suchkriterien oder erweitere deinen Suchradius.
            </p>
          </div>
        ) : (
          allJobs.map((job) => (
            <JobCard
              key={job.id}
              job={job}
              candidateId={candidateId}
              onApply={handleApply}
              onSave={handleSave}
              onFollow={handleFollow}
            />
          ))
        )}
      </div>

      {/* Load More */}
      {hasNextPage && (
        <div ref={loadMoreRef} className="flex justify-center py-4">
          {isFetchingNextPage ? (
            <LoadingSkeleton rows={2} />
          ) : (
            <div className="text-gray-500">Scrollen zum Laden weiterer Jobs...</div>
          )}
        </div>
      )}
    </div>
  );
}
