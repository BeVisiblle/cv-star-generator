import React, { useState, useRef } from 'react';
import { SidebarTrigger } from "@/components/ui/sidebar";
import { Bell, Search as SearchIcon, MessageSquareMore, Users, User } from "lucide-react";
import { useLocation, useNavigate } from "react-router-dom";
import { Input } from "@/components/ui/input";
import SearchAutosuggest, { SuggestionType } from "@/components/marketplace/SearchAutosuggest";
import ConnectionsDrawer from "@/components/community/ConnectionsDrawer";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import MessagePopoverPanel from "@/components/community/MessagePopoverPanel";

export const NAVBAR_HEIGHT = 56; // h-14 (Desktop) = 56px
export const NAVBAR_HEIGHT_MOBILE = 48; // h-12 (Mobile) = 48px

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
  return <div className="sticky top-0 z-[300] border-b border-border/40 bg-gradient-to-r from-background via-soft-gray/20 to-background backdrop-blur-md supports-[backdrop-filter]:bg-background/80 shadow-soft transition-all duration-300">
      <div className="flex h-12 md:h-14 items-center px-3 md:px-4 gap-2 md:gap-4">
        <div className="flex items-center gap-3">
          <SidebarTrigger />
          {/* Logo */}
          <div className="flex items-center gap-2 cursor-pointer group transition-all duration-300 hover:scale-[1.02]" onClick={() => navigate('/dashboard')}>
            <img src="/assets/Logo_visiblle-2.svg" alt="BeVisiblle Logo" className="h-8 w-8 transition-transform duration-300 group-hover:rotate-6" />
            <span className="font-semibold hidden md:block transition-colors duration-300">
              <span className="text-foreground group-hover:text-primary/80">Be</span>
              <span className="text-foreground group-hover:text-primary/80">Visib</span>
              <span className="text-primary group-hover:text-primary/90">ll</span>
              <span className="text-foreground group-hover:text-primary/80">e</span>
            </span>
          </div>
        </div>
        
        {/* Desktop Search Bar */}
        <div className="hidden md:flex flex-1 max-w-md mx-4 relative group">
          <Input ref={inputRef} placeholder="Personen, Unternehmen suchen..." value={q} onChange={e => {
          setQ(e.target.value);
          setOpen(e.target.value.trim().length >= 2);
        }} onKeyDown={e => e.key === 'Enter' && handleSubmit()} onFocus={() => setOpen(q.trim().length >= 2)} className="pr-10 rounded-2xl border-border/60 bg-gradient-to-br from-background to-soft-gray/10 shadow-soft transition-all duration-300 hover:shadow-soft-lg hover:border-primary/30 focus:border-primary/50" />
          <SearchIcon className="absolute right-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground cursor-pointer transition-colors duration-200 hover:text-primary" onClick={handleSubmit} />
          <SearchAutosuggest query={q} open={open} anchorRef={inputRef} onClose={handleSearchClose} onSelect={(type: SuggestionType, item: {
          id: string;
          label: string;
        }) => {
          setOpen(false);
          if (type === 'person') {
            navigate(`/u/${item.id}`);
          } else if (type === 'company') {
            navigate(`/companies/${item.id}`);
          }
        }} />
        </div>
        
        {/* Icons aligned to the right */}
        <div className="flex items-center gap-1 md:gap-3 ml-auto">
          {/* Mobile Search - with proper touch target */}
          <button 
            className="p-2 -m-2 hover:bg-gradient-to-br hover:from-accent hover:to-accent/60 rounded-2xl md:hidden min-h-[44px] min-w-[44px] flex items-center justify-center active:scale-95 transition-all duration-300 hover:shadow-soft"
            onClick={() => navigate('/marketplace')}
            aria-label="Suche"
          >
            <SearchIcon className="h-6 w-6 md:h-5 md:w-5 transition-colors duration-200" />
          </button>
          
          <button 
            className="p-2 -m-2 hover:bg-gradient-to-br hover:from-accent hover:to-accent/60 rounded-2xl min-h-[44px] min-w-[44px] flex items-center justify-center active:scale-95 transition-all duration-300 hover:shadow-soft"
            onClick={() => navigate('/community/contacts')}
            aria-label="Kontakte"
          >
            <Users className="h-6 w-6 md:h-5 md:w-5 transition-colors duration-200" />
          </button>
          
          <Popover open={msgOpen} onOpenChange={setMsgOpen}>
            <PopoverTrigger asChild>
              <button 
                className="p-2 -m-2 hover:bg-gradient-to-br hover:from-accent hover:to-accent/60 rounded-2xl min-h-[44px] min-w-[44px] flex items-center justify-center active:scale-95 transition-all duration-300 hover:shadow-soft"
                aria-label="Nachrichten"
              >
                <MessageSquareMore className="h-6 w-6 md:h-5 md:w-5 transition-colors duration-200" />
              </button>
            </PopoverTrigger>
            <PopoverContent className="w-80 p-0 rounded-2xl shadow-soft-lg border-border/40" align="end">
              <MessagePopoverPanel onCompose={() => setMsgOpen(false)} />
            </PopoverContent>
          </Popover>
          
          <button 
            className="p-2 -m-2 hover:bg-gradient-to-br hover:from-accent hover:to-accent/60 rounded-2xl min-h-[44px] min-w-[44px] flex items-center justify-center active:scale-95 transition-all duration-300 hover:shadow-soft"
            onClick={() => navigate('/notifications')}
            aria-label="Benachrichtigungen"
          >
            <Bell className="h-6 w-6 md:h-5 md:w-5 transition-colors duration-200" />
          </button>
          
          <button 
            className="p-2 -m-2 hover:bg-gradient-to-br hover:from-accent hover:to-accent/60 rounded-2xl min-h-[44px] min-w-[44px] flex items-center justify-center active:scale-95 transition-all duration-300 hover:shadow-soft"
            onClick={() => navigate('/profile')}
            aria-label="Profil"
          >
            <User className="h-6 w-6 md:h-5 md:w-5 transition-colors duration-200" />
          </button>
        </div>
      </div>
      
      {/* Connections Drawer */}
      <ConnectionsDrawer open={drawerOpen} onOpenChange={setDrawerOpen} />
    </div>;
}