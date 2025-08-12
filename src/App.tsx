import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { AuthenticatedLayout } from "@/components/AuthenticatedLayout";
import { AuthProvider } from "@/hooks/useAuth";
import { CVFormProvider } from "@/contexts/CVFormContext";
import { CVGeneratorGate } from "@/components/CVGeneratorGate";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";
import { useEffect, useState } from "react";
import Index from "./pages/Index";
import NotFound from "./pages/NotFound";
import Blog from "./pages/Blog";
import Unternehmen from "./pages/Unternehmen";
import Datenschutz from "./pages/Datenschutz";
import Impressum from "./pages/Impressum";
import Talent from "./pages/Talent";
import CVGenerator from "./components/CVGenerator";
import Auth from "./pages/Auth";
import Profile from "./pages/Profile";
import Dashboard from "./pages/Dashboard";
import Marketplace from "./pages/Marketplace";
import Settings from "./pages/Settings";
import BaseLayout from "@/components/layout/BaseLayout";
import DiscoverAzubis from "./pages/DiscoverAzubis";
import DiscoverCompanies from "./pages/DiscoverCompanies";
import CommunityContacts from "./pages/Community/Contacts";
import CommunityCompanies from "./pages/Community/Companies";
import CommunityMessages from "./pages/Community/Messages";
import CommunityJobs from "./pages/Community/Jobs";

