import React, { useEffect, useMemo, useState } from "react";
import { DndContext, DragEndEvent } from "@dnd-kit/core";
import { useDroppable } from "@dnd-kit/core";
import { useSortable, SortableContext, verticalListSortingStrategy } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useCompany } from "@/hooks/useCompany";
import { supabase } from "@/integrations/supabase/client";
import { CandidatePipelineCard, CompanyCandidateItem } from "./CandidatePipelineCard";
import { CandidatePipelineTable } from "./CandidatePipelineTable";
import { Download, LayoutGrid, List } from "lucide-react";
import { ScrollArea } from "@/components/ui/scroll-area";

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
  const [view, setView] = useState<"cards" | "rows">("cards");

  const grouped = useMemo(() => {
    const map: Record<string, CompanyCandidateItem[]> = {};
    STAGES.forEach(s => (map[s.key] = []));
    for (const it of items) {
      let key: string;
      if (STAGES.some(s => s.key === it.stage)) {
        // Route newly unlocked entries to "Freigeschaltet" until moved further
        if (it.unlocked_at && (it.stage === 'new' || it.stage === 'contact')) {
          key = 'unlocked';
        } else {
          key = it.stage;
        }
      } else {
        key = it.unlocked_at ? 'unlocked' : 'unlocked';
      }
      map[key].push(it);
    }
    return map;
  }, [items]);

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

      if (!ccErr) setItems(currentItems);
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
    const rows = [["Name", "Ort", "Bereich", "Stage", "Unlocked"]];
    for (const it of items) {
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

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-semibold">Pipeline</h2>
        <div className="flex items-center gap-2">
          <div className="inline-flex rounded-md border border-input p-0.5">
            <Button size="icon" variant={view === 'cards' ? 'default' : 'ghost'} onClick={() => setView('cards')} aria-label="Kartenansicht">
              <LayoutGrid className="h-4 w-4" />
            </Button>
            <Button size="icon" variant={view === 'rows' ? 'default' : 'ghost'} onClick={() => setView('rows')} aria-label="Listenansicht">
              <List className="h-4 w-4" />
            </Button>
          </div>
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
          <ScrollArea className="-mx-3 px-3 pb-2">
            <div className="flex gap-4 w-max">
              {STAGES.map(stage => (
                <Card key={stage.key} className="min-w-[520px] shrink-0">
                  <CardHeader>
                    <CardTitle className="flex items-center justify-between">
                      <span>{stage.title}</span>
                      <span className="text-sm text-muted-foreground">{grouped[stage.key]?.length || 0}</span>
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <DroppableColumn id={stage.key}>
                      <SortableContext items={(grouped[stage.key] || []).map(i => i.id)} strategy={verticalListSortingStrategy}>
                        <div className="space-y-3">
                          {(grouped[stage.key] || []).map(it => (
                            <SortableItem key={it.id} id={it.id}>
                              <CandidatePipelineCard item={it} onOpen={openProfile} onRemove={removeFromPipeline} />
                            </SortableItem>
                          ))}
                        </div>
                      </SortableContext>
                    </DroppableColumn>
                  </CardContent>
                </Card>
              ))}
            </div>
          </ScrollArea>
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
              items={[...items].sort((a, b) => {
                const ai = STAGES.findIndex(s => s.key === (STAGES.some(s=>s.key===a.stage)?a.stage:'unlocked'));
                const bi = STAGES.findIndex(s => s.key === (STAGES.some(s=>s.key===b.stage)?b.stage:'unlocked'));
                return ai - bi;
              })}
              stages={STAGES}
              onStageChange={handleStageChange}
              onOpen={openProfile}
              onRemove={removeFromPipeline}
            />
          </CardContent>
        </Card>
      )}
    </div>
  );
};
