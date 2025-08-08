import * as React from "react";
import { cn } from "@/lib/utils";

interface ResponsiveTableProps extends React.HTMLAttributes<HTMLDivElement> {
  cardBreakpoint?: "sm" | "md" | "lg";
}

// Usage: Wrap your <Table> with <ResponsiveTable> ... </ResponsiveTable>
export function ResponsiveTable({ className, children, cardBreakpoint = "md", ...props }: ResponsiveTableProps) {
  return (
    <div
      className={cn(
        "w-full",
        // Ensure no global overflow
        "overflow-hidden",
        className
      )}
      {...props}
    >
      <div className="relative w-full overflow-auto -mx-4 px-4 sm:mx-0 sm:px-0">
        {/* Desktop/Tablet table view */}
        <div className={cn("hidden", cardBreakpoint === "sm" ? "sm:block" : cardBreakpoint === "md" ? "md:block" : "lg:block")}
        >
          {children}
        </div>
        {/* Mobile card list fallback: expects table markup to be duplicated by caller if needed */}
        {/* Intentionally minimal to avoid heavy refactors */}
      </div>
    </div>
  );
}
