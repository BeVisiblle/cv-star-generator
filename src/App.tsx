import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AuthenticatedLayout } from "@/components/AuthenticatedLayout";
import { AuthProvider } from "@/hooks/useAuth";
import { CVFormProvider } from "@/contexts/CVFormContext";
import Index from "./pages/Index";
import NotFound from "./pages/NotFound";
import Blog from "./pages/Blog";
import Unternehmen from "./pages/Unternehmen";
import Datenschutz from "./pages/Datenschutz";
import Impressum from "./pages/Impressum";
import CVGenerator from "./components/CVGenerator";
import Auth from "./pages/Auth";
import Profile from "./pages/Profile";
import ProtectedRoute from "./components/ProtectedRoute";
import ExampleProfile from "./components/ExampleProfile";
import Dashboard from "./pages/Dashboard";
import Marketplace from "./pages/Marketplace";
import Settings from "./pages/Settings";

const queryClient = new QueryClient();

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
              <Route path="/example-profile" element={<ExampleProfile />} />
              <Route path="/blog" element={<Blog />} />
              <Route path="/unternehmen" element={<Unternehmen />} />
              <Route path="/datenschutz" element={<Datenschutz />} />
              <Route path="/impressum" element={<Impressum />} />
              
              {/* Protected Routes - Require Authentication */}
              <Route path="/cv-generator" element={
                <ProtectedRoute>
                  <CVGenerator />
                </ProtectedRoute>
              } />
              <Route path="/cv-layout-selector" element={
                <ProtectedRoute>
                  <CVGenerator />
                </ProtectedRoute>
              } />
              
              {/* Authenticated Routes with Sidebar */}
              <Route element={<AuthenticatedLayout />}>
                <Route path="/profile" element={<Profile />} />
                <Route path="/dashboard" element={<Dashboard />} />
                <Route path="/marketplace" element={<Marketplace />} />
                <Route path="/settings" element={<Settings />} />
              </Route>
              
              {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
              <Route path="*" element={<NotFound />} />
            </Routes>
          </CVFormProvider>
        </BrowserRouter>
      </AuthProvider>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
