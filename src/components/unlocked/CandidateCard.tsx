import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Heart, MapPin, Car, Briefcase, Mail, Phone, Download, Eye, Search } from "lucide-react";
import { useState, useMemo } from "react";

type CandidateCardProps = {
  name: string;
  matchPercent?: number;
  avatarUrl?: string;
  role?: string;
  city?: string;
  hasLicense?: boolean;
  seeking?: string;
  jobSearchPreferences?: string[];
  skills: string[];
  email?: string;
  phone?: string;
  profileHref: string;
  onDownloadCV?: () => void;
  onToggleFavorite?: () => void;
  onAcceptInterview?: () => void;
  onReject?: () => void;
  isFavorite?: boolean;
};

export function CandidateCard(p: CandidateCardProps) {
  const match = Math.round(p.matchPercent ?? 0);
  const [isFavorite, setIsFavorite] = useState(p.isFavorite ?? false);

  const handleToggleFavorite = () => {
    setIsFavorite(!isFavorite);
    p.onToggleFavorite?.();
  };

  // Calculate status info from job search preferences
  const statusInfo = useMemo(() => {
    const prefs = p.jobSearchPreferences;
    if (!prefs || prefs.length === 0) {
      return null;
    }
    
    let label = "Sucht: ";
    let bgClass = "";
    let textClass = "";
    let borderClass = "";
    
    if (prefs.includes("Praktikum") && prefs.includes("Ausbildung")) {
      label += "Praktikum & Ausbildung";
      bgClass = "bg-amber-50 dark:bg-amber-950";
      textClass = "text-amber-700 dark:text-amber-300";
      borderClass = "border-amber-200 dark:border-amber-800";
    } else if (prefs.includes("Ausbildung")) {
      label += "Ausbildung";
      bgClass = "bg-green-50 dark:bg-green-950";
      textClass = "text-green-700 dark:text-green-300";
      borderClass = "border-green-200 dark:border-green-800";
    } else if (prefs.includes("Praktikum")) {
      label += "Praktikum";
      bgClass = "bg-red-50 dark:bg-red-950";
      textClass = "text-red-700 dark:text-red-300";
      borderClass = "border-red-200 dark:border-red-800";
    } else if (prefs.includes("Nach der Ausbildung einen Job")) {
      label += "Job nach Ausbildung";
      bgClass = "bg-blue-50 dark:bg-blue-950";
      textClass = "text-blue-700 dark:text-blue-300";
      borderClass = "border-blue-200 dark:border-blue-800";
    } else if (prefs.includes("Ausbildungsplatzwechsel")) {
      label += "Ausbildungsplatzwechsel";
      bgClass = "bg-purple-50 dark:bg-purple-950";
      textClass = "text-purple-700 dark:text-purple-300";
      borderClass = "border-purple-200 dark:border-purple-800";
    } else {
      label += prefs.join(", ");
      bgClass = "bg-slate-50 dark:bg-slate-950";
      textClass = "text-slate-700 dark:text-slate-300";
      borderClass = "border-slate-200 dark:border-slate-800";
    }
    
    return { label, bgClass, textClass, borderClass };
  }, [p.jobSearchPreferences]);

  return (
    <article className="ab-card flex h-full w-full sm:max-w-full flex-col rounded-xl border bg-card p-3 shadow-sm transition-shadow hover:shadow-md">
      {/* Status Banner */}
      {statusInfo && (
        <div className={`flex items-center gap-2 p-2 rounded-lg border mb-3 ${statusInfo.bgClass} ${statusInfo.borderClass}`}>
          <Search className={`h-4 w-4 ${statusInfo.textClass}`} />
          <span className={`text-sm font-medium ${statusInfo.textClass}`}>
            {statusInfo.label}
          </span>
        </div>
      )}

      {/* 1) Header (compact) */}
      <div className="flex min-h-[48px] items-start justify-between gap-2">
        <div className="flex items-center gap-2">
          <Avatar className="h-9 w-9 sm:h-10 sm:w-10">
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

      {/* 5) Actions - Interview & Ablehnen */}
      <div className="mt-2 flex h-[44px] items-center gap-2">
        <Button variant="outline" size="sm" className="h-9 flex-1 text-xs px-3" onClick={p.onReject}>
          ❌ Absagen
        </Button>
        <Button variant="default" size="sm" className="h-9 flex-1 text-xs px-3" onClick={p.onAcceptInterview}>
          ✅ Interview planen
        </Button>
      </div>

      {/* 6) Actions - Profil & CV */}
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

      {/* 7) Kontakt */}
      <div className="mt-2 border-t border-border pt-2">
        <div className="flex items-center gap-1 text-xs mb-1">
          <Mail className="h-3 w-3 text-blue-600" />
          <a 
            href={`mailto:${p.email}`} 
            className="truncate text-blue-600 hover:underline"
            onClick={(e) => e.stopPropagation()}
          >
            {p.email ?? "—"}
          </a>
        </div>
        <div className="flex items-center gap-1 text-xs">
          <Phone className="h-3 w-3 text-green-600" />
          <a 
            href={`tel:${p.phone}`} 
            className="truncate text-green-600 hover:underline"
            onClick={(e) => e.stopPropagation()}
          >
            {p.phone ?? "—"}
          </a>
        </div>
      </div>
    </article>
  );
}