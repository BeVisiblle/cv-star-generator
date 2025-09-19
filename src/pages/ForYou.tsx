import React from 'react';
import { ForYouJobs } from '@/components/discover/ForYouJobs';

export default function ForYou() {
  return (
    <div className="max-w-4xl mx-auto p-6">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Für dich</h1>
        <p className="text-gray-600 mt-2">
          Personalisierte Jobempfehlungen basierend auf deinem Profil.
        </p>
      </div>
      
      <div className="text-center py-8">
        <p className="text-gray-600">
          Jobempfehlungen werden geladen, sobald die Datenbank konfiguriert ist.
        </p>
      </div>
    </div>
  );
}
