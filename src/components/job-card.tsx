import Link from 'next/link';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { ArrowRight, MapPin, Building2, Clock, Euro } from 'lucide-react';
import { Job, ViewerRole } from '@/lib/types';
import { formatDate, formatSalary } from '@/lib/format';

interface JobCardProps {
  job: Job;
  role: ViewerRole;
}

export function JobCard({ job, role }: JobCardProps) {
  return (
    <Link 
      href={`/jobs/${job.id}?role=${role}`}
      className="block group"
      data-testid="job-card"
    >
      <Card className="rounded-2xl border border-border shadow-sm hover:shadow-md transition-all duration-200 hover:-translate-y-1 h-full">
        <CardContent className="p-6">
          <div className="flex items-start gap-4">
            {/* Company Logo */}
            <div className="flex-shrink-0">
              {job.companyLogoUrl ? (
                <img 
                  src={job.companyLogoUrl} 
                  alt={`${job.companyName} Logo`}
                  className="w-12 h-12 rounded-lg object-cover"
                />
              ) : (
                <div className="w-12 h-12 rounded-lg bg-muted flex items-center justify-center">
                  <Building2 className="h-6 w-6 text-muted-foreground" />
                </div>
              )}
            </div>

            {/* Job Content */}
            <div className="flex-1 min-w-0">
              <div className="flex items-start justify-between gap-2 mb-2">
                <div className="min-w-0 flex-1">
                  <h3 className="font-semibold text-lg leading-tight mb-1 group-hover:text-primary transition-colors">
                    {job.title}
                  </h3>
                  <p className="text-muted-foreground text-sm mb-2">
                    {job.companyName}
                  </p>
                </div>
                <ArrowRight className="h-5 w-5 text-muted-foreground group-hover:text-primary transition-colors flex-shrink-0" />
              </div>

              {/* Location and Employment Type */}
              <div className="flex items-center gap-2 mb-3">
                <div className="flex items-center gap-1 text-sm text-muted-foreground">
                  <MapPin className="h-4 w-4" />
                  <span>{job.location}</span>
                </div>
                <Badge variant="secondary" className="text-xs">
                  {job.employmentType}
                </Badge>
                {job.remote && (
                  <Badge variant="outline" className="text-xs">
                    Remote
                  </Badge>
                )}
              </div>

              {/* Salary */}
              {(job.salaryMin || job.salaryMax) && (
                <div className="flex items-center gap-1 text-sm text-muted-foreground mb-3">
                  <Euro className="h-4 w-4" />
                  <span>{formatSalary(job.salaryMin, job.salaryMax)}</span>
                </div>
              )}

              {/* Tags */}
              {job.tags && job.tags.length > 0 && (
                <div className="flex flex-wrap gap-1 mb-3">
                  {job.tags.slice(0, 3).map((tag, index) => (
                    <Badge key={index} variant="outline" className="text-xs">
                      {tag}
                    </Badge>
                  ))}
                  {job.tags.length > 3 && (
                    <Badge variant="outline" className="text-xs">
                      +{job.tags.length - 3}
                    </Badge>
                  )}
                </div>
              )}

              {/* Posted Date */}
              <div className="flex items-center gap-1 text-xs text-muted-foreground">
                <Clock className="h-3 w-3" />
                <span>{formatDate(job.postedAt)}</span>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </Link>
  );
}
