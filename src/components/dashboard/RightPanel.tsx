import React from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

export const RightPanel: React.FC = () => {
  return (
    <aside aria-label="Widgets" className="space-y-4">
      {/* Werbung */}
      <Card className="relative overflow-hidden">
        <div className="absolute top-2 right-2">
          <Badge variant="secondary" className="text-[10px]">Anzeige</Badge>
        </div>
        <div className="w-full h-24 bg-gradient-to-r from-blue-500 to-purple-600"></div>
        <div className="p-3">
          <h3 className="text-xs font-semibold leading-tight mb-1">Entdecke jetzt die Zukunft deiner Karriere</h3>
          <p className="text-[11px] text-muted-foreground mb-3">Teste unsere Tools für Azubis und Fachkräfte – kostenlos starten!</p>
          <Button size="sm">Jetzt testen</Button>
        </div>
      </Card>

      {/* Premium Ad */}
      <Card className="p-4">
        <div className="text-sm font-medium mb-2">🎯 Non-Akademiker Plus</div>
        <p className="text-xs text-muted-foreground mb-3">
          Erreiche mehr Unternehmen und steigere deine Chancen auf deinen Traumjob!
        </p>
        <Button size="sm" variant="secondary" className="w-full">Jetzt upgraden</Button>
      </Card>

      {/* Interessante Personen */}
      <Card className="p-4">
        <div className="text-sm font-medium mb-3">Interessante Personen für dich</div>
        <div className="space-y-3">
          <div className="flex items-center gap-3">
            <div className="h-8 w-8 rounded-full bg-muted"></div>
            <div className="flex-1">
              <div className="text-sm">Max Mustermann</div>
              <div className="text-xs text-muted-foreground">Fachinformatiker</div>
            </div>
            <Button size="sm" variant="outline">Vernetzen</Button>
          </div>
          <div className="flex items-center gap-3">
            <div className="h-8 w-8 rounded-full bg-muted"></div>
            <div className="flex-1">
              <div className="text-sm">Anna Schmidt</div>
              <div className="text-xs text-muted-foreground">Kauffrau für Büromanagement</div>
            </div>
            <Button size="sm" variant="outline">Vernetzen</Button>
          </div>
        </div>
      </Card>

      {/* Interessante Unternehmen */}
      <Card className="p-4">
        <div className="text-sm font-medium mb-3">Interessante Unternehmen</div>
        <div className="space-y-3">
          <div className="flex items-center gap-3">
            <div className="h-8 w-8 rounded bg-muted"></div>
            <div className="flex-1">
              <div className="text-sm">BMW Group</div>
              <div className="text-xs text-muted-foreground">Automobil</div>
            </div>
            <Button size="sm" variant="outline">Folgen</Button>
          </div>
          <div className="flex items-center gap-3">
            <div className="h-8 w-8 rounded bg-muted"></div>
            <div className="flex-1">
              <div className="text-sm">Siemens AG</div>
              <div className="text-xs text-muted-foreground">Technologie</div>
            </div>
            <Button size="sm" variant="outline">Folgen</Button>
          </div>
        </div>
      </Card>

      {/* Banner Ad */}
      <Card className="relative overflow-hidden">
        <div className="absolute top-2 right-2">
          <Badge variant="secondary" className="text-[10px]">Anzeige</Badge>
        </div>
        <div className="w-full h-16 bg-gradient-to-r from-green-500 to-blue-500"></div>
        <div className="p-3">
          <h3 className="text-xs font-semibold leading-tight mb-1">Karriere-Boost</h3>
          <p className="text-[11px] text-muted-foreground mb-2">Finde deinen Traumjob</p>
          <Button size="sm" variant="secondary">Mehr erfahren</Button>
        </div>
      </Card>
    </aside>
  );
};

export default RightPanel;
