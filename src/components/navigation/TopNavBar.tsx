import React, { useState, useRef } from 'react';
import { SidebarTrigger } from "@/components/ui/sidebar";
import { Bell, Search as SearchIcon, MessageSquare, Users, User } from "lucide-react";
import { useLocation, useNavigate, Link } from "react-router-dom";

import { NotificationCenter } from "@/components/notifications/NotificationCenter";
// import { GlobalSearchBar } from "@/components/search/GlobalSearchBar";

import { Input } from "@/components/ui/input";
import SearchAutosuggest, { SuggestionType } from "@/components/marketplace/SearchAutosuggest";
import ConnectionsDrawer from "@/components/community/ConnectionsDrawer";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import MessagePopoverPanel from "@/components/community/MessagePopoverPanel";
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
  "/profile": "Profil"
};
export default function TopNavBar() {
  const location = useLocation();
  const navigate = useNavigate();
  const path = location.pathname;
  const title = Object.keys(titleMap).find(p => path.startsWith(p)) ? titleMap[Object.keys(titleMap).find(p => path.startsWith(p)) as string] : "Home Feed";
  
  const [q, setQ] = useState("");
  const [open, setOpen] = useState(false);
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [msgOpen, setMsgOpen] = useState(false);
  const [isNotificationCenterOpen, setIsNotificationCenterOpen] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);
  
  const unreadCount = 0; // Temporarily disabled

  const handleSubmit = () => {
    const term = q.trim();
    const sp = new URLSearchParams(location.search);
    if (term) sp.set('q', term);else sp.delete('q');
    navigate(`/marketplace?${sp.toString()}`);
  };

  const handleSearchClose = () => {
    setOpen(false);
  };

  // Sticky navbar at top with high z-index
  return (
    <div className="sticky top-0 z-[300] border-b border-border bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="flex h-14 items-center px-4 gap-4">
        <div className="flex items-center gap-3">
          <SidebarTrigger />
          {/* Logo/Brand - only in navbar */}
          <div 
            className="flex items-center gap-2 cursor-pointer"
            onClick={() => navigate('/dashboard')}
          >
            <img 
              src="/lovable-uploads/59fd3c9b-c2d3-4613-b2c1-1366f349e1e9.png" 
              alt="Ausbildungsbasis Logo" 
              className="h-8 w-8"
            />
            <span className="font-bold text-primary hidden sm:block">
              Ausbildungsbasis
            </span>
          </div>
        </div>
        
        {/* Global Search Bar - Temporarily disabled */}
        <div className="hidden md:flex flex-1 max-w-md mx-4">
          <Input 
            placeholder="Personen, Unternehmen, Events suchen..."
            className="w-full"
          />
        </div>
        
        {/* Icons aligned to the right */}
        <div className="flex items-center gap-3 ml-auto">
          {/* Mobile Search */}
          <SearchIcon 
            className="h-5 w-5 cursor-pointer hover:text-primary md:hidden" 
            onClick={() => navigate('/marketplace')} 
          />
          
          <Users 
            className="h-5 w-5 cursor-pointer hover:text-primary" 
            onClick={() => setDrawerOpen(true)} 
          />
          
          <Popover open={msgOpen} onOpenChange={setMsgOpen}>
            <PopoverTrigger asChild>
              <MessageSquare className="h-5 w-5 cursor-pointer hover:text-primary" />
            </PopoverTrigger>
            <PopoverContent className="w-80 p-0" align="end">
              <MessagePopoverPanel onCompose={() => setMsgOpen(false)} />
            </PopoverContent>
          </Popover>
          
          <div className="relative">
            <Bell 
              className="h-5 w-5 cursor-pointer hover:text-primary" 
              onClick={() => setIsNotificationCenterOpen(true)} 
            />
            {unreadCount > 0 && (
              <span className="absolute -top-1 -right-1 h-4 w-4 bg-red-500 text-white text-xs rounded-full flex items-center justify-center">
                {unreadCount > 9 ? '9+' : unreadCount}
              </span>
            )}
          </div>
          
          
          <User 
            className="h-5 w-5 cursor-pointer hover:text-primary" 
            onClick={() => navigate('/profile')} 
          />
        </div>
      </div>
      
      {/* Connections Drawer */}
      <ConnectionsDrawer open={drawerOpen} onOpenChange={setDrawerOpen} />

          {/* Notification Center */}
      <NotificationCenter 
        isOpen={isNotificationCenterOpen} 
        onClose={() => setIsNotificationCenterOpen(false)} 
      />
    </div>
  );
}