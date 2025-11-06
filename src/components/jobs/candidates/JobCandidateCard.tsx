import { Card, CardContent } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Eye, Unlock } from "lucide-react";
import type { Stage } from "@/components/Company/SelectionBar";

interface JobCandidateCardProps {
  id: string;
  name: string;
  avatar?: string;
  city?: string;
  skills: string[];
  matchScore?: number;
  stage: Stage;
  isUnlocked: boolean;
  tokenCost?: number;
  onViewProfile?: () => void;
  onUnlock?: () => void;
  onStageChange?: (stage: Stage) => void;
}

export function JobCandidateCard({
  id,
  name,
  avatar,
  city,
  skills,
  matchScore,
  stage,
  isUnlocked,
  tokenCost = 5,
  onViewProfile,
  onUnlock,
  onStageChange
}: JobCandidateCardProps) {
  const initials = name
    .split(" ")
    .map((n) => n[0])
    .join("")
    .toUpperCase()
    .slice(0, 2);

  return (
    <Card className="overflow-hidden transition-shadow hover:shadow-md">
      <CardContent className="p-4">
        <div className="mb-4 flex items-start gap-3">
          <Avatar className="h-12 w-12">
            <AvatarImage src={avatar} alt={name} />
            <AvatarFallback>{initials}</AvatarFallback>
          </Avatar>
          
          <div className="flex-1 min-w-0">
            <h3 className="font-semibold truncate">{name}</h3>
            {city && (
              <p className="text-sm text-muted-foreground">{city}</p>
            )}
          </div>

          {matchScore !== undefined && (
            <Badge variant={matchScore > 80 ? "default" : "secondary"}>
              {matchScore}%
            </Badge>
          )}
        </div>

        {/* Skills */}
        {skills.length > 0 && (
          <div className="mb-4 flex flex-wrap gap-1">
            {skills.slice(0, 3).map((skill, idx) => (
              <Badge key={idx} variant="outline" className="text-xs">
                {skill}
              </Badge>
            ))}
            {skills.length > 3 && (
              <Badge variant="outline" className="text-xs">
                +{skills.length - 3}
              </Badge>
            )}
          </div>
        )}

        {/* Actions */}
        <div className="space-y-2">
          {isUnlocked ? (
            <>
              <Select
                value={stage}
                onValueChange={(value) => onStageChange?.(value as Stage)}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="neu">Neu</SelectItem>
                  <SelectItem value="freigeschaltet">Freigeschaltet</SelectItem>
                  <SelectItem value="gespräch">Gespräch</SelectItem>
                  <SelectItem value="archiv">Archiv</SelectItem>
                </SelectContent>
              </Select>
              <Button 
                variant="outline" 
                className="w-full"
                onClick={onViewProfile}
              >
                <Eye className="mr-2 h-4 w-4" />
                Profil anzeigen
              </Button>
            </>
          ) : (
            <Button 
              variant="default" 
              className="w-full"
              onClick={onUnlock}
            >
              <Unlock className="mr-2 h-4 w-4" />
              Freischalten ({tokenCost} Token)
            </Button>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
