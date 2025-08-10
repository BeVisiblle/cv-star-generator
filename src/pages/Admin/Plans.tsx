import React from "react";

export default function PlansPage() {
  return (
    <div className="px-3 sm:px-6 py-6 max-w-[1200px] mx-auto">
      <h1 className="text-2xl font-semibold mb-4">Plans & Seats</h1>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {Array.from({ length: 3 }).map((_, i) => (
          <div key={i} className="rounded-2xl border bg-card shadow-sm p-6">
            <div className="h-6 w-32 bg-muted rounded mb-3" />
            <div className="h-10 w-24 bg-muted rounded" />
          </div>
        ))}
      </div>
    </div>
  );
}
