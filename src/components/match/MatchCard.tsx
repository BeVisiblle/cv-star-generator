import React from 'react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ScoreBadge } from '@/components/matching/ScoreBadge';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { MoreVertical, User, MapPin, Clock } from 'lucide-react';
import { buildWhyBullets } from '@/utils/whyBullets';

interface MatchCardProps {
  match: {
    candidate_id: string;
    score: number;
    rank: number;
    is_explore: boolean;
    explanation?: any;
    candidate?: {
      vorname: string;
      nachname: string;
      stage: string;
      language_level: string;
    };
  };
  onUnlock: () => void;
  onReject: (reason: string) => void;
  onSuppress: () => void;
}

const REJECT_REASONS = [
  { code: 'skills_mismatch', label: 'Fähigkeiten passen nicht' },
  { code: 'experience_low', label: 'Zu wenig Erfahrung' },
  { code: 'location_issue', label: 'Standort passt nicht' },
  { code: 'overqualified', label: 'Überqualifiziert' },
  { code: 'other', label: 'Sonstiges' }
];

export function MatchCard({ match, onUnlock, onReject, onSuppress }: MatchCardProps) {
  const candidate = match.candidate || {
    vorname: 'Unbekannt',
    nachname: 'Kandidat',
    stage: 'available',
    language_level: 'de'
  };

  const whyBullets = match.explanation ? buildWhyBullets(match.explanation) : [];

  return (
    <div className="bg-white rounded-lg border p-4 hover:shadow-md transition-shadow" data-testid="match-card">
      {/* Header */}
      <div className="flex items-start justify-between mb-3">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-gray-200 rounded-full flex items-center justify-center">
            <User className="w-5 h-5 text-gray-600" />
          </div>
          <div>
            <h3 className="font-semibold text-gray-900">
              {candidate.vorname} {candidate.nachname}
            </h3>
            <div className="flex items-center gap-2 text-sm text-gray-600">
              <Badge variant="outline" className="text-xs">
                {candidate.stage}
              </Badge>
              {match.is_explore && (
                <Badge variant="secondary" className="text-xs">
                  Explore
                </Badge>
              )}
            </div>
          </div>
        </div>
        <ScoreBadge
          score={match.score}
          subs={match.explanation?.subs}
          weights={match.explanation?.weights}
        />
      </div>

      {/* Candidate Info */}
      <div className="space-y-2 mb-4">
        <div className="flex items-center gap-2 text-sm text-gray-600">
          <MapPin className="w-4 h-4" />
          <span>Standort verfügbar</span>
        </div>
        <div className="flex items-center gap-2 text-sm text-gray-600">
          <Clock className="w-4 h-4" />
          <span>Sprache: {candidate.language_level}</span>
        </div>
      </div>

      {/* Why Bullets */}
      {whyBullets.length > 0 && (
        <div className="mb-4 p-3 bg-green-50 rounded-md">
          <h4 className="text-sm font-medium text-green-900 mb-2">
            Warum passt dieser Kandidat?
          </h4>
          <ul className="space-y-1">
            {whyBullets.map((bullet, index) => (
              <li key={index} className="text-sm text-green-800">
                • {bullet}
              </li>
            ))}
          </ul>
        </div>
      )}

      {/* Actions */}
      <div className="flex gap-2">
        <Button
          onClick={onUnlock}
          className="flex-1"
          size="sm"
        >
          Freischalten
        </Button>
        
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="outline" size="sm">
              <MoreVertical className="w-4 h-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent>
            <DropdownMenuItem onClick={onSuppress}>
              30 Tage unterdrücken
            </DropdownMenuItem>
            <DropdownMenuItem className="text-red-600">
              Ablehnen
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>

      {/* Reject Reasons (hidden by default) */}
      <div className="mt-2 p-2 bg-red-50 rounded-md hidden">
        <p className="text-sm font-medium text-red-900 mb-2">Ablehnungsgrund:</p>
        <div className="space-y-1">
          {REJECT_REASONS.map((reason) => (
            <button
              key={reason.code}
              onClick={() => onReject(reason.code)}
              className="block w-full text-left text-sm text-red-800 hover:bg-red-100 p-1 rounded"
            >
              {reason.label}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
