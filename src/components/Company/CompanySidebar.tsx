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
  SidebarMenuSub,
  SidebarMenuSubItem,
  SidebarMenuSubButton,
  useSidebar,
} from "@/components/ui/sidebar";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Progress } from "@/components/ui/progress";
import {
  Home,
  Users,
  Globe,
  Image as ImageIcon,
  Briefcase,
  BarChart3,
  Settings as SettingsIcon,
  HelpCircle,
  Plus,
  ChevronDown,
} from "lucide-react";
import { NavLink, useLocation } from "react-router-dom";
import { useCompany } from "@/hooks/useCompany";

// Navigation structure for the Company area
const sections = [
  {
    key: "dashboard",
    label: "Dashboard",
    icon: Home,
    children: [
      { label: "Overview", to: "/company/dashboard" },
      { label: "Company Insights", to: null, soon: true },
      { label: "Schnellaktionen", to: null, soon: true },
    ],
  },
  {
    key: "candidates",
    label: "Candidates",
    icon: Users,
    children: [
      { label: "Search & Filter", to: "/company/search" },
      { label: "Candidate Pipeline", to: null, soon: true },
      { label: "Saved Candidates", to: null, soon: true },
      { label: "Token Unlock History", to: "/company/unlocked" },
    ],
  },
  {
    key: "community",
    label: "Community",
    icon: Globe,
    children: [
      { label: "Feed", to: "/dashboard" },
      { label: "My Posts", to: "/company/posts" },
      { label: "Groups", to: null, soon: true },
      { label: "Events", to: null, soon: true },
    ],
  },
  {
    key: "media",
    label: "Media",
    icon: ImageIcon,
    children: [
      { label: "Photo Library", to: null, soon: true },
      { label: "Video Library", to: null, soon: true },
    ],
  },
  {
    key: "jobs",
    label: "Jobs",
    icon: Briefcase,
    children: [
      { label: "My Job Posts", to: null, soon: true },
      { label: "Create New Job", to: null, soon: true },
      { label: "Applicants per Job", to: null, soon: true },
    ],
  },
  {
    key: "insights",
    label: "Insights",
    icon: BarChart3,
    children: [
      { label: "Candidate Views", to: null, soon: true },
      { label: "Post Reach", to: null, soon: true },
      { label: "Engagement", to: null, soon: true },
      { label: "Follower Growth", to: null, soon: true },
    ],
  },
  {
    key: "settings",
    label: "Settings",
    icon: SettingsIcon,
    children: [
      { label: "Company Profile", to: "/company/profile" },
      { label: "Team Members & Roles", to: "/company/settings" },
      { label: "Billing & Subscription", to: "/company/billing" },
      { label: "Notifications", to: "/company/settings" },
    ],
  },
  {
    key: "support",
    label: "Help & Support",
    icon: HelpCircle,
    children: [
      { label: "Help Center", to: null, soon: true },
      { label: "Contact Support", to: null, soon: true },
      { label: "Feedback", to: null, soon: true },
    ],
  },
] as const;

export function CompanySidebar() {
  const { state } = useSidebar();
  const { company } = useCompany();
  const location = useLocation();

  // Derive open state for each section based on active route
  const initialOpen = React.useMemo(() => {
    const path = location.pathname;
    const map: Record<string, boolean> = {};
    sections.forEach((sec) => {
      map[sec.key] = !!sec.children.find((c) => c.to && path.startsWith(c.to));
    });
    return map;
  }, [location.pathname]);

  const [open, setOpen] = React.useState<Record<string, boolean>>(initialOpen);
  React.useEffect(() => setOpen(initialOpen), [initialOpen]);

  const maxTokens = Math.max(1, (company?.seats ?? 0) * 10);
  const tokens = company?.active_tokens ?? 0;
  const tokenPct = Math.min(100, Math.round((tokens / maxTokens) * 100));

  const isActive = (to: string | null | undefined) =>
    !!to && location.pathname === to;

  return (
    <Sidebar collapsible="offcanvas" className={state === "collapsed" ? "w-14" : "w-60"}>
      <SidebarHeader>
        <div className="flex items-center gap-2 px-2">
          <Avatar className="h-8 w-8 shrink-0">
            <AvatarImage src={company?.logo_url || ""} alt={company?.name || "Company"} />
            <AvatarFallback>{company?.name?.[0]?.toUpperCase() || "C"}</AvatarFallback>
          </Avatar>
          {state !== "collapsed" && (
            <div className="min-w-0 flex-1">
              <div className="text-sm font-medium truncate">{company?.name || "Company"}</div>
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

      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupLabel>Navigation</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {sections.map((section) => {
                const Icon = section.icon;
                const isOpen = open[section.key];
                return (
                  <React.Fragment key={section.key}>
                    <SidebarMenuItem>
                      <SidebarMenuButton
                        tooltip={section.label}
                        className="justify-between"
                        onClick={() => setOpen((prev) => ({ ...prev, [section.key]: !prev[section.key] }))}
                      >
                        <div className="flex items-center gap-2">
                          <Icon className="h-4 w-4" />
                          {state !== "collapsed" && <span>{section.label}</span>}
                        </div>
                        {state !== "collapsed" && (
                          <ChevronDown className={`h-4 w-4 transition-transform ${isOpen ? "rotate-180" : ""}`} />
                        )}
                      </SidebarMenuButton>
                    </SidebarMenuItem>

                    {isOpen && (
                      <SidebarMenuSub>
                        {section.children.map((child) => (
                          <SidebarMenuSubItem key={child.label}>
                            {child.to ? (
                              <SidebarMenuSubButton asChild isActive={isActive(child.to)}>
                                <NavLink to={child.to}>{child.label}</NavLink>
                              </SidebarMenuSubButton>
                            ) : (
                              <SidebarMenuSubButton aria-disabled className="opacity-60">{child.label} <span className="ml-2 text-[10px]">Coming soon</span></SidebarMenuSubButton>
                            )}
                          </SidebarMenuSubItem>
                        ))}
                      </SidebarMenuSub>
                    )}
                  </React.Fragment>
                );
              })}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>

      <SidebarFooter>
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton asChild tooltip="Invite Team Member">
              <NavLink to="/company/settings">
                <Plus className="h-4 w-4" />
                {state !== "collapsed" && <span>Invite Team Member</span>}
              </NavLink>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarFooter>
    </Sidebar>
  );
}
