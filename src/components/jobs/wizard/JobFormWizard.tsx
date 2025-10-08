import { useJobForm } from "@/contexts/JobFormContext";
import { JobFormStep1 } from "./JobFormStep1";
import { JobFormStep2 } from "./JobFormStep2";
import { JobFormStep3 } from "./JobFormStep3";
import { JobFormStep4 } from "./JobFormStep4";
import { JobFormStep5 } from "./JobFormStep5";
import { cn } from "@/lib/utils";

interface JobFormWizardProps {
  onSubmit: () => void;
  isLoading?: boolean;
}

export function JobFormWizard({ onSubmit, isLoading }: JobFormWizardProps) {
  const { currentStep } = useJobForm();

  const steps = [
    { number: 1, label: 'Basis' },
    { number: 2, label: 'Skills' },
    { number: 3, label: 'Beschreibung' },
    { number: 4, label: 'Details' },
    { number: 5, label: 'Vorschau' },
  ];

  return (
    <div className="space-y-8">
      {/* Progress Steps */}
      <div className="flex items-center justify-between">
        {steps.map((step, index) => (
          <div key={step.number} className="flex items-center flex-1">
            <div className="flex flex-col items-center flex-1">
              <div
                className={cn(
                  "w-10 h-10 rounded-full flex items-center justify-center font-semibold transition-colors",
                  currentStep === step.number
                    ? "bg-primary text-primary-foreground"
                    : currentStep > step.number
                    ? "bg-primary/20 text-primary"
                    : "bg-muted text-muted-foreground"
                )}
              >
                {step.number}
              </div>
              <span
                className={cn(
                  "text-xs mt-2 font-medium",
                  currentStep >= step.number ? "text-foreground" : "text-muted-foreground"
                )}
              >
                {step.label}
              </span>
            </div>
            {index < steps.length - 1 && (
              <div
                className={cn(
                  "flex-1 h-0.5 mx-2",
                  currentStep > step.number ? "bg-primary" : "bg-muted"
                )}
              />
            )}
          </div>
        ))}
      </div>

      {/* Step Content */}
      <div className="mt-8">
        {currentStep === 1 && <JobFormStep1 />}
        {currentStep === 2 && <JobFormStep2 />}
        {currentStep === 3 && <JobFormStep3 />}
        {currentStep === 4 && <JobFormStep4 />}
        {currentStep === 5 && <JobFormStep5 onSubmit={onSubmit} isLoading={isLoading} />}
      </div>
    </div>
  );
}