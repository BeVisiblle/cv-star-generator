import React from 'react';
import { CheckCircle, Circle, AlertCircle, Clock } from 'lucide-react';
import { Progress } from '@/components/ui/progress';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { PROFILE_STEPS, type ValidationErrors } from '@/hooks/useProfileCreation';

interface ProfileCreationProgressProps {
  currentStep: number;
  completedSteps: number[];
  validationErrors: ValidationErrors;
  progressPercentage: number;
  onStepClick: (stepId: number) => void;
  isSubmitting: boolean;
}

export const ProfileCreationProgress: React.FC<ProfileCreationProgressProps> = ({
  currentStep,
  completedSteps,
  validationErrors,
  progressPercentage,
  onStepClick,
  isSubmitting
}) => {
  const getStepStatus = (stepId: number) => {
    if (completedSteps.includes(stepId)) return 'completed';
    if (stepId === currentStep) return 'current';
    if (validationErrors[stepId]?.length > 0) return 'error';
    return 'pending';
  };

  const getStepIcon = (stepId: number) => {
    const status = getStepStatus(stepId);
    
    switch (status) {
      case 'completed':
        return <CheckCircle className="w-5 h-5 text-accent" />;
      case 'current':
        return isSubmitting ? (
          <Clock className="w-5 h-5 text-primary animate-spin" />
        ) : (
          <Circle className="w-5 h-5 text-primary fill-primary" />
        );
      case 'error':
        return <AlertCircle className="w-5 h-5 text-destructive" />;
      default:
        return <Circle className="w-5 h-5 text-muted-foreground" />;
    }
  };

  return (
    <div className="bg-card border rounded-lg p-4 md:p-6 space-y-4">
      {/* Overall Progress */}
      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <h3 className="font-semibold text-foreground">
            Profil Erstellung
          </h3>
          <span className="text-sm text-muted-foreground">
            {progressPercentage}% abgeschlossen
          </span>
        </div>
        <Progress value={progressPercentage} className="w-full" />
      </div>

      {/* Steps List - Mobile: Horizontal scroll, Desktop: Vertical */}
      <div className="space-y-2">
        <h4 className="text-sm font-medium text-muted-foreground mb-3">
          Schritte
        </h4>
        
        {/* Mobile: Horizontal scrollable */}
        <div className="flex md:hidden gap-2 overflow-x-auto pb-2 -mx-2 px-2">
          {PROFILE_STEPS.map((step) => {
            const status = getStepStatus(step.id);
            const hasErrors = validationErrors[step.id]?.length > 0;
            
            return (
              <Button
                key={step.id}
                variant={status === 'current' ? 'default' : 'ghost'}
                size="sm"
                onClick={() => onStepClick(step.id)}
                disabled={isSubmitting}
                className={cn(
                  'flex-shrink-0 min-w-24 h-auto flex-col gap-1 p-2',
                  status === 'completed' && 'text-accent',
                  hasErrors && 'text-destructive border-destructive',
                )}
              >
                {getStepIcon(step.id)}
                <span className="text-xs font-medium">
                  {step.id}
                </span>
              </Button>
            );
          })}
        </div>

        {/* Desktop: Vertical list */}
        <div className="hidden md:block space-y-1">
          {PROFILE_STEPS.map((step) => {
            const status = getStepStatus(step.id);
            const hasErrors = validationErrors[step.id]?.length > 0;
            
            return (
              <Button
                key={step.id}
                variant="ghost"
                onClick={() => onStepClick(step.id)}
                disabled={isSubmitting}
                className={cn(
                  'w-full justify-start p-3 h-auto',
                  status === 'current' && 'bg-primary/10 border border-primary/20',
                  status === 'completed' && 'text-accent',
                  hasErrors && 'text-destructive',
                )}
              >
                <div className="flex items-center gap-3 min-w-0 flex-1">
                  {getStepIcon(step.id)}
                  
                  <div className="flex-1 min-w-0 text-left">
                    <div className="font-medium truncate">
                      {step.title}
                      {step.required && <span className="text-destructive ml-1">*</span>}
                    </div>
                    <div className="text-xs text-muted-foreground truncate">
                      {step.description}
                    </div>
                    
                    {/* Show validation errors */}
                    {hasErrors && (
                      <div className="text-xs text-destructive mt-1">
                        {validationErrors[step.id][0]}
                      </div>
                    )}
                  </div>
                </div>
              </Button>
            );
          })}
        </div>
      </div>

      {/* Profile Status Banner */}
      {progressPercentage < 100 && (
        <div className="bg-muted/50 border border-muted rounded-lg p-3">
          <div className="flex items-start gap-2">
            <AlertCircle className="w-4 h-4 text-muted-foreground mt-0.5 flex-shrink-0" />
            <div className="text-sm">
              <p className="font-medium text-foreground">
                Profil unvollständig
              </p>
              <p className="text-muted-foreground">
                Vervollständigen Sie alle Schritte mit *, um Ihr Profil zu aktivieren.
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Success Banner */}
      {progressPercentage === 100 && (
        <div className="bg-accent/10 border border-accent/20 rounded-lg p-3">
          <div className="flex items-start gap-2">
            <CheckCircle className="w-4 h-4 text-accent mt-0.5 flex-shrink-0" />
            <div className="text-sm">
              <p className="font-medium text-foreground">
                Bereit zum Speichern
              </p>
              <p className="text-muted-foreground">
                Alle erforderlichen Daten sind vorhanden.
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};