import React from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import JobCompanyView from '@/components/Company/jobs/JobCompanyView';

export default function CompanyJobDetails() {
  const { jobId } = useParams<{ jobId: string }>();
  const navigate = useNavigate();

  const handleClose = () => {
    navigate('/company/jobs');
  };

  if (!jobId) {
    return (
      <div className="flex items-center justify-center min-h-96">
        <div className="text-center">
          <h2 className="text-xl font-semibold mb-2">Stellenanzeige nicht gefunden</h2>
          <p className="text-muted-foreground mb-4">Die angeforderte Stellenanzeige konnte nicht gefunden werden.</p>
          <button 
            onClick={handleClose}
            className="px-4 py-2 bg-primary text-primary-foreground rounded-md hover:bg-primary/90"
          >
            Zurück zu Stellenanzeigen
          </button>
        </div>
      </div>
    );
  }

  return (
    <JobCompanyView jobId={jobId} />
  );
}
