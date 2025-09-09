import React from 'react';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { JobFormData } from '../JobCreationWizard';

interface JobBasicsStepProps {
  formData: JobFormData;
  updateFormData: (updates: Partial<JobFormData>) => void;
  company: any;
}

const PROFESSION_SUGGESTIONS = [
  'Elektroniker/in für Betriebstechnik',
  'Fachinformatiker/in Anwendungsentwicklung',
  'Industriemechaniker/in',
  'Kaufmann/-frau für Büromanagement',
  'Mediengestalter/in Digital und Print',
  'Werkzeugmechaniker/in',
  'Zerspanungsmechaniker/in',
  'Chemikant/in',
  'Fachkraft für Lagerlogistik',
  'Bankkaufmann/-frau',
];

const ROLE_FAMILIES = [
  'Technik & Engineering',
  'IT & Software',
  'Kaufmännisch & Verwaltung',
  'Produktion & Fertigung',
  'Logistik & Transport',
  'Marketing & Vertrieb',
  'Forschung & Entwicklung',
  'Qualitätssicherung',
  'Personalwesen',
  'Finanzen & Controlling',
];

export default function JobBasicsStep({ formData, updateFormData, company }: JobBasicsStepProps) {
  // Get allowed job types from company onboarding (mock for now)
  const allowedJobTypes = ['internship', 'apprenticeship', 'professional']; // In real app, get from company settings

  const handleJobTypeChange = (jobType: 'internship' | 'apprenticeship' | 'professional') => {
    updateFormData({ job_type: jobType });
  };

  return (
    <div className="space-y-6">
      {/* Job Type Selection */}
      <div>
        <Label className="text-base font-semibold">Art der Stelle</Label>
        <p className="text-sm text-muted-foreground mb-3">
          Basierend auf Ihren Onboarding-Einstellungen
        </p>
        
        <Tabs value={formData.job_type} onValueChange={handleJobTypeChange}>
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger 
              value="internship" 
              disabled={!allowedJobTypes.includes('internship')}
              className="flex items-center gap-2"
            >
              Praktikum
              {!allowedJobTypes.includes('internship') && <Badge variant="secondary" className="text-xs">Gesperrt</Badge>}
            </TabsTrigger>
            <TabsTrigger 
              value="apprenticeship" 
              disabled={!allowedJobTypes.includes('apprenticeship')}
              className="flex items-center gap-2"
            >
              Ausbildung
              {!allowedJobTypes.includes('apprenticeship') && <Badge variant="secondary" className="text-xs">Gesperrt</Badge>}
            </TabsTrigger>
            <TabsTrigger 
              value="professional" 
              disabled={!allowedJobTypes.includes('professional')}
              className="flex items-center gap-2"
            >
              Fachkraft
              {!allowedJobTypes.includes('professional') && <Badge variant="secondary" className="text-xs">Gesperrt</Badge>}
            </TabsTrigger>
          </TabsList>
        </Tabs>
      </div>

      {/* Job Title */}
      <div>
        <Label htmlFor="title">Berufsbezeichnung *</Label>
        <Input
          id="title"
          value={formData.title}
          onChange={(e) => updateFormData({ title: e.target.value })}
          placeholder="z.B. Industrieelektriker (m/w/d)"
          className="mt-1"
        />
        <div className="mt-2 flex flex-wrap gap-1">
          {PROFESSION_SUGGESTIONS.slice(0, 5).map((suggestion) => (
            <Badge
              key={suggestion}
              variant="outline"
              className="cursor-pointer text-xs hover:bg-muted"
              onClick={() => updateFormData({ title: suggestion })}
            >
              {suggestion}
            </Badge>
          ))}
        </div>
      </div>

      {/* Team/Department */}
      <div>
        <Label htmlFor="team_department">Team/Abteilung *</Label>
        <Input
          id="team_department"
          value={formData.team_department}
          onChange={(e) => updateFormData({ team_department: e.target.value })}
          placeholder="z.B. Elektrotechnik, IT-Abteilung"
          className="mt-1"
          required
        />
      </div>

      {/* Role Family */}
      <div>
        <Label htmlFor="role_family">Rollenfamilie *</Label>
        <Select onValueChange={(value) => updateFormData({ role_family: value })} required>
          <SelectTrigger className="mt-1">
            <SelectValue placeholder="Wählen Sie eine Kategorie" />
          </SelectTrigger>
          <SelectContent>
            {ROLE_FAMILIES.map((family) => (
              <SelectItem key={family} value={family}>
                {family}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {/* Description */}
      <div>
        <Label htmlFor="description">Beschreibung *</Label>
        <p className="text-sm text-muted-foreground mb-2">
          Allgemeine Beschreibung der Position und des Unternehmens
        </p>
        <Textarea
          id="description"
          value={formData.description}
          onChange={(e) => updateFormData({ description: e.target.value })}
          placeholder="Beschreiben Sie die Position und was den Bewerber erwartet..."
          className="mt-1 min-h-[120px]"
        />
      </div>

      {/* Type-specific examples */}
      <div className="p-4 bg-muted/50 rounded-lg">
        <h4 className="font-medium mb-2">Beispiele für {
          formData.job_type === 'internship' ? 'Praktika' :
          formData.job_type === 'apprenticeship' ? 'Ausbildungen' : 'Fachkraft-Stellen'
        }:</h4>
        
        {formData.job_type === 'internship' && (
          <div className="text-sm text-muted-foreground space-y-1">
            <p><strong>Titel:</strong> Praktikant Social Media (m/w/d)</p>
            <p><strong>Beschreibung:</strong> Unterstützen Sie unser Marketing-Team bei der Erstellung und Pflege unserer Social Media Kanäle...</p>
          </div>
        )}
        
        {formData.job_type === 'apprenticeship' && (
          <div className="text-sm text-muted-foreground space-y-1">
            <p><strong>Titel:</strong> Kaufmännischer Auszubildender (m/w/d)</p>
            <p><strong>Beschreibung:</strong> Starten Sie Ihre berufliche Laufbahn in einem modernen Industrieunternehmen...</p>
          </div>
        )}
        
        {formData.job_type === 'professional' && (
          <div className="text-sm text-muted-foreground space-y-1">
            <p><strong>Titel:</strong> Industrieelektriker (m/w/d)</p>
            <p><strong>Beschreibung:</strong> Verstärken Sie unser Team als erfahrener Elektrofachkraft...</p>
          </div>
        )}
      </div>
    </div>
  );
}