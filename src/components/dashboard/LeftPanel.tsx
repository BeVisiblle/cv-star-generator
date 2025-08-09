import React from "react";
import { Card } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { useAuth } from "@/hooks/useAuth";

export const LeftPanel: React.FC = () => {
  const { profile } = useAuth();

  return (
    <aside aria-label="Profilübersicht" className="space-y-4">
      <Card className="p-5">
        <div className="flex items-center gap-4">
          <Avatar className="h-12 w-12">
            <AvatarImage src={profile?.avatar_url || undefined} alt={`${profile?.vorname ?? 'Unbekannt'} Avatar`} />
            <AvatarFallback>
              {profile?.vorname && profile?.nachname
                ? `${profile.vorname[0]}${profile.nachname[0]}`
                : "U"}
            </AvatarFallback>
          </Avatar>
          <div className="min-w-0">
            <h2 className="text-base font-medium truncate">
              {profile?.vorname && profile?.nachname
                ? `${profile.vorname} ${profile.nachname}`
                : "Dein Profil"}
            </h2>
            {profile?.ausbildungsberuf && (
              <p className="text-sm text-muted-foreground truncate">{profile.ausbildungsberuf}</p>
            )}
          </div>
        </div>
        <div className="mt-4 flex flex-wrap gap-2">
          <Badge variant="secondary">Profil</Badge>
          <Badge variant="secondary">Netzwerk</Badge>
          <Badge variant="secondary">Beiträge</Badge>
        </div>
      </Card>

      <Card className="p-5">
        <h3 className="text-sm font-medium mb-3">Schnellzugriff</h3>
        <ul className="text-sm text-muted-foreground space-y-2">
          <li>• Mein Netzwerk</li>
          <li>• Gespeicherte Beiträge</li>
          <li>• Benachrichtigungen</li>
        </ul>
      </Card>
    </aside>
  );
};

export default LeftPanel;
