import { useMemo } from "react";
import { useCompanyInterests } from "@/hooks/useCompanyInterests";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Building2 } from "lucide-react";
import { formatDistanceToNow } from "date-fns";
import { de } from "date-fns/locale";
import { useNavigate } from "react-router-dom";

interface CompanyInterestsListProps {
  searchQuery: string;
}

export function CompanyInterestsList({ searchQuery }: CompanyInterestsListProps) {
  const { data: interests, isLoading } = useCompanyInterests();
  const navigate = useNavigate();

  const filteredInterests = useMemo(() => {
    if (!interests) return [];

    let filtered = interests;

    // Search filter
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(
        (item) =>
          item.company?.name?.toLowerCase().includes(query) ||
          item.company?.industry?.toLowerCase().includes(query)
      );
    }

    return filtered;
  }, [interests, searchQuery]);

  if (isLoading) {
    return <div className="text-center py-12">Laden...</div>;
  }

  return (
    <div className="space-y-6">
      {/* Filter Button */}
      <div className="flex gap-2">
        <Button variant="default" size="sm" className="rounded-full">
          Alle ({filteredInterests.length})
        </Button>
      </div>

      {/* Interests List */}
      {filteredInterests.length === 0 ? (
        <Card className="p-12 text-center">
          <Building2 className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
          <p className="text-muted-foreground">
            Noch keine Unternehmen haben Interesse an dir gezeigt
          </p>
          <p className="text-sm text-muted-foreground mt-2">
            Unternehmen können dich basierend auf deinem Profil und Bewerbungen freischalten
          </p>
        </Card>
      ) : (
        <div className="space-y-4">
          {filteredInterests.map((interest) => (
            <Card
              key={interest.id}
              className="p-6 hover:shadow-md transition-shadow cursor-pointer"
              onClick={() => navigate(`/companies/${interest.company_id}`)}
            >
              <div className="flex items-start gap-4">
                {/* Company Logo */}
                <Avatar className="h-16 w-16 rounded-lg">
                  <AvatarImage src={interest.company?.logo_url} />
                  <AvatarFallback className="rounded-lg">
                    {interest.company?.name?.charAt(0)}
                  </AvatarFallback>
                </Avatar>

                {/* Company Info */}
                <div className="flex-1 min-w-0">
                  <h3 className="font-semibold text-lg mb-1 hover:text-primary">
                    {interest.company?.name}
                  </h3>
                  <p className="text-sm text-muted-foreground mb-3">
                    {interest.company?.industry}
                  </p>

                  {/* Date and Badge */}
                  <div className="flex items-center gap-3">
                    <Badge variant="default" className="bg-green-600">
                      Interessiert
                    </Badge>
                    <span className="text-sm text-muted-foreground">
                      vor {formatDistanceToNow(new Date(interest.unlocked_at), { locale: de })}
                    </span>
                  </div>
                </div>

                {/* View Button */}
                <Button
                  variant="outline"
                  onClick={(e) => {
                    e.stopPropagation();
                    navigate(`/companies/${interest.company_id}`);
                  }}
                >
                  Profil ansehen
                </Button>
              </div>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
