import React from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { FormFieldError } from '@/components/ui/form-field-error';
import { User, Mail, Calendar } from 'lucide-react';
import type { ProfileCreationData, ValidationErrors } from '@/hooks/useProfileCreation';

interface BasicInfoStepProps {
  profileData: ProfileCreationData;
  validationErrors: ValidationErrors;
  onUpdate: (updates: Partial<ProfileCreationData>) => void;
}

export const BasicInfoStep: React.FC<BasicInfoStepProps> = ({
  profileData,
  validationErrors,
  onUpdate
}) => {
  const stepErrors = validationErrors[1] || [];
  
  const getFieldError = (field: string) => {
    return stepErrors.find(error => error.includes(field));
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <User className="w-5 h-5 text-primary" />
          Grunddaten
        </CardTitle>
        <p className="text-sm text-muted-foreground">
          Ihre persönlichen Informationen für den Lebenslauf
        </p>
      </CardHeader>
      
      <CardContent className="space-y-4">
        {/* Name Fields - Side by side on desktop */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="vorname" className="required">
              Vorname
            </Label>
            <FormFieldError error={getFieldError('vorname')}>
              <Input
                id="vorname"
                type="text"
                placeholder="Max"
                value={profileData.vorname}
                onChange={(e) => onUpdate({ vorname: e.target.value })}
                className="w-full"
              />
            </FormFieldError>
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="nachname" className="required">
              Nachname
            </Label>
            <FormFieldError error={getFieldError('nachname')}>
              <Input
                id="nachname"
                type="text"
                placeholder="Mustermann"
                value={profileData.nachname}
                onChange={(e) => onUpdate({ nachname: e.target.value })}
                className="w-full"
              />
            </FormFieldError>
          </div>
        </div>

        {/* Email */}
        <div className="space-y-2">
          <Label htmlFor="email" className="required flex items-center gap-2">
            <Mail className="w-4 h-4" />
            E-Mail-Adresse
          </Label>
          <FormFieldError error={getFieldError('email')}>
            <Input
              id="email"
              type="email"
              placeholder="max.mustermann@email.de"
              value={profileData.email}
              onChange={(e) => onUpdate({ email: e.target.value })}
              className="w-full"
            />
          </FormFieldError>
        </div>

        {/* Date of Birth */}
        <div className="space-y-2">
          <Label htmlFor="geburtsdatum" className="required flex items-center gap-2">
            <Calendar className="w-4 h-4" />
            Geburtsdatum
          </Label>
          <FormFieldError error={getFieldError('geburtsdatum')}>
            <Input
              id="geburtsdatum"
              type="date"
              value={profileData.geburtsdatum}
              onChange={(e) => onUpdate({ geburtsdatum: e.target.value })}
              className="w-full"
              max={new Date(Date.now() - 14 * 365 * 24 * 60 * 60 * 1000).toISOString().split('T')[0]} // At least 14 years old
            />
          </FormFieldError>
        </div>

        {/* Help Text */}
        <div className="bg-muted/50 rounded-lg p-3">
          <p className="text-sm text-muted-foreground">
            <strong>Tipp:</strong> Diese Daten werden in Ihrem Lebenslauf verwendet. 
            Stellen Sie sicher, dass alle Informationen korrekt sind.
          </p>
        </div>
      </CardContent>
    </Card>
  );
};