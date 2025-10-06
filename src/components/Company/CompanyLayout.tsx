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

export function CompanyLayout() {
  const { user, isLoading: authLoading } = useAuth();
  const { company, loading: companyLoading } = useCompany();
  const { loading: onboardingLoading, state, updateStep, completeOnboarding } = useCompanyOnboarding();

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
  );
}