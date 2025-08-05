import { SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar";
import { AppSidebar } from "@/components/AppSidebar";
import { Outlet } from "react-router-dom";

export function AuthenticatedLayout() {
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
          <div className="flex-1 p-6">
            <Outlet />
          </div>
        </main>
      </div>
    </SidebarProvider>
  );
}