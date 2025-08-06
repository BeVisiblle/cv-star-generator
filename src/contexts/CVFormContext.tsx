import React, { createContext, useContext, useState, ReactNode } from 'react';

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
  geburtsdatum?: Date;
  strasse?: string;
  hausnummer?: string;
  plz?: string;
  ort?: string;
  telefon?: string;
  email?: string;
  profilbild?: File | string;
  
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
}

const CVFormContext = createContext<CVFormContextType | undefined>(undefined);

export const CVFormProvider = ({ children }: { children: ReactNode }) => {
  const [formData, setFormData] = useState<CVFormData>(() => {
    // Load from localStorage if available
    const saved = localStorage.getItem('cvFormData');
    return saved ? JSON.parse(saved) : {};
  });
  
  const [currentStep, setCurrentStep] = useState(() => {
    // Check if we're in layout edit mode
    const isLayoutEdit = localStorage.getItem('cvLayoutEditMode') === 'true';
    return isLayoutEdit ? 5 : 1;
  });
  
  const [isLayoutEditMode, setLayoutEditMode] = useState(() => {
    return localStorage.getItem('cvLayoutEditMode') === 'true';
  });

  // Save to localStorage whenever formData changes
  React.useEffect(() => {
    localStorage.setItem('cvFormData', JSON.stringify(formData));
  }, [formData]);

  // Save layout edit mode to localStorage
  React.useEffect(() => {
    localStorage.setItem('cvLayoutEditMode', isLayoutEditMode.toString());
  }, [isLayoutEditMode]);

  const updateFormData = (data: Partial<CVFormData>) => {
    setFormData(prev => ({ ...prev, ...data }));
  };

  const resetForm = () => {
    setFormData({});
    setCurrentStep(1);
    setLayoutEditMode(false);
    localStorage.removeItem('cvFormData');
    localStorage.removeItem('cvLayoutEditMode');
  };

  return (
    <CVFormContext.Provider value={{
      formData,
      updateFormData,
      currentStep,
      setCurrentStep,
      resetForm,
      isLayoutEditMode,
      setLayoutEditMode
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