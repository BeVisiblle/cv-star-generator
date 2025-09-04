import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { ArrowLeft, ArrowRight, Save, AlertCircle, CheckCircle } from 'lucide-react';
import { useProfileCreation, PROFILE_STEPS } from '@/hooks/useProfileCreation';
import { ProfileCreationProgress } from './ProfileCreationProgress';
import { BasicInfoStep } from './steps/BasicInfoStep';
import { LocationStep } from './steps/LocationStep';
import { ProfileDetailsStep } from './steps/ProfileDetailsStep';
import { SkillsStep } from './steps/SkillsStep';
import { ExperienceStep } from './steps/ExperienceStep';
import { CVStep } from './steps/CVStep';
import { TagsStep } from './steps/TagsStep';
import { toast } from '@/hooks/use-toast';
import { useAuth } from '@/hooks/useAuth';

export const ProfileCreationFlow: React.FC = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const {
    profileData,
    updateProfileData,
    currentStep,
    goToNextStep,
    goToPreviousStep,
    goToStep,
    validationErrors,
    validateStep,
    completedSteps,
    getProgress,
    isProfileComplete,
    commitProfile,
    isSubmitting,
    retryCount
  } = useProfileCreation();

  // Redirect if not authenticated
  useEffect(() => {
    if (!user) {
      toast({
        title: 'Anmeldung erforderlich',
        description: 'Bitte melden Sie sich an, um ein Profil zu erstellen.',
        variant: 'destructive'
      });
      navigate('/auth');
    }
  }, [user, navigate]);

  if (!user) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-primary"></div>
      </div>
    );
  }

  const currentStepData = PROFILE_STEPS.find(step => step.id === currentStep);
  const progressPercentage = getProgress();
  const canProceed = validateStep(currentStep);
  const isLastStep = currentStep === PROFILE_STEPS.length;
  const isComplete = isProfileComplete();

  const handleNext = async () => {
    if (isLastStep && isComplete) {
      // Final step - commit to Supabase
      const success = await commitProfile();
      if (success) {
        navigate('/profile');
      }
    } else {
      // Move to next step
      goToNextStep();
    }
  };

  const renderStepContent = () => {
    switch (currentStep) {
      case 1:
        return (
          <BasicInfoStep
            profileData={profileData}
            validationErrors={validationErrors}
            onUpdate={updateProfileData}
          />
        );
      case 2:
        return (
          <LocationStep
            profileData={profileData}
            validationErrors={validationErrors}
            onUpdate={updateProfileData}
          />
        );
      case 3:
        return (
          <ProfileDetailsStep
            profileData={profileData}
            validationErrors={validationErrors}
            onUpdate={updateProfileData}
          />
        );
      case 4:
        return (
          <SkillsStep
            profileData={profileData}
            validationErrors={validationErrors}
            onUpdate={updateProfileData}
          />
        );
      case 5:
        return (
          <ExperienceStep
            profileData={profileData}
            validationErrors={validationErrors}
            onUpdate={updateProfileData}
          />
        );
      case 6:
        return (
          <CVStep
            profileData={profileData}
            validationErrors={validationErrors}
            onUpdate={updateProfileData}
          />
        );
      case 7:
        return <TagsStep />;
      default:
        return null;
    }
  };

  return (
    <div className="min-h-screen bg-background py-4 px-2 md:py-8 md:px-4">
      <div className="container mx-auto max-w-6xl">
        {/* Header */}
        <div className="mb-6 md:mb-8">
          <div className="flex items-center gap-4 mb-4">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => navigate('/')}
              className="flex-shrink-0"
            >
              <ArrowLeft className="w-4 h-4 mr-2" />
              Zurück
            </Button>
            
            <div className="min-w-0 flex-1">
              <h1 className="text-xl md:text-2xl font-bold truncate">
                Profil erstellen
              </h1>
              <p className="text-sm text-muted-foreground">
                Schritt {currentStep} von {PROFILE_STEPS.length}: {currentStepData?.title}
              </p>
            </div>
          </div>
        </div>

        {/* Main Layout */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 md:gap-8">
          {/* Progress Sidebar - Mobile: Top, Desktop: Left */}
          <div className="lg:col-span-3">
            <div className="lg:sticky lg:top-8">
              <ProfileCreationProgress
                currentStep={currentStep}
                completedSteps={completedSteps}
                validationErrors={validationErrors}
                progressPercentage={progressPercentage}
                onStepClick={goToStep}
                isSubmitting={isSubmitting}
              />
            </div>
          </div>

          {/* Main Content */}
          <div className="lg:col-span-9">
            <div className="space-y-6">
              {/* Current Step Content */}
              <div className="min-h-[500px]">
                {renderStepContent()}
              </div>

              {/* Navigation */}
              <Card>
                <CardContent className="p-4 md:p-6">
                  <div className="flex items-center justify-between gap-4">
                    {/* Previous Button */}
                    <Button
                      variant="outline"
                      onClick={goToPreviousStep}
                      disabled={currentStep === 1 || isSubmitting}
                      className="flex-shrink-0"
                    >
                      <ArrowLeft className="w-4 h-4 mr-2" />
                      <span className="hidden sm:inline">Zurück</span>
                    </Button>

                    {/* Step Status & Validation */}
                    <div className="flex-1 text-center">
                      {canProceed ? (
                        <div className="flex items-center justify-center gap-2 text-accent">
                          <CheckCircle className="w-4 h-4" />
                          <span className="text-sm hidden md:inline">
                            Schritt vollständig
                          </span>
                        </div>
                      ) : (
                        <div className="flex items-center justify-center gap-2 text-muted-foreground">
                          <AlertCircle className="w-4 h-4" />
                          <span className="text-sm hidden md:inline">
                            Bitte vervollständigen
                          </span>
                        </div>
                      )}
                      
                      {/* Retry indicator */}
                      {retryCount > 0 && (
                        <p className="text-xs text-muted-foreground mt-1">
                          Wiederholungsversuch {retryCount}/3
                        </p>
                      )}
                    </div>

                    {/* Next/Submit Button */}
                    <Button
                      onClick={handleNext}
                      disabled={(!canProceed && !PROFILE_STEPS[currentStep - 1]?.required) || isSubmitting}
                      className="flex-shrink-0"
                    >
                      {isSubmitting ? (
                        <>
                          <div className="w-4 h-4 mr-2 animate-spin rounded-full border-2 border-primary-foreground/20 border-t-primary-foreground" />
                          <span className="hidden sm:inline">Speichern...</span>
                        </>
                      ) : isLastStep && isComplete ? (
                        <>
                          <Save className="w-4 h-4 mr-2" />
                          <span className="hidden sm:inline">Profil speichern</span>
                          <span className="sm:hidden">Speichern</span>
                        </>
                      ) : (
                        <>
                          <span className="hidden sm:inline">Weiter</span>
                          <span className="sm:hidden">Weiter</span>
                          <ArrowRight className="w-4 h-4 ml-2" />
                        </>
                      )}
                    </Button>
                  </div>
                </CardContent>
              </Card>

              {/* Final Step Warning */}
              {isLastStep && isComplete && (
                <Card className="border-accent/20 bg-accent/5">
                  <CardContent className="p-4">
                    <div className="flex items-start gap-3">
                      <CheckCircle className="w-5 h-5 text-accent mt-0.5 flex-shrink-0" />
                      <div>
                        <h4 className="font-medium text-foreground">
                          Bereit zum Abschließen
                        </h4>
                        <p className="text-sm text-muted-foreground mt-1">
                          Alle erforderlichen Daten sind ausgefüllt. Klicken Sie auf 
                          "Profil speichern", um Ihre Daten endgültig zu speichern 
                          und Ihr Profil zu aktivieren.
                        </p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProfileCreationFlow;