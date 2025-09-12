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
          {/* Left column (fixed width) - scrolls until content is fully visible, then becomes sticky */}
          <aside className="hidden lg:block w-[280px] xl:w-[320px] shrink-0">
            <div className="sticky top-20 space-y-4" style={{ maxHeight: 'calc(100vh - 80px)', overflowY: 'auto' }}>
              <LeftPanel />
            </div>
          </aside>

          {/* Center column (flex grows) */}
          <section className="flex-1 min-w-0">
            <div className="w-full max-w-[560px] mx-auto px-4 md:max-w-none md:px-0 space-y-4">
              {/* Fixed composer at top */}
              <div className="sticky top-20 z-10 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 pb-4">
                <ComposerTeaser />
                <div className="my-2">
                  <FeedSortBar />
                </div>
              </div>
              
              {/* Scrollable content */}
              <div className="space-y-4">
                <CommunityFeed />
              </div>
            </div>
          </section>

          {/* Right column (fixed width) - scrolls until content is fully visible, then becomes sticky */}
          <aside className="hidden xl:block w-[320px] shrink-0">
            <div className="sticky top-20 space-y-4" style={{ maxHeight: 'calc(100vh - 80px)', overflowY: 'auto' }}>
              <RightPanel />
            </div>
          </aside>
        </div>
      </div>
    </main>
  );
};

export default Dashboard;
