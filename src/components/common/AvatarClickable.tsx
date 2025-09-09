import React from 'react';
import { useNavigate } from 'react-router-dom';
import { cn } from '@/lib/utils';

interface AvatarClickableProps {
  profileId: string;
  profileType: 'user' | 'company';
  children: React.ReactNode;
  className?: string;
  ariaLabel?: string;
}

export function AvatarClickable({ 
  profileId, 
  profileType, 
  children, 
  className,
  ariaLabel 
}: AvatarClickableProps) {
  const navigate = useNavigate();

  const handleClick = () => {
    const profilePath = profileType === 'user' 
      ? `/profile/${profileId}` 
      : `/company/${profileId}`;
    
    navigate(profilePath);
  };

  const defaultAriaLabel = profileType === 'user' 
    ? `Profil von ${profileId} öffnen`
    : `Unternehmensprofil von ${profileId} öffnen`;

  return (
    <button
      onClick={handleClick}
      className={cn(
        "focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2 rounded-full transition-all hover:opacity-80",
        className
      )}
      aria-label={ariaLabel || defaultAriaLabel}
      role="link"
      tabIndex={0}
      onKeyDown={(e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
          handleClick();
        }
      }}
    >
      {children}
    </button>
  );
}
