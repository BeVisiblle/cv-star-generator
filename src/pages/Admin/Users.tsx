import React from "react";
import { Skeleton } from "@/components/ui/skeleton";

export default function UsersPage() {
  return (
    <div className="px-3 sm:px-6 py-6 max-w-[1200px] mx-auto">
      <h1 className="text-2xl font-semibold mb-4">Users</h1>
      <div className="rounded-2xl border bg-card shadow-sm p-4">
        <div className="flex justify-between items-center mb-4">
          <div className="h-9 w-64 bg-muted rounded-md" />
          <div className="h-9 w-40 bg-muted rounded-md" />
        </div>
        {Array.from({ length: 6 }).map((_, i) => (
          <Skeleton key={i} className="h-10 rounded-md mb-2" />
        ))}
      </div>
    </div>
  );
}
