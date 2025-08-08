import * as React from "react";
import { cn } from "@/lib/utils";

interface KeyValueRowProps {
  label: React.ReactNode;
  value: React.ReactNode;
  className?: string;
}

export function KeyValueRow({ label, value, className }: KeyValueRowProps) {
  return (
    <div className={cn("grid grid-cols-1 md:grid-cols-2 gap-2 md:gap-4 items-start", className)}>
      <div className="text-sm text-muted-foreground min-w-0 break-words hyphens-auto">{label}</div>
      <div className="min-w-0 break-words hyphens-auto">{value}</div>
    </div>
  );
}
