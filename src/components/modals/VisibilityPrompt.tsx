import { useEffect, useMemo, useState } from "react";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

const JOB_OPTIONS = [
  { value: "Praktikum", label: "Praktikum" },
  { value: "Ausbildung", label: "Ausbildung" },
  { value: "Nach der Ausbildung einen Job", label: "Nach der Ausbildung einen Job" },
  { value: "Ausbildungsplatzwechsel", label: "Ausbildungsplatzwechsel" },
] as const;

type JobOption = typeof JOB_OPTIONS[number]["value"];

export function VisibilityPrompt() {
  const { profile, isLoading, refetchProfile, session } = useAuth();
  const { toast } = useToast();
  const [open, setOpen] = useState(false);
  const [selected, setSelected] = useState<JobOption[]>([]);

  const allowedOptions = useMemo<JobOption[]>(() => {
    const status = (profile as any)?.status;
    switch (status) {
      case "schueler":
        return ["Praktikum", "Ausbildung"];
      case "azubi":
        return ["Ausbildungsplatzwechsel", "Nach der Ausbildung einen Job"];
      case "ausgelernt":
      case "geselle":
        return ["Nach der Ausbildung einen Job"];
      default:
        return JOB_OPTIONS.map(o => o.value as JobOption);
    }
  }, [profile]);

  const defaultByStatus = useMemo<Record<string, JobOption[]>>(() => ({
    schueler: ["Praktikum", "Ausbildung"],
    azubi: ["Ausbildungsplatzwechsel"],
    ausgelernt: ["Nach der Ausbildung einen Job"],
    geselle: ["Nach der Ausbildung einen Job"],
  }), []);

  useEffect(() => {
    if (!isLoading && profile) {
      const existing = ((profile as any)?.job_search_preferences ?? []) as JobOption[];
      const filteredExisting = existing.filter(v => allowedOptions.includes(v));
      if (filteredExisting.length > 0) {
        setSelected(filteredExisting);
      } else {
        const status = (profile as any)?.status as string | undefined;
        const defaults = status ? defaultByStatus[status] ?? [] : [];
        const validDefaults = (defaults || []).filter(v => allowedOptions.includes(v)) as JobOption[];
        setSelected(validDefaults);
      }

      if (!profile.profile_published) {
        const uid = profile.id;
        const token = session?.access_token || "";
        const tokenKey = `visibility_prompt_last_token:${uid}`;
        const declineKey = `visibility_prompt_declined:${uid}`;
        const counterKey = `visibility_prompt_counter:${uid}`;

        const declined = localStorage.getItem(declineKey) === "1";

        // Detect new login via token change
        if (token) {
          const lastToken = localStorage.getItem(tokenKey);
          if (lastToken !== token) {
            localStorage.setItem(tokenKey, token);
            if (declined) {
              const n = parseInt(localStorage.getItem(counterKey) || "0", 10) + 1;
              localStorage.setItem(counterKey, String(n));
            }
          }
        }

        // Decide if we open the prompt
        if (!declined) {
          setTimeout(() => setOpen(true), 0);
        } else {
          const n = parseInt(localStorage.getItem(counterKey) || "0", 10);
          if (n >= 3) {
            setTimeout(() => {
              setOpen(true);
              localStorage.setItem(counterKey, "0");
            }, 0);
          }
        }
      }
    }
  }, [isLoading, profile, session, allowedOptions, defaultByStatus]);

  const summary = useMemo(() => {
    if (!selected?.length) return "dein Profil";
    return selected.join(", ");
  }, [selected]);

  const toggle = (value: JobOption) => {
    const DUAL_ALLOWED: JobOption[] = ["Praktikum", "Ausbildung"];
    const SINGLE_ONLY: JobOption[] = [
      "Nach der Ausbildung einen Job",
      "Ausbildungsplatzwechsel",
    ];

    setSelected((prev) => {
      const isDual = DUAL_ALLOWED.includes(value);
      const isSingle = SINGLE_ONLY.includes(value);

      let next: JobOption[] = [];
      if (isSingle) {
        // Single options are exclusive
        next = prev.length === 1 && prev[0] === value ? [] : [value];
      } else {
        // Dual options can be combined only with each other
        if (prev.some((p) => SINGLE_ONLY.includes(p))) {
          next = [value];
        } else if (prev.includes(value)) {
          next = prev.filter((v) => v !== value) as JobOption[];
        } else {
          next = [...prev, value].filter((v) => DUAL_ALLOWED.includes(v)) as JobOption[];
        }
      }
      return next;
    });
  };

  const makeVisibleNow = async () => {
    if (!profile) return;
    if (selected.length === 0) {
      toast({
        title: "Bitte Auswahl treffen",
        description: "Wähle mindestens eine Option aus (z. B. Ausbildung oder Praktikum).",
        variant: "destructive",
      });
      return;
    }

    const { error } = await supabase
      .from("profiles")
      .update({ profile_published: true, job_search_preferences: selected })
      .eq("id", profile.id);

    if (error) {
      toast({
        title: "Speichern fehlgeschlagen",
        description: "Bitte versuche es später erneut.",
        variant: "destructive",
      });
      return;
    }

    await refetchProfile();
    // Clear decline throttling since user is now visible
    try {
      const uid = profile.id;
      localStorage.removeItem(`visibility_prompt_declined:${uid}`);
      localStorage.removeItem(`visibility_prompt_counter:${uid}`);
    } catch {}
    setOpen(false);
    toast({
      title: "Sichtbarkeit aktiviert",
      description: `Du bist jetzt für Unternehmen sichtbar, die nach ${summary} suchen.`,
    });
  };
  const stayHidden = () => {
    if (!profile) return;
    try {
      const uid = profile.id;
      localStorage.setItem(`visibility_prompt_declined:${uid}`, "1");
      localStorage.setItem(`visibility_prompt_counter:${uid}`, "0");
    } catch {}
    setOpen(false);
  };

  if (isLoading || !profile) return null;

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogContent>
        <DialogHeader>
            <DialogTitle>Vorschau: Für Unternehmen sichtbar werden</DialogTitle>
            <DialogDescription>
              Wähle, wonach du suchst. So sehen Unternehmen deine Sichtbarkeits‑Einstellungen.
            </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          <div className="space-y-2">
            <Label>Was suchst du? (Mehrfachauswahl nur bei Praktikum & Ausbildung)</Label>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {allowedOptions.map((value) => {
                const opt = JOB_OPTIONS.find(o => o.value === value)!;
                return (
                  <label key={opt.value} className="flex items-center gap-3 rounded-md border p-3 cursor-pointer hover:bg-accent/40">
                    <Checkbox
                      checked={selected.includes(opt.value)}
                      onCheckedChange={() => toggle(opt.value)}
                      aria-label={opt.label}
                    />
                    <span className="text-sm">{opt.label}</span>
                  </label>
                );
              })}

            </div>
            <p className="text-xs text-muted-foreground">
              Mehrfachauswahl ist nur bei „Praktikum“ und „Ausbildung“ möglich. Andere Optionen sind Einzelwahl.
            </p>
          </div>

          <div className="rounded-md bg-muted p-3 text-sm">
            Bevor du zustimmst: Dein Profil wird für Unternehmen sichtbar, die nach {summary} suchen. Du kannst das später jederzeit in den Einstellungen ändern.
          </div>
        </div>

        <DialogFooter className="gap-2">
          <Button variant="outline" onClick={() => setOpen(false)}>Später</Button>
          <Button variant="outline" onClick={stayHidden}>Nicht sichtbar bleiben</Button>
          <Button onClick={makeVisibleNow} disabled={selected.length === 0}>Jetzt sichtbar machen</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
