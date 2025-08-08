import * as React from "react";
import { cn } from "@/lib/utils";

export interface TokenChipProps extends React.HTMLAttributes<HTMLDivElement> {
  selected?: boolean;
}

export function TokenChip({ className, selected, ...props }: TokenChipProps) {
  return (
    <div
      className={cn(
        "inline-flex items-center rounded-full border bg-secondary text-secondary-foreground",
        "px-3 py-1 text-sm min-h-[32px] max-w-full",
        "hover:shadow-sm transition-shadow",
        selected && "ring-1 ring-ring",
        // Guardrails
        "whitespace-normal break-words hyphens-auto",
        className
      )}
      {...props}
    />
  );
}
