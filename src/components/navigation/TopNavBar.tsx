import React from "react";
import { SidebarTrigger } from "@/components/ui/sidebar";
import { Bell } from "lucide-react";
import { useLocation } from "react-router-dom";

const titleMap: Record<string, string> = {
  "/community/contacts": "Meine Kontakte",
  "/community/companies": "Unternehmen",
  "/community/messages": "Nachrichten",
  "/community/jobs": "Jobs",
  "/marketplace": "Community",
  "/dashboard": "Home Feed",
  "/network": "My Network",
  "/companies": "Companies",
  "/messages": "Messages",
  "/notifications": "Notifications",
  "/profile": "Profil",
};

export default function TopNavBar() {
  const location = useLocation();
  const path = location.pathname;
  const title = Object.keys(titleMap).find((p) => path.startsWith(p))
    ? titleMap[Object.keys(titleMap).find((p) => path.startsWith(p)) as string]
    : "Home Feed";

  return (
    <header className="sticky top-0 z-40 h-14 flex items-center border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/80 px-3 sm:px-4">
      <div className="flex items-center gap-2 w-full">
        <SidebarTrigger className="mr-1" />
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-lg bg-primary text-primary-foreground flex items-center justify-center font-bold text-sm">
            AM
          </div>
        </div>
        <div className="flex-1 text-center">
          <h1 className="text-sm sm:text-base font-medium truncate">{title}</h1>
        </div>
        <button className="relative inline-flex items-center justify-center h-9 w-9 rounded-md hover:bg-muted focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring">
          <Bell className="h-5 w-5" />
          <span className="absolute -top-0.5 -right-0.5 inline-flex h-4 min-w-4 items-center justify-center rounded-full bg-primary text-primary-foreground text-[10px] leading-none px-1">
            3
          </span>
          <span className="sr-only">Benachrichtigungen</span>
        </button>
      </div>
    </header>
  );
}
