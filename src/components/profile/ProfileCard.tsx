import React from "react";
import { Heart, Eye, Download, MapPin, Car, Briefcase, User, Mail, Phone } from "lucide-react";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";

export type Profile = {
  id: string;
  name: string;                 // Display name (first name in search/dashboard, full name in unlocked)
  avatar_url?: string | null;
  role?: string | null;         // e.g. "IT", "Handwerk"
  city?: string | null;
  fs?: boolean | null;          // Führerschein
  seeking?: string | null;      // e.g. "Ausbildungsplatzwechsel"
  status?: string | null;       // schüler | azubi | geselle (o.ä.)
  email?: string | null;        // only shown when unlocked
  phone?: string | null;        // only shown when unlocked
  skills: string[];             // show all
  match?: number | null;        // 0..100
};

type Props = {
  profile: Profile;
  variant?: "search" | "dashboard" | "unlocked";
  onUnlock?: () => void;
  onView?: () => void;
  onDownload?: () => void;
  onToggleFavorite?: () => void;
};

export function ProfileCard({
  profile: p,
  variant = "search",
  onUnlock,
  onView,
  onDownload,
  onToggleFavorite,
}: Props) {
  const match = Math.round(p.match ?? 0);

  return (
    <article className="ab-card flex h-full w-full max-w-[280px] flex-col rounded-xl border bg-white p-3 shadow-sm">
      {/* 1) Header - Anonymous for locked, full for unlocked */}
      <div className="flex min-h-[48px] items-start justify-between gap-2">
        <div className="flex items-center gap-2">
          <Avatar className="h-12 w-12">
            <AvatarImage src={p.avatar_url || ""} />
            <AvatarFallback className="bg-gradient-to-br from-blue-100 to-blue-200">
              {variant === "unlocked" && p.name ? (
                p.name.split(' ').map(n => n.charAt(0)).join('').substring(0, 2)
              ) : (
                <User className="h-5 w-5 text-blue-600" />
              )}
            </AvatarFallback>
          </Avatar>
          <div className="min-w-0">
            <h3 className="truncate text-sm font-semibold">{p.name}</h3>
            {(p.role || p.status) && (
              <div className="truncate text-xs text-gray-600">{p.status ?? p.role}</div>
            )}
          </div>
        </div>
        <div className="flex shrink-0 items-center gap-1">
          {p.match != null && (
            <span className="flex items-center gap-1 rounded-full bg-gray-100 px-2 py-1">
              <span className="h-2 w-2 rounded-full bg-yellow-400" />
              <span className="text-xs font-semibold text-emerald-600">{match}%</span>
            </span>
          )}
          <button
            onClick={onToggleFavorite}
            className="rounded-full p-1 text-gray-500 hover:bg-gray-50 hover:text-gray-700"
            title="Merken"
            aria-label="Merken"
          >
            <Heart className="h-4 w-4" />
          </button>
        </div>
      </div>

      {/* 2) Meta */}
      <div className="mt-1 grid min-h-[48px] grid-cols-1 gap-1 text-[12px] text-gray-700">
        {(p.status || p.role) && (
          <div className="flex items-center gap-1">
            <Briefcase className="h-3 w-3 text-gray-400" />
            <span className="truncate">{p.status ?? p.role}</span>
          </div>
        )}
        {p.city && (
          <div className="flex items-center gap-1">
            <MapPin className="h-3 w-3 text-gray-400" />
            <span className="truncate">{p.city}</span>
          </div>
        )}
        {p.fs && (
          <div className="flex items-center gap-1">
            <Car className="h-3 w-3 text-gray-400" />
            <span>Führerschein</span>
          </div>
        )}
        {/* UNLOCKED: Zeige zusätzliche Kontaktdaten */}
        {variant === "unlocked" && p.email && (
          <div className="flex items-center gap-1">
            <Mail className="h-3 w-3 text-gray-400" />
            <span className="truncate">{p.email}</span>
          </div>
        )}
        {variant === "unlocked" && p.phone && (
          <div className="flex items-center gap-1">
            <Phone className="h-3 w-3 text-gray-400" />
            <span className="truncate">{p.phone}</span>
          </div>
        )}
      </div>

      {/* 3) Intent */}
      <div className="mt-1 min-h-[36px]">
        {p.seeking ? (
          <>
            <div className="text-[12px] font-medium text-emerald-600">Sucht:</div>
            <div className="line-clamp-2 text-[12px] text-emerald-700">{p.seeking}</div>
          </>
        ) : (
          <div className="text-[12px] text-gray-400">Keine Präferenz angegeben</div>
        )}
      </div>

      {/* 4) Skills */}
      <div className="mt-2 min-h-[64px]">
        <div className="flex flex-wrap gap-1.5">
          {p.skills?.length ? (
            p.skills.map((s, i) => (
              <span key={i} className="rounded-full bg-gray-100 px-2 py-1 text-[11px] leading-none text-gray-800">
                {s}
              </span>
            ))
          ) : (
            <span className="rounded-full bg-gray-50 px-2 py-1 text-[11px] text-gray-400">
              Keine Skills hinterlegt
            </span>
          )}
        </div>
      </div>

      {/* 4.5) Contact info (only when unlocked) */}
      {variant === "unlocked" && (p.email || p.phone) && (
        <div className="mt-2 space-y-1 text-[12px]">
          {p.email && (
            <div className="flex items-center gap-1 text-gray-700">
              <Mail className="h-3 w-3 text-gray-400" />
              <a href={`mailto:${p.email}`} className="truncate hover:underline">{p.email}</a>
            </div>
          )}
          {p.phone && (
            <div className="flex items-center gap-1 text-gray-700">
              <Phone className="h-3 w-3 text-gray-400" />
              <a href={`tel:${p.phone}`} className="truncate hover:underline">{p.phone}</a>
            </div>
          )}
        </div>
      )}

      <div className="flex-1" />

      {/* 5) Actions - Same for dashboard and search variants now */}
      <div className="mt-2 flex h-[44px] items-center gap-2">
        {variant === "unlocked" && (
          <>
            <button 
              onClick={onView} 
              className="inline-flex h-9 flex-1 items-center justify-center gap-1 rounded-lg border px-3 text-xs hover:bg-gray-50"
            >
              <Eye className="h-4 w-4" />
              <span>Profil ansehen</span>
            </button>
            <button 
              onClick={onDownload} 
              className="inline-flex h-9 flex-1 items-center justify-center gap-1 rounded-lg border px-3 text-xs hover:bg-gray-50"
            >
              <Download className="h-4 w-4" />
              <span>CV Download</span>
            </button>
          </>
        )}
        {(variant === "search" || variant === "dashboard") && (
          <button 
            onClick={onUnlock} 
            className="w-full rounded-lg bg-blue-600 px-3 py-2 text-center text-xs text-white hover:bg-blue-700"
          >
            Freischalten (1 Token)
          </button>
        )}
      </div>
    </article>
  );
}