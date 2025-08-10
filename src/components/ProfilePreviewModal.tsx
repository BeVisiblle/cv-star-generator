
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { MapPin, Briefcase, Eye, Car } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

interface ProfileData {
  vorname?: string;
  nachname?: string;
  status?: string;
  branche?: string;
  ort?: string;
  profilbild?: File | string;
  faehigkeiten?: string[];
  ueber_mich?: string;
  has_drivers_license?: boolean;
  driver_license_class?: string;
}

interface ProfilePreviewModalProps {
  isOpen: boolean;
  onClose: () => void;
  profileData: ProfileData;
  onPublish: () => void;
}

export function ProfilePreviewModal({ isOpen, onClose, profileData, onPublish }: ProfilePreviewModalProps) {
  const handlePublish = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      
      if (!user) {
        toast.error("Sie müssen angemeldet sein, um Ihr Profil zu veröffentlichen.");
        return;
      }

      const { error } = await supabase
        .from('profiles')
        .update({ profile_published: true })
        .eq('id', user.id);

      if (error) {
        console.error('Error publishing profile:', error);
        toast.error("Fehler beim Veröffentlichen des Profils.");
        return;
      }

      toast.success("Ihr Profil ist jetzt für Unternehmen sichtbar!");
      onPublish();
      onClose();
    } catch (error) {
      console.error('Unexpected error:', error);
      toast.error("Ein unerwarteter Fehler ist aufgetreten.");
    }
  };

  const getBrancheTitle = (branche?: string) => {
    const titles = {
      handwerk: 'Handwerk',
      it: 'IT & Technik',
      gesundheit: 'Gesundheit & Pflege',
      buero: 'Büro & Verwaltung',
      verkauf: 'Verkauf & Handel',
      gastronomie: 'Gastronomie',
      bau: 'Bau & Architektur',
    } as const;
    return branche ? titles[branche as keyof typeof titles] || branche : '';
  };

  const getStatusTitle = (status?: string) => {
    const titles = {
      'schueler': 'Schüler',
      'azubi': 'Azubi',
      'ausgelernt': 'Geselle/Fachkraft'
    };
    return status ? titles[status as keyof typeof titles] || status : '';
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Eye className="h-5 w-5" />
            So sehen dich Unternehmen
          </DialogTitle>
          <DialogDescription>
            Hier ist eine Vorschau, wie Ihr Profil in der Suche für Unternehmen angezeigt wird.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6">
          {/* Company View Card */}
          <Card className="border-2 border-primary/20 bg-gradient-to-br from-background to-muted/30">
            <CardContent className="p-6">
              <div className="flex flex-wrap items-start gap-4">
                <Avatar className="w-16 h-16 border-2 border-background shadow-md">
                  <AvatarImage 
                    src={typeof profileData.profilbild === 'string' ? profileData.profilbild : undefined} 
                    alt="Profilbild" 
                  />
                  <AvatarFallback className="text-lg font-semibold bg-primary/10">
                    {profileData.vorname?.[0]}{profileData.nachname?.[0]}
                  </AvatarFallback>
                </Avatar>

                <div className="flex-1 space-y-2">
                  <div>
                    <h3 className="text-xl font-bold text-foreground">
                      {profileData.vorname} {profileData.nachname}
                    </h3>
                    <p className="text-primary font-medium">
                      {getStatusTitle(profileData.status)} • {getBrancheTitle(profileData.branche)}
                    </p>
                  </div>

                  <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-muted-foreground">
                    {profileData.ort && (
                      <div className="flex items-center gap-1">
                        <MapPin className="h-4 w-4" />
                        <span className="text-sm">{profileData.ort}</span>
                      </div>
                    )}
                    {profileData.has_drivers_license && (
                      <div className="flex items-center gap-1">
                        <Car className="h-4 w-4" />
                        <span className="text-sm">
                          Führerschein {profileData.driver_license_class || ''}
                        </span>
                      </div>
                    )}
                  </div>

                  {profileData.ueber_mich && (
                    <p className="text-sm text-foreground line-clamp-2 mt-2">
                      {profileData.ueber_mich}
                    </p>
                  )}

                  {profileData.faehigkeiten && profileData.faehigkeiten.length > 0 && (
                    <div className="flex flex-wrap gap-1 mt-3">
                      {profileData.faehigkeiten.slice(0, 3).map((skill, index) => (
                        <Badge key={index} variant="secondary" className="text-xs">
                          {skill}
                        </Badge>
                      ))}
                      {profileData.faehigkeiten.length > 3 && (
                        <Badge variant="outline" className="text-xs">
                          +{profileData.faehigkeiten.length - 3} weitere
                        </Badge>
                      )}
                    </div>
                  )}
                </div>

                <Button size="sm" variant="outline">
                  <Briefcase className="h-4 w-4 mr-1" />
                  Kontakt
                </Button>
              </div>
            </CardContent>
          </Card>

          <div className="text-center space-y-4">
            <p className="text-muted-foreground">
              Mit dem Veröffentlichen wird Ihr Profil für Unternehmen sichtbar und Sie erhalten Zugang zur Community und zum Stellenmarkt.
            </p>
            
            <div className="flex gap-3 justify-center">
              <Button variant="outline" onClick={onClose}>
                Später
              </Button>
              <Button onClick={handlePublish} className="bg-primary hover:bg-primary/90">
                Jetzt sichtbar sein
              </Button>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
