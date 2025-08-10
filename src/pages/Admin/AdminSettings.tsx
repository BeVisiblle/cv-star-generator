import React from "react";
import AdminAuthGate from "@/components/admin/AdminAuthGate";

export default function AdminSettings() {
  return (
    <AdminAuthGate requiredRole="SuperAdmin">
      <div className="py-8">
        <h1 className="text-2xl font-semibold mb-2">Admin Einstellungen</h1>
        <p className="text-muted-foreground">Bald verfügbar – Rollenverwaltung, Standard-SEO, Sitemap, u.v.m.</p>
      </div>
    </AdminAuthGate>
  );
}
