import React, { useState } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { UserPlus, Check, Clock } from 'lucide-react';
import { useTranslation } from '@/lib/i18n';
import { AvatarClickable } from '../common/AvatarClickable';

interface PersonProfile {
  id: string;
  display_name: string;
  headline?: string;
  avatar_url?: string;
  verified?: boolean;
  follower_count?: number;
  is_following?: boolean;
  is_connected?: boolean;
  connection_status?: 'pending' | 'accepted' | 'rejected';
}

interface PersonMiniCardProps {
  person: PersonProfile;
  onConnect?: (personId: string) => void;
  onFollow?: (personId: string) => void;
}

export function PersonMiniCard({ person, onConnect, onFollow }: PersonMiniCardProps) {
  const { t } = useTranslation();
  const [isLoading, setIsLoading] = useState(false);
  const [actionState, setActionState] = useState<'idle' | 'pending' | 'connected' | 'following'>('idle');

  const handleConnect = async () => {
    if (isLoading) return;
    
    setIsLoading(true);
    setActionState('pending');
    
    try {
      await onConnect?.(person.id);
      setActionState('connected');
    } catch (error) {
      console.error('Error connecting:', error);
      setActionState('idle');
    } finally {
      setIsLoading(false);
    }
  };

  const handleFollow = async () => {
    if (isLoading) return;
    
    setIsLoading(true);
    setActionState('following');
    
    try {
      await onFollow?.(person.id);
    } catch (error) {
      console.error('Error following:', error);
      setActionState('idle');
    } finally {
      setIsLoading(false);
    }
  };

  const getButtonContent = () => {
    if (person.is_connected) {
      return (
        <>
          <Check className="h-3 w-3 mr-1" />
          {t('widgets.connected')}
        </>
      );
    }
    
    if (person.connection_status === 'pending') {
      return (
        <>
          <Clock className="h-3 w-3 mr-1" />
          {t('widgets.connection_pending')}
        </>
      );
    }
    
    return (
      <>
        <UserPlus className="h-3 w-3 mr-1" />
        {t('widgets.connect')}
      </>
    );
  };

  const getButtonVariant = () => {
    if (person.is_connected || person.connection_status === 'pending') {
      return 'secondary';
    }
    return 'default';
  };

  const isButtonDisabled = person.is_connected || person.connection_status === 'pending' || isLoading;

  return (
    <Card className="w-full hover:shadow-md transition-shadow">
      <CardContent className="p-4">
        <div className="flex items-start space-x-3">
          {/* Emoji + Avatar */}
          <div className="flex items-center space-x-2">
            <span className="text-2xl">🙂</span>
            <AvatarClickable
              profileId={person.id}
              profileType="user"
              className="h-10 w-10"
            >
              <Avatar className="h-10 w-10">
                <AvatarImage src={person.avatar_url} />
                <AvatarFallback>
                  {person.display_name.charAt(0).toUpperCase()}
                </AvatarFallback>
              </Avatar>
            </AvatarClickable>
          </div>

          {/* Content */}
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 mb-1">
              <h3 className="font-medium text-sm truncate">
                {person.display_name}
              </h3>
              {person.verified && (
                <Badge variant="secondary" className="text-xs">
                  ✓
                </Badge>
              )}
            </div>
            
            {person.headline && (
              <p className="text-xs text-muted-foreground truncate mb-2">
                {person.headline}
              </p>
            )}

            {person.follower_count && (
              <p className="text-xs text-muted-foreground">
                {person.follower_count} Follower
              </p>
            )}
          </div>

          {/* Action Button */}
          <div className="flex-shrink-0">
            <Button
              size="sm"
              variant={getButtonVariant()}
              onClick={handleConnect}
              disabled={isButtonDisabled}
              className="h-7 px-2 text-xs"
            >
              {getButtonContent()}
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
