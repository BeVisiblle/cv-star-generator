import { useState, useEffect } from "react";
import { NavLink, useLocation, useNavigate } from "react-router-dom";
import { LayoutDashboard, User, Users, Settings, FileText, LogOut, ChevronRight, ChevronDown, Plus, MessageSquare, Briefcase, Building2, Search, Sparkles, UserPlus, Mail, UsersRound, Menu } from "lucide-react";
import { Sidebar, SidebarContent, SidebarGroup, SidebarGroupContent, SidebarGroupLabel, SidebarMenu, SidebarMenuButton, SidebarMenuItem, SidebarMenuSub, SidebarMenuSubItem, SidebarMenuSubButton, SidebarHeader, SidebarFooter, SidebarTrigger, useSidebar } from "@/components/ui/sidebar";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { supabase } from "@/integrations/supabase/client";
import { useQuery } from "@tanstack/react-query";
import { openPostComposer } from "@/lib/event-bus";
import { formatNameWithJob } from "@/utils/profileUtils";

const navigationItems = [{
  title: "Dashboard",
  url: "/dashboard",
  icon: LayoutDashboard
}, {
  title: "Für Dich",
  url: "/foryou",
  icon: Sparkles
}, {
  title: "Mein Profil",
  url: "/profile",
  icon: User
}, {
  title: "Einstellungen",
  url: "/settings",
  icon: Settings
}];

const communityItems = [
  { title: "Community", url: "/marketplace", icon: Users },
  { title: "Freunde", url: "/community/contacts", icon: UserPlus },
  { title: "Nachrichten", url: "/messages", icon: Mail },
  { title: "Gruppen", url: "/groups", icon: UsersRound }
];

