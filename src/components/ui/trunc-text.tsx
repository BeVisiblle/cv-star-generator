import * as React from "react";
import { cn } from "@/lib/utils";

interface TruncTextProps extends React.HTMLAttributes<HTMLSpanElement> {
  lines?: 1 | 2 | 3;
  text: string;
}

export function TruncText({ lines = 1, text, className, ...props }: TruncTextProps) {
  return (
    <span
      title={text}
      aria-label={text}
      className={cn(
        "block max-w-full",
        lines === 1 ? "line-clamp-1" : lines === 2 ? "line-clamp-2" : "line-clamp-3",
        className
      )}
      {...props}
    >
      {text}
    </span>
  );
}
