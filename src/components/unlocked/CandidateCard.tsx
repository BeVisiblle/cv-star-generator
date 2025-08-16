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
    <article className="ab-card flex h-full flex-col rounded-2xl border bg-card p-4 shadow-sm transition-shadow hover:shadow-md">
      {/* 1) Header */}
      <div className="flex min-h-[56px] items-start justify-between gap-3">
        <div className="flex items-center gap-3">
          <Avatar className="h-12 w-12">
            <AvatarImage src={p.avatarUrl} />
            <AvatarFallback>{p.name.charAt(0)}</AvatarFallback>
          </Avatar>
          <div className="min-w-0">
            <h3 className="truncate text-base font-semibold text-foreground">{p.name}</h3>
            {p.role && <div className="truncate text-sm text-muted-foreground">{p.role}</div>}
          </div>
        </div>
        <div className="flex shrink-0 items-center gap-2">
          {/* Match */}
          <Badge variant="secondary" className="gap-1">
            <div className="h-2 w-2 rounded-full bg-yellow-500" />
            {match}% Match
          </Badge>
          {/* Fav */}
          <Button
            variant="ghost"
            size="sm"
            onClick={handleToggleFavorite}
            className="h-8 w-8 p-0"
            title="Merken"
            aria-label="Merken"
          >
            <Heart className={`h-4 w-4 ${isFavorite ? 'fill-red-500 text-red-500' : 'text-muted-foreground'}`} />
          </Button>
        </div>
      </div>

      {/* 2) Meta */}
      <div className="mt-2 grid min-h-[54px] grid-cols-1 gap-1 text-sm text-muted-foreground">
        {p.role && (
          <div className="flex items-center gap-2">
            <Briefcase className="h-4 w-4" />
            <span>Azubi</span>
          </div>
        )}
        {p.city && (
          <div className="flex items-center gap-2">
            <MapPin className="h-4 w-4" />
            <span className="truncate">{p.city}</span>
          </div>
        )}
        {p.hasLicense && (
          <div className="flex items-center gap-2">
            <Car className="h-4 w-4" />
            <span>Führerschein</span>
          </div>
        )}
      </div>

      {/* 3) Intent (Sucht) */}
      <div className="mt-1 min-h-[44px]">
        {p.seeking ? (
          <>
            <div className="text-sm font-medium text-emerald-600">Sucht:</div>
            <div className="text-sm text-emerald-700">
              {p.seeking}
            </div>
          </>
        ) : (
          <div className="text-sm text-muted-foreground">Keine Präferenz angegeben</div>
        )}
      </div>

      {/* 4) Skills (immer alle anzeigen; Wrap) */}
      <div className="mt-2 min-h-[72px]">
        <div className="flex flex-wrap gap-2">
          {p.skills?.length ? p.skills.map((s, i) => (
            <Badge key={i} variant="outline" className="text-xs">
              {s}
            </Badge>
          )) : (
            <Badge variant="outline" className="text-xs text-muted-foreground">
              Keine Skills hinterlegt
            </Badge>
          )}
        </div>
      </div>

      {/* Spacer, damit Actions/Kontakt nach unten gedrückt werden */}
      <div className="flex-1" />

      {/* 5) Actions */}
      <div className="mt-3 flex h-[56px] items-center gap-3">
        <Button variant="outline" className="flex-1" asChild>
          <a href={p.profileHref}>
            <Eye className="mr-2 h-4 w-4" />
            Profil ansehen
          </a>
        </Button>
        <Button variant="outline" className="flex-1" onClick={p.onDownloadCV}>
          <Download className="mr-2 h-4 w-4" />
          CV Download
        </Button>
      </div>

      {/* 6) Kontakt (immer gleiche Höhe + Divider) */}
      <div className="mt-3 h-[60px] border-t border-border pt-3 text-sm">
        <div className="flex items-center gap-2 text-muted-foreground">
          <Mail className="h-4 w-4" />
          <span className="truncate">{p.email ?? "—"}</span>
        </div>
        <div className="mt-1 flex items-center gap-2 text-muted-foreground">
          <Phone className="h-4 w-4" />
          <span className="truncate">{p.phone ?? "—"}</span>
        </div>
      </div>
    </article>
  );
}