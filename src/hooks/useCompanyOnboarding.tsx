import { useEffect, useState } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

export type OnboardingStep = 0 | 1 | 2 | 3 | 4;

export interface OnboardingState {
  currentStep: OnboardingStep;
  isComplete: boolean;
  industry?: string;
  targetGroups?: string[];
  selectedPlanId?: string;
}

export function useCompanyOnboarding() {
  const { user } = useAuth();
  const { toast } = useToast();
  const [loading, setLoading] = useState(true);
  const [state, setState] = useState<OnboardingState>({
    currentStep: 0,
    isComplete: false,
  });
  const [companyId, setCompanyId] = useState<string | null>(null);

  // Load current onboarding state
  useEffect(() => {
    const loadState = async () => {
      if (!user) {
        setLoading(false);
        return;
      }

      try {
        // Get user's company
        const { data: companyUser } = await supabase
          .from('company_users')
          .select('company_id')
          .eq('user_id', user.id)
          .maybeSingle();

        if (!companyUser) {
          setLoading(false);
          return;
        }

        setCompanyId(companyUser.company_id);

        // Get company onboarding state
        const { data: company } = await supabase
          .from('companies')
          .select('onboarding_step, onboarding_completed, industry, target_groups, selected_plan_id')
          .eq('id', companyUser.company_id)
          .single();

        if (company) {
          setState({
            currentStep: (company.onboarding_step || 0) as OnboardingStep,
            isComplete: company.onboarding_completed || false,
            industry: company.industry || undefined,
            targetGroups: company.target_groups ? (company.target_groups as string[]) : undefined,
            selectedPlanId: company.selected_plan_id || undefined,
          });
        }
      } catch (error) {
        console.error('Error loading onboarding state:', error);
      } finally {
        setLoading(false);
      }
    };

    loadState();
  }, [user]);

  const updateStep = async (step: OnboardingStep, data?: Partial<OnboardingState>) => {
    if (!companyId) return;

    try {
      const updateData: any = { onboarding_step: step };
      
      if (data?.industry) updateData.industry = data.industry;
      if (data?.targetGroups) updateData.target_groups = data.targetGroups;
      if (data?.selectedPlanId) updateData.selected_plan_id = data.selectedPlanId;

      const { error } = await supabase
        .from('companies')
        .update(updateData)
        .eq('id', companyId);

      if (error) throw error;

      setState(prev => ({
        ...prev,
        currentStep: step,
        ...data,
      }));
    } catch (error) {
      console.error('Error updating onboarding step:', error);
      toast({
        title: 'Fehler',
        description: 'Onboarding-Status konnte nicht aktualisiert werden',
        variant: 'destructive',
      });
    }
  };

  const completeOnboarding = async () => {
    if (!companyId) return;

    try {
      const { error } = await supabase
        .from('companies')
        .update({ 
          onboarding_completed: true,
          onboarding_step: 4 
        })
        .eq('id', companyId);

      if (error) throw error;

      setState(prev => ({
        ...prev,
        isComplete: true,
        currentStep: 4,
      }));
    } catch (error) {
      console.error('Error completing onboarding:', error);
      toast({
        title: 'Fehler',
        description: 'Onboarding konnte nicht abgeschlossen werden',
        variant: 'destructive',
      });
    }
  };

  return {
    loading,
    state,
    companyId,
    updateStep,
    completeOnboarding,
  };
}
