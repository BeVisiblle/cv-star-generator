import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Checkbox } from '@/components/ui/checkbox';
import { Card, CardContent } from '@/components/ui/card';
import { useToast } from '@/hooks/use-toast';
import { OnboardingData } from './OnboardingWizard';
import { Building2, CheckCircle, Shield } from 'lucide-react';

interface OnboardingStep1Props {
  data: OnboardingData;
  updateData: (newData: Partial<OnboardingData>) => void;
  onNext: () => void;
}

export function OnboardingStep1({ data, updateData, onNext }: OnboardingStep1Props) {
  const [errors, setErrors] = useState<Record<string, string>>({});
  const { toast } = useToast();

  const companySizes = [
    { value: '1-9', label: '1-9 Mitarbeiter' },
    { value: '10-49', label: '10-49 Mitarbeiter' },
    { value: '50-249', label: '50-249 Mitarbeiter' },
    { value: '250-999', label: '250-999 Mitarbeiter' },
    { value: '1000+', label: '1.000+ Mitarbeiter' }
  ];

  const lookingForOptions = [
    { value: 'Praktikanten', label: 'Praktikanten' },
    { value: 'Auszubildende', label: 'Auszubildende' },
    { value: 'Fachkräfte', label: 'Fachkräfte' }
  ];

  const validateStep = () => {
    const newErrors: Record<string, string> = {};
    
    if (!data.firstName.trim()) newErrors.firstName = 'Vorname ist erforderlich';
    if (!data.lastName.trim()) newErrors.lastName = 'Nachname ist erforderlich';
    if (!data.email.trim()) newErrors.email = 'E-Mail ist erforderlich';
    if (data.email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(data.email)) {
      newErrors.email = 'Ungültige E-Mail-Adresse';
    }
    if (!data.phone.trim()) newErrors.phone = 'Telefonnummer ist erforderlich';
    if (!data.companyName.trim()) newErrors.companyName = 'Unternehmensname ist erforderlich';
    if (!data.companySize) newErrors.companySize = 'Unternehmensgröße ist erforderlich';
    if (data.lookingFor.length === 0) newErrors.lookingFor = 'Mindestens eine Option wählen';
    if (!data.acceptedTerms) newErrors.acceptedTerms = 'Nutzungsbedingungen müssen akzeptiert werden';
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleNext = () => {
    if (validateStep()) {
      onNext();
    } else {
      toast({
        title: "Bitte korrigieren Sie die Fehler",
        variant: "destructive",
      });
    }
  };

  const toggleLookingFor = (option: string) => {
    const current = data.lookingFor;
    const updated = current.includes(option)
      ? current.filter(item => item !== option)
      : [...current, option];
    updateData({ lookingFor: updated });
  };

  return (
    <div className="grid lg:grid-cols-2 gap-12 items-start">
      {/* Left Side - Image and Benefits */}
      <div className="space-y-8">
        <div className="aspect-[4/3] rounded-2xl bg-gradient-to-br from-accent/20 to-primary/20 flex items-center justify-center">
          <Building2 className="h-24 w-24 text-primary" />
        </div>
        
        <div className="space-y-4">
          <h3 className="text-xl font-semibold">Ihre Vorteile</h3>
          <div className="space-y-3">
            <div className="flex items-center gap-3">
              <CheckCircle className="h-5 w-5 text-green-500" />
              <span className="text-muted-foreground">Zugang zu qualifizierten Kandidaten</span>
            </div>
            <div className="flex items-center gap-3">
              <CheckCircle className="h-5 w-5 text-green-500" />
              <span className="text-muted-foreground">Intelligentes Matching-System</span>
            </div>
            <div className="flex items-center gap-3">
              <CheckCircle className="h-5 w-5 text-green-500" />
              <span className="text-muted-foreground">Schnelle Kommunikation mit Bewerbern</span>
            </div>
          </div>
          
          <div className="flex items-center gap-2 pt-4 text-sm text-muted-foreground">
            <Shield className="h-4 w-4" />
            <span>DSGVO-konform • Serverstandort Frankfurt • Daten nur mit Einwilligung weitergegeben</span>
          </div>
        </div>
      </div>

      {/* Right Side - Form */}
      <Card>
        <CardContent className="p-8">
          <div className="space-y-6">
            <div className="text-center space-y-2">
              <h2 className="text-2xl font-semibold">Lass uns starten</h2>
              <p className="text-muted-foreground">Damit wir dir das beste Paket zeigen können, brauchen wir ein paar Details.</p>
            </div>

            <div className="space-y-6">
              {/* Personal Information */}
              <div className="space-y-4">
                <h3 className="font-medium">Ihre Kontaktdaten</h3>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="firstName">Vorname *</Label>
                    <Input
                      id="firstName"
                      value={data.firstName}
                      onChange={(e) => updateData({ firstName: e.target.value })}
                      placeholder="Max"
                      className={errors.firstName ? "border-destructive" : ""}
                    />
                    {errors.firstName && (
                      <p className="text-sm text-destructive">{errors.firstName}</p>
                    )}
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="lastName">Nachname *</Label>
                    <Input
                      id="lastName"
                      value={data.lastName}
                      onChange={(e) => updateData({ lastName: e.target.value })}
                      placeholder="Mustermann"
                      className={errors.lastName ? "border-destructive" : ""}
                    />
                    {errors.lastName && (
                      <p className="text-sm text-destructive">{errors.lastName}</p>
                    )}
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="email">E-Mail *</Label>
                  <Input
                    id="email"
                    type="email"
                    value={data.email}
                    onChange={(e) => updateData({ email: e.target.value })}
                    placeholder="max.mustermann@unternehmen.de"
                    className={errors.email ? "border-destructive" : ""}
                  />
                  {errors.email && (
                    <p className="text-sm text-destructive">{errors.email}</p>
                  )}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="phone">Telefonnummer *</Label>
                  <Input
                    id="phone"
                    value={data.phone}
                    onChange={(e) => updateData({ phone: e.target.value })}
                    placeholder="+49 30 12345678"
                    className={errors.phone ? "border-destructive" : ""}
                  />
                  {errors.phone && (
                    <p className="text-sm text-destructive">{errors.phone}</p>
                  )}
                </div>
              </div>

              {/* Company Information */}
              <div className="space-y-4">
                <h3 className="font-medium">Ihr Unternehmen</h3>
                <div className="space-y-2">
                  <Label htmlFor="companyName">Unternehmensname *</Label>
                  <Input
                    id="companyName"
                    value={data.companyName}
                    onChange={(e) => updateData({ companyName: e.target.value })}
                    placeholder="Ihre Firma GmbH"
                    className={errors.companyName ? "border-destructive" : ""}
                  />
                  {errors.companyName && (
                    <p className="text-sm text-destructive">{errors.companyName}</p>
                  )}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="companySize">Unternehmensgröße *</Label>
                  <Select value={data.companySize} onValueChange={(value) => updateData({ companySize: value })}>
                    <SelectTrigger className={errors.companySize ? "border-destructive" : ""}>
                      <SelectValue placeholder="Wählen Sie die Größe" />
                    </SelectTrigger>
                    <SelectContent>
                      {companySizes.map(size => (
                        <SelectItem key={size.value} value={size.value}>
                          {size.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  {errors.companySize && (
                    <p className="text-sm text-destructive">{errors.companySize}</p>
                  )}
                </div>

                <div className="space-y-2">
                  <Label>Was suchst du? *</Label>
                  <p className="text-sm text-muted-foreground">Mehrfachauswahl möglich</p>
                  <div className="flex flex-wrap gap-2">
                    {lookingForOptions.map(option => (
                      <Badge
                        key={option.value}
                        variant={data.lookingFor.includes(option.value) ? "default" : "outline"}
                        className="cursor-pointer"
                        onClick={() => toggleLookingFor(option.value)}
                      >
                        {option.label}
                      </Badge>
                    ))}
                  </div>
                  {errors.lookingFor && (
                    <p className="text-sm text-destructive">{errors.lookingFor}</p>
                  )}
                </div>
              </div>

              {/* Legal */}
              <div className="space-y-4">
                <div className="flex items-start space-x-2">
                  <Checkbox
                    id="terms"
                    checked={data.acceptedTerms}
                    onCheckedChange={(checked) => updateData({ acceptedTerms: !!checked })}
                  />
                  <div className="grid gap-1.5 leading-none">
                    <label
                      htmlFor="terms"
                      className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                    >
                      Ich akzeptiere die{' '}
                      <a href="/agb" target="_blank" className="text-primary hover:underline">
                        AGB
                      </a>{' '}
                      und{' '}
                      <a href="/datenschutz" target="_blank" className="text-primary hover:underline">
                        Datenschutzerklärung
                      </a>
                    </label>
                  </div>
                </div>
                {errors.acceptedTerms && (
                  <p className="text-sm text-destructive">{errors.acceptedTerms}</p>
                )}
              </div>

              <Button 
                onClick={handleNext}
                className="w-full h-12 text-lg font-semibold"
                disabled={!data.acceptedTerms}
              >
                Weiter: Plan wählen →
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}