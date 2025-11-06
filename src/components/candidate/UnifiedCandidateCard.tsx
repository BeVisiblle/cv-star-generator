import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { MoreVertical, Mail, Phone, MapPin, Briefcase, Calendar } from "lucide-react";
import { getStatusConfig, getSourceConfig, ApplicationStatus, ApplicationSource } from "@/utils/applicationStatus";
import { formatDistanceToNow } from "date-fns";
import { de } from "date-fns/locale";

interface UnifiedCandidateCardProps {
  candidate: {
    id: string;
    full_name: string;
    email?: string;
    phone?: string;
    city?: string;
    country?: string;
    skills?: string[];
    profile_image?: string;
    experience_years?: number;
    bio_short?: string;
  };
  application?: {
    id: string;
    status: ApplicationStatus;
    source: ApplicationSource;
    created_at: string;
    is_new?: boolean;
  };
  onUnlock?: () => void;
  onStatusChange?: (status: ApplicationStatus) => void;
  onViewDetails?: () => void;
  isUnlocked?: boolean;
}

export function UnifiedCandidateCard({
  candidate,
  application,
  onUnlock,
  onStatusChange,
  onViewDetails,
  isUnlocked = false,
}: UnifiedCandidateCardProps) {
  const statusConfig = application ? getStatusConfig(application.status) : null;
  const sourceConfig = application ? getSourceConfig(application.source) : null;

  const initials = candidate.full_name
    .split(" ")
    .map((n) => n[0])
    .join("")
    .toUpperCase()
    .slice(0, 2);

  return (
    <Card className="p-4 hover:shadow-md transition-shadow">
      <div className="flex gap-4">
        {/* Avatar */}
        <Avatar className="h-16 w-16">
          <AvatarImage src={candidate.profile_image} alt={candidate.full_name} />
          <AvatarFallback>{initials}</AvatarFallback>
        </Avatar>

        {/* Content */}
        <div className="flex-1 min-w-0">
          {/* Header */}
          <div className="flex items-start justify-between gap-2">
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 flex-wrap">
                <h3 className="font-semibold text-lg truncate">{candidate.full_name}</h3>
                {application?.is_new && (
                  <Badge variant="secondary" className="shrink-0">
                    Neu
                  </Badge>
                )}
              </div>
              {candidate.bio_short && (
                <p className="text-sm text-muted-foreground line-clamp-2 mt-1">
                  {candidate.bio_short}
                </p>
              )}
            </div>

            {/* Actions */}
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="icon" className="shrink-0">
                  <MoreVertical className="h-4 w-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuLabel>Aktionen</DropdownMenuLabel>
                <DropdownMenuSeparator />
                {onViewDetails && (
                  <DropdownMenuItem onClick={onViewDetails}>
                    Details ansehen
                  </DropdownMenuItem>
                )}
                {!isUnlocked && onUnlock && (
                  <DropdownMenuItem onClick={onUnlock}>
                    Kandidat freischalten
                  </DropdownMenuItem>
                )}
                {onStatusChange && application && (
                  <>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem onClick={() => onStatusChange("interview")}>
                      Zum Gespräch einladen
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={() => onStatusChange("offer")}>
                      Angebot machen
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={() => onStatusChange("hired")}>
                      Einstellen
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={() => onStatusChange("rejected")}>
                      Ablehnen
                    </DropdownMenuItem>
                  </>
                )}
              </DropdownMenuContent>
            </DropdownMenu>
          </div>

          {/* Info Grid */}
          <div className="mt-3 grid grid-cols-1 sm:grid-cols-2 gap-2 text-sm">
            {isUnlocked && candidate.email && (
              <div className="flex items-center gap-2 text-muted-foreground">
                <Mail className="h-4 w-4 shrink-0" />
                <span className="truncate">{candidate.email}</span>
              </div>
            )}
            {isUnlocked && candidate.phone && (
              <div className="flex items-center gap-2 text-muted-foreground">
                <Phone className="h-4 w-4 shrink-0" />
                <span className="truncate">{candidate.phone}</span>
              </div>
            )}
            {candidate.city && (
              <div className="flex items-center gap-2 text-muted-foreground">
                <MapPin className="h-4 w-4 shrink-0" />
                <span className="truncate">
                  {candidate.city}
                  {candidate.country && `, ${candidate.country}`}
                </span>
              </div>
            )}
            {candidate.experience_years !== undefined && (
              <div className="flex items-center gap-2 text-muted-foreground">
                <Briefcase className="h-4 w-4 shrink-0" />
                <span>{candidate.experience_years} Jahre Erfahrung</span>
              </div>
            )}
          </div>

          {/* Skills */}
          {candidate.skills && candidate.skills.length > 0 && (
            <div className="mt-3 flex flex-wrap gap-1.5">
              {candidate.skills.slice(0, 5).map((skill) => (
                <Badge key={skill} variant="outline" className="text-xs">
                  {skill}
                </Badge>
              ))}
              {candidate.skills.length > 5 && (
                <Badge variant="outline" className="text-xs">
                  +{candidate.skills.length - 5}
                </Badge>
              )}
            </div>
          )}

          {/* Footer */}
          <div className="mt-3 flex items-center justify-between gap-2 flex-wrap">
            <div className="flex items-center gap-2">
              {statusConfig && (
                <Badge className={statusConfig.bgColor}>
                  <span className="mr-1">{statusConfig.icon}</span>
                  <span className={statusConfig.color}>{statusConfig.label}</span>
                </Badge>
              )}
              {sourceConfig && (
                <Badge variant="outline" className="text-xs">
                  <span className="mr-1">{sourceConfig.icon}</span>
                  {sourceConfig.label}
                </Badge>
              )}
            </div>
            {application?.created_at && (
              <div className="flex items-center gap-1 text-xs text-muted-foreground">
                <Calendar className="h-3 w-3" />
                {formatDistanceToNow(new Date(application.created_at), {
                  addSuffix: true,
                  locale: de,
                })}
              </div>
            )}
          </div>
        </div>
      </div>
    </Card>
  );
}
