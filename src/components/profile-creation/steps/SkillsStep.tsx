import React from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { FormFieldError } from '@/components/ui/form-field-error';
import { Settings, MessageCircle } from 'lucide-react';
import { SkillSelector } from '@/components/shared/SkillSelector';
import { LanguageSelector } from '@/components/shared/LanguageSelector';
import type { ProfileCreationData, ValidationErrors } from '@/hooks/useProfileCreation';

interface SkillsStepProps {
  profileData: ProfileCreationData;
  validationErrors: ValidationErrors;
  onUpdate: (updates: Partial<ProfileCreationData>) => void;
}

export const SkillsStep: React.FC<SkillsStepProps> = ({
  profileData,
  validationErrors,
  onUpdate
}) => {
  const stepErrors = validationErrors[4] || [];
  
  const getFieldError = (field: string) => {
    return stepErrors.find(error => error.includes(field));
  };

  const handleSkillsChange = (skills: string[]) => {
    onUpdate({ faehigkeiten: skills });
  };

  const handleLanguagesChange = (languages: Array<{ sprache: string; niveau: 'A1' | 'A2' | 'B1' | 'B2' | 'C1' | 'C2' | 'Muttersprache' }>) => {
    onUpdate({ sprachen: languages });
  };

  return (
    <div className="space-y-6">
      {/* Skills Section */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Settings className="w-5 h-5 text-primary" />
            Fähigkeiten & Kenntnisse
          </CardTitle>
          <p className="text-sm text-muted-foreground">
            Wählen Sie Ihre wichtigsten Fähigkeiten aus
          </p>
        </CardHeader>
        
        <CardContent>
          <FormFieldError error={getFieldError('faehigkeiten')}>
            <SkillSelector
              selectedSkills={profileData.faehigkeiten}
              onSkillsChange={handleSkillsChange}
              branch={profileData.branche}
              statusLevel={profileData.status}
              maxSkills={15}
              label="Fähigkeiten"
              placeholder="Wählen Sie eine Fähigkeit..."
            />
          </FormFieldError>
          
          {profileData.faehigkeiten.length === 0 && (
            <div className="mt-4 text-center py-8 bg-muted/30 rounded-lg border-2 border-dashed border-muted-foreground/20">
              <Settings className="w-8 h-8 text-muted-foreground mx-auto mb-2" />
              <p className="text-sm text-muted-foreground">
                Noch keine Fähigkeiten ausgewählt
              </p>
              <p className="text-xs text-muted-foreground mt-1">
                Wählen Sie mindestens 3 Fähigkeiten für Ihren Lebenslauf
              </p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Languages Section */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <MessageCircle className="w-5 h-5 text-primary" />
            Sprachen
          </CardTitle>
          <p className="text-sm text-muted-foreground">
            Geben Sie Ihre Sprachkenntnisse an
          </p>
        </CardHeader>
        
        <CardContent>
          <FormFieldError error={getFieldError('sprachen')}>
            <LanguageSelector
              languages={profileData.sprachen}
              onLanguagesChange={handleLanguagesChange}
              maxLanguages={8}
              label="Sprachkenntnisse"
            />
          </FormFieldError>
          
          {profileData.sprachen.length === 0 && (
            <div className="mt-4 text-center py-8 bg-muted/30 rounded-lg border-2 border-dashed border-muted-foreground/20">
              <MessageCircle className="w-8 h-8 text-muted-foreground mx-auto mb-2" />
              <p className="text-sm text-muted-foreground">
                Noch keine Sprachen hinzugefügt
              </p>
              <p className="text-xs text-muted-foreground mt-1">
                Fügen Sie mindestens Deutsch hinzu
              </p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Help Text */}
      <div className="bg-muted/50 rounded-lg p-4">
        <p className="text-sm text-muted-foreground">
          <strong>Empfehlung:</strong> Wählen Sie 5-10 Kernfähigkeiten aus, die für 
          Ihre gewünschte Position relevant sind. Bei den Sprachen sollten Sie 
          ehrlich bezüglich Ihres Levels sein - Unternehmen werden dies oft testen.
        </p>
      </div>
    </div>
  );
};