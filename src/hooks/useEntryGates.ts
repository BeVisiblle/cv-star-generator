import { useState, useCallback, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { useLoginCounter } from '@/hooks/useLoginCounter';

interface AddressData {
  zip: string;
  city: string;
  street?: string;
  houseNo?: string;
  lat?: number;
  lng?: number;
}

interface EntryGateState {
  showAddressModal: boolean;
  showVisibilityModal: boolean;
  showVisibilityBanner: boolean;
  addressData: AddressData | null;
  loading: boolean;
}

export function useEntryGates() {
  const { profile, user } = useAuth();
  const { loginCount } = useLoginCounter();
  const [state, setState] = useState<EntryGateState>({
    showAddressModal: false,
    showVisibilityModal: false,
    showVisibilityBanner: false,
    addressData: null,
    loading: false
  });

  const checkAddressConfirmation = useCallback(async () => {
    if (!user || !profile) return false;

    // Check if address is already confirmed from the profile
    if (profile.address_confirmed) {
      return false; // Already confirmed
    }

    // Get existing profile data for pre-filling
    const addressData: AddressData = {
      zip: profile?.plz || '',
      city: profile?.ort || '',
      street: profile?.strasse || '',
      houseNo: profile?.hausnummer || ''
    };

    setState(prev => ({
      ...prev,
      showAddressModal: true,
      addressData
    }));

    return true;
  }, [user, profile]);

  const checkVisibilityPrompt = useCallback(async () => {
    if (!user || !profile) return;

    const isFirstDashboard = !profile.first_dashboard_seen;
    const hasCompletedOnboarding = profile.onboarding_completed || profile.first_profile_saved;
    const isInvisible = profile.visibility_mode === 'invisible';

    // First time prompt (after onboarding completion)
    const qualifiesFirstPrompt = 
      hasCompletedOnboarding && 
      !profile.visibility_prompt_shown;

    // Cyclic prompt (every 3rd login when invisible)
    const needsCyclicPrompt = 
      isInvisible && 
      loginCount > 0 && 
      loginCount % 3 === 0 &&
      profile.visibility_prompt_shown;

    if (qualifiesFirstPrompt || needsCyclicPrompt) {
      setState(prev => ({
        ...prev,
        showVisibilityModal: true
      }));
    } else if (isInvisible && !needsCyclicPrompt) {
      // Show info banner when invisible but not on 3rd login
      setState(prev => ({
        ...prev,
        showVisibilityBanner: true
      }));
    }

    // Mark first dashboard visit
    if (isFirstDashboard) {
      await supabase
        .from('profiles')
        .update({ first_dashboard_seen: true })
        .eq('id', user.id);
    }
  }, [user, profile, loginCount]);

  const onNavigate = useCallback(async () => {
    if (!user) return;

    setState(prev => ({ ...prev, loading: true }));

    try {
      // First check address confirmation (blocking)
      const needsAddress = await checkAddressConfirmation();
      
      if (!needsAddress) {
        // Then check visibility prompt
        await checkVisibilityPrompt();
      }
    } finally {
      setState(prev => ({ ...prev, loading: false }));
    }
  }, [user, checkAddressConfirmation, checkVisibilityPrompt]);

  const saveAddress = useCallback(async (addressData: AddressData) => {
    if (!user) throw new Error('No user');

    try {
      // Update profile with address and mark as confirmed
      const { error } = await supabase
        .from('profiles')
        .update({
          plz: addressData.zip,
          ort: addressData.city,
          strasse: addressData.street || null,
          hausnummer: addressData.houseNo || null,
          address_confirmed: true
        })
        .eq('id', user.id);

      if (error) throw error;

      setState(prev => ({
        ...prev,
        showAddressModal: false,
        addressData: null
      }));

      // After address confirmation, check visibility
      await checkVisibilityPrompt();
    } catch (error) {
      console.error('Failed to save address:', error);
      throw error;
    }
  }, [user, checkVisibilityPrompt]);

  const saveVisibilityChoice = useCallback(async (choice: 'visible' | 'invisible') => {
    if (!user) return;

    try {
      const { error } = await supabase
        .from('profiles')
        .update({
          visibility_mode: choice,
          visibility_prompt_shown: true
        })
        .eq('id', user.id);

      if (error) {
        console.error('Failed to save visibility choice:', error);
        return;
      }

      setState(prev => ({
        ...prev,
        showVisibilityModal: false,
        showVisibilityBanner: choice === 'invisible'
      }));
    } catch (error) {
      console.error('Failed to save visibility choice:', error);
    }
  }, [user]);

  const closeVisibilityModal = useCallback(() => {
    setState(prev => ({
      ...prev,
      showVisibilityModal: false
    }));
  }, []);

  const openVisibilityModal = useCallback(() => {
    setState(prev => ({
      ...prev,
      showVisibilityModal: true,
      showVisibilityBanner: false
    }));
  }, []);

  const closeVisibilityBanner = useCallback(() => {
    setState(prev => ({
      ...prev,
      showVisibilityBanner: false
    }));
  }, []);

  return {
    ...state,
    onNavigate,
    saveAddress,
    saveVisibilityChoice,
    closeVisibilityModal,
    openVisibilityModal,
    closeVisibilityBanner
  };
}