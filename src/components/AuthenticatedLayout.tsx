import { SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar";
import { AppSidebar } from "@/components/AppSidebar";
import { Outlet, Navigate, useLocation } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";
import BaseLayout from "@/components/layout/BaseLayout";

export function AuthenticatedLayout() {
  const { profile, isLoading, user } = useAuth();
  const location = useLocation();

  // Show loading state
  if (isLoading) {
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

  // Only redirect users with complete profiles that are not published yet, but not if already on profile page
  if (profile && !profile.profile_published && profile.profile_complete && location.pathname !== "/profile") {
    return <Navigate to="/profile" replace />;
  }

  // For users without profiles, let them stay where they are (they might be in CV generator)

  return (
    <SidebarProvider defaultOpen={true}>
      <div className="min-h-screen flex w-full">
        <AppSidebar />
        
        <main className="flex-1 flex flex-col">
          {/* Header with Sidebar Toggle */}
          <header className="h-14 flex items-center border-b bg-background px-4">
            <SidebarTrigger className="mr-2" />
            <div className="flex-1">
              {/* Additional header content can go here */}
            </div>
          </header>

          {/* Main Content */}
          <div className="flex-1 p-0">
            <BaseLayout>
              <Outlet />
            </BaseLayout>
          </div>
        </main>
      </div>
    </SidebarProvider>
  );
}