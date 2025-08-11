import { SidebarProvider } from "@/components/ui/sidebar";
import { AppSidebar } from "@/components/AppSidebar";
import { Outlet, Navigate, useLocation } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";
import BaseLayout from "@/components/layout/BaseLayout";
import TopNavBar from "@/components/navigation/TopNavBar";
import NewPostComposer from "@/components/community/NewPostComposer";
import { VisibilityPrompt } from "@/components/modals/VisibilityPrompt";

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
    <SidebarProvider defaultOpen={false}>
      <div className="min-h-screen flex w-full">
        <AppSidebar />
        
        <main className="flex-1 flex flex-col">
          {/* Top Navigation Bar */}
          <TopNavBar />

          {/* Main Content */}
          <div className="flex-1 p-0">
            <BaseLayout>
              <Outlet />
            </BaseLayout>
          </div>

          {/* Global UI */}
          <VisibilityPrompt />
          <NewPostComposer />
        </main>

      </div>
    </SidebarProvider>
  );
}