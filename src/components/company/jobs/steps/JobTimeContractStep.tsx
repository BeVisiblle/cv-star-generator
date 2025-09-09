import React from 'react';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Textarea } from '@/components/ui/textarea';
import { Checkbox } from '@/components/ui/checkbox';
import { Calendar, Clock, Briefcase } from 'lucide-react';
import { JobFormData } from '../JobCreationWizard';

interface JobTimeContractStepProps {
  formData: JobFormData;
  updateFormData: (updates: Partial<JobFormData>) => void;
  company: any;
}

const EMPLOYMENT_TYPES = [
  { value: 'fulltime', label: 'Vollzeit' },
  { value: 'parttime', label: 'Teilzeit' },
  { value: 'minijob', label: 'Minijob' },
  { value: 'werkstudent', label: 'Werkstudent' },
  { value: 'temporary', label: 'Befristet' },
  { value: 'permanent', label: 'Unbefristet' },
];

const EDUCATION_LEVELS = [
  { value: 'none', label: 'Egal / Ohne Abschluss' },
  { value: 'hauptschule', label: 'Hauptschulabschluss' },
  { value: 'realschule', label: 'Realschulabschluss' },
  { value: 'fachabitur', label: 'Fachhochschulreife' },
  { value: 'abitur', label: 'Abitur' },
];

const CHAMBER_OPTIONS = [
  { value: 'IHK', label: 'IHK (Industrie- und Handelskammer)' },
  { value: 'HWK', label: 'HWK (Handwerkskammer)' },
  { value: 'Other', label: 'Andere' },
];

const DEGREE_LEVELS = [
  { value: 'none', label: 'Kein Abschluss erforderlich' },
  { value: 'apprenticeship', label: 'Berufsausbildung' },
  { value: 'meister', label: 'Meister' },
  { value: 'techniker', label: 'Techniker' },
  { value: 'bachelor', label: 'Bachelor' },
  { value: 'master', label: 'Master' },
  { value: 'phd', label: 'Promotion' },
];

