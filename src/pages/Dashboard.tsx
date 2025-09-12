import React from 'react';
import CommunityFeed from '@/components/community/CommunityFeed';
import { ComposerTeaser } from '@/components/dashboard/ComposerTeaser';
import { LeftPanel } from '@/components/dashboard/LeftPanel';
import { RightPanel } from '@/components/dashboard/RightPanel';
import FeedSortBar from '@/components/community/FeedSortBar';

const Dashboard = () => {
  return (
    <main className="w-full overflow-x-hidden">
      <h1 className="sr-only">Dashboard</h1>
      <div className="mx-auto max-w-screen-2xl px-3 sm:px-6 lg:px-8 py-6">
        <div className="flex gap-4 lg:gap-6">
          {/* Left column - full height, all content visible */}
          <aside className="hidden lg:block w-[280px] xl:w-[320px] shrink-0">
            <div className="sticky top-20 space-y-4 max-h-[calc(100vh-5rem)] overflow-y-auto">
              <LeftPanel />
            </div>
          </aside>

          {/* Center column - composer fixed, feed scrollable */}
          <section className="flex-1 min-w-0">
            <div className="w-full max-w-[560px] mx-auto px-4 md:max-w-none md:px-0">
              {/* Composer completely static at top */}
              <div className="sticky top-20 z-20 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 border-b border-border/40 pb-4 mb-6">
                <ComposerTeaser />
                <div className="my-2">
                  <FeedSortBar />
                </div>
              </div>
              
              {/* Scrollable feed content with proper spacing */}
              <div className="space-y-4 pt-2">
                <CommunityFeed />
              </div>
            </div>
          </section>

          {/* Right column - full height, all content visible */}
          <aside className="hidden xl:block w-[320px] shrink-0">
            <div className="sticky top-20 space-y-4 max-h-[calc(100vh-5rem)] overflow-y-auto">
              <RightPanel />
            </div>
          </aside>
        </div>
      </div>
    </main>
  );
};

export default Dashboard;
