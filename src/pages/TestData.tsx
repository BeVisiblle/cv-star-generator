import React from 'react';
import AdminTestDataInserter from '@/components/AdminTestDataInserter';

export default function TestDataPage() {
  return (
    <div className="min-h-screen bg-background p-8">
      <div className="container mx-auto">
        <div className="max-w-4xl mx-auto">
          <div className="mb-8">
            <h1 className="text-3xl font-bold mb-2">Test-Daten Verwaltung</h1>
            <p className="text-muted-foreground">
              Hier kannst du Test-Jobs und Test-Unternehmen für die Anwendung erstellen.
            </p>
          </div>
          
          <AdminTestDataInserter />
        </div>
      </div>
    </div>
  );
}
