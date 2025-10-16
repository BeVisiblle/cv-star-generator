import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";
import { CompanyJobsCarousel } from "../CompanyJobsCarousel";
import { CompanyPeopleCarousel } from "../CompanyPeopleCarousel";
import { CompanyLatestPosts } from "../CompanyLatestPosts";

interface CompanyHomeTabProps {
  company: {
    id: string;
    name: string;
    description?: string | null;
  };
  isOwner?: boolean;
  onAddPerson?: () => void;
}

export function CompanyHomeTab({ company, isOwner, onAddPerson }: CompanyHomeTabProps) {
  return (
    <div className="max-w-6xl mx-auto px-6 py-8 space-y-6">
      {/* About Preview Card */}
      <Card>
        <CardHeader>
          <CardTitle>Über {company.name}</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="line-clamp-3 text-muted-foreground">
            {company.description || 'Dieses Unternehmen hat noch keine Beschreibung hinzugefügt.'}
          </p>
          <Button variant="link" className="p-0 h-auto mt-2" asChild>
            <Link to={`?tab=about`}>Mehr anzeigen →</Link>
          </Button>
        </CardContent>
      </Card>
      
      {/* Two Column Grid */}
      <div className="grid md:grid-cols-2 gap-6">
        {/* Latest Jobs Card (Carousel) */}
        <CompanyJobsCarousel companyId={company.id} isOwner={isOwner} />
        
        {/* Team Members Card (Carousel) */}
        <CompanyPeopleCarousel 
          companyId={company.id} 
          isOwner={isOwner}
          onAddPerson={onAddPerson}
        />
      </div>
      
      {/* Latest Posts (Horizontal Scroll) */}
      <CompanyLatestPosts companyId={company.id} />
    </div>
  );
}
