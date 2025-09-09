import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Progress } from '@/components/ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { ArrowLeft, ArrowRight, Save, Eye, Sparkles, CheckCircle } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { useCompany } from '@/hooks/useCompany';
import { useJobPostingLimits } from '@/hooks/useJobPostingLimits';

// Step components
import JobBasicsStep from './steps/JobBasicsStep';
import JobLocationStep from './steps/JobLocationStep';
import JobTimeContractStep from './steps/JobTimeContractStep';
import JobSalaryStep from './steps/JobSalaryStep';
import JobSkillsStep from './steps/JobSkillsStep';
import JobLanguagesStep from './steps/JobLanguagesStep';
import JobCompanyStep from './steps/JobCompanyStep';
import JobAdditionalStep from './steps/JobAdditionalStep';
import JobPreviewStep from './steps/JobPreviewStep';

export interface JobFormData {
  // Basic fields
  title: string;
  job_type: 'internship' | 'apprenticeship' | 'professional';
  team_department: string;
  role_family: string;
  description: string;
  
  // Location fields
  work_mode: 'onsite' | 'hybrid' | 'remote';
  city: string;
  address_street: string;
  address_number: string;
  postal_code: string;
  state: string;
  country: string;
  location_lat?: number;
  location_lng?: number;
  public_transport: boolean;
  parking_available: boolean;
  barrier_free_access: boolean;
  commute_distance_km: number;
  
  // Time & Contract
  employment_type: 'fulltime' | 'parttime' | 'minijob' | 'werkstudent' | 'temporary' | 'permanent';
  start_immediately: boolean;
  start_date?: string;
  end_date?: string;
  hours_per_week_min?: number;
  hours_per_week_max?: number;
  
  // Salary
  salary_min?: number;
  salary_max?: number;
  salary_currency: string;
  salary_interval: 'hour' | 'month' | 'year';
  
  // Content
  tasks_description: string;
  requirements_description: string;
  benefits_description: string;
  
  // Skills, languages, etc.
  skills: Array<{name: string; level: number; required: boolean}>;
  languages: Array<{language: string; level: string; required: boolean}>;
  certifications: Array<{name: string; authority: string; required: boolean}>;
  driving_licenses: Array<{class: string; required: boolean}>;
  
  // Contact
  contact_person_name: string;
  contact_person_role: string;
  contact_person_email: string;
  contact_person_phone: string;
  
  // Additional fields (optional)
  company_description?: string;
  application_deadline?: string;
  application_url?: string;
  application_email?: string;
  application_instructions?: string;
  is_featured?: boolean;
  featured_until?: string;
  is_urgent?: boolean;
  tags?: string[];
  external_id?: string;
  source?: string;
  
  // Type-specific fields
  internship?: {
    internship_type: 'mandatory' | 'voluntary';
    enrollment_required: boolean;
    field_of_study: string;
    duration_weeks_min?: number;
    duration_weeks_max?: number;
    mentor_assigned: boolean;
    learning_objectives: string;
  };
  
  apprenticeship?: {
    apprenticeship_profession: string;
    chamber: 'IHK' | 'HWK' | 'Other';
    training_start_date?: string;
    duration_months: number;
    minimum_education: 'none' | 'hauptschule' | 'realschule' | 'fachabitur' | 'abitur';
    vocational_school: string;
    rotation_plan: string;
    exam_support: boolean;
    salary_year_1_cents?: number;
    salary_year_2_cents?: number;
    salary_year_3_cents?: number;
    salary_year_4_cents?: number;
  };
  
  professional?: {
    min_experience_years: number;
    degree_required: boolean;
    minimum_degree: 'none' | 'apprenticeship' | 'meister' | 'techniker' | 'bachelor' | 'master' | 'phd';
    professional_qualification: string;
    probation_period_months: number;
    shift_work: boolean;
    on_call_duty: boolean;
    weekend_work: boolean;
    relocation_assistance: boolean;
  };
  
