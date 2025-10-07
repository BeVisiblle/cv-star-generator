import React, { useLayoutEffect, useRef, useState } from 'react';
import CommunityFeed from '@/components/community/CommunityFeed';
import FeedSortBar from '@/components/community/FeedSortBar';
import ComposerTeaser from '@/components/dashboard/ComposerTeaser';
import LeftPanel from '@/components/dashboard/LeftPanel';
import RightPanel from '@/components/dashboard/RightPanel';

export default function Community() {
  const [feedHeadH, setFeedHeadH] = useState(0);
  const headRef = useRef<HTMLDivElement>(null);

  useLayoutEffect(() => {
    if (!headRef.current) return;
    const obs = new ResizeObserver((entries) => {
      const h = entries[0]?.target.getBoundingClientRect().height ?? 0;
      setFeedHeadH(h);
    });
    obs.observe(headRef.current);
    return () => obs.disconnect();
  }, []);

  return (
    <main className="w-full overflow-x-hidden">
      <h1 className="sr-only">Community</h1>
      <div className="mx-auto max-w-screen-2xl px-3 sm:px-6 lg:px-8 py-6">
        <div className="flex gap-4 lg:gap-6">
          {/* Linke Spalte */}
          <aside className="hidden lg:block w-[280px] xl:w-[320px] shrink-0">
            <div className="sticky top-20 space-y-4">
              <LeftPanel />
            </div>
          </aside>

          {/* Mitte - Community Feed */}
          <section className="flex-1 min-w-0">
            <div className="w-full max-w-[560px] mx-auto px-4 md:max-w-none md:px-0 space-y-4">
              <div ref={headRef} className="sticky z-10 bg-background pb-2" style={{ top: '64px' }}>
                <ComposerTeaser />
                <div className="mt-2">
                  <FeedSortBar />
                </div>
              </div>
              <CommunityFeed feedHeadHeight={feedHeadH + 64} />
            </div>
          </section>

          {/* Rechte Spalte */}
          <aside className="hidden xl:block w-[320px] shrink-0">
            <div className="sticky top-20 space-y-4">
              <RightPanel />
            </div>
          </aside>
        </div>
      </div>
    </main>
  );
}