const careerItems = [
  { title: "Jobsuche", url: "/jobs", icon: Search },
  { title: "Meine Karriere", url: "/meine-karriere", icon: Briefcase },
  { title: "Unternehmen", url: "/companies", icon: Building2 }
];
export function AppSidebar() {
  const sidebar = useSidebar();
  const collapsed = sidebar.state === "collapsed";
  const location = useLocation();
  const navigate = useNavigate();
  const currentPath = location.pathname;
  
  // Determine if groups should be open based on current path
  const isCommunityPath = communityItems.some(item => currentPath === item.url);
  const isCareerPath = careerItems.some(item => currentPath === item.url);
  
  const [communityOpen, setCommunityOpen] = useState(isCommunityPath);
  const [careerOpen, setCareerOpen] = useState(isCareerPath);
  
  // Update open state when path changes
  useEffect(() => {
    setCommunityOpen(isCommunityPath);
    setCareerOpen(isCareerPath);
  }, [isCommunityPath, isCareerPath]);
  const {
    data: profile
  } = useQuery({
    queryKey: ['profile'],
    queryFn: async () => {
      const {
        data: {
          user
        }
      } = await supabase.auth.getUser();
      if (!user) return null;
      const {
        data,
        error
      } = await supabase.from('profiles').select('*').eq('id', user.id).single();
      if (error) throw error;
      return data;
    }
  });
  const nameInfo = formatNameWithJob(profile);
  const isActive = (path: string) => currentPath === path;
  const handleSignOut = async () => {
    await supabase.auth.signOut();
    window.location.href = '/auth';
  };

  // Auto-close sidebar on navigation (mobile only)
  const handleNavigation = (to: string) => {
    navigate(to);
    if (sidebar.isMobile) {
      sidebar.setOpenMobile(false);
    }
  };

  // Handle clicks outside sidebar to close it
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      const sidebarEl = document.querySelector('[data-sidebar="sidebar"]');
      const trigger = document.querySelector('[data-sidebar="trigger"]');
      if (sidebarEl && !sidebarEl.contains(event.target as Node) && trigger && !trigger.contains(event.target as Node)) {
        sidebar.setOpen(false);
      }
    };
    if (sidebar.state !== "collapsed") {
      document.addEventListener('mousedown', handleClickOutside);
      return () => document.removeEventListener('mousedown', handleClickOutside);
    }
  }, [sidebar]);
  return (
    <>
      {/* Backdrop overlay for mobile */}
      {sidebar.open && sidebar.isMobile && (
        <div 
          className="fixed inset-0 bg-gradient-to-b from-black/50 to-black/30 backdrop-blur-md z-[390] lg:hidden transition-all duration-300" 
          onClick={() => sidebar.setOpenMobile(false)} 
        />
      )}
      
      <Sidebar 
        className={`fixed left-0 top-0 h-screen z-[400] ${collapsed ? 'w-16' : 'w-64'} bg-gradient-to-b from-sidebar via-sidebar to-soft-gray/10 border-r border-sidebar-border/40 shadow-soft`}
        collapsible="icon" 
        data-sidebar="sidebar"
      >
        {/* Trigger Button at the top */}
        <SidebarHeader className="h-14 border-b border-sidebar-border/30 flex items-center justify-center px-2 bg-gradient-to-r from-sidebar to-sidebar/80">
          <SidebarTrigger className="h-8 w-8 hover:bg-sidebar-accent/80 hover:scale-105 active:scale-95 rounded-2xl transition-all duration-300 hover:shadow-soft" />
        </SidebarHeader>

        <SidebarContent>
          <SidebarGroup>
            <SidebarGroupContent>
              <SidebarMenu>
                {navigationItems.slice(0, 2).map(item => (
                  <SidebarMenuItem key={item.title}>
                    <SidebarMenuButton asChild tooltip={collapsed ? item.title : undefined}>
                      <button onClick={() => handleNavigation(item.url)} className={`flex items-center w-full ${collapsed ? 'justify-center h-12 w-12 mx-auto' : 'justify-between px-3 h-10'} rounded-2xl transition-all duration-300 ${isActive(item.url) ? "bg-gradient-to-r from-sidebar-accent/80 to-sidebar-accent/40 text-sidebar-accent-foreground shadow-soft-lg border border-sidebar-border/20" : "text-sidebar-foreground hover:bg-gradient-to-r hover:from-sidebar-accent hover:to-sidebar-accent/60 hover:text-sidebar-accent-foreground hover:shadow-soft hover:scale-[1.02] active:scale-95"}`}>
                        <div className="flex items-center gap-3">
                          <item.icon className="h-5 w-5 shrink-0 transition-transform duration-300 group-hover:scale-110" />
                          {!collapsed && <span className="transition-all duration-300">{item.title}</span>}
                        </div>
                        {!collapsed && isActive(item.url) && <ChevronRight className="h-4 w-4 shrink-0 transition-transform duration-300" />}
                      </button>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                ))}

                {/* Community Menu */}
                <Collapsible open={communityOpen} onOpenChange={setCommunityOpen}>
                  <SidebarMenuItem>
                    <CollapsibleTrigger asChild>
                      <SidebarMenuButton tooltip={collapsed ? "Community" : undefined} className={`flex items-center w-full ${collapsed ? 'justify-center h-12 w-12 mx-auto' : 'justify-between px-3 h-10'} rounded-2xl transition-all duration-300 hover:bg-gradient-to-r hover:from-sidebar-accent/50 hover:to-sidebar-accent/30 hover:shadow-soft hover:scale-[1.02] active:scale-95`}>
                        <div className="flex items-center gap-3">
                          <Users className="h-5 w-5 shrink-0 transition-transform duration-300 group-hover:scale-110" />
                          {!collapsed && <span className="transition-all duration-300">Community</span>}
                        </div>
                        {!collapsed && (communityOpen ? <ChevronDown className="h-4 w-4 shrink-0 transition-transform duration-300" /> : <ChevronRight className="h-4 w-4 shrink-0 transition-transform duration-300" />)}
                      </SidebarMenuButton>
                    </CollapsibleTrigger>
                    {!collapsed && (
                      <CollapsibleContent>
                        <SidebarMenuSub>
                          {communityItems.map(item => (
                            <SidebarMenuSubItem key={item.title}>
                              <SidebarMenuSubButton asChild>
                                <button onClick={() => handleNavigation(item.url)} className={`flex items-center gap-3 w-full pl-9 pr-3 h-9 rounded-2xl transition-all duration-300 ${isActive(item.url) ? "bg-gradient-to-r from-sidebar-accent/60 to-sidebar-accent/30 text-sidebar-accent-foreground shadow-soft" : "text-sidebar-foreground hover:bg-gradient-to-r hover:from-sidebar-accent/70 hover:to-sidebar-accent/40 hover:text-sidebar-accent-foreground hover:shadow-soft hover:scale-[1.02] active:scale-95"}`}>
                                  <item.icon className="h-4 w-4 shrink-0 transition-transform duration-300 group-hover:scale-110" />
                                  <span className="transition-all duration-300">{item.title}</span>
                                </button>
                              </SidebarMenuSubButton>
                            </SidebarMenuSubItem>
                          ))}
                        </SidebarMenuSub>
                      </CollapsibleContent>
                    )}
                  </SidebarMenuItem>
                </Collapsible>

                {/* Karriere Menu */}
                <Collapsible open={careerOpen} onOpenChange={setCareerOpen}>
                  <SidebarMenuItem>
                    <CollapsibleTrigger asChild>
                      <SidebarMenuButton tooltip={collapsed ? "Karriere" : undefined} className={`flex items-center w-full ${collapsed ? 'justify-center h-12 w-12 mx-auto' : 'justify-between px-3 h-10'} rounded-2xl transition-all duration-300 hover:bg-gradient-to-r hover:from-sidebar-accent/50 hover:to-sidebar-accent/30 hover:shadow-soft hover:scale-[1.02] active:scale-95`}>
                        <div className="flex items-center gap-3">
                          <Briefcase className="h-5 w-5 shrink-0 transition-transform duration-300 group-hover:scale-110" />
                          {!collapsed && <span className="transition-all duration-300">Karriere</span>}
                        </div>
                        {!collapsed && (careerOpen ? <ChevronDown className="h-4 w-4 shrink-0 transition-transform duration-300" /> : <ChevronRight className="h-4 w-4 shrink-0 transition-transform duration-300" />)}
                      </SidebarMenuButton>
                    </CollapsibleTrigger>
                    {!collapsed && (
                      <CollapsibleContent>
                        <SidebarMenuSub>
                          {careerItems.map(item => (
                            <SidebarMenuSubItem key={item.title}>
                              <SidebarMenuSubButton asChild>
                                <button onClick={() => handleNavigation(item.url)} className={`flex items-center gap-3 w-full pl-9 pr-3 h-9 rounded-2xl transition-all duration-300 ${isActive(item.url) ? "bg-gradient-to-r from-sidebar-accent/60 to-sidebar-accent/30 text-sidebar-accent-foreground shadow-soft" : "text-sidebar-foreground hover:bg-gradient-to-r hover:from-sidebar-accent/70 hover:to-sidebar-accent/40 hover:text-sidebar-accent-foreground hover:shadow-soft hover:scale-[1.02] active:scale-95"}`}>
                                  <item.icon className="h-4 w-4 shrink-0 transition-transform duration-300 group-hover:scale-110" />
                                  <span className="transition-all duration-300">{item.title}</span>
                                </button>
                              </SidebarMenuSubButton>
                            </SidebarMenuSubItem>
                          ))}
                        </SidebarMenuSub>
                      </CollapsibleContent>
                    )}
                  </SidebarMenuItem>
                </Collapsible>

                {/* Remaining navigation items */}
                {navigationItems.slice(2).map(item => (
                  <SidebarMenuItem key={item.title}>
                    <SidebarMenuButton asChild tooltip={collapsed ? item.title : undefined}>
                      <button onClick={() => handleNavigation(item.url)} className={`flex items-center w-full ${collapsed ? 'justify-center h-12 w-12 mx-auto' : 'justify-between px-3 h-10'} rounded-2xl transition-all duration-300 ${isActive(item.url) ? "bg-gradient-to-r from-sidebar-accent/80 to-sidebar-accent/40 text-sidebar-accent-foreground shadow-soft-lg border border-sidebar-border/20" : "text-sidebar-foreground hover:bg-gradient-to-r hover:from-sidebar-accent hover:to-sidebar-accent/60 hover:text-sidebar-accent-foreground hover:shadow-soft hover:scale-[1.02] active:scale-95"}`}>
                        <div className="flex items-center gap-3">
                          <item.icon className="h-5 w-5 shrink-0 transition-transform duration-300 group-hover:scale-110" />
                          {!collapsed && <span className="transition-all duration-300">{item.title}</span>}
                        </div>
                        {!collapsed && isActive(item.url) && <ChevronRight className="h-4 w-4 shrink-0 transition-transform duration-300" />}
                      </button>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                ))}
              </SidebarMenu>
            </SidebarGroupContent>
          </SidebarGroup>
        </SidebarContent>

        {/* Footer with Avatar, Plus Button, and Logout */}
        <SidebarFooter className="mt-auto p-2 border-t border-sidebar-border/30 space-y-2 bg-gradient-to-r from-sidebar to-sidebar/80">
          {!collapsed && (
            <>
              <div className="flex items-center gap-3 px-3 py-2 rounded-2xl transition-all duration-300 hover:bg-sidebar-accent/30 hover:shadow-soft">
                <Avatar className="h-12 w-12 shrink-0 ring-2 ring-sidebar-border/20 transition-all duration-300 hover:ring-primary/40">
                  <AvatarImage src={profile?.avatar_url || undefined} />
                  <AvatarFallback className="bg-gradient-to-br from-sidebar-accent to-sidebar-accent/60 text-sidebar-accent-foreground">
                    {profile?.vorname?.[0]}{profile?.nachname?.[0]}
                  </AvatarFallback>
                </Avatar>
                <div className="flex flex-col items-start overflow-hidden">
                  <span className="text-sm font-medium truncate transition-colors duration-300">{nameInfo.name}</span>
                  {nameInfo.job && <span className="text-xs text-muted-foreground truncate transition-colors duration-300">{nameInfo.job}</span>}
                </div>
              </div>

              <SidebarMenuButton asChild>
                <button 
                  onClick={() => openPostComposer()} 
                  className="flex items-center justify-center gap-2 w-full px-4 h-12 rounded-2xl bg-gradient-to-r from-primary to-primary/90 hover:from-primary/90 hover:to-primary/80 text-primary-foreground shadow-soft hover:shadow-soft-lg transition-all duration-300 hover:scale-[1.02] active:scale-95 group"
                >
                  <Plus className="h-5 w-5 shrink-0 transition-transform duration-300 group-hover:rotate-90" />
                  <span className="font-medium">Beitrag posten</span>
                </button>
              </SidebarMenuButton>

              <SidebarMenuButton asChild>
                <button 
                  onClick={handleSignOut}
                  className="flex items-center gap-3 w-full px-3 h-10 rounded-2xl hover:bg-gradient-to-r hover:from-sidebar-accent/80 hover:to-sidebar-accent/50 hover:shadow-soft transition-all duration-300 text-sidebar-foreground hover:scale-[1.02] active:scale-95 group"
                >
                  <LogOut className="h-5 w-5 shrink-0 transition-transform duration-300 group-hover:-rotate-12" />
                  <span>Abmelden</span>
                </button>
              </SidebarMenuButton>
            </>
          )}

          {collapsed && (
            <>
              <SidebarMenuButton asChild tooltip={nameInfo.name}>
                <button onClick={() => handleNavigation('/profile')} className="flex items-center justify-center h-12 w-12 mx-auto transition-all duration-300 hover:scale-110 active:scale-95">
                  <Avatar className="h-10 w-10 ring-2 ring-sidebar-border/20 transition-all duration-300 hover:ring-primary/40">
                    <AvatarImage src={profile?.avatar_url || undefined} />
                    <AvatarFallback className="bg-gradient-to-br from-sidebar-accent to-sidebar-accent/60 text-sidebar-accent-foreground">
                      {profile?.vorname?.[0]}{profile?.nachname?.[0]}
                    </AvatarFallback>
                  </Avatar>
                </button>
              </SidebarMenuButton>

              <SidebarMenuButton asChild tooltip="Beitrag posten">
                <button 
                  onClick={() => openPostComposer()} 
                  className="flex items-center justify-center h-12 w-12 mx-auto rounded-2xl bg-gradient-to-r from-primary to-primary/90 hover:from-primary/90 hover:to-primary/80 text-primary-foreground shadow-soft hover:shadow-soft-lg transition-all duration-300 hover:scale-110 active:scale-95 group"
                >
                  <Plus className="h-5 w-5 transition-transform duration-300 group-hover:rotate-90" />
                </button>
              </SidebarMenuButton>

              <SidebarMenuButton asChild tooltip="Abmelden">
                <button 
                  onClick={handleSignOut}
                  className="flex items-center justify-center h-12 w-12 mx-auto rounded-2xl hover:bg-gradient-to-r hover:from-sidebar-accent/80 hover:to-sidebar-accent/50 hover:shadow-soft transition-all duration-300 hover:scale-110 active:scale-95 group"
                >
                  <LogOut className="h-5 w-5 transition-transform duration-300 group-hover:-rotate-12" />
                </button>
              </SidebarMenuButton>
            </>
          )}
        </SidebarFooter>
      </Sidebar>
    </>
  );
}