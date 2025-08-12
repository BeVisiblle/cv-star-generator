import React, { useEffect, useMemo, useRef, useState } from "react";
import { DndContext, DragEndEvent } from "@dnd-kit/core";
import { useDroppable } from "@dnd-kit/core";
import { useSortable, SortableContext, verticalListSortingStrategy } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { useCompany } from "@/hooks/useCompany";
import { supabase } from "@/integrations/supabase/client";
import { CandidatePipelineCard, CompanyCandidateItem } from "./CandidatePipelineCard";
import { CandidatePipelineTable } from "./CandidatePipelineTable";
import { Download, LayoutGrid, List, ChevronLeft, ChevronRight, Filter } from "lucide-react";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Badge } from "@/components/ui/badge";
import { Popover, PopoverTrigger, PopoverContent } from "@/components/ui/popover";
import { Checkbox } from "@/components/ui/checkbox";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";

const STAGES: { key: string; title: string }[] = [
  { key: "unlocked", title: "Freigeschaltet" },
  { key: "contact", title: "Kontaktieren" },
  { key: "scheduled", title: "Gespräch geplant" },
  { key: "offer", title: "Angebot" },
  { key: "rejected", title: "Abgelehnt" },
];

function DroppableColumn({ id, children }: { id: string; children: React.ReactNode }) {
  const { setNodeRef } = useDroppable({ id });
  return (
    <div ref={setNodeRef} className="min-h-24">
      {children}
    </div>
  );
}

function SortableItem({ id, children }: { id: string; children: React.ReactNode }) {
  const { attributes, listeners, setNodeRef, transform, transition } = useSortable({ id });
  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  } as React.CSSProperties;
  return (
    <div ref={setNodeRef} style={style} {...attributes} {...listeners}>
      {children}
    </div>
  );
}

