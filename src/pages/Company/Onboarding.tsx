import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { Building2 } from "lucide-react";
import { BranchSelector } from "@/components/Company/BranchSelector";
import { TargetGroupSelector } from "@/components/Company/TargetGroupSelector";
import { PriceCalculator } from "@/components/Company/PriceCalculator";

interface OnboardingData {
  // Company Info
  companyName: string;
  companySize: string;
  location: string;
  website: string;
  
  // Business Details
  industries: string[];
  targetGroups: string[];
  
  // Auth (at the end)
  email: string;
  password: string;
  confirmPassword: string;
}

export default function CompanyOnboarding() {
  const [currentStep, setCurrentStep] = useState(1);
  const [data, setData] = useState<OnboardingData>({
    companyName: "",
    companySize: "",
    location: "",
    website: "",
    industries: [],
    targetGroups: [],
    email: "",
    password: "",
    confirmPassword: "",
  });
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [agreedToTerms, setAgreedToTerms] = useState(false);
  const [agreedToPrivacy, setAgreedToPrivacy] = useState(false);
  const { toast } = useToast();
  const navigate = useNavigate();

  const companySizes = [
    "1-10",
    "11-25", 
    "26-50",
    "51-100",
    "101-250",
    "250+"
  ];

  const updateData = (field: string, value: any) => {
    setData(prev => ({ ...prev, [field]: value }));
    setErrors(prev => ({ ...prev, [field]: "" }));
  };

  const validateStep1 = () => {
    const newErrors: Record<string, string> = {};
    
    if (!data.companyName.trim()) newErrors.companyName = "Unternehmensname ist erforderlich";
    if (!data.companySize) newErrors.companySize = "Unternehmensgröße ist erforderlich";
    if (!data.location.trim()) newErrors.location = "Standort ist erforderlich";
    if (data.industries.length === 0) newErrors.industries = "Mindestens eine Branche auswählen";
    if (data.targetGroups.length === 0) newErrors.targetGroups = "Mindestens eine Zielgruppe auswählen";
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const validateStep2 = () => {
    const newErrors: Record<string, string> = {};
    
    if (!data.email.trim()) newErrors.email = "E-Mail ist erforderlich";
    if (!data.password) newErrors.password = "Passwort ist erforderlich";
    if (data.password !== data.confirmPassword) newErrors.confirmPassword = "Passwörter stimmen nicht überein";
    if (!agreedToTerms) newErrors.terms = "Nutzungsbedingungen müssen akzeptiert werden";
    if (!agreedToPrivacy) newErrors.privacy = "Datenschutzerklärung muss akzeptiert werden";
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleStep1Continue = () => {
    if (validateStep1()) {
      setCurrentStep(2);
    } else {
      toast({ title: "Bitte korrigieren Sie die Fehler", variant: "destructive" });
    }
  };

  const handleSubmit = async () => {
    if (!validateStep2()) {
      toast({ title: "Bitte korrigieren Sie die Fehler", variant: "destructive" });
      return;
    }

    setLoading(true);
    
    // TEMPORARY: Skip actual registration and go directly to company dashboard
    try {
      toast({ 
        title: "Demo-Modus aktiviert", 
        description: "Sie werden direkt zum Unternehmensprofil weitergeleitet (ohne E-Mail-Verifikation)",
        duration: 3000
      });

      // Store company data in localStorage for demo
      const companyData = {
        name: data.companyName,
        size_range: data.companySize,
        website_url: data.website || null,
        industry: data.industries.join(', '),
        main_location: data.location,
        targetGroups: data.targetGroups,
        email: data.email,
        demoMode: true // Flag to indicate this is demo mode
      };
      
      localStorage.setItem('demoCompanyData', JSON.stringify(companyData));
      localStorage.setItem('demoMode', 'true');
      
      // Simulate a small delay
      setTimeout(() => {
        toast({ title: "Erfolgreich! Weiterleitung zum Unternehmensprofil..." });
        navigate("/company/dashboard");
      }, 2000);

    } catch (error: any) {
      toast({ 
        title: "Fehler", 
        description: error.message,
        variant: "destructive" 
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-accent/5 to-primary/5 p-4">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="flex items-center justify-center mb-12">
          <div className="flex items-center space-x-4">
            <div className="w-12 h-12 bg-primary rounded-lg flex items-center justify-center">
              <Building2 className="h-6 w-6 text-white" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-foreground">Endlich passende Mitarbeiter finden</h1>
              <p className="text-muted-foreground">Lege jetzt los - kostenfrei. Keine Kreditkarte erforderlich.</p>
            </div>
          </div>
        </div>

        {/* Main Content */}
        {currentStep === 1 ? (
          <div className="grid lg:grid-cols-3 gap-8">
            {/* Left Column - Form */}
            <div className="lg:col-span-2 space-y-6">
              <Card className="p-6">
                <div className="space-y-6">
                  {/* Company Basic Info */}
                  <div className="space-y-4">
                    <h2 className="text-2xl font-semibold">Unternehmensdaten</h2>
                    
                    <div className="grid md:grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="companyName">Unternehmensname *</Label>
                        <Input
                          id="companyName"
                          value={data.companyName}
                          onChange={(e) => updateData('companyName', e.target.value)}
                          placeholder="Ihr Unternehmensname"
                          className={errors.companyName ? "border-destructive" : ""}
                        />
                        {errors.companyName && (
                          <p className="text-sm text-destructive">{errors.companyName}</p>
                        )}
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="companySize">Unternehmensgröße *</Label>
                        <Select value={data.companySize} onValueChange={(value) => updateData('companySize', value)}>
                          <SelectTrigger className={errors.companySize ? "border-destructive" : ""}>
                            <SelectValue placeholder="Wählen Sie die Größe" />
                          </SelectTrigger>
                          <SelectContent>
                            {companySizes.map(size => (
                              <SelectItem key={size} value={size}>{size} Mitarbeiter</SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                        {errors.companySize && (
                          <p className="text-sm text-destructive">{errors.companySize}</p>
                        )}
                      </div>
                    </div>

                    <div className="grid md:grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="location">Standort *</Label>
                        <Input
                          id="location"
                          value={data.location}
                          onChange={(e) => updateData('location', e.target.value)}
                          placeholder="Stadt, Deutschland"
                          className={errors.location ? "border-destructive" : ""}
                        />
                        {errors.location && (
                          <p className="text-sm text-destructive">{errors.location}</p>
                        )}
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="website">Website (optional)</Label>
                        <Input
                          id="website"
                          value={data.website}
                          onChange={(e) => updateData('website', e.target.value)}
                          placeholder="https://www.ihr-unternehmen.de"
                        />
                      </div>
                    </div>
                  </div>

                  {/* Branch Selection */}
                  <BranchSelector
                    selectedBranches={data.industries}
                    onSelectionChange={(branches) => updateData('industries', branches)}
                    error={errors.industries}
                  />

                  {/* Target Groups */}
                  <TargetGroupSelector
                    selectedGroups={data.targetGroups}
                    onSelectionChange={(groups) => updateData('targetGroups', groups)}
                    error={errors.targetGroups}
                  />

                  <Button 
                    onClick={handleStep1Continue}
                    className="w-full h-12 text-lg font-semibold"
                    size="lg"
                  >
                    Account erstellen
                  </Button>
                </div>
              </Card>
            </div>

            {/* Right Column - Price Calculator */}
            <div className="lg:col-span-1">
              <PriceCalculator
                selectedGroups={data.targetGroups}
                selectedBranches={data.industries}
                companyName={data.companyName}
                companySize={data.companySize}
              />
            </div>
          </div>
        ) : (
          /* Step 2 - Authentication */
          <div className="max-w-md mx-auto">
            <Card className="p-8">
              <div className="text-center mb-8">
                <h2 className="text-2xl font-bold mb-2">Nächster Schritt</h2>
                <p className="text-muted-foreground">Account-Erstellung mit E-Mail oder Google</p>
              </div>

              <div className="space-y-4">
                <Button variant="outline" className="w-full h-12" disabled>
                  <svg className="w-5 h-5 mr-3" viewBox="0 0 24 24">
                    <path fill="currentColor" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                    <path fill="currentColor" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                    <path fill="currentColor" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
                    <path fill="currentColor" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
                  </svg>
                  Fortfahren mit Google
                </Button>

                <div className="relative">
                  <div className="absolute inset-0 flex items-center">
                    <span className="w-full border-t" />
                  </div>
                  <div className="relative flex justify-center text-xs uppercase">
                    <span className="bg-background px-2 text-muted-foreground">ODER</span>
                  </div>
                </div>

                <div className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="email">E-Mail-Adresse *</Label>
                    <Input
                      id="email"
                      type="email"
                      value={data.email}
                      onChange={(e) => updateData('email', e.target.value)}
                      placeholder="unternehmen@beispiel.de"
                      className={errors.email ? "border-destructive" : ""}
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
                      onChange={(e) => updateData('password', e.target.value)}
                      placeholder="Mindestens 6 Zeichen"
                      className={errors.password ? "border-destructive" : ""}
                    />
                    {errors.password && (
                      <p className="text-sm text-destructive">{errors.password}</p>
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
                      className={errors.confirmPassword ? "border-destructive" : ""}
                    />
                    {errors.confirmPassword && (
                      <p className="text-sm text-destructive">{errors.confirmPassword}</p>
                    )}
                  </div>
                </div>

                {/* GDPR & Terms Checkboxes */}
                <div className="space-y-3 pt-4">
                  <div className="flex items-start space-x-3">
                    <input
                      type="checkbox"
                      id="terms"
                      checked={agreedToTerms}
                      onChange={(e) => setAgreedToTerms(e.target.checked)}
                      className="mt-1"
                    />
                    <Label htmlFor="terms" className="text-sm leading-relaxed">
                      Ich akzeptiere die{" "}
                      <span className="text-primary cursor-pointer underline">
                        Nutzungsbedingungen
                      </span>
                    </Label>
                  </div>
                  {errors.terms && (
                    <p className="text-sm text-destructive ml-6">{errors.terms}</p>
                  )}

                  <div className="flex items-start space-x-3">
                    <input
                      type="checkbox"
                      id="privacy"
                      checked={agreedToPrivacy}
                      onChange={(e) => setAgreedToPrivacy(e.target.checked)}
                      className="mt-1"
                    />
                    <Label htmlFor="privacy" className="text-sm leading-relaxed">
                      Ich akzeptiere die{" "}
                      <span className="text-primary cursor-pointer underline">
                        Datenschutzerklärung
                      </span>
                    </Label>
                  </div>
                  {errors.privacy && (
                    <p className="text-sm text-destructive ml-6">{errors.privacy}</p>
                  )}
                </div>

                <Button 
                  onClick={handleSubmit} 
                  disabled={loading}
                  className="w-full h-12 text-lg font-semibold mt-6"
                  size="lg"
                >
                  {loading ? "Profil wird erstellt..." : "Jetzt starten (Demo-Modus)"}
                </Button>

                <div className="bg-yellow-100 border border-yellow-400 rounded-lg p-3 mt-4">
                  <p className="text-xs text-yellow-800">
                    <strong>Demo-Modus:</strong> Sie können direkt loslegen ohne E-Mail-Verifikation. 
                    Die echte Registrierung implementieren wir später.
                  </p>
                </div>

                <p className="text-xs text-muted-foreground text-center mt-4">
                  Mit dem Start erklärst du dich mit unseren Nutzungsbedingungen einverstanden.
                </p>

                <div className="text-center mt-6">
                  <Button
                    variant="ghost"
                    onClick={() => setCurrentStep(1)}
                    className="text-sm"
                  >
                    ← Zurück zu den Unternehmensdaten
                  </Button>
                </div>
              </div>
            </Card>
          </div>
        )}
      </div>
    </div>
  );
}