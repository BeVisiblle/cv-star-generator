'use client';
import React, { useState, useEffect } from 'react';
import { TrendingHashtags } from './TrendingHashtags';
import { RecommendedGroups } from './RecommendedGroups';
import { cn } from '@/lib/utils';

interface RightRailProps {
  className?: string;
  sticky?: boolean;
}

export function RightRail({ className, sticky = true }: RightRailProps) {
  const [isSticky, setIsSticky] = useState(false);

  useEffect(() => {
    if (!sticky) return;

    const handleScroll = () => {
      const scrollTop = window.scrollY;
      const threshold = 100; // Start sticking after 100px scroll
      setIsSticky(scrollTop > threshold);
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, [sticky]);

  return (
    <aside 
      className={cn(
        'w-full space-y-6',
        sticky && isSticky && 'sticky top-4',
        className
      )}
    >
      {/* Trending Hashtags */}
      <TrendingHashtags limit={8} />
      
      {/* Recommended Groups */}
      <RecommendedGroups limit={4} />
      
      {/* Additional widgets can be added here */}
      <div className="text-center text-xs text-muted-foreground py-4">
        <p>Weitere Empfehlungen folgen...</p>
      </div>
    </aside>
  );
}
