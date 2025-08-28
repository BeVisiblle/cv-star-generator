import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { PLZOrtSelector } from '@/components/shared/PLZOrtSelector';
import { OnboardingData } from './OnboardingWizard';
import { useToast } from '@/hooks/use-toast';

interface OnboardingStep1Props {
  data: OnboardingData;
  updateData: (data: Partial<OnboardingData>) => void;
  onNext: () => void;
}

export function OnboardingStep1({ data, updateData, onNext }: OnboardingStep1Props) {
  const [errors, setErrors] = useState<Record<string, string>>({});
  const { toast } = useToast();

  const industries = [
    { value: 'handwerk', label: 'Handwerk' },
    { value: 'it', label: 'IT & Technik' },
    { value: 'gesundheit', label: 'Gesundheitswesen' },
    { value: 'buero', label: 'Büro & Verwaltung' },
    { value: 'verkauf', label: 'Verkauf & Handel' },
    { value: 'gastronomie', label: 'Gastronomie & Tourismus' },
    { value: 'bau', label: 'Bau & Architektur' },
    { value: 'logistik', label: 'Logistik & Transport' },
    { value: 'industrie', label: 'Industrie & Produktion' },
    { value: 'sonstige', label: 'Sonstige' },
  ];

  const validateStep = () => {
    const newErrors: Record<string, string> = {};
    
    if (!data.companyName.trim()) {
      newErrors.companyName = 'Firmenname ist erforderlich';
    }
    if (!data.email.trim()) {
      newErrors.email = 'E-Mail ist erforderlich';
    } else if (!/\S+@\S+\.\S+/.test(data.email)) {
      newErrors.email = 'Gültige E-Mail-Adresse eingeben';
    }
    if (!data.password.trim()) {
      newErrors.password = 'Passwort ist erforderlich';
    } else if (data.password.length < 6) {
      newErrors.password = 'Passwort muss mindestens 6 Zeichen haben';
    }
    if (!data.phone.trim()) {
      newErrors.phone = 'Telefonnummer ist erforderlich';
    }
    if (!data.industry) {
      newErrors.industry = 'Branche auswählen';
    }
    if (!data.location.trim()) {
      newErrors.location = 'Standort ist erforderlich';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleNext = () => {
    if (validateStep()) {
      onNext();
    } else {
      toast({
        title: "Bitte alle Pflichtfelder ausfüllen",
        variant: "destructive",
      });
    }
  };

  return (
    <div className="space-y-6">
      <div className="text-center mb-6">
        <h2 className="text-2xl font-semibold mb-2">Unternehmensdaten</h2>
        <p className="text-muted-foreground">
          Grundlegende Informationen zu Ihrem Unternehmen
        </p>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        <div className="space-y-2">
          <Label htmlFor="companyName">Firmenname *</Label>
          <Input
            id="companyName"
            value={data.companyName}
            onChange={(e) => updateData({ companyName: e.target.value })}
            placeholder="Ihre Firma GmbH"
            className={errors.companyName ? 'border-destructive' : ''}
          />
          {errors.companyName && (
            <p className="text-sm text-destructive">{errors.companyName}</p>
          )}
        </div>

        <div className="space-y-2">
          <Label htmlFor="email">E-Mail *</Label>
          <Input
            id="email"
            type="email"
            value={data.email}
            onChange={(e) => updateData({ email: e.target.value })}
            placeholder="kontakt@ihrefirma.de"
            className={errors.email ? 'border-destructive' : ''}
          />
          {errors.email && (
            <p className="text-sm text-destructive">{errors.email}</p>
          )}
        </div>

        <div className="space-y-2">
          <Label htmlFor="password">Passwort *</Label>
          <Input
            id="password"
            type="password"
            value={data.password}
            onChange={(e) => updateData({ password: e.target.value })}
            placeholder="Mindestens 6 Zeichen"
            className={errors.password ? 'border-destructive' : ''}
          />
          {errors.password && (
            <p className="text-sm text-destructive">{errors.password}</p>
          )}
        </div>

        <div className="space-y-2">
          <Label htmlFor="phone">Telefonnummer *</Label>
          <Input
            id="phone"
            value={data.phone}
            onChange={(e) => updateData({ phone: e.target.value })}
            placeholder="+49 123 456789"
            className={errors.phone ? 'border-destructive' : ''}
          />
          {errors.phone && (
            <p className="text-sm text-destructive">{errors.phone}</p>
          )}
        </div>

        <div className="space-y-2">
          <Label>Branche *</Label>
          <Select value={data.industry} onValueChange={(value) => updateData({ industry: value })}>
            <SelectTrigger className={errors.industry ? 'border-destructive' : ''}>
              <SelectValue placeholder="Branche auswählen" />
            </SelectTrigger>
            <SelectContent className="bg-background border z-50">
              {industries.map((industry) => (
                <SelectItem key={industry.value} value={industry.value}>
                  {industry.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          {errors.industry && (
            <p className="text-sm text-destructive">{errors.industry}</p>
          )}
        </div>

        <div className="space-y-2">
          <Label>Standort (PLZ + Stadt) *</Label>
          <Input
            value={data.location}
            onChange={(e) => updateData({ location: e.target.value })}
            placeholder="z.B. 10115 Berlin"
            className={errors.location ? 'border-destructive' : ''}
          />
          {errors.location && (
            <p className="text-sm text-destructive">{errors.location}</p>
          )}
        </div>
      </div>

      <div className="flex justify-end pt-6">
        <Button 
          onClick={handleNext}
          className="bg-[hsl(var(--accent))] hover:bg-[hsl(var(--accent-hover))] text-white px-8"
        >
          Weiter
        </Button>
      </div>
    </div>
  );
}