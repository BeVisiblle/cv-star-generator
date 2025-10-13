import React from "react";
import { Badge } from "@/components/ui/badge";
import { useLocation, useNavigate, useSearchParams } from "react-router-dom";

interface FilterChipsBarProps {
  className?: string;
}

const categories = [
  { id: "people", label: "Personen" },
  { id: "companies", label: "Unternehmen" },
  { id: "posts", label: "Beiträge" },
  { id: "groups", label: "Gruppen" },
] as const;

const extraFilters: Record<string, string[]> = {
  people: ["Standorte", "Aktuelle Schule", "Arbeitgeber", "Beruf", "Alle Filter"],
  companies: ["Standorte", "Branche", "Unternehmensgröße", "Alle Filter"],
  posts: ["Sortieren nach", "Veröffentlicht am", "Art des Inhalts", "Vom Mitglied", "Alle Filter"],
  groups: ["Standorte", "Alle Filter"],
};

export default function FilterChipsBar({ className }: FilterChipsBarProps) {
  const [params] = useSearchParams();
  const navigate = useNavigate();
  const location = useLocation();

  const q = params.get("q") || "";
  const type = (params.get("type") || "").toLowerCase();

  const setType = (t: string) => {
    const sp = new URLSearchParams(params);
    sp.set("type", t);
    navigate(`${location.pathname}?${sp.toString()}`);
  };
  const clearType = () => {
    const sp = new URLSearchParams(params);
    sp.delete("type");
    navigate(`${location.pathname}?${sp.toString()}`);
  };

  const filters = extraFilters[type] || [];

  return (
    <div className={"w-full flex flex-wrap items-center gap-2 " + (className ?? "")}>
      {/* Reset */}
      <Badge
        variant={type === "" ? "default" : "secondary"}
        className="cursor-pointer select-none px-4 py-2.5 md:px-3 md:py-2 text-base md:text-sm min-h-[44px] md:min-h-0 active:scale-95 transition-transform"
        onClick={clearType}
      >
        Alle
      </Badge>

      {/* Primary categories */}
      {categories.map((c) => (
        <Badge
          key={c.id}
          variant={type === c.id ? "default" : "secondary"}
          className="cursor-pointer select-none px-4 py-2.5 md:px-3 md:py-2 text-base md:text-sm min-h-[44px] md:min-h-0 active:scale-95 transition-transform"
          onClick={() => setType(c.id)}
        >
          {c.label}
        </Badge>
      ))}

      {/* Divider */}
      <span className="mx-1 h-5 w-px bg-border" aria-hidden />

      {/* Type‑specific filters (non‑funktional Platzhalter) */}
      {type && filters.map((f) => (
        <Badge key={f} variant="secondary" className="cursor-pointer select-none px-4 py-2.5 md:px-3 md:py-2 text-base md:text-sm min-h-[44px] md:min-h-0 active:scale-95 transition-transform">
          {f}
        </Badge>
      ))}
    </div>
  );
}
