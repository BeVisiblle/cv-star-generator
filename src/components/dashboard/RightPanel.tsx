import React from "react";
import { RightRailAd } from "@/components/linkedin/right-rail/RightRailAd";
import { InterestingPeople } from "@/components/recommendations/InterestingPeople";
import { InterestingCompanies } from "@/components/recommendations/InterestingCompanies";
import NonAkademikerPlusAd from "@/components/notifications/NonAkademikerPlusAd";

export const RightPanel: React.FC = () => {
  return (
    <aside aria-label="Widgets" className="space-y-4">
      <RightRailAd variant="card" size="sm" />
      <NonAkademikerPlusAd />
      <InterestingPeople />
      <InterestingCompanies />
      <RightRailAd variant="banner" size="sm" />
    </aside>
  );
};

export default RightPanel;
