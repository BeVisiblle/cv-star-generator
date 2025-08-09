import { useState } from "react";
import { NavLink, useLocation } from "react-router-dom";
import { LayoutDashboard, User, Users, Settings, FileText, LogOut, ChevronRight, Plus, MessageSquare, Briefcase, Building2 } from "lucide-react";
import { Sidebar, SidebarContent, SidebarGroup, SidebarGroupContent, SidebarGroupLabel, SidebarMenu, SidebarMenuButton, SidebarMenuItem, SidebarMenuSub, SidebarMenuSubItem, SidebarMenuSubButton, SidebarHeader, SidebarFooter, useSidebar } from "@/components/ui/sidebar";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { supabase } from "@/integrations/supabase/client";
import { useQuery } from "@tanstack/react-query";
import { openPostComposer } from "@/lib/event-bus";
const navigationItems = [{
  title: "Dashboard",
  url: "/dashboard",
  icon: LayoutDashboard
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
  const {
    state
  } = useSidebar();
  const collapsed = state === "collapsed";
  const location = useLocation();
  const currentPath = location.pathname;
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
  const isActive = (path: string) => currentPath === path;
  const handleSignOut = async () => {
    await supabase.auth.signOut();
    window.location.href = '/auth';
  };
  return <Sidebar className={collapsed ? "w-14" : "w-60"} collapsible="icon">
      <SidebarHeader className={`p-4 ${collapsed ? 'px-2' : ''}`}>
        {!collapsed ? (
          <div className="flex items-center space-x-3">
            <img
              src="/lovable-uploads/8297f269-1ddb-4b49-a83d-9a561d9e57b4.png"
              alt="Ausbildungsbasis Logo"
              className="h-8 w-8 rounded-md object-contain"
              loading="eager"
            />
            <h2 className="text-lg font-semibold">Ausbildungsbasis</h2>
          </div>
        ) : (
          <div className="flex justify-center">
            <img
              src="/lovable-uploads/8297f269-1ddb-4b49-a83d-9a561d9e57b4.png"
              alt="Ausbildungsbasis Logo"
              className="h-8 w-8 rounded-md object-contain"
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
              {navigationItems.map(item => <SidebarMenuItem key={item.title}>
                  <SidebarMenuButton asChild>
                    <NavLink to={item.url} className={({
                  isActive
                }) => `flex items-center gap-3 rounded-lg px-3 py-2 transition-all ${isActive ? "bg-sidebar-accent text-sidebar-accent-foreground" : "text-sidebar-foreground hover:bg-sidebar-accent hover:text-sidebar-accent-foreground"}`}>
                      <item.icon className="h-4 w-4" />
                      {!collapsed && <span>{item.title}</span>}
                      {!collapsed && isActive(item.url) && <ChevronRight className="ml-auto h-4 w-4" />}
                    </NavLink>
                  </SidebarMenuButton>
                </SidebarMenuItem>)}

              {/* Community with subpages */}
              <SidebarMenuItem>
                <SidebarMenuButton asChild>
                  <NavLink to="/marketplace" className={({
                  isActive
                }) => `flex items-center gap-3 rounded-lg px-3 py-2 transition-all ${isActive || currentPath.startsWith('/community') ? "bg-sidebar-accent text-sidebar-accent-foreground" : "text-sidebar-foreground hover:bg-sidebar-accent hover:text-sidebar-accent-foreground"}`}>
                    <Users className="h-4 w-4" />
                    {!collapsed && <span>Community</span>}
                    {!collapsed && (currentPath === "/marketplace" || currentPath.startsWith("/community")) && <ChevronRight className="ml-auto h-4 w-4" />}
                  </NavLink>
                </SidebarMenuButton>
                <SidebarMenuSub>
                  <SidebarMenuSubItem>
                    <SidebarMenuSubButton asChild>
                      <NavLink to="/community/contacts" className={({
                      isActive
                    }) => isActive ? "text-primary" : ""}>
                        <Users className="h-4 w-4" />
                        {!collapsed && <span>Meine Freunde / Kontakte</span>}
                      </NavLink>
                    </SidebarMenuSubButton>
                  </SidebarMenuSubItem>
                  <SidebarMenuSubItem>
                    <SidebarMenuSubButton asChild>
                      <NavLink to="/community/companies" className={({
                      isActive
                    }) => isActive ? "text-primary" : ""}>
                        <Building2 className="h-4 w-4" />
                        {!collapsed && <span>Unternehmen</span>}
                      </NavLink>
                    </SidebarMenuSubButton>
                  </SidebarMenuSubItem>
                  <SidebarMenuSubItem>
                    <SidebarMenuSubButton asChild>
                      <NavLink to="/community/messages" className={({
                      isActive
                    }) => isActive ? "text-primary" : ""}>
                        <MessageSquare className="h-4 w-4" />
                        {!collapsed && <span>Nachrichten</span>}
                      </NavLink>
                    </SidebarMenuSubButton>
                  </SidebarMenuSubItem>
                  <SidebarMenuSubItem>
                    <SidebarMenuSubButton asChild>
                      <NavLink to="/community/jobs" className={({
                      isActive
                    }) => isActive ? "text-primary" : ""}>
                        <Briefcase className="h-4 w-4" />
                        {!collapsed && <span>Jobs</span>}
                      </NavLink>
                    </SidebarMenuSubButton>
                  </SidebarMenuSubItem>
                </SidebarMenuSub>
              </SidebarMenuItem>
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>

      <SidebarFooter className={`p-4 ${collapsed ? 'px-2' : ''}`}>
        {!collapsed ? <div className="space-y-3">
            {/* User Profile Info */}
            <div className="flex items-center space-x-3 p-2 rounded-lg bg-sidebar-accent">
              <Avatar className="h-8 w-8">
                <AvatarImage src={profile?.avatar_url} />
                <AvatarFallback>
                  {profile?.vorname && profile?.nachname ? `${profile.vorname[0]}${profile.nachname[0]}` : 'U'}
                </AvatarFallback>
              </Avatar>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-sidebar-accent-foreground truncate">
                  {profile?.vorname && profile?.nachname ? `${profile.vorname} ${profile.nachname}` : 'Unbekannter Nutzer'}
                </p>
                <p className="text-xs text-sidebar-foreground/60 truncate">
                  {profile?.email || ''}
                </p>
              </div>
            </div>

            {/* Create Post Button */}
            <Button className="w-full justify-start" onClick={openPostComposer}>
              <Plus className="h-4 w-4 mr-2" />
              Neuer Beitrag
            </Button>

            {/* Sign Out Button */}
            <Button variant="ghost" size="sm" onClick={handleSignOut} className="w-full justify-start text-sidebar-foreground hover:bg-sidebar-accent hover:text-sidebar-accent-foreground">
              <LogOut className="h-4 w-4 mr-2" />
              Abmelden
            </Button>
          </div> : <div className="space-y-2">
            <Avatar className="h-8 w-8 mx-auto">
              <AvatarImage src={profile?.avatar_url} />
              <AvatarFallback>
                {profile?.vorname && profile?.nachname ? `${profile.vorname[0]}${profile.nachname[0]}` : 'U'}
              </AvatarFallback>
            </Avatar>
            <Button size="sm" onClick={openPostComposer} className="w-full p-2 justify-center">
              <Plus className="h-4 w-4" />
            </Button>
            <Button variant="ghost" size="sm" onClick={handleSignOut} className="w-full p-2 justify-center">
              <LogOut className="h-4 w-4" />
            </Button>
          </div>}
      </SidebarFooter>
    </Sidebar>;
}