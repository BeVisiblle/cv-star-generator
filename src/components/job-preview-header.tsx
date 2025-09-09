import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Building2, MapPin, Heart, Share2, Edit, Eye } from 'lucide-react';
import { Job, ViewerRole } from '@/lib/types';
import { formatDate } from '@/lib/format';

interface JobPreviewHeaderProps {
  job: Job;
  role: ViewerRole;
  onApply?: () => void;
  onEdit?: () => void;
  onPreviewAsUser?: () => void;
  onRepublish?: () => void;
  hasChanges?: boolean;
}

export function JobPreviewHeader({ 
  job, 
  role, 
  onApply, 
  onEdit, 
  onPreviewAsUser, 
  onRepublish,
  hasChanges = false 
}: JobPreviewHeaderProps) {
  return (
    <div className="sticky top-0 z-10 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 border-b">
      <div className="max-w-6xl mx-auto px-4 py-4">
        <div className="flex items-start justify-between gap-4">
          {/* Left: Job Info */}
          <div className="flex items-start gap-4 min-w-0 flex-1">
            {/* Company Logo */}
            <div className="flex-shrink-0">
              {job.companyLogoUrl ? (
                <img 
                  src={job.companyLogoUrl} 
                  alt={`${job.companyName} Logo`}
                  className="w-16 h-16 rounded-2xl object-cover"
                />
              ) : (
                <div className="w-16 h-16 rounded-2xl bg-muted flex items-center justify-center">
                  <Building2 className="h-8 w-8 text-muted-foreground" />
                </div>
              )}
            </div>

            {/* Job Details */}
            <div className="min-w-0 flex-1">
              <h1 className="text-2xl font-bold leading-tight mb-2">
                {job.title}
              </h1>
              <p className="text-lg text-muted-foreground mb-3">
                {job.companyName}
              </p>
              
              <div className="flex items-center gap-3 flex-wrap">
                <div className="flex items-center gap-1 text-muted-foreground">
                  <MapPin className="h-4 w-4" />
                  <span>{job.location}</span>
                </div>
                
                <Badge variant="secondary">
                  {job.employmentType}
                </Badge>
                
                {job.remote && (
                  <Badge variant="outline">
                    Remote
                  </Badge>
                )}
                
                <span className="text-sm text-muted-foreground">
                  {formatDate(job.postedAt)}
                </span>
              </div>
            </div>
          </div>

          {/* Right: Actions */}
          <div className="flex items-center gap-2 flex-shrink-0">
            {role === "user" ? (
              <>
                <Button variant="outline" size="sm">
                  <Heart className="h-4 w-4 mr-2" />
                  Merken
                </Button>
                <Button variant="outline" size="sm">
                  <Share2 className="h-4 w-4 mr-2" />
                  Teilen
                </Button>
                <Button onClick={onApply} size="sm">
                  Jetzt bewerben
                </Button>
              </>
            ) : (
              <>
                <Button variant="outline" size="sm" onClick={onPreviewAsUser}>
                  <Eye className="h-4 w-4 mr-2" />
                  Vorschau wie User
                </Button>
                <Button variant="outline" size="sm" onClick={onEdit}>
                  <Edit className="h-4 w-4 mr-2" />
                  Bearbeiten
                </Button>
                {(job.status === "Draft" || hasChanges) && (
                  <Button onClick={onRepublish} size="sm">
                    Neu veröffentlichen
                  </Button>
                )}
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
