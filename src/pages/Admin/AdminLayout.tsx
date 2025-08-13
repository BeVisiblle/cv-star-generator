import React, { useEffect, useMemo, useState } from "react";
import { Outlet, Link, Navigate, useLocation } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";
import { cn } from "@/lib/utils";
import BaseLayout from "@/components/layout/BaseLayout";
import { Button } from "@/components/ui/button";
import { SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar";
import { AdminSidebar } from "@/components/admin/AdminSidebar";
import { Bell, Search } from "lucide-react";

const NavLink = ({ to, label }: { to: string; label: string }) => {
  const location = useLocation();
  const active = useMemo(() => location.pathname.startsWith(to), [location.pathname, to]);
  return (
    <Link
      to={to}
      className={cn(
        "px-3 py-2 rounded-md text-sm font-medium transition-colors",
        active ? "bg-primary/10 text-primary" : "text-muted-foreground hover:text-foreground"
      )}
    >
      {label}
    </Link>
  );
};

export default function AdminLayout() {
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [allowed, setAllowed] = useState(false);

  useEffect(() => {
    let mounted = true;
    async function checkRole() {
      if (!user) {
        setLoading(false);
        return;
      }
      const { data, error } = await supabase
        .from("user_roles")
        .select("role")
        .eq("user_id", user.id);
      if (mounted) {
        if (error) console.warn("user_roles fetch error", error);
        const roles = ((data as { role: string }[]) || []).map((r) => String(r.role).toLowerCase());
        const allowedRoles = new Set(["admin", "superadmin", "editor", "contenteditor", "support", "supportagent", "companyadmin"]);
        const isAllowed = roles.some((r) => allowedRoles.has(r));
        setAllowed(isAllowed);
        setLoading(false);
      }
    }
    checkRole();
    return () => {
      mounted = false;
    };
  }, [user]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="h-12 w-12 rounded-full border-2 border-primary border-t-transparent animate-spin" />
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/auth" replace />;
  }

  if (!allowed) {
    return (
      <BaseLayout>
        <div className="py-12">
          <h1 className="text-2xl font-semibold text-foreground mb-4">403 – Kein Zugriff</h1>
          <p className="text-muted-foreground mb-6">Dieser Bereich ist nur für Admins/Editoren.</p>
          <div className="flex gap-3">
            <Button asChild>
              <Link to="/">Zur Startseite</Link>
            </Button>
            <Button asChild variant="outline">
              <Link to="/bootstrap/create-admin">SuperAdmin anlegen</Link>
            </Button>
          </div>
        </div>
      </BaseLayout>
    );
  }

  return (
    <SidebarProvider>
      <div className="min-h-screen bg-background text-foreground w-full flex flex-col">
        <header className="border-b">
          <div className="mx-auto max-w-[1200px] px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <SidebarTrigger className="mr-1" />
              <Link to="/admin" className="font-semibold">Admin</Link>
            </div>
            <nav className="flex items-center gap-2">
              <NavLink to="/admin/pages" label="Pages" />
              <NavLink to="/admin/seo" label="SEO Insights" />
              <NavLink to="/admin/scheduled" label="Geplant" />
              <NavLink to="/admin/settings" label="Einstellungen" />
            </nav>
          </div>
        </header>
        <div className="flex w-full flex-1">
          <AdminSidebar />
          <main className="flex-1">
            <BaseLayout>
              <Outlet />
            </BaseLayout>
          </main>
        </div>
      </div>
    </SidebarProvider>
  );
}
