import React, { useState } from 'react';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { Checkbox } from '@/components/ui/checkbox';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Label } from '@/components/ui/label';
import { 
  Clock, 
  BarChart3, 
  Users, 
  CheckCircle2,
  AlertCircle
} from 'lucide-react';
import { useTranslation } from '@/lib/i18n';
import { usePoll } from '@/hooks/usePoll';
import { cn } from '@/lib/utils';

interface PollCardProps {
  pollId: string;
  postId: string;
  question: string;
  className?: string;
}

export function PollCard({ pollId, postId, question, className }: PollCardProps) {
  const { t } = useTranslation();
  const [selectedOptions, setSelectedOptions] = useState<string[]>([]);
  
  const {
    poll,
    isLoading,
    error,
    vote,
    currentVote,
    canSeeResults,
    isVoting,
    hasVoted
  } = usePoll({ pollId, postId });

  if (isLoading) {
    return (
      <Card className={cn("w-full", className)}>
        <CardContent className="p-6">
          <div className="animate-pulse space-y-4">
            <div className="h-4 bg-muted rounded w-3/4"></div>
            <div className="space-y-2">
              {[1, 2, 3].map((i) => (
                <div key={i} className="h-8 bg-muted rounded"></div>
              ))}
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (error || !poll) {
    return (
      <Card className={cn("w-full", className)}>
        <CardContent className="p-6">
          <div className="text-center text-muted-foreground">
            <AlertCircle className="h-8 w-8 mx-auto mb-2" />
            <p>Fehler beim Laden der Umfrage</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  const handleOptionSelect = (optionId: string, checked: boolean) => {
    if (poll.multiple_choice) {
      if (checked) {
        setSelectedOptions(prev => [...prev, optionId]);
      } else {
        setSelectedOptions(prev => prev.filter(id => id !== optionId));
      }
    } else {
      setSelectedOptions(checked ? [optionId] : []);
    }
  };

  const handleVote = () => {
    if (selectedOptions.length === 0) {
      return;
    }
    vote(selectedOptions);
  };

  const formatTimeRemaining = () => {
    if (!poll.time_remaining) return '';
    
    const { days, hours, minutes, seconds } = poll.time_remaining;
    
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

  const getPollStatus = () => {
    if (poll.is_ended) {
      return {
        text: 'Umfrage beendet',
        variant: 'destructive' as const,
        icon: CheckCircle2
      };
    }
    
    if (hasVoted) {
      return {
        text: 'Du hast abgestimmt',
        variant: 'default' as const,
        icon: CheckCircle2
      };
    }
    
    return {
      text: `Noch ${formatTimeRemaining()}`,
      variant: 'secondary' as const,
      icon: Clock
    };
  };

  const status = getPollStatus();
  const StatusIcon = status.icon;

  return (
    <Card className={cn("w-full", className)}>
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between">
          <div className="flex-1">
            <h3 className="font-semibold text-lg mb-2">{poll.question}</h3>
            <div className="flex items-center gap-4 text-sm text-muted-foreground">
              <div className="flex items-center gap-1">
                <StatusIcon className="h-4 w-4" />
                <span>{status.text}</span>
              </div>
              <div className="flex items-center gap-1">
                <Users className="h-4 w-4" />
                <span>{poll.total_votes} Stimmen</span>
              </div>
              {poll.multiple_choice && (
                <Badge variant="outline" className="text-xs">
                  Mehrfachauswahl
                </Badge>
              )}
            </div>
          </div>
        </div>
      </CardHeader>

      <CardContent className="pt-0">
        {!poll.is_ended && !hasVoted ? (
          <div className="space-y-4">
            {poll.multiple_choice ? (
              <div className="space-y-3">
                {poll.options.map((option) => (
                  <div key={option.id} className="flex items-center space-x-3">
                    <Checkbox
                      id={option.id}
                      checked={selectedOptions.includes(option.id)}
                      onCheckedChange={(checked) => 
                        handleOptionSelect(option.id, checked as boolean)
                      }
                      disabled={isVoting}
                    />
                    <Label 
                      htmlFor={option.id}
                      className="flex-1 text-sm cursor-pointer"
                    >
                      {option.option_text}
                    </Label>
                  </div>
                ))}
              </div>
            ) : (
              <RadioGroup
                value={selectedOptions[0] || ''}
                onValueChange={(value) => setSelectedOptions(value ? [value] : [])}
                disabled={isVoting}
              >
                {poll.options.map((option) => (
                  <div key={option.id} className="flex items-center space-x-3">
                    <RadioGroupItem value={option.id} id={option.id} />
                    <Label 
                      htmlFor={option.id}
                      className="flex-1 text-sm cursor-pointer"
                    >
                      {option.option_text}
                    </Label>
                  </div>
                ))}
              </RadioGroup>
            )}

            <Button
              onClick={handleVote}
              disabled={selectedOptions.length === 0 || isVoting}
              className="w-full"
            >
              {isVoting ? 'Abstimmen...' : t('feed.poll.vote')}
            </Button>
          </div>
        ) : (
          <div className="space-y-4">
            {poll.options.map((option) => {
              const isSelected = currentVote.includes(option.id);
              const percentage = option.percentage || 0;
              
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
                    </div>
                    <div className="text-sm text-muted-foreground">
                      {option.votes} Stimmen ({percentage}%)
                    </div>
                  </div>
                  
                  <div className="relative">
                    <Progress 
                      value={percentage} 
                      className="h-2"
                    />
                    <div 
                      className={cn(
                        "absolute inset-0 rounded-full transition-all duration-300",
                        isSelected 
                          ? "bg-green-500/20" 
                          : "bg-muted"
                      )}
                    />
                  </div>
                </div>
              );
            })}

            {poll.is_ended && (
              <div className="text-center pt-2">
                <Badge variant="destructive" className="text-xs">
                  {t('feed.poll.ended')}
                </Badge>
              </div>
            )}

            {hasVoted && !poll.is_ended && (
              <div className="text-center pt-2">
                <Badge variant="default" className="text-xs">
                  {t('feed.poll.voted')}
                </Badge>
              </div>
            )}
          </div>
        )}

        {/* Poll Settings Info */}
        <div className="mt-4 pt-4 border-t text-xs text-muted-foreground">
          <div className="flex items-center justify-between">
            <span>
              {poll.show_results_after_vote 
                ? 'Ergebnisse werden nach der Abstimmung angezeigt'
                : 'Ergebnisse sind öffentlich sichtbar'
              }
            </span>
            <div className="flex items-center gap-1">
              <BarChart3 className="h-3 w-3" />
              <span>Umfrage</span>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

