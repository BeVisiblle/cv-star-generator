import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate, useLocation } from "react-router-dom";
import { AuthenticatedLayout } from "@/components/AuthenticatedLayout";
import { AuthProvider } from "@/hooks/useAuth";
import { CVGeneratorGate } from "@/components/CVGeneratorGate";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";
import { useEffect, useState, lazy, Suspense } from "react";
import TopNavBar from "@/components/navigation/TopNavBar";
import { SidebarProvider } from "@/components/ui/sidebar";

// Critical pages - loaded immediately for landing page
import Index from "./pages/Index";
import NotFound from "./pages/NotFound";
import Auth from "./pages/Auth";

// Lazy load non-critical pages to reduce initial bundle size
const Blog = lazy(() => import("./pages/Blog"));
const Unternehmen = lazy(() => import("./pages/Unternehmen"));
const CompanyLandingPage = lazy(() => import("@/components/marketing/CompanyLandingPage"));
const ProfileCreationFlow = lazy(() => import("@/components/profile-creation/ProfileCreationFlow"));
const Datenschutz = lazy(() => import("./pages/Datenschutz"));
const Impressum = lazy(() => import("./pages/Impressum"));
const AGB = lazy(() => import("./pages/AGB"));
const Talent = lazy(() => import("./pages/Talent"));
const CVGenerator = lazy(() => import("./components/CVGenerator"));
const CVExplanation = lazy(() => import("./pages/CVExplanation"));
const Profile = lazy(() => import("./pages/Profile"));
const Dashboard = lazy(() => import("./pages/Dashboard"));
const Marketplace = lazy(() => import("./pages/Marketplace"));
const Settings = lazy(() => import("./pages/Settings"));
const BaseLayout = lazy(() => import("@/components/layout/BaseLayout"));
const DiscoverAzubis = lazy(() => import("./pages/DiscoverAzubis"));
const DiscoverCompanies = lazy(() => import("./pages/DiscoverCompanies"));
const ProduktAzubis = lazy(() => import("./pages/ProduktAzubis"));
const ProduktUnternehmen = lazy(() => import("./pages/ProduktUnternehmen"));
const CommunityContacts = lazy(() => import("./pages/Community/Contacts"));
const CommunityCompanies = lazy(() => import("./pages/Community/Companies"));
const CommunityMessages = lazy(() => import("./pages/Community/Messages"));
const CommunityJobs = lazy(() => import("./pages/Community/Jobs"));
const NotificationsPage = lazy(() => import("./pages/Notifications"));
const Applications = lazy(() => import("./pages/User/Applications"));
const TestData = lazy(() => import("./pages/TestData"));


// Groups components - lazy loaded
const GroupsPage = lazy(() => import("./pages/GroupsPage"));
const GroupDetailPage = lazy(() => import("./pages/GroupDetailPage"));

// Company components - lazy loaded
const CompanyLayout = lazy(() => import("@/components/Company/CompanyLayout").then(m => ({ default: m.CompanyLayout })));
const OnboardingWizard = lazy(() => import("./components/company/onboarding/OnboardingWizard").then(module => ({ default: module.OnboardingWizard })));
const CompanyDashboard = lazy(() => import("./pages/Company/CompanyDashboard"));
const CompanyProfile = lazy(() => import("./pages/Company/Profile"));
const CompanySearch = lazy(() => import("./pages/Company/Search"));
const CompanyNotifications = lazy(() => import("./pages/Company/Notifications"));
const CompanySettings = lazy(() => import("./pages/Company/Settings"));
const CompanyPosts = lazy(() => import("./pages/Company/Posts"));
const CompanyProfileView = lazy(() => import("./pages/Company/ProfileView"));
const CompanyBilling = lazy(() => import("./pages/Company/Billing"));
const CompanyUnlocked = lazy(() => import("./pages/Company/Unlocked"));
const CompanyComingSoon = lazy(() => import("./pages/Company/ComingSoon"));
const CompanyFeed = lazy(() => import("./pages/Company/Feed"));
const CandidatesPipelinePage = lazy(() => import("./pages/Company/CandidatesPipeline"));
const MatchingProfilePage = lazy(() => import("./pages/Company/MatchingProfile"));
const CompanyJobs = lazy(() => import("./pages/Company/Jobs"));
const CompanyJobDetails = lazy(() => import("./pages/Company/JobDetails"));