export const CandidatePipelineBoard: React.FC = () => {
  const { company } = useCompany();
  const [items, setItems] = useState<CompanyCandidateItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [view, setView] = useState<"cards" | "rows">(() => (localStorage.getItem("pipeline_view") as "cards" | "rows") || "cards");
  const [query, setQuery] = useState<string>(() => localStorage.getItem("pipeline_query") || "");
  const [selectedStages, setSelectedStages] = useState<string[]>(() => {
    try {
      const raw = localStorage.getItem("pipeline_stages");
      const arr = raw ? JSON.parse(raw) : null;
      const all = STAGES.map(s => s.key);
      return Array.isArray(arr) && arr.length ? (arr as string[]).filter((a) => all.includes(a)) : all;
    } catch {
      return STAGES.map(s => s.key);
    }
  });
  const [unlockedOnly, setUnlockedOnly] = useState<boolean>(() => localStorage.getItem("pipeline_unlocked_only") === "true");
  const scrollRef = useRef<HTMLDivElement>(null);
  const topScrollRef = useRef<HTMLDivElement>(null);
  const bottomScrollRef = useRef<HTMLDivElement>(null);
  const railContentRef = useRef<HTMLDivElement>(null);
  const [railWidth, setRailWidth] = useState(0);
  const [selectedRowIds, setSelectedRowIds] = useState<string[]>([]);

  useEffect(() => { localStorage.setItem("pipeline_view", view); }, [view]);
  useEffect(() => { localStorage.setItem("pipeline_query", query); }, [query]);
  useEffect(() => { localStorage.setItem("pipeline_stages", JSON.stringify(selectedStages)); }, [selectedStages]);
  useEffect(() => { localStorage.setItem("pipeline_unlocked_only", unlockedOnly ? "true" : "false"); }, [unlockedOnly]);

  const filteredItems = useMemo(() => {
    let list = items;
    if (query.trim()) {
      const q = query.toLowerCase();
      list = list.filter((it) => {
        const p = it.profiles;
        if (!p) return false;
        const hay = `${p.vorname ?? ""} ${p.nachname ?? ""} ${p.headline ?? ""} ${p.branche ?? ""} ${p.ort ?? ""}`.toLowerCase();
        return hay.includes(q);
      });
    }
    if (unlockedOnly) {
      list = list.filter((it) => !!it.unlocked_at);
    }
    if (selectedStages.length && selectedStages.length !== STAGES.length) {
      const allowed = new Set(selectedStages);
      list = list.filter((it) => allowed.has(STAGES.some(s=>s.key===it.stage) ? it.stage : 'unlocked'));
    }
    return list;
  }, [items, query, unlockedOnly, selectedStages]);

  const grouped = useMemo(() => {
    const map: Record<string, CompanyCandidateItem[]> = {};
    STAGES.forEach((s) => (map[s.key] = []));
    for (const it of filteredItems) {
      const key = STAGES.some((s) => s.key === it.stage) ? it.stage : 'unlocked';
      map[key].push(it);
    }
    return map;
  }, [filteredItems]);

  useEffect(() => {
    const main = scrollRef.current;
    const top = topScrollRef.current;
    const bottom = bottomScrollRef.current;
    if (!main) return;
    const sync = (src: HTMLElement, targets: (HTMLElement | null)[]) => () => {
      targets.forEach(t => { if (t && t.scrollLeft !== src.scrollLeft) t.scrollLeft = src.scrollLeft; });
    };
    const onMain = sync(main, [top, bottom]);
    const onTop = top ? sync(top, [main, bottom]) : undefined;
    const onBottom = bottom ? sync(bottom, [main, top]) : undefined;

    main.addEventListener('scroll', onMain);
    top && top.addEventListener('scroll', onTop!);
    bottom && bottom.addEventListener('scroll', onBottom!);

    return () => {
      main.removeEventListener('scroll', onMain);
      top && onTop && top.removeEventListener('scroll', onTop);
      bottom && onBottom && bottom.removeEventListener('scroll', onBottom);
    };
  }, []);

  useEffect(() => {
    const el = railContentRef.current;
    if (!el) return;
    const ro = new ResizeObserver(() => setRailWidth(el.scrollWidth));
    ro.observe(el);
    setRailWidth(el.scrollWidth);
    return () => ro.disconnect();
  }, []);

  useEffect(() => {
    if (!company) return;
    const load = async () => {
      setLoading(true);

      // Load current pipeline rows
      const { data: ccData, error: ccErr } = await supabase
        .from("company_candidates")
        .select("*, profiles(*)")
        .eq("company_id", company.id)
        .order("updated_at", { ascending: false });

      let currentItems: CompanyCandidateItem[] = (ccData as any) || [];

      // Sync unlocked tokens to pipeline (ensure presence in 'unlocked' stage)
      const { data: tokenRows } = await supabase
        .from("tokens_used")
        .select("profile_id, used_at")
        .eq("company_id", company.id);

      const existingIds = new Set(currentItems.map(i => i.candidate_id));
      const inserts = (tokenRows || [])
        .filter(tr => tr.profile_id && !existingIds.has(tr.profile_id))
        .map(tr => ({
          company_id: company.id,
          candidate_id: tr.profile_id,
          stage: "unlocked",
          unlocked_at: tr.used_at,
        }));

      if (inserts.length > 0) {
        await supabase.from("company_candidates").insert(inserts);
        const { data: refreshed } = await supabase
          .from("company_candidates")
          .select("*, profiles(*)")
          .eq("company_id", company.id)
          .order("updated_at", { ascending: false });
        currentItems = (refreshed as any) || currentItems;
      }

      if (!ccErr) {
        // Deduplicate by candidate_id (keep first occurrence due to updated_at DESC order)
        const seen = new Set<string>();
        const deduped: CompanyCandidateItem[] = [] as any;
        for (const it of currentItems as any[]) {
          if (!seen.has(it.candidate_id)) {
            seen.add(it.candidate_id);
            deduped.push(it as any);
          }
        }
        setItems(deduped);
      }
      setLoading(false);
    };
    load();
  }, [company]);

  const handleDragEnd = async (event: DragEndEvent) => {
    const activeId = event.active.id as string;
    const overId = (event.over?.id as string) || null;
    if (!overId || !company) return;

    let newStage: string | undefined = STAGES.find(s => s.key === overId)?.key;
    if (!newStage) {
      // if dropped over another item, infer its stage
      const overItem = items.find(i => i.id === overId);
      if (overItem) newStage = overItem.stage;
    }
    if (!newStage) return;

    const item = items.find(i => i.id === activeId);
    if (!item || item.stage === newStage) return;

    setItems(prev => prev.map(i => (i.id === item.id ? { ...i, stage: newStage! } : i)));
    await supabase
      .from("company_candidates")
      .update({ stage: newStage, last_touched_at: new Date().toISOString() })
      .eq("id", item.id)
      .eq("company_id", company.id);
  };

  const handleStageChange = async (rowId: string, newStage: string) => {
    if (!company) return;
    setItems(prev => prev.map(i => (i.id === rowId ? { ...i, stage: newStage } : i)));
    await supabase
      .from("company_candidates")
      .update({ stage: newStage, last_touched_at: new Date().toISOString() })
      .eq("id", rowId)
      .eq("company_id", company.id);
  };

  const exportCSV = () => {
    const source = selectedRowIds.length
      ? filteredItems.filter(it => selectedRowIds.includes(it.id))
      : filteredItems;
    const rows = [["Name", "Ort", "Bereich", "Stage", "Unlocked"]];
    for (const it of source) {
      const p = it.profiles;
      if (!p) continue;
      rows.push([
        `${p.vorname} ${p.nachname}`,
        p.ort || "",
        p.branche || "",
        it.stage,
        it.unlocked_at ? "true" : "false",
      ]);
    }
    const csv = rows.map(r => r.map(field => `"${String(field).replace(/"/g, '""')}"`).join(",")).join("\n");
    const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "pipeline.csv";
    a.click();
    URL.revokeObjectURL(url);
  };

  const removeFromPipeline = async (rowId: string) => {
    if (!company) return;
    await supabase.from("company_candidates").delete().eq("id", rowId).eq("company_id", company.id);
    setItems(prev => prev.filter(i => i.id !== rowId));
  };

  const openProfile = (profileId: string) => {
    window.location.href = `/company/profile/${profileId}`;
  };

  const allStageKeys = React.useMemo(() => STAGES.map(s => s.key), []);
  const filtersActive = (selectedStages.length !== STAGES.length) || unlockedOnly;

  return (
    <div className="space-y-4">
      <div className="sticky top-0 z-40 bg-background border-b border-border py-2">
        <div className="flex flex-wrap items-center gap-2">
          <h1 className="text-xl font-semibold mr-2">Pipeline</h1>
          <div className="w-full sm:w-auto">
            <Input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Suchen nach Name, Ort, Branche..."
              className="w-full sm:w-[300px]"
              aria-label="Kandidaten suchen"
            />
          </div>
          <div className="inline-flex rounded-md border border-input p-0.5">
            <Button size="icon" variant={view === 'cards' ? 'default' : 'ghost'} onClick={() => setView('cards')} aria-label="Kartenansicht">
              <LayoutGrid className="h-4 w-4" />
            </Button>
            <Button size="icon" variant={view === 'rows' ? 'default' : 'ghost'} onClick={() => setView('rows')} aria-label="Listenansicht">
              <List className="h-4 w-4" />
            </Button>
          </div>
          <Popover>
            <PopoverTrigger asChild>
              <Button size="sm" variant="outline" aria-label="Filter">
                <Filter className="h-4 w-4 mr-2" />
                Filter
                {filtersActive && (
                  <Badge variant="secondary" className="ml-2">{unlockedOnly ? "•" : null}{selectedStages.length !== STAGES.length ? selectedStages.length : null}</Badge>
                )}
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-72 z-[60] bg-popover">
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium">Stages</span>
                  <div className="flex gap-2">
                    <Button variant="ghost" size="sm" onClick={() => setSelectedStages(allStageKeys)}>Alle</Button>
                    <Button variant="ghost" size="sm" onClick={() => setSelectedStages([])}>Keine</Button>
                  </div>
                </div>
                <div className="grid grid-cols-1 gap-2">
                  {STAGES.map((s) => (
                    <label key={s.key} className="flex items-center gap-2">
                      <Checkbox
                        checked={selectedStages.includes(s.key)}
                        onCheckedChange={(c) => {
                          setSelectedStages((prev) => {
                            const set = new Set(prev);
                            if (c === true) set.add(s.key); else set.delete(s.key);
                            return Array.from(set);
                          });
                        }}
                      />
                      <span className="text-sm">{s.title}</span>
                    </label>
                  ))}
                </div>
                <div className="flex items-center justify-between pt-2 border-t">
                  <Label htmlFor="unlocked-only" className="text-sm">Nur freigeschaltete</Label>
                  <Switch id="unlocked-only" checked={unlockedOnly} onCheckedChange={setUnlockedOnly} />
                </div>
                <div className="flex justify-end">
                  <Button variant="ghost" size="sm" onClick={() => { setSelectedStages(allStageKeys); setUnlockedOnly(false); }}>Zurücksetzen</Button>
                </div>
              </div>
            </PopoverContent>
          </Popover>
          <Button size="sm" onClick={exportCSV}>
            <Download className="h-4 w-4 mr-2" /> Export (CSV)
          </Button>
        </div>
      </div>

  {loading ? (
        <div className="flex items-center justify-center py-20">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
        </div>
      ) : view === 'cards' ? (
        <DndContext onDragEnd={handleDragEnd}>
          <div className="relative">
            <div ref={topScrollRef} className="overflow-x-auto show-scrollbar -mx-3 px-3 mb-1" aria-hidden="true">
              <div style={{ width: railWidth }} className="h-3" />
            </div>
            <div ref={scrollRef} className="overflow-x-auto overflow-y-hidden pb-3 show-scrollbar -mx-3 px-3">
              <div ref={railContentRef} className="flex gap-4 w-max">
                {STAGES.map(stage => (
                  <Card key={stage.key} className="min-w-[360px] shrink-0">
                    <CardHeader className="sticky top-0 z-10 bg-background">
                      <CardTitle className="flex items-center justify-between">
                        <span>{stage.title}</span>
                        <span className="text-sm text-muted-foreground">{grouped[stage.key]?.length || 0}</span>
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="max-h-[calc(100vh-220px)] overflow-y-auto pr-1 show-scrollbar-y">
                        <DroppableColumn id={stage.key}>
                          <SortableContext items={(grouped[stage.key] || []).map(i => i.id)} strategy={verticalListSortingStrategy}>
                            <div className="space-y-3">
                              {(grouped[stage.key] || []).map(it => (
                                <SortableItem key={it.id} id={it.id}>
                                  <CandidatePipelineCard
                                    item={it}
                                    onOpen={openProfile}
                                    onRemove={removeFromPipeline}
                                    onStageChange={handleStageChange}
                                    stages={STAGES}
                                  />
                                </SortableItem>
                              ))}
                            </div>
                          </SortableContext>
                        </DroppableColumn>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </div>
            <div className="pointer-events-none absolute inset-y-0 left-0 w-12 bg-gradient-to-r from-background to-transparent" />
            <div className="pointer-events-none absolute inset-y-0 right-0 w-12 bg-gradient-to-l from-background to-transparent" />
            <div className="absolute inset-y-0 left-2 flex items-center">
              <Button variant="secondary" size="icon" className="shadow" onClick={() => scrollRef.current?.scrollBy({ left: -400, behavior: 'smooth' })} aria-label="Nach links scrollen">
                <ChevronLeft className="h-5 w-5" />
              </Button>
            </div>
            <div className="absolute inset-y-0 right-2 flex items-center">
              <Button variant="secondary" size="icon" className="shadow" onClick={() => scrollRef.current?.scrollBy({ left: 400, behavior: 'smooth' })} aria-label="Nach rechts scrollen">
                <ChevronRight className="h-5 w-5" />
              </Button>
            </div>
            <div ref={bottomScrollRef} className="overflow-x-auto show-scrollbar -mx-3 px-3 mt-1" aria-hidden="true">
              <div style={{ width: railWidth }} className="h-3" />
            </div>
          </div>
        </DndContext>
      ) : (
        <Card>
          <CardContent className="space-y-4">
            <ScrollArea>
              <div className="flex items-center gap-4 min-w-max">
                {STAGES.map(s => (
                  <div key={s.key} className="flex items-center gap-2 px-3 py-2 rounded-md border bg-muted/40">
                    <span className="text-sm font-medium">{s.title}</span>
                    <span className="text-xs text-muted-foreground">{grouped[s.key]?.length || 0}</span>
                  </div>
                ))}
              </div>
            </ScrollArea>

            {/* Flatten items sorted by stage order */}
            <CandidatePipelineTable
              items={[...filteredItems].sort((a, b) => {
                const ai = STAGES.findIndex(s => s.key === (STAGES.some(s=>s.key===a.stage)?a.stage:'unlocked'));
                const bi = STAGES.findIndex(s => s.key === (STAGES.some(s=>s.key===b.stage)?b.stage:'unlocked'));
                return ai - bi;
              })}
              stages={STAGES}
              onStageChange={handleStageChange}
              onOpen={openProfile}
              onRemove={removeFromPipeline}
              onSelectionChange={setSelectedRowIds}
            />
          </CardContent>
        </Card>
      )}
    </div>
  );
};
