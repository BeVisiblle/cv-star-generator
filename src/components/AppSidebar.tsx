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
  { title: "Stellenanzeigen", url: "/job-listings", icon: FileText },
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
          className="fixed inset-0 bg-black/20 z-[390] lg:hidden" 
          onClick={() => sidebar.setOpenMobile(false)} 
        />
      )}
      
      <Sidebar 
        className={`fixed left-0 top-0 h-screen z-[400] ${collapsed ? 'w-16' : 'w-64'}`}
        collapsible="icon" 
        data-sidebar="sidebar"
      >
        {/* Trigger Button at the top */}
        <SidebarHeader className="h-14 border-b flex items-center justify-center px-2">
          <SidebarTrigger className="h-8 w-8" />
        </SidebarHeader>

        <SidebarContent>
          <SidebarGroup>
            <SidebarGroupContent>
              <SidebarMenu>
                {navigationItems.slice(0, 2).map(item => (
                  <SidebarMenuItem key={item.title}>
                    <SidebarMenuButton asChild tooltip={collapsed ? item.title : undefined}>
                      <button onClick={() => handleNavigation(item.url)} className={`flex items-center w-full ${collapsed ? 'justify-center h-12 w-12 mx-auto' : 'justify-between px-3 h-10'} rounded-lg transition-all ${isActive(item.url) ? "bg-sidebar-accent text-sidebar-accent-foreground" : "text-sidebar-foreground hover:bg-sidebar-accent hover:text-sidebar-accent-foreground"}`}>
                        <div className="flex items-center gap-3">
                          <item.icon className="h-5 w-5 shrink-0" />
                          {!collapsed && <span>{item.title}</span>}
                        </div>
                        {!collapsed && isActive(item.url) && <ChevronRight className="h-4 w-4 shrink-0" />}
                      </button>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                ))}

                {/* Community Menu */}
                <Collapsible open={communityOpen} onOpenChange={setCommunityOpen}>
                  <SidebarMenuItem>
                    <CollapsibleTrigger asChild>
                      <SidebarMenuButton tooltip={collapsed ? "Community" : undefined} className={`flex items-center w-full ${collapsed ? 'justify-center h-12 w-12 mx-auto' : 'justify-between px-3 h-10'} rounded-lg transition-all`}>
                        <div className="flex items-center gap-3">
                          <Users className="h-5 w-5 shrink-0" />
                          {!collapsed && <span>Community</span>}
                        </div>
                        {!collapsed && (communityOpen ? <ChevronDown className="h-4 w-4 shrink-0" /> : <ChevronRight className="h-4 w-4 shrink-0" />)}
                      </SidebarMenuButton>
                    </CollapsibleTrigger>
                    {!collapsed && (
                      <CollapsibleContent>
                        <SidebarMenuSub>
                          {communityItems.map(item => (
                            <SidebarMenuSubItem key={item.title}>
                              <SidebarMenuSubButton asChild>
                                <button onClick={() => handleNavigation(item.url)} className={`flex items-center gap-3 w-full pl-9 pr-3 h-9 rounded-lg transition-all ${isActive(item.url) ? "bg-sidebar-accent text-sidebar-accent-foreground" : "text-sidebar-foreground hover:bg-sidebar-accent hover:text-sidebar-accent-foreground"}`}>
                                  <item.icon className="h-4 w-4 shrink-0" />
                                  <span>{item.title}</span>
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
                      <SidebarMenuButton tooltip={collapsed ? "Karriere" : undefined} className={`flex items-center w-full ${collapsed ? 'justify-center h-12 w-12 mx-auto' : 'justify-between px-3 h-10'} rounded-lg transition-all`}>
                        <div className="flex items-center gap-3">
                          <Briefcase className="h-5 w-5 shrink-0" />
                          {!collapsed && <span>Karriere</span>}
                        </div>
                        {!collapsed && (careerOpen ? <ChevronDown className="h-4 w-4 shrink-0" /> : <ChevronRight className="h-4 w-4 shrink-0" />)}
                      </SidebarMenuButton>
                    </CollapsibleTrigger>
                    {!collapsed && (
                      <CollapsibleContent>
                        <SidebarMenuSub>
                          {careerItems.map(item => (
                            <SidebarMenuSubItem key={item.title}>
                              <SidebarMenuSubButton asChild>
                                <button onClick={() => handleNavigation(item.url)} className={`flex items-center gap-3 w-full pl-9 pr-3 h-9 rounded-lg transition-all ${isActive(item.url) ? "bg-sidebar-accent text-sidebar-accent-foreground" : "text-sidebar-foreground hover:bg-sidebar-accent hover:text-sidebar-accent-foreground"}`}>
                                  <item.icon className="h-4 w-4 shrink-0" />
                                  <span>{item.title}</span>
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
                      <button onClick={() => handleNavigation(item.url)} className={`flex items-center w-full ${collapsed ? 'justify-center h-12 w-12 mx-auto' : 'justify-between px-3 h-10'} rounded-lg transition-all ${isActive(item.url) ? "bg-sidebar-accent text-sidebar-accent-foreground" : "text-sidebar-foreground hover:bg-sidebar-accent hover:text-sidebar-accent-foreground"}`}>
                        <div className="flex items-center gap-3">
                          <item.icon className="h-5 w-5 shrink-0" />
                          {!collapsed && <span>{item.title}</span>}
                        </div>
                        {!collapsed && isActive(item.url) && <ChevronRight className="h-4 w-4 shrink-0" />}
                      </button>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                ))}
              </SidebarMenu>
            </SidebarGroupContent>
          </SidebarGroup>
        </SidebarContent>

        {/* Footer with Avatar, Plus Button, and Logout */}
        <SidebarFooter className="mt-auto p-2 border-t space-y-2">
          {!collapsed && (
            <>
              <div className="flex items-center gap-3 px-3 py-2">
                <Avatar className="h-12 w-12 shrink-0">
                  <AvatarImage src={profile?.avatar_url || undefined} />
                  <AvatarFallback>
                    {profile?.vorname?.[0]}{profile?.nachname?.[0]}
                  </AvatarFallback>
                </Avatar>
                <div className="flex flex-col items-start overflow-hidden">
                  <span className="text-sm font-medium truncate">{nameInfo.name}</span>
                  {nameInfo.job && <span className="text-xs text-muted-foreground truncate">{nameInfo.job}</span>}
                </div>
              </div>

              <SidebarMenuButton asChild>
                <button 
                  onClick={() => openPostComposer()} 
                  className="flex items-center justify-center gap-2 w-full px-4 h-12 rounded-lg bg-foreground text-background hover:bg-foreground/90 transition-all"
                >
                  <Plus className="h-5 w-5 shrink-0" />
                  <span className="font-medium">Beitrag posten</span>
                </button>
              </SidebarMenuButton>

              <SidebarMenuButton asChild>
                <button 
                  onClick={handleSignOut}
                  className="flex items-center gap-3 w-full px-3 h-10 rounded-lg hover:bg-sidebar-accent transition-all text-sidebar-foreground"
                >
                  <LogOut className="h-5 w-5 shrink-0" />
                  <span>Abmelden</span>
                </button>
              </SidebarMenuButton>
            </>
          )}

          {collapsed && (
            <>
              <SidebarMenuButton asChild tooltip={nameInfo.name}>
                <button onClick={() => handleNavigation('/profile')} className="flex items-center justify-center h-12 w-12 mx-auto">
                  <Avatar className="h-10 w-10">
                    <AvatarImage src={profile?.avatar_url || undefined} />
                    <AvatarFallback>
                      {profile?.vorname?.[0]}{profile?.nachname?.[0]}
                    </AvatarFallback>
                  </Avatar>
                </button>
              </SidebarMenuButton>

              <SidebarMenuButton asChild tooltip="Beitrag posten">
                <button 
                  onClick={() => openPostComposer()} 
                  className="flex items-center justify-center h-12 w-12 mx-auto rounded-full bg-foreground text-background hover:bg-foreground/90 transition-all"
                >
                  <Plus className="h-5 w-5" />
                </button>
              </SidebarMenuButton>

              <SidebarMenuButton asChild tooltip="Abmelden">
                <button 
                  onClick={handleSignOut}
                  className="flex items-center justify-center h-12 w-12 mx-auto rounded-lg hover:bg-sidebar-accent transition-all"
                >
                  <LogOut className="h-5 w-5" />
                </button>
              </SidebarMenuButton>
            </>
          )}
        </SidebarFooter>
      </Sidebar>
    </>
  );
}