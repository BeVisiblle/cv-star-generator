import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

interface ConnectionRequestCardProps {
  id: string;
  name: string;
  avatarUrl?: string;
  headline?: string;
  location?: string;
  type: 'incoming' | 'outgoing';
  onAccept?: () => void;
  onDecline?: () => void;
  onCancel?: () => void;
  loading?: boolean;
}

export function ConnectionRequestCard({
  id,
  name,
  avatarUrl,
  headline,
  location,
  type,
  onAccept,
  onDecline,
  onCancel,
  loading = false,
}: ConnectionRequestCardProps) {
  const initials = name
    .split(' ')
    .map(n => n[0])
    .join('')
    .slice(0, 2)
    .toUpperCase();

  return (
    <Card className="p-4">
      <div className="flex items-start gap-4">
        <Avatar className="h-14 w-14">
          <AvatarImage src={avatarUrl} />
          <AvatarFallback>{initials}</AvatarFallback>
        </Avatar>

        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-1">
            <h3 className="font-semibold truncate">{name}</h3>
            {type === 'incoming' && (
              <Badge variant="secondary" className="bg-blue-100 text-blue-700 dark:bg-blue-900 dark:text-blue-300">
                Neu
              </Badge>
            )}
          </div>
          
          {type === 'incoming' && (
            <p className="text-sm text-muted-foreground mb-2">
              hat Ihnen eine Anfrage geschickt
            </p>
          )}
          
          {type === 'outgoing' && (
            <p className="text-sm text-muted-foreground mb-2">
              Anfrage gesendet
            </p>
          )}
          
          {(headline || location) && (
            <p className="text-sm text-muted-foreground truncate">
              {headline || location}
            </p>
          )}

          <div className="flex gap-2 mt-3">
            {type === 'incoming' && (
              <>
                <Button 
                  size="sm" 
                  onClick={onAccept}
                  disabled={loading}
                >
                  Annehmen
                </Button>
                <Button 
                  size="sm" 
                  variant="outline" 
                  onClick={onDecline}
                  disabled={loading}
                >
                  Ablehnen
                </Button>
              </>
            )}
            
            {type === 'outgoing' && (
              <Button 
                size="sm" 
                variant="ghost" 
                onClick={onCancel}
                disabled={loading}
              >
                Zurückziehen
              </Button>
            )}
          </div>
        </div>
      </div>
    </Card>
  );
}
