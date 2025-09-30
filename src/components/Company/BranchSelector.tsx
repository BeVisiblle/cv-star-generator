import { useEffect, useMemo, useState } from "react";
import { Input } from "@/components/ui/input";

interface BranchSelectorProps {
  selectedBranches: string[];
  onSelectionChange: (branches: string[]) => void;
  error?: string;
  customIndustry?: string;
  onCustomIndustryChange?: (value: string) => void;
}

const branches = [
  { key: "handwerk", emoji: "👷", title: "Handwerk", desc: "Bau, Elektro, Sanitär, KFZ und mehr" },
  { key: "it", emoji: "💻", title: "IT", desc: "Programmierung, Support, Systemadmin" },
  { key: "gesundheit", emoji: "🩺", title: "Gesundheit", desc: "Pflege, Therapie, medizinische Assistenz" },
  { key: "buero", emoji: "📊", title: "Büro & Verwaltung", desc: "Organisation, Kommunikation, Administration" },
  { key: "verkauf", emoji: "🛍️", title: "Verkauf & Handel", desc: "Beratung, Kundenservice, Einzelhandel" },
  { key: "gastronomie", emoji: "🍽️", title: "Gastronomie", desc: "Service, Küche, Hotellerie" },
  { key: "bau", emoji: "🏗️", title: "Bau & Architektur", desc: "Konstruktion, Planung, Ausführung" }
];

const gradients: Record<string, string> = {
  handwerk: "from-blue-100 via-blue-50 to-white",
  it: "from-indigo-100 via-indigo-50 to-white",
  gesundheit: "from-sky-100 via-blue-50 to-white",
  buero: "from-blue-100 via-sky-50 to-white",
  verkauf: "from-blue-100 via-indigo-50 to-white",
  gastronomie: "from-slate-100 via-blue-50 to-white",
  bau: "from-indigo-100 via-blue-50 to-white",
  custom: "from-blue-50 via-white to-blue-100",
};

const labels: Record<string, string> = {
  handwerk: "Baunetz & Werkstätten",
  it: "Digitale Lösungen",
  gesundheit: "Medizin & Pflege",
  buero: "Office & Verwaltung",
  verkauf: "Handel & Service",
  gastronomie: "Gastro & Tourismus",
  bau: "Planung & Bau",
  custom: "Eigene Branche",
};

const CUSTOM_KEY = "custom";

export function BranchSelector({ selectedBranches, onSelectionChange, error, customIndustry, onCustomIndustryChange }: BranchSelectorProps) {
  const [customValue, setCustomValue] = useState(customIndustry ?? "");

  useEffect(() => {
    setCustomValue(customIndustry ?? "");
  }, [customIndustry]);

  const hasStandardSelection = useMemo(() => selectedBranches.some(key => key !== CUSTOM_KEY), [selectedBranches]);
  const customSelected = selectedBranches.includes(CUSTOM_KEY);
  const canSelectCustom = !hasStandardSelection || customSelected;

  const toggleBranch = (branchKey: string) => {
    if (branchKey === CUSTOM_KEY) {
      if (!canSelectCustom) {
        return;
      }

      if (customSelected) {
        onSelectionChange(selectedBranches.filter(key => key !== CUSTOM_KEY));
        onCustomIndustryChange?.("");
      } else {
        onSelectionChange([CUSTOM_KEY]);
      }
      return;
    }

    const filtered = selectedBranches.filter(key => key !== CUSTOM_KEY);
    if (filtered.includes(branchKey)) {
      onSelectionChange(filtered.filter(key => key !== branchKey));
    } else {
      onSelectionChange([...filtered, branchKey]);
    }
    if (customSelected) {
      onCustomIndustryChange?.("");
    }
  };

  const handleCustomFocus = () => {
    if (!customSelected && canSelectCustom) {
      onSelectionChange([CUSTOM_KEY]);
    }
  };

  const handleCustomChange = (value: string) => {
    setCustomValue(value);
    onCustomIndustryChange?.(value);
  };

  return (
    <div className="space-y-3">
      <div>
        <h3 className="text-lg font-semibold mb-1">Branchen</h3>
        <p className="text-sm text-muted-foreground">Mehrfachauswahl möglich.</p>
        {error && (
          <p className="text-sm text-destructive font-medium mt-1">{error}</p>
        )}
      </div>

      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
        {branches.map((branch) => {
          const isSelected = selectedBranches.includes(branch.key) && branch.key !== CUSTOM_KEY;

          return (
            <button
              type="button"
              key={branch.key}
              onClick={() => toggleBranch(branch.key)}
              aria-pressed={isSelected}
              className={`group flex h-full flex-col justify-between gap-4 rounded-3xl border border-slate-200/70 bg-white p-6 text-left shadow-sm transition-all focus:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 ${
                isSelected
                  ? `border-primary/70 bg-gradient-to-r ${gradients[branch.key] ?? "from-white to-white"} shadow-lg shadow-primary/20`
                  : "hover:-translate-y-0.5 hover:shadow-md"
              } ${error ? "border-destructive/70" : ""}`}
            >
              <div className="space-y-3">
                <span className="flex h-14 w-14 items-center justify-center rounded-2xl bg-primary/10 text-3xl leading-none text-primary">
                  {branch.emoji}
                </span>
                <div className="space-y-1">
                  <h4 className="text-lg font-semibold text-slate-900">
                    {branch.title}
                  </h4>
                  <p className="text-[11px] font-medium uppercase tracking-wide text-primary/70">
                    {labels[branch.key] || branch.title}
                  </p>
                </div>
              </div>

              <p className="text-xs leading-snug text-muted-foreground sm:text-sm">
                {branch.desc}
              </p>
            </button>
          );
        })}

        <button
          type="button"
          onClick={() => toggleBranch(CUSTOM_KEY)}
          aria-pressed={customSelected}
          className={`group flex h-full flex-col justify-between gap-4 rounded-3xl border border-slate-200/70 bg-white p-6 text-left shadow-sm transition-all focus:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 ${
            customSelected
              ? `border-primary/70 bg-gradient-to-r ${gradients.custom} shadow-lg shadow-primary/20`
              : canSelectCustom
                ? "hover:-translate-y-0.5 hover:shadow-md"
                : "bg-white/70 opacity-60"
          } ${error ? "border-destructive/70" : ""}`}
          disabled={!canSelectCustom}
        >
          <div className="space-y-3">
            <span className="flex h-14 w-14 items-center justify-center rounded-2xl bg-primary/10 text-3xl leading-none text-primary">
              ✨
            </span>
            <div className="space-y-1">
              <h4 className="text-lg font-semibold text-slate-900">
                Andere Branche
              </h4>
              <p className="text-[11px] font-medium uppercase tracking-wide text-primary/70">
                Eigenen Bereich angeben
              </p>
            </div>
          </div>

          <div className="space-y-2 w-full">
            <Input
              value={customValue}
              onFocus={handleCustomFocus}
              onChange={(event) => handleCustomChange(event.target.value)}
              onClick={(event) => event.stopPropagation()}
              placeholder="z. B. Bildung, Energie"
              disabled={!customSelected}
            />
            <p className="text-[11px] text-muted-foreground">Nur aktiv, wenn keine Standard-Branche gewählt ist.</p>
          </div>
        </button>
      </div>
    </div>
  );
}

export const branchLabelMap = Object.fromEntries(branches.map(({ key, title }) => [key, title]));