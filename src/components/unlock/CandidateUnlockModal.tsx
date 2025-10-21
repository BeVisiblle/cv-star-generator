import { useEffect, useMemo, useState } from "react";
import { motion } from "framer-motion";
import { ChevronLeft, ChevronRight, CheckCircle2, Loader2, Info, Coins } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from "@/components/ui/select";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";

type UnlockType = "bewerbung" | "initiativ";
type ContextType = "application" | "match" | "none";

type Candidate = { 
  id: string; 
  full_name?: string | null;
  vorname?: string | null;
  nachname?: string | null;
};

type ApplicationContext = {
  id: string;
  job_id: string | null;
  job_title?: string | null;
  status?: string | null;
};

type Job = { id: string; title: string; is_active: boolean };

export type CandidateUnlockModalProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  candidate: Candidate;
  companyId: string;
  contextApplication?: ApplicationContext | null;
  contextType?: ContextType;
  onSuccess?: () => void;
};

const StepBadge = ({ index, active, done }: { index: number; active: boolean; done: boolean }) => (
  <div className={`flex items-center gap-2 ${done ? "text-emerald-600" : active ? "text-primary" : "text-muted-foreground"}`}>
    <div className={`h-7 w-7 rounded-full border flex items-center justify-center text-sm font-medium ${
      done ? "border-emerald-600 bg-emerald-50" : active ? "border-primary bg-primary/10" : "border-border"
    }`}>
      {done ? <CheckCircle2 className="h-4 w-4" /> : index}
    </div>
  </div>
);

