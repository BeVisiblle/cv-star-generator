import React from 'react';

export default function MobileContainer({ children }: { children: React.ReactNode }) {
  return (
    <div
      className="w-screen min-h-screen px-4 pb-[calc(env(safe-area-inset-bottom)+16px)] pt-[calc(env(safe-area-inset-top)+12px)] mx-auto max-w-[480px]"
      style={{
        fontSize: 'clamp(14px, 3.2vw, 16px)',
        lineHeight: 1.4,
      }}
    >
      {children}
    </div>
  );
}
