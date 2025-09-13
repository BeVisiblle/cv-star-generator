import React from "react";
import { InterestingPeople } from "@/components/recommendations/InterestingPeople";
import { InterestingCompanies } from "@/components/recommendations/InterestingCompanies";
import { RightRailAd } from "@/components/linkedin/right-rail/RightRailAd";
import NonAkademikerPlusAd from "@/components/notifications/NonAkademikerPlusAd";

export const RightPanel: React.FC = () => {
  return (
    <aside aria-label="Widgets" className="space-y-4">
      {/* Werbung */}
      <RightRailAd 
        variant="card"
        size="md"
        title="Entdecke jetzt die Zukunft deiner Karriere"
        description="Teste unsere Tools für Azubis und Fachkräfte – kostenlos starten!"
        ctaText="Jetzt testen"
      />

      {/* Premium Upgrade */}
      <NonAkademikerPlusAd />

      {/* Interessante Personen */}
      <InterestingPeople />

      {/* Interessante Unternehmen */}
      <InterestingCompanies />

      {/* Banner Ad */}
      <RightRailAd 
        variant="banner"
        size="sm"
        title="Karriere-Boost"
        description="Finde deinen Traumjob"
        ctaText="Mehr erfahren"
      />
    </aside>
  );
};

export default RightPanel;
