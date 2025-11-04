import { useEffect } from "react";
import { CompanySidebar } from "@/components/Company/CompanySidebar";
import { CompanyHeader } from "@/components/Company/CompanyHeader";
import { Outlet, Navigate } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";
import { useCompany } from "@/hooks/useCompany";
import BaseLayout from "@/components/layout/BaseLayout";
import { useCompanyOnboarding } from "@/hooks/useCompanyOnboarding";
import { BrancheSelector } from "@/components/company/onboarding/BrancheSelector";
import { TargetGroupSelector } from "@/components/company/onboarding/TargetGroupSelector";
import { PlanSelector } from "@/components/company/onboarding/PlanSelector";
import { WelcomePopup } from "@/components/company/onboarding/WelcomePopup";
import { supabase } from "@/integrations/supabase/client";
import { SidebarProvider } from "@/components/ui/sidebar";

export function CompanyLayout() {
  const { user, isLoading: authLoading } = useAuth();
  const { company, loading: companyLoading, refetch } = useCompany();
  const { loading: onboardingLoading, state, updateStep, completeOnboarding } = useCompanyOnboarding();

  // Check for pending company signup from magic link
  useEffect(() => {
    const processPendingSignup = async () => {
      if (!user || company) return;
      
      const pendingData = localStorage.getItem('pending_company_signup');
      if (!pendingData) return;

      try {
        const data = JSON.parse(pendingData);
        const { data: companyId, error } = await supabase.rpc('create_company_account', {
          p_name: data.companyName,
          p_primary_email: user.email || '',
          p_city: data.city,
          p_country: data.country,
          p_size_range: data.size,
          p_contact_person: data.contactPerson,
          p_phone: data.phone,
          p_created_by: user.id,
          p_website: data.website || null,
          p_industry: data.industry || null
        });

        if (!error && companyId) {
          // Update with plan info
          await supabase
            .from('companies')
            .update({ selected_plan_id: data.selectedPlan })
            .eq('id', companyId);
          
          localStorage.removeItem('pending_company_signup');
          await refetch();
        }
      } catch (err) {
        console.error('Error processing pending signup:', err);
      }
    };

    processPendingSignup();
  }, [user, company, refetch]);

  // Show loading state
  if (authLoading || companyLoading || onboardingLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-primary"></div>
      </div>
    );
  }

  // Redirect to auth if not authenticated
  if (!user) {
    return <Navigate to="/auth" replace />;
  }

  // Redirect to signup if no company
  if (!company) {
    return <Navigate to="/signup/company" replace />;
  }

  // Render onboarding popups if not completed
  const renderOnboardingPopup = () => {
    if (state.isComplete) return null;

    switch (state.currentStep) {
      case 0:
        return (
          <BrancheSelector
            onNext={(industry) => updateStep(1, { industry })}
          />
        );
      case 1:
        return (
          <TargetGroupSelector
            onNext={(targetGroups) => updateStep(2, { targetGroups })}
          />
        );
      case 2:
        return (
          <PlanSelector
            selectedPlanId={state.selectedPlanId}
            onNext={() => updateStep(3)}
          />
        );
      case 3:
        return (
          <WelcomePopup onComplete={completeOnboarding} />
        );
      default:
        return null;
    }
  };

  return (
    <SidebarProvider>
      <div className="min-h-screen flex w-full">
        <CompanySidebar />
        
        <main className="flex-1 flex flex-col">
          <CompanyHeader />
          
          {/* Main Content */}
          <div className="flex-1 p-0">
            <BaseLayout>
              <Outlet />
            </BaseLayout>
          </div>
        </main>

        {/* Onboarding Popups */}
        {renderOnboardingPopup()}
      </div>
    </SidebarProvider>
  );
}