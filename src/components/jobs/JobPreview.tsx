import React from 'react';
import { Badge } from '@/components/ui/badge';
import { MapPin, Clock, Building2, Euro } from 'lucide-react';

interface JobPreviewProps {
  jobData: {
    title: string;
    description: string;
    track: string;
    contract_type: string;
    skills_required: string[];
    certs_required: string[];
    benefits: string[];
    salary_min: string;
    salary_max: string;
    is_remote: boolean;
    location_point?: any;
    shifts_required: {
      shifts: string[];
      flexibility: string;
    };
  };
}

export function JobPreview({ jobData }: JobPreviewProps) {
  return (
    <div className="bg-white border rounded-lg p-6 space-y-4">
      <div className="flex items-start justify-between">
        <div>
          <h2 className="text-xl font-bold text-gray-900">{jobData.title || 'Stellenbezeichnung'}</h2>
          <div className="flex items-center gap-2 mt-1">
            <Building2 className="w-4 h-4 text-gray-500" />
            <span className="text-sm text-gray-600">Unternehmen</span>
          </div>
        </div>
        <div className="flex gap-2">
          <Badge variant="secondary">{jobData.track || 'Bereich'}</Badge>
          <Badge variant="outline">{jobData.contract_type || 'Vertragsart'}</Badge>
        </div>
      </div>

      {/* Description */}
      <div>
        <h3 className="font-medium mb-2">Beschreibung</h3>
        <p className="text-gray-700 whitespace-pre-wrap">
          {jobData.description || 'Stellenbeschreibung wird hier angezeigt...'}
        </p>
      </div>

      {/* Requirements */}
      {(jobData.skills_required.length > 0 || jobData.certs_required.length > 0) && (
        <div>
          <h3 className="font-medium mb-2">Anforderungen</h3>
          <div className="space-y-2">
            {jobData.skills_required.length > 0 && (
              <div>
                <span className="text-sm font-medium text-gray-600">Fähigkeiten:</span>
                <div className="flex flex-wrap gap-1 mt-1">
                  {jobData.skills_required.map((skill, index) => (
                    <Badge key={index} variant="outline" className="text-xs">
                      {skill}
                    </Badge>
                  ))}
                </div>
              </div>
            )}
            {jobData.certs_required.length > 0 && (
              <div>
                <span className="text-sm font-medium text-gray-600">Zertifikate:</span>
                <div className="flex flex-wrap gap-1 mt-1">
                  {jobData.certs_required.map((cert, index) => (
                    <Badge key={index} variant="outline" className="text-xs">
                      {cert}
                    </Badge>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Benefits */}
      {jobData.benefits.length > 0 && (
        <div>
          <h3 className="font-medium mb-2">Benefits</h3>
          <div className="flex flex-wrap gap-1">
            {jobData.benefits.map((benefit, index) => (
              <Badge key={index} variant="secondary" className="text-xs">
                {benefit}
              </Badge>
            ))}
          </div>
        </div>
      )}

      {/* Salary */}
      {(jobData.salary_min || jobData.salary_max) && (
        <div className="flex items-center gap-2">
          <Euro className="w-4 h-4 text-gray-500" />
          <span className="text-sm text-gray-600">
            {jobData.salary_min && jobData.salary_max 
              ? `${jobData.salary_min}€ - ${jobData.salary_max}€`
              : jobData.salary_min 
                ? `Ab ${jobData.salary_min}€`
                : `Bis ${jobData.salary_max}€`
            }
          </span>
        </div>
      )}

      {/* Location */}
      <div className="flex items-center gap-2">
        <MapPin className="w-4 h-4 text-gray-500" />
        <span className="text-sm text-gray-600">
          {jobData.is_remote 
            ? 'Remote-Arbeit möglich' 
            : jobData.location_point?.address || 'Standort wird angegeben'
          }
        </span>
      </div>

      {/* Working Hours */}
      {jobData.shifts_required.shifts.length > 0 && (
        <div className="flex items-center gap-2">
          <Clock className="w-4 h-4 text-gray-500" />
          <span className="text-sm text-gray-600">
            Arbeitszeiten: {jobData.shifts_required.shifts.join(', ')}
          </span>
        </div>
      )}

      {/* Apply Button */}
      <div className="pt-4 border-t">
        <button className="w-full bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700 transition-colors">
          Jetzt bewerben
        </button>
      </div>
    </div>
  );
}
