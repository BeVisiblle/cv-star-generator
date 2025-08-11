import React from "react";
import { RightRailAd } from "@/components/linkedin/right-rail/RightRailAd";
import { InterestingPeople } from "@/components/recommendations/InterestingPeople";
import { InterestingCompanies } from "@/components/recommendations/InterestingCompanies";

export const RightPanel: React.FC = () => {
  return (
    <aside aria-label="Widgets" className="space-y-4">
      <RightRailAd variant="card" size="sm" />
      <InterestingPeople />
      <InterestingCompanies />
      <RightRailAd variant="banner" size="sm" />
    </aside>
  );
};

export default RightPanel;
