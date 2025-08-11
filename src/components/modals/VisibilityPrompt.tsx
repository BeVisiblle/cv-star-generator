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
  const { profile, isLoading, refetchProfile } = useAuth();
  const { toast } = useToast();
  const [open, setOpen] = useState(false);
  const [selected, setSelected] = useState<JobOption[]>([]);

  // Open dialog on login if profile exists and is not published
  useEffect(() => {
    if (!isLoading && profile) {
      setSelected((profile as any)?.job_search_preferences ?? []);
      if (!profile.profile_published) {
        // Slight defer to avoid layout shifts
        setTimeout(() => setOpen(true), 0);
      }
    }
  }, [isLoading, profile]);

  const summary = useMemo(() => {
    if (!selected?.length) return "dein Profil";
    return selected.join(", ");
  }, [selected]);

  const toggle = (value: JobOption) => {
    setSelected(prev => {
      const has = prev.includes(value);
      let next = has ? prev.filter(v => v !== value) : [...prev, value];

      // Logic: "Praktikum" und "Ausbildung" nicht gleichzeitig
      if (!has && value === "Praktikum") {
        next = next.filter(v => v !== "Ausbildung");
      }
      if (!has && value === "Ausbildung") {
        next = next.filter(v => v !== "Praktikum");
      }
      return next as JobOption[];
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
    setOpen(false);
    toast({
      title: "Sichtbarkeit aktiviert",
      description: `Du bist jetzt für Unternehmen sichtbar, die nach ${summary} suchen.`,
    });
  };

  if (isLoading || !profile) return null;

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Für Unternehmen sichtbar werden</DialogTitle>
          <DialogDescription>
            Dein Profil ist aktuell nicht für Unternehmen sichtbar. Wähle, wonach du suchst – das hilft beim Matching.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          <div className="space-y-2">
            <Label>Was suchst du? (Mehrfachauswahl möglich)</Label>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {JOB_OPTIONS.map(opt => (
                <label key={opt.value} className="flex items-center gap-3 rounded-md border p-3 cursor-pointer hover:bg-accent/40">
                  <Checkbox
                    checked={selected.includes(opt.value)}
                    onCheckedChange={() => toggle(opt.value)}
                    aria-label={opt.label}
                  />
                  <span className="text-sm">{opt.label}</span>
                </label>
              ))}
            </div>
            <p className="text-xs text-muted-foreground">
              Hinweis: „Praktikum“ und „Ausbildung“ können nicht gleichzeitig gewählt werden.
            </p>
          </div>

          <div className="rounded-md bg-muted p-3 text-sm">
            Bevor du zustimmst: Dein Profil wird für Unternehmen sichtbar, die nach {summary} suchen. Du kannst das später jederzeit in den Einstellungen ändern.
          </div>
        </div>

        <DialogFooter className="gap-2">
          <Button variant="outline" onClick={() => setOpen(false)}>Später</Button>
          <Button onClick={makeVisibleNow} disabled={selected.length === 0}>Jetzt sichtbar machen</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
