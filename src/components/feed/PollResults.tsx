import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { BarChart3, Users, Clock, CheckCircle2 } from 'lucide-react';
import { useTranslation } from '@/lib/i18n';
import { cn } from '@/lib/utils';

interface PollOption {
  id: string;
  option_text: string;
  votes: number;
  percentage: number;
}

interface PollResultsProps {
  question: string;
  options: PollOption[];
  totalVotes: number;
  userVote?: string[];
  isEnded: boolean;
  timeRemaining?: {
    days: number;
    hours: number;
    minutes: number;
    seconds: number;
  };
  className?: string;
}

export function PollResults({ 
  question, 
  options, 
  totalVotes, 
  userVote = [], 
  isEnded,
  timeRemaining,
  className 
}: PollResultsProps) {
  const { t } = useTranslation();

  const formatTimeRemaining = () => {
    if (!timeRemaining) return '';
    
    const { days, hours, minutes, seconds } = timeRemaining;
    
    if (days > 0) {
      return `${days}d ${hours}h ${minutes}m`;
    } else if (hours > 0) {
      return `${hours}h ${minutes}m`;
    } else if (minutes > 0) {
      return `${minutes}m ${seconds}s`;
    } else {
      return `${seconds}s`;
    }
  };

  const getWinningOption = () => {
    return options.reduce((max, option) => 
      option.votes > max.votes ? option : max
    );
  };

  const winningOption = getWinningOption();

  return (
    <Card className={cn("w-full", className)}>
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between">
          <div className="flex-1">
            <CardTitle className="text-lg mb-2">{question}</CardTitle>
            <div className="flex items-center gap-4 text-sm text-muted-foreground">
              <div className="flex items-center gap-1">
                {isEnded ? (
                  <CheckCircle2 className="h-4 w-4" />
                ) : (
                  <Clock className="h-4 w-4" />
                )}
                <span>
                  {isEnded ? 'Umfrage beendet' : `Noch ${formatTimeRemaining()}`}
                </span>
              </div>
              <div className="flex items-center gap-1">
                <Users className="h-4 w-4" />
                <span>{totalVotes} Stimmen</span>
              </div>
              <Badge variant="outline" className="text-xs">
                <BarChart3 className="h-3 w-3 mr-1" />
                Umfrage
              </Badge>
            </div>
          </div>
        </div>
      </CardHeader>

      <CardContent className="pt-0">
        <div className="space-y-4">
          {options.map((option, index) => {
            const isSelected = userVote.includes(option.id);
            const isWinner = option.id === winningOption.id;
            const rank = options
              .sort((a, b) => b.votes - a.votes)
              .findIndex(opt => opt.id === option.id) + 1;
            
            return (
              <div key={option.id} className="space-y-2">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-medium">
                      {option.option_text}
                    </span>
                    {isSelected && (
                      <CheckCircle2 className="h-4 w-4 text-green-500" />
                    )}
                    {isWinner && (
                      <Badge variant="default" className="text-xs">
                        #{rank}
                      </Badge>
                    )}
                  </div>
                  <div className="text-sm text-muted-foreground">
                    {option.votes} Stimmen ({option.percentage}%)
                  </div>
                </div>
                
                <div className="relative">
                  <Progress 
                    value={option.percentage} 
                    className="h-2"
                  />
                  <div 
                    className={cn(
                      "absolute inset-0 rounded-full transition-all duration-300",
                      isSelected 
                        ? "bg-green-500/20" 
                        : isWinner
                        ? "bg-blue-500/20"
                        : "bg-muted"
                    )}
                  />
                </div>
              </div>
            );
          })}
        </div>

        {/* Poll Statistics */}
        <div className="mt-6 pt-4 border-t">
          <div className="grid grid-cols-2 gap-4 text-sm">
            <div>
              <span className="text-muted-foreground">Teilnahme:</span>
              <span className="ml-2 font-medium">{totalVotes} Stimmen</span>
            </div>
            <div>
              <span className="text-muted-foreground">Gewinner:</span>
              <span className="ml-2 font-medium">{winningOption.option_text}</span>
            </div>
          </div>
        </div>

        {/* Poll Status */}
        <div className="mt-4 text-center">
          {isEnded ? (
            <Badge variant="destructive" className="text-xs">
              {t('feed.poll.ended')}
            </Badge>
          ) : userVote.length > 0 ? (
            <Badge variant="default" className="text-xs">
              {t('feed.poll.voted')}
            </Badge>
          ) : (
            <Badge variant="secondary" className="text-xs">
              Noch aktiv
            </Badge>
          )}
        </div>
      </CardContent>
    </Card>
  );
}

