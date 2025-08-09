import React from "react";
import { SidebarTrigger } from "@/components/ui/sidebar";
import { Bell, Search as SearchIcon, MessageSquareMore, Users } from "lucide-react";
import { useLocation, useNavigate } from "react-router-dom";
import { Input } from "@/components/ui/input";
import SearchAutosuggest from "@/components/marketplace/SearchAutosuggest";
import ConnectionsDrawer from "@/components/community/ConnectionsDrawer";
import HeaderSearchMobile from "@/components/navigation/HeaderSearchMobile";
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
  const navigate = useNavigate();
  const path = location.pathname;
  const title = Object.keys(titleMap).find((p) => path.startsWith(p))
    ? titleMap[Object.keys(titleMap).find((p) => path.startsWith(p)) as string]
    : "Home Feed";
  const [q, setQ] = React.useState("");
  const [open, setOpen] = React.useState(false);
  const [drawerOpen, setDrawerOpen] = React.useState(false);

  const handleSubmit = () => {
    const term = q.trim();
    const sp = new URLSearchParams(location.search);
    if (term) sp.set('q', term); else sp.delete('q');
    navigate(`/marketplace?${sp.toString()}`);
  };

  return (
    <header className="relative sticky top-0 z-40 h-14 flex items-center border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/80 px-3 sm:px-4">
      <div className="flex items-center gap-2 w-full">
        <SidebarTrigger className="mr-1" />
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-lg bg-primary text-primary-foreground flex items-center justify-center font-bold text-sm">
            AM
          </div>
        </div>
        {/* Mobile search icon → expand */}
        <div className="sm:hidden ml-1">
          <HeaderSearchMobile />
        </div>

        {/* Global search next to logo */}
        <div className="relative w-44 sm:w-64 lg:w-72 mx-2 hidden sm:block">
          <SearchIcon className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            value={q}
            onChange={(e) => setQ(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && handleSubmit()}
            onFocus={() => setOpen(true)}
            onBlur={() => setTimeout(() => setOpen(false), 120)}
            placeholder={(() => {
              const t = new URLSearchParams(location.search).get('type') || '';
              if (t === 'people') return 'Suche nach Azubis, Schüler:innen, Gesellen…';
              if (t === 'companies') return 'Suche nach Unternehmen…';
              if (t === 'posts') return 'Suche nach Beiträgen…';
              if (t === 'groups') return 'Suche nach Gruppen…';
              return 'Suche in der Community…';
            })()}
            className="pl-10 h-9"
            aria-label="Globale Suche"
          />
          <SearchAutosuggest
            query={q}
            open={open && !!q}
            onSelect={(type, payload) => {
              setOpen(false);
              if (type === "person") {
                navigate(`/u/${payload.id}`);
                setQ("");
                return;
              }
              if (type === "company") {
                navigate(`/unternehmen`);
                return;
              }
              // default: search page with query
              setQ(payload.label);
              handleSubmit();
            }}
          />
        </div>
        {/* Center title */}
        <div className="hidden md:block flex-1 text-center">
          <h1 className="text-sm sm:text-base font-medium truncate">{title}</h1>
        </div>

        {/* Right actions: Network, Messages then Bell */}
        <div className="flex items-center gap-1 ml-auto">
          <button
            className="inline-flex items-center justify-center h-9 w-9 rounded-md hover:bg-muted focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
            onClick={() => setDrawerOpen(true)}
            aria-label="Mein Netzwerk"
          >
            <Users className="h-5 w-5" />
          </button>
          <button className="inline-flex items-center justify-center h-9 w-9 rounded-md hover:bg-muted focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring">
            <MessageSquareMore className="h-5 w-5" />
            <span className="sr-only">Nachrichten</span>
          </button>
          <button className="relative inline-flex items-center justify-center h-9 w-9 rounded-md hover:bg-muted focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring">
            <Bell className="h-5 w-5" />
            <span className="absolute -top-0.5 -right-0.5 inline-flex h-4 min-w-4 items-center justify-center rounded-full bg-primary text-primary-foreground text-[10px] leading-none px-1">
              3
            </span>
            <span className="sr-only">Benachrichtigungen</span>
          </button>
        </div>

        <ConnectionsDrawer open={drawerOpen} onOpenChange={setDrawerOpen} />
      </div>
    </header>
  );
}
