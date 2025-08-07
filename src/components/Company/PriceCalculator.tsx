import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

interface PriceCalculatorProps {
  selectedGroups: string[];
  selectedBranches: string[];
  companyName: string;
  companySize: string;
}

const targetGroupOptions = [
  { id: "azubis", label: "Azubis", price: 49 },
  { id: "schueler", label: "Schüler:innen", price: 39 },
  { id: "gesellen", label: "Gesellen", price: 59 },
];

const branchOptions = [
  { key: 'handwerk', label: 'Handwerk', features: ['5 Seats für Angestellte', 'AI Chatbot', 'Skill-Matching'] },
  { key: 'it', label: 'IT', features: ['10 Seats für Angestellte', 'Tech-Screening', 'Code-Assessment'] },
  { key: 'gesundheit', label: 'Gesundheit', features: ['3 Seats für Angestellte', 'Zertifikat-Check', 'Schichtplanung'] },
  { key: 'buero', label: 'Büro & Verwaltung', features: ['7 Seats für Angestellte', 'Soft-Skills Test', 'Office-Tools'] },
  { key: 'verkauf', label: 'Verkauf & Handel', features: ['5 Seats für Angestellte', 'Sales-Training', 'Kundenkontakt-Check'] },
  { key: 'gastronomie', label: 'Gastronomie', features: ['4 Seats für Angestellte', 'Service-Check', 'Hygiene-Schulung'] },
  { key: 'bau', label: 'Bau & Architektur', features: ['6 Seats für Angestellte', 'Sicherheits-Check', 'CAD-Skills'] }
];

const companySizeMultiplier = {
  "1-10": 1.0,
  "11-25": 1.2,
  "26-50": 1.4,
  "51-100": 1.6,
  "101-250": 1.8,
  "250+": 2.0
};

export function PriceCalculator({ selectedGroups, selectedBranches, companyName, companySize }: PriceCalculatorProps) {
  const calculateTotal = () => {
    const basePrice = selectedGroups.reduce((total, groupId) => {
      const group = targetGroupOptions.find(g => g.id === groupId);
      return total + (group?.price || 0);
    }, 0);
    
    // Add branch multiplier (each additional branch adds 10€)
    const branchMultiplier = selectedBranches.length > 1 ? (selectedBranches.length - 1) * 10 : 0;
    
    // Company size multiplier
    const sizeMultiplier = companySizeMultiplier[companySize as keyof typeof companySizeMultiplier] || 1.0;
    
    return Math.round((basePrice + branchMultiplier) * sizeMultiplier);
  };

  const total = calculateTotal();
  const selectedOptions = targetGroupOptions.filter(group => selectedGroups.includes(group.id));
  const selectedBranchDetails = branchOptions.filter(branch => selectedBranches.includes(branch.key));

  const packageFeatures = [
    "Unbegrenzte Profile-Suche",
    "CV-Download & Kontaktdaten",
    "Skill-Matching Algorithm",
    "24/7 Support",
    "DSGVO-konform",
    "Mobile App verfügbar"
  ];

  return (
    <Card className="p-6 bg-gradient-to-br from-primary/5 to-accent/10 border-primary/20 sticky top-4">
      <div className="space-y-4">
        <div>
          <h3 className="text-lg font-semibold mb-2">Ihre Auswahl</h3>
          {companyName && (
            <p className="text-sm text-muted-foreground">für {companyName}</p>
          )}
        </div>

        {selectedOptions.length > 0 || selectedBranchDetails.length > 0 ? (
          <div className="space-y-4">
            {/* Branchen mit Features */}
            {selectedBranchDetails.map(branch => (
              <div key={branch.key} className="bg-accent/10 rounded-lg p-3">
                <h4 className="font-semibold text-sm mb-2">{branch.label}</h4>
                <div className="space-y-1">
                  {branch.features.map((feature, index) => (
                    <div key={index} className="flex items-center text-xs text-muted-foreground">
                      <span className="text-green-600 mr-2">✓</span>
                      {feature}
                    </div>
                  ))}
                </div>
              </div>
            ))}

            {/* Zielgruppen */}
            {selectedOptions.map(group => (
              <div key={group.id} className="flex items-center justify-between py-2 border-b border-border/50">
                <div className="flex items-center space-x-2">
                  <Badge variant="secondary" className="text-xs">{group.label}</Badge>
                </div>
                <span className="font-medium">{group.price}€</span>
              </div>
            ))}
            
            {companySize && (
              <div className="space-y-2">
                <div className="flex items-center justify-between py-2 border-b border-border/50">
                  <span className="text-sm text-muted-foreground">Unternehmensgröße</span>
                  <span className="text-xs font-medium">{companySize} MA</span>
                </div>
                
                {/* Package Features */}
                <div className="bg-accent/10 rounded-lg p-3">
                  <h4 className="font-semibold text-sm mb-2">Im Paket enthalten:</h4>
                  <div className="space-y-1">
                    {packageFeatures.map((feature, index) => (
                      <div key={index} className="flex items-center text-xs text-muted-foreground">
                        <span className="text-green-600 mr-2">✓</span>
                        {feature}
                      </div>
                    ))}
                  </div>
                </div>
                
                {selectedBranches.length > 1 && (
                  <div className="flex items-center justify-between py-2 border-b border-border/50">
                    <span className="text-sm text-muted-foreground">Mehrere Branchen (+{(selectedBranches.length - 1) * 10}€)</span>
                    <span className="text-xs font-medium">{selectedBranches.length} Branchen</span>
                  </div>
                )}
              </div>
            )}
            
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