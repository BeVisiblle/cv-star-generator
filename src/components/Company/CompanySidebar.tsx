import React from "react";
import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarFooter,
  SidebarMenu,
  SidebarMenuItem,
  SidebarMenuButton,
  useSidebar,
} from "@/components/ui/sidebar";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Progress } from "@/components/ui/progress";
import {
  Home,
  Users,
  Eye,
  FileText,
  Building2,
  Coins,
  Settings as SettingsIcon,
  Globe,
  Plus,
} from "lucide-react";
import { NavLink, useLocation } from "react-router-dom";
import { useCompany } from "@/hooks/useCompany";

// Flache, kompakte Sidebar ohne zweite Ebene
const navItems = [
  { label: "Dashboard", to: "/company/dashboard", icon: Home },
  { label: "Kandidaten", to: "/company/search", icon: Users },
  { label: "Freigeschaltet", to: "/company/unlocked", icon: Eye },
  { label: "Beiträge", to: "/company/posts", icon: FileText },
  { label: "Unternehmensprofil", to: "/company/profile", icon: Building2 },
  { label: "Abrechnung", to: "/company/billing", icon: Coins },
  { label: "Einstellungen", to: "/company/settings", icon: SettingsIcon },
  { label: "Community", to: "/dashboard", icon: Globe },
] as const;

export function CompanySidebar() {
  const { state } = useSidebar();
  const { company } = useCompany();
  const location = useLocation();

  const isActive = (to: string) => location.pathname.startsWith(to);

  const maxTokens = Math.max(1, (company?.seats ?? 0) * 10);
  const tokens = company?.active_tokens ?? 0;
  const tokenPct = Math.min(100, Math.round((tokens / maxTokens) * 100));

  return (
    <Sidebar collapsible="icon" className={state === "collapsed" ? "w-14" : "w-56"}>
      {/* Header mit Logo & kompakter Token-Anzeige */}
      <SidebarHeader>
        <div className="flex items-center gap-2 px-2">
          <Avatar className="h-8 w-8 shrink-0">
            <AvatarImage src={company?.logo_url || ""} alt={company?.name || "Company"} />
            <AvatarFallback>{company?.name?.[0]?.toUpperCase() || "C"}</AvatarFallback>
          </Avatar>
          {state !== "collapsed" && (
            <div className="min-w-0 flex-1">
              <div className="text-sm font-medium truncate" title={company?.name}>{company?.name || "Company"}</div>
              <div className="mt-1">
                <Progress value={tokenPct} className="h-1" />
                <div className="mt-1 text-[10px] text-muted-foreground">
                  {tokens} / {maxTokens} Tokens
                </div>
              </div>
            </div>
          )}
        </div>
      </SidebarHeader>

      {/* Navigation – eine Ebene, kompakt */}
      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupLabel>Navigation</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {navItems.map((item) => {
                const Icon = item.icon;
                const active = isActive(item.to);
                return (
                  <SidebarMenuItem key={item.to}>
                    <SidebarMenuButton
                      asChild
                      tooltip={item.label}
                      isActive={active}
                      size="sm"
                      className="relative before:absolute before:left-0 before:top-0 before:h-full before:w-1 before:bg-primary before:opacity-0 data-[active=true]:before:opacity-100"
                    >
                      <NavLink to={item.to} end>
                        <Icon className="h-4 w-4" />
                        {state !== "collapsed" && <span>{item.label}</span>}
                      </NavLink>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                );
              })}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>

      {/* Footer – Teammitglied einladen */}
      <SidebarFooter>
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton asChild tooltip="Teammitglied einladen" size="sm">
              <NavLink to="/company/settings">
                <Plus className="h-4 w-4" />
                {state !== "collapsed" && <span>Teammitglied einladen</span>}
              </NavLink>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarFooter>
    </Sidebar>
  );
}
