import React from 'react';
import CommunityFeed from '@/components/community/CommunityFeed';
import { ComposerTeaser } from '@/components/dashboard/ComposerTeaser';
import { LeftPanel } from '@/components/dashboard/LeftPanel';
import { RightPanel } from '@/components/dashboard/RightPanel';
import FeedSortBar from '@/components/community/FeedSortBar';

const Dashboard = () => {
  return (
    <main className="w-full h-screen overflow-hidden">
      <h1 className="sr-only">Dashboard</h1>
      <div className="mx-auto max-w-screen-2xl px-3 sm:px-6 lg:px-8 py-2 h-full flex flex-col">
        <div className="flex gap-4 lg:gap-6 flex-1">
          {/* Left column - sticky, with internal scroll if content overflows */}
          <aside className="hidden lg:block w-[280px] xl:w-[320px] shrink-0 sticky top-16 self-start">
            <div className="space-y-4 max-h-[calc(100vh-4rem)] overflow-y-auto">
              <LeftPanel />
            </div>
          </aside>

          {/* Center column (flex grows) - this is the main scrollable area */}
          <section className="flex-1 min-w-0 flex flex-col">
            {/* Fixed composer at top - completely static */}
            <div className="sticky top-16 z-20 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 border-b border-border/40 pb-4 mb-4">
              <ComposerTeaser />
              <div className="my-2">
                <FeedSortBar />
              </div>
            </div>
            
            {/* Scrollable feed content only */}
            <div className="flex-1 space-y-4 overflow-y-auto">
              <CommunityFeed />
            </div>
          </section>

          {/* Right column - sticky, with internal scroll if content overflows */}
          <aside className="hidden lg:block w-[320px] shrink-0 sticky top-16 self-start">
            <div className="space-y-4 max-h-[calc(100vh-4rem)] overflow-y-auto">
              <RightPanel />
            </div>
          </aside>
        </div>
      </div>
    </main>
  );
};

export default Dashboard;
