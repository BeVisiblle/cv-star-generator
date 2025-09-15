import React from 'react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { MapPin, Clock, Building2, Heart, Share2 } from 'lucide-react';
import { ScoreBadge } from '@/components/matching/ScoreBadge';
import { trackJobCardEvent } from '@/lib/telemetry';

interface JobCardProps {
  job: {
    id: string;
    title: string;
    company_id: string;
    track: string;
    contract_type: string;
    is_remote: boolean;
    location?: string;
    distance_km?: number;
    benefits: string[];
    created_at: string;
    explanation?: any;
    has_explanation: boolean;
  };
  candidateId: string;
  onApply: (jobId: string) => Promise<void>;
  onSave?: (jobId: string) => Promise<void>;
  onFollow?: (companyId: string) => Promise<void>;
  isApplied?: boolean;
  isSaved?: boolean;
  isFollowing?: boolean;
}

export function JobCard({
  job,
  candidateId,
  onApply,
  onSave,
  onFollow,
  isApplied = false,
  isSaved = false,
  isFollowing = false
}: JobCardProps) {
  const handleApply = async () => {
    try {
      await onApply(job.id);
      trackJobCardEvent('apply', { jobId: job.id, track: job.track });
    } catch (error) {
      console.error('Apply error:', error);
    }
  };

  const handleSave = async () => {
    if (onSave) {
      try {
        await onSave(job.id);
        trackJobCardEvent('save', { jobId: job.id, saved: !isSaved });
      } catch (error) {
        console.error('Save error:', error);
      }
    }
  };

  const handleFollow = async () => {
    if (onFollow) {
      try {
        await onFollow(job.company_id);
        trackJobCardEvent('follow', { companyId: job.company_id, following: !isFollowing });
      } catch (error) {
        console.error('Follow error:', error);
      }
    }
  };

  return (
    <div className="bg-white rounded-lg border p-4 hover:shadow-md transition-shadow">
      {/* Header */}
      <div className="flex items-start justify-between mb-3">
        <div className="flex-1">
          <h3 className="font-semibold text-lg text-gray-900 mb-1">
            {job.title}
          </h3>
          <div className="flex items-center gap-2 text-sm text-gray-600">
            <Building2 className="w-4 h-4" />
            <span>Unternehmen</span>
          </div>
        </div>
        {job.has_explanation && job.explanation && (
          <ScoreBadge
            score={job.explanation.score}
            subs={job.explanation.subs}
            weights={job.explanation.weights}
          />
        )}
      </div>

      {/* Badges */}
      <div className="flex flex-wrap gap-2 mb-3">
        <Badge variant="secondary">{job.track}</Badge>
        <Badge variant="outline">{job.contract_type}</Badge>
        {job.is_remote && (
          <Badge variant="outline">Remote</Badge>
        )}
      </div>

      {/* Location & Distance */}
      <div className="flex items-center gap-4 text-sm text-gray-600 mb-3">
        <div className="flex items-center gap-1">
          <MapPin className="w-4 h-4" />
          <span>{job.location || 'Standort nicht angegeben'}</span>
        </div>
        {job.distance_km && (
          <span>~{Math.round(job.distance_km)} km</span>
        )}
      </div>

      {/* Benefits */}
      {job.benefits.length > 0 && (
        <div className="mb-4">
          <div className="flex flex-wrap gap-1">
            {job.benefits.slice(0, 4).map((benefit, index) => (
              <Badge key={index} variant="outline" className="text-xs">
                {benefit}
              </Badge>
            ))}
            {job.benefits.length > 4 && (
              <Badge variant="outline" className="text-xs">
                +{job.benefits.length - 4}
              </Badge>
            )}
          </div>
        </div>
      )}

      {/* Actions */}
      <div className="flex items-center gap-2">
        <Button
          onClick={handleApply}
          disabled={isApplied}
          className="flex-1"
          size="sm"
        >
          {isApplied ? 'Beworben ✓' : 'Jetzt bewerben'}
        </Button>
        
        {onSave && (
          <Button
            variant="outline"
            size="sm"
            onClick={handleSave}
            className={isSaved ? 'text-red-600 border-red-600' : ''}
          >
            <Heart className={`w-4 h-4 ${isSaved ? 'fill-current' : ''}`} />
          </Button>
        )}
        
        {onFollow && (
          <Button
            variant="outline"
            size="sm"
            onClick={handleFollow}
            className={isFollowing ? 'text-blue-600 border-blue-600' : ''}
          >
            <Share2 className="w-4 h-4" />
          </Button>
        )}
      </div>

      {/* Time */}
      <div className="mt-3 flex items-center gap-1 text-xs text-gray-500">
        <Clock className="w-3 h-3" />
        <span>
          {new Date(job.created_at).toLocaleDateString('de-DE')}
        </span>
      </div>
    </div>
  );
}
