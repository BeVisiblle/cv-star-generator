import React from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import { FormFieldError } from '@/components/ui/form-field-error';
import { Briefcase, Plus, X } from 'lucide-react';
import type { ProfileCreationData, ValidationErrors } from '@/hooks/useProfileCreation';

interface ExperienceStepProps {
  profileData: ProfileCreationData;
  validationErrors: ValidationErrors;
  onUpdate: (updates: Partial<ProfileCreationData>) => void;
}

export const ExperienceStep: React.FC<ExperienceStepProps> = ({
  profileData,
  validationErrors,
  onUpdate
}) => {
  const stepErrors = validationErrors[5] || [];
  
  const getFieldError = (field: string) => {
    return stepErrors.find(error => error.includes(field));
  };

  const addExperience = () => {
    const newExperience = {
      position: '',
      unternehmen: '',
      zeitraum: '',
      beschreibung: ''
    };
    
    onUpdate({
      berufserfahrung: [...profileData.berufserfahrung, newExperience]
    });
  };

  const removeExperience = (index: number) => {
    const updatedExperience = profileData.berufserfahrung.filter((_, i) => i !== index);
    onUpdate({ berufserfahrung: updatedExperience });
  };

  const updateExperience = (index: number, field: string, value: string) => {
    const updatedExperience = profileData.berufserfahrung.map((exp, i) => 
      i === index ? { ...exp, [field]: value } : exp
    );
    onUpdate({ berufserfahrung: updatedExperience });
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Briefcase className="w-5 h-5 text-primary" />
          Berufserfahrung
        </CardTitle>
        <p className="text-sm text-muted-foreground">
          Ihre bisherigen Arbeitserfahrungen (optional, aber empfohlen)
        </p>
      </CardHeader>
      
      <CardContent className="space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h4 className="font-medium">Berufserfahrung hinzufügen</h4>
            <p className="text-sm text-muted-foreground">
              Auch Praktika, Nebenjobs oder Ehrenamt sind wertvoll
            </p>
          </div>
          <Button 
            type="button" 
            variant="outline" 
            size="sm"
            onClick={addExperience}
          >
            <Plus className="w-4 h-4 mr-2" />
            Hinzufügen
          </Button>
        </div>

        {/* No Experience State */}
        {profileData.berufserfahrung.length === 0 && (
          <div className="text-center py-12 bg-muted/30 rounded-lg border-2 border-dashed border-muted-foreground/20">
            <Briefcase className="w-10 h-10 text-muted-foreground mx-auto mb-3" />
            <h4 className="font-medium text-foreground mb-2">
              Noch keine Erfahrungen hinzugefügt
            </h4>
            <p className="text-sm text-muted-foreground mb-4 max-w-md mx-auto">
              Auch wenn Sie noch keine formelle Berufserfahrung haben - 
              Praktika, Nebenjobs, Ehrenamt oder Projekte sind wertvoll für Ihren Lebenslauf.
            </p>
            <Button 
              type="button" 
              variant="default" 
              onClick={addExperience}
            >
              <Plus className="w-4 h-4 mr-2" />
              Erste Erfahrung hinzufügen
            </Button>
          </div>
        )}

        {/* Experience Entries */}
        <div className="space-y-4">
          {profileData.berufserfahrung.map((experience, index) => (
            <Card key={index} className="border-l-4 border-l-primary/20">
              <CardContent className="pt-4">
                <div className="flex justify-between items-start mb-4">
                  <h5 className="font-medium text-sm text-muted-foreground">
                    Erfahrung {index + 1}
                  </h5>
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    onClick={() => removeExperience(index)}
                    className="text-destructive hover:text-destructive"
                  >
                    <X className="w-4 h-4" />
                  </Button>
                </div>
                
                <div className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label>Position / Rolle *</Label>
                      <Input
                        placeholder="z.B. Praktikant, Aushilfe, Azubi"
                        value={experience.position}
                        onChange={(e) => updateExperience(index, 'position', e.target.value)}
                      />
                    </div>
                    
                    <div className="space-y-2">
                      <Label>Unternehmen / Organisation *</Label>
                      <Input
                        placeholder="z.B. Firma ABC GmbH"
                        value={experience.unternehmen}
                        onChange={(e) => updateExperience(index, 'unternehmen', e.target.value)}
                      />
                    </div>
                  </div>
                  
                  <div className="space-y-2">
                    <Label>Zeitraum *</Label>
                    <Input
                      placeholder="z.B. März 2022 - heute, Sommer 2023"
                      value={experience.zeitraum}
                      onChange={(e) => updateExperience(index, 'zeitraum', e.target.value)}
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <Label>Beschreibung (optional)</Label>
                    <Textarea
                      placeholder="Was waren Ihre Aufgaben? Was haben Sie gelernt?"
                      value={experience.beschreibung || ''}
                      onChange={(e) => updateExperience(index, 'beschreibung', e.target.value)}
                      rows={3}
                      className="resize-none"
                    />
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Help Text */}
        <div className="bg-muted/50 rounded-lg p-4">
          <h4 className="font-medium mb-2">Tipps für die Berufserfahrung:</h4>
          <ul className="text-sm text-muted-foreground space-y-1">
            <li>• Auch kurze Praktika oder Ferienjobs zählen</li>
            <li>• Ehrenamtliche Tätigkeiten sind wertvoll</li>
            <li>• Projekte in der Schule oder privat können relevant sein</li>
            <li>• Beschreiben Sie konkret, was Sie gelernt oder erreicht haben</li>
          </ul>
        </div>
      </CardContent>
    </Card>
  );
};