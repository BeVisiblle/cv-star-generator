import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Unlock, Users } from "lucide-react";

interface HeaderJobSummaryProps {
  totalCandidates: number;
  unlockedCount: number;
  tokenCost: number;
  stageCounts: {
    neu: number;
    freigeschaltet: number;
    gespräch: number;
    archiv: number;
  };
  activeStage?: string | null;
  onStageFilter?: (stage: string | null) => void;
  onUnlockMore?: () => void;
}

export function HeaderJobSummary({
  totalCandidates,
  unlockedCount,
  tokenCost,
  stageCounts,
  activeStage,
  onStageFilter,
  onUnlockMore
}: HeaderJobSummaryProps) {
  return (
    <div className="mb-6 space-y-4">
      {/* Token Bar */}
      <div className="flex items-center justify-between rounded-lg border bg-card p-4">
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2">
            <Users className="h-5 w-5 text-muted-foreground" />
            <div>
              <div className="text-sm font-medium">
                {unlockedCount}/{totalCandidates} Kandidaten freigeschaltet
              </div>
              <div className="text-xs text-muted-foreground">
                Kosten: {tokenCost} Token
              </div>
            </div>
          </div>
        </div>
        
        {totalCandidates > unlockedCount && (
          <Button onClick={onUnlockMore} size="sm">
            <Unlock className="mr-2 h-4 w-4" />
            Weitere freischalten
          </Button>
        )}
      </div>

      {/* Phase Counter - Clickable Filters */}
      <div className="flex flex-wrap gap-3">
        <Badge 
          variant={activeStage === null ? "default" : "outline"} 
          className="cursor-pointer px-4 py-2 transition-colors hover:bg-accent"
          onClick={() => onStageFilter?.(null)}
        >
          <span className="mr-2 text-muted-foreground">Alle</span>
          <span className="font-semibold">{totalCandidates}</span>
        </Badge>
        <Badge 
          variant={activeStage === "neu" ? "default" : "outline"} 
          className="cursor-pointer px-4 py-2 transition-colors hover:bg-accent"
          onClick={() => onStageFilter?.("neu")}
        >
          <span className="mr-2 text-muted-foreground">Neu:</span>
          <span className="font-semibold">{stageCounts.neu}</span>
        </Badge>
        <Badge 
          variant={activeStage === "freigeschaltet" ? "default" : "outline"} 
          className="cursor-pointer px-4 py-2 transition-colors hover:bg-accent"
          onClick={() => onStageFilter?.("freigeschaltet")}
        >
          <span className="mr-2 text-muted-foreground">Freigeschaltet:</span>
          <span className="font-semibold">{stageCounts.freigeschaltet}</span>
        </Badge>
        <Badge 
          variant={activeStage === "gespräch" ? "default" : "outline"} 
          className="cursor-pointer px-4 py-2 transition-colors hover:bg-accent"
          onClick={() => onStageFilter?.("gespräch")}
        >
          <span className="mr-2 text-muted-foreground">Gespräch:</span>
          <span className="font-semibold">{stageCounts.gespräch}</span>
        </Badge>
        <Badge 
          variant={activeStage === "archiv" ? "default" : "outline"} 
          className="cursor-pointer px-4 py-2 transition-colors hover:bg-accent"
          onClick={() => onStageFilter?.("archiv")}
        >
          <span className="mr-2 text-muted-foreground">Archiv:</span>
          <span className="font-semibold">{stageCounts.archiv}</span>
        </Badge>
      </div>
    </div>
  );
}
