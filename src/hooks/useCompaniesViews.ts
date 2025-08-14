import { useEffect, useState } from 'react';
import { CompanyService } from '@/services/companyService';
import type { CompanyLite, SuggestedCompany, CompaniesViewState } from '@/types/company';

export interface UseCompaniesViewsReturn extends CompaniesViewState {
  refetch: () => void;
}

/**
 * Hook for managing company views (pending, following, suggested)
 * @param profileId - ID of the profile to fetch companies for
 * @returns Company data organized by relationship type
 */
export function useCompaniesViews(profileId: string | null): UseCompaniesViewsReturn {
  const [state, setState] = useState<CompaniesViewState>({
    pending: [],
    following: [],
    suggested: [],
    loading: true,
    error: null,
  });

  const loadData = async () => {
    if (!profileId) {
      setState(prev => ({ ...prev, loading: false }));
      return;
    }
    
    setState(prev => ({ ...prev, loading: true, error: null }));

    const result = await CompanyService.fetchCompaniesViewData(profileId);
    
    setState({
      ...result.data,
      loading: false,
      error: result.error || null,
    });
  };

  useEffect(() => {
    loadData();
  }, [profileId]);

  const refetch = () => {
    if (profileId) {
      loadData();
    }
  };

  return { 
    ...state,
    refetch
  };
}