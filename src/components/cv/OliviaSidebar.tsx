// components/cv/OliviaSidebar.tsx
"use client";
import React from "react";

type Language = { name: string; level: string };
type SkillGroup = { name: string; items: string[] };
type Personal = {
  birthdate?: string | Date; // wird zu tt.mm.jjjj formatiert
  email?: string;
  phone?: string;
  address?: string;          // "Katharina-von-Bora-Straße 3, 80333 München"
  street?: string;           // optional: wenn du Street/City schon getrennt hast
  cityLine?: string;         // optional: "80333 München"
};
export type SidebarData = {
  photoUrl?: string;
  personal: Personal;
  languages: Language[];
  skills: SkillGroup[]; // aus Step 3
};

const C = {
  sidebar: "#F2EFEA",
  muted:   "#6B7280",
  rule:    "#E2DED7",
  text:    "#222222",
};

const Icon = {
  birthday: () => (
    <svg viewBox="0 0 24 24" className="w-4 h-4" fill="currentColor">
      <path d="M7 6c0 1.7 1.8 3 5 3s5-1.3 5-3c0-1.1-.9-2-2-2a2 2 0 0 0-4 0 2 2 0 1 0-4 0c-1.1 0-2 .9-2 2z"/>
      <path d="M4 11h16v9a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2v-9zm2 4h12v2H6v-2z"/>
    </svg>
  ),
  mail: () => (
    <svg viewBox="0 0 24 24" className="w-4 h-4" fill="currentColor">
      <path d="M20 4H4a2 2 0 0 0-2 2v.4l10 6.25L22 6.4V6a2 2 0 0 0-2-2z"/>
      <path d="M22 8.15 12.4 14a1 1 0 0 1-1 0L2 8.15V18a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2z"/>
    </svg>
  ),
  phone: () => (
    <svg viewBox="0 0 24 24" className="w-4 h-4" fill="currentColor">
      <path d="M6.6 10.2a15.1 15.1 0 0 0 7.2 7.2l2.4-2.4a1 1 0 0 1 1-.25 11.6 11.6 0 0 0 3.6.6 1 1 0 0 1 1 1v3.6a1 1 0 0 1-1 1A18.8 18.8 0 0 1 3 5a1 1 0 0 1 1-1h3.6a1 1 0 0 1 1 1 11.6 11.6 0 0 0 .6 3.6 1 1 0 0 1-.25 1z"/>
    </svg>
  ),
  pin: () => (
    <svg viewBox="0 0 24 24" className="w-4 h-4" fill="currentColor">
      <path d="M12 2a7 7 0 0 0-7 7c0 5.25 7 13 7 13s7-7.75 7-13a7 7 0 0 0-7-7zm0 9.5A2.5 2.5 0 1 1 14.5 9 2.5 2.5 0 0 1 12 11.5z"/>
    </svg>
  ),
};

const Heading = ({ children }:{children: React.ReactNode}) => (
  <div className="mb-2">
    <div className="tracking-[0.22em] text-[12px] mb-1" style={{ color: C.muted }}>
      {children}
    </div>
    <div style={{ height: 1, background: C.rule }} />
  </div>
);

const Row = ({ icon, children }:{icon: React.ReactNode; children: React.ReactNode}) => (
  <div className="flex items-start gap-3">
    <div className="mt-[2px] shrink-0" style={{ color: C.muted }}>
      {icon}
    </div>
    <div className="text-[13px] leading-[22px]" style={{ color: C.text }}>
      {children}
    </div>
  </div>
);

// Helpers
function formatBirthdate(d?: string | Date): string {
  if (!d) return "";
  const date = typeof d === "string" ? new Date(d) : d;
  if (isNaN(date.getTime())) {
    // wenn der String evtl. bereits „26.10.1987 – Hamburg" enthält → nur Datum extrahieren
    const m = String(d).match(/(\d{1,2})[\.\/\-](\d{1,2})[\.\/\-](\d{2,4})/);
    return m ? `${pad(m[1])}.${pad(m[2])}.${padYear(m[3])}` : String(d);
  }
  const dd = pad(String(date.getDate()));
  const mm = pad(String(date.getMonth() + 1));
  const yyyy = String(date.getFullYear());
  return `${dd}.${mm}.${yyyy}`;
}
const pad = (s: string) => s.padStart(2, "0");
const padYear = (y: string) => (y.length === 2 ? `20${y}` : y);

