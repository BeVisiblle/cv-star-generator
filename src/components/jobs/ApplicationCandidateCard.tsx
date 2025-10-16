import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Heart, MapPin, Car, Briefcase, Mail, Phone, Download, Eye, Unlock } from "lucide-react";
import { useState } from "react";

interface Candidate {
  id: string;
  full_name: string;
  vorname?: string;
  nachname?: string;
  email?: string;
  phone?: string;
  profile_image?: string;
  title?: string;
  city?: string;
  skills?: string[];
  bio_short?: string;
  cv_url?: string;
  languages?: string[];
  experience_years?: number;
  availability_status?: string;
}

interface Application {
  id: string;
  stage: string;
  match_score?: number;
  unlocked_at?: string;
  candidates: Candidate;
}

type ApplicationCandidateCardProps = {
  application: Application;
  onViewProfile: () => void;
  onToggleFavorite?: () => void;
  isFavorite?: boolean;
};

export function ApplicationCandidateCard({
  application,
  onViewProfile,
  onToggleFavorite,
  isFavorite: initialFavorite = false,
}: ApplicationCandidateCardProps) {
  const candidate = application.candidates;
  const match = Math.round(application.match_score ?? 0);
  const [isFavorite, setIsFavorite] = useState(initialFavorite);
  const isUnlocked = !!application.unlocked_at;

  const handleToggleFavorite = () => {
    setIsFavorite(!isFavorite);
    onToggleFavorite?.();
  };

  const handleDownloadCV = () => {
    if (candidate.cv_url) {
      window.open(candidate.cv_url, "_blank");
    }
  };

  const displayName = isUnlocked 
    ? (candidate.full_name || `${candidate.vorname || ""} ${candidate.nachname || ""}`.trim())
    : (candidate.vorname || "Kandidat");

  const skills = candidate.skills || [];
  const seeking = candidate.bio_short || "";

  return (
    <article className="flex h-full w-full flex-col rounded-xl border bg-card p-3 shadow-sm transition-shadow hover:shadow-md">
      {/* 1) Header (compact) */}
      <div className="flex min-h-[48px] items-start justify-between gap-2">
        <div className="flex items-center gap-2">
          <Avatar className="h-9 w-9 sm:h-10 sm:w-10">
            <AvatarImage src={candidate.profile_image} />
            <AvatarFallback className="text-sm">{displayName.charAt(0)}</AvatarFallback>
          </Avatar>
          <div className="min-w-0">
            <h3 className="truncate text-sm font-semibold text-foreground">{displayName}</h3>
            {candidate.title && <div className="truncate text-xs text-muted-foreground">{candidate.title}</div>}
          </div>
        </div>
        <div className="flex shrink-0 items-center gap-1">
          {/* Unlocked Badge */}
          {isUnlocked && (
            <Badge variant="secondary" className="mr-1 flex items-center gap-1 px-2 py-1">
              <Unlock className="h-3 w-3" />
              <span className="text-xs">Freigeschaltet</span>
            </Badge>
          )}
          {/* Match */}
          {match > 0 && (
            <div className="flex items-center gap-1 rounded-full bg-secondary px-2 py-1">
              <div className="h-2 w-2 rounded-full bg-yellow-500" />
              <span className="text-xs font-semibold text-emerald-600">{match}% Match</span>
            </div>
          )}
          {/* Fav */}
          <Button
            variant="ghost"
            size="sm"
            onClick={handleToggleFavorite}
            className="h-6 w-6 p-0 text-muted-foreground hover:text-foreground"
            title="Merken"
            aria-label="Merken"
          >
            <Heart className={`h-4 w-4 ${isFavorite ? "fill-red-500 text-red-500" : ""}`} />
          </Button>
        </div>
      </div>

      {/* 2) Meta (compact) */}
      <div className="mt-1 grid min-h-[48px] grid-cols-1 gap-1 text-xs text-muted-foreground">
        {candidate.title && (
          <div className="flex items-center gap-1">
            <Briefcase className="h-3 w-3" />
            <span>Azubi</span>
          </div>
        )}
        {candidate.city && (
          <div className="flex items-center gap-1">
            <MapPin className="h-3 w-3" />
            <span className="truncate">{candidate.city}</span>
          </div>
        )}
      </div>

      {/* 3) Intent (Sucht) */}
      <div className="mt-1 min-h-[36px]">
        {seeking ? (
          <>
            <div className="text-xs font-medium text-emerald-600">Sucht:</div>
            <div className="line-clamp-2 text-xs text-emerald-700">{seeking}</div>
          </>
        ) : (
          <div className="text-xs text-muted-foreground">Keine Präferenz angegeben</div>
        )}
      </div>

      {/* 4) Skills (small pills, wrap, fixed slot) */}
      <div className="mt-2 min-h-[64px]">
        <div className="flex flex-wrap gap-1.5">
          {skills?.length ? (
            skills.slice(0, 6).map((s, i) => (
              <Badge key={i} variant="outline" className="px-2 py-1 text-[11px] leading-none">
                {s}
              </Badge>
            ))
          ) : (
            <Badge variant="outline" className="px-2 py-1 text-[11px] text-muted-foreground">
              Keine Skills hinterlegt
            </Badge>
          )}
        </div>
      </div>

      {/* Spacer, damit Actions/Kontakt nach unten gedrückt werden */}
      <div className="flex-1" />

      {/* 5) Actions (compact buttons) */}
      <div className="mt-2 flex h-[44px] items-center gap-2">
        <Button variant="outline" size="sm" className="h-9 flex-1 px-3 text-xs" onClick={onViewProfile}>
          <Eye className="mr-1 h-4 w-4" />
          {isUnlocked ? "Profil ansehen" : "Vorschau"}
        </Button>
        {isUnlocked && candidate.cv_url && (
          <Button variant="outline" size="sm" className="h-9 flex-1 px-3 text-xs" onClick={handleDownloadCV}>
            <Download className="mr-1 h-4 w-4" />
            CV Download
          </Button>
        )}
      </div>

      {/* 6) Kontakt (compact, always same height) */}
      {isUnlocked && (
        <div className="mt-2 h-[52px] border-t border-border pt-2 text-xs">
          <div className="flex items-center gap-1 text-muted-foreground">
            <Mail className="h-3 w-3" />
            <span className="truncate">{candidate.email ?? "—"}</span>
          </div>
          <div className="mt-0.5 flex items-center gap-1 text-muted-foreground">
            <Phone className="h-3 w-3" />
            <span className="truncate">{candidate.phone ?? "—"}</span>
          </div>
        </div>
      )}
    </article>
  );
}
