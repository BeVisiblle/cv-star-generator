import React from "react";
import { Card } from "@/components/ui/card";

export const RightPanel: React.FC = () => {
  return (
    <aside aria-label="Widgets" className="space-y-4">
      <Card className="p-5">
        <h3 className="text-sm font-medium mb-3">Vorgeschlagene Themen</h3>
        <ul className="text-sm text-muted-foreground space-y-2">
          <li># Karrieretipps</li>
          <li># Vorstellungsgespräch</li>
          <li># Weiterbildung</li>
        </ul>
      </Card>
      <Card className="p-5">
        <h3 className="text-sm font-medium mb-3">Trends</h3>
        <ul className="text-sm text-muted-foreground space-y-2">
          <li>• Neue Funktionen im CV Generator</li>
          <li>• Beliebte Beiträge diese Woche</li>
          <li>• Community-Events</li>
        </ul>
      </Card>
    </aside>
  );
};

export default RightPanel;
