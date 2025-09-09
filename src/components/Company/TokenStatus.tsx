import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { useJobPostingLimits } from '@/hooks/useJobPostingLimits';
import { TokenPurchase } from './TokenPurchase';
import { PlanUpgrade } from './PlanUpgrade';
import { Coins, Briefcase, AlertCircle } from 'lucide-react';

export function TokenStatus() {
  const { 
    remainingTokens, 
    remainingJobPosts, 
    tokensPerPost, 
    canPost,
    isLoading 
  } = useJobPostingLimits();

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Token-Status</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="animate-pulse space-y-2">
            <div className="h-4 bg-muted rounded w-3/4"></div>
            <div className="h-4 bg-muted rounded w-1/2"></div>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-lg flex items-center gap-2">
          <Coins className="h-5 w-5" />
          Token-Status
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid grid-cols-2 gap-4">
          <div className="flex items-center gap-2">
            <Coins className="h-4 w-4 text-muted-foreground" />
            <span className="text-sm">Verbleibende Tokens:</span>
            <Badge variant={remainingTokens > 0 ? "default" : "destructive"}>
              {remainingTokens}
            </Badge>
          </div>
          <div className="flex items-center gap-2">
            <Briefcase className="h-4 w-4 text-muted-foreground" />
            <span className="text-sm">Verbleibende Job-Posts:</span>
            <Badge variant={remainingJobPosts > 0 ? "default" : "destructive"}>
              {remainingJobPosts}
            </Badge>
          </div>
        </div>

        <div className="text-sm text-muted-foreground">
          <span>Tokens pro Job-Post: {tokensPerPost}</span>
        </div>

        {!canPost && (
          <div className="space-y-3">
            <div className="flex items-center gap-2 p-3 bg-destructive/10 border border-destructive/20 rounded-md">
              <AlertCircle className="h-4 w-4 text-destructive" />
              <div className="text-sm text-destructive">
                {remainingTokens < tokensPerPost 
                  ? 'Nicht genügend Tokens verfügbar. Bitte kaufen Sie mehr Tokens.'
                  : 'Job-Posting-Limit erreicht. Bitte upgraden Sie Ihren Plan.'
                }
              </div>
            </div>
            <div className="flex justify-end gap-2">
              {remainingTokens < tokensPerPost && <TokenPurchase />}
              {remainingJobPosts <= 0 && <PlanUpgrade />}
            </div>
          </div>
        )}

        {canPost && (
          <div className="text-sm text-green-600">
            ✓ Sie können {Math.min(remainingJobPosts, Math.floor(remainingTokens / tokensPerPost))} weitere Job-Posts veröffentlichen.
          </div>
        )}
      </CardContent>
    </Card>
  );
}
