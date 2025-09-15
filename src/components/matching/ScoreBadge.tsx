import React from 'react';
import { Badge } from '@/components/ui/badge';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';

interface ScoreBadgeProps {
  score: number;
  subs?: Record<string, number>;
  weights?: Record<string, number>;
  className?: string;
}

export function ScoreBadge({ score, subs, weights, className = '' }: ScoreBadgeProps) {
  const getScoreColor = (score: number) => {
    if (score >= 80) return 'bg-green-100 text-green-800 border-green-200';
    if (score >= 60) return 'bg-blue-100 text-blue-800 border-blue-200';
    if (score >= 40) return 'bg-yellow-100 text-yellow-800 border-yellow-200';
    return 'bg-red-100 text-red-800 border-red-200';
  };

  const formatBreakdown = () => {
    if (!subs || !weights) return null;

    return Object.entries(subs).map(([key, value]) => (
      <div key={key} className="flex justify-between text-sm">
        <span className="capitalize">{key.replace(/_/g, ' ')}:</span>
        <span className="font-medium">{Math.round(value * 100)}%</span>
      </div>
    ));
  };

  const hasBreakdown = subs && weights && Object.keys(subs).length > 0;

  const badgeContent = (
    <Badge 
      variant="outline" 
      className={`${getScoreColor(score)} ${className}`}
      data-testid="score-badge"
    >
      {Math.round(score * 100)}% Match
    </Badge>
  );

  if (!hasBreakdown) {
    return badgeContent;
  }

  return (
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger asChild>
          {badgeContent}
        </TooltipTrigger>
        <TooltipContent className="max-w-xs">
          <div className="space-y-2">
            <div className="font-medium text-sm">Match-Breakdown:</div>
            <div className="space-y-1">
              {formatBreakdown()}
            </div>
            <div className="pt-2 border-t text-xs text-gray-500">
              Gewichtet: {Object.keys(weights || {}).length} Faktoren
            </div>
          </div>
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
}
