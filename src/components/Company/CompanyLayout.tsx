import { CompanySidebar } from "@/components/Company/CompanySidebar";
import { CompanyHeader } from "@/components/Company/CompanyHeader";
import { Outlet, Navigate } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";
import { useCompany } from "@/hooks/useCompany";
import BaseLayout from "@/components/layout/BaseLayout";

export function CompanyLayout() {
  const { user, isLoading: authLoading } = useAuth();
  const { company, loading: companyLoading } = useCompany();

  // Show loading state
  if (authLoading || companyLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-primary"></div>
      </div>
    );
  }

  // Redirect to auth if not authenticated
  if (!user) {
    return <Navigate to="/auth" replace />;
  }

  // Redirect to onboarding if no company
  if (!company) {
    return <Navigate to="/company/onboarding" replace />;
  }

  return (
    <div className="min-h-screen flex w-full">
      <CompanySidebar />
      
      <main className="flex-1 flex flex-col">
        <CompanyHeader />
        
        {/* Main Content */}
        <div className="flex-1 p-0">
          <BaseLayout>
            <Outlet />
          </BaseLayout>
        </div>
      </main>
    </div>
  );
}