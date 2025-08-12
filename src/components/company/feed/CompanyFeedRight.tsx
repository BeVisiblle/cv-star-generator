import React from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ArrowRight, Users } from "lucide-react";
import { useNavigate } from "react-router-dom";

const CompanyFeedRight: React.FC = () => {
  const navigate = useNavigate();
  return (
    <aside aria-label="Widgets" className="space-y-4">
      <Card className="p-5">
        <h3 className="text-sm font-medium">Ihre Matches</h3>
        <p className="text-sm text-muted-foreground mt-1">
          Sehen Sie passende Kandidaten basierend auf Ihrem Profil.
        </p>
        <div className="mt-3 flex gap-2">
          <Button size="sm" onClick={() => navigate("/company/unlocked")}>
            Zu Best Matches <ArrowRight className="h-4 w-4 ml-1" />
          </Button>
          <Button size="sm" variant="outline" onClick={() => navigate("/company/search")}>
            Kandidaten entdecken
          </Button>
        </div>
      </Card>

      <Card className="p-5">
        <h3 className="text-sm font-medium">Tipp</h3>
        <p className="text-sm text-muted-foreground mt-1">
          Veröffentlichen Sie regelmäßig Beiträge und Jobs, um Ihre Sichtbarkeit zu erhöhen.
        </p>
        <div className="mt-3">
          <Button size="sm" variant="secondary" onClick={() => navigate("/company/profile")}>Profil optimieren</Button>
        </div>
      </Card>
    </aside>
  );
};

export default CompanyFeedRight;
