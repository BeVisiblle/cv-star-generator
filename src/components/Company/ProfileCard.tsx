import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { MapPin, Briefcase, GraduationCap, Heart, Coins, Phone, Mail, User } from "lucide-react";
import { useState } from "react";


interface Profile {
  id: string;
  vorname: string;
  nachname: string;
  status: string;
  branche: string;
  ort: string;
  plz: string;
  avatar_url?: string;
  headline?: string;
  faehigkeiten?: any;
  email?: string;
  telefon?: string;
  cv_url?: string;
  schule?: string;
  ausbildungsberuf?: string;
  aktueller_beruf?: string;
  layout?: number;
  geburtsdatum?: string;
  berufserfahrung?: any[];
  ausbildung?: any[];
  sprachen?: any[];
  zertifikate?: any[];
}

interface ProfileCardProps {
  profile: Profile;
  isUnlocked: boolean;
  matchPercentage: number;
  onUnlock: () => void;
  onSave: () => void;
  onPreview: () => void;
}

const getStatusIcon = (status: string) => {
  switch (status) {
    case 'azubi':
      return <Briefcase className="h-3 w-3" />;
    case 'schueler':
      return <GraduationCap className="h-3 w-3" />;
    case 'ausgelernt':
      return <User className="h-3 w-3" />;
    default:
      return <User className="h-3 w-3" />;
  }
};

const getStatusLabel = (status: string) => {
  switch (status) {
    case 'azubi':
      return 'Azubi';
    case 'schueler':
      return 'Schüler:in';
    case 'ausgelernt':
      return 'Geselle/in';
    default:
      return status;
  }
};

const getMatchColor = (percentage: number) => {
  if (percentage >= 80) return "bg-green-500";
  if (percentage >= 60) return "bg-yellow-500";
  return "bg-gray-400";
};

const calculateMatchPercentage = (profile: Profile, companySettings?: any) => {
  // Simple matching algorithm based on industry, location, and skills
  let score = 0;
  let totalWeight = 0;

  // Industry match (40% weight)
  if (profile.branche && companySettings?.target_industries?.includes(profile.branche)) {
    score += 40;
  }
  totalWeight += 40;

  // Location proximity (30% weight) - simplified
  if (profile.ort && companySettings?.target_locations?.includes(profile.ort)) {
    score += 30;
  }
  totalWeight += 30;

  // Skills match (30% weight) - simplified
  if (profile.faehigkeiten && Array.isArray(profile.faehigkeiten) && profile.faehigkeiten.length > 0) {
    score += Math.min(30, profile.faehigkeiten.length * 5);
  }
  totalWeight += 30;

  return Math.round((score / totalWeight) * 100) || 65; // Default fallback
};

