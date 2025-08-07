import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

interface PriceCalculatorProps {
  selectedGroups: string[];
  companyName: string;
}

const targetGroupOptions = [
  { id: "azubis", label: "Azubis", price: 49 },
  { id: "schueler", label: "Schüler:innen", price: 39 },
  { id: "gesellen", label: "Gesellen", price: 59 },
];

export function PriceCalculator({ selectedGroups, companyName }: PriceCalculatorProps) {
  const calculateTotal = () => {
    return selectedGroups.reduce((total, groupId) => {
      const group = targetGroupOptions.find(g => g.id === groupId);
      return total + (group?.price || 0);
    }, 0);
  };

  const total = calculateTotal();
  const selectedOptions = targetGroupOptions.filter(group => selectedGroups.includes(group.id));

  return (
    <Card className="p-6 bg-gradient-to-br from-primary/5 to-accent/10 border-primary/20 sticky top-4">
      <div className="space-y-4">
        <div>
          <h3 className="text-lg font-semibold mb-2">Ihre Auswahl</h3>
          {companyName && (
            <p className="text-sm text-muted-foreground">für {companyName}</p>
          )}
        </div>

        {selectedOptions.length > 0 ? (
          <div className="space-y-3">
            {selectedOptions.map(group => (
              <div key={group.id} className="flex items-center justify-between py-2 border-b border-border/50">
                <div className="flex items-center space-x-2">
                  <Badge variant="secondary" className="text-xs">{group.label}</Badge>
                </div>
                <span className="font-medium">{group.price}€</span>
              </div>
            ))}
            
            <div className="pt-3 border-t border-border">
              <div className="flex items-center justify-between">
                <span className="font-semibold">Gesamt:</span>
                <span className="text-2xl font-bold text-primary">{total}€</span>
              </div>
              <p className="text-xs text-muted-foreground mt-1">pro Monat</p>
            </div>

            <div className="bg-accent/20 rounded-lg p-3">
              <div className="flex items-center space-x-2">
                <span className="text-green-600 font-bold">✓</span>
                <span className="text-sm font-medium">30 Tage kostenlos</span>
              </div>
              <p className="text-xs text-muted-foreground mt-1">
                Danach monatlich kündbar
              </p>
            </div>
          </div>
        ) : (
          <div className="text-center py-8">
            <div className="text-4xl mb-2">📊</div>
            <p className="text-sm text-muted-foreground">
              Wählen Sie Zielgruppen aus, um den Preis zu sehen
            </p>
          </div>
        )}
      </div>
    </Card>
  );
}