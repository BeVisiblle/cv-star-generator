import React from "react";
import AdminAuthGate from "@/components/admin/AdminAuthGate";

export default function SupportPage() {
  return (
    <AdminAuthGate>
      <div className="px-3 sm:px-6 py-6 max-w-[1200px] mx-auto">
        <h1 className="text-2xl font-semibold mb-4">Support</h1>
        <div className="rounded-2xl border bg-card shadow-sm p-6">
          <p className="text-muted-foreground">Coming soon — support inbox, ticket search, and quick actions.</p>
        </div>
      </div>
    </AdminAuthGate>
  );
}
