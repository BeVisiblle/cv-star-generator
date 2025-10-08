import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Building2 } from "lucide-react";

interface CompanyFollowRequestCardProps {
  id: string;
  companyId: string;
  companyName: string;
  logoUrl?: string;
  industry?: string;
  location?: string;
  onAccept: (followId: string, companyId: string) => void;
  onDecline: (followId: string) => void;
  loading?: boolean;
}

export function CompanyFollowRequestCard({
  id,
  companyId,
  companyName,
  logoUrl,
  industry,
  location,
  onAccept,
  onDecline,
  loading = false,
}: CompanyFollowRequestCardProps) {
  const initials = companyName
    .split(' ')
    .map(n => n[0])
    .join('')
    .slice(0, 2)
    .toUpperCase();

  return (
    <Card className="p-4">
      <div className="flex items-start gap-4">
        <Avatar className="h-14 w-14">
          <AvatarImage src={logoUrl || undefined} />
          <AvatarFallback>
            <Building2 className="h-6 w-6" />
          </AvatarFallback>
        </Avatar>

        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-1">
            <h3 className="font-semibold truncate">{companyName}</h3>
            <Badge variant="secondary" className="bg-blue-100 text-blue-700 dark:bg-blue-900 dark:text-blue-300">
              Neu
            </Badge>
          </div>
          
          <p className="text-sm text-muted-foreground mb-2">
            möchte Ihnen folgen
          </p>
          
          {(industry || location) && (
            <p className="text-sm text-muted-foreground truncate">
              {[location, industry].filter(Boolean).join(' • ')}
            </p>
          )}

          <div className="flex gap-2 mt-3">
            <Button 
              size="sm" 
              onClick={() => onAccept(id, companyId)}
              disabled={loading}
            >
              Folgen zurück
            </Button>
            <Button 
              size="sm" 
              variant="outline" 
              onClick={() => onDecline(id)}
              disabled={loading}
            >
              Ablehnen
            </Button>
          </div>

          <p className="text-xs text-muted-foreground mt-2">
            Bei Annahme können beide Seiten die Posts des anderen sehen
          </p>
        </div>
      </div>
    </Card>
  );
}
