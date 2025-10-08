import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Download } from "lucide-react";

interface UserCVModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  userId: string;
}

export function UserCVModal({ open, onOpenChange, userId }: UserCVModalProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Lebenslauf Vorschau</DialogTitle>
        </DialogHeader>
        <div className="space-y-4">
          <div className="flex justify-end">
            <Button>
              <Download className="h-4 w-4 mr-2" />
              CV herunterladen
            </Button>
          </div>
          <div className="border rounded-lg p-8 bg-background min-h-[600px]">
            <p className="text-muted-foreground text-center py-12">
              CV-Vorschau wird hier angezeigt
            </p>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
