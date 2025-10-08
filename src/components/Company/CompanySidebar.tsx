import React, { useEffect, useMemo, useState } from "react";
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
  SidebarMenuSub,
  SidebarMenuSubItem,
  SidebarMenuSubButton,
  SidebarSeparator,
  useSidebar,
} from "@/components/ui/sidebar";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Progress } from "@/components/ui/progress";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import {
  Home,
  Search,
  Columns3,
  MessageSquare,
  Settings as SettingsIcon,
  Building2,
  Bell,
  LogOut,
  X,
  Users,
  Target,
  Briefcase,
} from "lucide-react";
import { NavLink, useLocation } from "react-router-dom";
import { useCompany } from "@/hooks/useCompany";
import { supabase } from "@/integrations/supabase/client";

// Hauptnavigation: 10 Punkte
const navItems = [
  { to: "/company/dashboard", label: "Dashboard", icon: Home },
  { to: "/company/profile", label: "Unternehmensprofil", icon: Building2 },
  { to: "/company/needs", label: "Anforderungsprofile", icon: Target },
  { to: "/company/jobs", label: "Stellenanzeigen", icon: Briefcase },
  { to: "/company/search", label: "Kandidatensuche", icon: Search },
  { to: "/company/unlocked", label: "Freigeschaltete Azubis", icon: Users },
  { to: "/company/candidates/pipeline", label: "Pipeline", icon: Columns3 },
  { to: "/company/feed", label: "Community", icon: MessageSquare },
  { to: "/company/notifications", label: "Benachrichtigungen", icon: Bell },
  { to: "/company/settings", label: "Einstellungen", icon: SettingsIcon },
] as const;


export function CompanySidebar() {
  const { state, isMobile, setOpenMobile } = useSidebar();
  const collapsed = state === "collapsed";
  const { company } = useCompany();
  const location = useLocation();

  const isActive = (to: string) =>
    location.pathname === to || location.pathname.startsWith(to.replace(":id", ""));

// simplified sidebar: no grouped accordion state

  const maxTokens = Math.max(1, (company?.seats ?? 0) * 10);
  const usedTokens = company?.active_tokens ?? 0;
  const remainingTokens = maxTokens - usedTokens;
  const tokenPct = Math.min(100, Math.round((usedTokens / maxTokens) * 100));

  const handleSignOut = async () => {
    await supabase.auth.signOut();
    window.location.href = "/auth";
  };

  return (
    <Sidebar collapsible="icon" className={collapsed ? "w-[70px]" : "w-[240px]"}>
      {/* Header mit Logo, Token-Anzeige & Mobile-Close */}
      <SidebarHeader>
        <div className="flex items-center gap-2 px-2">
          <Avatar className="h-8 w-8 shrink-0">
            <AvatarImage src={company?.logo_url || ""} alt={company?.name || "Company"} />
            <AvatarFallback>{company?.name?.[0]?.toUpperCase() || "C"}</AvatarFallback>
          </Avatar>
          {!collapsed && (
            <div className="min-w-0 flex-1">
              <div className="text-sm font-medium truncate" title={company?.name}>
                {company?.name || "Company"}
              </div>
              <div className="text-[11px] text-muted-foreground">Unternehmensbereich</div>
            </div>
          )}
          {isMobile && (
            <button
              aria-label="Sidebar schließen"
              onClick={() => setOpenMobile(false)}
              className="ml-auto p-2 rounded-md hover:bg-sidebar-accent text-sidebar-foreground md:hidden"
            >
              <X className="h-4 w-4" />
            </button>
          )}
        </div>
      </SidebarHeader>

      {/* Navigation – Gruppen mit Unterpunkten (Accordion-Logik) */}
      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupLabel>Navigation</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {navItems.map((item) => {
                const Icon = item.icon;
                return (
                  <SidebarMenuItem key={item.to}>
                    <SidebarMenuButton asChild isActive={isActive(item.to)} tooltip={item.label}>
                      <NavLink to={item.to} end>
                        <Icon className="h-4 w-4" />
                        {!collapsed && <span>{item.label}</span>}
                      </NavLink>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                );
              })}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>

      {/* Footer – Company Info & Token Usage */}
      <SidebarFooter>
        {!collapsed && (
          <div className="p-3 border-t border-sidebar-border">
            {/* Company Info */}
            <div className="flex items-center gap-2 mb-3">
              <Avatar className="h-8 w-8 shrink-0">
                <AvatarImage src={company?.logo_url || ""} alt={company?.name || "Company"} />
                <AvatarFallback>{company?.name?.[0]?.toUpperCase() || "C"}</AvatarFallback>
              </Avatar>
              <div className="min-w-0 flex-1">
                <div className="text-sm font-medium truncate" title={company?.name}>
                  {company?.name || "Company"}
                </div>
                <div className="text-xs text-muted-foreground">
                  {usedTokens} / {maxTokens} Token verwendet
                </div>
              </div>
            </div>
            
            {/* Token Usage Bar */}
            <div className="space-y-1">
              <div className="flex justify-between text-xs text-muted-foreground">
                <span>Token-Verbrauch</span>
                <span>{tokenPct}%</span>
              </div>
              <Progress value={tokenPct} className="h-2" />
            </div>
          </div>
        )}
        
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton onClick={handleSignOut} tooltip="Abmelden" size="sm">
              <LogOut className="h-4 w-4" />
              {!collapsed && <span>Abmelden</span>}
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarFooter>
    </Sidebar>
  );
}
