import { Button } from "@/components/ui/button";
import { Loader2 } from "lucide-react";
import { JobCandidateCard } from "./JobCandidateCard";
import type { Stage } from "@/components/Company/SelectionBar";

export interface Candidate {
  id: string;
  name: string;
  avatar?: string;
  city?: string;
  skills: string[];
  matchScore?: number;
  stage: Stage;
  isUnlocked: boolean;
  tokenCost?: number;
  email?: string;
  phone?: string;
  role?: string;
  hasLicense?: boolean;
  seeking?: string;
  jobSearchPreferences?: string[];
  linkedJobTitles?: Array<{ id: string; title: string }>;
}

interface CandidateListProps {
  candidates: Candidate[];
  isLoading?: boolean;
  hasMore?: boolean;
  onLoadMore?: () => void;
  onViewProfile?: (candidate: Candidate) => void;
  onUnlock?: (candidate: Candidate) => void;
  onStageChange?: (candidateId: string, stage: Stage) => void;
}

export function CandidateList({
  candidates,
  isLoading = false,
  hasMore = false,
  onLoadMore,
  onViewProfile,
  onUnlock,
  onStageChange
}: CandidateListProps) {
  if (isLoading && candidates.length === 0) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  if (candidates.length === 0) {
    return (
      <div className="rounded-lg border border-dashed py-12 text-center">
        <p className="text-muted-foreground">Keine Kandidaten gefunden</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
        {candidates.map((candidate) => (
          <JobCandidateCard
            key={candidate.id}
            id={candidate.id}
            name={candidate.name}
            avatar={candidate.avatar}
            city={candidate.city}
            skills={candidate.skills}
            matchScore={candidate.matchScore}
            stage={candidate.stage}
            isUnlocked={candidate.isUnlocked}
            tokenCost={candidate.tokenCost}
            email={candidate.email}
            phone={candidate.phone}
            role={candidate.role}
            hasLicense={candidate.hasLicense}
            seeking={candidate.seeking}
            linkedJobTitles={candidate.linkedJobTitles}
            onViewProfile={() => onViewProfile?.(candidate)}
            onUnlock={() => onUnlock?.(candidate)}
            onStageChange={(stage) => onStageChange?.(candidate.id, stage)}
            onDownloadCV={() => {}}
          />
        ))}
      </div>

      {hasMore && (
        <div className="flex justify-center pt-4">
          <Button
            variant="outline"
            onClick={onLoadMore}
            disabled={isLoading}
          >
            {isLoading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Lädt...
              </>
            ) : (
              "Mehr laden"
            )}
          </Button>
        </div>
      )}
    </div>
  );
}
