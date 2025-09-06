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
import { X } from 'lucide-react';

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

  const lookingForOptions = ['Praktikanten', 'Auszubildende', 'Fachkräfte'];

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

  const isValid = data.firstName && data.lastName && data.email && data.phone && 
                  data.companyName && data.companySize && data.lookingFor.length > 0 && 
                  data.acceptedTerms;

  const availableOptions = lookingForOptions.filter(option => !data.lookingFor.includes(option));

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-black to-slate-900 flex items-center justify-center py-20">
      <div className="w-full max-w-md mx-auto px-4">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="text-sm text-green-400 font-medium tracking-wide uppercase mb-2">
            KOSTENLOS TESTEN
          </div>
          <h1 className="text-4xl font-bold text-white mb-4">
            Jetzt kostenlos starten
          </h1>
          <p className="text-slate-300 text-lg">
            Testen Sie Ausbildungsbasis 14 Tage lang kostenlos. 
            Keine Kreditkarte, kein Setup und keine Kündigung erforderlich.
          </p>
        </div>

        {/* Form Card */}
        <Card className="bg-white/10 backdrop-blur-lg border-white/20 shadow-2xl">
          <CardContent className="p-8 space-y-6">
            {/* Personal Information */}
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="firstName" className="text-white">Vorname *</Label>
                <Input
                  id="firstName"
                  placeholder="Max"
                  value={data.firstName}
                  onChange={(e) => updateData({ firstName: e.target.value })}
                  className="bg-white/10 border-white/20 text-white placeholder:text-white/60"
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="lastName" className="text-white">Nachname *</Label>
                <Input
                  id="lastName"
                  placeholder="Mustermann"
                  value={data.lastName}
                  onChange={(e) => updateData({ lastName: e.target.value })}
                  className="bg-white/10 border-white/20 text-white placeholder:text-white/60"
                  required
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="email" className="text-white">E-Mail (geschäftlich) *</Label>
              <Input
                id="email"
                type="email"
                placeholder="max@unternehmen.de"
                value={data.email}
                onChange={(e) => updateData({ email: e.target.value })}
                className="bg-white/10 border-white/20 text-white placeholder:text-white/60"
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="phone" className="text-white">Telefonnummer *</Label>
              <div className="flex gap-2">
                <Select defaultValue="+49">
                  <SelectTrigger className="w-20 bg-white/10 border-white/20 text-white">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="+49">+49</SelectItem>
                    <SelectItem value="+43">+43</SelectItem>
                    <SelectItem value="+41">+41</SelectItem>
                  </SelectContent>
                </Select>
                <Input
                  id="phone"
                  placeholder="30 12345678"
                  value={data.phone}
                  onChange={(e) => updateData({ phone: e.target.value })}
                  className="flex-1 bg-white/10 border-white/20 text-white placeholder:text-white/60"
                  required
                />
              </div>
            </div>

            {/* Company Information */}
            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="companyName" className="text-white">Unternehmensname *</Label>
                <Input
                  id="companyName"
                  placeholder="Mustermann GmbH"
                  value={data.companyName}
                  onChange={(e) => updateData({ companyName: e.target.value })}
                  className="bg-white/10 border-white/20 text-white placeholder:text-white/60"
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="companySize" className="text-white">Unternehmensgröße *</Label>
                <Select 
                  value={data.companySize} 
                  onValueChange={(value) => updateData({ companySize: value })}
                >
                  <SelectTrigger className="bg-white/10 border-white/20 text-white">
                    <SelectValue placeholder="Wählen Sie die Größe" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="1-9">1-9 Mitarbeiter</SelectItem>
                    <SelectItem value="10-49">10-49 Mitarbeiter</SelectItem>
                    <SelectItem value="50-249">50-249 Mitarbeiter</SelectItem>
                    <SelectItem value="250-999">250-999 Mitarbeiter</SelectItem>
                    <SelectItem value="1000+">1.000+ Mitarbeiter</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label className="text-white">Was suchst du? *</Label>
                <p className="text-sm text-white/60">Mehrfachauswahl möglich</p>
                <div className="flex flex-wrap gap-2">
                  {data.lookingFor.map((item) => (
                    <Badge key={item} variant="secondary" className="flex items-center gap-1 bg-white/20 text-white">
                      {item}
                      <X 
                        className="h-3 w-3 cursor-pointer" 
                        onClick={() => toggleLookingFor(item)}
                      />
                    </Badge>
                  ))}
                </div>
                <div className="flex flex-wrap gap-2 mt-2">
                  {availableOptions.map((option) => (
                    <Button
                      key={option}
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={() => toggleLookingFor(option)}
                      className="text-sm bg-white/10 border-white/20 text-white hover:bg-white/20"
                    >
                      + {option}
                    </Button>
                  ))}
                </div>
              </div>
            </div>

            <p className="text-xs text-white/60">
              *Bitte füllen Sie alle Pflichtfelder aus, um Ausbildungsbasis bestmöglich kennenzulernen.
            </p>

            <Button 
              onClick={handleNext}
              disabled={!isValid}
              className="w-full bg-black text-white hover:bg-black/90 py-3"
              size="lg"
            >
              Kostenlose Testphase starten
            </Button>

            {/* Legal */}
            <div className="flex items-start space-x-2">
              <Checkbox
                id="terms"
                checked={data.acceptedTerms}
                onCheckedChange={(checked) => updateData({ acceptedTerms: !!checked })}
                className="border-white/20 data-[state=checked]:bg-white data-[state=checked]:text-black"
              />
              <label htmlFor="terms" className="text-xs text-white/80 leading-relaxed">
                Durch Absenden des Formulars bestätige ich, dass ich die{' '}
                <a href="/datenschutz" target="_blank" className="text-green-400 hover:underline">
                  Datenschutzerklärung
                </a>{' '}
                zur Kenntnis genommen habe und mit der Verarbeitung meiner personenbezogenen Daten durch 
                Ausbildungsbasis zu den genannten Zwecken einverstanden bin. Darüber hinaus stimme ich durch 
                Absenden des Formulars den{' '}
                <a href="/agb" target="_blank" className="text-green-400 hover:underline">
                  allgemeinen Geschäftsbedingungen
                </a>{' '}
                zu.
              </label>
            </div>

            <div className="text-center pt-4">
              <p className="text-white/60 text-sm">
                Sie haben bereits einen Account?{' '}
                <a href="/auth" className="text-green-400 hover:underline">
                  Hier einloggen →
                </a>
              </p>
            </div>
          </CardContent>
        </Card>

        {/* Trust indicators */}
        <div className="mt-12 text-center">
          <p className="text-white/60 text-sm mb-6">
            Über 15.000 Unternehmen vertrauen uns, darunter
          </p>
          <div className="flex justify-center items-center gap-8 opacity-60">
            <img src="/lovable-uploads/logo-32x32.png" alt="Partner" className="h-8 w-auto filter grayscale" />
            <img src="/lovable-uploads/logo-32x32.png" alt="Partner" className="h-8 w-auto filter grayscale" />
            <img src="/lovable-uploads/logo-32x32.png" alt="Partner" className="h-8 w-auto filter grayscale" />
          </div>
        </div>
      </div>
    </div>
  );
}