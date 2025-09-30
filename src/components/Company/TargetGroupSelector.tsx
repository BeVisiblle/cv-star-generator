import { Card } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";

interface TargetGroupSelectorProps {
  selectedGroups: string[];
  onSelectionChange: (groups: string[]) => void;
  error?: string;
}

const targetGroupOptions = [
  { id: "azubis", label: "Azubis", price: 49, desc: "Auszubildende suchen" },
  { id: "schueler", label: "Schüler:innen", price: 39, desc: "Schüler für Praktika & Ausbildung" },
  { id: "gesellen", label: "Gesellen", price: 59, desc: "Fertig ausgebildete Fachkräfte" },
];

export function TargetGroupSelector({ selectedGroups, onSelectionChange, error }: TargetGroupSelectorProps) {
  const toggleGroup = (groupId: string) => {
    if (selectedGroups.includes(groupId)) {
      onSelectionChange(selectedGroups.filter(g => g !== groupId));
    } else {
      onSelectionChange([...selectedGroups, groupId]);
    }
  };

  return (
    <div className="space-y-3">
      <div>
        <h3 className="text-lg font-semibold mb-1">Zielgruppen</h3>
        <p className="text-sm text-muted-foreground">Wen möchten Sie finden?</p>
        {error && (
          <p className="text-sm text-destructive font-medium mt-1">{error}</p>
        )}
      </div>
      
      <div className="space-y-2">
        {targetGroupOptions.map(group => (
          <Card key={group.id} className="p-4">
            <div className="flex items-center space-x-3">
              <Checkbox
                id={group.id}
                checked={selectedGroups.includes(group.id)}
                onCheckedChange={() => toggleGroup(group.id)}
              />
              <div className="flex-1">
                <Label htmlFor={group.id} className="font-medium cursor-pointer">{group.label}</Label>
                <p className="text-xs text-muted-foreground">{group.desc}</p>
              </div>
              <div className="text-right">
                <span className="font-bold text-primary">{group.price}€</span>
                <span className="text-xs text-muted-foreground">/Monat</span>
              </div>
            </div>
          </Card>
        ))}
      </div>
    </div>
  );
}