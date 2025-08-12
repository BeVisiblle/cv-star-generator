import React from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Download, Filter, LayoutGrid, List } from "lucide-react";

export type StageDef = { key: string; title: string };

interface TopNavbarProps {
  title?: string;
  query: string;
  onQueryChange: (v: string) => void;
  view: "cards" | "rows";
  onViewChange: (v: "cards" | "rows") => void;
  stages: StageDef[];
  selectedStages: string[];
  onSelectedStagesChange: (stages: string[]) => void;
  unlockedOnly: boolean;
  onUnlockedOnlyChange: (v: boolean) => void;
  filtersActive?: boolean;
  onExport?: () => void;
}

export const TopNavbar: React.FC<TopNavbarProps> = ({
  title = "Pipeline",
  query,
  onQueryChange,
  view,
  onViewChange,
  stages,
  selectedStages,
  onSelectedStagesChange,
  unlockedOnly,
  onUnlockedOnlyChange,
  filtersActive,
  onExport,
}) => {
  const allStageKeys = React.useMemo(() => stages.map((s) => s.key), [stages]);
  return (
    <div className="sticky top-0 z-40 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/80 border-b border-border py-2">
      <div className="mx-auto max-w-screen-2xl px-3 flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
        <h1 className="text-xl font-semibold">{title}</h1>
        <div className="flex items-center gap-2">
          <div className="hidden sm:block">
            <Input
              value={query}
              onChange={(e) => onQueryChange(e.target.value)}
              placeholder="Suchen nach Name, Ort, Branche..."
              className="w-[260px]"
              aria-label="Kandidaten suchen"
            />
          </div>
          <div className="inline-flex rounded-md border border-input p-0.5">
            <Button
              size="icon"
              variant={view === "cards" ? "default" : "ghost"}
              onClick={() => onViewChange("cards")}
              aria-label="Kartenansicht"
            >
              <LayoutGrid className="h-4 w-4" />
            </Button>
            <Button
              size="icon"
              variant={view === "rows" ? "default" : "ghost"}
              onClick={() => onViewChange("rows")}
              aria-label="Listenansicht"
            >
              <List className="h-4 w-4" />
            </Button>
          </div>
          <Popover>
            <PopoverTrigger asChild>
              <Button size="sm" variant="outline" aria-label="Filter">
                <Filter className="h-4 w-4 mr-2" />
                Filter
                {filtersActive && (
                  <Badge variant="secondary" className="ml-2">
                    {unlockedOnly ? "•" : null}
                    {selectedStages.length !== stages.length ? selectedStages.length : null}
                  </Badge>
                )}
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-72 z-[60] bg-popover">
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium">Stages</span>
                  <div className="flex gap-2">
                    <Button variant="ghost" size="sm" onClick={() => onSelectedStagesChange(allStageKeys)}>
                      Alle
                    </Button>
                    <Button variant="ghost" size="sm" onClick={() => onSelectedStagesChange([])}>
                      Keine
                    </Button>
                  </div>
                </div>
                <div className="grid grid-cols-1 gap-2">
                  {stages.map((s) => (
                    <label key={s.key} className="flex items-center gap-2">
                      <Switch
                        checked={selectedStages.includes(s.key)}
                        onCheckedChange={(c) => {
                          onSelectedStagesChange(
                            c ? Array.from(new Set([...selectedStages, s.key])) : selectedStages.filter((x) => x !== s.key)
                          );
                        }}
                      />
                      <span className="text-sm">{s.title}</span>
                    </label>
                  ))}
                </div>
                <div className="flex items-center justify-between pt-2 border-t">
                  <Label htmlFor="unlocked-only" className="text-sm">
                    Nur freigeschaltete
                  </Label>
                  <Switch id="unlocked-only" checked={unlockedOnly} onCheckedChange={onUnlockedOnlyChange} />
                </div>
                <div className="flex justify-end">
                  <Button variant="ghost" size="sm" onClick={() => onSelectedStagesChange(allStageKeys)}>
                    Zurücksetzen
                  </Button>
                </div>
              </div>
            </PopoverContent>
          </Popover>
          {onExport && (
            <Button size="sm" onClick={onExport}>
              <Download className="h-4 w-4 mr-2" /> Export (CSV)
            </Button>
          )}
        </div>
      </div>
      <div className="sm:hidden mt-2 px-3">
        <Input
          value={query}
          onChange={(e) => onQueryChange(e.target.value)}
          placeholder="Suchen..."
          aria-label="Kandidaten suchen"
        />
      </div>
    </div>
  );
};
