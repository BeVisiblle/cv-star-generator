import { useState, useEffect } from "react";
import { NavLink, useLocation, useNavigate } from "react-router-dom";
import { LayoutDashboard, User, Users, Settings, FileText, LogOut, ChevronRight, Plus, MessageSquare, Briefcase, Building2, Search, Sparkles } from "lucide-react";
import { Sidebar, SidebarContent, SidebarGroup, SidebarGroupContent, SidebarGroupLabel, SidebarMenu, SidebarMenuButton, SidebarMenuItem, SidebarMenuSub, SidebarMenuSubItem, SidebarMenuSubButton, SidebarHeader, SidebarFooter, useSidebar } from "@/components/ui/sidebar";
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
  title: "Jobsuche",
  url: "/jobs",
  icon: Search
}, {
  title: "Mein Profil",
  url: "/profile",
  icon: User
}, {
  title: "Einstellungen",
  url: "/settings",
  icon: Settings
}];
export function AppSidebar() {
  const { state, setOpen } = useSidebar();
  const collapsed = state === "collapsed";
  const location = useLocation();
  const navigate = useNavigate();
  const currentPath = location.pathname;
  const [communityOpen, setCommunityOpen] = useState(false);

  const { data: profile } = useQuery({
    queryKey: ['profile'],
    queryFn: async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return null;
      const { data, error } = await supabase.from('profiles').select('*').eq('id', user.id).single();
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
      
      if (sidebar && !sidebar.contains(event.target as Node) && 
          trigger && !trigger.contains(event.target as Node)) {
        setOpen(false);
      }
    };

    if (!collapsed) {
      document.addEventListener('mousedown', handleClickOutside);
      return () => document.removeEventListener('mousedown', handleClickOutside);
    }
  }, [collapsed, setOpen]);

  return (
    <>
      {/* Backdrop overlay */}
      {!collapsed && (
        <div 
          className="fixed inset-0 bg-black/20 z-40 lg:hidden"
          onClick={() => setOpen(false)}
        />
      )}
      
      <Sidebar 
        className={`fixed left-0 top-14 h-[calc(100vh-3.5rem)] z-50 transition-transform duration-200 ${
          collapsed ? '-translate-x-full lg:translate-x-0' : 'translate-x-0'
        } ${collapsed ? "w-14 lg:w-14" : "w-60"}`} 
        collapsible="icon"
        data-sidebar="sidebar"
      >
      <SidebarHeader className={`p-4 ${collapsed ? 'px-2' : ''}`}>
        {!collapsed ? (
          <div className="flex items-center space-x-2">
            <img
              src="/src/assets/logo.svg"
              alt="BeVisiblle Logo"
              className="h-8 w-8 object-contain"
              loading="eager"
            />
            <h2 className="text-lg font-semibold">
              <span className="text-foreground">Be</span>
              <span className="text-foreground">Visibi</span>
              <span className="text-primary">ll</span>
              <span className="text-foreground">e</span>
            </h2>
          </div>
        ) : (
          <div className="flex justify-center">
            <img
              src="/src/assets/logo.svg"
              alt="BeVisiblle Logo"
              className="h-8 w-8 object-contain"
              loading="eager"
            />
          </div>
        )}
      </SidebarHeader>

      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupLabel className={collapsed ? "sr-only" : ""}>
            Navigation
          </SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {navigationItems.map(item => (
                <SidebarMenuItem key={item.title}>
                  <SidebarMenuButton asChild>
                    <button
                      onClick={() => handleNavigation(item.url)}
                      className={`flex ${collapsed ? 'flex-col items-center gap-0.5 py-3' : 'items-center gap-3 py-2'} rounded-lg px-3 transition-all w-full ${collapsed ? 'text-center' : 'text-left'} ${
                        isActive(item.url) 
                          ? "bg-sidebar-accent text-sidebar-accent-foreground" 
                          : "text-sidebar-foreground hover:bg-sidebar-accent hover:text-sidebar-accent-foreground"
                      }`}
                    >
                      <item.icon className="h-4 w-4 flex-shrink-0" />
                      <span className={collapsed ? "text-[9px] font-medium leading-tight" : ""}>{item.title}</span>
                      {!collapsed && isActive(item.url) && <ChevronRight className="ml-auto h-4 w-4" />}
                    </button>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}

              {/* Community with main page + subpages - Collapsible */}
              {!collapsed ? (
                <SidebarMenuItem>
                  <SidebarMenuButton asChild>
                    <button
                      onClick={() => {
                        handleNavigation('/community');
                        setCommunityOpen(!communityOpen);
                      }}
                      className={`flex items-center gap-3 py-2 rounded-lg px-3 transition-all w-full text-left ${
                        currentPath.startsWith('/community') || currentPath === '/marketplace'
                          ? "bg-sidebar-accent text-sidebar-accent-foreground" 
                          : "text-sidebar-foreground hover:bg-sidebar-accent hover:text-sidebar-accent-foreground"
                      }`}
                    >
                      <Users className="h-4 w-4 flex-shrink-0" />
                      <span>Community</span>
                      <ChevronRight className={`ml-auto h-4 w-4 transition-transform ${communityOpen ? 'rotate-90' : ''}`} />
                    </button>
                  </SidebarMenuButton>
                  {communityOpen && (
                    <SidebarMenuSub>
                      <SidebarMenuSubItem>
                        <SidebarMenuSubButton asChild>
                          <button
                            onClick={() => handleNavigation('/community/contacts')}
                            className={`w-full text-left pl-9 ${
                              isActive('/community/contacts') ? 'bg-sidebar-accent text-sidebar-accent-foreground' : ''
                            }`}
                          >
                            <User className="h-4 w-4 mr-2" />
                            Freunde
                          </button>
                        </SidebarMenuSubButton>
                      </SidebarMenuSubItem>
                      <SidebarMenuSubItem>
                        <SidebarMenuSubButton asChild>
                          <button
                            onClick={() => handleNavigation('/community/companies')}
                            className={`w-full text-left pl-9 ${
                              isActive('/community/companies') ? 'bg-sidebar-accent text-sidebar-accent-foreground' : ''
                            }`}
                          >
                            <Building2 className="h-4 w-4 mr-2" />
                            Unternehmen
                          </button>
                        </SidebarMenuSubButton>
                      </SidebarMenuSubItem>
                      <SidebarMenuSubItem>
                        <SidebarMenuSubButton asChild>
                          <button
                            onClick={() => handleNavigation('/messages')}
                            className={`w-full text-left pl-9 ${
                              isActive('/messages') ? 'bg-sidebar-accent text-sidebar-accent-foreground' : ''
                            }`}
                          >
                            <MessageSquare className="h-4 w-4 mr-2" />
                            Nachrichten
                          </button>
                        </SidebarMenuSubButton>
                      </SidebarMenuSubItem>
                      <SidebarMenuSubItem>
                        <SidebarMenuSubButton asChild>
                          <button
                            onClick={() => handleNavigation('/marketplace')}
                            className={`w-full text-left pl-9 ${
                              isActive('/marketplace') ? 'bg-sidebar-accent text-sidebar-accent-foreground' : ''
                            }`}
                          >
                            <Briefcase className="h-4 w-4 mr-2" />
                            Jobs
                          </button>
                        </SidebarMenuSubButton>
                      </SidebarMenuSubItem>
                    </SidebarMenuSub>
                  )}
                </SidebarMenuItem>
              ) : (
                <SidebarMenuItem>
                  <SidebarMenuButton asChild>
                    <button
                      onClick={() => handleNavigation('/community')}
                      className={`flex flex-col items-center gap-0.5 py-3 rounded-lg px-3 transition-all w-full text-center ${
                        currentPath.startsWith('/community') || isActive('/marketplace')
                          ? "bg-sidebar-accent text-sidebar-accent-foreground" 
                          : "text-sidebar-foreground hover:bg-sidebar-accent hover:text-sidebar-accent-foreground"
                      }`}
                      title="Community"
                    >
                      <Users className="h-4 w-4 flex-shrink-0" />
                      <span className="text-[9px] font-medium leading-tight">Community</span>
                    </button>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              )}

              {/* Post Button */}
              <SidebarMenuItem>
                <SidebarMenuButton asChild>
                  <Button
                    onClick={() => openPostComposer()}
                    className={`w-full ${collapsed ? 'px-0 h-auto py-3 flex flex-col gap-0.5' : 'justify-start gap-3'}`}
                    variant="default"
                  >
                    <Plus className="h-4 w-4 flex-shrink-0" />
                    <span className={collapsed ? "text-[9px] font-medium leading-tight" : ""}>Posten</span>
                  </Button>
                </SidebarMenuButton>
              </SidebarMenuItem>
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>

      <SidebarFooter className="mt-auto p-4">
        {!collapsed ? (
          <div className="space-y-3">
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
            <Button
              variant="ghost"
              className="w-full justify-start gap-3"
              onClick={handleSignOut}
            >
              <LogOut className="h-4 w-4" />
              Abmelden
            </Button>
          </div>
        ) : (
          <div className="flex flex-col items-center gap-3">
            <Avatar className="h-8 w-8">
              <AvatarImage src={profile?.avatar_url || undefined} />
              <AvatarFallback className="text-xs">
                {profile?.vorname?.[0]}{profile?.nachname?.[0]}
              </AvatarFallback>
            </Avatar>
            <Button
              variant="ghost"
              size="icon"
              className="h-9 w-9"
              onClick={handleSignOut}
              title="Abmelden"
            >
              <LogOut className="h-4 w-4" />
            </Button>
          </div>
        )}
      </SidebarFooter>
    </Sidebar>
    </>
  );
}
