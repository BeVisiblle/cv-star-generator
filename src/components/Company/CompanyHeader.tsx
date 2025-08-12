import React from "react";
import { SidebarTrigger } from "@/components/ui/sidebar";
import { useCompany } from "@/hooks/useCompany";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Coins, Search as SearchIcon } from "lucide-react";
import { Input } from "@/components/ui/input";
import SearchAutosuggestCompany from "@/components/company/feed/SearchAutosuggestCompany";
import { useNavigate } from "react-router-dom";

export function CompanyHeader() {
  const { company } = useCompany();
  const navigate = useNavigate();
  const [q, setQ] = React.useState("");
  const [open, setOpen] = React.useState(false);

  return (
    <header className="sticky top-0 z-40 h-14 flex items-center border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/80 px-4">
      <div className="flex items-center gap-2 w-full">
        {/* Left: Sidebar + Company */}
        <div className="flex items-center">
          <SidebarTrigger className="mr-4" />
          {company && (
            <div className="hidden sm:flex items-center space-x-3 min-w-0">
              <Avatar className="h-8 w-8 shrink-0">
                <AvatarImage src={company.logo_url || ""} alt={company.name} />
                <AvatarFallback>
                  {company.name.charAt(0).toUpperCase()}
                </AvatarFallback>
              </Avatar>
              <span className="font-medium truncate max-w-[30vw] md:max-w-none">{company.name}</span>
            </div>
          )}
        </div>

        {/* Center: Search */}
        <div className="relative flex-1 max-w-xl mx-2 hidden sm:block">
          <SearchIcon className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            value={q}
            onChange={(e) => setQ(e.target.value)}
            onFocus={() => setOpen(true)}
            onBlur={() => setTimeout(() => setOpen(false), 120)}
            placeholder="Suche in freigeschalteten Kandidaten, Unternehmen, Beiträgen, Jobs und Followern…"
            className="pl-10 h-9"
            aria-label="Unternehmenssuche"
          />
          <div className="absolute left-0 right-0 z-30 mt-2">
            <SearchAutosuggestCompany
              query={q}
              open={open && !!q}
              onSelect={(group, payload) => {
                setOpen(false);
                if (group === "candidates" || group === "followers") {
                  navigate(`/company/profile-view/${payload.id}`);
                  setQ("");
                  return;
                }
                if (group === "companies") {
                  navigate(`/companies/${payload.id}`);
                  setQ("");
                  return;
                }
                if (group === "posts" || group === "jobs") {
                  navigate(`/company/posts?query=${encodeURIComponent(payload.label || q)}`);
                  setQ(payload.label);
                  return;
                }
              }}
            />
          </div>
        </div>

        {/* Right: Tokens */}
        <div className="flex items-center space-x-4">
          {company && (
            <Badge variant="secondary" className="flex items-center space-x-1">
              <Coins className="h-4 w-4" />
              <span>{company.active_tokens} Tokens</span>
            </Badge>
          )}
        </div>
      </div>
    </header>
  );
}
