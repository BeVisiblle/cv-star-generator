// Temporary fix for CV Generator loading issues
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { AlertCircle, RefreshCw } from 'lucide-react';

export const CVGeneratorErrorFallback = ({ error, onRetry }: { error?: Error; onRetry?: () => void }) => {
  return (
    <div className="min-h-screen flex items-center justify-center p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <AlertCircle className="h-12 w-12 text-orange-500 mx-auto mb-4" />
          <CardTitle>CV Generator lädt...</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <p className="text-sm text-muted-foreground text-center">
            Der CV Generator wird geladen. Falls er nicht lädt, liegt möglicherweise ein Verbindungsproblem vor.
          </p>
          
          <div className="space-y-2">
            <Button 
              onClick={() => window.location.reload()} 
              className="w-full"
              variant="outline"
            >
              <RefreshCw className="h-4 w-4 mr-2" />
              Seite neu laden
            </Button>
            
            <Button 
              onClick={() => window.location.href = '/auth'} 
              className="w-full"
            >
              Zur Anmeldung
            </Button>
          </div>
          
          <div className="text-xs text-muted-foreground text-center">
            <p>Falls das Problem weiterhin besteht:</p>
            <p>1. Prüfen Sie Ihre Internetverbindung</p>
            <p>2. Löschen Sie Browser-Cache</p>
            <p>3. Versuchen Sie einen anderen Browser</p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
