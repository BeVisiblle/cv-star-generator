import React from 'react';
import { JobList } from '@/components/jobs/JobList';

export default function Jobs() {
  // In a real app, you'd get the candidate ID from auth context
  const candidateId = 'temp-candidate-id';

  return (
    <div className="max-w-4xl mx-auto p-6">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Jobsuche</h1>
        <p className="text-gray-600 mt-2">
          Finde passende Stellenangebote und bewerbe dich direkt.
        </p>
      </div>
      
      <JobList candidateId={candidateId} />
    </div>
  );
}
