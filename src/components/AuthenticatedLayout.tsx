import React from "react";
import { Outlet, Navigate, useLocation } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";
import BaseLayout from "@/components/layout/BaseLayout";
import { AppSidebar } from "@/components/AppSidebar";
import NewPostComposer from "@/components/community/NewPostComposer";
import { VisibilityPrompt } from "@/components/modals/VisibilityPrompt";
import { AddressConfirmModal } from "@/components/modals/AddressConfirmModal";
import { VisibilityNudge, VisibilityInfoBanner } from "@/components/modals/VisibilityNudge";
import { useEntryGates } from "@/hooks/useEntryGates";

export function AuthenticatedLayout() {
  const { profile, isLoading, user } = useAuth();
  const location = useLocation();
  const entryGates = useEntryGates();

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

  // Trigger entry gates on route change for dashboard/sidebar access
  React.useEffect(() => {
    const isDashboardRoute = location.pathname === '/dashboard' || 
                            location.pathname.startsWith('/talent') ||
                            location.pathname.startsWith('/marketplace') ||
                            location.pathname.startsWith('/notifications');
    
    if (user && isDashboardRoute) {
      entryGates.onNavigate();
    }
  }, [location.pathname, user?.id]); // Use user.id instead of entryGates.onNavigate

  return (
    <div className="min-h-screen flex w-full">
      <AppSidebar />
      
      <main className="flex-1 flex flex-col">
        {/* Main Content - TopNavBar is now handled by UniversalLayout */}
        <div className="flex-1 p-0">
          <BaseLayout>
            <Outlet />
          </BaseLayout>
        </div>

        {/* Global UI */}
        <VisibilityPrompt />
        <NewPostComposer />
        
        {/* Entry Gates */}
        {entryGates.addressData && (
          <AddressConfirmModal
            open={entryGates.showAddressModal}
            initialData={entryGates.addressData}
            onConfirm={entryGates.saveAddress}
          />
        )}
        
        <VisibilityNudge
          open={entryGates.showVisibilityModal}
          onClose={entryGates.closeVisibilityModal}
          onChoose={entryGates.saveVisibilityChoice}
        />
        
        {entryGates.showVisibilityBanner && (
          <VisibilityInfoBanner onOpen={entryGates.openVisibilityModal} />
        )}
      </main>
    </div>
  );
}