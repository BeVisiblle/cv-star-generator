import { ReactNode } from 'react';

interface OnboardingPopupProps {
  children: ReactNode;
}

export function OnboardingPopup({ children }: OnboardingPopupProps) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-md">
      <div className="w-full max-w-2xl mx-6 bg-card border border-border/60 rounded-3xl shadow-soft-xl">
        {children}
      </div>
    </div>
  );
}
