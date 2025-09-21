import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

export default function DiscoverPeople() {
  return (
    <div className="min-h-screen bg-background p-6">
      <div className="max-w-7xl mx-auto">
        <Card>
          <CardHeader>
            <CardTitle>Discover People</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-muted-foreground">
              People discovery features will be available after the database migration is executed.
            </p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}