import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { ScrollArea } from "@/components/ui/scroll-area";
import { 
  User, 
  Mail, 
  Phone, 
  MapPin, 
  Briefcase, 
  GraduationCap, 
  Award,
  FileText,
  ExternalLink,
  Download
} from "lucide-react";
import { getStatusConfig, getSourceConfig } from "@/utils/applicationStatus";
import type { ApplicationStatus, ApplicationSource } from "@/utils/applicationStatus";

interface ProfileManagementPanelProps {
  profile: {
    id: string;
    name: string;
    email?: string;
    phone?: string;
    avatar_url?: string;
    role?: string;
    city?: string;
    fs?: string;
    seeking?: string[];
    skills?: string[];
    education?: string;
    experience_years?: number;
  };
  applicationStatus?: ApplicationStatus;
  applicationSource?: ApplicationSource;
  isUnlocked?: boolean;
  onUnlock?: () => void;
}

export function ProfileManagementPanel({
  profile,
  applicationStatus,
  applicationSource,
  isUnlocked = false,
  onUnlock,
}: ProfileManagementPanelProps) {
  const statusConfig = applicationStatus ? getStatusConfig(applicationStatus) : null;
  const sourceConfig = applicationSource ? getSourceConfig(applicationSource) : null;

  return (
    <Card className="h-full">
      <CardHeader className="border-b">
        <div className="flex items-start justify-between">
          <div className="flex items-center gap-4">
            {profile.avatar_url ? (
              <img
                src={profile.avatar_url}
                alt={profile.name}
                className="w-16 h-16 rounded-full object-cover"
              />
            ) : (
              <div className="w-16 h-16 rounded-full bg-muted flex items-center justify-center">
                <User className="h-8 w-8 text-muted-foreground" />
              </div>
            )}
            <div>
              <CardTitle className="text-2xl mb-1">{profile.name}</CardTitle>
              {profile.role && (
                <p className="text-sm text-muted-foreground">{profile.role}</p>
              )}
            </div>
          </div>
          
          {statusConfig && (
            <Badge className={statusConfig.bgColor}>
              <span className="mr-1">{statusConfig.icon}</span>
              {statusConfig.label}
            </Badge>
          )}
        </div>

        {sourceConfig && (
          <Badge variant="outline" className="w-fit mt-2">
            <span className="mr-1">{sourceConfig.icon}</span>
            {sourceConfig.label}
          </Badge>
        )}
      </CardHeader>

      <CardContent className="p-6">
        <ScrollArea className="h-[calc(100vh-300px)]">
          <div className="space-y-6">
            {/* Contact Info */}
            <div>
              <h3 className="font-semibold mb-3 flex items-center gap-2">
                <Mail className="h-4 w-4" />
                Kontaktdaten
              </h3>
              {isUnlocked ? (
                <div className="space-y-2 text-sm">
                  {profile.email && (
                    <div className="flex items-center gap-2">
                      <Mail className="h-4 w-4 text-muted-foreground" />
                      <a href={`mailto:${profile.email}`} className="text-primary hover:underline">
                        {profile.email}
                      </a>
                    </div>
                  )}
                  {profile.phone && (
                    <div className="flex items-center gap-2">
                      <Phone className="h-4 w-4 text-muted-foreground" />
                      <a href={`tel:${profile.phone}`} className="text-primary hover:underline">
                        {profile.phone}
                      </a>
                    </div>
                  )}
                </div>
              ) : (
                <div className="p-4 bg-muted rounded-lg">
                  <p className="text-sm text-muted-foreground mb-3">
                    Kontaktdaten sind gesperrt
                  </p>
                  {onUnlock && (
                    <Button onClick={onUnlock} size="sm" className="w-full">
                      Profil freischalten
                    </Button>
                  )}
                </div>
              )}
            </div>

            <Separator />

            {/* Location */}
            {profile.city && (
              <>
                <div>
                  <h3 className="font-semibold mb-3 flex items-center gap-2">
                    <MapPin className="h-4 w-4" />
                    Standort
                  </h3>
                  <p className="text-sm">{profile.city}</p>
                </div>
                <Separator />
              </>
            )}

            {/* Job Seeking */}
            {profile.seeking && profile.seeking.length > 0 && (
              <>
                <div>
                  <h3 className="font-semibold mb-3 flex items-center gap-2">
                    <Briefcase className="h-4 w-4" />
                    Sucht
                  </h3>
                  <div className="flex flex-wrap gap-2">
                    {profile.seeking.map((job) => (
                      <Badge key={job} variant="secondary">
                        {job}
                      </Badge>
                    ))}
                  </div>
                </div>
                <Separator />
              </>
            )}

            {/* Skills */}
            {profile.skills && profile.skills.length > 0 && (
              <>
                <div>
                  <h3 className="font-semibold mb-3 flex items-center gap-2">
                    <Award className="h-4 w-4" />
                    Skills
                  </h3>
                  <div className="flex flex-wrap gap-2">
                    {profile.skills.map((skill) => (
                      <Badge key={skill} variant="outline">
                        {skill}
                      </Badge>
                    ))}
                  </div>
                </div>
                <Separator />
              </>
            )}

            {/* Education */}
            {profile.education && (
              <>
                <div>
                  <h3 className="font-semibold mb-3 flex items-center gap-2">
                    <GraduationCap className="h-4 w-4" />
                    Bildung
                  </h3>
                  <p className="text-sm">{profile.education}</p>
                </div>
                <Separator />
              </>
            )}

            {/* Experience */}
            {profile.experience_years !== undefined && (
              <>
                <div>
                  <h3 className="font-semibold mb-3 flex items-center gap-2">
                    <Briefcase className="h-4 w-4" />
                    Berufserfahrung
                  </h3>
                  <p className="text-sm">{profile.experience_years} Jahre</p>
                </div>
                <Separator />
              </>
            )}

            {/* Fachrichtung */}
            {profile.fs && (
              <>
                <div>
                  <h3 className="font-semibold mb-3 flex items-center gap-2">
                    <FileText className="h-4 w-4" />
                    Fachrichtung
                  </h3>
                  <p className="text-sm">{profile.fs}</p>
                </div>
                <Separator />
              </>
            )}

            {/* Actions */}
            {isUnlocked && (
              <div className="space-y-2 pt-4">
                <Button variant="outline" className="w-full" asChild>
                  <a href={`/company/candidates/${profile.id}`} target="_blank">
                    <ExternalLink className="h-4 w-4 mr-2" />
                    Vollständiges Profil
                  </a>
                </Button>
                <Button variant="outline" className="w-full">
                  <Download className="h-4 w-4 mr-2" />
                  CV herunterladen
                </Button>
              </div>
            )}
          </div>
        </ScrollArea>
      </CardContent>
    </Card>
  );
}
