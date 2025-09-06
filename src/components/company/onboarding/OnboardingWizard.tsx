import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { OnboardingStep1 } from './OnboardingStep1';
import { OnboardingStep2 } from './OnboardingStep2';
import { OnboardingStep3 } from './OnboardingStep3';
import { OnboardingStep4 } from './OnboardingStep4';
import { OnboardingStep5 } from './OnboardingStep5';
import Header from '@/components/marketing/Header';
import Footer from '@/components/marketing/Footer';

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

  return (
    <div className="min-h-screen bg-black">
      <Header variant="business" />
      
      <main className="min-h-screen">
        {/* Step Content */}
        <div className="pb-20">
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
      </main>
      
      <Footer />
    </div>
  );
}