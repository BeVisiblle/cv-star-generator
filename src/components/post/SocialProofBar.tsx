import React from 'react';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';

interface SocialProofBarProps {
  socialProof: {
    actor_id: string;
    action: string;
    actor?: {
      id: string;
      vorname?: string;
      nachname?: string;
      avatar_url?: string;
    };
  };
}

export function SocialProofBar({ socialProof }: SocialProofBarProps) {
  const getDisplayName = () => {
    if (socialProof.actor?.vorname && socialProof.actor?.nachname) {
      return `${socialProof.actor.vorname} ${socialProof.actor.nachname}`;
    }
    return 'Ein Kontakt';
  };

  const getInitials = () => {
    if (socialProof.actor?.vorname && socialProof.actor?.nachname) {
      return `${socialProof.actor.vorname[0]}${socialProof.actor.nachname[0]}`;
    }
    return 'K';
  };

  const getActionText = () => {
    switch (socialProof.action) {
      case 'like':
        return 'gefällt das';
      case 'comment':
        return 'hat kommentiert';
      default:
        return 'hat interagiert';
    }
  };

  return (
    <div className="px-4 py-2 border-b border-border/50">
      <Button 
        variant="ghost" 
        className="h-auto p-0 w-full justify-start text-xs text-muted-foreground hover:text-foreground"
      >
        <div className="flex items-center gap-2">
          <Avatar className="h-4 w-4">
            <AvatarImage src={socialProof.actor?.avatar_url} alt={getDisplayName()} />
            <AvatarFallback className="text-[8px]">{getInitials()}</AvatarFallback>
          </Avatar>
          <span>{getDisplayName()} {getActionText()}</span>
        </div>
      </Button>
    </div>
  );
}