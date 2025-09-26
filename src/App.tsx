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
import { useSupabaseInit } from "@/hooks/useSupabaseInit";
import TopNavBar from "@/components/navigation/TopNavBar";
import { SidebarProvider } from "@/components/ui/sidebar";
import { LogoSpinner } from "@/components/shared/LoadingSkeleton";

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
const Profile = lazy(() => import("./pages/Profile"));
const Dashboard = lazy(() => import("./pages/Dashboard"));
const Marketplace = lazy(() => import("./pages/Marketplace"));
const Settings = lazy(() => import("./pages/Settings"));
const BaseLayout = lazy(() => import("@/components/layout/BaseLayout"));
const DiscoverAzubis = lazy(() => import("./pages/DiscoverAzubis"));
const DiscoverCompaniesPage = lazy(() => import("./pages/DiscoverCompanies"));
const ProduktAzubis = lazy(() => import("./pages/ProduktAzubis"));
const ProduktUnternehmen = lazy(() => import("./pages/ProduktUnternehmen"));
const CommunityContacts = lazy(() => import("./pages/Community/Contacts"));
const CommunityCompanies = lazy(() => import("./pages/Community/Companies"));
const CommunityMessages = lazy(() => import("./pages/Community/Messages"));
const CommunityJobs = lazy(() => import("./pages/Community/Jobs"));
const NotificationsPage = lazy(() => import("./pages/Notifications"));
const Feed = lazy(() => import("./pages/Feed"));

// New 6 Prompts Pages
const Jobs = lazy(() => import("./pages/Jobs"));
const ForYou = lazy(() => import("./pages/ForYou"));
const CompanyMatches = lazy(() => import("./pages/CompanyMatches"));
const NewCompanyDashboard = lazy(() => import("./pages/CompanyDashboard"));
const CandidateProfile = lazy(() => import("./pages/CandidateProfile"));
const DiscoverPeople = lazy(() => import("./pages/DiscoverPeople"));
const Discover = lazy(() => import("./pages/Discover"));

// Company components - lazy loaded
const CompanyLayout = lazy(() => import("@/components/Company/CompanyLayout").then(m => ({ default: m.CompanyLayout })));
const CompanyOnboarding = lazy(() => import("./pages/Company/Onboarding"));
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
const CompanyNeeds = lazy(() => import("./pages/Company/Needs"));

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
const Unternehmensregistrierung = lazy(() => import("./pages/Unternehmensregistrierung"));
const UnternehmenFeatures = lazy(() => import("./pages/UnternehmenFeatures"));

const queryClient = new QueryClient();

