import React from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Combobox, ComboboxItem } from "@/components/ui/combobox";
import { Textarea } from "@/components/ui/textarea";
import { useMessaging } from "@/hooks/useMessaging";
import { useToast } from "@/hooks/use-toast";

interface QuickMessageDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  initialContent?: string;
}

export const QuickMessageDialog: React.FC<QuickMessageDialogProps> = ({ open, onOpenChange, initialContent }) => {
  const { listAcceptedConnections, sendMessage } = useMessaging();
  const { toast } = useToast();

  const [loading, setLoading] = React.useState(true);
  const [contacts, setContacts] = React.useState<ComboboxItem[]>([]);
  const [targetId, setTargetId] = React.useState<string>("");
  const [content, setContent] = React.useState<string>("");
  const [sending, setSending] = React.useState(false);

  React.useEffect(() => {
    let mounted = true;
    if (!open) return;
    (async () => {
      setLoading(true);
      const list = await listAcceptedConnections();
      if (!mounted) return;
      const items: ComboboxItem[] = list.map((p) => ({
        value: p.id,
        label: [p.vorname, p.nachname].filter(Boolean).join(" ") || "Unbekannt",
      }));
      setContacts(items);
      setLoading(false);
    })();
    return () => { mounted = false; };
  }, [open, listAcceptedConnections]);

  // Prefill text when dialog opens
  React.useEffect(() => {
    if (open) {
      setContent((prev) => (initialContent !== undefined ? initialContent : prev));
    }
  }, [open, initialContent]);

  const onSend = async () => {
    try {
      if (!targetId || !content.trim()) return;
      setSending(true);
      await sendMessage(targetId, content);
      toast({ title: "Gesendet", description: "Nachricht wurde verschickt." });
      setContent("");
      onOpenChange(false);
    } catch (e: any) {
      toast({ title: "Fehler", description: e.message || "Konnte Nachricht nicht senden.", variant: "destructive" });
    } finally {
      setSending(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>Neue Nachricht</DialogTitle>
        </DialogHeader>
        <div className="space-y-3">
          <Combobox
            items={contacts}
            value={targetId}
            onChange={setTargetId}
            placeholder={loading ? "Lade Kontakte…" : "Kontakt auswählen"}
            searchPlaceholder="Kontakte suchen…"
            emptyText={loading ? "Lade…" : "Keine Kontakte gefunden"}
          />
          <Textarea
            rows={4}
            value={content}
            onChange={(e) => setContent(e.target.value)}
            placeholder="Schreibe deine Nachricht…"
          />
          <div className="flex justify-end gap-2">
            <Button variant="outline" onClick={() => onOpenChange(false)}>Abbrechen</Button>
            <Button onClick={onSend} disabled={!targetId || !content.trim() || sending}>{sending ? "Senden…" : "Senden"}</Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default QuickMessageDialog;
