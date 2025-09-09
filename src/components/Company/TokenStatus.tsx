import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { useCompany } from '@/hooks/useCompany';
import { TokenPurchase } from './TokenPurchase';
import { PlanUpgrade } from './PlanUpgrade';
import { Coins, Briefcase, AlertCircle } from 'lucide-react';

export function TokenStatus() {
  const { company } = useCompany();

  if (!company) return null;

  const activeTokens = company.active_tokens || 0;
  // The company object from the network request shows token_balance doesn't exist in the schema
  // Using only active_tokens which is available
  const totalTokens = activeTokens;


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
            <span className="text-sm">Aktive Tokens:</span>
            <Badge variant={activeTokens > 0 ? "default" : "destructive"}>
              {activeTokens}
            </Badge>
          </div>
          <div className="flex items-center gap-2">
            <Briefcase className="h-4 w-4 text-muted-foreground" />
            <span className="text-sm">Plan-Typ:</span>
            <Badge variant="outline">
              {company.plan_type || 'basis'}
            </Badge>
          </div>
        </div>

        <div className="text-sm text-muted-foreground">
          <span>Verfügbare Tokens: {totalTokens}</span>
        </div>

        {totalTokens <= 5 && (
          <div className="space-y-3">
            <div className="flex items-center gap-2 p-3 bg-destructive/10 border border-destructive/20 rounded-md">
              <AlertCircle className="h-4 w-4 text-destructive" />
              <div className="text-sm text-destructive">
                {totalTokens === 0 
                  ? 'Keine Tokens verfügbar. Bitte kaufen Sie Tokens oder upgraden Sie Ihren Plan.'
                  : `Wenige Tokens verfügbar (${totalTokens}). Erwägen Sie den Kauf weiterer Tokens.`
                }
              </div>
            </div>
            <div className="flex justify-end gap-2">
              <TokenPurchase />
              <PlanUpgrade />
            </div>
          </div>
        )}

        {totalTokens > 5 && (
          <div className="text-sm text-green-600">
            ✓ Sie haben ausreichend Tokens für weitere Aktivitäten.
          </div>
        )}
      </CardContent>
    </Card>
  );
}
