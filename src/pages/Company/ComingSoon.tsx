import React, { useMemo } from "react";
import ComingSoon from "@/components/coming-soon/ComingSoon";
import { useLocation } from "react-router-dom";

// Map paths to friendly titles
const titlesByPath: Record<string, string> = {
  "/company/candidates/pipeline": "Pipeline (Bewerbungsstatus)",
  "/company/candidates/saved": "Gespeicherte Kandidaten",
  "/company/candidates/token-history": "Token-Historie",
  "/company/community/groups": "Community – Gruppen",
  "/company/community/events": "Community – Veranstaltungen",
  "/company/media/photos": "Medien – Fotogalerie",
  "/company/media/videos": "Medien – Videogalerie",
  "/company/jobs": "Stellenangebote – Meine Anzeigen",
  "/company/jobs/new": "Stellenangebote – Neue Anzeige",
  "/company/jobs/applicants": "Stellenangebote – Bewerber pro Anzeige",
  "/company/insights/views": "Insights – Kandidaten-Ansichten",
  "/company/insights/reach": "Insights – Beitragsreichweite",
  "/company/insights/engagement": "Insights – Engagement",
  "/company/insights/followers": "Insights – Follower-Wachstum",
  "/company/settings/team": "Team & Rollen",
  "/company/settings/notifications": "Benachrichtigungen",
  "/company/help/center": "Hilfe-Center",
  "/company/help/support": "Support kontaktieren",
  "/company/help/feedback": "Feedback geben",
};

const CompanyComingSoon: React.FC = () => {
  const { pathname } = useLocation();

  const title = useMemo(() => {
    // exact match first
    if (titlesByPath[pathname]) return titlesByPath[pathname];

    // handle dynamic applicants url like /company/jobs/:id/applicants
    if (/^\/company\/jobs\/[^/]+\/applicants$/.test(pathname)) {
      return "Stellenangebote – Bewerber pro Anzeige";
    }

    return "Bald verfügbar";
  }, [pathname]);

  return (
    <div className="p-4 md:p-6">
      <ComingSoon title={title} />
    </div>
  );
};

export default CompanyComingSoon;