export default function CandidateUnlockModal(props: CandidateUnlockModalProps) {
  const { open, onOpenChange, candidate, companyId, contextApplication, contextType = "none", onSuccess } = props;

  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [unlockType, setUnlockType] = useState<UnlockType>(contextApplication ? "bewerbung" : "initiativ");
  const [jobs, setJobs] = useState<Job[]>([]);
  const [selectedJobId, setSelectedJobId] = useState<string | null>(contextApplication?.job_id ?? null);
  const [notes, setNotes] = useState("");
  const [alreadyUnlocked, setAlreadyUnlocked] = useState(false);
  const [currentUserId, setCurrentUserId] = useState<string | null>(null);

  const candidateName = candidate.full_name || 
    (candidate.vorname && candidate.nachname ? `${candidate.vorname} ${candidate.nachname}` : null) ||
    candidate.vorname || 
    "Kandidat";

  const tokenCost = useMemo(() => {
    if (contextType === "match") return 3;
    if (unlockType === "bewerbung") return 1;
    return 2; // initiativ
  }, [unlockType, contextType]);

  useEffect(() => {
    if (!open) return;

    (async () => {
      try {
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) throw new Error("Nicht angemeldet");
        setCurrentUserId(user.id);

        // Check if already unlocked
        const { data: existing } = await supabase
          .from("company_candidates")
          .select("id")
          .eq("company_id", companyId)
          .eq("candidate_id", candidate.id)
          .not("unlocked_at", "is", null)
          .maybeSingle();

        setAlreadyUnlocked(!!existing);

        // Fetch active jobs
        const { data: jobsList, error: jobsError } = await supabase
          .from("job_posts")
          .select("id, title, is_active")
          .eq("company_id", companyId)
          .eq("is_active", true)
          .order("title", { ascending: true });

        if (jobsError) throw jobsError;
        setJobs(jobsList || []);

        if (!jobsList?.length) {
          setUnlockType("initiativ");
          setSelectedJobId(null);
        }
      } catch (e: any) {
        toast.error(e.message || "Fehler beim Laden");
      }
    })();
  }, [open, companyId, candidate.id]);

  function resetState() {
    setStep(1);
    setLoading(false);
    setUnlockType(contextApplication ? "bewerbung" : "initiativ");
    setSelectedJobId(contextApplication?.job_id ?? null);
    setNotes("");
    setAlreadyUnlocked(false);
  }

  function handleOpenChange(next: boolean) {
    if (!next) resetState();
    onOpenChange(next);
  }

  async function handleConfirm() {
    if (!currentUserId) return;
    
    setLoading(true);
    let tokenDeducted = false;

    try {
      // Final check for duplicate
      const { data: existing } = await supabase
        .from("company_candidates")
        .select("id")
        .eq("company_id", companyId)
        .eq("candidate_id", candidate.id)
        .not("unlocked_at", "is", null)
        .maybeSingle();

      if (existing) {
        setAlreadyUnlocked(true);
        toast.error("Kandidat ist bereits freigeschaltet");
        setLoading(false);
        return;
      }

      const relatedJobId = unlockType === "bewerbung" 
        ? (selectedJobId || contextApplication?.job_id || null)
        : (selectedJobId || null);

      // Deduct tokens (call RPC multiple times based on cost)
      for (let i = 0; i < tokenCost; i++) {
        const { error: tokenError } = await supabase.rpc("use_company_token", {
          p_company_id: companyId,
          p_profile_id: candidate.id
        });
        if (tokenError) throw new Error("Nicht genügend Tokens verfügbar");
      }
      tokenDeducted = true;

      // Reject original application if job changed
      if (contextApplication?.id && contextApplication.job_id && 
          relatedJobId && relatedJobId !== contextApplication.job_id) {
        
        await supabase
          .from("applications")
          .update({
            status: "rejected",
            company_response_at: new Date().toISOString(),
            rejection_reason: "Für andere Position berücksichtigt"
          })
          .eq("id", contextApplication.id);

        // Notify candidate about reassignment
        await supabase.rpc("create_notification", {
          p_recipient_type: "profile",
          p_recipient_id: candidate.id,
          p_type: "candidate_message",
          p_title: "Update zu deiner Bewerbung 💡",
          p_body: `Deine Bewerbung auf "${contextApplication.job_title}" wurde leider nicht angenommen. Das Unternehmen hat jedoch dein Profil positiv bewertet und möchte dich gerne für eine andere Stelle oder initiativ in Betracht ziehen.`,
          p_actor_type: "company",
          p_actor_id: companyId,
          p_payload: {
            application_id: contextApplication.id,
            original_job_id: contextApplication.job_id,
            new_job_id: relatedJobId
          },
          p_group_key: `app_reassign_${contextApplication.id}`,
          p_priority: 6
        });
      } else if (unlockType === "initiativ") {
        // Notify candidate about initiativ unlock
        await supabase.rpc("create_notification", {
          p_recipient_type: "profile",
          p_recipient_id: candidate.id,
          p_type: "candidate_message",
          p_title: "Dein Profil wurde freigeschaltet 🎉",
          p_body: "Ein Unternehmen hat dein Profil auf Ausbildungsbasis freigeschaltet, weil es dich interessant findet – auch ohne konkrete Bewerbung. Du kannst dich jetzt direkt austauschen oder dich für passende Stellen im Unternehmensprofil bewerben.",
          p_actor_type: "company",
          p_actor_id: companyId,
          p_payload: { job_id: relatedJobId },
          p_group_key: null,
          p_priority: 5
        });
      } else if (unlockType === "bewerbung") {
        // Notify about standard unlock
        await supabase.rpc("create_notification", {
          p_recipient_type: "profile",
          p_recipient_id: candidate.id,
          p_type: "candidate_message",
          p_title: "Dein Profil wurde freigeschaltet ✅",
          p_body: "Das Unternehmen, bei dem du dich beworben hast, hat dein Profil freigeschaltet. Du bist jetzt für das Recruiting-Team sichtbar und kannst direkt kontaktiert werden, wenn du in die engere Auswahl kommst.",
          p_actor_type: "company",
          p_actor_id: companyId,
          p_payload: { application_id: contextApplication?.id },
          p_group_key: null,
          p_priority: 5
        });
      }

      // Upsert company_candidates
      const { error: unlockError } = await supabase
        .from("company_candidates")
        .upsert({
          company_id: companyId,
          candidate_id: candidate.id,
          source: unlockType,
          source_need_id: relatedJobId,
          notes: notes.trim() || null,
          unlocked_at: new Date().toISOString(),
          unlocked_by_user_id: currentUserId,
          stage: "new",
          last_touched_at: new Date().toISOString()
        }, {
          onConflict: "company_id,candidate_id"
        });

      if (unlockError) throw unlockError;

      // Track analytics in company_activity
      await supabase.from("company_activity").insert({
        company_id: companyId,
        actor_user_id: currentUserId,
        type: "candidate_unlocked",
        payload: {
          candidate_id: candidate.id,
          unlock_type: unlockType,
          context_type: contextType,
          job_id: relatedJobId,
          token_cost: tokenCost,
          application_id: contextApplication?.id
        }
      });

      toast.success("Kandidat erfolgreich freigeschaltet");
      onSuccess?.();
      handleOpenChange(false);

    } catch (e: any) {
      // Rollback tokens if deducted - get current balance and add back
      if (tokenDeducted) {
        try {
          const { data: wallet } = await supabase
            .from("company_token_wallets")
            .select("balance")
            .eq("company_id", companyId)
            .single();
          
          if (wallet) {
            await supabase
              .from("company_token_wallets")
              .update({ balance: wallet.balance + tokenCost })
              .eq("company_id", companyId);
            
            toast.error(`${e.message} - Tokens wurden zurückerstattet`);
          } else {
            toast.error(`${e.message} - Token-Rollback fehlgeschlagen`);
          }
        } catch {
          toast.error(`${e.message} - KRITISCH: Token-Rollback fehlgeschlagen!`);
        }
      } else {
        toast.error(e.message || "Fehler beim Freischalten");
      }
    } finally {
      setLoading(false);
    }
  }

  const jobSelect = (
    <div className="space-y-2">
      <Label>Stelle (optional)</Label>
      <Select onValueChange={(v) => setSelectedJobId(v === "none" ? null : v)} value={selectedJobId || "none"}>
        <SelectTrigger>
          <SelectValue placeholder={jobs.length ? "Stelle wählen (optional)" : "Keine aktiven Stellen"} />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="none">Keine bestimmte Stelle (Initiativ)</SelectItem>
          {jobs.map((j) => (
            <SelectItem key={j.id} value={j.id}>{j.title}</SelectItem>
          ))}
        </SelectContent>
      </Select>
      {contextApplication?.job_title && (
        <p className="text-xs text-muted-foreground">
          Kontext: <span className="font-medium">{contextApplication.job_title}</span>
          {selectedJobId && contextApplication.job_id && selectedJobId !== contextApplication.job_id && (
            <span className="ml-2 text-amber-600">(abweichend von Bewerbung)</span>
          )}
        </p>
      )}
    </div>
  );

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent className="sm:max-w-xl">
        <DialogHeader>
          <DialogTitle>Kandidat freischalten</DialogTitle>
          <DialogDescription>
            {candidateName} freischalten für {tokenCost} Token{tokenCost !== 1 && "s"}
          </DialogDescription>
        </DialogHeader>

        <div className="flex items-center gap-4 mb-4">
          <StepBadge index={1} active={step === 1} done={step > 1} />
          <div className={`h-[2px] grow ${step > 1 ? "bg-emerald-600" : "bg-border"}`} />
          <StepBadge index={2} active={step === 2} done={step > 2} />
          <div className={`h-[2px] grow ${step > 2 ? "bg-emerald-600" : "bg-border"}`} />
          <StepBadge index={3} active={step === 3} done={false} />
        </div>

        {alreadyUnlocked && (
          <div className="flex items-start gap-2 rounded-lg border p-3 bg-emerald-50">
            <CheckCircle2 className="h-5 w-5 text-emerald-600 mt-0.5" />
            <div>
              <div className="text-sm font-medium">Bereits freigeschaltet</div>
              <div className="text-sm text-muted-foreground">Dieser Kandidat ist bereits freigeschaltet.</div>
            </div>
          </div>
        )}

        <div className="min-h-[220px]">
          {step === 1 && (
            <motion.div initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }} className="space-y-4">
              <div className="rounded-lg border p-4">
                <Label className="mb-2 block">Freischaltungsgrund</Label>
                <RadioGroup value={unlockType} onValueChange={(v) => setUnlockType(v as UnlockType)} className="space-y-3">
                  <div className="flex items-start gap-3">
                    <RadioGroupItem id="bewerbung" value="bewerbung" disabled={!contextApplication} />
                    <div className="grid gap-1 flex-1">
                      <Label htmlFor="bewerbung" className={!contextApplication ? "opacity-50" : ""}>
                        Basierend auf Bewerbung
                      </Label>
                      <p className="text-xs text-muted-foreground">
                        {contextApplication 
                          ? "Freischaltung mit Bewerbungskontext (1 Token)"
                          : "Nicht verfügbar: Kein Bewerbungskontext"}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-start gap-3">
                    <RadioGroupItem id="initiativ" value="initiativ" />
                    <div className="grid gap-1 flex-1">
                      <Label htmlFor="initiativ">Initiativ (ohne Bewerbung)</Label>
                      <p className="text-xs text-muted-foreground">
                        Optional Stelle auswählen oder komplett initiativ (2 Tokens)
                      </p>
                    </div>
                  </div>
                </RadioGroup>
              </div>
              <div className="flex items-center gap-2 text-xs text-muted-foreground bg-muted/50 p-3 rounded-lg">
                <Coins className="h-4 w-4" />
                <span>
                  Kosten: <strong>{tokenCost} Token{tokenCost !== 1 && "s"}</strong>
                  {contextType === "match" && " (Match-Freischaltung)"}
                </span>
              </div>
            </motion.div>
          )}

          {step === 2 && (
            <motion.div initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }} className="space-y-4">
              {jobSelect}
              <div className="space-y-2">
                <Label>Interne Notiz (optional)</Label>
                <Textarea 
                  value={notes} 
                  onChange={(e) => setNotes(e.target.value)} 
                  placeholder="Warum ist der Kandidat interessant? Für welche Rolle?"
                  rows={3}
                />
              </div>
              {contextApplication?.job_id && selectedJobId && selectedJobId !== contextApplication.job_id && (
                <div className="rounded-md border border-amber-300 bg-amber-50 p-3 text-sm">
                  ⚠️ Die ursprüngliche Bewerbung wird als <strong>abgelehnt</strong> markiert
                </div>
              )}
            </motion.div>
          )}

          {step === 3 && (
            <motion.div initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }} className="space-y-4">
              <div className="rounded-lg border p-4 space-y-2">
                <div className="text-sm">
                  <span className="text-muted-foreground">Kandidat:</span>{" "}
                  <span className="font-medium">{candidateName}</span>
                </div>
                <div className="text-sm">
                  <span className="text-muted-foreground">Art:</span>{" "}
                  <span className="font-medium">{unlockType === "bewerbung" ? "Bewerbung" : "Initiativ"}</span>
                </div>
                <div className="text-sm">
                  <span className="text-muted-foreground">Stelle:</span>{" "}
                  {selectedJobId ? (
                    <span className="font-medium">{jobs.find(j => j.id === selectedJobId)?.title || "(gewählt)"}</span>
                  ) : (
                    <span className="font-medium">Keine (Initiativ)</span>
                  )}
                </div>
                {notes.trim() && (
                  <div className="text-sm">
                    <span className="text-muted-foreground">Notiz:</span> {notes.trim()}
                  </div>
                )}
                <div className="text-sm pt-2 border-t flex items-center gap-2">
                  <Coins className="h-4 w-4 text-primary" />
                  <span className="font-medium">{tokenCost} Token{tokenCost !== 1 && "s"} werden abgezogen</span>
                </div>
              </div>
            </motion.div>
          )}
        </div>

        <DialogFooter className="gap-2">
          <Button variant="outline" onClick={() => handleOpenChange(false)} disabled={loading}>
            Abbrechen
          </Button>
          {step > 1 && (
            <Button variant="ghost" onClick={() => setStep(s => Math.max(1, s - 1))} disabled={loading}>
              <ChevronLeft className="mr-2 h-4 w-4" /> Zurück
            </Button>
          )}
          {step < 3 ? (
            <Button onClick={() => setStep(s => Math.min(3, s + 1))} disabled={loading}>
              Weiter <ChevronRight className="ml-2 h-4 w-4" />
            </Button>
          ) : (
            <Button onClick={handleConfirm} disabled={loading || alreadyUnlocked}>
              {loading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" /> Speichern...
                </>
              ) : (
                <>Freischaltung bestätigen</>
              )}
            </Button>
          )}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
