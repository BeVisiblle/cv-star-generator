import React from "react";
import { RightRailAd } from "@/components/linkedin/right-rail/RightRailAd";
import { PeopleRecommendations } from "@/components/linkedin/right-rail/PeopleRecommendations";
import { CompanyRecommendations } from "@/components/linkedin/right-rail/CompanyRecommendations";

export const RightPanel: React.FC = () => {
  return (
    <aside aria-label="Widgets" className="space-y-4">
      <RightRailAd variant="card" size="sm" />
      <PeopleRecommendations limit={3} showMoreLink="/entdecken/azubis" showMore />
      <CompanyRecommendations limit={3} showMoreLink="/entdecken/unternehmen" showMore />
      <RightRailAd variant="banner" size="sm" />
    </aside>
  );
};

export default RightPanel;