// „Straße & Hausnummer" auf erste Zeile, „PLZ Ort" zweite Zeile
function splitAddress(p: Personal): { line1?: string; line2?: string } {
  if (p.street || p.cityLine) return { line1: p.street, line2: p.cityLine };
  if (!p.address) return {};
  // Standard: trenne an erstem Komma
  const [l1, ...rest] = p.address.split(",").map(s => s.trim());
  return { line1: l1, line2: rest.join(", ").trim() || undefined };
}

export default function OliviaSidebar({ data }: { data: SidebarData }) {
  const p = data.personal || {};
  const { line1, line2 } = splitAddress(p);

  // Debug logging
  console.log('🔵 OliviaSidebar - data:', data);
  console.log('🔵 OliviaSidebar - photoUrl:', data.photoUrl);
  console.log('🔵 OliviaSidebar - personal:', p);

  return (
    <aside
      className="h-full"
      style={{ padding: 0, width: '100%', height: '100%' }}
    >
      {/* großes Profilfoto */}
      <div className="w-full mb-4">
        {data.photoUrl ? (
                 <img
                   src={data.photoUrl}
                   alt="Profilfoto"
                   className="w-full rounded object-cover"
                   style={{ height: '78mm' }}
            onError={(e) => {
              // Fallback wenn Bild nicht lädt
              const target = e.target as HTMLImageElement;
              target.style.display = 'none';
              const fallback = target.nextElementSibling as HTMLElement;
              if (fallback) fallback.style.display = 'flex';
            }}
          />
        ) : null}
               <div 
                 className="w-full rounded bg-gray-200 flex items-center justify-center text-gray-500 text-sm"
                 style={{ height: '78mm', display: data.photoUrl ? 'none' : 'flex' }}
               >
          Profilfoto
        </div>
      </div>

      {/* PERSONLICHES */}
      <Heading>PERSONLICHES</Heading>
      <div className="space-y-2">
        {p.birthdate && (
          <Row icon={<Icon.birthday />}>
            {formatBirthdate(p.birthdate)}
          </Row>
        )}
        {p.email && (
          <Row icon={<Icon.mail />}>{p.email}</Row>
        )}
        {p.phone && (
          <Row icon={<Icon.phone />}>{p.phone}</Row>
        )}
        {(line1 || line2) && (
          <Row icon={<Icon.pin />}>
            <div>
              {line1 && <div>{line1}</div>}
              {line2 && <div>{line2}</div>}
            </div>
          </Row>
        )}
      </div>

      {/* SPRACHEN */}
      {data.languages?.length ? (
        <>
          <div className="h-4" />
          <Heading>SPRACHEN</Heading>
          <div className="space-y-1">
            {data.languages.map((l, i) => (
              <div key={i} className="text-[13px]">
                <span className="font-semibold">{l.name.toUpperCase()}</span>{" "}
                <span className="text-[13px]" style={{ color: C.muted }}>
                  ({l.level})
                </span>
              </div>
            ))}
          </div>
        </>
      ) : null}

      {/* FÄHIGKEITEN (statt „Qualifikationen") */}
      {data.skills?.length ? (
        <>
          <div className="h-4" />
          <Heading>FÄHIGKEITEN</Heading>
          <div className="space-y-2">
            {data.skills.map((g, i) => (
              <div key={i}>
                <ul className="list-none m-0 p-0 text-[13px] leading-[22px]">
                  {g.items.map((it, j) => (
                    <li key={j} className="flex items-center gap-2">
                      <span className="text-[10px]">•</span>
                      <span>{it}</span>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </>
      ) : null}
    </aside>
  );
}