// Admin components - lazy loaded
const AdminLayout = lazy(() => import("./pages/Admin/AdminLayout"));
const PagesList = lazy(() => import("./pages/Admin/PagesList"));
const PageEditor = lazy(() => import("./pages/Admin/PageEditor"));
const SeoInsights = lazy(() => import("./pages/Admin/SeoInsights"));
const ScheduledPosts = lazy(() => import("./pages/Admin/ScheduledPosts"));
const AdminSettings = lazy(() => import("./pages/Admin/AdminSettings"));
const PublicPage = lazy(() => import("./pages/PublicPage"));
const UserProfilePage = lazy(() => import("./pages/UserProfile"));
const PublicCompanyView = lazy(() => import("./pages/Companies/PublicCompanyView"));
const Overview = lazy(() => import("./pages/Admin/Overview"));
const UsersPage = lazy(() => import("./pages/Admin/Users"));
const CompaniesPage = lazy(() => import("./pages/Admin/Companies"));
const PlansPage = lazy(() => import("./pages/Admin/Plans"));
const JobsPage = lazy(() => import("./pages/Admin/Jobs"));
const MatchesPage = lazy(() => import("./pages/Admin/Matches"));
const AnalyticsPage = lazy(() => import("./pages/Admin/Analytics"));
const ContentPage = lazy(() => import("./pages/Admin/Content"));
const SupportPage = lazy(() => import("./pages/Admin/Support"));
const AdminTools = lazy(() => import("./pages/Admin/Tools"));
const AdminAuthGate = lazy(() => import("@/components/admin/AdminAuthGate"));
const CreateAdmin = lazy(() => import("./pages/Admin/CreateAdmin"));
const PublicJobs = lazy(() => import("./pages/PublicJobs"));
const PublicJobDetail = lazy(() => import("./pages/PublicJobDetail"));
const EventDetail = lazy(() => import("./pages/EventDetail"));
const FeedSettingsPage = lazy(() => import("./pages/FeedSettingsPage"));

const queryClient = new QueryClient();

// Protected route for company pages
function CompanyProtectedRoute({ children }: { children: React.ReactNode }) {
  const { user } = useAuth();
  const [userType, setUserType] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    async function checkCompanyAccess() {
      // Check demo mode FIRST and IMMEDIATELY
      const demoMode = localStorage.getItem('demoMode') === 'true';
      
      if (demoMode) {
        setUserType('company');
        setIsLoading(false);
        return;
      }

      if (!user) {
        setUserType('not_company');
        setIsLoading(false);
        return;
      }

      try {
        const { data: companyUser, error } = await supabase
          .from('company_users')
          .select('*')
          .eq('user_id', user.id)
          .single();

        if (companyUser && !error) {
          setUserType('company');
        } else {
          setUserType('not_company');
        }
      } catch (error) {
        console.error('Error checking company access:', error);
        setUserType('not_company');
      }
      setIsLoading(false);
    }

    checkCompanyAccess();
  }, [user]);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (!user && localStorage.getItem('demoMode') !== 'true') {
    return <Navigate to="/auth" replace />;
  }

  if (userType !== 'company') {
    return <Navigate to="/company/onboarding" replace />;
  }

  return <>{children}</>;
}

// Layout wrapper that conditionally shows TopNavBar
function LayoutContent({ children }: { children: React.ReactNode }) {
  const location = useLocation();
  const isCompanyRoute = location.pathname.startsWith('/company/') && location.pathname !== '/company/onboarding';
  const isLandingPage = location.pathname === '/';
  const isAuthRoute = location.pathname === '/auth';
  const isCvRoute = location.pathname.startsWith('/cv-generator') || location.pathname.startsWith('/cv-layout-selector');
  const isLegalRoute = ['/impressum','/datenschutz','/agb','/ueber-uns'].includes(location.pathname);
  // Show TopNavBar ONLY in the portal (app) sections, not on marketing/login/landing
  const portalPrefixes = [
    '/dashboard',
    '/marketplace',
    '/community',
    '/notifications',
    '/settings',
    '/profile',
    '/companies',
    '/entdecken',
    '/groups',
    '/file',
    '/u/'
  ];
  const isPortalRoute = portalPrefixes.some(p => location.pathname.startsWith(p));
  const showTopNav = isPortalRoute && !isLegalRoute && !isLandingPage && !isAuthRoute && !isCvRoute;
  
  return (
    <div className="min-h-screen flex flex-col w-full">
      {/* TopNavBar conditionally rendered */}
      {showTopNav && <TopNavBar />}
      
      {/* Main content area with conditional background and padding */}
      <div className={
        isLandingPage 
          ? "flex-1 bg-black" 
          : isCompanyRoute 
            ? "flex-1 bg-white" 
            : showTopNav
              ? "flex-1 pt-14 bg-white"
              : "flex-1 bg-white"
      }>
        {children}
      </div>
    </div>
  );
}

