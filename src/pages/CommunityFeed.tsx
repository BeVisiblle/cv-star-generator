import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Users, MessageSquare, Building } from 'lucide-react';

export function CommunityFeed() {
  return (
    <div className="max-w-4xl mx-auto p-6 space-y-6">
      <Card>
        <CardContent className="text-center py-12">
          <div className="flex justify-center mb-4">
            <div className="p-3 rounded-full bg-muted">
              <MessageSquare className="h-8 w-8 text-muted-foreground" />
            </div>
          </div>
          <h2 className="text-xl font-semibold mb-2">Community Feed</h2>
          <p className="text-muted-foreground mb-6">
            Verbinde dich mit anderen Fachkräften und Unternehmen in deiner Branche.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button className="flex items-center gap-2">
              <Users className="h-4 w-4" />
              Personen entdecken
            </Button>
            <Button variant="outline" className="flex items-center gap-2">
              <Building className="h-4 w-4" />
              Unternehmen folgen
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}