import React, { useState, useRef } from 'react';
import { SidebarTrigger } from "@/components/ui/sidebar";
import { Bell, Search as SearchIcon, MessageSquareMore, Users, User } from "lucide-react";
import { useLocation, useNavigate } from "react-router-dom";
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
  const inputRef = useRef<HTMLInputElement>(null);

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
      <div className="flex h-12 md:h-14 items-center px-3 md:px-4 gap-2 md:gap-4">
        <div className="flex items-center gap-3">
          <SidebarTrigger />
          {/* Logo */}
          <div 
            className="flex items-center gap-2 cursor-pointer"
            onClick={() => navigate('/dashboard')}
          >
            <img 
              src="/src/assets/logo.svg" 
              alt="BeVisiblle Logo" 
              className="h-7 w-7 md:h-8 md:w-8"
            />
            <span className="font-semibold hidden md:block">
              <span className="text-foreground">Be</span>
              <span className="text-foreground">Visibi</span>
              <span className="text-primary">ll</span>
              <span className="text-foreground">e</span>
            </span>
          </div>
        </div>
        
        {/* Desktop Search Bar */}
        <div className="hidden md:flex flex-1 max-w-md mx-4 relative">
          <Input
            ref={inputRef}
            placeholder="Personen, Unternehmen suchen..."
            value={q}
            onChange={(e) => {
              setQ(e.target.value);
              setOpen(e.target.value.trim().length >= 2);
            }}
            onKeyDown={(e) => e.key === 'Enter' && handleSubmit()}
            onFocus={() => setOpen(q.trim().length >= 2)}
            className="pr-10"
          />
          <SearchIcon 
            className="absolute right-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground cursor-pointer" 
            onClick={handleSubmit}
          />
          <SearchAutosuggest 
            query={q} 
            open={open}
            anchorRef={inputRef}
            onClose={handleSearchClose}
            onSelect={(type: SuggestionType, item: { id: string; label: string }) => {
              setOpen(false);
              if (type === 'person') {
                navigate(`/u/${item.id}`);
              } else if (type === 'company') {
                navigate(`/companies/${item.id}`);
              }
            }} 
          />
        </div>
        
        {/* Icons aligned to the right */}
        <div className="flex items-center gap-2 md:gap-3 ml-auto">
          {/* Mobile Search */}
          <SearchIcon 
            className="h-4 w-4 md:h-5 md:w-5 cursor-pointer hover:text-primary md:hidden" 
            onClick={() => navigate('/marketplace')} 
          />
          
          <Users 
            className="h-4 w-4 md:h-5 md:w-5 cursor-pointer hover:text-primary" 
            onClick={() => setDrawerOpen(true)} 
          />
          
          <Popover open={msgOpen} onOpenChange={setMsgOpen}>
            <PopoverTrigger asChild>
              <MessageSquareMore className="h-4 w-4 md:h-5 md:w-5 cursor-pointer hover:text-primary" />
            </PopoverTrigger>
            <PopoverContent className="w-80 p-0" align="end">
              <MessagePopoverPanel onCompose={() => setMsgOpen(false)} />
            </PopoverContent>
          </Popover>
          
          <Bell className="h-4 w-4 md:h-5 md:w-5 cursor-pointer hover:text-primary" onClick={() => navigate('/notifications')} />
          
          <User 
            className="h-4 w-4 md:h-5 md:w-5 cursor-pointer hover:text-primary" 
            onClick={() => navigate('/profile')} 
          />
        </div>
      </div>
      
      {/* Connections Drawer */}
      <ConnectionsDrawer open={drawerOpen} onOpenChange={setDrawerOpen} />
    </div>
  );
}