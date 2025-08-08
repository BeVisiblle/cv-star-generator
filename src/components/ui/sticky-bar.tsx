import * as React from "react";
import { cn } from "@/lib/utils";

interface StickyBarProps extends React.HTMLAttributes<HTMLDivElement> {
  left?: React.ReactNode;
  right?: React.ReactNode;
}

export function StickyBar({ className, left, right, children, ...props }: StickyBarProps) {
  return (
    <div
      className={cn(
        "sticky bottom-0 inset-x-0 z-40",
        "bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/70",
        "border-t border-border",
        "pt-2 pb-safe",
        className
      )}
      {...props}
    >
      <div className="mx-auto max-w-[1200px] px-4 sm:px-6 lg:px-8 flex items-center justify-between gap-3">
        {left}
        <div className="flex items-center gap-3 min-h-[44px]">{right ?? children}</div>
      </div>
    </div>
  );
}
