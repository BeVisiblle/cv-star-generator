import { ReactNode } from 'react';

interface OnboardingPopupProps {
  children: ReactNode;
}

export function OnboardingPopup({ children }: OnboardingPopupProps) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
      <div className="w-full max-w-2xl mx-4 bg-card border rounded-lg shadow-2xl">
        {children}
      </div>
    </div>
  );
}
