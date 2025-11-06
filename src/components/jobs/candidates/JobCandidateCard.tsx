import { Card, CardContent } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Eye, Download, Mail, Phone, MapPin, Car, Briefcase, Heart, User } from "lucide-react";
import { useState } from "react";
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

  return (
    <Card className="flex h-full flex-col overflow-hidden transition-shadow hover:shadow-md">
      <CardContent className="flex flex-col p-3 h-full">
        {/* Status Badges - only for unlocked */}
        {isUnlocked && linkedJobTitles && linkedJobTitles.length > 0 && (
          <div className="mb-2 space-y-1">
            {linkedJobTitles.map((job) => (
              <Badge key={job.id} variant="secondary" className="text-xs">
                Bewerbung auf {job.title}
              </Badge>
            ))}
          </div>
        )}

        {/* Header */}
        <div className="mb-3 flex items-start gap-3">
          <Avatar className="h-10 w-10 flex-shrink-0">
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
              <Badge variant="secondary" className="flex items-center gap-1">
                <div className="h-2 w-2 rounded-full bg-yellow-500" />
                <span className="text-xs font-semibold text-emerald-600">{match}%</span>
              </Badge>
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
              <span>{role}</span>
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

        {/* Intent (Only for unlocked) */}
        {isUnlocked && seeking && (
          <div className="mb-2 min-h-[36px]">
            <div className="text-xs font-medium text-emerald-600">Sucht:</div>
            <div className="line-clamp-2 text-xs text-emerald-700">{seeking}</div>
          </div>
        )}

        {/* Skills */}
        {skills.length > 0 && (
          <div className="mb-3 min-h-[64px]">
            <div className="flex flex-wrap gap-1.5">
              {skills.slice(0, 3).map((skill, idx) => (
                <Badge key={idx} variant="outline" className="text-xs px-2 py-1">
                  {skill}
                </Badge>
              ))}
              {skills.length > 3 && (
                <Badge variant="outline" className="text-xs px-2 py-1">
                  +{skills.length - 3}
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
              {/* Action Buttons */}
              <div className="flex gap-2">
                <Button 
                  variant="outline" 
                  size="sm"
                  className="h-9 flex-1 text-xs"
                  onClick={onViewProfile}
                >
                  <Eye className="mr-1 h-4 w-4" />
                  Profil ansehen
                </Button>
                <Button 
                  variant="outline" 
                  size="sm"
                  className="h-9 flex-1 text-xs"
                  onClick={onDownloadCV}
                >
                  <Download className="mr-1 h-4 w-4" />
                  CV Download
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
              {/* Locked State - Single Button */}
              <Button 
                variant="default" 
                size="sm"
                className="h-9 w-full text-xs"
                onClick={onViewProfile}
              >
                <Eye className="mr-1 h-4 w-4" />
                Profil ansehen
              </Button>
            </>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
