import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Button } from "@/components/ui/button";

export type Stage = "new" | "contacted" | "interview" | "offer" | "hired" | "rejected";

interface SelectionBarProps {
  count: number;
  onClear: () => void;
  onBulkStage: (stage: Stage) => void;
  onExportCsv: () => void;
  onExportXlsx: () => void;
  busy?: boolean;
}

export function SelectionBar({
  count,
  onClear,
  onBulkStage,
  onExportCsv,
  onExportXlsx,
  busy = false
}: SelectionBarProps) {
  const stages: { value: Stage; label: string }[] = [
    { value: "new", label: "Neu" },
    { value: "contacted", label: "Kontaktiert" },
    { value: "interview", label: "Interview" },
    { value: "offer", label: "Angebot" },
    { value: "hired", label: "Eingestellt" },
    { value: "rejected", label: "Abgelehnt" },
  ];

  return (
    <div className="sticky top-12 z-30 mb-2 flex items-center justify-between rounded-2xl border bg-white/90 p-3 backdrop-blur shadow-sm">
      <div className="text-sm font-medium">
        <span className="font-semibold text-primary">{count}</span> ausgewählt
      </div>
      
      <div className="flex items-center gap-3">
        <div className="flex items-center gap-2">
          <span className="text-xs text-muted-foreground">Stage:</span>
          <Select onValueChange={(value) => onBulkStage(value as Stage)} disabled={busy}>
            <SelectTrigger className="w-[140px] h-8">
              <SelectValue placeholder="Auswählen" />
            </SelectTrigger>
            <SelectContent>
              {stages.map((stage) => (
                <SelectItem key={stage.value} value={stage.value}>
                  {stage.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        
        <div className="h-6 w-px bg-border" />
        
        <div className="flex items-center gap-2">
          <Button 
            variant="outline" 
            size="sm" 
            onClick={onExportCsv} 
            disabled={busy}
            className="h-8"
          >
            Export CSV
          </Button>
          <Button 
            variant="outline" 
            size="sm" 
            onClick={onExportXlsx} 
            disabled={busy}
            className="h-8"
          >
            Export Excel
          </Button>
        </div>
        
        <div className="h-6 w-px bg-border" />
        
        <Button 
          variant="ghost" 
          size="sm" 
          onClick={onClear}
          className="h-8"
        >
          Auswahl aufheben
        </Button>
      </div>
    </div>
  );
}