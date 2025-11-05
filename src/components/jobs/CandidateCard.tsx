import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Heart, MapPin, Car, Briefcase, Mail, Phone, Download, Eye, User, Unlock } from "lucide-react";
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
  variant?: "preview" | "unlocked" | "unlocked-actions";
  linkedJobTitles?: Array<{ id: string; title: string }>;
  unlockReason?: string;
  unlockSource?: "bewerbung" | "initiativ";
  unlockNotes?: string;
  appliedAt?: string;
  unlockedAt?: string;
  onViewProfile?: () => void;
  onDownloadCV?: () => void;
  onUnlock?: () => void;
  onToggleFavorite?: () => void;
  onAcceptInterview?: () => void;
  onReject?: () => void;
  isFavorite?: boolean;
};

export function CandidateCard(p: CandidateCardProps) {
  const variant = p.variant || "preview";
  const match = Math.round(p.matchPercent ?? 0);
  const [isFavorite, setIsFavorite] = useState(p.isFavorite ?? false);

  const handleToggleFavorite = () => {
    setIsFavorite(!isFavorite);
    p.onToggleFavorite?.();
  };

  // For preview mode: show only first name
  const displayName = variant === "preview" && p.name.includes(" ") 
    ? p.name.split(" ")[0] 
    : p.name;

  return (
    <article className="ab-card flex h-full w-full sm:max-w-full flex-col rounded-xl border bg-card p-3 shadow-sm transition-shadow hover:shadow-md">
      {/* Status Badges */}
      {p.appliedAt && (
        <Badge variant="default" className="mb-2 bg-green-600 text-white">
          ✓ Beworben am {new Date(p.appliedAt).toLocaleDateString('de-DE')}
        </Badge>
      )}
      {!p.appliedAt && p.unlockedAt && (
        <Badge variant="secondary" className="mb-2">
          🔓 Freigeschaltet
        </Badge>
      )}
      
      {/* 1) Header */}
      <div className="flex min-h-[48px] items-start justify-between gap-2">
        <div className="flex items-center gap-2">
          <Avatar className="h-9 w-9 sm:h-10 sm:w-10">
            {variant === "preview" ? (
              <AvatarFallback className="bg-gradient-to-br from-blue-100 to-blue-200">
                <User className="h-5 w-5 text-blue-600" />
              </AvatarFallback>
            ) : (
              <>
                <AvatarImage src={p.avatarUrl} />
                <AvatarFallback className="text-sm">{p.name.charAt(0)}</AvatarFallback>
              </>
            )}
          </Avatar>
          <div className="min-w-0">
            <h3 className="truncate text-sm font-semibold text-foreground">{displayName}</h3>
            {p.role && <div className="truncate text-xs text-muted-foreground">{p.role}</div>}
            
            {/* Unlock Reason Badge */}
            {(variant === "unlocked" || variant === "unlocked-actions") && p.unlockReason && (
              <Badge variant="secondary" className="mt-1 text-[10px]">
                {p.unlockReason}
              </Badge>
            )}
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

      {/* 2) Meta */}
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

      {/* 3) Intent (Sucht / Linked Jobs) */}
      <div className="mt-1 min-h-[36px]">
        {p.linkedJobTitles && p.linkedJobTitles.length > 0 ? (
          <>
            <div className="text-xs font-medium text-primary">Hat sich beworben auf:</div>
            <div className="mt-1 space-y-0.5">
              {p.linkedJobTitles.map((job) => (
                <div key={job.id} className="truncate text-xs text-muted-foreground">
                  • {job.title}
                </div>
              ))}
            </div>
          </>
        ) : p.seeking ? (
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

      {/* 4) Skills */}
      <div className="mt-2 min-h-[64px]">
        <div className="flex flex-wrap gap-1.5">
          {(p.skills && Array.isArray(p.skills) && p.skills.length > 0) ? (
            p.skills.map((s, i) => (
              <Badge key={i} variant="outline" className="text-[11px] px-2 py-1 leading-none">
                {s}
              </Badge>
            ))
          ) : (
            <Badge variant="outline" className="text-[11px] px-2 py-1 text-muted-foreground">
              Keine Skills hinterlegt
            </Badge>
          )}
        </div>
      </div>

      {/* Spacer */}
      <div className="flex-1" />

      {/* 5) Actions */}
      <div className="mt-2 flex h-[44px] items-center gap-2">
        {variant === "preview" && (
          <>
            {/* ✅ Preview Button: Opens UnlockProfileModal with onViewProfile */}
            <Button variant="outline" size="sm" className="h-9 flex-1 text-xs px-3" onClick={p.onViewProfile}>
              <Eye className="mr-1 h-4 w-4" />
              Vorschau
            </Button>
            <Button variant="default" size="sm" className="h-9 flex-1 text-xs px-3" onClick={p.onUnlock}>
              <Unlock className="mr-1 h-4 w-4" />
              Freischalten
            </Button>
          </>
        )}
        {(variant === "unlocked" || variant === "unlocked-actions") && (
          <>
            <Button variant="outline" size="sm" className="h-9 flex-1 text-xs px-3" onClick={p.onViewProfile}>
              <Eye className="mr-1 h-4 w-4" />
              Profil ansehen
            </Button>
            <Button variant="outline" size="sm" className="h-9 flex-1 text-xs px-3" onClick={p.onDownloadCV}>
              <Download className="mr-1 h-4 w-4" />
              CV Download
            </Button>
          </>
        )}
      </div>

      {/* 6) Unlocked Actions (Interview / Ablehnen) */}
      {variant === "unlocked-actions" && (
        <div className="mt-2 flex gap-2">
          <Button variant="default" size="sm" className="h-9 flex-1 text-xs" onClick={p.onAcceptInterview}>
            ✅ Interview planen
          </Button>
          <Button variant="outline" size="sm" className="h-9 flex-1 text-xs" onClick={p.onReject}>
            ❌ Absagen
          </Button>
        </div>
      )}

      {/* 7) Contact (only unlocked variants) */}
      {(variant === "unlocked" || variant === "unlocked-actions") && (
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
      )}
    </article>
  );
}
