import React from "react";
import { Badge } from "@/components/ui/badge";

export type StageTab = { key: string; title: string; count: number };

interface StageTabsProps {
  stages: StageTab[];
  className?: string;
}

export const StageTabs: React.FC<StageTabsProps> = ({ stages, className }) => {
  return (
    <div className={`sticky top-[52px] z-30 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/80 border-b border-border ${className || ""}`}>
      <div className="mx-auto max-w-screen-2xl px-3 overflow-x-auto">
        <div className="flex items-center gap-2 min-w-max py-2">
          {stages.map((s) => (
            <div key={s.key} className="flex items-center gap-2 px-3 py-1.5 rounded-md border bg-muted/40">
              <span className="text-sm font-medium">{s.title}</span>
              <Badge variant="secondary" className="shrink-0">{s.count}</Badge>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