export default function JobTimeContractStep({ formData, updateFormData, company }: JobTimeContractStepProps) {
  const updateTypeSpecificData = (updates: any) => {
    if (formData.job_type === 'internship') {
      updateFormData({
        internship: { ...formData.internship, ...updates }
      });
    } else if (formData.job_type === 'apprenticeship') {
      updateFormData({
        apprenticeship: { ...formData.apprenticeship, ...updates }
      });
    } else if (formData.job_type === 'professional') {
      updateFormData({
        professional: { ...formData.professional, ...updates }
      });
    }
  };

  return (
    <div className="space-y-6">
      {/* Employment Type */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Briefcase className="h-5 w-5" />
            Beschäftigungsart *
          </CardTitle>
        </CardHeader>
        <CardContent>
          <Select 
            value={formData.employment_type} 
            onValueChange={(value: any) => updateFormData({ employment_type: value })}
            required
          >
            <SelectTrigger>
              <SelectValue placeholder="Wählen Sie die Beschäftigungsart" />
            </SelectTrigger>
            <SelectContent>
              {EMPLOYMENT_TYPES.map((type) => (
                <SelectItem key={type.value} value={type.value}>
                  {type.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </CardContent>
      </Card>

      {/* Start Date */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Calendar className="h-5 w-5" />
            Starttermin
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center space-x-2">
            <Switch
              id="start_immediately"
              checked={formData.start_immediately}
              onCheckedChange={(checked) => updateFormData({ start_immediately: checked })}
            />
            <Label htmlFor="start_immediately">Sofort verfügbar</Label>
          </div>

          {!formData.start_immediately && (
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="start_date">Startdatum</Label>
                <Input
                  id="start_date"
                  type="date"
                  value={formData.start_date || ''}
                  onChange={(e) => updateFormData({ start_date: e.target.value })}
                  className="mt-1"
                />
              </div>
              
              {formData.employment_type === 'temporary' && (
                <div>
                  <Label htmlFor="end_date">Enddatum (bei Befristung)</Label>
                  <Input
                    id="end_date"
                    type="date"
                    value={formData.end_date || ''}
                    onChange={(e) => updateFormData({ end_date: e.target.value })}
                    className="mt-1"
                  />
                </div>
              )}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Working Hours */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Clock className="h-5 w-5" />
            Arbeitszeit
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="hours_min">Wochenstunden min.</Label>
              <Input
                id="hours_min"
                type="number"
                min="1"
                max="60"
                value={formData.hours_per_week_min || ''}
                onChange={(e) => updateFormData({ hours_per_week_min: parseInt(e.target.value) || undefined })}
                placeholder="z.B. 20"
                className="mt-1"
              />
            </div>
            <div>
              <Label htmlFor="hours_max">Wochenstunden max.</Label>
              <Input
                id="hours_max"
                type="number"
                min="1"
                max="60"
                value={formData.hours_per_week_max || ''}
                onChange={(e) => updateFormData({ hours_per_week_max: parseInt(e.target.value) || undefined })}
                placeholder="z.B. 40"
                className="mt-1"
              />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Type-specific fields */}
      {formData.job_type === 'internship' && (
        <Card>
          <CardHeader>
            <CardTitle>Praktikums-Details</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <Label>Art des Praktikums</Label>
              <Select 
                value={formData.internship?.internship_type || 'voluntary'} 
                onValueChange={(value: 'mandatory' | 'voluntary') => updateTypeSpecificData({ internship_type: value })}
              >
                <SelectTrigger className="mt-1">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="mandatory">Pflichtpraktikum</SelectItem>
                  <SelectItem value="voluntary">Freiwilliges Praktikum</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="flex items-center space-x-2">
              <Checkbox
                id="enrollment_required"
                checked={formData.internship?.enrollment_required || false}
                onCheckedChange={(checked) => updateTypeSpecificData({ enrollment_required: !!checked })}
              />
              <Label htmlFor="enrollment_required">Einschreibung erforderlich</Label>
            </div>

            <div>
              <Label htmlFor="field_of_study">Fachrichtung/Studiengang</Label>
              <Input
                id="field_of_study"
                value={formData.internship?.field_of_study || ''}
                onChange={(e) => updateTypeSpecificData({ field_of_study: e.target.value })}
                placeholder="z.B. Maschinenbau, Informatik"
                className="mt-1"
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="duration_min">Dauer min. (Wochen)</Label>
                <Input
                  id="duration_min"
                  type="number"
                  min="1"
                  value={formData.internship?.duration_weeks_min || ''}
                  onChange={(e) => updateTypeSpecificData({ duration_weeks_min: parseInt(e.target.value) || undefined })}
                  placeholder="z.B. 8"
                  className="mt-1"
                />
              </div>
              <div>
                <Label htmlFor="duration_max">Dauer max. (Wochen)</Label>
                <Input
                  id="duration_max"
                  type="number"
                  min="1"
                  value={formData.internship?.duration_weeks_max || ''}
                  onChange={(e) => updateTypeSpecificData({ duration_weeks_max: parseInt(e.target.value) || undefined })}
                  placeholder="z.B. 24"
                  className="mt-1"
                />
              </div>
            </div>

            <div className="flex items-center space-x-2">
              <Checkbox
                id="mentor_assigned"
                checked={formData.internship?.mentor_assigned ?? true}
                onCheckedChange={(checked) => updateTypeSpecificData({ mentor_assigned: !!checked })}
              />
              <Label htmlFor="mentor_assigned">Mentor zugewiesen</Label>
            </div>

            <div>
              <Label htmlFor="learning_objectives">Lernziele</Label>
              <Textarea
                id="learning_objectives"
                value={formData.internship?.learning_objectives || ''}
                onChange={(e) => updateTypeSpecificData({ learning_objectives: e.target.value })}
                placeholder="Beschreiben Sie die Lernziele des Praktikums..."
                className="mt-1"
              />
            </div>
          </CardContent>
        </Card>
      )}

      {formData.job_type === 'apprenticeship' && (
        <Card>
          <CardHeader>
            <CardTitle>Ausbildungs-Details</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <Label htmlFor="apprenticeship_profession">Ausbildungsberuf *</Label>
              <Input
                id="apprenticeship_profession"
                value={formData.apprenticeship?.apprenticeship_profession || formData.title}
                onChange={(e) => updateTypeSpecificData({ apprenticeship_profession: e.target.value })}
                placeholder="z.B. Industriemechaniker/in"
                className="mt-1"
              />
            </div>

            <div>
              <Label>Kammer</Label>
              <Select 
                value={formData.apprenticeship?.chamber || 'IHK'} 
                onValueChange={(value: 'IHK' | 'HWK' | 'Other') => updateTypeSpecificData({ chamber: value })}
              >
                <SelectTrigger className="mt-1">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {CHAMBER_OPTIONS.map((option) => (
                    <SelectItem key={option.value} value={option.value}>
                      {option.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="training_start">Ausbildungsbeginn</Label>
                <Input
                  id="training_start"
                  type="date"
                  value={formData.apprenticeship?.training_start_date || ''}
                  onChange={(e) => updateTypeSpecificData({ training_start_date: e.target.value })}
                  className="mt-1"
                />
              </div>
              <div>
                <Label htmlFor="duration_months">Dauer (Monate)</Label>
                <Input
                  id="duration_months"
                  type="number"
                  min="12"
                  max="48"
                  value={formData.apprenticeship?.duration_months || 36}
                  onChange={(e) => updateTypeSpecificData({ duration_months: parseInt(e.target.value) || 36 })}
                  className="mt-1"
                />
              </div>
            </div>

            <div>
              <Label>Mindest-Schulabschluss</Label>
              <Select 
                value={formData.apprenticeship?.minimum_education || 'realschule'} 
                onValueChange={(value: any) => updateTypeSpecificData({ minimum_education: value })}
              >
                <SelectTrigger className="mt-1">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {EDUCATION_LEVELS.map((level) => (
                    <SelectItem key={level.value} value={level.value}>
                      {level.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label htmlFor="vocational_school">Berufsschule</Label>
              <Input
                id="vocational_school"
                value={formData.apprenticeship?.vocational_school || ''}
                onChange={(e) => updateTypeSpecificData({ vocational_school: e.target.value })}
                placeholder="Name der Berufsschule"
                className="mt-1"
              />
            </div>

            <div className="flex items-center space-x-2">
              <Checkbox
                id="exam_support"
                checked={formData.apprenticeship?.exam_support ?? true}
                onCheckedChange={(checked) => updateTypeSpecificData({ exam_support: !!checked })}
              />
              <Label htmlFor="exam_support">Prüfungsunterstützung</Label>
            </div>

            <div>
              <Label htmlFor="rotation_plan">Rotationsplan</Label>
              <Textarea
                id="rotation_plan"
                value={formData.apprenticeship?.rotation_plan || ''}
                onChange={(e) => updateTypeSpecificData({ rotation_plan: e.target.value })}
                placeholder="Beschreiben Sie den Ausbildungsplan..."
                className="mt-1"
              />
            </div>
          </CardContent>
        </Card>
      )}

      {formData.job_type === 'professional' && (
        <Card>
          <CardHeader>
            <CardTitle>Fachkraft-Details</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <Label htmlFor="min_experience">Mindest-Berufserfahrung (Jahre)</Label>
              <Input
                id="min_experience"
                type="number"
                min="0"
                max="20"
                value={formData.professional?.min_experience_years || 0}
                onChange={(e) => updateTypeSpecificData({ min_experience_years: parseInt(e.target.value) || 0 })}
                className="mt-1"
              />
            </div>

            <div className="flex items-center space-x-2">
              <Checkbox
                id="degree_required"
                checked={formData.professional?.degree_required || false}
                onCheckedChange={(checked) => updateTypeSpecificData({ degree_required: !!checked })}
              />
              <Label htmlFor="degree_required">Abschluss erforderlich</Label>
            </div>

            {formData.professional?.degree_required && (
              <div>
                <Label>Mindestabschluss</Label>
                <Select 
                  value={formData.professional?.minimum_degree || 'apprenticeship'} 
                  onValueChange={(value: any) => updateTypeSpecificData({ minimum_degree: value })}
                >
                  <SelectTrigger className="mt-1">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {DEGREE_LEVELS.map((degree) => (
                      <SelectItem key={degree.value} value={degree.value}>
                        {degree.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            )}

            <div>
              <Label htmlFor="professional_qualification">Berufliche Qualifikation</Label>
              <Input
                id="professional_qualification"
                value={formData.professional?.professional_qualification || ''}
                onChange={(e) => updateTypeSpecificData({ professional_qualification: e.target.value })}
                placeholder="z.B. Meister, Techniker, Fachwirt"
                className="mt-1"
              />
            </div>

            <div>
              <Label htmlFor="probation_period">Probezeit (Monate)</Label>
              <Input
                id="probation_period"
                type="number"
                min="1"
                max="12"
                value={formData.professional?.probation_period_months || 6}
                onChange={(e) => updateTypeSpecificData({ probation_period_months: parseInt(e.target.value) || 6 })}
                className="mt-1"
              />
            </div>

            <div className="space-y-2">
              <div className="flex items-center space-x-2">
                <Checkbox
                  id="shift_work"
                  checked={formData.professional?.shift_work || false}
                  onCheckedChange={(checked) => updateTypeSpecificData({ shift_work: !!checked })}
                />
                <Label htmlFor="shift_work">Schichtarbeit</Label>
              </div>

              <div className="flex items-center space-x-2">
                <Checkbox
                  id="on_call_duty"
                  checked={formData.professional?.on_call_duty || false}
                  onCheckedChange={(checked) => updateTypeSpecificData({ on_call_duty: !!checked })}
                />
                <Label htmlFor="on_call_duty">Rufbereitschaft</Label>
              </div>

              <div className="flex items-center space-x-2">
                <Checkbox
                  id="weekend_work"
                  checked={formData.professional?.weekend_work || false}
                  onCheckedChange={(checked) => updateTypeSpecificData({ weekend_work: !!checked })}
                />
                <Label htmlFor="weekend_work">Wochenendarbeit</Label>
              </div>

              <div className="flex items-center space-x-2">
                <Checkbox
                  id="relocation_assistance"
                  checked={formData.professional?.relocation_assistance || false}
                  onCheckedChange={(checked) => updateTypeSpecificData({ relocation_assistance: !!checked })}
                />
                <Label htmlFor="relocation_assistance">Umzugsunterstützung</Label>
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}