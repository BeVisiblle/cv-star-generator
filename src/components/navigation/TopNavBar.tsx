import React, { useState, useRef } from 'react';
import { SidebarTrigger } from "@/components/ui/sidebar";
import { Bell, Search as SearchIcon, MessageSquare, Users, User } from "lucide-react";
import { useLocation, useNavigate, Link } from "react-router-dom";

import { NotificationCenter } from "@/components/notifications/NotificationCenter";
import { BrandMark } from "@/components/branding/BrandMark";
import { BrandWordmark } from "@/components/branding/BrandWordmark";
import { layoutConfig } from "@/lib/layoutConfig";

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
      <div className="flex h-14 items-center px-2 sm:px-4 gap-2 sm:gap-4">
        <div className="flex items-center gap-2 sm:gap-3">
          <SidebarTrigger className="min-h-[44px] min-w-[44px]" />
          {/* Logo/Brand - only in navbar */}
          {layoutConfig.brandPlacement === 'navbar' && (
            <div 
              className="flex items-center gap-2 cursor-pointer min-h-[44px]"
              onClick={() => navigate('/dashboard')}
            >
              <BrandMark className="h-6 w-6 sm:h-8 sm:w-8" />
              <BrandWordmark location="navbar" className="hidden sm:block" />
            </div>
          )}
        </div>
        
        {/* Page Title for Mobile */}
        <div className="flex-1 md:hidden">
          <h1 className="text-sm font-semibold truncate">{title}</h1>
        </div>
        
        {/* Global Search Bar - Temporarily disabled */}
        <div className="hidden md:flex flex-1 max-w-md mx-4">
          <Input 
            placeholder="Personen, Unternehmen, Events suchen..."
            className="w-full"
          />
        </div>
        
        {/* Icons aligned to the right */}
        <div className="flex items-center gap-1 sm:gap-3 ml-auto">
          {/* Mobile Search */}
          <div className="min-h-[44px] min-w-[44px] flex items-center justify-center">
            <SearchIcon 
              className="h-5 w-5 cursor-pointer hover:text-primary md:hidden" 
              onClick={() => navigate('/marketplace')} 
            />
          </div>
          
          <div className="min-h-[44px] min-w-[44px] flex items-center justify-center">
            <Users 
              className="h-5 w-5 cursor-pointer hover:text-primary" 
              onClick={() => setDrawerOpen(true)} 
            />
          </div>
          
          <Popover open={msgOpen} onOpenChange={setMsgOpen}>
            <PopoverTrigger asChild>
              <div className="min-h-[44px] min-w-[44px] flex items-center justify-center">
                <MessageSquare className="h-5 w-5 cursor-pointer hover:text-primary" />
              </div>
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