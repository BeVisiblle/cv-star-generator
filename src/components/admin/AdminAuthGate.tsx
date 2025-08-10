import React from "react";
import { Navigate } from "react-router-dom";
import { useAdminSession, AdminRole } from "@/hooks/useAdminSession";

export function AdminAuthGate({ requiredRole, children }: { requiredRole?: AdminRole; children: React.ReactNode }) {
  const { admin, role, isLoading } = useAdminSession();

  const allowed = React.useMemo(() => {
    if (!requiredRole) return !!admin && !!role; // any admin role
    const hierarchy: AdminRole[] = ["SuperAdmin", "SupportAgent", "ContentEditor", "CompanyAdmin"];
    if (!role) return false;
    // Allow if user's role ranks equal or higher privilege than required (SuperAdmin >= all)
    return hierarchy.indexOf(role) <= hierarchy.indexOf(requiredRole);
  }, [admin, role, requiredRole]);

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="h-12 w-12 rounded-full border-2 border-[hsl(var(--accent))] border-t-transparent animate-spin" />
      </div>
    );
  }

  if (!allowed) {
    return <Navigate to="/auth" replace />;
  }

  return <>{children}</>;
}

export default AdminAuthGate;
