import React from 'react';
import CommunityFeed from '@/components/community/CommunityFeed';
import { ComposerTeaser } from '@/components/dashboard/ComposerTeaser';
import { LeftPanel } from '@/components/dashboard/LeftPanel';
import { RightPanel } from '@/components/dashboard/RightPanel';

const Dashboard = () => {
  return (
    <main className="w-full">
      <h1 className="sr-only">Dashboard</h1>
      <div className="mx-auto max-w-screen-2xl px-3 sm:px-6 lg:px-8 py-6">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 lg:gap-6">
          {/* Left column */}
          <div className="hidden lg:block lg:col-span-3">
            <div className="sticky top-20 space-y-4">
              <LeftPanel />
            </div>
          </div>

          {/* Center column */}
          <section className="col-span-1 lg:col-span-6 space-y-4">
            <ComposerTeaser />
            <CommunityFeed />
          </section>

          {/* Right column */}
          <div className="hidden xl:block xl:col-span-3">
            <div className="sticky top-20 space-y-4">
              <RightPanel />
            </div>
          </div>
        </div>
      </div>
    </main>
  );
};

export default Dashboard;
