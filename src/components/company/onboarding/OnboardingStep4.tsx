import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent } from '@/components/ui/card';
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
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-black to-slate-900 flex items-center justify-center py-20">
      <div className="w-full max-w-4xl mx-auto px-4">
        {/* Header */}
        <div className="text-center mb-12">
          <div className="text-sm text-green-400 font-medium tracking-wide uppercase mb-2">
            PROFIL EINRICHTEN
          </div>
          <h1 className="text-4xl font-bold text-white mb-4">
            Vervollständigen Sie Ihr Profil
          </h1>
          <p className="text-slate-300 text-lg">
            Ein vollständiges Profil erhöht Ihre Sichtbarkeit bei Kandidaten
          </p>
        </div>

        <div className="grid lg:grid-cols-2 gap-8 mb-8">
          {/* Left Column - Images */}
          <Card className="bg-white/10 backdrop-blur-lg border-white/20 shadow-2xl">
            <CardContent className="p-8 space-y-6">
              <div className="flex items-center gap-2 mb-4">
                <Building2 className="h-5 w-5 text-white" />
                <h3 className="text-lg font-semibold text-white">Logo & Titelbild</h3>
              </div>

              {/* Logo Upload */}
              <div className="space-y-3">
                <Label className="text-white">Firmenlogo</Label>
                <div className="flex items-center gap-4">
                  <div className="w-20 h-20 border-2 border-dashed border-white/20 rounded-lg flex items-center justify-center overflow-hidden bg-white/5">
                    {logoPreview ? (
                      <img src={logoPreview} alt="Logo Preview" className="w-full h-full object-cover" />
                    ) : (
                      <Upload className="h-6 w-6 text-white/60" />
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
                    <Button variant="outline" asChild className="bg-white/10 border-white/20 text-white hover:bg-white/20">
                      <label htmlFor="logo-upload" className="cursor-pointer">
                        Logo hochladen
                      </label>
                    </Button>
                    <p className="text-xs text-white/60 mt-1">
                      Empfohlen: 200x200px, PNG oder JPG
                    </p>
                  </div>
                </div>
              </div>

              {/* Cover Image Upload */}
              <div className="space-y-3">
                <Label className="text-white">Titelbild</Label>
                <div className="w-full h-32 border-2 border-dashed border-white/20 rounded-lg flex items-center justify-center overflow-hidden bg-white/5">
                  {coverPreview ? (
                    <img src={coverPreview} alt="Cover Preview" className="w-full h-full object-cover" />
                  ) : (
                    <div className="text-center">
                      <Upload className="h-8 w-8 text-white/60 mx-auto mb-2" />
                      <p className="text-sm text-white/60">Titelbild hochladen</p>
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
                <Button variant="outline" className="w-full bg-white/10 border-white/20 text-white hover:bg-white/20" asChild>
                  <label htmlFor="cover-upload" className="cursor-pointer">
                    Titelbild auswählen
                  </label>
                </Button>
                <p className="text-xs text-white/60">
                  Empfohlen: 1200x400px, PNG oder JPG
                </p>
              </div>
            </CardContent>
          </Card>

          {/* Right Column - Form */}
          <div className="space-y-6">
            {/* Location */}
            <Card className="bg-white/10 backdrop-blur-lg border-white/20 shadow-2xl">
              <CardContent className="p-6">
                <div className="flex items-center gap-2 mb-4">
                  <MapPin className="h-5 w-5 text-white" />
                  <h3 className="text-lg font-semibold text-white">Standort</h3>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="location" className="text-white">Adresse / Ort *</Label>
                  <Input
                    id="location"
                    value={data.location}
                    onChange={(e) => updateData({ location: e.target.value })}
                    placeholder="Musterstraße 123, 10115 Berlin"
                    className="bg-white/10 border-white/20 text-white placeholder:text-white/60"
                  />
                  {errors.location && (
                    <p className="text-sm text-red-400">{errors.location}</p>
                  )}
                </div>
              </CardContent>
            </Card>

            {/* Contact Person */}
            <Card className="bg-white/10 backdrop-blur-lg border-white/20 shadow-2xl">
              <CardContent className="p-6 space-y-4">
                <div className="flex items-center gap-2">
                  <User className="h-5 w-5 text-white" />
                  <h3 className="text-lg font-semibold text-white">Ansprechperson</h3>
                </div>
                
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="contactPersonName" className="text-white">Name *</Label>
                    <Input
                      id="contactPersonName"
                      value={data.contactPersonName}
                      onChange={(e) => updateData({ contactPersonName: e.target.value })}
                      placeholder="Max Mustermann"
                      className="bg-white/10 border-white/20 text-white placeholder:text-white/60"
                    />
                    {errors.contactPersonName && (
                      <p className="text-sm text-red-400">{errors.contactPersonName}</p>
                    )}
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="contactPersonRole" className="text-white">Rolle *</Label>
                    <Input
                      id="contactPersonRole"
                      value={data.contactPersonRole}
                      onChange={(e) => updateData({ contactPersonRole: e.target.value })}
                      placeholder="HR Manager"
                      className="bg-white/10 border-white/20 text-white placeholder:text-white/60"
                    />
                    {errors.contactPersonRole && (
                      <p className="text-sm text-red-400">{errors.contactPersonRole}</p>
                    )}
                  </div>
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="contactPersonEmail" className="text-white">E-Mail *</Label>
                  <Input
                    id="contactPersonEmail"
                    type="email"
                    value={data.contactPersonEmail}
                    onChange={(e) => updateData({ contactPersonEmail: e.target.value })}
                    placeholder="max.mustermann@unternehmen.de"
                    className="bg-white/10 border-white/20 text-white placeholder:text-white/60"
                  />
                  {errors.contactPersonEmail && (
                    <p className="text-sm text-red-400">{errors.contactPersonEmail}</p>
                  )}
                </div>
              </CardContent>
            </Card>

            {/* Description & Socials */}
            <Card className="bg-white/10 backdrop-blur-lg border-white/20 shadow-2xl">
              <CardContent className="p-6 space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="shortDescription" className="text-white">Kurzbeschreibung *</Label>
                  <Textarea
                    id="shortDescription"
                    value={data.shortDescription}
                    onChange={(e) => updateData({ shortDescription: e.target.value })}
                    placeholder="Beschreiben Sie Ihr Unternehmen, Mission und Benefits..."
                    rows={3}
                    maxLength={500}
                    className="bg-white/10 border-white/20 text-white placeholder:text-white/60"
                  />
                  <div className="flex justify-between items-center">
                    {errors.shortDescription && (
                      <p className="text-sm text-red-400">{errors.shortDescription}</p>
                    )}
                    <p className="text-xs text-white/60 ml-auto">
                      {data.shortDescription.length}/500 Zeichen
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-2 pt-2">
                  <Globe className="h-5 w-5 text-white" />
                  <h4 className="font-medium text-white">Web & Socials</h4>
                </div>
                
                <div className="space-y-3">
                  <div className="space-y-2">
                    <Label htmlFor="website" className="text-white">Website</Label>
                    <Input
                      id="website"
                      value={data.website}
                      onChange={(e) => updateData({ website: e.target.value })}
                      placeholder="https://www.ihr-unternehmen.de"
                      className="bg-white/10 border-white/20 text-white placeholder:text-white/60"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="linkedin" className="text-white">LinkedIn</Label>
                    <Input
                      id="linkedin"
                      value={data.linkedin}
                      onChange={(e) => updateData({ linkedin: e.target.value })}
                      placeholder="https://linkedin.com/company/ihr-unternehmen"
                      className="bg-white/10 border-white/20 text-white placeholder:text-white/60"
                    />
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Navigation */}
        <div className="flex justify-between">
          <Button 
            variant="outline" 
            onClick={onPrev}
            className="bg-white/10 border-white/20 text-white hover:bg-white/20"
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Zurück
          </Button>
          <Button 
            onClick={handleNext} 
            className="bg-green-400 text-black hover:bg-green-500 px-8"
          >
            Weiter
          </Button>
        </div>
      </div>
    </div>
  );
}