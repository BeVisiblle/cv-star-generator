import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useNavigate } from "react-router-dom";

interface FriendCardProps {
  id: string;
  name: string;
  avatarUrl?: string;
  headline?: string;
  location?: string;
  branche?: string;
}

export function FriendCard({
  id,
  name,
  avatarUrl,
  headline,
  location,
  branche,
}: FriendCardProps) {
  const navigate = useNavigate();
  
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
          <AvatarImage src={avatarUrl || undefined} />
          <AvatarFallback>{initials}</AvatarFallback>
        </Avatar>

        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-1">
            <h3 className="font-semibold truncate">{name}</h3>
            <Badge variant="secondary" className="bg-green-100 text-green-700 dark:bg-green-900 dark:text-green-300">
              Verbunden
            </Badge>
          </div>
          
          {(headline || location || branche) && (
            <p className="text-sm text-muted-foreground truncate">
              {headline || [location, branche].filter(Boolean).join(' • ')}
            </p>
          )}

          <div className="flex gap-2 mt-3">
            <Button 
              size="sm" 
              variant="secondary"
              onClick={() => navigate(`/u/${id}`)}
            >
              Profil
            </Button>
            <Button 
              size="sm"
              onClick={() => navigate('/community/messages')}
            >
              Nachricht
            </Button>
          </div>
        </div>
      </div>
    </Card>
  );
}
