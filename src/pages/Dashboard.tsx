import React, { useLayoutEffect, useRef, useState } from 'react';
import CommunityFeed from '@/components/community/CommunityFeed';
import { ComposerTeaser } from '@/components/dashboard/ComposerTeaser';
import { LeftPanel } from '@/components/dashboard/LeftPanel';
import { RightPanel } from '@/components/dashboard/RightPanel';
import FeedSortBar from '@/components/community/FeedSortBar';
import { NAVBAR_HEIGHT, NAVBAR_HEIGHT_MOBILE } from '@/components/navigation/TopNavBar';

/** Globale Annahme: Navbar ist fixed top-0 mit Höhe 56px (Desktop) / 48px (Mobile) */
const getNavbarHeight = () => window.innerWidth < 768 ? NAVBAR_HEIGHT_MOBILE : NAVBAR_HEIGHT;

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
    <main className="w-full min-h-dvh bg-white pb-[56px] md:pb-0">
      <h1 className="sr-only">Dashboard</h1>
      
      {/* Inhalt direkt unter der Navbar */}
      <div className="pt-4 md:pt-6">
        <div className="mx-auto max-w-screen-2xl grid grid-cols-12 gap-3 sm:gap-4 lg:gap-6 px-3 sm:px-4 lg:px-6">
          
          {/* (1) Left Panel - sticky */}
          <aside
            className="hidden lg:block col-span-3"
            aria-label="Linke Spalte"
          >
            <div className="sticky top-14">
              <LeftPanel />
            </div>
          </aside>

          {/* Main - Center Column */}
          <section className="col-span-12 lg:col-span-9 xl:col-span-6 relative">
            
            {/* (2) Sticky: Composer + Feed Controls - kompakt */}
            <div
              ref={feedHeadRef}
              className="sticky z-40 bg-background/95 backdrop-blur-sm"
              style={{ top: `${getNavbarHeight() + 8}px` }}
            >
              <div className="px-3 py-3 space-y-2">
                <ComposerTeaser />
                <FeedSortBar />
              </div>
            </div>

            {/* (3) Post-Liste - kompakter Abstand */}
            <div className="mt-1.5 space-y-2 relative z-10" role="feed">
              <CommunityFeed feedHeadHeight={feedHeadH} />
            </div>
          </section>

          {/* (4) Right Panel - sticky */}
          <aside
            className="hidden xl:block col-span-3"
            aria-label="Rechte Spalte"
          >
            <div className="sticky top-14">
              <RightPanel />
            </div>
          </aside>
        </div>
      </div>
      
      {/* NewPostComposer is in AuthenticatedLayout - no need here */}
    </main>
  );
};

export default Dashboard;
