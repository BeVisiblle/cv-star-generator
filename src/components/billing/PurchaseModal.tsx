import { useState } from "react";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";

interface PurchaseModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  type: 'tokens' | 'seats' | 'plan';
  summary: string;
  onConfirm: () => Promise<void>;
}

export function PurchaseModal({ open, onOpenChange, type, summary, onConfirm }: PurchaseModalProps) {
  const [loading, setLoading] = useState(false);

  const handleConfirm = async () => {
    setLoading(true);
    try {
      await onConfirm();
    } finally {
      setLoading(false);
      onOpenChange(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{type === 'tokens' ? 'Tokens kaufen' : type === 'seats' ? 'Sitze kaufen' : 'Plan wechseln'}</DialogTitle>
          <DialogDescription>
            {summary}
          </DialogDescription>
        </DialogHeader>
        <div className="flex justify-end gap-2 mt-4">
          <Button variant="outline" onClick={() => onOpenChange(false)} disabled={loading}>Abbrechen</Button>
          <Button onClick={handleConfirm} disabled={loading}>{loading ? 'Wird bestätigt…' : 'Bestätigen'}</Button>
        </div>
        <p className="text-xs text-muted-foreground mt-3">Zahlung simuliert – Stripe folgt.</p>
      </DialogContent>
    </Dialog>
  );
}