  // Meta
  visa_sponsorship: boolean;
  relocation_support: boolean;
  travel_percentage: number;
}

interface JobCreationWizardProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onJobCreated?: () => void;
}

const STEPS = [
  { id: 'basics', title: 'Grundlagen', component: JobBasicsStep },
  { id: 'location', title: 'Ort & Arbeitsweise', component: JobLocationStep },
  { id: 'time', title: 'Zeit & Vertrag', component: JobTimeContractStep },
  { id: 'salary', title: 'Vergütung', component: JobSalaryStep },
  { id: 'skills', title: 'Fähigkeiten & Anforderungen', component: JobSkillsStep },
  { id: 'languages', title: 'Sprachen & Zertifikate', component: JobLanguagesStep },
  { id: 'company', title: 'Unternehmensdarstellung', component: JobCompanyStep },
  { id: 'additional', title: 'Zusätzliche Optionen', component: JobAdditionalStep },
  { id: 'preview', title: 'Vorschau & Veröffentlichen', component: JobPreviewStep },
];

export default function JobCreationWizard({ open, onOpenChange, onJobCreated }: JobCreationWizardProps) {
  const { company } = useCompany();
  const { toast } = useToast();
  const { 
    canPost, 
    remainingTokens, 
    remainingJobPosts, 
    tokensPerPost,
    publishJob,
    isPublishing,
    saveDraft,
    isSavingDraft,
    updateJob,
    isUpdating
  } = useJobPostingLimits();
  const [currentStep, setCurrentStep] = useState(0);
  const [savedJobId, setSavedJobId] = useState<string | null>(null);
  const [formData, setFormData] = useState<JobFormData>({
    title: '',
    job_type: 'professional',
    team_department: '',
    role_family: '',
    description: '',
    work_mode: 'onsite',
    city: '',
    address_street: '',
    address_number: '',
    postal_code: '',
    state: '',
    country: 'Deutschland',
    public_transport: false,
    parking_available: false,
    barrier_free_access: false,
    commute_distance_km: 25,
    employment_type: 'fulltime',
    start_immediately: true,
    salary_currency: 'EUR',
    salary_interval: 'month',
    tasks_description: '',
    requirements_description: '',
    benefits_description: '',
    skills: [],
    languages: [],
    certifications: [],
    driving_licenses: [],
    contact_person_name: '',
    contact_person_role: '',
    contact_person_email: '',
    contact_person_phone: '',
    company_description: '',
    application_deadline: '',
    application_url: '',
    application_email: '',
    application_instructions: '',
    is_featured: false,
    featured_until: '',
    is_urgent: false,
    tags: [],
    external_id: '',
    source: 'manual',
    visa_sponsorship: false,
    relocation_support: false,
    travel_percentage: 0,
  });
  const [isAIGenerating, setIsAIGenerating] = useState(false);
  const [validationErrors, setValidationErrors] = useState<string[]>([]);

  const progress = ((currentStep + 1) / STEPS.length) * 100;
  const CurrentStepComponent = STEPS[currentStep]?.component;

  const updateFormData = (updates: Partial<JobFormData>) => {
    setFormData(prev => ({ ...prev, ...updates }));
  };

  const generateWithAI = async () => {
    if (!formData.title || !formData.city) {
      toast({
        title: "Fehlende Angaben",
        description: "Bitte geben Sie zuerst Berufsbezeichnung und Ort an.",
        variant: "destructive",
      });
      return;
    }

    setIsAIGenerating(true);
    try {
      const { data, error } = await supabase.functions.invoke('generate-job-content', {
        body: {
          title: formData.title,
          location: formData.city,
          jobType: formData.job_type,
          industry: company?.industry,
          company: company?.name,
        },
      });

      if (error) throw error;

      // Update form with AI-generated content
      updateFormData({
        description: data.description || formData.description,
        tasks_description: data.tasks?.join('\n• ') || formData.tasks_description,
        requirements_description: data.requirements?.join('\n• ') || formData.requirements_description,
        benefits_description: data.benefits?.join('\n• ') || formData.benefits_description,
        skills: data.skills || formData.skills,
        languages: data.languages || formData.languages,
        // Type-specific updates
        ...(formData.job_type === 'internship' && data.learningObjectives && {
          internship: {
            ...formData.internship,
            learning_objectives: data.learningObjectives,
            duration_weeks_min: data.durationWeeksMin,
            duration_weeks_max: data.durationWeeksMax,
            internship_type: 'voluntary',
            enrollment_required: false,
            field_of_study: '',
            mentor_assigned: true,
          }
        }),
        ...(formData.job_type === 'apprenticeship' && {
          apprenticeship: {
            ...formData.apprenticeship,
            apprenticeship_profession: formData.title,
            chamber: data.chamber || 'IHK',
            duration_months: data.durationMonths || 36,
            minimum_education: data.minimumEducation || 'realschule',
            exam_support: data.examSupport || true,
            rotation_plan: data.rotationPlan || '',
            vocational_school: '',
          }
        }),
        ...(formData.job_type === 'professional' && {
          professional: {
            ...formData.professional,
            min_experience_years: data.minExperienceYears || 2,
            degree_required: data.degreeRequired || false,
            minimum_degree: data.minimumDegree || 'apprenticeship',
            probation_period_months: data.probationPeriodMonths || 6,
            shift_work: false,
            on_call_duty: false,
            weekend_work: false,
            relocation_assistance: false,
            professional_qualification: '',
          }
        }),
      });

      toast({
        title: "KI-Assist erfolgreich",
        description: "Stellenanzeige wurde mit KI-Vorschlägen befüllt. Sie können alle Angaben anpassen.",
      });

    } catch (error) {
      console.error('AI generation error:', error);
      toast({
        title: "KI-Assist Fehler",
        description: "Konnte keine Vorschläge generieren. Bitte versuchen Sie es später erneut.",
        variant: "destructive",
      });
    } finally {
      setIsAIGenerating(false);
    }
  };

  const validateCurrentStep = (): boolean => {
    const errors: string[] = [];
    
    switch (STEPS[currentStep].id) {
      case 'basics':
        if (!formData.title) errors.push('Berufsbezeichnung ist erforderlich');
        if (!formData.team_department) errors.push('Team/Abteilung ist erforderlich');
        if (!formData.role_family) errors.push('Rollenfamilie ist erforderlich');
        if (!formData.description) errors.push('Beschreibung ist erforderlich');
        break;
      case 'location':
        if (!formData.work_mode) errors.push('Arbeitsmodus ist erforderlich');
        if (formData.work_mode !== 'remote') {
          if (!formData.country) errors.push('Land ist erforderlich');
          if (!formData.state) errors.push('Bundesland ist erforderlich');
          if (!formData.city) errors.push('Stadt ist erforderlich');
          if (!formData.postal_code) errors.push('Postleitzahl ist erforderlich');
          if (!formData.address_street) errors.push('Straße ist erforderlich');
        }
        break;
      case 'time':
        if (!formData.employment_type) errors.push('Beschäftigungsart ist erforderlich');
        if (formData.hours_per_week_min && formData.hours_per_week_max) {
          if (formData.hours_per_week_min > formData.hours_per_week_max) {
            errors.push('Minimale Wochenstunden dürfen nicht höher als maximale sein');
          }
        }
        break;
      case 'company':
        if (!formData.contact_person_name) errors.push('Name des Ansprechpartners ist erforderlich');
        if (!formData.contact_person_role) errors.push('Position/Rolle des Ansprechpartners ist erforderlich');
        if (!formData.contact_person_email) errors.push('E-Mail des Ansprechpartners ist erforderlich');
        break;
      case 'additional':
        // Additional fields are optional, no validation needed
        break;
      case 'salary':
        if (formData.salary_min && formData.salary_max) {
          if (formData.salary_min > formData.salary_max) {
            errors.push('Mindestgehalt darf nicht höher als Maximalgehalt sein');
          }
        }
        break;
      case 'skills':
        if (!formData.tasks_description || formData.tasks_description.trim().length < 50) {
          errors.push('Aufgabenbeschreibung muss mindestens 50 Zeichen haben');
        }
        if (!formData.requirements_description || formData.requirements_description.trim().length < 50) {
          errors.push('Anforderungen müssen mindestens 50 Zeichen haben');
        }
        if (!formData.benefits_description || formData.benefits_description.trim().length < 50) {
          errors.push('Benefits müssen mindestens 50 Zeichen haben');
        }
        break;
      case 'languages':
        // Languages are optional, no validation needed
        break;
    }

    setValidationErrors(errors);
    return errors.length === 0;
  };

  const handleNext = () => {
    if (validateCurrentStep()) {
      setCurrentStep(prev => Math.min(prev + 1, STEPS.length - 1));
    }
  };

  const handlePrevious = () => {
    setCurrentStep(prev => Math.max(prev - 1, 0));
  };

  const handleEdit = (stepId: string) => {
    const stepIndex = STEPS.findIndex(step => step.id === stepId);
    if (stepIndex !== -1) {
      setCurrentStep(stepIndex);
    }
  };

  const handleSaveAsDraft = async () => {
    if (!company?.id) return;

    saveDraft.mutate(formData, {
      onSuccess: (result) => {
        if (result && result.id) {
          setSavedJobId(result.id);
          onJobCreated?.();
          onOpenChange(false);
        }
      },
      onError: (error) => {
        console.error('Save error:', error);
      }
    });
  };

  const handlePublish = async () => {
    if (!company?.id) return;

    try {
      // First save as draft if not already saved
      let jobId = savedJobId;
      if (!jobId) {
        saveDraft.mutate(formData, {
          onSuccess: (result) => {
            if (result && result.id) {
              setSavedJobId(result.id);
              publishJob(result.id);
              onJobCreated?.();
              onOpenChange(false);
            }
          }
        });
        return;
      }

      // Then publish with token consumption
      if (jobId) {
        publishJob(jobId);
        onJobCreated?.();
        onOpenChange(false);
      }
    } catch (error) {
      console.error('Publish error:', error);
    }
  };

  const isFirstStep = currentStep === 0;
  const isLastStep = currentStep === STEPS.length - 1;
  const canUseAI = formData.title && formData.city && currentStep === 0;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-6xl h-[90vh] flex flex-col">
        <DialogHeader>
          <DialogTitle className="flex items-center justify-between">
            <span>Stellenanzeige erstellen</span>
            <div className="flex items-center gap-2">
              <Badge variant="outline">
                Schritt {currentStep + 1} von {STEPS.length}
              </Badge>
              {canUseAI && (
                <Button
                  onClick={generateWithAI}
                  disabled={isAIGenerating}
                  variant="outline"
                  size="sm"
                  className="text-[#5ce1e6] border-[#5ce1e6] hover:bg-[#5ce1e6]/10"
                >
                  <Sparkles className="h-4 w-4 mr-2" />
                  {isAIGenerating ? 'Generiert...' : 'Mit KI vorfüllen'}
                </Button>
              )}
            </div>
          </DialogTitle>
          <Progress value={progress} className="w-full" />
        </DialogHeader>

        <div className="flex-1 grid grid-cols-1 lg:grid-cols-3 gap-6 overflow-hidden">
          {/* Main Content */}
          <div className="lg:col-span-2 overflow-y-auto">
            <Card>
              <CardHeader>
                <CardTitle>{STEPS[currentStep].title}</CardTitle>
              </CardHeader>
              <CardContent>
                {validationErrors.length > 0 && (
                  <div className="mb-4 p-3 bg-destructive/10 border border-destructive/20 rounded-md">
                    <ul className="text-sm text-destructive">
                      {validationErrors.map((error, index) => (
                        <li key={index}>• {error}</li>
                      ))}
                    </ul>
                  </div>
                )}
                
                {CurrentStepComponent && (
                  <CurrentStepComponent
                    formData={formData}
                    updateFormData={updateFormData}
                    company={company}
                    onEdit={currentStep === STEPS.length - 1 ? () => handleEdit('basics') : undefined}
                  />
                )}
              </CardContent>
            </Card>
          </div>

          {/* Side Panel */}
          <div className="space-y-4 overflow-y-auto">
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Fortschritt</CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                {STEPS.map((step, index) => (
                  <div
                    key={step.id}
                    className={`flex items-center gap-2 p-2 rounded-lg transition-colors ${
                      index === currentStep
                        ? 'bg-primary/10 text-primary'
                        : index < currentStep
                        ? 'bg-muted text-muted-foreground'
                        : 'text-muted-foreground'
                    }`}
                  >
                    {index < currentStep ? (
                      <CheckCircle className="h-4 w-4 text-green-500" />
                    ) : (
                      <div className={`w-4 h-4 rounded-full border-2 ${
                        index === currentStep ? 'border-primary' : 'border-muted-foreground'
                      }`} />
                    )}
                    <span className="text-sm">{step.title}</span>
                  </div>
                ))}
              </CardContent>
            </Card>

            {/* Tips */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Tipps</CardTitle>
              </CardHeader>
              <CardContent className="text-sm text-muted-foreground space-y-2">
                <p>• Je genauer Ihre Angaben, desto passender unsere Matches.</p>
                <p>• Geben Sie eine Gehaltsspanne an – das steigert die Bewerbungen deutlich.</p>
                <p>• Verwenden Sie die KI-Unterstützung für bessere Beschreibungen.</p>
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Footer Actions */}
        <div className="flex items-center justify-between pt-4 border-t">
          <div className="flex gap-2">
            <Button
              onClick={handleSaveAsDraft}
              disabled={isSavingDraft}
              variant="outline"
            >
              <Save className="h-4 w-4 mr-2" />
              {isSavingDraft ? 'Speichert...' : 'Als Entwurf speichern'}
            </Button>
          </div>

          <div className="flex gap-2">
            {!isFirstStep && (
              <Button
                onClick={handlePrevious}
                variant="outline"
              >
                <ArrowLeft className="h-4 w-4 mr-2" />
                Zurück
              </Button>
            )}
            
            {!isLastStep ? (
              <Button onClick={handleNext}>
                Weiter
                <ArrowRight className="h-4 w-4 ml-2" />
              </Button>
            ) : (
              <Button 
                onClick={handlePublish} 
                disabled={!canPost || isPublishing || isSavingDraft}
                className={!canPost ? 'opacity-50' : ''}
              >
                <Eye className="h-4 w-4 mr-2" />
                {isPublishing ? 'Veröffentlicht...' : 'Veröffentlichen'}
              </Button>
            )}
          </div>
        </div>

        {/* Token and Limit Info */}
        {isLastStep && (
          <div className="mt-4 p-3 bg-muted/50 rounded-lg text-sm">
            <div className="flex items-center justify-between">
              <div>
                <span className="font-medium">Verbleibende Tokens:</span> {remainingTokens}
              </div>
              <div>
                <span className="font-medium">Verbleibende Job-Posts:</span> {remainingJobPosts}
              </div>
              <div>
                <span className="font-medium">Tokens pro Post:</span> {tokensPerPost}
              </div>
            </div>
            {!canPost && (
              <div className="mt-2 text-destructive text-xs">
                {remainingTokens < tokensPerPost 
                  ? 'Nicht genügend Tokens verfügbar. Bitte kaufen Sie mehr Tokens.'
                  : 'Job-Posting-Limit erreicht. Bitte upgraden Sie Ihren Plan.'
                }
              </div>
            )}
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}