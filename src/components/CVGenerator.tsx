import React from 'react';
import { useNavigate } from 'react-router-dom';
import { CVFormProvider, useCVForm } from '@/contexts/CVFormContext';
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
  const { currentStep, setCurrentStep, formData, isLayoutEditMode, validateStep, validationErrors } = useCVForm();
  const navigate = useNavigate();

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
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-8 max-w-2xl">
        {/* Header */}
        <div className="mb-8">
          <Button 
            variant="ghost" 
            onClick={handleBackToHome}
            className="mb-4"
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Zu meinem Profil
          </Button>
          
          {/* Quick Navigation für eingeloggte User */}
          <div className="mb-4 flex gap-2">
            <Button 
              variant="outline" 
              size="sm"
              onClick={() => navigate('/profile')}
            >
              Profil
            </Button>
            <Button 
              variant="outline" 
              size="sm"
              onClick={() => navigate('/dashboard')}
            >
              Dashboard
            </Button>
            <Button 
              variant="outline" 
              size="sm"
              onClick={() => navigate('/marketplace')}
            >
              Community
            </Button>
          </div>
          
          <div className="space-y-4">
            <h1 className="text-2xl font-bold text-foreground">
              {isLayoutEditMode ? 'CV-Layout bearbeiten' : 'CV-Generator'}
            </h1>
            <div className="space-y-2">
              <div className="flex justify-between text-sm text-muted-foreground">
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
        <div className="mb-8">
          {renderStep()}
        </div>

        {/* Validation Errors */}
        {Object.keys(validationErrors).length > 0 && (
          <div className="mb-8 p-4 bg-destructive/10 border border-destructive/20 rounded-lg">
            <h3 className="text-sm font-medium text-destructive mb-2">
              Bitte füllen Sie alle Pflichtfelder aus:
            </h3>
            <ul className="text-sm text-destructive space-y-1">
              {Object.values(validationErrors).map((error, index) => (
                <li key={index}>• {error}</li>
              ))}
            </ul>
          </div>
        )}

        {/* Navigation */}
        <div className="flex justify-between">
          <Button
            variant="outline"
            onClick={handlePrevious}
            disabled={isLayoutEditMode ? currentStep === 5 : currentStep === 1}
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Zurück
          </Button>

          {(isLayoutEditMode ? currentStep < 6 : currentStep < 7) && (
            <Button
              onClick={handleNext}
            >
              {currentStep === 5 ? 'Weiter zur Vorschau' : 'Weiter'}
              <ArrowRight className="h-4 w-4 ml-2" />
            </Button>
          )}
        </div>
      </div>
    </div>
  );
};

const CVGenerator = () => {
  return (
    <CVFormProvider>
      <CVGeneratorContent />
    </CVFormProvider>
  );
};

export default CVGenerator;