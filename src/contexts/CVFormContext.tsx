import React, { createContext, useContext, useState, ReactNode } from 'react';

export interface SchulbildungEntry {
  schule: string;
  abschluss: string;
  zeitraum_von: string;
  zeitraum_bis: string;
}

export interface BerufserfahrungEntry {
  firma: string;
  taetigkeiten: string;
  zeitraum_von: string;
  zeitraum_bis: string;
}

export interface CVFormData {
  // Step 1: Branch & Status
  branche?: 'handwerk' | 'it' | 'gesundheit';
  status?: 'schueler' | 'azubi' | 'ausgelernt';
  
  // Step 2: Personal Data
  vorname?: string;
  nachname?: string;
  geburtsdatum?: Date;
  wohnort?: string;
  profilbild?: File | string; // New: Mandatory profile picture
  
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
  
  // Step 3: Skills & Motivation
  kenntnisse?: string;
  motivation?: string;
  praktische_erfahrung?: string;
  
  // Step 4: School & Work Experience
  schulbildung?: SchulbildungEntry[];
  berufserfahrung?: BerufserfahrungEntry[];
  
  // Step 5: Layout
  layout?: number;
  
  // Step 7: Consent
  einwilligung?: boolean;
}

interface CVFormContextType {
  formData: CVFormData;
  updateFormData: (data: Partial<CVFormData>) => void;
  currentStep: number;
  setCurrentStep: (step: number) => void;
  resetForm: () => void;
}

const CVFormContext = createContext<CVFormContextType | undefined>(undefined);

export const CVFormProvider = ({ children }: { children: ReactNode }) => {
  const [formData, setFormData] = useState<CVFormData>({});
  const [currentStep, setCurrentStep] = useState(1);

  const updateFormData = (data: Partial<CVFormData>) => {
    setFormData(prev => ({ ...prev, ...data }));
  };

  const resetForm = () => {
    setFormData({});
    setCurrentStep(1);
  };

  return (
    <CVFormContext.Provider value={{
      formData,
      updateFormData,
      currentStep,
      setCurrentStep,
      resetForm
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