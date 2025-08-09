import React from "react";
import { Card } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/hooks/useAuth";
import { useNavigate } from "react-router-dom";
import { MapPin } from "lucide-react";
function firstWords(text?: string | null, n: number = 20) {
  if (!text) return null;
  const words = text.trim().split(/\s+/);
  const slice = words.slice(0, n).join(" ");
  return words.length > n ? `${slice}…` : slice;
}
function firstChars(text?: string | null, n: number = 10) {
  if (!text) return null;
  const trimmed = text.trim();
  return trimmed.length > n ? `${trimmed.slice(0, n)}…` : trimmed.slice(0, n);
}
function getAbout(profile: any): string | null {
  if (!profile) return null;
  return profile.ueber_mich || profile.ueberMich || profile.uebermich || profile.about || profile.bio || profile.beschreibung || profile.motivation || null;
}
export const LeftPanel: React.FC = () => {
  const {
    profile
  } = useAuth();
  const navigate = useNavigate();
  const about = getAbout(profile);
  const about10 = firstChars(about, 10);
  return <aside aria-label="Profilübersicht" className="space-y-4">
      {/* Profilkarte mit Titelbild */}
      <Card className="p-0 overflow-hidden">
        {/* Cover + Avatar overlay */}
        <div className="relative">
          <img
            src={profile?.cover_image_url || profile?.cover_url || profile?.titelbild_url || '/images/step1-hero.jpg'}
            alt="Titelbild"
            className="h-24 w-full object-cover"
            loading="lazy"
          />
          <div className="absolute -bottom-7 left-5">
            <Avatar className="h-16 w-16 ring-2 ring-background shadow">
              <AvatarImage src={profile?.avatar_url || undefined} alt={`${profile?.vorname ?? 'Unbekannt'} Avatar`} />
              <AvatarFallback>
                {profile?.vorname && profile?.nachname ? `${profile.vorname[0]}${profile.nachname[0]}` : "U"}
              </AvatarFallback>
            </Avatar>
          </div>
        </div>

        {/* Content */}
        <div className="px-5 pt-10 pb-5">
          <div className="min-w-0">
            <h2 className="text-xl font-semibold leading-tight truncate">
              {profile?.vorname && profile?.nachname ? `${profile.vorname} ${profile.nachname}` : "Dein Profil"}
            </h2>
            {about10 && <p className="mt-1 text-sm text-muted-foreground line-clamp-1">{about10}</p>}
            {(profile?.ort || profile?.branche) && <div className="mt-1 text-sm text-muted-foreground flex items-center gap-1.5">
                <MapPin className="h-4 w-4" aria-hidden />
                <span>
                  {profile?.ort}
                  {profile?.branche && profile?.ort && " • "}
                  {profile?.branche}
                </span>
              </div>}
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
    </aside>;
};
export default LeftPanel;