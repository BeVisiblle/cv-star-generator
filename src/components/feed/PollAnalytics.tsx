import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { 
  BarChart3, 
  Users, 
  Clock, 
  TrendingUp,
  Download,
  Share2
} from 'lucide-react';
import { useTranslation } from '@/lib/i18n';
import { usePollManagement } from '@/hooks/usePollManagement';

interface PollAnalyticsProps {
  pollId: string;
  postId: string;
  question: string;
  totalVotes: number;
  isEnded: boolean;
  timeRemaining?: {
    days: number;
    hours: number;
    minutes: number;
    seconds: number;
  };
  className?: string;
}

export function PollAnalytics({ 
  pollId, 
  postId, 
  question, 
  totalVotes, 
  isEnded,
  timeRemaining,
  className 
}: PollAnalyticsProps) {
  const { t } = useTranslation();
  const {
    endPoll,
    deletePoll,
    extendPoll,
    isEnding,
    isDeleting,
    isExtending
  } = usePollManagement({ pollId, postId });

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

  const handleEndPoll = () => {
    if (confirm('Möchtest du die Umfrage wirklich beenden?')) {
      endPoll();
    }
  };

  const handleDeletePoll = () => {
    if (confirm('Möchtest du die Umfrage wirklich löschen? Diese Aktion kann nicht rückgängig gemacht werden.')) {
      deletePoll();
    }
  };

  const handleExtendPoll = (hours: number) => {
    extendPoll(hours);
  };

  const handleExportResults = () => {
    // TODO: Implement CSV export
    console.log('Export poll results to CSV');
  };

  const handleSharePoll = () => {
    // TODO: Implement poll sharing
    console.log('Share poll');
  };

  return (
    <Card className={className}>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <BarChart3 className="h-5 w-5" />
          Umfrage-Analytics
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Poll Status */}
        <div className="flex items-center justify-between">
          <div>
            <h3 className="font-medium text-sm">{question}</h3>
            <p className="text-xs text-muted-foreground">
              {isEnded ? 'Beendet' : `Noch ${formatTimeRemaining()}`}
            </p>
          </div>
          <Badge variant={isEnded ? 'destructive' : 'default'}>
            {isEnded ? 'Beendet' : 'Aktiv'}
          </Badge>
        </div>

        {/* Statistics */}
        <div className="grid grid-cols-2 gap-4">
          <div className="text-center p-3 bg-muted rounded-lg">
            <Users className="h-6 w-6 mx-auto mb-1 text-muted-foreground" />
            <div className="text-lg font-semibold">{totalVotes}</div>
            <div className="text-xs text-muted-foreground">Stimmen</div>
          </div>
          <div className="text-center p-3 bg-muted rounded-lg">
            <TrendingUp className="h-6 w-6 mx-auto mb-1 text-muted-foreground" />
            <div className="text-lg font-semibold">
              {isEnded ? '100%' : 'Live'}
            </div>
            <div className="text-xs text-muted-foreground">Status</div>
          </div>
        </div>

        {/* Actions */}
        <div className="space-y-2">
          <div className="flex gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={handleExportResults}
              className="flex-1"
            >
              <Download className="h-4 w-4 mr-1" />
              Export
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={handleSharePoll}
              className="flex-1"
            >
              <Share2 className="h-4 w-4 mr-1" />
              Teilen
            </Button>
          </div>

          {!isEnded && (
            <div className="flex gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={handleEndPoll}
                disabled={isEnding}
                className="flex-1"
              >
                <Clock className="h-4 w-4 mr-1" />
                Beenden
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => handleExtendPoll(24)}
                disabled={isExtending}
                className="flex-1"
              >
                +24h
              </Button>
            </div>
          )}

          <Button
            variant="destructive"
            size="sm"
            onClick={handleDeletePoll}
            disabled={isDeleting}
            className="w-full"
          >
            {isDeleting ? 'Lösche...' : 'Löschen'}
          </Button>
        </div>

        {/* Poll Info */}
        <div className="text-xs text-muted-foreground pt-2 border-t">
          <div className="flex justify-between">
            <span>Poll ID:</span>
            <span className="font-mono">{pollId.slice(0, 8)}...</span>
          </div>
          <div className="flex justify-between">
            <span>Post ID:</span>
            <span className="font-mono">{postId.slice(0, 8)}...</span>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

