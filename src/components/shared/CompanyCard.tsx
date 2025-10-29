import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { MapPin } from 'lucide-react';
import type { CompanyBase } from '@/types/company';

export interface CompanyCardProps {
  company: CompanyBase;
  subtitle?: string;
  action?: React.ReactNode;
  onClick?: () => void;
  href?: string;
  className?: string;
  variant?: 'following' | 'requests' | 'discover';
  mutuals?: { id: string; avatar_url?: string | null; name?: string }[];
  mutual_count?: number;
  reasons?: string[];
  disabledActions?: boolean;
  onPrimary?: () => void;
  onSecondary?: () => void;
}

export function CompanyCard({
  company,
  subtitle,
  action,
  onClick,
  href,
  className = '',
  variant = 'discover',
  mutuals = [],
  mutual_count = 0,
  reasons = [],
  disabledActions = false,
  onPrimary,
  onSecondary
}: CompanyCardProps) {
  const handleCardClick = () => {
    if (onClick) {
      onClick();
    } else if (href) {
      window.location.href = href;
    }
  };

  const displayMutuals = mutuals.slice(0, 3);
  const remainingCount = Math.max(0, mutual_count - displayMutuals.length);

  return (
    <Card className={`flex h-full max-w-[320px] flex-col transition-shadow hover:shadow-md ${className}`}>
      <div 
        className="flex-1 cursor-pointer p-4"
        onClick={handleCardClick}
      >
        {/* Header */}
        <div className="flex min-h-[56px] items-start gap-3">
          <Avatar className="h-12 w-12 rounded-lg">
            <AvatarImage 
              src={company.logo_url || ''} 
              alt={`${company.name} logo`}
              className="object-cover"
            />
            <AvatarFallback className="rounded-lg bg-muted text-sm font-medium">
              {company.name.charAt(0).toUpperCase()}
            </AvatarFallback>
          </Avatar>
          
          <div className="min-w-0 flex-1">
            <h3 className="truncate text-sm font-semibold hover:underline" title={company.name}>
              {company.name}
            </h3>
            
            {company.industry && (
              <div className="text-xs text-muted-foreground">{company.industry}</div>
            )}
            
            {(company.main_location || subtitle?.includes('•')) && (
              <div className="flex items-center gap-1 text-xs text-muted-foreground">
                <MapPin className="h-3 w-3" />
                <span className="truncate">{company.main_location || subtitle}</span>
              </div>
            )}
          </div>
        </div>

        {/* Mutuals */}
        <div className="mt-3 min-h-[24px]">
          {displayMutuals.length > 0 ? (
            <div className="flex items-center gap-1">
              <div className="flex -space-x-1">
                {displayMutuals.map((mutual) => (
                  <Avatar key={mutual.id} className="h-5 w-5 border border-background">
                    <AvatarImage src={mutual.avatar_url || ''} alt={mutual.name || ''} />
                    <AvatarFallback className="text-[11px]">
                      {(mutual.name || '?').charAt(0).toUpperCase()}
                    </AvatarFallback>
                  </Avatar>
                ))}
              </div>
              
              {remainingCount > 0 && (
                <Badge variant="secondary" className="h-5 px-1.5 text-[11px]">
                  +{remainingCount}
                </Badge>
              )}
              
              <span className="ml-1 text-xs text-muted-foreground">aus deinem Netzwerk</span>
            </div>
          ) : (
            <div className="text-xs text-muted-foreground/70">
              Noch keine gemeinsamen Follower
            </div>
          )}
        </div>

        {/* Reasons */}
        {reasons.length > 0 && (
          <div className="mt-2">
            <div className="flex flex-wrap gap-1">
              {reasons.slice(0, 2).map((reason, index) => (
                <Badge key={index} variant="outline" className="text-[11px] px-1.5 py-0.5">
                  {reason}
                </Badge>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Footer Actions */}
      {(action || variant !== 'discover') && (
        <div className="border-t p-3">
          {action || (
            <div className="flex gap-2">
              {variant === 'following' && (
                <>
                  <Button
                    variant="outline"
                    size="sm"
                    className="flex-1"
                    onClick={(e) => {
                      e.stopPropagation();
                      onPrimary?.();
                    }}
                    disabled={disabledActions}
                  >
                    Entfolgen
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    className="flex-1"
                    onClick={(e) => {
                      e.stopPropagation();
                      onSecondary?.();
                    }}
                  >
                    Ansehen
                  </Button>
                </>
              )}

              {variant === 'requests' && (
                <>
                  <Button
                    size="sm"
                    className="flex-1"
                    onClick={(e) => {
                      e.stopPropagation();
                      onPrimary?.();
                    }}
                    disabled={disabledActions}
                  >
                    Annehmen
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    className="flex-1"
                    onClick={(e) => {
                      e.stopPropagation();
                      onSecondary?.();
                    }}
                  >
                    Ablehnen
                  </Button>
                </>
              )}

              {variant === 'discover' && (
                <Button
                  size="sm"
                  className="w-full"
                  onClick={(e) => {
                    e.stopPropagation();
                    onPrimary?.();
                  }}
                >
                  Folgen
                </Button>
              )}
            </div>
          )}
        </div>
      )}
    </Card>
  );
}

/**
 * Utility function to format company subtitle
 */
export function formatCompanySubtitle(company: CompanyBase): string {
  const parts = [
    company.main_location || '—',
    company.industry || '—',
    company.employee_count ? `${company.employee_count} MA` : '—'
  ];
  return parts.join(' • ');
}