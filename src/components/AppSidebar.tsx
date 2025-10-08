import { useState, useEffect } from "react";
import { NavLink, useLocation, useNavigate } from "react-router-dom";
import { LayoutDashboard, User, Users, Settings, FileText, LogOut, ChevronRight, ChevronDown, Plus, MessageSquare, Briefcase, Building2, Search, Sparkles, UserPlus, Mail, UsersRound } from "lucide-react";
import { Sidebar, SidebarContent, SidebarGroup, SidebarGroupContent, SidebarGroupLabel, SidebarMenu, SidebarMenuButton, SidebarMenuItem, SidebarMenuSub, SidebarMenuSubItem, SidebarMenuSubButton, SidebarHeader, SidebarFooter, useSidebar } from "@/components/ui/sidebar";
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
  const {
    state,
    setOpen
  } = useSidebar();
  const collapsed = state === "collapsed";
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

  // Auto-close sidebar on navigation
  const handleNavigation = (to: string) => {
    navigate(to);
    setOpen(false);
  };

  // Handle clicks outside sidebar to close it
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      const sidebar = document.querySelector('[data-sidebar="sidebar"]');
      const trigger = document.querySelector('[data-sidebar="trigger"]');
      if (sidebar && !sidebar.contains(event.target as Node) && trigger && !trigger.contains(event.target as Node)) {
        setOpen(false);
      }
    };
    if (!collapsed) {
      document.addEventListener('mousedown', handleClickOutside);
      return () => document.removeEventListener('mousedown', handleClickOutside);
    }
  }, [collapsed, setOpen]);
  return <>
      {/* Backdrop overlay */}
      {!collapsed && <div className="fixed inset-0 bg-black/20 z-40 lg:hidden" onClick={() => setOpen(false)} />}
      
      <Sidebar className={`fixed left-0 top-14 h-[calc(100vh-3.5rem)] z-50 transition-transform duration-200 ${collapsed ? '-translate-x-full lg:translate-x-0' : 'translate-x-0'} ${collapsed ? "w-14 lg:w-14" : "w-60"}`} collapsible="icon" data-sidebar="sidebar">
      

      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupLabel className={collapsed ? "sr-only" : ""}>
            Navigation
          </SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {navigationItems.slice(0, 2).map(item => (
                <SidebarMenuItem key={item.title}>
                  <SidebarMenuButton asChild>
                    <button onClick={() => handleNavigation(item.url)} className={`flex ${collapsed ? 'flex-col items-center gap-0.5 py-3' : 'items-center gap-3 py-2'} rounded-lg px-3 transition-all w-full ${collapsed ? 'text-center' : 'text-left'} ${isActive(item.url) ? "bg-sidebar-accent text-sidebar-accent-foreground" : "text-sidebar-foreground hover:bg-sidebar-accent hover:text-sidebar-accent-foreground"}`}>
                      <item.icon className="h-4 w-4 flex-shrink-0" />
                      <span className={collapsed ? "text-[9px] font-medium leading-tight" : ""}>{item.title}</span>
                      {!collapsed && isActive(item.url) && <ChevronRight className="ml-auto h-4 w-4" />}
                    </button>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}

              {/* Community Menu with Submenu */}
              <Collapsible open={communityOpen} onOpenChange={setCommunityOpen} className="group/collapsible">
                <SidebarMenuItem>
                  <CollapsibleTrigger asChild>
                    <SidebarMenuButton className={`flex ${collapsed ? 'flex-col items-center gap-0.5 py-3' : 'items-center gap-3 py-2'} rounded-lg px-3 transition-all w-full ${collapsed ? 'text-center' : 'text-left'}`}>
                      <Users className="h-4 w-4 flex-shrink-0" />
                      <span className={collapsed ? "text-[9px] font-medium leading-tight" : ""}>Community</span>
                      {!collapsed && <ChevronDown className={`ml-auto h-4 w-4 transition-transform ${communityOpen ? 'rotate-180' : ''}`} />}
                    </SidebarMenuButton>
                  </CollapsibleTrigger>
                  {!collapsed && (
                    <CollapsibleContent>
                      <SidebarMenuSub>
                        {communityItems.map(item => (
                          <SidebarMenuSubItem key={item.title}>
                            <SidebarMenuSubButton asChild>
                              <button onClick={() => handleNavigation(item.url)} className={`flex items-center gap-3 py-2 rounded-lg px-3 transition-all w-full text-left ${isActive(item.url) ? "bg-sidebar-accent text-sidebar-accent-foreground" : "text-sidebar-foreground hover:bg-sidebar-accent hover:text-sidebar-accent-foreground"}`}>
                                <item.icon className="h-4 w-4 flex-shrink-0" />
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

              {/* Karriere Menu with Submenu */}
              <Collapsible open={careerOpen} onOpenChange={setCareerOpen} className="group/collapsible">
                <SidebarMenuItem>
                  <CollapsibleTrigger asChild>
                    <SidebarMenuButton className={`flex ${collapsed ? 'flex-col items-center gap-0.5 py-3' : 'items-center gap-3 py-2'} rounded-lg px-3 transition-all w-full ${collapsed ? 'text-center' : 'text-left'}`}>
                      <Briefcase className="h-4 w-4 flex-shrink-0" />
                      <span className={collapsed ? "text-[9px] font-medium leading-tight" : ""}>Karriere</span>
                      {!collapsed && <ChevronDown className={`ml-auto h-4 w-4 transition-transform ${careerOpen ? 'rotate-180' : ''}`} />}
                    </SidebarMenuButton>
                  </CollapsibleTrigger>
                  {!collapsed && (
                    <CollapsibleContent>
                      <SidebarMenuSub>
                        {careerItems.map(item => (
                          <SidebarMenuSubItem key={item.title}>
                            <SidebarMenuSubButton asChild>
                              <button onClick={() => handleNavigation(item.url)} className={`flex items-center gap-3 py-2 rounded-lg px-3 transition-all w-full text-left ${isActive(item.url) ? "bg-sidebar-accent text-sidebar-accent-foreground" : "text-sidebar-foreground hover:bg-sidebar-accent hover:text-sidebar-accent-foreground"}`}>
                                <item.icon className="h-4 w-4 flex-shrink-0" />
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
                  <SidebarMenuButton asChild>
                    <button onClick={() => handleNavigation(item.url)} className={`flex ${collapsed ? 'flex-col items-center gap-0.5 py-3' : 'items-center gap-3 py-2'} rounded-lg px-3 transition-all w-full ${collapsed ? 'text-center' : 'text-left'} ${isActive(item.url) ? "bg-sidebar-accent text-sidebar-accent-foreground" : "text-sidebar-foreground hover:bg-sidebar-accent hover:text-sidebar-accent-foreground"}`}>
                      <item.icon className="h-4 w-4 flex-shrink-0" />
                      <span className={collapsed ? "text-[9px] font-medium leading-tight" : ""}>{item.title}</span>
                      {!collapsed && isActive(item.url) && <ChevronRight className="ml-auto h-4 w-4" />}
                    </button>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>

      <SidebarFooter className="mt-auto p-4">
        {!collapsed ? <div className="space-y-3">
            <div className="flex items-center gap-3">
              <Avatar className="h-10 w-10">
                <AvatarImage src={profile?.avatar_url || undefined} />
                <AvatarFallback>
                  {profile?.vorname?.[0]}{profile?.nachname?.[0]}
                </AvatarFallback>
              </Avatar>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium truncate">{nameInfo.name}</p>
                <p className="text-xs text-muted-foreground truncate">{nameInfo.job}</p>
              </div>
            </div>
            <Button onClick={() => openPostComposer()} className="w-full justify-start gap-3" variant="default">
              <Plus className="h-4 w-4" />
              Beitrag posten
            </Button>
            <Button variant="ghost" className="w-full justify-start gap-3" onClick={handleSignOut}>
              <LogOut className="h-4 w-4" />
              Abmelden
            </Button>
          </div> : <div className="flex flex-col items-center gap-3">
            <Avatar className="h-8 w-8">
              <AvatarImage src={profile?.avatar_url || undefined} />
              <AvatarFallback className="text-xs">
                {profile?.vorname?.[0]}{profile?.nachname?.[0]}
              </AvatarFallback>
            </Avatar>
            <Button variant="default" size="icon" className="h-9 w-9" onClick={() => openPostComposer()} title="Beitrag posten">
              <Plus className="h-4 w-4" />
            </Button>
            <Button variant="ghost" size="icon" className="h-9 w-9" onClick={handleSignOut} title="Abmelden">
              <LogOut className="h-4 w-4" />
            </Button>
          </div>}
      </SidebarFooter>
    </Sidebar>
    </>;
}