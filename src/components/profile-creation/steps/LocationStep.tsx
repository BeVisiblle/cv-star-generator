import React from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { FormFieldError } from '@/components/ui/form-field-error';
import { MapPin } from 'lucide-react';
import { PLZOrtSelector } from '@/components/shared/PLZOrtSelector';
import type { ProfileCreationData, ValidationErrors } from '@/hooks/useProfileCreation';

interface LocationStepProps {
  profileData: ProfileCreationData;
  validationErrors: ValidationErrors;
  onUpdate: (updates: Partial<ProfileCreationData>) => void;
}

export const LocationStep: React.FC<LocationStepProps> = ({
  profileData,
  validationErrors,
  onUpdate
}) => {
  const stepErrors = validationErrors[2] || [];
  
  const getFieldError = (field: string) => {
    return stepErrors.find(error => error.includes(field));
  };

  const handlePLZChange = (plz: string) => {
    onUpdate({ plz });
  };

  const handleOrtChange = (ort: string) => {
    onUpdate({ ort });
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <MapPin className="w-5 h-5 text-primary" />
          Adresse
        </CardTitle>
        <p className="text-sm text-muted-foreground">
          Ihre Wohnadresse für Kontakt und Bewerbungen
        </p>
      </CardHeader>
      
      <CardContent className="space-y-4">
        {/* PLZ and Ort using the shared selector */}
        <div className="space-y-2">
          <Label className="required">
            Postleitzahl und Ort
          </Label>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <FormFieldError error={getFieldError('plz')}>
              <div>
                <PLZOrtSelector
                  plz={profileData.plz}
                  ort={profileData.ort}
                  onPLZChange={handlePLZChange}
                  onOrtChange={handleOrtChange}
                  plzLabel="Postleitzahl"
                  ortLabel="Ort"
                />
              </div>
            </FormFieldError>
          </div>
        </div>

        {/* Street and House Number */}
        <div className="grid grid-cols-3 md:grid-cols-4 gap-4">
          <div className="col-span-2 md:col-span-3 space-y-2">
            <Label htmlFor="strasse" className="required">
              Straße
            </Label>
            <FormFieldError error={getFieldError('strasse')}>
              <Input
                id="strasse"
                type="text"
                placeholder="Musterstraße"
                value={profileData.strasse}
                onChange={(e) => onUpdate({ strasse: e.target.value })}
                className="w-full"
              />
            </FormFieldError>
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="hausnummer" className="required">
              Nr.
            </Label>
            <FormFieldError error={getFieldError('hausnummer')}>
              <Input
                id="hausnummer"
                type="text"
                placeholder="123"
                value={profileData.hausnummer}
                onChange={(e) => onUpdate({ hausnummer: e.target.value })}
                className="w-full"
              />
            </FormFieldError>
          </div>
        </div>

        {/* Help Text */}
        <div className="bg-muted/50 rounded-lg p-3">
          <p className="text-sm text-muted-foreground">
            <strong>Datenschutz:</strong> Ihre Adresse wird nur für offizielle 
            Bewerbungsunterlagen verwendet und nicht öffentlich angezeigt.
          </p>
        </div>
      </CardContent>
    </Card>
  );
};