// Company components
import { CompanyLayout } from "@/components/Company/CompanyLayout";
import CompanyOnboarding from "@/pages/Company/Onboarding";
import CompanyDashboardNew from "@/pages/Company/Dashboard";
import CompanyProfile from "@/pages/Company/Profile";
import CompanySearch from "@/pages/Company/Search";
import CompanySettings from "@/pages/Company/Settings";
import CompanyPosts from "@/pages/Company/Posts";
import CompanyProfileView from "@/pages/Company/ProfileView";
import CompanyBilling from "@/pages/Company/Billing";
import CompanyUnlocked from "@/pages/Company/Unlocked";
import CompanyComingSoon from "@/pages/Company/ComingSoon";
import CompanyFeed from "@/pages/Company/Feed";
import AdminLayout from "./pages/Admin/AdminLayout";
import PagesList from "./pages/Admin/PagesList";
import PageEditor from "./pages/Admin/PageEditor";
import SeoInsights from "./pages/Admin/SeoInsights";
import ScheduledPosts from "./pages/Admin/ScheduledPosts";
import AdminSettings from "./pages/Admin/AdminSettings";
import PublicPage from "./pages/PublicPage";
import UserProfilePage from "./pages/UserProfile";
import PublicCompanyView from "./pages/Companies/PublicCompanyView";
import Overview from "./pages/Admin/Overview";
import UsersPage from "./pages/Admin/Users";
import CompaniesPage from "./pages/Admin/Companies";
import PlansPage from "./pages/Admin/Plans";
import JobsPage from "./pages/Admin/Jobs";
import MatchesPage from "./pages/Admin/Matches";
import AnalyticsPage from "./pages/Admin/Analytics";
import ContentPage from "./pages/Admin/Content";
import SupportPage from "./pages/Admin/Support";
import AdminAuthGate from "@/components/admin/AdminAuthGate";
import CreateAdmin from "./pages/Admin/CreateAdmin";

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

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <AuthProvider>
        <Toaster />
        <Sonner />
        <BrowserRouter>
            <Routes>
              <Route path="/" element={<BaseLayout><Index /></BaseLayout>} />
              <Route path="/auth" element={<Auth />} />
              <Route path="/blog" element={<Blog />} />
              <Route path="/blog/:slug" element={<PublicPage />} />
              <Route path="/p/:slug" element={<PublicPage />} />
              <Route path="/unternehmen" element={<Unternehmen />} />
              <Route path="/talent" element={<BaseLayout><Talent /></BaseLayout>} />
              <Route path="/datenschutz" element={<Datenschutz />} />
              <Route path="/impressum" element={<Impressum />} />
              <Route path="/bootstrap/create-admin" element={<BaseLayout><CreateAdmin /></BaseLayout>} />
              
              {/* CV Generator - Open for everyone, but validates complete profiles */}
              <Route path="/cv-generator" element={<CVGeneratorGate><CVGenerator /></CVGeneratorGate>} />
              <Route path="/cv-layout-selector" element={<CVGeneratorGate><CVGenerator /></CVGeneratorGate>} />
              
              {/* Company routes */}
              <Route path="/company/onboarding" element={<CompanyOnboarding />} />
              <Route
                path="/company/*"
                element={
                  <CompanyProtectedRoute>
                    <CompanyLayout />
                  </CompanyProtectedRoute>
                }
              >
                <Route path="dashboard" element={<CompanyDashboardNew />} />
                <Route path="profile" element={<CompanyProfile />} />
                <Route path="search" element={<CompanySearch />} />
                <Route path="unlocked" element={<CompanyUnlocked />} />
                <Route path="billing" element={<CompanyBilling />} />
                <Route path="settings" element={<CompanySettings />} />
                <Route path="posts" element={<CompanyPosts />} />
                <Route path="feed" element={<CompanyFeed />} />
                <Route path="profile/:id" element={<CompanyProfileView />} />

                {/* Coming Soon routes */}
                <Route path="candidates/pipeline" element={<CompanyComingSoon />} />
                <Route path="candidates/saved" element={<CompanyComingSoon />} />
                <Route path="candidates/token-history" element={<CompanyComingSoon />} />

                <Route path="community/groups" element={<CompanyComingSoon />} />
                <Route path="community/events" element={<CompanyComingSoon />} />

                <Route path="media/photos" element={<CompanyComingSoon />} />
                <Route path="media/videos" element={<CompanyComingSoon />} />

                <Route path="jobs" element={<CompanyComingSoon />} />
                <Route path="jobs/new" element={<CompanyComingSoon />} />
                <Route path="jobs/:id/applicants" element={<CompanyComingSoon />} />

                <Route path="insights/views" element={<CompanyComingSoon />} />
                <Route path="insights/reach" element={<CompanyComingSoon />} />
                <Route path="insights/engagement" element={<CompanyComingSoon />} />
                <Route path="insights/followers" element={<CompanyComingSoon />} />

                <Route path="settings/team" element={<CompanyComingSoon />} />
                <Route path="settings/notifications" element={<CompanyComingSoon />} />

                <Route path="help/center" element={<CompanyComingSoon />} />
                <Route path="help/support" element={<CompanyComingSoon />} />
                <Route path="help/feedback" element={<CompanyComingSoon />} />
              </Route>
              
              {/* Authenticated routes */}
              <Route element={<AuthenticatedLayout />}>
                <Route path="/profile" element={<Profile />} />
                <Route path="/dashboard" element={<Dashboard />} />
                <Route path="/marketplace" element={<Marketplace />} />
                <Route path="/companies/:id" element={<PublicCompanyView />} />
                <Route path="/community/contacts" element={<CommunityContacts />} />
                <Route path="/community/companies" element={<CommunityCompanies />} />
                <Route path="/community/messages" element={<CommunityMessages />} />
                <Route path="/community/jobs" element={<CommunityJobs />} />
                <Route path="/settings" element={<Settings />} />
                <Route path="/entdecken/azubis" element={<DiscoverAzubis />} />
                <Route path="/entdecken/unternehmen" element={<DiscoverCompanies />} />
                <Route path="/u/:id" element={<UserProfilePage />} />
              </Route>

              {/* Admin routes */}
              <Route path="/admin" element={<AdminLayout />}>
                <Route index element={<Overview />} />
                <Route path="users" element={<UsersPage />} />
                <Route path="companies" element={<CompaniesPage />} />
                <Route path="plans" element={<PlansPage />} />
                <Route path="jobs" element={<JobsPage />} />
                <Route path="matches" element={<MatchesPage />} />
                <Route path="analytics" element={<AnalyticsPage />} />
                <Route path="content" element={<ContentPage />} />
                {/* Legacy content routes remain accessible */}
                <Route path="pages" element={<PagesList />} />
                <Route path="pages/new" element={<PageEditor />} />
                <Route path="pages/:id" element={<PageEditor />} />
                <Route path="seo" element={<SeoInsights />} />
                <Route path="scheduled" element={<ScheduledPosts />} />
                <Route path="settings" element={<AdminSettings />} />
              </Route>
                
              {/* Legacy redirects */}
              <Route path="/company-dashboard" element={<Navigate to="/company/dashboard" replace />} />
              
              {/* 404 */}
              <Route path="*" element={<NotFound />} />
            </Routes>
        </BrowserRouter>
      </AuthProvider>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
