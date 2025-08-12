import React, { useEffect, useMemo, useState } from "react";
import { Sheet, SheetContent, SheetHeader, SheetTitle } from "@/components/ui/sheet";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Mail, Phone, FileText, MapPin, Briefcase, Award, GraduationCap } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useCompany } from "@/hooks/useCompany";
import { useAuth } from "@/hooks/useAuth";

export type StageDef = { key: string; title: string };

interface CandidateProfileDrawerProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  candidateId: string | null; // profiles.id
  stages: StageDef[];
  onStageChanged?: (newStage: string) => void; // notify parent
}

interface ProfileRow {
  id: string;
  vorname: string;
  nachname: string;
  ort?: string;
  plz?: string;
  branche?: string;
  avatar_url?: string;
  headline?: string;
  email?: string;
  telefon?: string;
  cv_url?: string;
  beschreibung?: string;
  faehigkeiten?: any[];
  berufserfahrung?: any[];
  ausbildung?: any[];
}

interface CompanyCandidateRow {
  id: string;
  stage: string;
  unlocked_at: string | null;
  created_at: string;
}

interface ActivityRow {
  id: string;
  type: string;
  created_at: string;
  payload: any;
}

export const CandidateProfileDrawer: React.FC<CandidateProfileDrawerProps> = ({ open, onOpenChange, candidateId, stages, onStageChanged }) => {
  const { company } = useCompany();
  const { user } = useAuth();
  const [profile, setProfile] = useState<ProfileRow | null>(null);
  const [pipelineRow, setPipelineRow] = useState<CompanyCandidateRow | null>(null);
  const [notes, setNotes] = useState<{ id: string; body: string; created_at: string; created_by: string }[]>([]);
  const [newNote, setNewNote] = useState("");
  const [activity, setActivity] = useState<ActivityRow[]>([]);
  const [stage, setStage] = useState<string>("");

  const initials = useMemo(() => `${profile?.vorname?.[0] ?? "?"}${profile?.nachname?.[0] ?? ""}`, [profile]);

  useEffect(() => {
    if (!open || !candidateId || !company) return;
    const load = async () => {
      const [{ data: p }, { data: rows }, { data: notesData }, { data: act }] = await Promise.all([
        supabase.from("profiles").select("*").eq("id", candidateId).maybeSingle(),
        supabase.from("company_candidates").select("id, stage, unlocked_at, created_at").eq("company_id", company.id).eq("candidate_id", candidateId).limit(1),
        supabase.from("candidate_notes").select("id, body, created_at, created_by").eq("company_id", company.id).eq("candidate_id", candidateId).order("created_at", { ascending: false }),
        supabase.from("company_activity").select("id, type, created_at, payload").eq("company_id", company.id).contains("payload", { candidate_id: candidateId }).order("created_at", { ascending: false }),
      ]);

      setProfile((p as any) || null);
      const row = rows && rows[0] ? rows[0] : null;
      setPipelineRow(row);
      if (row?.stage) setStage(row.stage);
      setNotes((notesData as any) || []);
      setActivity((act as any) || []);
    };
    load();
  }, [open, candidateId, company]);

  const handleStageChange = async (value: string) => {
    if (!company || !pipelineRow) return;
    const from = pipelineRow.stage;
    setStage(value);
    setPipelineRow({ ...pipelineRow, stage: value });
    await supabase
      .from("company_candidates")
      .update({ stage: value, last_touched_at: new Date().toISOString() })
      .eq("id", pipelineRow.id)
      .eq("company_id", company.id);

    // Log activity
    await supabase.from("company_activity").insert({
      company_id: company.id,
      actor_user_id: user?.id ?? null,
      type: "pipeline_move",
      payload: { candidate_id: candidateId, from, to: value },
    } as any);

    // refresh activity list
    const { data: act } = await supabase
      .from("company_activity")
      .select("id, type, created_at, payload")
      .eq("company_id", company.id)
      .contains("payload", { candidate_id: candidateId })
      .order("created_at", { ascending: false });
    setActivity((act as any) || []);

    onStageChanged?.(value);
  };

  const handleAddNote = async () => {
    if (!company || !candidateId || !newNote.trim()) return;
    const { data, error } = await supabase
      .from("candidate_notes")
      .insert({
        company_id: company.id,
        candidate_id: candidateId,
        body: newNote.trim(),
        created_by: user?.id,
      })
      .select("id, body, created_at, created_by")
      .single();
    if (!error && data) {
      setNotes((prev) => [data as any, ...prev]);
      setNewNote("");
      await supabase.from("company_activity").insert({
        company_id: company.id,
        actor_user_id: user?.id ?? null,
        type: "candidate_note_added",
        payload: { candidate_id: candidateId, note_id: (data as any).id },
      } as any);
      const { data: act } = await supabase
        .from("company_activity")
        .select("id, type, created_at, payload")
        .eq("company_id", company.id)
        .contains("payload", { candidate_id: candidateId })
        .order("created_at", { ascending: false });
      setActivity((act as any) || []);
    }
  };

  const handleEmail = () => profile?.email && window.location.assign(`mailto:${profile.email}`);
  const handlePhone = () => profile?.telefon && window.location.assign(`tel:${profile.telefon}`);
  const handleCV = () => {
    if (profile?.cv_url) window.open(profile.cv_url, "_blank", "noopener");
  };

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent side="right" className="w-full sm:max-w-xl p-0">
        <SheetHeader className="p-4 border-b sticky top-0 z-10 bg-background">
          <SheetTitle className="flex items-center gap-3">
            <Avatar className="h-10 w-10">
              <AvatarImage src={profile?.avatar_url || ""} />
              <AvatarFallback>{initials}</AvatarFallback>
            </Avatar>
            <div className="min-w-0">
              <div className="truncate text-base font-semibold">
                {profile ? `${profile.vorname} ${profile.nachname}` : "Profil"}
              </div>
              <div className="text-sm text-muted-foreground truncate">{profile?.headline || profile?.branche || ""}</div>
            </div>
          </SheetTitle>
          <div className="flex items-center gap-2 flex-wrap pt-2">
            <Button size="sm" variant="secondary" onClick={handleEmail} disabled={!profile?.email}>
              <Mail className="h-4 w-4 mr-2" /> E-Mail
            </Button>
            <Button size="sm" variant="secondary" onClick={handlePhone} disabled={!profile?.telefon}>
              <Phone className="h-4 w-4 mr-2" /> Telefon
            </Button>
            <Button size="sm" variant="secondary" onClick={handleCV} disabled={!profile?.cv_url}>
              <FileText className="h-4 w-4 mr-2" /> CV
            </Button>
            <div className="ml-auto flex items-center gap-2">
              <span className="text-sm text-muted-foreground">Status</span>
              <Select value={stage} onValueChange={handleStageChange}>
                <SelectTrigger className="h-8 w-[180px]">
                  <SelectValue placeholder="Stage wählen" />
                </SelectTrigger>
                <SelectContent className="z-[60] bg-popover border border-border shadow-md">
                  {stages.map((s) => (
                    <SelectItem key={s.key} value={s.key}>
                      {s.title}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
        </SheetHeader>

        <ScrollArea className="h-[calc(100vh-120px)] p-4">
          {/* Meta badges */}
          <div className="flex items-center gap-2 flex-wrap mb-3">
            {pipelineRow?.unlocked_at ? (
              <Badge variant="secondary">Freigeschaltet</Badge>
            ) : (
              <Badge variant="outline">Gesperrt</Badge>
            )}
            {profile?.ort && <Badge variant="outline">{profile.ort}</Badge>}
            {profile?.branche && <Badge variant="outline">{profile.branche}</Badge>}
          </div>

          {/* Profile section */}
          <div className="space-y-4">
            {(profile?.beschreibung || profile?.headline) && (
              <div className="space-y-2">
                <h3 className="text-sm font-semibold">Profil</h3>
                {profile?.headline && (
                  <p className="text-sm text-muted-foreground">{profile.headline}</p>
                )}
                {profile?.beschreibung && <p className="text-sm leading-relaxed">{profile.beschreibung}</p>}
              </div>
            )}

            {profile?.faehigkeiten && Array.isArray(profile.faehigkeiten) && profile.faehigkeiten.length > 0 && (
              <div>
                <h3 className="text-sm font-semibold flex items-center"><Award className="h-4 w-4 mr-2" />Fähigkeiten</h3>
                <div className="flex flex-wrap gap-2 mt-2">
                  {profile.faehigkeiten.map((s: any, i: number) => (
                    <Badge key={i} variant="secondary">{s.name || s}</Badge>
                  ))}
                </div>
              </div>
            )}

            {profile?.berufserfahrung && Array.isArray(profile.berufserfahrung) && profile.berufserfahrung.length > 0 && (
              <div className="space-y-2">
                <h3 className="text-sm font-semibold flex items-center"><Briefcase className="h-4 w-4 mr-2" />Berufserfahrung</h3>
                <div className="space-y-3">
                  {profile.berufserfahrung.map((exp: any, idx: number) => (
                    <div key={idx} className="border-l pl-3">
                      <div className="font-medium">{exp.position || exp.titel}</div>
                      <div className="text-xs text-muted-foreground">{exp.unternehmen}</div>
                      <div className="text-xs text-muted-foreground">{exp.von} – {exp.bis || 'Heute'}</div>
                      {exp.beschreibung && <p className="text-sm mt-1">{exp.beschreibung}</p>}
                    </div>
                  ))}
                </div>
              </div>
            )}

            {profile?.ausbildung && Array.isArray(profile.ausbildung) && profile.ausbildung.length > 0 && (
              <div className="space-y-2">
                <h3 className="text-sm font-semibold flex items-center"><GraduationCap className="h-4 w-4 mr-2" />Ausbildung</h3>
                <div className="space-y-3">
                  {profile.ausbildung.map((edu: any, idx: number) => (
                    <div key={idx} className="border-l pl-3">
                      <div className="font-medium">{edu.abschluss || edu.titel}</div>
                      <div className="text-xs text-muted-foreground">{edu.institution || edu.schule}</div>
                      <div className="text-xs text-muted-foreground">{edu.von} – {edu.bis || 'Heute'}</div>
                      {edu.beschreibung && <p className="text-sm mt-1">{edu.beschreibung}</p>}
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Notes */}
            <div className="space-y-2">
              <h3 className="text-sm font-semibold">Notiz hinzufügen</h3>
              <Textarea value={newNote} onChange={(e) => setNewNote(e.target.value)} placeholder="Notiz eingeben..." />
              <div className="flex justify-end">
                <Button size="sm" onClick={handleAddNote} disabled={!newNote.trim()}>Speichern</Button>
              </div>
              {notes.length > 0 && (
                <div className="space-y-2">
                  <h4 className="text-sm font-medium">Notizen</h4>
                  <div className="space-y-2">
                    {notes.map((n) => (
                      <div key={n.id} className="rounded border p-2">
                        <div className="text-xs text-muted-foreground">{new Date(n.created_at).toLocaleString()}</div>
                        <div className="text-sm whitespace-pre-wrap">{n.body}</div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* Activity */}
            <div className="space-y-2">
              <h3 className="text-sm font-semibold">Aktivität</h3>
              {pipelineRow?.unlocked_at && (
                <div className="text-sm">Freigeschaltet am {new Date(pipelineRow.unlocked_at).toLocaleString()}</div>
              )}
              <div className="space-y-2">
                {activity.map((a) => (
                  <div key={a.id} className="rounded border p-2">
                    <div className="text-xs text-muted-foreground">{new Date(a.created_at).toLocaleString()}</div>
                    <div className="text-sm">
                      {a.type === 'pipeline_move' && (
                        <>Stage gewechselt: {a.payload?.from} → {a.payload?.to}</>
                      )}
                      {a.type === 'candidate_note_added' && (
                        <>Notiz hinzugefügt</>
                      )}
                      {!['pipeline_move','candidate_note_added'].includes(a.type) && a.type}
                    </div>
                  </div>
                ))}
                {activity.length === 0 && !pipelineRow?.unlocked_at && (
                  <div className="text-sm text-muted-foreground">Keine Aktivitäten vorhanden.</div>
                )}
              </div>
            </div>
          </div>
        </ScrollArea>
      </SheetContent>
    </Sheet>
  );
};
