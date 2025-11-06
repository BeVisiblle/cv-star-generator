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
import { Eye, Unlock, Download, Mail, Phone, MapPin, Car, Briefcase, Heart, User } from "lucide-react";
import { useState, useMemo } from "react";
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
  email?: string;
  phone?: string;
  role?: string;
  hasLicense?: boolean;
  seeking?: string;
  jobSearchPreferences?: string[];
  linkedJobTitles?: Array<{ id: string; title: string }>;
  onViewProfile?: () => void;
  onUnlock?: () => void;
  onStageChange?: (stage: Stage) => void;
  onDownloadCV?: () => void;
  onToggleFavorite?: () => void;
  isFavorite?: boolean;
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
  email,
  phone,
  role,
  hasLicense,
  seeking,
  jobSearchPreferences,
  linkedJobTitles,
  onViewProfile,
  onUnlock,
  onStageChange,
  onDownloadCV,
  onToggleFavorite,
  isFavorite: initialFavorite = false
}: JobCandidateCardProps) {
  const [isFavorite, setIsFavorite] = useState(initialFavorite);
  const match = Math.round(matchScore ?? 0);

  const handleToggleFavorite = () => {
    setIsFavorite(!isFavorite);
    onToggleFavorite?.();
  };

  // For locked cards: show only first name
  const displayName = !isUnlocked && name.includes(" ") 
    ? name.split(" ")[0] 
    : name;

  const initials = name
    .split(" ")
    .map((n) => n[0])
    .join("")
    .toUpperCase()
    .slice(0, 2);

  // Calculate status info from job search preferences (for unlocked cards)
  const statusInfo = useMemo(() => {
    if (!isUnlocked || !jobSearchPreferences || jobSearchPreferences.length === 0) {
      return null;
    }
    
    let label = "Sucht: ";
    let bgClass = "";
    let textClass = "";
    let borderClass = "";
    
    if (jobSearchPreferences.includes("Praktikum") && jobSearchPreferences.includes("Ausbildung")) {
      label += "Praktikum & Ausbildung";
      bgClass = "bg-amber-50 dark:bg-amber-950";
      textClass = "text-amber-700 dark:text-amber-300";
      borderClass = "border-amber-200 dark:border-amber-800";
    } else if (jobSearchPreferences.includes("Ausbildung")) {
      label += "Ausbildung";
      bgClass = "bg-green-50 dark:bg-green-950";
      textClass = "text-green-700 dark:text-green-300";
      borderClass = "border-green-200 dark:border-green-800";
    } else if (jobSearchPreferences.includes("Praktikum")) {
      label += "Praktikum";
      bgClass = "bg-red-50 dark:bg-red-950";
      textClass = "text-red-700 dark:text-red-300";
      borderClass = "border-red-200 dark:border-red-800";
    } else if (jobSearchPreferences.includes("Nach der Ausbildung einen Job")) {
      label += "Job nach Ausbildung";
      bgClass = "bg-blue-50 dark:bg-blue-950";
      textClass = "text-blue-700 dark:text-blue-300";
      borderClass = "border-blue-200 dark:border-blue-800";
    } else if (jobSearchPreferences.includes("Ausbildungsplatzwechsel")) {
      label += "Ausbildungsplatzwechsel";
      bgClass = "bg-purple-50 dark:bg-purple-950";
      textClass = "text-purple-700 dark:text-purple-300";
      borderClass = "border-purple-200 dark:border-purple-800";
    } else {
      label += jobSearchPreferences.join(", ");
      bgClass = "bg-slate-50 dark:bg-slate-950";
      textClass = "text-slate-700 dark:text-slate-300";
      borderClass = "border-slate-200 dark:border-slate-800";
    }
    
    return { label, bgClass, textClass, borderClass };
  }, [isUnlocked, jobSearchPreferences]);

  return (
    <Card className="flex h-full flex-col overflow-hidden transition-shadow hover:shadow-md">
      <CardContent className="flex flex-col p-3 h-full">
        {/* Status Banner (only for unlocked cards) */}
        {statusInfo && (
          <div className={`flex items-center gap-2 p-2 rounded-lg border mb-3 ${statusInfo.bgClass} ${statusInfo.borderClass}`}>
            <Briefcase className={`h-4 w-4 ${statusInfo.textClass}`} />
            <span className={`text-sm font-medium ${statusInfo.textClass}`}>
              {statusInfo.label}
            </span>
          </div>
        )}

        {/* Header */}
        <div className="mb-3 flex items-start gap-3">
          <Avatar className="h-10 w-10">
            {!isUnlocked ? (
              <AvatarFallback className="bg-gradient-to-br from-blue-100 to-blue-200">
                <User className="h-5 w-5 text-blue-600" />
              </AvatarFallback>
            ) : (
              <>
                <AvatarImage src={avatar} alt={name} />
                <AvatarFallback>{initials}</AvatarFallback>
              </>
            )}
          </Avatar>
          
          <div className="flex-1 min-w-0">
            <h3 className="font-semibold truncate">{displayName}</h3>
            {role && (
              <p className="text-sm text-muted-foreground truncate">{role}</p>
            )}
          </div>

          <div className="flex shrink-0 items-center gap-1">
            {matchScore !== undefined && (
              <div className="flex items-center gap-1 rounded-full bg-secondary px-2 py-1">
                <div className="h-2 w-2 rounded-full bg-yellow-500" />
                <span className="text-xs font-semibold text-emerald-600">{match}%</span>
              </div>
            )}
            <Button
              variant="ghost"
              size="sm"
              onClick={handleToggleFavorite}
              className="h-6 w-6 p-0 text-muted-foreground hover:text-foreground"
              title="Merken"
            >
              <Heart className={`h-4 w-4 ${isFavorite ? 'fill-red-500 text-red-500' : ''}`} />
            </Button>
          </div>
        </div>

        {/* Meta Info */}
        <div className="mb-2 grid min-h-[48px] grid-cols-1 gap-1 text-xs text-muted-foreground">
          {role && (
            <div className="flex items-center gap-1">
              <Briefcase className="h-3 w-3" />
              <span>Azubi</span>
            </div>
          )}
          {city && (
            <div className="flex items-center gap-1">
              <MapPin className="h-3 w-3" />
              <span className="truncate">{city}</span>
            </div>
          )}
          {hasLicense && (
            <div className="flex items-center gap-1">
              <Car className="h-3 w-3" />
              <span>Führerschein</span>
            </div>
          )}
        </div>

        {/* Intent (Linked Jobs or Seeking) */}
        {isUnlocked && (
          <div className="mb-2 min-h-[36px]">
            {linkedJobTitles && linkedJobTitles.length > 0 ? (
              <>
                <div className="text-xs font-medium text-primary mb-1">Hat sich beworben auf:</div>
                <div className="space-y-0.5">
                  {linkedJobTitles.map((job) => (
                    <div key={job.id} className="truncate text-xs text-muted-foreground">
                      • {job.title}
                    </div>
                  ))}
                </div>
              </>
            ) : seeking ? (
              <>
                <div className="text-xs font-medium text-emerald-600">Sucht:</div>
                <div className="line-clamp-2 text-xs text-emerald-700">{seeking}</div>
              </>
            ) : null}
          </div>
        )}

        {/* Skills */}
        {skills.length > 0 && (
          <div className="mb-3 min-h-[64px]">
            <div className="flex flex-wrap gap-1.5">
              {skills.slice(0, 6).map((skill, idx) => (
                <Badge key={idx} variant="outline" className="text-xs px-2 py-1">
                  {skill}
                </Badge>
              ))}
              {skills.length > 6 && (
                <Badge variant="outline" className="text-xs px-2 py-1">
                  +{skills.length - 6}
                </Badge>
              )}
            </div>
          </div>
        )}

        {/* Spacer to push actions to bottom */}
        <div className="flex-1" />

        {/* Actions */}
        <div className="space-y-2">
          {isUnlocked ? (
            <>
              {/* Stage Selector */}
              <Select
                value={stage}
                onValueChange={(value) => onStageChange?.(value as Stage)}
              >
                <SelectTrigger className="h-9 text-xs">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="neu">Neu</SelectItem>
                  <SelectItem value="freigeschaltet">Freigeschaltet</SelectItem>
                  <SelectItem value="gespräch">Gespräch</SelectItem>
                  <SelectItem value="archiv">Archiv</SelectItem>
                </SelectContent>
              </Select>

              {/* Action Buttons */}
              <div className="flex gap-2">
                <Button 
                  variant="outline" 
                  size="sm"
                  className="h-9 flex-1 text-xs"
                  onClick={onViewProfile}
                >
                  <Eye className="mr-1 h-4 w-4" />
                  Profil
                </Button>
                <Button 
                  variant="outline" 
                  size="sm"
                  className="h-9 flex-1 text-xs"
                  onClick={onDownloadCV}
                >
                  <Download className="mr-1 h-4 w-4" />
                  CV
                </Button>
              </div>

              {/* Contact Info */}
              {(email || phone) && (
                <div className="rounded-lg bg-muted/30 p-2 text-xs space-y-1">
                  {email && (
                    <div className="flex items-center gap-1 text-muted-foreground">
                      <Mail className="h-3 w-3 text-blue-600" />
                      <a 
                        href={`mailto:${email}`} 
                        className="truncate hover:underline hover:text-foreground"
                        onClick={(e) => e.stopPropagation()}
                      >
                        {email}
                      </a>
                    </div>
                  )}
                  {phone && (
                    <div className="flex items-center gap-1 text-muted-foreground">
                      <Phone className="h-3 w-3 text-green-600" />
                      <a 
                        href={`tel:${phone}`} 
                        className="truncate hover:underline hover:text-foreground"
                        onClick={(e) => e.stopPropagation()}
                      >
                        {phone}
                      </a>
                    </div>
                  )}
                </div>
              )}
            </>
          ) : (
            <>
              {/* Locked State Actions */}
              <div className="flex gap-2">
                <Button 
                  variant="outline" 
                  size="sm"
                  className="h-9 flex-1 text-xs"
                  onClick={onViewProfile}
                >
                  <Eye className="mr-1 h-4 w-4" />
                  Vorschau
                </Button>
                <Button 
                  variant="default" 
                  size="sm"
                  className="h-9 flex-1 text-xs"
                  onClick={onUnlock}
                >
                  <Unlock className="mr-1 h-4 w-4" />
                  {tokenCost} Token
                </Button>
              </div>
            </>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
