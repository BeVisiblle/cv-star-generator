import React from 'react';
import { Badge } from '@/components/ui/badge';

interface ScoreBadgeProps {
  score: number;
  subs?: any;
  weights?: any;
  size?: 'sm' | 'md' | 'lg';
}

export function ScoreBadge({ score, size = 'md' }: ScoreBadgeProps) {
  const percentage = Math.round(score * 100);
  
  const getColor = (score: number) => {
    if (score >= 0.8) return 'bg-green-500';
    if (score >= 0.6) return 'bg-yellow-500';
    return 'bg-red-500';
  };

  const getSize = () => {
    switch (size) {
      case 'sm': return 'text-xs px-2 py-1';
      case 'lg': return 'text-sm px-3 py-2';
      default: return 'text-xs px-2 py-1';
    }
  };

  return (
    <Badge 
      className={`${getColor(score)} text-white ${getSize()}`}
      variant="secondary"
    >
      {percentage}% Match
    </Badge>
  );
}