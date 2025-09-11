import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Separator } from "@/components/ui/separator";
import { 
  MapPin, 
  Briefcase, 
  GraduationCap, 
  User, 
  Coins, 
  Calendar,
  Building2,
  School,
  Award,
  X
} from "lucide-react";

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
  faehigkeiten?: any[];
  schule?: string;
  ausbildungsberuf?: string;
  aktueller_beruf?: string;
  ausbildungsbetrieb?: string;
  startjahr?: string;
  voraussichtliches_ende?: string;
  abschlussjahr?: string;
  geburtsdatum?: string;
  bio?: string;
  motivation?: string;
  has_drivers_license?: boolean;
  driver_license_class?: string;
  praktische_erfahrung?: string;
}

interface UnlockProfileModalProps {
  isOpen: boolean;
  onClose: () => void;
  profile: Profile | null;
  matchPercentage: number;
  onConfirmUnlock: () => void;
  tokenCost: number;
  isLoading?: boolean;
}

const getStatusIcon = (status: string) => {
  switch (status) {
    case 'azubi':
      return <Briefcase className="h-4 w-4" />;
    case 'schueler':
      return <GraduationCap className="h-4 w-4" />;
    case 'ausgelernt':
      return <User className="h-4 w-4" />;
    default:
      return <User className="h-4 w-4" />;
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
  if (percentage >= 80) return "text-green-600 bg-green-50";
  if (percentage >= 60) return "text-yellow-600 bg-yellow-50";
  return "text-gray-600 bg-gray-50";
};

export function UnlockProfileModal({
  isOpen,
  onClose,
  profile,
  matchPercentage,
  onConfirmUnlock,
  tokenCost,
  isLoading = false
}: UnlockProfileModalProps) {
  // Move calculations after all hooks would be called
  const displayName = profile ? `${profile.vorname} ${profile.nachname?.charAt(0)}.` : '';
  
  const age = profile?.geburtsdatum 
    ? new Date().getFullYear() - new Date(profile.geburtsdatum).getFullYear()
    : null;

  const skills = profile?.faehigkeiten && Array.isArray(profile.faehigkeiten) 
    ? profile.faehigkeiten 
    : [];

  if (!profile) return null;

  const getJobTitle = () => {
    if (profile.status === 'azubi' && profile.ausbildungsberuf) {
      return `${profile.ausbildungsberuf} (Azubi)`;
    }
    if (profile.status === 'schueler' && profile.schule) {
      return profile.schule;
    }
    if (profile.status === 'ausgelernt' && profile.aktueller_beruf) {
      return profile.aktueller_beruf;
    }
    return profile.headline || profile.branche;
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <div className="flex items-center justify-between">
            <DialogTitle className="text-xl">Profil-Vorschau</DialogTitle>
            <Button variant="ghost" size="sm" onClick={onClose}>
              <X className="h-4 w-4" />
            </Button>
          </div>
        </DialogHeader>

        <div className="space-y-6">
          {/* Header with Avatar and Basic Info */}
          <div className="flex items-start space-x-4">
            <Avatar className="h-20 w-20">
              <AvatarFallback className="bg-gradient-to-br from-blue-100 to-blue-200 text-lg">
                <User className="h-8 w-8 text-blue-600" />
              </AvatarFallback>
            </Avatar>
            
            <div className="flex-1">
              <div className="flex items-center gap-3 mb-2">
                <h2 className="text-2xl font-bold">{displayName}</h2>
                <Badge className={`${getMatchColor(matchPercentage)} border-0`}>
                  {matchPercentage}% Match
                </Badge>
              </div>
              
              <p className="text-lg text-muted-foreground mb-2">
                {getJobTitle()}
              </p>
              
              <div className="flex items-center gap-4 text-sm text-muted-foreground">
                <div className="flex items-center gap-1">
                  {getStatusIcon(profile.status)}
                  <span>{getStatusLabel(profile.status)}</span>
                </div>
                <div className="flex items-center gap-1">
                  <MapPin className="h-4 w-4" />
                  <span>{profile.ort}</span>
                </div>
                {age && (
                  <div className="flex items-center gap-1">
                    <Calendar className="h-4 w-4" />
                    <span>{age} Jahre</span>
                  </div>
                )}
              </div>
            </div>
          </div>

          <Separator />

          {/* Professional Information */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold">Berufliche Informationen</h3>
            
            {profile.status === 'azubi' && (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {profile.ausbildungsberuf && (
                  <div className="flex items-center gap-2">
                    <Briefcase className="h-4 w-4 text-muted-foreground" />
                    <div>
                      <p className="text-sm text-muted-foreground">Ausbildungsberuf</p>
                      <p className="font-medium">{profile.ausbildungsberuf}</p>
                    </div>
                  </div>
                )}
                {profile.ausbildungsbetrieb && (
                  <div className="flex items-center gap-2">
                    <Building2 className="h-4 w-4 text-muted-foreground" />
                    <div>
                      <p className="text-sm text-muted-foreground">Ausbildungsbetrieb</p>
                      <p className="font-medium">{profile.ausbildungsbetrieb}</p>
                    </div>
                  </div>
                )}
                {profile.startjahr && (
                  <div className="flex items-center gap-2">
                    <Calendar className="h-4 w-4 text-muted-foreground" />
                    <div>
                      <p className="text-sm text-muted-foreground">Ausbildungsstart</p>
                      <p className="font-medium">{profile.startjahr}</p>
                    </div>
                  </div>
                )}
                {profile.voraussichtliches_ende && (
                  <div className="flex items-center gap-2">
                    <Award className="h-4 w-4 text-muted-foreground" />
                    <div>
                      <p className="text-sm text-muted-foreground">Voraussichtliches Ende</p>
                      <p className="font-medium">{profile.voraussichtliches_ende}</p>
                    </div>
                  </div>
                )}
              </div>
            )}
            
            {profile.status === 'schueler' && (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {profile.schule && (
                  <div className="flex items-center gap-2">
                    <School className="h-4 w-4 text-muted-foreground" />
                    <div>
                      <p className="text-sm text-muted-foreground">Schule</p>
                      <p className="font-medium">{profile.schule}</p>
                    </div>
                  </div>
                )}
                {profile.abschlussjahr && (
                  <div className="flex items-center gap-2">
                    <Calendar className="h-4 w-4 text-muted-foreground" />
                    <div>
                      <p className="text-sm text-muted-foreground">Abschlussjahr</p>
                      <p className="font-medium">{profile.abschlussjahr}</p>
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Skills */}
          {skills.length > 0 && (
            <div className="space-y-3">
              <h3 className="text-lg font-semibold">Fähigkeiten & Kenntnisse</h3>
              <div className="flex flex-wrap gap-2">
                {skills.slice(0, 8).map((skill: any, index: number) => (
                  <Badge key={index} variant="secondary">
                    {skill.name || skill}
                  </Badge>
                ))}
                {skills.length > 8 && (
                  <Badge variant="outline">
                    +{skills.length - 8} weitere
                  </Badge>
                )}
              </div>
            </div>
          )}

          {/* Additional Info */}
          {(profile.bio || profile.motivation || profile.praktische_erfahrung) && (
            <div className="space-y-3">
              <h3 className="text-lg font-semibold">Zusätzliche Informationen</h3>
              {profile.bio && (
                <div>
                  <p className="text-sm text-muted-foreground mb-1">Über mich</p>
                  <p className="text-sm">{profile.bio}</p>
                </div>
              )}
              {profile.motivation && (
                <div>
                  <p className="text-sm text-muted-foreground mb-1">Motivation</p>
                  <p className="text-sm">{profile.motivation}</p>
                </div>
              )}
              {profile.praktische_erfahrung && (
                <div>
                  <p className="text-sm text-muted-foreground mb-1">Praktische Erfahrung</p>
                  <p className="text-sm">{profile.praktische_erfahrung}</p>
                </div>
              )}
            </div>
          )}

          {/* Driver License */}
          {profile.has_drivers_license && (
            <div className="space-y-2">
              <h3 className="text-lg font-semibold">Führerschein</h3>
              <div className="flex items-center gap-2">
                <Badge variant="outline" className="text-green-600 border-green-600">
                  ✓ Führerschein
                  {profile.driver_license_class && ` (Klasse ${profile.driver_license_class})`}
                </Badge>
              </div>
            </div>
          )}

          <Separator />

          {/* Unlock Information */}
          <div className="bg-blue-50 p-4 rounded-lg">
            <h3 className="font-semibold mb-2 flex items-center gap-2">
              <Coins className="h-5 w-5 text-blue-600" />
              Profil freischalten
            </h3>
            <p className="text-sm text-muted-foreground mb-3">
              Nach dem Freischalten erhalten Sie Zugang zu vollständigen Kontaktdaten, 
              dem kompletten Lebenslauf und können direkt Kontakt aufnehmen.
            </p>
            <div className="text-sm">
              <p><strong>Enthalten:</strong></p>
              <ul className="list-disc list-inside text-muted-foreground mt-1 space-y-1">
                <li>Vollständiger Name und Profilbild</li>
                <li>E-Mail-Adresse und Telefonnummer</li>
                <li>Lebenslauf als PDF</li>
                <li>Direkte Kontaktmöglichkeiten</li>
              </ul>
            </div>
          </div>
        </div>

        <DialogFooter className="flex items-center justify-between">
          <div className="text-sm text-muted-foreground">
            Kosten: {tokenCost} Token
          </div>
          <div className="flex gap-2">
            <Button variant="outline" onClick={onClose}>
              Abbrechen
            </Button>
            <Button 
              onClick={onConfirmUnlock}
              disabled={isLoading}
              className="bg-blue-600 hover:bg-blue-700"
            >
              <Coins className="h-4 w-4 mr-2" />
              {isLoading ? "Schalte frei..." : `Freischalten (${tokenCost} Token)`}
            </Button>
          </div>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}