import { JobCard } from '@/components/job-card';
import { mockJobs } from '@/lib/mock';
import { ViewerRole } from '@/lib/types';

export default function JobsPage() {
  // In a real app, this would come from URL params or user context
  const role: ViewerRole = "user";

  return (
    <div className="min-h-screen bg-background">
      <div className="max-w-7xl mx-auto px-4 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold mb-2">Stellenanzeigen</h1>
          <p className="text-muted-foreground">
            Entdecken Sie spannende Jobmöglichkeiten
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {mockJobs.map((job) => (
            <JobCard key={job.id} job={job} role={role} />
          ))}
        </div>
      </div>
    </div>
  );
}
