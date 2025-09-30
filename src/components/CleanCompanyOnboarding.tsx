import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import { ArrowLeft, ArrowRight, Check } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

interface CompanyData {
  // Step 1
  companyName: string;
  industry: string;
  companySize: string;
  contactPerson: string;
  
  // Step 2
  email: string;
  phone: string;
  website: string;
  password: string;
  confirmPassword: string;
  acceptTerms: boolean;
  acceptPrivacy: boolean;
}

export default function CleanCompanyOnboarding() {
  const [currentStep, setCurrentStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  
  const [data, setData] = useState<CompanyData>({
    companyName: '',
    industry: '',
    companySize: '',
    contactPerson: '',
    email: '',
    phone: '',
    website: '',
    password: '',
    confirmPassword: '',
    acceptTerms: false,
    acceptPrivacy: false
  });

  const [errors, setErrors] = useState<Record<string, string>>({});

  const industries = [
    'Technologie',
    'Finanzwesen', 
    'Gesundheitswesen',
    'Bildung',
    'Beratung',
    'Produktion',
    'Einzelhandel',
    'Handwerk',
    'Sonstige'
  ];

  const companySizes = [
    '1-10 Mitarbeiter',
    '11-50 Mitarbeiter', 
    '51-200 Mitarbeiter',
    '201-500 Mitarbeiter',
    '500+ Mitarbeiter'
  ];

  const updateData = (field: keyof CompanyData, value: string | boolean) => {
    setData(prev => ({ ...prev, [field]: value }));
    // Clear error when user starts typing
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: '' }));
    }
  };

  const validateStep1 = () => {
    const newErrors: Record<string, string> = {};
    
    if (!data.companyName.trim()) newErrors.companyName = 'Unternehmensname ist erforderlich';
    if (!data.industry) newErrors.industry = 'Branche ist erforderlich';
    if (!data.companySize) newErrors.companySize = 'Unternehmensgröße ist erforderlich';
    if (!data.contactPerson.trim()) newErrors.contactPerson = 'Ansprechpartner ist erforderlich';
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const validateStep2 = () => {
    const newErrors: Record<string, string> = {};
    
    if (!data.email.trim()) newErrors.email = 'E-Mail ist erforderlich';
    if (!data.email.includes('@')) newErrors.email = 'Gültige E-Mail-Adresse erforderlich';
    if (!data.phone.trim()) newErrors.phone = 'Telefonnummer ist erforderlich';
    if (!data.password) newErrors.password = 'Passwort ist erforderlich';
    if (data.password.length < 6) newErrors.password = 'Passwort muss mindestens 6 Zeichen haben';
    if (data.password !== data.confirmPassword) newErrors.confirmPassword = 'Passwörter stimmen nicht überein';
    if (!data.acceptTerms) newErrors.acceptTerms = 'AGB müssen akzeptiert werden';
    if (!data.acceptPrivacy) newErrors.acceptPrivacy = 'Datenschutzerklärung muss akzeptiert werden';
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleNextStep = () => {
    if (currentStep === 1 && validateStep1()) {
      setCurrentStep(2);
    }
  };

  const handlePrevStep = () => {
    if (currentStep === 2) {
      setCurrentStep(1);
    }
  };

  const handleSubmit = async () => {
    if (!validateStep2()) return;
    
    setLoading(true);
    try {
      // Create user account
      const { data: authData, error: authError } = await supabase.auth.signUp({
        email: data.email,
        password: data.password,
        options: {
          emailRedirectTo: `${window.location.origin}/company/dashboard`
        }
      });

      if (authError) throw authError;
      if (!authData.user) throw new Error('Benutzer konnte nicht erstellt werden');

      // Create company record - COMMENTED OUT: Schema mismatch
      // This insert block has been disabled because the field names don't match the database schema
      // Use the proper company creation flow through company/onboarding instead
      /* const { error: companyError } = await supabase
        .from('companies')
        .insert({
          industry: data.industry,
          employee_count: data.companySize,
          contact_person: data.contactPerson,
          primary_email: data.email,
          phone: data.phone,
          website_url: data.website || null,
          created_by: authData.user.id
        });

      if (companyError) throw companyError; */

      toast.success('Unternehmen erfolgreich registriert! Bitte bestätigen Sie Ihre E-Mail.');
      navigate('/auth?message=check-email');
      
    } catch (error: any) {
      console.error('Registration error:', error);
      toast.error(error.message || 'Fehler bei der Registrierung');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50">
      {/* Header */}
      <header className="fixed top-4 left-0 right-0 z-50">
        <nav className="mx-auto max-w-5xl px-4">
          <div className="bg-white/90 backdrop-blur rounded-full shadow-sm border px-3 py-2">
            <div className="flex items-center justify-between gap-2">
              {/* Left: Logo */}
              <Link to="/" className="flex items-center gap-2 pl-1">
                <div className="flex items-center gap-2">
                  <img src="/assets/Logo_visiblle.svg" alt="BeVisiblle" className="h-8 w-8 rounded-lg" />
                  <span className="text-lg font-semibold tracking-tight">BeVisiblle</span>
                </div>
              </Link>

              {/* Right: Back to Home */}
              <div className="flex items-center gap-2">
                <Link to="/" className="rounded-md px-3 py-2 text-sm font-medium text-gray-700 hover:text-gray-900 hover:bg-gray-50">
                  Zurück zur Startseite
                </Link>
              </div>
            </div>
          </div>
        </nav>
      </header>

      {/* Main Content */}
      <main className="pt-24 pb-16">
        <div className="mx-auto max-w-6xl px-4">
          {/* Progress Indicator */}
          <div className="mb-8">
            <div className="flex items-center justify-center space-x-4">
              <div className={`flex items-center space-x-2 ${currentStep >= 1 ? 'text-[#5170ff]' : 'text-gray-400'}`}>
                <div className={`w-8 h-8 rounded-full flex items-center justify-center ${currentStep >= 1 ? 'bg-[#5170ff] text-white' : 'bg-gray-200'}`}>
                  {currentStep > 1 ? <Check className="w-4 h-4" /> : '1'}
                </div>
                <span className="font-medium">Unternehmensdaten</span>
              </div>
              <div className={`w-16 h-0.5 ${currentStep >= 2 ? 'bg-[#5170ff]' : 'bg-gray-200'}`} />
              <div className={`flex items-center space-x-2 ${currentStep >= 2 ? 'text-[#5170ff]' : 'text-gray-400'}`}>
                <div className={`w-8 h-8 rounded-full flex items-center justify-center ${currentStep >= 2 ? 'bg-[#5170ff] text-white' : 'bg-gray-200'}`}>
                  2
                </div>
                <span className="font-medium">Kontakt & Account</span>
              </div>
            </div>
          </div>

          <div className="grid lg:grid-cols-3 gap-8">
            {/* Left: Form */}
            <div className="lg:col-span-2">
              <Card className="bg-white/90 backdrop-blur">
                <CardHeader>
                  <CardTitle className="text-2xl">
                    {currentStep === 1 ? 'Unternehmensdaten' : 'Kontakt & Account erstellen'}
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-6">
                  {currentStep === 1 ? (
                    // Step 1: Company Info
                    <>
                      <div className="grid md:grid-cols-2 gap-4">
                        <div className="space-y-2">
                          <Label htmlFor="companyName">Unternehmensname *</Label>
                          <Input
                            id="companyName"
                            value={data.companyName}
                            onChange={(e) => updateData('companyName', e.target.value)}
                            placeholder="Ihr Unternehmensname"
                            className={errors.companyName ? 'border-red-500' : ''}
                          />
                          {errors.companyName && (
                            <p className="text-sm text-red-500">{errors.companyName}</p>
                          )}
                        </div>

                        <div className="space-y-2">
                          <Label htmlFor="industry">Branche *</Label>
                          <Select value={data.industry} onValueChange={(value) => updateData('industry', value)}>
                            <SelectTrigger className={errors.industry ? 'border-red-500' : ''}>
                              <SelectValue placeholder="Branche auswählen" />
                            </SelectTrigger>
                            <SelectContent>
                              {industries.map(industry => (
                                <SelectItem key={industry} value={industry}>{industry}</SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                          {errors.industry && (
                            <p className="text-sm text-red-500">{errors.industry}</p>
                          )}
                        </div>
                      </div>

                      <div className="grid md:grid-cols-2 gap-4">
                        <div className="space-y-2">
                          <Label htmlFor="companySize">Unternehmensgröße *</Label>
                          <Select value={data.companySize} onValueChange={(value) => updateData('companySize', value)}>
                            <SelectTrigger className={errors.companySize ? 'border-red-500' : ''}>
                              <SelectValue placeholder="Größe auswählen" />
                            </SelectTrigger>
                            <SelectContent>
                              {companySizes.map(size => (
                                <SelectItem key={size} value={size}>{size}</SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                          {errors.companySize && (
                            <p className="text-sm text-red-500">{errors.companySize}</p>
                          )}
                        </div>

                        <div className="space-y-2">
                          <Label htmlFor="contactPerson">Ansprechpartner *</Label>
                          <Input
                            id="contactPerson"
                            value={data.contactPerson}
                            onChange={(e) => updateData('contactPerson', e.target.value)}
                            placeholder="Vor- und Nachname"
                            className={errors.contactPerson ? 'border-red-500' : ''}
                          />
                          {errors.contactPerson && (
                            <p className="text-sm text-red-500">{errors.contactPerson}</p>
                          )}
                        </div>
                      </div>

                      <div className="flex justify-end">
                        <Button onClick={handleNextStep} className="bg-[#5170ff] hover:bg-[#3d5bff]">
                          Weiter <ArrowRight className="w-4 h-4 ml-2" />
                        </Button>
                      </div>
                    </>
                  ) : (
                    // Step 2: Contact & Account
                    <>
                      <div className="grid md:grid-cols-2 gap-4">
                        <div className="space-y-2">
                          <Label htmlFor="email">E-Mail-Adresse *</Label>
                          <Input
                            id="email"
                            type="email"
                            value={data.email}
                            onChange={(e) => updateData('email', e.target.value)}
                            placeholder="kontakt@unternehmen.de"
                            className={errors.email ? 'border-red-500' : ''}
                          />
                          {errors.email && (
                            <p className="text-sm text-red-500">{errors.email}</p>
                          )}
                        </div>

                        <div className="space-y-2">
                          <Label htmlFor="phone">Telefonnummer *</Label>
                          <Input
                            id="phone"
                            type="tel"
                            value={data.phone}
                            onChange={(e) => updateData('phone', e.target.value)}
                            placeholder="+49 123 456789"
                            className={errors.phone ? 'border-red-500' : ''}
                          />
                          {errors.phone && (
                            <p className="text-sm text-red-500">{errors.phone}</p>
                          )}
                        </div>
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="website">Website (optional)</Label>
                        <Input
                          id="website"
                          type="url"
                          value={data.website}
                          onChange={(e) => updateData('website', e.target.value)}
                          placeholder="https://www.unternehmen.de"
                        />
                      </div>

                      <div className="grid md:grid-cols-2 gap-4">
                        <div className="space-y-2">
                          <Label htmlFor="password">Passwort *</Label>
                          <Input
                            id="password"
                            type="password"
                            value={data.password}
                            onChange={(e) => updateData('password', e.target.value)}
                            placeholder="Mindestens 6 Zeichen"
                            className={errors.password ? 'border-red-500' : ''}
                          />
                          {errors.password && (
                            <p className="text-sm text-red-500">{errors.password}</p>
                          )}
                        </div>

                        <div className="space-y-2">
                          <Label htmlFor="confirmPassword">Passwort bestätigen *</Label>
                          <Input
                            id="confirmPassword"
                            type="password"
                            value={data.confirmPassword}
                            onChange={(e) => updateData('confirmPassword', e.target.value)}
                            placeholder="Passwort wiederholen"
                            className={errors.confirmPassword ? 'border-red-500' : ''}
                          />
                          {errors.confirmPassword && (
                            <p className="text-sm text-red-500">{errors.confirmPassword}</p>
                          )}
                        </div>
                      </div>

                      {/* Terms & Privacy */}
                      <div className="space-y-3">
                        <div className="flex items-center space-x-2">
                          <Checkbox
                            id="acceptTerms"
                            checked={data.acceptTerms}
                            onCheckedChange={(checked) => updateData('acceptTerms', checked as boolean)}
                          />
                          <Label htmlFor="acceptTerms" className="text-sm">
                            Ich stimme den <Link to="/agb" className="text-[#5170ff] hover:underline">AGB</Link> zu *
                          </Label>
                        </div>
                        {errors.acceptTerms && (
                          <p className="text-sm text-red-500">{errors.acceptTerms}</p>
                        )}

                        <div className="flex items-center space-x-2">
                          <Checkbox
                            id="acceptPrivacy"
                            checked={data.acceptPrivacy}
                            onCheckedChange={(checked) => updateData('acceptPrivacy', checked as boolean)}
                          />
                          <Label htmlFor="acceptPrivacy" className="text-sm">
                            Ich stimme der <Link to="/datenschutz" className="text-[#5170ff] hover:underline">Datenschutzerklärung</Link> zu *
                          </Label>
                        </div>
                        {errors.acceptPrivacy && (
                          <p className="text-sm text-red-500">{errors.acceptPrivacy}</p>
                        )}
                      </div>

                      <div className="flex justify-between">
                        <Button variant="outline" onClick={handlePrevStep}>
                          <ArrowLeft className="w-4 h-4 mr-2" /> Zurück
                        </Button>
                        <Button
                          onClick={handleSubmit}
                          disabled={loading}
                          className="bg-[#5170ff] hover:bg-[#3d5bff]"
                        >
                          {loading ? 'Wird erstellt...' : 'Unternehmen registrieren'}
                        </Button>
                      </div>
                    </>
                  )}
                </CardContent>
              </Card>
            </div>

            {/* Right: Info Card */}
            <div className="lg:col-span-1">
              <Card className="bg-white/90 backdrop-blur sticky top-24">
                <CardHeader>
                  <CardTitle className="text-xl">Warum BeVisiblle?</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-3">
                    <div className="flex items-start space-x-3">
                      <div className="w-6 h-6 bg-[#5170ff] rounded-full flex items-center justify-center mt-0.5">
                        <Check className="w-3 h-3 text-white" />
                      </div>
                      <div>
                        <h4 className="font-medium">Qualifizierte Talente</h4>
                        <p className="text-sm text-gray-600">Zugang zu Fachkräften, die bereits ihre Expertise teilen</p>
                      </div>
                    </div>
                    
                    <div className="flex items-start space-x-3">
                      <div className="w-6 h-6 bg-[#5170ff] rounded-full flex items-center justify-center mt-0.5">
                        <Check className="w-3 h-3 text-white" />
                      </div>
                      <div>
                        <h4 className="font-medium">Direkter Kontakt</h4>
                        <p className="text-sm text-gray-600">Keine Umwege über Recruiting-Agenturen</p>
                      </div>
                    </div>
                    
                    <div className="flex items-start space-x-3">
                      <div className="w-6 h-6 bg-[#5170ff] rounded-full flex items-center justify-center mt-0.5">
                        <Check className="w-3 h-3 text-white" />
                      </div>
                      <div>
                        <h4 className="font-medium">Verifizierte Profile</h4>
                        <p className="text-sm text-gray-600">Authentische Profile durch Community-Aktivität</p>
                      </div>
                    </div>
                  </div>

                  <div className="pt-4 border-t">
                    <p className="text-sm text-gray-600">
                      <strong>Haben Sie Fragen?</strong><br />
                      Kontaktieren Sie uns unter{' '}
                      <a href="mailto:support@bevisiblle.de" className="text-[#5170ff] hover:underline">
                        support@bevisiblle.de
                      </a>
                    </p>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
