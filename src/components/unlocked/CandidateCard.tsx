import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Heart, MapPin, Car, Briefcase, Mail, Phone, Download, Eye } from "lucide-react";
import { useState } from "react";

type CandidateCardProps = {
  name: string;
  matchPercent?: number;
  avatarUrl?: string;
  role?: string;
  city?: string;
  hasLicense?: boolean;
  seeking?: string;
  skills: string[];
  email?: string;
  phone?: string;
  profileHref: string;
  onDownloadCV?: () => void;
  onToggleFavorite?: () => void;
  isFavorite?: boolean;
};

export function CandidateCard(p: CandidateCardProps) {
  const match = Math.round(p.matchPercent ?? 0);
  const [isFavorite, setIsFavorite] = useState(p.isFavorite ?? false);

  const handleToggleFavorite = () => {
    setIsFavorite(!isFavorite);
    p.onToggleFavorite?.();
  };

  return (
    <article className="ab-card flex h-full flex-col rounded-xl border bg-card p-3 shadow-sm transition-shadow hover:shadow-md">
      {/* 1) Header (compact) */}
      <div className="flex min-h-[48px] items-start justify-between gap-2">
        <div className="flex items-center gap-2">
          <Avatar className="h-10 w-10">
            <AvatarImage src={p.avatarUrl} />
            <AvatarFallback className="text-sm">{p.name.charAt(0)}</AvatarFallback>
          </Avatar>
          <div className="min-w-0">
            <h3 className="truncate text-sm font-semibold text-foreground">{p.name}</h3>
            {p.role && <div className="truncate text-xs text-muted-foreground">{p.role}</div>}
          </div>
        </div>
        <div className="flex shrink-0 items-center gap-1">
          {/* Match */}
          <div className="flex items-center gap-1 rounded-full bg-secondary px-2 py-1">
            <div className="h-2 w-2 rounded-full bg-yellow-500" />
            <span className="text-xs font-semibold text-emerald-600">{match}% Match</span>
          </div>
          {/* Fav */}
          <Button
            variant="ghost"
            size="sm"
            onClick={handleToggleFavorite}
            className="h-6 w-6 p-0 text-muted-foreground hover:text-foreground"
            title="Merken"
            aria-label="Merken"
          >
            <Heart className={`h-4 w-4 ${isFavorite ? 'fill-red-500 text-red-500' : ''}`} />
          </Button>
        </div>
      </div>

      {/* 2) Meta (compact) */}
      <div className="mt-1 grid min-h-[48px] grid-cols-1 gap-1 text-xs text-muted-foreground">
        {p.role && (
          <div className="flex items-center gap-1">
            <Briefcase className="h-3 w-3" />
            <span>Azubi</span>
          </div>
        )}
        {p.city && (
          <div className="flex items-center gap-1">
            <MapPin className="h-3 w-3" />
            <span className="truncate">{p.city}</span>
          </div>
        )}
        {p.hasLicense && (
          <div className="flex items-center gap-1">
            <Car className="h-3 w-3" />
            <span>Führerschein</span>
          </div>
        )}
      </div>

      {/* 3) Intent (Sucht) */}
      <div className="mt-1 min-h-[36px]">
        {p.seeking ? (
          <>
            <div className="text-xs font-medium text-emerald-600">Sucht:</div>
            <div className="line-clamp-2 text-xs text-emerald-700">
              {p.seeking}
            </div>
          </>
        ) : (
          <div className="text-xs text-muted-foreground">Keine Präferenz angegeben</div>
        )}
      </div>

      {/* 4) Skills (small pills, wrap, fixed slot) */}
      <div className="mt-2 min-h-[64px]">
        <div className="flex flex-wrap gap-1.5">
          {p.skills?.length ? p.skills.map((s, i) => (
            <Badge key={i} variant="outline" className="text-[11px] px-2 py-1 leading-none">
              {s}
            </Badge>
          )) : (
            <Badge variant="outline" className="text-[11px] px-2 py-1 text-muted-foreground">
              Keine Skills hinterlegt
            </Badge>
          )}
        </div>
      </div>

      {/* Spacer, damit Actions/Kontakt nach unten gedrückt werden */}
      <div className="flex-1" />

      {/* 5) Actions (compact buttons) */}
      <div className="mt-2 flex h-[44px] items-center gap-2">
        <Button variant="outline" size="sm" className="h-9 flex-1 text-xs px-3" asChild>
          <a href={p.profileHref}>
            <Eye className="mr-1 h-4 w-4" />
            Profil ansehen
          </a>
        </Button>
        <Button variant="outline" size="sm" className="h-9 flex-1 text-xs px-3" onClick={p.onDownloadCV}>
          <Download className="mr-1 h-4 w-4" />
          CV Download
        </Button>
      </div>

      {/* 6) Kontakt (compact, always same height) */}
      <div className="mt-2 h-[52px] border-t border-border pt-2 text-xs">
        <div className="flex items-center gap-1 text-muted-foreground">
          <Mail className="h-3 w-3" />
          <span className="truncate">{p.email ?? "—"}</span>
        </div>
        <div className="mt-0.5 flex items-center gap-1 text-muted-foreground">
          <Phone className="h-3 w-3" />
          <span className="truncate">{p.phone ?? "—"}</span>
        </div>
      </div>
    </article>
  );
}