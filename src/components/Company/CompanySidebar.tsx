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
  LogOut,
  X,
} from "lucide-react";
import { NavLink, useLocation } from "react-router-dom";
import { useCompany } from "@/hooks/useCompany";
import { supabase } from "@/integrations/supabase/client";

// Hauptnavigation: exakt 5 Punkte
const navItems = [
  { to: "/company/dashboard", label: "Dashboard", icon: Home },
  { to: "/company/search", label: "Kandidatensuche", icon: Search },
  { to: "/company/candidates/pipeline", label: "Pipeline", icon: Columns3 },
  { to: "/company/feed", label: "Community", icon: MessageSquare },
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
  const tokens = company?.active_tokens ?? 0;
  const tokenPct = Math.min(100, Math.round((tokens / maxTokens) * 100));

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
              {groups.map((group, idx) => {
                const Icon = group.icon;
                const groupActive = group.items.some((it) => isActive(it.to));
                const open = !!openGroups[group.key];
                return (
                  <React.Fragment key={group.key}>
                    {idx > 0 && <SidebarSeparator />}
                    <SidebarMenuItem>
                      <SidebarMenuButton
                        tooltip={group.label}
                        isActive={groupActive}
                        onClick={() => toggleGroup(group.key)}
                        className="relative before:absolute before:left-0 before:top-0 before:h-full before:w-1 before:bg-accent before:opacity-0 data-[active=true]:before:opacity-100"
                      >
                        <Icon className="h-4 w-4" />
                        {!collapsed && <span>{group.label}</span>}
                        {!collapsed && (
                          <ChevronDown
                            className={`ml-auto h-4 w-4 transition-transform ${open ? "rotate-180" : ""}`}
                          />
                        )}
                      </SidebarMenuButton>

                      {open && (
                        <SidebarMenuSub>
                          {group.items.map((item) => (
                            <SidebarMenuSubItem key={item.to}>
                              <SidebarMenuSubButton asChild isActive={isActive(item.to)}>
                                <NavLink to={item.to} end>
                                  <span>{item.label}</span>
                                </NavLink>
                              </SidebarMenuSubButton>
                            </SidebarMenuSubItem>
                          ))}
                        </SidebarMenuSub>
                      )}
                    </SidebarMenuItem>
                  </React.Fragment>
                );
              })}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>

      {/* Footer – Teammitglied einladen & Logout */}
      <SidebarFooter>
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton asChild tooltip="Teammitglied einladen" size="sm">
              <NavLink to="/company/settings">
                <Plus className="h-4 w-4" />
                {!collapsed && <span>Teammitglied einladen</span>}
              </NavLink>
            </SidebarMenuButton>
          </SidebarMenuItem>
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
