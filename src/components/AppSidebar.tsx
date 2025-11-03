import { useState, useEffect } from "react";
import { NavLink, useLocation, useNavigate } from "react-router-dom";
import { LayoutDashboard, User, Users, Settings, FileText, LogOut, ChevronRight, ChevronDown, Plus, MessageSquare, Briefcase, Building2, Search as SearchIcon, Sparkles, UserPlus, Mail, UsersRound, Menu, X } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Sidebar, SidebarContent, SidebarGroup, SidebarGroupContent, SidebarGroupLabel, SidebarMenu, SidebarMenuButton, SidebarMenuItem, SidebarMenuSub, SidebarMenuSubItem, SidebarMenuSubButton, SidebarHeader, SidebarFooter, SidebarTrigger, useSidebar } from "@/components/ui/sidebar";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { supabase } from "@/integrations/supabase/client";
import { useQuery } from "@tanstack/react-query";
import { openPostComposer } from "@/lib/event-bus";
import { formatNameWithJob } from "@/utils/profileUtils";
import { cn } from "@/lib/utils";

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
  { title: "Jobsuche", url: "/jobs", icon: SearchIcon },
  { title: "Meine Karriere", url: "/meine-karriere", icon: Briefcase },
  { title: "Unternehmen", url: "/companies", icon: Building2 }
];
export function AppSidebar() {
  const sidebar = useSidebar();
  const collapsed = sidebar.state === "collapsed";
  const location = useLocation();
  const navigate = useNavigate();
  const currentPath = location.pathname;
  const [sidebarSearch, setSidebarSearch] = useState("");
  
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
          className="fixed inset-0 bg-gradient-to-b from-black/60 to-black/40 backdrop-blur-md z-[490] lg:hidden" 
          onClick={() => sidebar.setOpenMobile(false)} 
        />
      )}
      
      <Sidebar 
        className={cn(
          // Desktop: Normal sidebar behavior (left-aligned)
          "hidden lg:flex lg:fixed lg:left-0 lg:z-[400]",
          "lg:top-14 lg:h-[calc(100vh-3.5rem)]", // Start below TopNavBar
          collapsed ? "lg:w-16" : "lg:w-64",
          // Mobile: Fullscreen overlay (above bottom nav)
          sidebar.isMobile && sidebar.open && "!flex fixed inset-0 w-full h-full z-[500]"
        )}
        collapsible="icon" 
        data-sidebar="sidebar"
      >
        {/* Mobile Header mit Suchleiste */}
        {sidebar.isMobile && sidebar.open && (
          <div className="p-4 border-b lg:hidden space-y-3">
            <div className="flex justify-between items-center">
              <h2 className="text-lg font-semibold">Menü</h2>
              <button 
                onClick={() => sidebar.setOpenMobile(false)}
                className="p-2 hover:bg-sidebar-accent/80 rounded-xl transition-colors"
                aria-label="Schließen"
              >
                <X className="h-5 w-5" />
              </button>
            </div>
            
            {/* Mobile Search in Sidebar */}
            <div className="relative">
              <SearchIcon className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                value={sidebarSearch}
                onChange={(e) => setSidebarSearch(e.target.value)}
                placeholder="Suchen..."
                className="pl-9 h-10"
                onKeyDown={(e) => {
                  if (e.key === 'Enter' && sidebarSearch.trim()) {
                    navigate(`/marketplace?q=${encodeURIComponent(sidebarSearch)}`);
                    sidebar.setOpenMobile(false);
                    setSidebarSearch("");
                  }
                }}
              />
            </div>
          </div>
        )}

        {/* Trigger Button at the top - only on desktop */}
        <SidebarHeader className="hidden lg:flex h-14 border-b items-center justify-center px-2">
          <SidebarTrigger className="h-8 w-8" />
        </SidebarHeader>

        <SidebarContent>
          <SidebarGroup>
            {sidebar.isMobile && <SidebarGroupLabel>Hauptnavigation</SidebarGroupLabel>}
            <SidebarGroupContent>
              <SidebarMenu>
                {navigationItems.slice(0, 2).map(item => (
                  <SidebarMenuItem key={item.title}>
                    <SidebarMenuButton asChild tooltip={collapsed && !sidebar.isMobile ? item.title : undefined}>
                      <button onClick={() => handleNavigation(item.url)} className={cn(
                        "flex w-full rounded-xl transition-all",
                        sidebar.isMobile ? "items-center justify-between px-3 h-12" : (collapsed ? 'flex-col items-center justify-center h-14 w-12 mx-auto gap-1' : 'items-center justify-between px-3 h-10'),
                        isActive(item.url) ? "bg-sidebar-accent/60 text-sidebar-accent-foreground shadow-soft" : "text-sidebar-foreground hover:bg-sidebar-accent/80 hover:text-sidebar-accent-foreground hover:shadow-soft"
                      )}>
                        <div className={cn(
                          "flex items-center gap-3",
                          collapsed && !sidebar.isMobile && "flex-col gap-1"
                        )}>
                          <item.icon className="h-5 w-5 shrink-0" />
                          <span className={cn(collapsed && !sidebar.isMobile && "text-[10px] leading-tight text-center")}>
                            {item.title}
                          </span>
                        </div>
                        {!collapsed && isActive(item.url) && <ChevronRight className="h-4 w-4 shrink-0" />}
                      </button>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                ))}

                {/* Community Section */}
                {sidebar.isMobile && <SidebarGroupLabel className="mt-4">Community</SidebarGroupLabel>}
                
                <Collapsible 
                  open={sidebar.isMobile ? communityOpen : (collapsed ? false : communityOpen)} 
                  onOpenChange={setCommunityOpen}
                >
                  <SidebarMenuItem>
                    <CollapsibleTrigger asChild>
                      <SidebarMenuButton 
                        tooltip={collapsed && !sidebar.isMobile ? "Community" : undefined} 
                        className={cn(
                          "flex w-full rounded-xl transition-all hover:bg-sidebar-accent/80 hover:shadow-soft",
                          sidebar.isMobile ? "items-center justify-between px-3 h-12" : (collapsed ? 'flex-col items-center justify-center h-14 w-12 mx-auto gap-1' : 'items-center justify-between px-3 h-10')
                        )}
                      >
                        <div className={cn(
                          "flex items-center gap-3",
                          collapsed && !sidebar.isMobile && "flex-col gap-1"
                        )}>
                          <Users className="h-5 w-5 shrink-0" />
                          <span className={cn(collapsed && !sidebar.isMobile && "text-[10px] leading-tight text-center")}>
                            Community
                          </span>
                        </div>
                        {!collapsed && (communityOpen ? <ChevronDown className="h-4 w-4 shrink-0" /> : <ChevronRight className="h-4 w-4 shrink-0" />)}
                      </SidebarMenuButton>
                    </CollapsibleTrigger>
                    {(sidebar.isMobile || !collapsed) && (
                      <CollapsibleContent>
                        <SidebarMenuSub>
                          {communityItems.map(item => (
                            <SidebarMenuSubItem key={item.title}>
                              <SidebarMenuSubButton asChild>
                                <button onClick={() => handleNavigation(item.url)} className={`flex items-center gap-3 w-full pl-9 pr-3 h-9 rounded-xl transition-all ${isActive(item.url) ? "bg-sidebar-accent/60 text-sidebar-accent-foreground shadow-soft" : "text-sidebar-foreground hover:bg-sidebar-accent/80 hover:text-sidebar-accent-foreground hover:shadow-soft"}`}>
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

                {/* Karriere Section */}
                {sidebar.isMobile && <SidebarGroupLabel className="mt-4">Karriere</SidebarGroupLabel>}
                
                <Collapsible 
                  open={sidebar.isMobile ? careerOpen : (collapsed ? false : careerOpen)} 
                  onOpenChange={setCareerOpen}
                >
                  <SidebarMenuItem>
                    <CollapsibleTrigger asChild>
                      <SidebarMenuButton 
                        tooltip={collapsed && !sidebar.isMobile ? "Karriere" : undefined} 
                        className={cn(
                          "flex w-full rounded-xl transition-all hover:bg-sidebar-accent/80 hover:shadow-soft",
                          sidebar.isMobile ? "items-center justify-between px-3 h-12" : (collapsed ? 'flex-col items-center justify-center h-14 w-12 mx-auto gap-1' : 'items-center justify-between px-3 h-10')
                        )}
                      >
                        <div className={cn(
                          "flex items-center gap-3",
                          collapsed && !sidebar.isMobile && "flex-col gap-1"
                        )}>
                          <Briefcase className="h-5 w-5 shrink-0" />
                          <span className={cn(collapsed && !sidebar.isMobile && "text-[10px] leading-tight text-center")}>
                            Karriere
                          </span>
                        </div>
                        {!collapsed && (careerOpen ? <ChevronDown className="h-4 w-4 shrink-0" /> : <ChevronRight className="h-4 w-4 shrink-0" />)}
                      </SidebarMenuButton>
                    </CollapsibleTrigger>
                    {(sidebar.isMobile || !collapsed) && (
                      <CollapsibleContent>
                        <SidebarMenuSub>
                          {careerItems.map(item => (
                            <SidebarMenuSubItem key={item.title}>
                              <SidebarMenuSubButton asChild>
                                <button onClick={() => handleNavigation(item.url)} className={`flex items-center gap-3 w-full pl-9 pr-3 h-9 rounded-xl transition-all ${isActive(item.url) ? "bg-sidebar-accent/60 text-sidebar-accent-foreground shadow-soft" : "text-sidebar-foreground hover:bg-sidebar-accent/80 hover:text-sidebar-accent-foreground hover:shadow-soft"}`}>
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
                    <SidebarMenuButton asChild tooltip={collapsed && !sidebar.isMobile ? item.title : undefined}>
                      <button onClick={() => handleNavigation(item.url)} className={cn(
                        "flex w-full rounded-xl transition-all",
                        sidebar.isMobile ? "items-center justify-between px-3 h-12" : (collapsed ? 'flex-col items-center justify-center h-14 w-12 mx-auto gap-1' : 'items-center justify-between px-3 h-10'),
                        isActive(item.url) ? "bg-sidebar-accent/60 text-sidebar-accent-foreground shadow-soft" : "text-sidebar-foreground hover:bg-sidebar-accent/80 hover:text-sidebar-accent-foreground hover:shadow-soft"
                      )}>
                        <div className={cn(
                          "flex items-center gap-3",
                          collapsed && !sidebar.isMobile && "flex-col gap-1"
                        )}>
                          <item.icon className="h-5 w-5 shrink-0" />
                          <span className={cn(collapsed && !sidebar.isMobile && "text-[10px] leading-tight text-center")}>
                            {item.title}
                          </span>
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
              <button 
                onClick={() => handleNavigation('/profile')}
                className="flex items-center gap-3 px-3 py-2 w-full hover:bg-sidebar-accent/80 rounded-xl transition-colors"
              >
                <Avatar className="h-12 w-12 shrink-0 ring-2 ring-primary/20">
                  <AvatarImage src={profile?.avatar_url || undefined} />
                  <AvatarFallback>
                    {profile?.vorname?.[0]}{profile?.nachname?.[0]}
                  </AvatarFallback>
                </Avatar>
                <div className="flex flex-col items-start overflow-hidden">
                  <span className="text-sm font-medium truncate">{nameInfo.name}</span>
                  {nameInfo.job && <span className="text-xs text-muted-foreground truncate">{nameInfo.job}</span>}
                </div>
              </button>

              <SidebarMenuButton asChild>
                <button 
                  onClick={() => openPostComposer()} 
                  className="flex items-center justify-center gap-2 w-full px-4 h-12 rounded-2xl bg-foreground text-background hover:bg-foreground/90 shadow-soft transition-all"
                >
                  <Plus className="h-5 w-5 shrink-0" />
                  <span className="font-medium">Beitrag posten</span>
                </button>
              </SidebarMenuButton>

              <SidebarMenuButton asChild>
                <button 
                  onClick={handleSignOut}
                  className="flex items-center gap-3 w-full px-3 h-10 rounded-xl hover:bg-sidebar-accent/80 hover:shadow-soft transition-all text-sidebar-foreground"
                >
                  <LogOut className="h-5 w-5 shrink-0" />
                  <span>Abmelden</span>
                </button>
              </SidebarMenuButton>
            </>
          )}

          {collapsed && (
            <>
              <button 
                onClick={() => handleNavigation('/profile')} 
                className="flex items-center gap-2 w-full px-2 py-2 hover:bg-sidebar-accent/80 rounded-xl transition-colors"
              >
                <Avatar className="h-10 w-10 shrink-0 ring-2 ring-primary/20">
                  <AvatarImage src={profile?.avatar_url || undefined} />
                  <AvatarFallback>
                    {profile?.vorname?.[0]}{profile?.nachname?.[0]}
                  </AvatarFallback>
                </Avatar>
                <div className="flex flex-col items-start overflow-hidden min-w-0">
                  <div className="text-xs font-medium leading-tight truncate w-full">
                    {nameInfo.name}
                  </div>
                  {nameInfo.job && (
                    <div className="text-[10px] text-muted-foreground leading-tight truncate w-full">
                      {nameInfo.job}
                    </div>
                  )}
                </div>
              </button>

              <SidebarMenuButton asChild tooltip="Beitrag posten">
                <button 
                  onClick={() => openPostComposer()} 
                  className="flex flex-col items-center justify-center gap-1 h-14 w-12 mx-auto rounded-xl bg-foreground text-background hover:bg-foreground/90 transition-all"
                >
                  <Plus className="h-5 w-5 shrink-0" />
                  <span className="text-[10px] leading-tight text-center">Posten</span>
                </button>
              </SidebarMenuButton>

              <SidebarMenuButton asChild tooltip="Abmelden">
                <button 
                  onClick={handleSignOut}
                  className="flex flex-col items-center justify-center gap-1 h-14 w-12 mx-auto rounded-xl hover:bg-sidebar-accent/80 hover:shadow-soft transition-all"
                >
                  <LogOut className="h-5 w-5 shrink-0" />
                  <span className="text-[10px] leading-tight text-center">Abmelden</span>
                </button>
              </SidebarMenuButton>
            </>
          )}
        </SidebarFooter>
      </Sidebar>
    </>
  );
}