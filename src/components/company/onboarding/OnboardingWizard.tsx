import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { OnboardingStep1 } from './OnboardingStep1';
import { OnboardingStep2 } from './OnboardingStep2';
import { OnboardingStep3 } from './OnboardingStep3';
import { OnboardingStep4 } from './OnboardingStep4';
import { OnboardingStep5 } from './OnboardingStep5';
import { Building2 } from 'lucide-react';

export interface OnboardingData {
  // Step 1 - Personal & Company Info
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  companyName: string;
  companySize: string;
  lookingFor: string[];
  acceptedTerms: boolean;
  
  // Step 2 - Plan Selection
  selectedPlan: 'free' | 'starter' | 'premium';
  
  // Step 3 - handled by Stripe
  
  // Step 4 - Profile Setup
  logo?: File;
  coverImage?: File;
  location: string;
  contactPersonName: string;
  contactPersonRole: string;
  contactPersonEmail: string;
  shortDescription: string;
  website: string;
  linkedin: string;
  
  // Step 5 - Team Invites (optional)
  teamEmails: string[];
}

export function OnboardingWizard() {
  const [currentStep, setCurrentStep] = useState(1);
  const [data, setData] = useState<OnboardingData>({
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    companyName: '',
    companySize: '',
    lookingFor: [],
    acceptedTerms: false,
    selectedPlan: 'free',
    location: '',
    contactPersonName: '',
    contactPersonRole: '',
    contactPersonEmail: '',
    shortDescription: '',
    website: '',
    linkedin: '',
    teamEmails: []
  });
  
  const navigate = useNavigate();

  const updateData = (newData: Partial<OnboardingData>) => {
    setData(prev => ({ ...prev, ...newData }));
  };

  const nextStep = () => {
    setCurrentStep(prev => Math.min(prev + 1, 5));
  };

  const prevStep = () => {
    setCurrentStep(prev => Math.max(prev - 1, 1));
  };

  const skipToStep = (step: number) => {
    setCurrentStep(step);
  };

  const progress = (currentStep / 5) * 100;

  const stepTitles = [
    "Über dich & dein Unternehmen",
    "Plan wählen", 
    "Zahlungsdetails",
    "Profil einrichten",
    "Team einladen"
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-accent/5 to-primary/5">
      <div className="container mx-auto px-4 py-8 max-w-6xl">
        {/* Header */}
        <div className="flex items-center justify-center mb-8">
          <div className="flex items-center space-x-4">
            <div className="w-12 h-12 bg-primary rounded-lg flex items-center justify-center">
              <Building2 className="h-6 w-6 text-white" />
            </div>
            <div>
              <h1 className="text-3xl font-bold text-foreground">
                Endlich passende Mitarbeiter finden
              </h1>
              <p className="text-muted-foreground">
                Schritt {currentStep} von 5: {stepTitles[currentStep - 1]}
              </p>
            </div>
          </div>
        </div>

        {/* Progress Bar */}
        <div className="mb-8">
          <Progress value={progress} className="h-2" />
          <div className="flex justify-between mt-2 text-sm text-muted-foreground">
            {stepTitles.map((title, index) => (
              <span key={index} className={index + 1 <= currentStep ? 'text-primary font-medium' : ''}>
                {index + 1}
              </span>
            ))}
          </div>
        </div>

        {/* Step Content */}
        <div className="mb-8">
          {currentStep === 1 && (
            <OnboardingStep1 
              data={data} 
              updateData={updateData} 
              onNext={nextStep}
            />
          )}
          {currentStep === 2 && (
            <OnboardingStep2 
              data={data} 
              updateData={updateData} 
              onNext={nextStep}
              onPrev={prevStep}
            />
          )}
          {currentStep === 3 && (
            <OnboardingStep3 
              data={data} 
              onNext={nextStep}
              onPrev={prevStep}
              onSkip={() => skipToStep(4)}
            />
          )}
          {currentStep === 4 && (
            <OnboardingStep4 
              data={data} 
              updateData={updateData} 
              onNext={nextStep}
              onPrev={prevStep}
            />
          )}
          {currentStep === 5 && (
            <OnboardingStep5 
              data={data} 
              updateData={updateData} 
              onComplete={() => navigate('/company/dashboard')}
              onPrev={prevStep}
            />
          )}
        </div>

        {/* Save & Continue Later */}
        <div className="text-center">
          <button 
            onClick={() => navigate('/company/dashboard')}
            className="text-muted-foreground hover:text-foreground transition-colors"
          >
            Speichern & später fortfahren
          </button>
        </div>
      </div>
    </div>
  );
}