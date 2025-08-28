import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import { ArrowLeft, Upload, Building } from 'lucide-react';
import { OnboardingData } from './OnboardingWizard';
import { useToast } from '@/hooks/use-toast';

interface OnboardingStep4Props {
  data: OnboardingData;
  updateData: (data: Partial<OnboardingData>) => void;
  onNext: () => void;
  onPrev: () => void;
}

export function OnboardingStep4({ data, updateData, onNext, onPrev }: OnboardingStep4Props) {
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [logoPreview, setLogoPreview] = useState<string | null>(null);
  const { toast } = useToast();

  const companySizes = [
    { value: '1-10', label: '1-10 Mitarbeiter' },
    { value: '11-50', label: '11-50 Mitarbeiter' },
    { value: '51-200', label: '51-200 Mitarbeiter' },
    { value: '200+', label: '200+ Mitarbeiter' },
  ];

  const benefitOptions = [
    'Übernahmechance',
    'Weiterbildung',
    'Fahrtkostenzuschuss',
    'Wohnheim',
    'Azubi-Events',
    'Flexible Arbeitszeiten',
    'Mentoring',
    'Moderne Ausstattung'
  ];

  const handleLogoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      updateData({ logo: file });
      
      // Create preview
      const reader = new FileReader();
      reader.onload = (e) => {
        setLogoPreview(e.target?.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleBenefitChange = (benefit: string, checked: boolean) => {
    const newBenefits = checked 
      ? [...data.benefits, benefit]
      : data.benefits.filter(b => b !== benefit);
    updateData({ benefits: newBenefits });
  };

  const validateStep = () => {
    const newErrors: Record<string, string> = {};
    
    if (!data.shortDescription.trim()) {
      newErrors.shortDescription = 'Kurzbeschreibung ist erforderlich';
    }
    if (!data.companySize) {
      newErrors.companySize = 'Unternehmensgröße auswählen';
    }
    if (!data.contactName.trim()) {
      newErrors.contactName = 'Ansprechpartner Name ist erforderlich';
    }
    if (!data.contactRole.trim()) {
      newErrors.contactRole = 'Rolle ist erforderlich';
    }
    if (!data.contactEmail.trim()) {
      newErrors.contactEmail = 'Ansprechpartner E-Mail ist erforderlich';
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
      <div className="text-center mb-8">
        <h2 className="text-2xl font-semibold mb-2">Ihr Unternehmensprofil</h2>
        <p className="text-muted-foreground">
          Erstellen Sie ein ansprechendes Profil für potentielle Kandidaten
        </p>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        {/* Logo Upload */}
        <div className="md:col-span-2">
          <Label>Firmenlogo</Label>
          <div className="mt-2 border-2 border-dashed border-muted-foreground/25 rounded-lg p-6 text-center hover:border-[hsl(var(--accent))] transition-colors">
            {logoPreview ? (
              <div className="space-y-4">
                <img 
                  src={logoPreview} 
                  alt="Logo Preview" 
                  className="h-20 w-20 object-contain mx-auto rounded"
                />
                <p className="text-sm text-muted-foreground">Logo hochgeladen</p>
              </div>
            ) : (
              <div className="space-y-4">
                <Building className="h-12 w-12 mx-auto text-muted-foreground" />
                <div>
                  <p className="text-sm font-medium">Logo hochladen</p>
                  <p className="text-xs text-muted-foreground">Quadratisches Format empfohlen</p>
                </div>
              </div>
            )}
            <input
              type="file"
              accept="image/*"
              onChange={handleLogoUpload}
              className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
            />
          </div>
        </div>

        {/* Short Description */}
        <div className="space-y-2">
          <Label htmlFor="shortDescription">Kurzbeschreibung * (200 Zeichen)</Label>
          <Textarea
            id="shortDescription"
            value={data.shortDescription}
            onChange={(e) => updateData({ shortDescription: e.target.value })}
            placeholder="Was macht Ihr Unternehmen besonders?"
            maxLength={200}
            className={`h-20 ${errors.shortDescription ? 'border-destructive' : ''}`}
          />
          <p className="text-xs text-muted-foreground text-right">
            {data.shortDescription.length}/200
          </p>
          {errors.shortDescription && (
            <p className="text-sm text-destructive">{errors.shortDescription}</p>
          )}
        </div>

        {/* Long Description */}
        <div className="space-y-2">
          <Label htmlFor="longDescription">Detailbeschreibung (600 Zeichen)</Label>
          <Textarea
            id="longDescription"
            value={data.longDescription}
            onChange={(e) => updateData({ longDescription: e.target.value })}
            placeholder="Detaillierte Beschreibung Ihres Unternehmens..."
            maxLength={600}
            className="h-20"
          />
          <p className="text-xs text-muted-foreground text-right">
            {data.longDescription.length}/600
          </p>
        </div>

        {/* Company Size */}
        <div className="space-y-2">
          <Label>Unternehmensgröße *</Label>
          <Select value={data.companySize} onValueChange={(value) => updateData({ companySize: value })}>
            <SelectTrigger className={errors.companySize ? 'border-destructive' : ''}>
              <SelectValue placeholder="Größe auswählen" />
            </SelectTrigger>
            <SelectContent className="bg-background border z-50">
              {companySizes.map((size) => (
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

        {/* Benefits */}
        <div className="md:col-span-2 space-y-4">
          <Label>Benefits für Azubis</Label>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            {benefitOptions.map((benefit) => (
              <div key={benefit} className="flex items-center space-x-2">
                <Checkbox
                  id={benefit}
                  checked={data.benefits.includes(benefit)}
                  onCheckedChange={(checked) => handleBenefitChange(benefit, checked as boolean)}
                />
                <Label htmlFor={benefit} className="text-sm">
                  {benefit}
                </Label>
              </div>
            ))}
          </div>
        </div>

        {/* Contact Person */}
        <div className="md:col-span-2">
          <h3 className="font-semibold mb-4">Ansprechpartner</h3>
          <div className="grid gap-4 md:grid-cols-3">
            <div className="space-y-2">
              <Label htmlFor="contactName">Name *</Label>
              <Input
                id="contactName"
                value={data.contactName}
                onChange={(e) => updateData({ contactName: e.target.value })}
                placeholder="Max Mustermann"
                className={errors.contactName ? 'border-destructive' : ''}
              />
              {errors.contactName && (
                <p className="text-sm text-destructive">{errors.contactName}</p>
              )}
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="contactRole">Rolle *</Label>
              <Input
                id="contactRole"
                value={data.contactRole}
                onChange={(e) => updateData({ contactRole: e.target.value })}
                placeholder="Ausbildungsleiter"
                className={errors.contactRole ? 'border-destructive' : ''}
              />
              {errors.contactRole && (
                <p className="text-sm text-destructive">{errors.contactRole}</p>
              )}
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="contactEmail">E-Mail *</Label>
              <Input
                id="contactEmail"
                type="email"
                value={data.contactEmail}
                onChange={(e) => updateData({ contactEmail: e.target.value })}
                placeholder="max@firma.de"
                className={errors.contactEmail ? 'border-destructive' : ''}
              />
              {errors.contactEmail && (
                <p className="text-sm text-destructive">{errors.contactEmail}</p>
              )}
            </div>
          </div>
        </div>
      </div>

      <div className="flex justify-between pt-6">
        <Button variant="outline" onClick={onPrev}>
          <ArrowLeft className="h-4 w-4 mr-2" />
          Zurück
        </Button>
        
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