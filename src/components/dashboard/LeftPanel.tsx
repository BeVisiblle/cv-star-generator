import React from "react";
import { Card } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/hooks/useAuth";
import { useNavigate } from "react-router-dom";

function firstWords(text?: string | null, n: number = 20) {
  if (!text) return null;
  const words = text.trim().split(/\s+/);
  const slice = words.slice(0, n).join(" ");
  return words.length > n ? `${slice}…` : slice;
}

function getAbout(profile: any): string | null {
  if (!profile) return null;
  return (
    profile.ueber_mich ||
    profile.ueberMich ||
    profile.uebermich ||
    profile.about ||
    profile.bio ||
    profile.beschreibung ||
    profile.motivation ||
    null
  );
}

export const LeftPanel: React.FC = () => {
  const { profile } = useAuth();
  const navigate = useNavigate();
  const about = getAbout(profile);
  const snippet = firstWords(about, 20);

  return (
    <aside aria-label="Profilübersicht" className="space-y-4">
      {/* Profilkarte mit Titelbild */}
      <Card className="p-0 overflow-hidden">
        {/* Titelbild */}
        <div className="h-20 sm:h-24 bg-muted">
          {profile?.cover_image_url ? (
            <img
              src={profile.cover_image_url}
              alt="Titelbild"
              className="h-full w-full object-cover"
              loading="lazy"
            />
          ) : null}
        </div>

        {/* Inhalt */}
        <div className="p-5">
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

          {snippet && (
            <p className="mt-3 text-sm text-muted-foreground line-clamp-2">
              {snippet}
            </p>
          )}

          {(profile?.ort || profile?.branche) && (
            <p className="mt-1 text-sm text-muted-foreground">
              {profile?.ort ? profile.ort : ""}
              {profile?.ort && profile?.branche ? " • " : ""}
              {profile?.branche ? profile.branche : ""}
            </p>
          )}

          <div className="mt-4 flex flex-wrap gap-2">
            <Badge variant="secondary">Profil</Badge>
            <Badge variant="secondary">Netzwerk</Badge>
            <Badge variant="secondary">Beiträge</Badge>
          </div>
        </div>
      </Card>

      {/* Statistik-Karte wie im Screenshot */}
      <Card className="p-5">
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-sm">Profilbesuche</span>
            <span className="text-sm font-semibold text-primary">295</span>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-sm">Impressions von Beiträgen</span>
            <span className="text-sm font-semibold text-primary">102</span>
          </div>
          <hr className="my-2 border-border" />
          <div className="flex items-center justify-between">
            <Button variant="link" className="px-0" onClick={() => navigate('/profile')}>
              Zum Profil
            </Button>
          </div>
        </div>
      </Card>

      {/* Schnellaktionen: Jobvorschläge */}
      <Card className="p-5">
        <h3 className="text-sm font-medium mb-3">Schnellaktionen</h3>
        <div className="flex flex-wrap gap-2">
          <Button size="sm" variant="secondary" onClick={() => navigate('/marketplace')}>
            Jobvorschläge
          </Button>
          <Button size="sm" variant="outline" onClick={() => navigate('/marketplace')}>
            Trend‑Jobs
          </Button>
        </div>
      </Card>

      {/* Schnellzugriff */}
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
