import React, { useRef, useEffect } from "react";
import { Card } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";
import { ChevronRight, Lock } from "lucide-react";
import { useGatedCompanyRecommendations } from "@/hooks/useGatedCompanyRecommendations";

interface SimpleCompany {
  id: string;
  name: string | null;
  logo_url: string | null;
  industry: string | null;
  main_location: string | null;
}
interface CompanyRecommendationsProps {
  limit?: number;
  showMoreLink?: string;
  showMore?: boolean;
}

export const CompanyRecommendations: React.FC<CompanyRecommendationsProps> = ({ limit = 3, showMoreLink = "/entdecken/unternehmen", showMore = true }) => {
  const navigate = useNavigate();
  const cardRef = useRef<HTMLDivElement>(null);
  const {
    loading,
    companies,
    following,
    isFollowEnabled,
    startViewTracking,
    markAsScrolled,
    toggleFollow
  } = useGatedCompanyRecommendations(limit);

  // Start view tracking when component mounts
  useEffect(() => {
    companies.forEach(company => {
      startViewTracking(company.id);
    });
  }, [companies, startViewTracking]);

  // Handle scroll detection
  useEffect(() => {
    const cardElement = cardRef.current;
    if (!cardElement) return;

    const handleScroll = () => {
      companies.forEach(company => {
        markAsScrolled(company.id);
      });
    };

    cardElement.addEventListener('scroll', handleScroll);
    // Also trigger on any scroll within the card
    const scrollElements = cardElement.querySelectorAll('*');
    scrollElements.forEach(el => {
      el.addEventListener('scroll', handleScroll);
    });

    return () => {
      cardElement.removeEventListener('scroll', handleScroll);
      scrollElements.forEach(el => {
        el.removeEventListener('scroll', handleScroll);
      });
    };
  }, [companies, markAsScrolled]);

  return (
    <Card ref={cardRef} className="p-3">
      <h3 className="text-sm font-semibold mb-2">Interessante Unternehmen</h3>
      <div className="space-y-2 max-h-80 overflow-y-auto">
        {loading && (
          <div className="space-y-2">
            {Array.from({ length: 3 }).map((_, i) => (
              <div key={i} className="flex items-center gap-3">
                <div className="h-8 w-8 rounded bg-muted animate-pulse" />
                <div className="flex-1 space-y-1">
                  <div className="h-3 w-1/2 bg-muted rounded animate-pulse" />
                  <div className="h-3 w-2/3 bg-muted rounded animate-pulse" />
                </div>
                <div className="h-7 w-20 bg-muted rounded animate-pulse" />
              </div>
            ))}
          </div>
        )}
        {!loading && companies.map(c => {
          const name = c.name || "Unternehmen";
          const info = [c.main_location, c.industry].filter(Boolean).join(" • ");
          const followEnabled = isFollowEnabled(c.id);
          const isAlreadyFollowing = following.has(c.id);
          
          return (
            <div key={c.id} className="flex items-center gap-3">
              <Avatar className="h-8 w-8 rounded">
                <AvatarImage src={c.logo_url ?? undefined} alt={`${name} Logo`} />
                <AvatarFallback className="text-xs">{name.slice(0, 2)}</AvatarFallback>
              </Avatar>
              <div className="flex-1 min-w-0">
                <div className="text-sm font-medium truncate">{name}</div>
                {info && <div className="text-xs text-muted-foreground truncate">{info}</div>}
              </div>
              <div className="flex gap-1">
                <Button 
                  size="sm" 
                  variant={isAlreadyFollowing ? "outline" : "secondary"} 
                  className="h-7 px-2 text-xs relative" 
                  onClick={() => toggleFollow(c.id)}
                  disabled={!followEnabled && !isAlreadyFollowing}
                >
                  {!followEnabled && !isAlreadyFollowing && (
                    <Lock className="h-3 w-3 mr-1" />
                  )}
                  {isAlreadyFollowing ? "Folge ich" : "Folgen"}
                </Button>
                <Button 
                  size="sm" 
                  variant="outline" 
                  className="h-7 px-2 text-xs" 
                  onClick={() => navigate(`/companies/${c.id}`)}
                >
                  Ansehen
                </Button>
              </div>
            </div>
          );
        })}
        {!loading && companies.length === 0 && (
          <p className="text-xs text-muted-foreground">Aktuell keine Unternehmensempfehlungen verfügbar.</p>
        )}
      </div>
      {showMore && (
        <div className="pt-2">
          <Button variant="link" size="sm" className="px-0" onClick={() => (window.location.href = showMoreLink)}>
            Mehr anzeigen <ChevronRight className="h-4 w-4 ml-1" />
          </Button>
        </div>
      )}
    </Card>
  );
};
