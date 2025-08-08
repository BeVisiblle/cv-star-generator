import React, { useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useCVForm } from '@/contexts/CVFormContext';
import { Progress } from '@/components/ui/progress';
import { Button } from '@/components/ui/button';
import { ArrowLeft, ArrowRight } from 'lucide-react';
import CVStep1 from './cv-steps/CVStep1';
import CVStep2 from './cv-steps/CVStep2';
import CVStep3 from './cv-steps/CVStep3';
import CVStep4 from './cv-steps/CVStep4';
import CVStep5 from './cv-steps/CVStep5';
import CVStep6 from './cv-steps/CVStep6';
import CVStep7 from './cv-steps/CVStep7';

const CVGeneratorContent = () => {
  const { currentStep, setCurrentStep, formData, isLayoutEditMode, setLayoutEditMode, validateStep, validationErrors } = useCVForm();
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    if (location.pathname === '/cv-generator') {
      setLayoutEditMode(false);
      localStorage.removeItem('cvLayoutEditMode');
    }
  }, [location.pathname, setLayoutEditMode]);

  const renderStep = () => {
    // In layout edit mode, only show steps 5 and 6
    if (isLayoutEditMode) {
      switch (currentStep) {
        case 5: return <CVStep5 />;
        case 6: return <CVStep6 />;
        default: return <CVStep5 />;
      }
    }
    
    // Normal mode - show all steps
    switch (currentStep) {
      case 1: return <CVStep1 />;
      case 2: return <CVStep2 />;
      case 3: return <CVStep3 />;
      case 4: return <CVStep4 />;
      case 5: return <CVStep5 />;
      case 6: return <CVStep6 />;
      case 7: return <CVStep7 />;
      default: return <CVStep1 />;
    }
  };


  const handleNext = () => {
    if (isLayoutEditMode) {
      // In layout edit mode, only allow step 5 -> 6
      if (currentStep === 5 && validateStep(5)) {
        setCurrentStep(6);
      }
    } else {
      // Normal mode - validate current step before proceeding
      if (currentStep < 7 && validateStep(currentStep)) {
        setCurrentStep(currentStep + 1);
      }
    }
  };

  const handlePrevious = () => {
    if (isLayoutEditMode) {
      // In layout edit mode, only allow step 6 -> 5
      if (currentStep === 6) {
        setCurrentStep(5);
      }
    } else {
      // Normal mode
      if (currentStep > 1) {
        setCurrentStep(currentStep - 1);
      }
    }
  };

  const handleBackToHome = () => {
    if (isLayoutEditMode) {
      navigate('/profile');
    } else {
      navigate('/');
    }
  };

  return (
    <div className="min-h-screen bg-background overflow-x-hidden">
      <div className="container mx-auto px-4 py-4 md:py-8 pb-24 md:pb-8 pt-safe max-w-full md:max-w-2xl">
        {/* Header */}
        <div className="sticky top-0 z-30 mb-6 md:mb-8 bg-background/80 supports-[backdrop-filter]:bg-background/60 backdrop-blur border-b">
          <Button 
            variant="ghost" 
            onClick={handleBackToHome}
            className="mb-4 text-sm md:text-base min-h-[44px]"
            size="sm"
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            <span className="hidden sm:inline">Zu meinem Profil</span>
            <span className="sm:hidden">Zurück</span>
          </Button>
          
          {/* Quick Navigation für eingeloggte User */}
          <div className="mb-4 flex gap-1 md:gap-2 flex-wrap">
            <Button 
              variant="outline" 
              size="sm"
              onClick={() => navigate('/profile')}
              className="text-xs md:text-sm px-2 md:px-3"
            >
              Profil
            </Button>
            <Button 
              variant="outline" 
              size="sm"
              onClick={() => navigate('/dashboard')}
              className="text-xs md:text-sm px-2 md:px-3"
            >
              Dashboard
            </Button>
            <Button 
              variant="outline" 
              size="sm"
              onClick={() => navigate('/marketplace')}
              className="text-xs md:text-sm px-2 md:px-3"
            >
              Community
            </Button>
          </div>
          
          <div className="space-y-3 md:space-y-4">
            <h1 className="text-2xl md:text-2xl font-bold text-foreground">
              {isLayoutEditMode ? 'CV-Layout bearbeiten' : 'CV-Generator'}
            </h1>
            <div className="space-y-2">
              <div className="flex justify-between text-xs md:text-sm text-muted-foreground">
                {isLayoutEditMode ? (
                  <>
                    <span>Schritt {currentStep - 4} von 2</span>
                    <span>{Math.round(((currentStep - 4) / 2) * 100)}% abgeschlossen</span>
                  </>
                ) : (
                  <>
                    <span>Schritt {currentStep} von 7</span>
                    <span>{Math.round((currentStep / 7) * 100)}% abgeschlossen</span>
                  </>
                )}
              </div>
              <Progress 
                value={isLayoutEditMode ? ((currentStep - 4) / 2) * 100 : (currentStep / 7) * 100} 
                className="h-2" 
              />
            </div>
          </div>
        </div>

        {/* Step Content */}
        <div className="mb-6 md:mb-8 break-words">
          {renderStep()}
        </div>

        {/* Validation Errors */}
        {Object.keys(validationErrors).length > 0 && (
          <div className="mb-6 md:mb-8 p-3 md:p-4 bg-destructive/10 border border-destructive/20 rounded-lg">
            <h3 className="text-sm font-medium text-destructive mb-2">
              Bitte füllen Sie alle Pflichtfelder aus:
            </h3>
            <ul className="text-xs md:text-sm text-destructive space-y-1">
              {Object.values(validationErrors).map((error, index) => (
                <li key={index}>• {error}</li>
              ))}
            </ul>
          </div>
        )}

        {/* Navigation */}
        <div className="fixed inset-x-0 bottom-0 z-40 border-t bg-background/95 supports-[backdrop-filter]:bg-background/80 backdrop-blur px-4 py-3 pb-safe md:static md:bg-transparent md:border-0 md:px-0 md:py-0">
          <div className="container mx-auto max-w-full md:max-w-2xl flex justify-between gap-2">
            <Button
              variant="outline"
              onClick={handlePrevious}
              disabled={isLayoutEditMode ? currentStep === 5 : currentStep === 1}
              size="sm"
              className="flex-shrink-0 min-h-[44px]"
            >
              <ArrowLeft className="h-4 w-4 mr-1 md:mr-2" />
              <span className="hidden sm:inline">Zurück</span>
              <span className="sm:hidden">←</span>
            </Button>

            {(isLayoutEditMode ? currentStep < 6 : currentStep < 7) && (
              <Button
                onClick={handleNext}
                size="sm"
                className="flex-shrink-0 min-h-[44px]"
              >
                <span className="hidden sm:inline">
                  {currentStep === 5 ? 'Weiter zur Vorschau' : 'Weiter'}
                </span>
                <span className="sm:hidden">→</span>
                <ArrowRight className="h-4 w-4 ml-1 md:ml-2" />
              </Button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

const CVGenerator = () => {
  return <CVGeneratorContent />;
};

export default CVGenerator;