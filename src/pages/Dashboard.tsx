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
    <main className="w-full min-h-dvh bg-gray-50">
      <h1 className="sr-only">Dashboard</h1>
      
      {/* Inhalt unter der Navbar */}
      <div className="pt-16"> {/* 64px Offset für fixed Navbar */}
        <div className="mx-auto max-w-screen-2xl grid grid-cols-12 gap-4 px-3 sm:px-6 lg:px-8">
          
          {/* (1) Left Panel - sticky, nur scrollen wenn Content länger ist */}
          <aside
            className="hidden lg:block col-span-3"
            aria-label="Linke Spalte"
          >
            <div
              className="sticky"
              style={{ top: NAVBAR_H }}
            >
              <div
                className="max-h-[calc(100dvh-64px)] overflow-y-auto"
              >
                <LeftPanel />
              </div>
            </div>
          </aside>

          {/* Main - Center Column */}
          <section className="col-span-12 lg:col-span-9 xl:col-span-6 relative">
            
            {/* (2) Sticky: Composer + Feed Controls - bleibt fix unter Navbar */}
            <div
              ref={feedHeadRef}
              className="sticky z-40 bg-white/95 backdrop-blur supports-[backdrop-filter]:bg-white/60 border-b border-border/40 rounded-b-xl"
              style={{ top: NAVBAR_H }}
            >
              <div className="p-4">
                <ComposerTeaser />
                <div className="my-2">
                  <FeedSortBar />
                </div>
              </div>
            </div>

            {/* (3) Post-Liste - läuft hinter (2) durch, da (2) z-40 hat */}
            <div className="mt-4 space-y-4 relative z-10" role="feed">
              <CommunityFeed feedHeadHeight={feedHeadH} />
            </div>
          </section>

          {/* (4) Right Panel - sticky, nur scrollen wenn Content länger ist */}
          <aside
            className="hidden xl:block col-span-3"
            aria-label="Rechte Spalte"
          >
            <div className="sticky" style={{ top: NAVBAR_H }}>
              <div className="max-h-[calc(100dvh-64px)] overflow-y-auto">
                <RightPanel />
              </div>
            </div>
          </aside>
        </div>
      </div>
    </main>
  );
};

export default Dashboard;
