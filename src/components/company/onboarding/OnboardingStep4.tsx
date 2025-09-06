import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ArrowLeft, Upload, Building2, MapPin, User, Globe } from 'lucide-react';
import { OnboardingData } from './OnboardingWizard';
import { useToast } from '@/hooks/use-toast';

interface OnboardingStep4Props {
  data: OnboardingData;
  updateData: (newData: Partial<OnboardingData>) => void;
  onNext: () => void;
  onPrev: () => void;
}

export function OnboardingStep4({ data, updateData, onNext, onPrev }: OnboardingStep4Props) {
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [logoPreview, setLogoPreview] = useState<string | null>(null);
  const [coverPreview, setCoverPreview] = useState<string | null>(null);
  const { toast } = useToast();

  const handleLogoUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      updateData({ logo: file });
      const reader = new FileReader();
      reader.onload = (e) => setLogoPreview(e.target?.result as string);
      reader.readAsDataURL(file);
    }
  };

  const handleCoverUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      updateData({ coverImage: file });
      const reader = new FileReader();
      reader.onload = (e) => setCoverPreview(e.target?.result as string);
      reader.readAsDataURL(file);
    }
  };

  const validateStep = () => {
    const newErrors: Record<string, string> = {};
    
    if (!data.location.trim()) newErrors.location = 'Standort ist erforderlich';
    if (!data.contactPersonName.trim()) newErrors.contactPersonName = 'Name ist erforderlich';
    if (!data.contactPersonRole.trim()) newErrors.contactPersonRole = 'Rolle ist erforderlich';
    if (!data.contactPersonEmail.trim()) newErrors.contactPersonEmail = 'E-Mail ist erforderlich';
    if (!data.shortDescription.trim()) newErrors.shortDescription = 'Kurzbeschreibung ist erforderlich';
    
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

  return (
    <div className="space-y-8">
      <div className="text-center space-y-2">
        <h2 className="text-3xl font-bold">Profil einrichten</h2>
        <p className="text-muted-foreground text-lg">
          Vervollständigen Sie Ihr Unternehmensprofil für bessere Sichtbarkeit
        </p>
      </div>

      <div className="grid lg:grid-cols-2 gap-8">
        {/* Left Column - Images */}
        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Building2 className="h-5 w-5" />
                Logo & Titelbild
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Logo Upload */}
              <div className="space-y-2">
                <Label>Firmenlogo</Label>
                <div className="flex items-center gap-4">
                  <div className="w-20 h-20 border-2 border-dashed border-muted-foreground/25 rounded-lg flex items-center justify-center overflow-hidden">
                    {logoPreview ? (
                      <img src={logoPreview} alt="Logo Preview" className="w-full h-full object-cover" />
                    ) : (
                      <Upload className="h-6 w-6 text-muted-foreground" />
                    )}
                  </div>
                  <div>
                    <input
                      type="file"
                      accept="image/*"
                      onChange={handleLogoUpload}
                      className="hidden"
                      id="logo-upload"
                    />
                    <Button variant="outline" asChild>
                      <label htmlFor="logo-upload" className="cursor-pointer">
                        Logo hochladen
                      </label>
                    </Button>
                    <p className="text-xs text-muted-foreground mt-1">
                      Empfohlen: 200x200px, PNG oder JPG
                    </p>
                  </div>
                </div>
              </div>

              {/* Cover Image Upload */}
              <div className="space-y-2">
                <Label>Titelbild</Label>
                <div className="space-y-3">
                  <div className="w-full h-32 border-2 border-dashed border-muted-foreground/25 rounded-lg flex items-center justify-center overflow-hidden">
                    {coverPreview ? (
                      <img src={coverPreview} alt="Cover Preview" className="w-full h-full object-cover" />
                    ) : (
                      <div className="text-center">
                        <Upload className="h-8 w-8 text-muted-foreground mx-auto mb-2" />
                        <p className="text-sm text-muted-foreground">Titelbild hochladen</p>
                      </div>
                    )}
                  </div>
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleCoverUpload}
                    className="hidden"
                    id="cover-upload"
                  />
                  <Button variant="outline" className="w-full" asChild>
                    <label htmlFor="cover-upload" className="cursor-pointer">
                      Titelbild auswählen
                    </label>
                  </Button>
                  <p className="text-xs text-muted-foreground">
                    Empfohlen: 1200x400px, PNG oder JPG
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Right Column - Form */}
        <div className="space-y-6">
          {/* Location */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <MapPin className="h-5 w-5" />
                Standort
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                <Label htmlFor="location">Adresse / Ort *</Label>
                <Input
                  id="location"
                  value={data.location}
                  onChange={(e) => updateData({ location: e.target.value })}
                  placeholder="Musterstraße 123, 10115 Berlin"
                  className={errors.location ? "border-destructive" : ""}
                />
                {errors.location && (
                  <p className="text-sm text-destructive">{errors.location}</p>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Contact Person */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <User className="h-5 w-5" />
                Ansprechperson
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="contactPersonName">Name *</Label>
                  <Input
                    id="contactPersonName"
                    value={data.contactPersonName}
                    onChange={(e) => updateData({ contactPersonName: e.target.value })}
                    placeholder="Max Mustermann"
                    className={errors.contactPersonName ? "border-destructive" : ""}
                  />
                  {errors.contactPersonName && (
                    <p className="text-sm text-destructive">{errors.contactPersonName}</p>
                  )}
                </div>
                <div className="space-y-2">
                  <Label htmlFor="contactPersonRole">Rolle *</Label>
                  <Input
                    id="contactPersonRole"
                    value={data.contactPersonRole}
                    onChange={(e) => updateData({ contactPersonRole: e.target.value })}
                    placeholder="HR Manager"
                    className={errors.contactPersonRole ? "border-destructive" : ""}
                  />
                  {errors.contactPersonRole && (
                    <p className="text-sm text-destructive">{errors.contactPersonRole}</p>
                  )}
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="contactPersonEmail">E-Mail *</Label>
                <Input
                  id="contactPersonEmail"
                  type="email"
                  value={data.contactPersonEmail}
                  onChange={(e) => updateData({ contactPersonEmail: e.target.value })}
                  placeholder="max.mustermann@unternehmen.de"
                  className={errors.contactPersonEmail ? "border-destructive" : ""}
                />
                {errors.contactPersonEmail && (
                  <p className="text-sm text-destructive">{errors.contactPersonEmail}</p>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Description */}
          <Card>
            <CardHeader>
              <CardTitle>Kurzbeschreibung</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                <Label htmlFor="shortDescription">Über Ihr Unternehmen *</Label>
                <Textarea
                  id="shortDescription"
                  value={data.shortDescription}
                  onChange={(e) => updateData({ shortDescription: e.target.value })}
                  placeholder="Beschreiben Sie Ihr Unternehmen, Mission und Benefits in 250-500 Zeichen..."
                  rows={4}
                  maxLength={500}
                  className={errors.shortDescription ? "border-destructive" : ""}
                />
                <div className="flex justify-between items-center">
                  {errors.shortDescription && (
                    <p className="text-sm text-destructive">{errors.shortDescription}</p>
                  )}
                  <p className="text-xs text-muted-foreground ml-auto">
                    {data.shortDescription.length}/500 Zeichen
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Web & Socials */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Globe className="h-5 w-5" />
                Web & Socials
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="website">Website</Label>
                <Input
                  id="website"
                  value={data.website}
                  onChange={(e) => updateData({ website: e.target.value })}
                  placeholder="https://www.ihr-unternehmen.de"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="linkedin">LinkedIn</Label>
                <Input
                  id="linkedin"
                  value={data.linkedin}
                  onChange={(e) => updateData({ linkedin: e.target.value })}
                  placeholder="https://linkedin.com/company/ihr-unternehmen"
                />
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      <div className="flex justify-between pt-6">
        <Button variant="outline" onClick={onPrev}>
          <ArrowLeft className="h-4 w-4 mr-2" />
          Zurück
        </Button>
        <Button onClick={handleNext} className="px-8">
          Weiter
        </Button>
      </div>
    </div>
  );
}