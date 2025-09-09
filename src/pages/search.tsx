import React from 'react';
import { SearchResults } from '@/components/search/SearchResults';
import { RightRail } from '@/components/sidebars/RightRail';

export default function SearchPage() {
  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          {/* Main Content */}
          <main className="lg:col-span-8">
            <SearchResults />
          </main>
          
          {/* Right Rail */}
          <aside className="lg:col-span-4">
            <RightRail />
          </aside>
        </div>
      </div>
    </div>
  );
}
