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
}

const CVFormContext = createContext<CVFormContextType | undefined>(undefined);

export const CVFormProvider = ({ children }: { children: ReactNode }) => {
  const [formData, setFormData] = useState<CVFormData>(() => {
    // Try to load existing CV edit data from localStorage
    const savedEditData = localStorage.getItem('cvEditData');
    if (savedEditData) {
      try {
        const editData = JSON.parse(savedEditData);
        localStorage.removeItem('cvEditData'); // Clear after loading
        return {
          branche: editData.branche,
          status: editData.status,
          vorname: editData.vorname,
          nachname: editData.nachname,
          geburtsdatum: editData.geburtsdatum ? new Date(editData.geburtsdatum) : undefined,
          strasse: editData.strasse,
          hausnummer: editData.hausnummer,
          plz: editData.plz,
          ort: editData.ort,
          telefon: editData.telefon,
          email: editData.email,
          profilbild: editData.avatar_url,
          has_drivers_license: editData.has_drivers_license,
          has_own_vehicle: editData.has_own_vehicle,
          target_year: editData.target_year,
          visibility_industry: editData.visibility_industry || [],
          visibility_region: editData.visibility_region || [],
          ueberMich: editData.uebermich || editData.bio,
          kenntnisse: editData.kenntnisse,
          motivation: editData.motivation,
          praktische_erfahrung: editData.praktische_erfahrung,
          schulbildung: editData.schulbildung || [],
          berufserfahrung: editData.berufserfahrung || [],
          sprachen: editData.sprachen || [],
          faehigkeiten: editData.faehigkeiten || [],
          layout: editData.layout || 1,
          schule: editData.schule,
          geplanter_abschluss: editData.geplanter_abschluss,
          abschlussjahr: editData.abschlussjahr,
          ausbildungsberuf: editData.ausbildungsberuf,
          ausbildungsbetrieb: editData.ausbildungsbetrieb,
          startjahr: editData.startjahr,
          voraussichtliches_ende: editData.voraussichtliches_ende,
          abschlussjahr_ausgelernt: editData.abschlussjahr_ausgelernt,
          aktueller_beruf: editData.aktueller_beruf,
          einwilligung: editData.einwilligung,
          headline: editData.headline
        };
      } catch (error) {
        console.error('Error loading CV edit data:', error);
      }
    }
    return {};
  });
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