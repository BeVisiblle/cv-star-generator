import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { MapPin, Briefcase, GraduationCap, Heart, Coins, Phone, Mail, Download, User } from "lucide-react";

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
    : `${profile.vorname} ${profile.nachname?.charAt(0)}.`;

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
    <Card className="group hover:shadow-lg transition-all duration-200 border-0 shadow-sm hover:shadow-md">
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between">
          <div className="flex items-start space-x-3 flex-1">
            <div className="relative">
              <Avatar className="h-14 w-14">
                <AvatarImage src={avatarSrc || ""} />
                <AvatarFallback className="bg-gradient-to-br from-blue-100 to-blue-200">
                  {isUnlocked ? (
                    `${profile.vorname?.charAt(0)}${profile.nachname?.charAt(0)}`
                  ) : (
                    <User className="h-6 w-6 text-blue-600" />
                  )}
                </AvatarFallback>
              </Avatar>
              {!isUnlocked && (
                <div className="absolute -top-1 -right-1 bg-blue-500 text-white rounded-full p-1">
                  <User className="h-3 w-3" />
                </div>
              )}
            </div>
            
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 mb-1">
                <h3 className="font-semibold text-lg truncate">
                  {displayName}
                </h3>
                <div className={`w-3 h-3 rounded-full ${getMatchColor(matchPercentage)} flex-shrink-0`} />
              </div>
              
              <p className="text-sm text-muted-foreground mb-2 line-clamp-1">
                {getJobTitle()}
              </p>
              
              <div className="flex items-center gap-3 text-xs text-muted-foreground">
                <div className="flex items-center gap-1">
                  {getStatusIcon(profile.status)}
                  <span>{getStatusLabel(profile.status)}</span>
                </div>
                <div className="flex items-center gap-1">
                  <MapPin className="h-3 w-3" />
                  <span>{profile.ort}</span>
                </div>
              </div>
            </div>
          </div>
          
          <div className="text-right">
            <div className="text-sm font-medium text-green-600 mb-1">
              {matchPercentage}% Match
            </div>
            <Button
              variant="ghost"
              size="sm"
              onClick={onSave}
              className="opacity-0 group-hover:opacity-100 transition-opacity"
            >
              <Heart className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </CardHeader>
      
      <CardContent className="pt-0">
        {/* Skills */}
        {topSkills.length > 0 && (
          <div className="mb-4">
            <div className="flex flex-wrap gap-1">
              {topSkills.map((skill: any, index: number) => (
                <Badge key={index} variant="secondary" className="text-xs">
                  {skill.name || skill}
                </Badge>
              ))}
              {profile.faehigkeiten && profile.faehigkeiten.length > 3 && (
                <Badge variant="outline" className="text-xs">
                  +{profile.faehigkeiten.length - 3}
                </Badge>
              )}
            </div>
          </div>
        )}

        {/* Action Buttons */}
        <div className="space-y-2">
          {isUnlocked ? (
            <div className="flex gap-2">
              <Button size="sm" variant="outline" className="flex-1">
                <Phone className="h-4 w-4 mr-1" />
                Kontakt
              </Button>
              <Button size="sm" variant="outline" className="flex-1">
                <Download className="h-4 w-4 mr-1" />
                CV
              </Button>
            </div>
          ) : (
            <div className="space-y-2">
              <Button 
                size="sm" 
                onClick={onPreview}
                variant="outline"
                className="w-full"
              >
                Profil ansehen
              </Button>
              <Button 
                size="sm"
                onClick={onUnlock}
                className="w-full bg-blue-600 hover:bg-blue-700"
              >
                <Coins className="h-4 w-4 mr-1" />
                Freischalten (1 Token)
              </Button>
            </div>
          )}
        </div>

        {/* Contact Info (only when unlocked) */}
        {isUnlocked && (
          <div className="mt-3 pt-3 border-t space-y-1">
            {profile.email && (
              <div className="flex items-center text-sm">
                <Mail className="h-4 w-4 mr-2 text-muted-foreground" />
                <span className="truncate">{profile.email}</span>
              </div>
            )}
            {profile.telefon && (
              <div className="flex items-center text-sm">
                <Phone className="h-4 w-4 mr-2 text-muted-foreground" />
                <span>{profile.telefon}</span>
              </div>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  );
}