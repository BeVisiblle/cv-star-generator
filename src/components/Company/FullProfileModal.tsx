import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { MapPin, Mail, Phone, Calendar, Briefcase, GraduationCap, Award, User } from "lucide-react";

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
  geburtsdatum?: string;
  beschreibung?: string;
  ausbildung?: any[];
  berufserfahrung?: any[];
  zertifikate?: any[];
}

interface FullProfileModalProps {
  profile: Profile | null;
  isOpen: boolean;
  onClose: () => void;
  isUnlocked: boolean;
}

export function FullProfileModal({ profile, isOpen, onClose, isUnlocked }: FullProfileModalProps) {
  if (!profile) return null;

  const displayName = isUnlocked 
    ? `${profile.vorname} ${profile.nachname}`
    : profile.vorname;

  const avatarSrc = isUnlocked ? profile.avatar_url : undefined;

  const getJobTitle = () => {
    if (profile.status === 'azubi' && profile.ausbildungsberuf) {
      return `${profile.ausbildungsberuf} (Azubi)`;
    }
    if (profile.status === 'schueler' && profile.schule) {
      return `Schüler:in - ${profile.schule}`;
    }
    if (profile.status === 'ausgelernt' && profile.aktueller_beruf) {
      return profile.aktueller_beruf;
    }
    return profile.headline || profile.branche;
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Profil ansehen</DialogTitle>
        </DialogHeader>
        
        <div className="space-y-6">
          {/* Header Section */}
          <div className="flex items-start space-x-6">
            <Avatar className="h-24 w-24">
              <AvatarImage src={avatarSrc || ""} />
              <AvatarFallback className="bg-gradient-to-br from-blue-100 to-blue-200 text-2xl">
                {isUnlocked ? (
                  `${profile.vorname?.charAt(0)}${profile.nachname?.charAt(0)}`
                ) : (
                  <User className="h-12 w-12 text-blue-600" />
                )}
              </AvatarFallback>
            </Avatar>
            
            <div className="flex-1">
              <h1 className="text-3xl font-bold mb-2">{displayName}</h1>
              <p className="text-xl text-muted-foreground mb-3">{getJobTitle()}</p>
              
              <div className="flex items-center space-x-4 text-sm text-muted-foreground mb-4">
                <div className="flex items-center">
                  <MapPin className="h-4 w-4 mr-1" />
                  <span>{profile.ort}, {profile.plz}</span>
                </div>
                <div className="flex items-center">
                  <Briefcase className="h-4 w-4 mr-1" />
                  <span>{profile.branche}</span>
                </div>
              </div>

              {isUnlocked && (
                <div className="space-y-1">
                  {profile.email && (
                    <div className="flex items-center text-sm">
                      <Mail className="h-4 w-4 mr-2 text-muted-foreground" />
                      <span>{profile.email}</span>
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
            </div>
          </div>

          {/* Description */}
          {profile.beschreibung && (
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Über mich</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm leading-relaxed">{profile.beschreibung}</p>
              </CardContent>
            </Card>
          )}

          {/* Skills */}
          {profile.faehigkeiten && Array.isArray(profile.faehigkeiten) && profile.faehigkeiten.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle className="text-lg flex items-center">
                  <Award className="h-5 w-5 mr-2" />
                  Fähigkeiten
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex flex-wrap gap-2">
                  {profile.faehigkeiten.map((skill: any, index: number) => (
                    <Badge key={index} variant="secondary">
                      {skill.name || skill}
                    </Badge>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}

          {/* Experience */}
          {profile.berufserfahrung && Array.isArray(profile.berufserfahrung) && profile.berufserfahrung.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle className="text-lg flex items-center">
                  <Briefcase className="h-5 w-5 mr-2" />
                  Berufserfahrung
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {profile.berufserfahrung.map((exp: any, index: number) => (
                    <div key={index} className="border-l-2 border-blue-200 pl-4">
                      <h4 className="font-semibold">{exp.position || exp.titel}</h4>
                      <p className="text-sm text-muted-foreground">{exp.unternehmen}</p>
                      <p className="text-xs text-muted-foreground">
                        {exp.von} - {exp.bis || 'Heute'}
                      </p>
                      {exp.beschreibung && (
                        <p className="text-sm mt-1">{exp.beschreibung}</p>
                      )}
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}

          {/* Education */}
          {profile.ausbildung && Array.isArray(profile.ausbildung) && profile.ausbildung.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle className="text-lg flex items-center">
                  <GraduationCap className="h-5 w-5 mr-2" />
                  Ausbildung
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {profile.ausbildung.map((edu: any, index: number) => (
                    <div key={index} className="border-l-2 border-green-200 pl-4">
                      <h4 className="font-semibold">{edu.abschluss || edu.titel}</h4>
                      <p className="text-sm text-muted-foreground">{edu.institution || edu.schule}</p>
                      <p className="text-xs text-muted-foreground">
                        {edu.von} - {edu.bis || 'Heute'}
                      </p>
                      {edu.beschreibung && (
                        <p className="text-sm mt-1">{edu.beschreibung}</p>
                      )}
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}

          {/* Certificates */}
          {profile.zertifikate && Array.isArray(profile.zertifikate) && profile.zertifikate.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle className="text-lg flex items-center">
                  <Award className="h-5 w-5 mr-2" />
                  Zertifikate
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  {profile.zertifikate.map((cert: any, index: number) => (
                    <div key={index} className="flex items-center justify-between p-2 bg-gray-50 rounded">
                      <div>
                        <p className="font-medium text-sm">{cert.name || cert.titel}</p>
                        <p className="text-xs text-muted-foreground">{cert.aussteller}</p>
                      </div>
                      {cert.datum && (
                        <p className="text-xs text-muted-foreground">{cert.datum}</p>
                      )}
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}

          {!isUnlocked && (
            <div className="text-center py-8 bg-gray-50 rounded-lg">
              <p className="text-muted-foreground mb-4">
                Schalten Sie das Profil frei, um alle Details und Kontaktinformationen zu sehen.
              </p>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}