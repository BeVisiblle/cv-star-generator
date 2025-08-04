import React from 'react';
import { CVFormProvider, useCVForm } from '@/contexts/CVFormContext';
import { Progress } from '@/components/ui/progress';
import { Button } from '@/components/ui/button';
import { ArrowLeft, ArrowRight } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import CVStep1 from './cv-steps/CVStep1';
import CVStep2 from './cv-steps/CVStep2';
import CVStep3 from './cv-steps/CVStep3';
import CVStep4 from './cv-steps/CVStep4';
import CVStep5 from './cv-steps/CVStep5';
import CVStep6 from './cv-steps/CVStep6';
import CVStep7 from './cv-steps/CVStep7';

const CVGeneratorContent = () => {
  const { currentStep, setCurrentStep, formData } = useCVForm();
  const navigate = useNavigate();

  const renderStep = () => {
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

  const canGoNext = () => {
    switch (currentStep) {
      case 1:
        return formData.branche && formData.status;
      case 2:
        return formData.vorname && formData.nachname && formData.geburtsdatum && 
               formData.strasse && formData.hausnummer && formData.plz && 
               formData.ort && formData.email && formData.profilbild;
      case 3:
        return formData.kenntnisse && formData.motivation;
      case 4:
        return formData.schulbildung && formData.schulbildung.length > 0;
      case 5:
        return formData.layout;
      default:
        return true;
    }
  };

  const handleNext = () => {
    if (currentStep < 7 && canGoNext()) {
      setCurrentStep(currentStep + 1);
    }
  };

  const handlePrevious = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1);
    }
  };

  const handleBackToHome = () => {
    navigate('/');
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
            Zurück zur Startseite
          </Button>
          
          <div className="space-y-4">
            <h1 className="text-2xl font-bold text-foreground">
              CV-Generator
            </h1>
            <div className="space-y-2">
              <div className="flex justify-between text-sm text-muted-foreground">
                <span>Schritt {currentStep} von 7</span>
                <span>{Math.round((currentStep / 7) * 100)}% abgeschlossen</span>
              </div>
              <Progress value={(currentStep / 7) * 100} className="h-2" />
            </div>
          </div>
        </div>

        {/* Step Content */}
        <div className="mb-8">
          {renderStep()}
        </div>

        {/* Navigation */}
        <div className="flex justify-between">
          <Button
            variant="outline"
            onClick={handlePrevious}
            disabled={currentStep === 1}
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Zurück
          </Button>

          {currentStep < 7 && (
            <Button
              onClick={handleNext}
              disabled={!canGoNext()}
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