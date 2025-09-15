import React from 'react';
import { TopMatches } from '@/components/match/TopMatches';

export default function CompanyMatches() {
  // In a real app, you'd get the job ID from route params or context
  const jobId = 'temp-job-id';

  return (
    <div className="max-w-6xl mx-auto p-6">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Top-Matches</h1>
        <p className="text-gray-600 mt-2">
          KI-gestützte Kandidatenempfehlungen für deine Stellenanzeige.
        </p>
      </div>
      
      <TopMatches jobId={jobId} />
    </div>
  );
}
