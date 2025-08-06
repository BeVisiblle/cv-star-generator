import React, { createContext, useContext, useState, ReactNode, useEffect, useRef } from 'react';
import { syncCVDataToProfile, loadProfileDataToCV } from '@/utils/profileSync';
import { useAuthForCV } from '@/hooks/useAuthForCV';

export interface SchulbildungEntry {
  schulform: string;
  name: string;
  ort: string;
  plz?: string;
  zeitraum_von: string;
  zeitraum_bis: string;
  beschreibung?: string;
}

export interface BerufserfahrungEntry {
  titel: string;
  unternehmen: string;
  ort: string;
  plz?: string;
  zeitraum_von: string;
  zeitraum_bis: string;
  beschreibung?: string;
}

export interface SprachEntry {
  sprache: string;
  niveau: 'A1' | 'A2' | 'B1' | 'B2' | 'C1' | 'C2' | 'Muttersprache';
}

export interface CVFormData {
  // Step 1: Branch & Status
  branche?: 'handwerk' | 'it' | 'gesundheit' | 'buero' | 'verkauf' | 'gastronomie' | 'bau';
  status?: 'schueler' | 'azubi' | 'ausgelernt';
  
  // Step 2: Enhanced Personal Data
  vorname?: string;
  nachname?: string;
  geburtsdatum?: Date | string;
  strasse?: string;
  hausnummer?: string;
  plz?: string;
  ort?: string;
  telefon?: string;
  email?: string;
  profilbild?: File | string;
  avatar_url?: string;
  
  // Extended fields for enhanced profile
  has_drivers_license?: boolean;
  has_own_vehicle?: boolean;
  target_year?: string;
  visibility_industry?: string[];
  visibility_region?: string[];
  cover_image?: File | string;
  headline?: string;
  bio?: string;
  
  // Schüler specific
  schule?: string;
  geplanter_abschluss?: string;
  abschlussjahr?: string;
  
  // Azubi specific
  ausbildungsberuf?: string;
  ausbildungsbetrieb?: string;
  startjahr?: string;
  voraussichtliches_ende?: string;
  
  // Ausgelernt specific
  abschlussjahr_ausgelernt?: string;
  aktueller_beruf?: string;
  
  // Step 3: Skills & Motivation (internal use for AI generation)
  kenntnisse?: string;
  motivation?: string;
  praktische_erfahrung?: string;
  
  // Step 3: Languages & Skills for CV
  sprachen?: SprachEntry[];
  faehigkeiten?: string[];
  
  // Step 4: School & Work Experience
  schulbildung?: SchulbildungEntry[];
  berufserfahrung?: BerufserfahrungEntry[];
  
  // Step 5: Layout
  layout?: number;
  
  // AI-generated About Me
  ueberMich?: string;
  
  // Step 7: Consent
  einwilligung?: boolean;
}

interface CVFormContextType {
  formData: CVFormData;
  updateFormData: (data: Partial<CVFormData>) => void;
  currentStep: number;
  setCurrentStep: (step: number) => void;
  resetForm: () => void;
  isLayoutEditMode: boolean;
  setLayoutEditMode: (mode: boolean) => void;
  syncWithProfile: () => void;
  syncToProfile: () => Promise<void>;
  setAutoSyncEnabled: (enabled: boolean) => void;
}

const CVFormContext = createContext<CVFormContextType | undefined>(undefined);

export const CVFormProvider = ({ children }: { children: ReactNode }) => {
  const { user, profile } = useAuthForCV();
  
  const [formData, setFormData] = useState<CVFormData>({});
  const [autoSyncEnabled, setAutoSyncEnabled] = useState(true);
  const autoSyncTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  
  const [currentStep, setCurrentStep] = useState(() => {
    // Check if we're in layout edit mode
    const isLayoutEdit = localStorage.getItem('cvLayoutEditMode') === 'true';
    return isLayoutEdit ? 5 : 1;
  });
  
  const [isLayoutEditMode, setLayoutEditMode] = useState(() => {
    return localStorage.getItem('cvLayoutEditMode') === 'true';
  });

  // Clear any previous CV data on component mount (new session)
  useEffect(() => {
    localStorage.removeItem('cvFormData');
    console.log('CV Generator: Cleared previous session data');
  }, []);

  // Save layout edit mode to localStorage
  useEffect(() => {
    localStorage.setItem('cvLayoutEditMode', isLayoutEditMode.toString());
  }, [isLayoutEditMode]);


  // Load profile data into form ONLY if user has complete profile and specifically requests it
  const syncWithProfile = () => {
    if (profile && user && profile.profile_complete) {
      console.log('Loading complete profile data to CV form:', profile);
      const profileData = loadProfileDataToCV(profile);
      setFormData(profileData);
    }
  };

  // Sync form data to profile (only when user is logged in)
  const syncToProfile = async () => {
    if (!user?.id || !formData || Object.keys(formData).length === 0) {
      console.log(`[${new Date().toISOString()}] CVFormContext: Skipping sync - no user or empty formData`);
      return;
    }
    
    console.log(`[${new Date().toISOString()}] CVFormContext: Syncing CV data to profile...`, formData);
    
    try {
      await syncCVDataToProfile(user.id, formData);
      console.log(`[${new Date().toISOString()}] CVFormContext: Successfully synced CV data to profile`);
    } catch (error) {
      console.error(`[${new Date().toISOString()}] CVFormContext: Error syncing CV data to profile:`, error);
      throw error; // Re-throw for caller to handle
    }
  };

  const updateFormData = (data: Partial<CVFormData>) => {
    const newFormData = { ...formData, ...data };
    setFormData(newFormData);
    
    // Auto-sync to profile when user is logged in and auto-sync is enabled
    if (user?.id && autoSyncEnabled && Object.keys(newFormData).length > 1) {
      console.log(`[${new Date().toISOString()}] CVFormContext: Auto-sync enabled, scheduling sync...`);
      
      // Clear previous timeout
      if (autoSyncTimeoutRef.current) {
        clearTimeout(autoSyncTimeoutRef.current);
      }
      
      // Schedule new sync
      autoSyncTimeoutRef.current = setTimeout(async () => {
        try {
          await syncToProfile();
        } catch (error) {
          console.error(`[${new Date().toISOString()}] CVFormContext: Auto-sync failed:`, error);
        }
      }, 2000); // 2 seconds debounce
    }
  };

  const resetForm = () => {
    setFormData({});
    setCurrentStep(1);
    setLayoutEditMode(false);
    localStorage.removeItem('cvFormData');
    localStorage.removeItem('cvLayoutEditMode');
  };

  // Cleanup effect
  useEffect(() => {
    return () => {
      // Clear timeout on unmount
      if (autoSyncTimeoutRef.current) {
        clearTimeout(autoSyncTimeoutRef.current);
      }
    };
  }, []);

  return (
    <CVFormContext.Provider value={{
      formData,
      updateFormData,
      currentStep,
      setCurrentStep,
      resetForm,
      isLayoutEditMode,
      setLayoutEditMode,
      syncWithProfile,
      syncToProfile,
      setAutoSyncEnabled
    }}>
      {children}
    </CVFormContext.Provider>
  );
};

export const useCVForm = () => {
  const context = useContext(CVFormContext);
  if (!context) {
    throw new Error('useCVForm must be used within CVFormProvider');
  }
  return context;
};