import React, { useLayoutEffect, useRef, useState } from 'react';
import CommunityFeed from '@/components/community/CommunityFeed';
import { ComposerTeaser } from '@/components/dashboard/ComposerTeaser';
import { LeftPanel } from '@/components/dashboard/LeftPanel';
import { RightPanel } from '@/components/dashboard/RightPanel';
import FeedSortBar from '@/components/community/FeedSortBar';

/** Globale Annahme: Navbar ist fixed top-0 mit Höhe 64px */
const NAVBAR_H = 64; // px

const Dashboard = () => {
  // Höhe der sticky Feed-Header-Sektion (2) messen
  const feedHeadRef = useRef<HTMLDivElement | null>(null);
  const [feedHeadH, setFeedHeadH] = useState(0);

  useLayoutEffect(() => {
    if (!feedHeadRef.current) return;
    const el = feedHeadRef.current;
    const ro = new ResizeObserver(() => {
      setFeedHeadH(el.getBoundingClientRect().height);
    });
    ro.observe(el);
    // Initial
    setFeedHeadH(el.getBoundingClientRect().height);
    return () => ro.disconnect();
  }, []);

  return (
    <main className="w-full min-h-dvh bg-white">
      <h1 className="sr-only">Dashboard</h1>
      
      {/* Inhalt direkt unter der Navbar */}
      <div className="pt-16">
        <div className="mx-auto max-w-screen-2xl grid grid-cols-12 gap-4 px-3 sm:px-6 lg:px-8">
          
          {/* (1) Left Panel - normaler Flow, keine eigene Scrollbar */}
          <aside
            className="hidden lg:block col-span-3"
            aria-label="Linke Spalte"
          >
            <LeftPanel />
          </aside>

          {/* Main - Center Column */}
          <section className="col-span-12 lg:col-span-9 xl:col-span-6 relative">
            
            {/* (2) Sticky: Composer + Feed Controls - kompakter ohne Border */}
            <div
              ref={feedHeadRef}
              className="sticky z-40 bg-white shadow-sm"
              style={{ top: NAVBAR_H }}
            >
              <div className="px-2 md:px-3 py-2 pb-4 space-y-2">
                <ComposerTeaser />
                <FeedSortBar />
              </div>
            </div>

            {/* (3) Post-Liste - kompakterer Abstand */}
            <div className="mt-6 md:mt-8 space-y-2 md:space-y-3 relative z-10" role="feed">
              <CommunityFeed feedHeadHeight={feedHeadH} />
            </div>
          </section>

          {/* (4) Right Panel - normaler Flow, keine eigene Scrollbar */}
          <aside
            className="hidden xl:block col-span-3"
            aria-label="Rechte Spalte"
          >
            <RightPanel />
          </aside>
        </div>
      </div>
      
      {/* NewPostComposer is in AuthenticatedLayout - no need here */}
    </main>
  );
};

export default Dashboard;
