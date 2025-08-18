import React from "react";
import { SidebarTrigger } from "@/components/ui/sidebar";
import { Bell, Search as SearchIcon, MessageSquareMore, Users, User } from "lucide-react";
import { useLocation, useNavigate } from "react-router-dom";
import { Input } from "@/components/ui/input";
import SearchAutosuggest from "@/components/marketplace/SearchAutosuggest";
import ConnectionsDrawer from "@/components/community/ConnectionsDrawer";
import QuickMessageDialog from "@/components/community/QuickMessageDialog";
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
  const [q, setQ] = React.useState("");
  const [open, setOpen] = React.useState(false);
  const [drawerOpen, setDrawerOpen] = React.useState(false);
  const [msgOpen, setMsgOpen] = React.useState(false);
  const handleSubmit = () => {
    const term = q.trim();
    const sp = new URLSearchParams(location.search);
    if (term) sp.set('q', term);else sp.delete('q');
    navigate(`/marketplace?${sp.toString()}`);
  };

  // Fixed navbar that spans full width
  return (
    <div className="border-b border-border bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="flex h-14 items-center px-4 gap-4">
        <div className="flex items-center gap-3">
          <SidebarTrigger />
          {/* Logo */}
          <div 
            className="font-bold text-primary cursor-pointer"
            onClick={() => navigate('/dashboard')}
          >
            Nkademiker Plus
          </div>
        </div>
        
        {/* Desktop Search Bar */}
        <div className="hidden md:flex flex-1 max-w-md mx-4 relative">
          <Input
            placeholder="Personen, Unternehmen suchen..."
            value={q}
            onChange={(e) => {
              setQ(e.target.value);
              setOpen(e.target.value.trim().length >= 2);
            }}
            onKeyDown={(e) => e.key === 'Enter' && handleSubmit()}
            onFocus={() => setOpen(q.trim().length >= 2)}
            onBlur={() => setTimeout(() => setOpen(false), 200)}
            className="pr-10"
          />
          <SearchIcon 
            className="absolute right-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground cursor-pointer" 
            onClick={handleSubmit}
          />
          <SearchAutosuggest 
            query={q} 
            open={open} 
            onSelect={(type, item) => {
              setOpen(false);
              if (type === 'person') {
                navigate(`/u/${item.id}`);
              } else if (type === 'company') {
                navigate(`/companies/${item.id}`);
              }
            }} 
          />
        </div>
        
        <div className="flex items-center gap-3">
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
              <MessageSquareMore className="h-5 w-5 cursor-pointer hover:text-primary" />
            </PopoverTrigger>
            <PopoverContent className="w-80 p-0" align="end">
              <MessagePopoverPanel onCompose={() => setMsgOpen(false)} />
            </PopoverContent>
          </Popover>
          
          <Bell className="h-5 w-5 cursor-pointer hover:text-primary" onClick={() => navigate('/notifications')} />
          
          <User 
            className="h-5 w-5 cursor-pointer hover:text-primary" 
            onClick={() => navigate('/profile')} 
          />
        </div>
      </div>
      
      {/* Connections Drawer */}
      <ConnectionsDrawer open={drawerOpen} onOpenChange={setDrawerOpen} />
    </div>
  );
}