import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { OnboardingStep1 } from './OnboardingStep1';
import { OnboardingStep2 } from './OnboardingStep2';
import { OnboardingStep3 } from './OnboardingStep3';
import { OnboardingStep5 } from './OnboardingStep5';
import { useAuth } from '@/hooks/useAuth';

export interface OnboardingData {
  // Step 1
  companyName: string;
  email: string;
  password: string;
  phone: string;
  industry: string;
  location: string;
  
  // Step 2
  selectedPlan: 'free' | 'starter' | 'premium' | 'enterprise';
  
  // Step 3 - handled by Stripe
  
  // Step 4
  logo?: File;
  shortDescription: string;
  longDescription: string;
  companySize: string;
  benefits: string[];
  contactName: string;
  contactRole: string;
  contactEmail: string;
  
  // Step 5
  jobTitle: string;
  positions: number;
  jobLocation: string;
  startDate: Date | null;
  requirements: string[];
}

export function OnboardingWizard() {
  const [currentStep, setCurrentStep] = useState(1);
  const [data, setData] = useState<OnboardingData>({
    companyName: '',
    email: '',
    password: '',
    phone: '',
    industry: '',
    location: '',
    selectedPlan: 'free',
    shortDescription: '',
    longDescription: '',
    companySize: '',
    benefits: [],
    contactName: '',
    contactRole: '',
    contactEmail: '',
    jobTitle: '',
    positions: 1,
    jobLocation: '',
    startDate: null,
    requirements: [],
  });
  
  const navigate = useNavigate();
  const { user } = useAuth();

  const updateData = (newData: Partial<OnboardingData>) => {
    setData(prev => ({ ...prev, ...newData }));
  };

  const nextStep = () => {
    setCurrentStep(prev => Math.min(prev + 1, 4));
  };

  const prevStep = () => {
    setCurrentStep(prev => Math.max(prev - 1, 1));
  };

  const skipToStep = (step: number) => {
    setCurrentStep(step);
  };

  const progress = (currentStep / 4) * 100;

  const stepTitles = [
    "Unternehmensdaten",
    "Plan wählen", 
    "Was suchen Sie?",
    "Zahlungsdetails"
  ];

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-8 max-w-4xl">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold mb-2">
            Ihr Unternehmensprofil in wenigen Minuten erstellen
          </h1>
          <p className="text-muted-foreground">
            Schritt {currentStep} von 4: {stepTitles[currentStep - 1]}
          </p>
        </div>

        {/* Progress Bar */}
        <div className="mb-8">
          <Progress value={progress} className="h-2" />
          <div className="flex justify-between mt-2 text-sm text-muted-foreground">
            {stepTitles.map((title, index) => (
              <span key={index} className={index + 1 <= currentStep ? 'text-primary' : ''}>
                {index + 1}
              </span>
            ))}
          </div>
        </div>

        {/* Step Content */}
        <Card className="mb-8">
          <CardContent className="p-8">
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
              <OnboardingStep5 
                data={data} 
                updateData={updateData} 
                onNext={nextStep}
                onPrev={prevStep}
              />
            )}
            {currentStep === 4 && (
              <OnboardingStep3 
                data={data} 
                onNext={() => navigate('/company/dashboard')}
                onPrev={prevStep}
                onSkip={() => navigate('/company/dashboard')}
              />
            )}
          </CardContent>
        </Card>

        {/* Save & Continue Later */}
        <div className="text-center">
          <Button variant="ghost" onClick={() => navigate('/company/dashboard')}>
            Speichern & später fortfahren
          </Button>
        </div>
      </div>
    </div>
  );
}