// Protected route for company pages
function CompanyProtectedRoute({ children }: { children: React.ReactNode }) {
  const { user } = useAuth();
  const [userType, setUserType] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    async function checkCompanyAccess() {
      // AUTO-ENABLE DEMO MODE for immediate company access
      console.log('Auto-enabling demo mode for company dashboard access');
      localStorage.setItem('demoMode', 'true');
      localStorage.setItem('demoCompanyData', JSON.stringify({
        id: 'demo-company-123',
        name: 'Demo Unternehmen GmbH',
        logo_url: null,
        industry: 'Technologie',
        main_location: 'Frankfurt',
        plan_type: 'starter',
        active_tokens: 50,
        seats: 5
      }));
      setUserType('company');
      setIsLoading(false);
      return;

      // Check demo mode FIRST and IMMEDIATELY
      const demoMode = localStorage.getItem('demoMode') === 'true';
      console.log('Demo mode check:', demoMode);
      
      if (demoMode) {
        console.log('Demo mode detected - allowing company access');
        setUserType('company');
        setIsLoading(false);
        return;
      }

      if (!user) {
        console.log('No user found');
        setIsLoading(false);
        return;
      }

      try {
        console.log('Checking company user for:', user.id);
        const { data: companyUser, error } = await supabase
          .from('company_users')
          .select('*')
          .eq('user_id', user.id)
          .single();

        console.log('Company user check result:', { data: companyUser, error });

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
    console.log('CompanyProtectedRoute: Loading...');
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-primary"></div>
      </div>
    );
  }

  console.log('CompanyProtectedRoute: User type:', userType, 'User:', !!user);

  if (!user && localStorage.getItem('demoMode') !== 'true') {
    console.log('No user and no demo mode - redirecting to auth');
    return <Navigate to="/auth" replace />;
  }

  if (userType !== 'company') {
    console.log('Not a company user - redirecting to onboarding');
    return <Navigate to="/company/onboarding" replace />;
  }

  console.log('Access granted to company routes');
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
    '/u/',
    '/jobs',
    '/foryou',
    '/feed'
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

const App = () => {
  const { isInitialized, error } = useSupabaseInit();

  // Show loading screen until Supabase is initialized
  if (!isInitialized) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-black">
        <LogoSpinner size="xl" text="CV Star Generator wird geladen..." />
      </div>
    );
  }

  // Show error screen if Supabase initialization failed
  if (error) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-background">
        <div className="text-center">
          <div className="text-red-500 mb-4">⚠️</div>
          <h1 className="text-xl font-semibold mb-2">Verbindungsfehler</h1>
          <p className="text-muted-foreground mb-4">{error}</p>
          <button 
            onClick={() => window.location.reload()} 
            className="px-4 py-2 bg-primary text-primary-foreground rounded-md hover:bg-primary/90"
          >
            Seite neu laden
          </button>
        </div>
      </div>
    );
  }

  return (
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
              <Route path="/unternehmen/onboarding" element={<Suspense fallback={<div className="flex items-center justify-center min-h-screen"><div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div></div>}><CompanyOnboarding /></Suspense>} />
              <Route path="/talent" element={<Suspense fallback={<div className="flex items-center justify-center min-h-screen"><div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div></div>}><BaseLayout><Talent /></BaseLayout></Suspense>} />
              <Route path="/datenschutz" element={<Suspense fallback={<div className="flex items-center justify-center min-h-screen"><div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div></div>}><Datenschutz /></Suspense>} />
              <Route path="/impressum" element={<Suspense fallback={<div className="flex items-center justify-center min-h-screen"><div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div></div>}><Impressum /></Suspense>} />
              <Route path="/agb" element={<Suspense fallback={<div className="flex items-center justify-center min-h-screen"><div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div></div>}><AGB /></Suspense>} />
              <Route path="/produkt/azubis" element={<Suspense fallback={<div className="flex items-center justify-center min-h-screen"><div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div></div>}><ProduktAzubis /></Suspense>} />
              <Route path="/produkt/unternehmen" element={<Suspense fallback={<div className="flex items-center justify-center min-h-screen"><div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div></div>}><ProduktUnternehmen /></Suspense>} />
              <Route path="/bootstrap/create-admin" element={<Suspense fallback={<div className="flex items-center justify-center min-h-screen"><div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div></div>}><BaseLayout><CreateAdmin /></BaseLayout></Suspense>} />
              
              {/* CV Generator - Open for everyone, but validates complete profiles */}
              <Route path="/cv-generator" element={<Suspense fallback={<div className="flex items-center justify-center min-h-screen"><div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div></div>}><CVGeneratorGate><CVGenerator /></CVGeneratorGate></Suspense>} />
              <Route path="/cv-layout-selector" element={<Suspense fallback={<div className="flex items-center justify-center min-h-screen"><div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div></div>}><CVGeneratorGate><CVGenerator /></CVGeneratorGate></Suspense>} />
              <Route path="/Lebenslauferstellen" element={<Suspense fallback={<div className="flex items-center justify-center min-h-screen"><div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div></div>}><CVGeneratorGate><CVGenerator /></CVGeneratorGate></Suspense>} />
              
              {/* Company registration pages */}
              <Route path="/unternehmensregistrierung" element={<Suspense fallback={<div className="flex items-center justify-center min-h-screen"><div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div></div>}><Unternehmensregistrierung /></Suspense>} />
              <Route path="/unternehmen/features" element={<Suspense fallback={<div className="flex items-center justify-center min-h-screen"><div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div></div>}><UnternehmenFeatures /></Suspense>} />
              
              {/* Company routes */}
              <Route path="/company/onboarding" element={<Suspense fallback={<div className="flex items-center justify-center min-h-screen"><div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div></div>}><CompanyOnboarding /></Suspense>} />
              <Route path="/company/dashboard-new" element={<Suspense fallback={<LogoSpinner size="lg" text="Dashboard wird geladen..." />}><NewCompanyDashboard /></Suspense>} />
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

                <Route path="needs" element={<Suspense fallback={<div className="flex items-center justify-center min-h-screen"><div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div></div>}><CompanyNeeds /></Suspense>} />
                <Route path="candidates/pipeline" element={<Suspense fallback={<div className="flex items-center justify-center min-h-screen"><div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div></div>}><CandidatesPipelinePage /></Suspense>} />
                <Route path="candidates/saved" element={<Suspense fallback={<div className="flex items-center justify-center min-h-screen"><div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div></div>}><CompanyComingSoon /></Suspense>} />
                <Route path="candidates/token-history" element={<Suspense fallback={<div className="flex items-center justify-center min-h-screen"><div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div></div>}><CompanyComingSoon /></Suspense>} />

                <Route path="community/groups" element={<Suspense fallback={<div className="flex items-center justify-center min-h-screen"><div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div></div>}><CompanyComingSoon /></Suspense>} />
                <Route path="community/events" element={<Suspense fallback={<div className="flex items-center justify-center min-h-screen"><div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div></div>}><CompanyComingSoon /></Suspense>} />

                <Route path="media/photos" element={<Suspense fallback={<div className="flex items-center justify-center min-h-screen"><div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div></div>}><CompanyComingSoon /></Suspense>} />
                <Route path="media/videos" element={<Suspense fallback={<div className="flex items-center justify-center min-h-screen"><div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div></div>}><CompanyComingSoon /></Suspense>} />

                <Route path="jobs" element={<Suspense fallback={<div className="flex items-center justify-center min-h-screen"><div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div></div>}><CompanyComingSoon /></Suspense>} />
                <Route path="jobs/new" element={<Suspense fallback={<div className="flex items-center justify-center min-h-screen"><div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div></div>}><CompanyComingSoon /></Suspense>} />
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
                
                {/* Company Matching Routes */}
                <Route path="matches" element={<Suspense fallback={<LogoSpinner size="lg" text="Matches werden geladen..." />}><CompanyMatches /></Suspense>} />
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
                <Route path="/settings" element={<Suspense fallback={<div className="flex items-center justify-center min-h-screen"><div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div></div>}><Settings /></Suspense>} />
                <Route path="/entdecken/azubis" element={<Suspense fallback={<div className="flex items-center justify-center min-h-screen"><div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div></div>}><DiscoverAzubis /></Suspense>} />
                <Route path="/entdecken/unternehmen" element={<Suspense fallback={<div className="flex items-center justify-center min-h-screen"><div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div></div>}><DiscoverCompaniesPage /></Suspense>} />
                <Route path="/u/:id" element={<Suspense fallback={<div className="flex items-center justify-center min-h-screen"><div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div></div>}><UserProfilePage /></Suspense>} />
                
                {/* Job-related pages */}
                <Route path="/jobs" element={<Suspense fallback={<LogoSpinner size="lg" text="Jobs werden geladen..." />}><Jobs /></Suspense>} />
                <Route path="/feed" element={<Suspense fallback={<LogoSpinner size="lg" text="Feed wird geladen..." />}><Feed /></Suspense>} />
                <Route path="/foryou" element={<Suspense fallback={<LogoSpinner size="lg" text="Empfehlungen werden geladen..." />}><ForYou /></Suspense>} />
                <Route path="/profile" element={<Suspense fallback={<LogoSpinner size="lg" text="Profil wird geladen..." />}><CandidateProfile /></Suspense>} />
                <Route path="/discover/people" element={<Suspense fallback={<LogoSpinner size="lg" text="Personen werden geladen..." />}><DiscoverPeople /></Suspense>} />
                <Route path="/discover/companies" element={<Suspense fallback={<LogoSpinner size="lg" text="Unternehmen werden geladen..." />}><DiscoverCompaniesPage /></Suspense>} />
                <Route path="/discover" element={<Suspense fallback={<LogoSpinner size="lg" text="Entdecken wird geladen..." />}><Discover /></Suspense>} />
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
};

export default App;
