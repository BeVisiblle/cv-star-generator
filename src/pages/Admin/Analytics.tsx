import React from "react";
import { Skeleton } from "@/components/ui/skeleton";

export default function AnalyticsPage() {
  return (
    <div className="px-3 sm:px-6 py-6 max-w-[1200px] mx-auto">
      <h1 className="text-2xl font-semibold mb-4">Analytics</h1>
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {Array.from({ length: 4 }).map((_, i) => (
          <div key={i} className="rounded-2xl border bg-card shadow-sm p-4">
            <div className="h-6 w-40 bg-muted rounded mb-3" />
            <Skeleton className="h-48 rounded" />
          </div>
        ))}
      </div>
    </div>
  );
}
