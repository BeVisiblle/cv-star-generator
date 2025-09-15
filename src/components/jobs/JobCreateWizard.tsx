import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import { JobPreview } from './JobPreview';
import { JobShiftsEditor } from './JobShiftsEditor';
import { MapPicker } from '@/components/profile/MapPicker';
import { TagInput } from '@/components/profile/TagInput';

interface JobCreateWizardProps {
  onSave?: (jobData: any) => Promise<void>;
  onPublish?: (jobData: any) => Promise<void>;
}

export function JobCreateWizard({ onSave, onPublish }: JobCreateWizardProps) {
  const [currentStep, setCurrentStep] = useState(1);
  const [jobData, setJobData] = useState({
    // Basic Info
    title: '',
    description: '',
    track: 'ausbildung',
    contract_type: 'vollzeit',
    
    // Requirements
    skills_required: [],
    certs_required: [],
    language_at_work: 'de',
    min_experience_months: 0,
    
    // Benefits & Conditions
    benefits: [],
    salary_min: '',
    salary_max: '',
    is_remote: false,
    
    // Location & Schedule
    location_point: null,
    shifts_required: {
      shifts: [],
      flexibility: 'fixed'
    },
    
    // Contact
    contact_email: '',
    contact_phone: '',
    application_deadline: ''
  });

  const steps = [
    { id: 1, title: 'Grunddaten', description: 'Titel und Beschreibung' },
    { id: 2, title: 'Anforderungen', description: 'Skills und Qualifikationen' },
    { id: 3, title: 'Bedingungen', description: 'Benefits und Arbeitszeiten' },
    { id: 4, title: 'Vorschau', description: 'Überprüfung und Veröffentlichung' }
  ];

  const handleNext = () => {
    if (currentStep < steps.length) {
      setCurrentStep(currentStep + 1);
    }
  };

  const handlePrev = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1);
    }
  };

  const handleSave = async () => {
    if (onSave) {
      await onSave(jobData);
    }
  };

  const handlePublish = async () => {
    if (onPublish) {
      await onPublish(jobData);
    }
  };

  const renderStep = () => {
    switch (currentStep) {
      case 1:
        return (
          <div className="space-y-6">
            <div>
              <Label htmlFor="title">Stellenbezeichnung *</Label>
              <Input
                id="title"
                value={jobData.title}
                onChange={(e) => setJobData({...jobData, title: e.target.value})}
                placeholder="z.B. Auszubildender zum Fachinformatiker"
              />
            </div>
            
            <div>
              <Label htmlFor="description">Stellenbeschreibung *</Label>
              <Textarea
                id="description"
                value={jobData.description}
                onChange={(e) => setJobData({...jobData, description: e.target.value})}
                placeholder="Beschreibe die Stelle, Aufgaben und Anforderungen..."
                rows={6}
              />
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="track">Bereich</Label>
                <Select
                  value={jobData.track}
                  onValueChange={(value) => setJobData({...jobData, track: value})}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="ausbildung">Ausbildung</SelectItem>
                    <SelectItem value="praktikum">Praktikum</SelectItem>
                    <SelectItem value="werkstudent">Werkstudent</SelectItem>
                    <SelectItem value="vollzeit">Vollzeit</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              
              <div>
                <Label htmlFor="contract_type">Vertragsart</Label>
                <Select
                  value={jobData.contract_type}
                  onValueChange={(value) => setJobData({...jobData, contract_type: value})}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="vollzeit">Vollzeit</SelectItem>
                    <SelectItem value="teilzeit">Teilzeit</SelectItem>
                    <SelectItem value="minijob">Minijob</SelectItem>
                    <SelectItem value="ausbildung">Ausbildung</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </div>
        );

      case 2:
        return (
          <div className="space-y-6">
            <div>
              <Label>Erforderliche Fähigkeiten</Label>
              <TagInput
                value={jobData.skills_required}
                onChange={(skills) => setJobData({...jobData, skills_required: skills})}
                placeholder="z.B. JavaScript, Python, Teamwork..."
              />
            </div>
            
            <div>
              <Label>Erforderliche Zertifikate</Label>
              <TagInput
                value={jobData.certs_required}
                onChange={(certs) => setJobData({...jobData, certs_required: certs})}
                placeholder="z.B. Führerschein, Erste Hilfe..."
              />
            </div>
            
            <div>
              <Label htmlFor="language">Arbeitssprache</Label>
              <Select
                value={jobData.language_at_work}
                onValueChange={(value) => setJobData({...jobData, language_at_work: value})}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="de">Deutsch</SelectItem>
                  <SelectItem value="en">Englisch</SelectItem>
                  <SelectItem value="both">Deutsch & Englisch</SelectItem>
                </SelectContent>
              </Select>
            </div>
            
            <div>
              <Label htmlFor="experience">Mindest-Erfahrung (Monate)</Label>
              <Input
                id="experience"
                type="number"
                value={jobData.min_experience_months}
                onChange={(e) => setJobData({...jobData, min_experience_months: parseInt(e.target.value)})}
              />
            </div>
          </div>
        );

      case 3:
        return (
          <div className="space-y-6">
            <div>
              <Label>Benefits & Zusatzleistungen</Label>
              <TagInput
                value={jobData.benefits}
                onChange={(benefits) => setJobData({...jobData, benefits})}
                placeholder="z.B. Homeoffice, Weiterbildung, Firmenwagen..."
              />
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="salary_min">Gehalt von (€)</Label>
                <Input
                  id="salary_min"
                  type="number"
                  value={jobData.salary_min}
                  onChange={(e) => setJobData({...jobData, salary_min: e.target.value})}
                />
              </div>
              <div>
                <Label htmlFor="salary_max">Gehalt bis (€)</Label>
                <Input
                  id="salary_max"
                  type="number"
                  value={jobData.salary_max}
                  onChange={(e) => setJobData({...jobData, salary_max: e.target.value})}
                />
              </div>
            </div>
            
            <div className="flex items-center space-x-2">
              <Checkbox
                id="is_remote"
                checked={jobData.is_remote}
                onCheckedChange={(checked) => setJobData({...jobData, is_remote: !!checked})}
              />
              <Label htmlFor="is_remote">Remote-Arbeit möglich</Label>
            </div>
            
            {!jobData.is_remote && (
              <div>
                <Label>Arbeitsort</Label>
                <MapPicker
                  value={jobData.location_point}
                  onChange={(point) => setJobData({...jobData, location_point: point})}
                />
              </div>
            )}
            
            <div>
              <Label>Arbeitszeiten</Label>
              <JobShiftsEditor
                value={jobData.shifts_required}
                onChange={(shifts) => setJobData({...jobData, shifts_required: shifts})}
              />
            </div>
          </div>
        );

      case 4:
        return (
          <div className="space-y-6">
            <JobPreview jobData={jobData} />
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="contact_email">Kontakt-E-Mail</Label>
                <Input
                  id="contact_email"
                  type="email"
                  value={jobData.contact_email}
                  onChange={(e) => setJobData({...jobData, contact_email: e.target.value})}
                />
              </div>
              <div>
                <Label htmlFor="contact_phone">Kontakt-Telefon</Label>
                <Input
                  id="contact_phone"
                  value={jobData.contact_phone}
                  onChange={(e) => setJobData({...jobData, contact_phone: e.target.value})}
                />
              </div>
            </div>
            
            <div>
              <Label htmlFor="deadline">Bewerbungsfrist</Label>
              <Input
                id="deadline"
                type="date"
                value={jobData.application_deadline}
                onChange={(e) => setJobData({...jobData, application_deadline: e.target.value})}
              />
            </div>
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <div className="max-w-4xl mx-auto">
      {/* Progress */}
      <div className="mb-8">
        <div className="flex items-center justify-between mb-4">
          {steps.map((step, index) => (
            <div key={step.id} className="flex items-center">
              <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium ${
                currentStep >= step.id 
                  ? 'bg-blue-600 text-white' 
                  : 'bg-gray-200 text-gray-600'
              }`}>
                {step.id}
              </div>
              <div className="ml-2">
                <div className="text-sm font-medium">{step.title}</div>
                <div className="text-xs text-gray-500">{step.description}</div>
              </div>
              {index < steps.length - 1 && (
                <div className={`w-12 h-0.5 mx-4 ${
                  currentStep > step.id ? 'bg-blue-600' : 'bg-gray-200'
                }`} />
              )}
            </div>
          ))}
        </div>
      </div>

      {/* Content */}
      <div className="bg-white rounded-lg border p-6 mb-6">
        {renderStep()}
      </div>

      {/* Navigation */}
      <div className="flex justify-between">
        <Button
          variant="outline"
          onClick={handlePrev}
          disabled={currentStep === 1}
        >
          Zurück
        </Button>
        
        <div className="flex gap-2">
          <Button variant="outline" onClick={handleSave}>
            Entwurf speichern
          </Button>
          
          {currentStep < steps.length ? (
            <Button onClick={handleNext}>
              Weiter
            </Button>
          ) : (
            <Button onClick={handlePublish} className="bg-green-600 hover:bg-green-700">
              Stellenanzeige veröffentlichen
            </Button>
          )}
        </div>
      </div>
    </div>
  );
}