export function ProfileCard({ 
  profile, 
  isUnlocked, 
  matchPercentage, 
  onUnlock, 
  onSave, 
  onPreview 
}: ProfileCardProps) {
  const displayName = isUnlocked 
    ? `${profile.vorname} ${profile.nachname}`
    : profile.vorname;

  const avatarSrc = isUnlocked ? profile.avatar_url : undefined;

  const topSkills = profile.faehigkeiten && Array.isArray(profile.faehigkeiten) 
    ? profile.faehigkeiten.slice(0, 3) 
    : [];

  const getJobTitle = () => {
    if (profile.status === 'azubi' && profile.ausbildungsberuf) {
      return `${profile.ausbildungsberuf} (Azubi)`;
    }
    if (profile.status === 'schueler' && profile.schule) {
      return `${profile.schule}`;
    }
    if (profile.status === 'ausgelernt' && profile.aktueller_beruf) {
      return profile.aktueller_beruf;
    }
    return profile.headline || profile.branche;
  };

  return (
    <TooltipProvider>
      <Card className="group hover:shadow-lg transition-all duration-200 border-0 shadow-sm hover:shadow-md h-[340px] flex flex-col">
        <CardHeader className="pb-3 flex-shrink-0">
          <div className="flex items-start justify-between">
            <div className="flex items-start space-x-3 flex-1 min-w-0">
              <div className="relative flex-shrink-0">
                <Avatar className="h-12 w-12 sm:h-14 sm:w-14">
                  <AvatarImage src={avatarSrc || ""} />
                  <AvatarFallback className="bg-gradient-to-br from-blue-100 to-blue-200">
                    {isUnlocked ? (
                      `${profile.vorname?.charAt(0)}${profile.nachname?.charAt(0)}`
                    ) : (
                      <User className="h-5 w-5 sm:h-6 sm:w-6 text-blue-600" />
                    )}
                  </AvatarFallback>
                </Avatar>
                {!isUnlocked && (
                  <div className="absolute -top-1 -right-1 bg-blue-500 text-white rounded-full p-1">
                    <User className="h-2 w-2 sm:h-3 sm:w-3" />
                  </div>
                )}
              </div>
              
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-1">
                  <h3 className="font-semibold text-sm sm:text-base truncate">
                    {displayName}
                  </h3>
                  <div className={`w-2 h-2 sm:w-3 sm:h-3 rounded-full ${getMatchColor(matchPercentage)} flex-shrink-0`} />
                </div>
                
                <p className="text-xs sm:text-sm text-muted-foreground mb-2 line-clamp-1">
                  {getJobTitle()}
                </p>
                
                <div className="flex items-center gap-1 sm:gap-2 text-xs text-muted-foreground flex-wrap">
                  <div className="flex items-center gap-1 flex-shrink-0">
                    {getStatusIcon(profile.status)}
                    <span className="truncate">{getStatusLabel(profile.status)}</span>
                  </div>
                  <div className="flex items-center gap-1 min-w-0">
                    <MapPin className="h-3 w-3 flex-shrink-0" />
                    <span className="truncate">{profile.ort}</span>
                  </div>
                </div>
              </div>
            </div>
            
            <div className="text-right flex-shrink-0 ml-2">
              <div className="text-xs sm:text-sm font-medium text-green-600 mb-1">
                {matchPercentage}% Match
              </div>
              <Button
                variant="ghost"
                size="sm"
                onClick={onSave}
                className="h-6 w-6 sm:h-8 sm:w-8 p-0 opacity-100"
              >
                <Heart className="h-3 w-3 sm:h-4 sm:w-4" />
              </Button>
            </div>
          </div>
        </CardHeader>
      
        <CardContent className="pt-0 flex-1 flex flex-col min-w-0 px-3 sm:px-6">
          {/* Skills - Fixed height area */}
          <div className="mb-4 h-[60px] sm:h-[70px] flex items-start overflow-hidden">
            {topSkills.length > 0 ? (
              <div className="flex flex-wrap gap-1 w-full">
                {topSkills.map((skill: any, index: number) => (
                  <Badge key={index} variant="secondary" className="text-[10px] sm:text-xs truncate max-w-[70px] sm:max-w-[80px] px-1 sm:px-2 py-0.5">
                    {skill.name || skill}
                  </Badge>
                ))}
                {profile.faehigkeiten && profile.faehigkeiten.length > 3 && (
                  <Badge variant="outline" className="text-[10px] sm:text-xs px-1 sm:px-2 py-0.5">
                    +{profile.faehigkeiten.length - 3}
                  </Badge>
                )}
              </div>
            ) : (
              <div className="text-xs text-muted-foreground w-full flex items-center">
                {profile.status === 'schueler' ? (
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <span className="cursor-help">Keine Fähigkeiten angegeben</span>
                    </TooltipTrigger>
                    <TooltipContent>
                      <p>Schüler können keine Fähigkeiten hinzufügen</p>
                    </TooltipContent>
                  </Tooltip>
                ) : (
                  "Keine Fähigkeiten angegeben"
                )}
              </div>
            )}
          </div>

          {/* Action Buttons - Always at same position */}
          <div className="space-y-2 mt-auto">
            {isUnlocked ? (
              <Button 
                size="sm" 
                onClick={onPreview}
                variant="outline" 
                className="w-full text-[10px] sm:text-xs px-1 sm:px-2 h-8"
              >
                Profil ansehen
              </Button>
            ) : (
              <div className="space-y-2">
                <Button 
                  size="sm"
                  onClick={onUnlock}
                  className="w-full bg-blue-600 hover:bg-blue-700 text-[10px] sm:text-xs px-2 h-8"
                >
                  <Coins className="h-3 w-3 mr-1" />
                  <span className="hidden sm:inline">Freischalten (1 Token)</span>
                  <span className="sm:hidden">Freischalten</span>
                </Button>
              </div>
            )}
          </div>

          {/* Contact Info (only when unlocked) */}
          {isUnlocked && (
            <div className="mt-3 pt-3 border-t space-y-1">
              {profile.email && (
                <div className="flex items-center text-[10px] sm:text-xs min-w-0">
                  <Mail className="h-3 w-3 mr-2 text-muted-foreground flex-shrink-0" />
                  <span className="truncate">{profile.email}</span>
                </div>
              )}
              {profile.telefon && (
                <div className="flex items-center text-[10px] sm:text-xs">
                  <Phone className="h-3 w-3 mr-2 text-muted-foreground flex-shrink-0" />
                  <span className="truncate">{profile.telefon}</span>
                </div>
              )}
            </div>
          )}
        </CardContent>
      </Card>
    </TooltipProvider>
  );
}