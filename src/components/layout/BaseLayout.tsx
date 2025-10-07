import React from "react";
import { cn } from "@/lib/utils";

interface BaseLayoutProps {
  children: React.ReactNode;
  className?: string;
}

export const BaseLayout: React.FC<BaseLayoutProps> = ({ children, className }) => {
  return (
    <div className={cn(
      // Global guards
      "min-h-screen w-full overflow-x-hidden",
      className
    )}>
      <div
        className={cn(
          // Max readable width + horizontal padding
          "mx-auto max-w-[1200px] px-4 sm:px-6 lg:px-8",
          // Typography defaults
          "tracking-normal leading-relaxed text-[15px] md:text-base",
          // Prevent layout breaks
          "max-w-full break-words hyphens-auto",
          // Ensure children can shrink
          "min-w-0"
        )}
      >
        {children}
      </div>
    </div>
  );
};

export default BaseLayout;