// Universal layout wrapper
function UniversalLayout({ children }: { children: React.ReactNode }) {
  return (
    <SidebarProvider defaultOpen={false}>
      <LayoutContent>{children}</LayoutContent>
    </SidebarProvider>
  );
}

const App = () => (
  <QueryClientProvider client={queryClient}>
        <TooltipProvider>
          <AuthProvider>
            <Toaster />
            <Sonner />
            <BrowserRouter>
          <UniversalLayout>
            <Routes>
              <Route path="/" element={<Suspense fallback={<div className="flex items-center justify-center min-h-screen bg-black"><div className="animate-spin rounded-full h-8 w-8 border-b-2 border-white"></div></div>}><BaseLayout className="bg-black text-white"><Index /></BaseLayout></Suspense>} />
              <Route path="/auth" element={<Auth />} />
              <Route path="/blog" element={<Suspense fallback={<div className="flex items-center justify-center min-h-screen"><div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div></div>}><Blog /></Suspense>} />
              <Route path="/blog/:slug" element={<Suspense fallback={<div className="flex items-center justify-center min-h-screen"><div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div></div>}><PublicPage /></Suspense>} />
              <Route path="/p/:slug" element={<Suspense fallback={<div className="flex items-center justify-center min-h-screen"><div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div></div>}><PublicPage /></Suspense>} />
              <Route path="/unternehmen" element={<Suspense fallback={<div className="flex items-center justify-center min-h-screen"><div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div></div>}><BaseLayout><CompanyLandingPage /></BaseLayout></Suspense>} />
              <Route path="/features" element={<Suspense fallback={<div className="flex items-center justify-center min-h-screen"><div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div></div>}><BaseLayout><Unternehmen /></BaseLayout></Suspense>} />
              <Route path="/produkt" element={<Suspense fallback={<div className="flex items-center justify-center min-h-screen"><div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div></div>}><BaseLayout><Unternehmen /></BaseLayout></Suspense>} />
              <Route path="/kontakt" element={<Suspense fallback={<div className="flex items-center justify-center min-h-screen"><div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div></div>}><BaseLayout><Unternehmen /></BaseLayout></Suspense>} />
              <Route path="/ueber-uns" element={<Suspense fallback={<div className="flex items-center justify-center min-h-screen"><div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div></div>}><BaseLayout><Unternehmen /></BaseLayout></Suspense>} />
              <Route path="/onboarding" element={<Suspense fallback={<div className="flex items-center justify-center min-h-screen"><div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div></div>}><BaseLayout><ProfileCreationFlow /></BaseLayout></Suspense>} />
              <Route path="/unternehmen/onboarding" element={<Suspense fallback={<div className="flex items-center justify-center min-h-screen"><div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div></div>}><OnboardingWizard /></Suspense>} />
              <Route path="/talent" element={<Suspense fallback={<div className="flex items-center justify-center min-h-screen"><div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div></div>}><BaseLayout><Talent /></BaseLayout></Suspense>} />
              <Route path="/datenschutz" element={<Suspense fallback={<div className="flex items-center justify-center min-h-screen"><div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div></div>}><Datenschutz /></Suspense>} />
              <Route path="/impressum" element={<Suspense fallback={<div className="flex items-center justify-center min-h-screen"><div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div></div>}><Impressum /></Suspense>} />
              <Route path="/agb" element={<Suspense fallback={<div className="flex items-center justify-center min-h-screen"><div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div></div>}><AGB /></Suspense>} />
              <Route path="/produkt/azubis" element={<Suspense fallback={<div className="flex items-center justify-center min-h-screen"><div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div></div>}><ProduktAzubis /></Suspense>} />
              <Route path="/produkt/unternehmen" element={<Suspense fallback={<div className="flex items-center justify-center min-h-screen"><div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div></div>}><ProduktUnternehmen /></Suspense>} />
              <Route path="/bootstrap/create-admin" element={<Suspense fallback={<div className="flex items-center justify-center min-h-screen"><div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div></div>}><BaseLayout><CreateAdmin /></BaseLayout></Suspense>} />
              
              {/* Public job listings */}
              <Route path="/jobs" element={<Suspense fallback={<div className="flex items-center justify-center min-h-screen"><div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div></div>}><BaseLayout><PublicJobs /></BaseLayout></Suspense>} />
              <Route path="/jobs/:slug" element={<Suspense fallback={<div className="flex items-center justify-center min-h-screen"><div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div></div>}><BaseLayout><PublicJobDetail /></BaseLayout></Suspense>} />
              
              {/* Event detail page */}
              <Route path="/event/:eventId" element={<Suspense fallback={<div className="flex items-center justify-center min-h-screen"><div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div></div>}><EventDetail /></Suspense>} />
              
              {/* Test Data Management */}
              <Route path="/test-data" element={<Suspense fallback={<div className="flex items-center justify-center min-h-screen"><div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div></div>}><TestData /></Suspense>} />
              
              
              {/* CV Generator - Open for everyone, but validates complete profiles */}
              <Route path="/cv-generator" element={<Suspense fallback={<div className="flex items-center justify-center min-h-screen"><div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div></div>}><CVGeneratorGate><CVGenerator /></CVGeneratorGate></Suspense>} />
              <Route path="/cv-layout-selector" element={<Suspense fallback={<div className="flex items-center justify-center min-h-screen"><div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div></div>}><CVGeneratorGate><CVGenerator /></CVGeneratorGate></Suspense>} />
              <Route path="/so-funktionierts" element={<Suspense fallback={<div className="flex items-center justify-center min-h-screen"><div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div></div>}><BaseLayout><CVExplanation /></BaseLayout></Suspense>} />
              
              {/* Company routes */}
              <Route path="/company/onboarding" element={<Suspense fallback={<div className="flex items-center justify-center min-h-screen"><div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div></div>}><OnboardingWizard /></Suspense>} />
              <Route
                path="/company/*"
                element={
                  <CompanyProtectedRoute>
                    <Suspense fallback={<div className="flex items-center justify-center min-h-screen"><div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div></div>}>
                      <CompanyLayout />
                    </Suspense>
                  </CompanyProtectedRoute>
                }
              >
                <Route path="dashboard" element={<Suspense fallback={<div className="flex items-center justify-center min-h-screen"><div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div></div>}><CompanyDashboard /></Suspense>} />
                <Route path="profile" element={<Suspense fallback={<div className="flex items-center justify-center min-h-screen"><div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div></div>}><CompanyProfile /></Suspense>} />
                <Route path="search" element={<Suspense fallback={<div className="flex items-center justify-center min-h-screen"><div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div></div>}><CompanySearch /></Suspense>} />
                <Route path="unlocked" element={<Suspense fallback={<div className="flex items-center justify-center min-h-screen"><div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div></div>}><CompanyUnlocked /></Suspense>} />
                <Route path="billing" element={<Suspense fallback={<div className="flex items-center justify-center min-h-screen"><div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div></div>}><CompanyBilling /></Suspense>} />
                <Route path="notifications" element={<Suspense fallback={<div className="flex items-center justify-center min-h-screen"><div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div></div>}><CompanyNotifications /></Suspense>} />
                <Route path="settings" element={<Suspense fallback={<div className="flex items-center justify-center min-h-screen"><div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div></div>}><CompanySettings /></Suspense>} />
                <Route path="matching-profile" element={<Suspense fallback={<div className="flex items-center justify-center min-h-screen"><div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div></div>}><MatchingProfilePage /></Suspense>} />
                <Route path="posts" element={<Suspense fallback={<div className="flex items-center justify-center min-h-screen"><div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div></div>}><CompanyPosts /></Suspense>} />
                <Route path="feed" element={<Suspense fallback={<div className="flex items-center justify-center min-h-screen"><div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div></div>}><CompanyFeed /></Suspense>} />
                <Route path="profile/:id" element={<Suspense fallback={<div className="flex items-center justify-center min-h-screen"><div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div></div>}><CompanyProfileView /></Suspense>} />

                <Route path="jobs" element={<Suspense fallback={<div className="flex items-center justify-center min-h-screen"><div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div></div>}><CompanyJobs /></Suspense>} />
                <Route path="jobs/:jobId" element={<Suspense fallback={<div className="flex items-center justify-center min-h-screen"><div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div></div>}><CompanyJobDetails /></Suspense>} />
                <Route path="candidates/pipeline" element={<Suspense fallback={<div className="flex items-center justify-center min-h-screen"><div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div></div>}><CandidatesPipelinePage /></Suspense>} />
                <Route path="candidates/saved" element={<Suspense fallback={<div className="flex items-center justify-center min-h-screen"><div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div></div>}><CompanyComingSoon /></Suspense>} />
                <Route path="candidates/token-history" element={<Suspense fallback={<div className="flex items-center justify-center min-h-screen"><div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div></div>}><CompanyComingSoon /></Suspense>} />

                <Route path="community/groups" element={<Suspense fallback={<div className="flex items-center justify-center min-h-screen"><div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div></div>}><CompanyComingSoon /></Suspense>} />
                <Route path="community/events" element={<Suspense fallback={<div className="flex items-center justify-center min-h-screen"><div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div></div>}><CompanyComingSoon /></Suspense>} />

                <Route path="media/photos" element={<Suspense fallback={<div className="flex items-center justify-center min-h-screen"><div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div></div>}><CompanyComingSoon /></Suspense>} />
                <Route path="media/videos" element={<Suspense fallback={<div className="flex items-center justify-center min-h-screen"><div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div></div>}><CompanyComingSoon /></Suspense>} />

                <Route path="jobs/:id/applicants" element={<Suspense fallback={<div className="flex items-center justify-center min-h-screen"><div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div></div>}><CompanyComingSoon /></Suspense>} />

                <Route path="insights/views" element={<Suspense fallback={<div className="flex items-center justify-center min-h-screen"><div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div></div>}><CompanyComingSoon /></Suspense>} />
                <Route path="insights/reach" element={<Suspense fallback={<div className="flex items-center justify-center min-h-screen"><div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div></div>}><CompanyComingSoon /></Suspense>} />
                <Route path="insights/engagement" element={<Suspense fallback={<div className="flex items-center justify-center min-h-screen"><div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div></div>}><CompanyComingSoon /></Suspense>} />
                <Route path="insights/followers" element={<Suspense fallback={<div className="flex items-center justify-center min-h-screen"><div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div></div>}><CompanyComingSoon /></Suspense>} />

                <Route path="settings/team" element={<Suspense fallback={<div className="flex items-center justify-center min-h-screen"><div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div></div>}><CompanyComingSoon /></Suspense>} />
                <Route path="settings/notifications" element={<Suspense fallback={<div className="flex items-center justify-center min-h-screen"><div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div></div>}><CompanyComingSoon /></Suspense>} />

                <Route path="help/center" element={<Suspense fallback={<div className="flex items-center justify-center min-h-screen"><div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div></div>}><CompanyComingSoon /></Suspense>} />
                <Route path="help/support" element={<Suspense fallback={<div className="flex items-center justify-center min-h-screen"><div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div></div>}><CompanyComingSoon /></Suspense>} />
                <Route path="help/feedback" element={<Suspense fallback={<div className="flex items-center justify-center min-h-screen"><div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div></div>}><CompanyComingSoon /></Suspense>} />
              </Route>
              
              {/* Authenticated routes */}
              <Route element={<AuthenticatedLayout />}>
                <Route path="/profile" element={<Suspense fallback={<div className="flex items-center justify-center min-h-screen"><div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div></div>}><Profile /></Suspense>} />
                <Route path="/dashboard" element={<Suspense fallback={<div className="flex items-center justify-center min-h-screen"><div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div></div>}><Dashboard /></Suspense>} />
                <Route path="/marketplace" element={<Suspense fallback={<div className="flex items-center justify-center min-h-screen"><div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div></div>}><Marketplace /></Suspense>} />
                <Route path="/companies/:id" element={<Suspense fallback={<div className="flex items-center justify-center min-h-screen"><div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div></div>}><PublicCompanyView /></Suspense>} />
                <Route path="/community/contacts" element={<Suspense fallback={<div className="flex items-center justify-center min-h-screen"><div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div></div>}><CommunityContacts /></Suspense>} />
                <Route path="/community/companies" element={<Suspense fallback={<div className="flex items-center justify-center min-h-screen"><div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div></div>}><CommunityCompanies /></Suspense>} />
                <Route path="/community/messages" element={<Suspense fallback={<div className="flex items-center justify-center min-h-screen"><div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div></div>}><CommunityMessages /></Suspense>} />
                <Route path="/community/jobs" element={<Suspense fallback={<div className="flex items-center justify-center min-h-screen"><div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div></div>}><CommunityJobs /></Suspense>} />
                <Route path="/notifications" element={<Suspense fallback={<div className="flex items-center justify-center min-h-screen"><div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div></div>}><NotificationsPage /></Suspense>} />
                <Route path="/applications" element={<Suspense fallback={<div className="flex items-center justify-center min-h-screen"><div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div></div>}><Applications /></Suspense>} />
                <Route path="/settings" element={<Suspense fallback={<div className="flex items-center justify-center min-h-screen"><div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div></div>}><Settings /></Suspense>} />
                <Route path="/feed-settings" element={<Suspense fallback={<div className="flex items-center justify-center min-h-screen"><div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div></div>}><FeedSettingsPage /></Suspense>} />
                <Route path="/entdecken/azubis" element={<Suspense fallback={<div className="flex items-center justify-center min-h-screen"><div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div></div>}><DiscoverAzubis /></Suspense>} />
                <Route path="/entdecken/unternehmen" element={<Suspense fallback={<div className="flex items-center justify-center min-h-screen"><div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div></div>}><DiscoverCompanies /></Suspense>} />
                <Route path="/groups" element={<Suspense fallback={<div className="flex items-center justify-center min-h-screen"><div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div></div>}><GroupsPage /></Suspense>} />
                <Route path="/groups/:id" element={<Suspense fallback={<div className="flex items-center justify-center min-h-screen"><div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div></div>}><GroupDetailPage /></Suspense>} />
                <Route path="/u/:id" element={<Suspense fallback={<div className="flex items-center justify-center min-h-screen"><div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div></div>}><UserProfilePage /></Suspense>} />
              </Route>

              {/* Admin routes */}
              <Route path="/admin" element={<Suspense fallback={<div className="flex items-center justify-center min-h-screen"><div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div></div>}><AdminLayout /></Suspense>}>
                <Route index element={<Suspense fallback={<div className="flex items-center justify-center min-h-screen"><div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div></div>}><Overview /></Suspense>} />
                <Route path="users" element={<Suspense fallback={<div className="flex items-center justify-center min-h-screen"><div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div></div>}><UsersPage /></Suspense>} />
                <Route path="companies" element={<Suspense fallback={<div className="flex items-center justify-center min-h-screen"><div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div></div>}><CompaniesPage /></Suspense>} />
                <Route path="plans" element={<Suspense fallback={<div className="flex items-center justify-center min-h-screen"><div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div></div>}><PlansPage /></Suspense>} />
                <Route path="jobs" element={<Suspense fallback={<div className="flex items-center justify-center min-h-screen"><div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div></div>}><JobsPage /></Suspense>} />
                <Route path="matches" element={<Suspense fallback={<div className="flex items-center justify-center min-h-screen"><div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div></div>}><MatchesPage /></Suspense>} />
                <Route path="analytics" element={<Suspense fallback={<div className="flex items-center justify-center min-h-screen"><div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div></div>}><AnalyticsPage /></Suspense>} />
                <Route path="content" element={<Suspense fallback={<div className="flex items-center justify-center min-h-screen"><div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div></div>}><ContentPage /></Suspense>} />
                {/* Legacy content routes remain accessible */}
                <Route path="pages" element={<Suspense fallback={<div className="flex items-center justify-center min-h-screen"><div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div></div>}><PagesList /></Suspense>} />
                <Route path="pages/new" element={<Suspense fallback={<div className="flex items-center justify-center min-h-screen"><div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div></div>}><PageEditor /></Suspense>} />
                <Route path="pages/:id" element={<Suspense fallback={<div className="flex items-center justify-center min-h-screen"><div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div></div>}><PageEditor /></Suspense>} />
                <Route path="seo" element={<Suspense fallback={<div className="flex items-center justify-center min-h-screen"><div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div></div>}><SeoInsights /></Suspense>} />
                <Route path="scheduled" element={<Suspense fallback={<div className="flex items-center justify-center min-h-screen"><div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div></div>}><ScheduledPosts /></Suspense>} />
                <Route path="tools" element={<Suspense fallback={<div className="flex items-center justify-center min-h-screen"><div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div></div>}><AdminTools /></Suspense>} />
                <Route path="settings" element={<Suspense fallback={<div className="flex items-center justify-center min-h-screen"><div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div></div>}><AdminSettings /></Suspense>} />
              </Route>
                
              {/* Legacy redirects */}
              <Route path="/company-dashboard" element={<Navigate to="/company/dashboard" replace />} />
              
              {/* 404 */}
              <Route path="*" element={<NotFound />} />
            </Routes>
          </UniversalLayout>
        </BrowserRouter>
      </AuthProvider>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
