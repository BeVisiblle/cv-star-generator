import React, { useState } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { UserPlus, Check, Clock } from 'lucide-react';
import { useTranslation } from '@/lib/i18n';
import { AvatarClickable } from '../common/AvatarClickable';

interface CompanyProfile {
  id: string;
  display_name: string;
  headline?: string;
  avatar_url?: string;
  verified?: boolean;
  follower_count?: number;
  is_following?: boolean;
}

interface CompanyMiniCardProps {
  company: CompanyProfile;
  onFollow?: (companyId: string) => void;
}

export function CompanyMiniCard({ company, onFollow }: CompanyMiniCardProps) {
  const { t } = useTranslation();
  const [isLoading, setIsLoading] = useState(false);
  const [actionState, setActionState] = useState<'idle' | 'following'>('idle');

  const handleFollow = async () => {
    if (isLoading) return;
    
    setIsLoading(true);
    setActionState('following');
    
    try {
      await onFollow?.(company.id);
    } catch (error) {
      console.error('Error following:', error);
      setActionState('idle');
    } finally {
      setIsLoading(false);
    }
  };

  const getButtonContent = () => {
    if (company.is_following) {
      return (
        <>
          <Check className="h-3 w-3 mr-1" />
          {t('widgets.following')}
        </>
      );
    }
    
    return (
      <>
        <UserPlus className="h-3 w-3 mr-1" />
        {t('widgets.follow')}
      </>
    );
  };

  const getButtonVariant = () => {
    if (company.is_following) {
      return 'secondary';
    }
    return 'default';
  };

  const isButtonDisabled = company.is_following || isLoading;

  return (
    <Card className="w-full hover:shadow-md transition-shadow">
      <CardContent className="p-3">
        <div className="flex items-center space-x-3">
          {/* Avatar */}
          <AvatarClickable
            profileId={company.id}
            profileType="company"
            className="h-10 w-10"
          >
            <Avatar className="h-10 w-10">
              <AvatarImage src={company.avatar_url} />
              <AvatarFallback>
                {company.display_name.charAt(0).toUpperCase()}
              </AvatarFallback>
            </Avatar>
          </AvatarClickable>

          {/* Content */}
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2">
              <h3 className="font-medium text-sm truncate">
                {company.display_name}
              </h3>
              {company.verified && (
                <Badge variant="secondary" className="text-xs px-1 py-0">
                  ✓
                </Badge>
              )}
            </div>
            
            {company.headline && (
              <p className="text-xs text-muted-foreground truncate">
                {company.headline}
              </p>
            )}

            {company.follower_count && (
              <p className="text-xs text-muted-foreground">
                {company.follower_count} Follower
              </p>
            )}
          </div>

          {/* Action Button */}
          <div className="flex-shrink-0">
            <Button
              size="sm"
              variant={getButtonVariant()}
              onClick={handleFollow}
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
