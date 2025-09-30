interface TargetGroupSelectorProps {
  selectedGroups: string[];
  onSelectionChange: (groups: string[]) => void;
  error?: string;
}

const targetGroupOptions = [
  { id: "schueler", emoji: "🎓", label: "Schüler", tagline: "Frühe Bindung", desc: "Praktika, Schülerjobs und erste Erfahrungen" },
  { id: "azubis", emoji: "🧑‍🔧", label: "Azubis", tagline: "Talente mit Praxisfokus", desc: "Für duale Ausbildung und Berufseinstieg" },
  { id: "gesellen", emoji: "🛠️", label: "Fachkräfte", tagline: "Erfahrene Könner", desc: "Gesellen, Meister und erfahrene Fachkräfte" },
];

const gradients: Record<string, string> = {
  azubis: "from-blue-100 via-blue-50 to-white",
  schueler: "from-indigo-100 via-blue-50 to-white",
  gesellen: "from-sky-100 via-blue-50 to-white",
};

export function TargetGroupSelector({ selectedGroups, onSelectionChange, error }: TargetGroupSelectorProps) {
  const toggleGroup = (groupId: string) => {
    if (selectedGroups.includes(groupId)) {
      onSelectionChange(selectedGroups.filter(g => g !== groupId));
    } else {
      onSelectionChange([...selectedGroups, groupId]);
    }
  };

  return (
    <div className="space-y-3">
      <div>
        <h3 className="text-lg font-semibold mb-1">Zielgruppen</h3>
        <p className="text-sm text-muted-foreground">Wen möchten Sie finden? Mehrfachauswahl möglich.</p>
        {error && (
          <p className="text-sm text-destructive font-medium mt-1">{error}</p>
        )}
      </div>

      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
        {targetGroupOptions.map(group => {
          const isActive = selectedGroups.includes(group.id);
          return (
            <button
              type="button"
              key={group.id}
              onClick={() => toggleGroup(group.id)}
              aria-pressed={isActive}
              className={`group flex h-full flex-col justify-between gap-4 rounded-3xl border border-slate-200/70 bg-white p-6 text-left shadow-sm transition-all focus:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 ${
                isActive
                  ? `border-primary/70 bg-gradient-to-r ${gradients[group.id] ?? "from-white to-white"} shadow-lg shadow-primary/20`
                  : "hover:-translate-y-0.5 hover:shadow-md"
              } ${error ? "border-destructive/70" : ""}`}
            >
              <div className="space-y-3">
                <span className="flex h-14 w-14 items-center justify-center rounded-2xl bg-primary/10 text-3xl leading-none text-primary">
                  {group.emoji}
                </span>
                <div className="space-y-1">
                  <h4 className="text-lg font-semibold text-slate-900">{group.label}</h4>
                  <p className="text-[11px] font-medium uppercase tracking-wide text-primary/70">{group.tagline}</p>
                </div>
              </div>

              <p className="text-xs leading-snug text-muted-foreground sm:text-sm">{group.desc}</p>
            </button>
          );
        })}
      </div>
    </div>
  );
}