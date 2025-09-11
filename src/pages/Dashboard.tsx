import React from 'react';
import CommunityFeed from '@/components/community/CommunityFeed';
import CommunityComposerTeaser from '@/components/community/CommunityComposerTeaser';
import { LeftPanel } from '@/components/dashboard/LeftPanel';
import FeedSortBar from '@/components/community/FeedSortBar';

const Dashboard = () => {
  return (
    <main className="w-full overflow-x-hidden">
      <h1 className="sr-only">Dashboard</h1>
      <div className="mx-auto max-w-screen-2xl px-3 sm:px-6 lg:px-8 py-6">
        <div className="flex gap-4 lg:gap-6">
          {/* Left column (fixed width) */}
          <aside className="hidden lg:block w-[280px] xl:w-[320px] shrink-0">
            <div className="sticky top-20 space-y-4">
              <LeftPanel />
            </div>
          </aside>

          {/* Center column (flex grows) */}
          <section className="flex-1 min-w-0">
            <div className="w-full max-w-[560px] mx-auto px-4 md:max-w-none md:px-0 space-y-4">
              <CommunityComposerTeaser onOpenComposer={() => {}} />
              <div className="my-2">
                <FeedSortBar />
              </div>
              <CommunityFeed />
            </div>
          </section>

          {/* Right column placeholder */}
          <aside className="hidden xl:block w-[320px] shrink-0">
            <div className="sticky top-20 space-y-4">
              {/* Placeholder for future widgets */}
            </div>
          </aside>
        </div>
      </div>
    </main>
  );
};

export default Dashboard;