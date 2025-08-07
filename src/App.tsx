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
import CVGenerator from "./components/CVGenerator";
import Auth from "./pages/Auth";
import Profile from "./pages/Profile";
import Dashboard from "./pages/Dashboard";
import Marketplace from "./pages/Marketplace";
import Settings from "./pages/Settings";

// Company components
import { CompanyLayout } from "@/components/Company/CompanyLayout";
import CompanyOnboarding from "@/pages/Company/Onboarding";
import CompanyDashboardNew from "@/pages/Company/Dashboard";
import CompanyProfile from "@/pages/Company/Profile";
import CompanySearch from "@/pages/Company/Search";
import CompanySettings from "@/pages/Company/Settings";
import CompanyPosts from "@/pages/Company/Posts";
import CompanyProfileView from "@/pages/Company/ProfileView";

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
          <CVFormProvider>
            <Routes>
              <Route path="/" element={<Index />} />
              <Route path="/auth" element={<Auth />} />
              <Route path="/blog" element={<Blog />} />
              <Route path="/unternehmen" element={<Unternehmen />} />
              <Route path="/datenschutz" element={<Datenschutz />} />
              <Route path="/impressum" element={<Impressum />} />
              
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
                <Route path="settings" element={<CompanySettings />} />
                <Route path="posts" element={<CompanyPosts />} />
                <Route path="profile/:id" element={<CompanyProfileView />} />
              </Route>
              
              {/* Authenticated routes */}
              <Route element={<AuthenticatedLayout />}>
                <Route path="/profile" element={<Profile />} />
                <Route path="/dashboard" element={<Dashboard />} />
                <Route path="/marketplace" element={<Marketplace />} />
                <Route path="/settings" element={<Settings />} />
              </Route>
                
              {/* Legacy redirects */}
              <Route path="/company-dashboard" element={<Navigate to="/company/dashboard" replace />} />
              
              {/* 404 */}
              <Route path="*" element={<NotFound />} />
            </Routes>
          </CVFormProvider>
        </BrowserRouter>
      </AuthProvider>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
