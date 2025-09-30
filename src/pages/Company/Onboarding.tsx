import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { Building2, Sparkles, Users, Clock } from "lucide-react";
import { BranchSelector, branchLabelMap } from "@/components/Company/BranchSelector";
import { TargetGroupSelector } from "@/components/Company/TargetGroupSelector";

interface OnboardingData {
  // Company Info
  companyName: string;
  companySize: string;
  location: string; // Format: City, Country
  website: string;
  contactPerson: string;
  phone: string;
  
  // Business Details
  industries: string[];
  targetGroups: string[];
  customIndustry?: string;
  
  // Auth (at the end)
  email: string; // also used as primary contact email
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
    contactPerson: "",
    phone: "",
    industries: [],
    targetGroups: [],
    customIndustry: "",
    email: "",
    password: "",
    confirmPassword: "",
  });
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [agreedToTerms, setAgreedToTerms] = useState(false);
  const [agreedToPrivacy, setAgreedToPrivacy] = useState(false);
  const [isMobileMenuOpen, setMobileMenuOpen] = useState(false);
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

  const updateData = <K extends keyof OnboardingData>(field: K, value: OnboardingData[K]) => {
    setData(prev => ({ ...prev, [field]: value }));
    setErrors(prev => ({ ...prev, [field]: "" }));
  };

  const validateCompanyInfo = () => {
    const newErrors: Record<string, string> = {};
    
    if (!data.companyName.trim()) newErrors.companyName = "Unternehmensname ist erforderlich";
    if (!data.companySize) newErrors.companySize = "Unternehmensgröße ist erforderlich";
    if (!data.location.trim()) newErrors.location = "Standort ist erforderlich";
    if (data.location && !data.location.includes(',')) newErrors.location = "Bitte Stadt und Land angeben (z.B. Berlin, Deutschland)";
    if (!data.contactPerson.trim()) newErrors.contactPerson = "Ansprechpartner ist erforderlich";
    if (!data.phone.trim()) newErrors.phone = "Telefonnummer ist erforderlich";
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const validateSelections = () => {
    const newErrors: Record<string, string> = {};

    if (data.industries.length === 0) {
      newErrors.industries = "Mindestens eine Branche auswählen";
    }

    if (data.industries.includes("custom") && !data.customIndustry?.trim()) {
      newErrors.industries = "Bitte gib deine Branche an";
    }

    if (data.targetGroups.length === 0) newErrors.targetGroups = "Mindestens eine Zielgruppe auswählen";

    setErrors(prev => ({ ...prev, ...newErrors }));
    return Object.keys(newErrors).length === 0;
  };

  const validateAuthStep = () => {
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
    if (validateCompanyInfo()) {
      setCurrentStep(2);
    } else {
      toast({ title: "Bitte korrigieren Sie die Fehler", variant: "destructive" });
    }
  };

  const handleStep2Continue = () => {
    if (validateSelections()) {
      setCurrentStep(3);
    } else {
      toast({ title: "Bitte Branchen und Zielgruppen auswählen", variant: "destructive" });
    }
  };

  const handleSubmit = async () => {
    if (!validateAuthStep()) {
      toast({ title: "Bitte korrigieren Sie die Fehler", variant: "destructive" });
      return;
    }

    // Parse city and country from location
    const [cityRaw, countryRaw] = data.location.split(',').map((s) => s?.trim());
    const city = cityRaw || '';
    const country = countryRaw || '';

    if (!city || !country) {
      setErrors((prev) => ({ ...prev, location: "Bitte Stadt und Land angeben (z.B. Berlin, Deutschland)" }));
      toast({ title: "Standort unvollständig", description: "Bitte Stadt und Land angeben.", variant: "destructive" });
      return;
    }

    setLoading(true);

    try {
      // Duplicate company check by primary email
      const { data: existingCompany } = await supabase
        .from('companies')
        .select('id')
        .ilike('primary_email', data.email)
        .maybeSingle();

      if (existingCompany) {
        toast({
          title: 'Unternehmen existiert bereits',
          description: 'Bitte melden Sie sich an oder verwenden Sie eine andere E-Mail.',
          variant: 'destructive'
        });
        return;
      }

      // Create user account first
      const { data: authData, error: authError } = await supabase.auth.signUp({
        email: data.email,
        password: data.password,
        options: { emailRedirectTo: `${window.location.origin}/company/dashboard` }
      });
      if (authError) throw new Error(`Registrierung fehlgeschlagen: ${authError.message}`);
      if (!authData.user) throw new Error('Benutzer konnte nicht erstellt werden');

      // Calculate industriesLabel outside of retry function
      const industriesLabel = data.industries
        .map((key) => {
          if (key === "custom") {
            return data.customIndustry?.trim();
          }
          return branchLabelMap[key] ?? key;
        })
        .filter(Boolean)
        .join(', ');

      // Retry helper with exponential backoff
      const attemptCreate = async (attempt = 1): Promise<string> => {
        try {
          const { data: companyId, error } = await supabase.rpc('create_company_account', {
            p_name: data.companyName,
            p_primary_email: data.email,
            p_industry: industriesLabel,
            p_city: city,
            p_country: country,
            p_size_range: data.companySize,
            p_contact_person: data.contactPerson,
            p_phone: data.phone,
            p_website: data.website || null,
            p_created_by: authData.user!.id
          });
          if (error) throw error;
          if (!companyId) throw new Error('Keine Firmen-ID zurückgegeben');
          return companyId as unknown as string;
        } catch (err: any) {
          if (attempt >= 3) throw err;
          const delay = Math.pow(2, attempt) * 500; // 500ms, 1000ms, 2000ms
          await new Promise((r) => setTimeout(r, delay));
          return attemptCreate(attempt + 1);
        }
      };

      // Create company via RPC
      const companyId = await attemptCreate(1);

      // Verify round-trip
      const { data: stored, error: fetchError } = await supabase
        .from('companies')
        .select('*')
        .eq('id', companyId)
        .single();
      if (fetchError) throw fetchError;

      const expected = {
        name: data.companyName,
        primary_email: data.email,
        industry: industriesLabel,
        main_location: city,
        country: country,
        size_range: data.companySize,
        contact_person: data.contactPerson,
        phone: data.phone,
        website_url: data.website || null
      };

      const needsCorrection = Object.entries(expected).some(([k, v]) => (stored as any)[k] !== v);
      if (needsCorrection) {
        const { error: fixError } = await supabase
          .from('companies')
          .update(expected)
          .eq('id', companyId);
        if (fixError) throw fixError;
      }

      toast({
        title: 'Unternehmen erfolgreich erstellt!',
        description: 'Weiterleitung zum Dashboard...'
      });

      navigate('/company/dashboard');
    } catch (error: any) {
      console.error('Onboarding error:', error);
      // Offline/Network handling: persist payload for retry
      const pending = {
        ts: Date.now(),
        payload: { ...data }
      };
      try { localStorage.setItem('company_onboarding_pending', JSON.stringify(pending)); } catch {}

      toast({ 
        title: 'Fehler beim Erstellen', 
        description: 'Bitte prüfen Sie Ihre Verbindung und versuchen Sie es erneut.',
        variant: 'destructive' 
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50">
      <header className="fixed top-0 left-0 right-0 z-40">
        <nav className="mx-auto max-w-6xl px-6 pt-6">
          <div className="bg-white/90 backdrop-blur rounded-[24px] shadow-lg border px-5 py-3">
            <div className="flex items-center justify-between gap-3">
              <Link to="/" className="flex items-center gap-3">
                <img src="/assets/Logo_visiblle.svg" alt="BeVisiblle" className="h-10 w-10 rounded-xl" />
                <span className="text-xl font-semibold tracking-tight text-slate-800">BeVisiblle</span>
              </Link>

              <div className="hidden items-center gap-2 text-sm font-medium text-slate-600 md:flex">
                <Link to="/cv-generator" className="rounded-lg px-3.5 py-2 transition hover:bg-slate-100 hover:text-slate-900">Lebenslauf</Link>
                <Link to="/company" className="rounded-lg px-3.5 py-2 transition hover:bg-slate-100 hover:text-slate-900">Unternehmen</Link>
                <a href="#community" className="rounded-lg px-3.5 py-2 transition hover:bg-slate-100 hover:text-slate-900">Community</a>
                <Link to="/about" className="rounded-lg px-3.5 py-2 transition hover:bg-slate-100 hover:text-slate-900">Über uns</Link>
              </div>

              <div className="flex items-center gap-2">
                <Link to="/auth" className="hidden rounded-lg px-3.5 py-2 text-sm font-medium text-slate-600 transition hover:bg-slate-100 hover:text-slate-900 lg:inline-flex">
                  Login
                </Link>
                <Link
                  to="/company/onboarding"
                  className="hidden md:inline-flex rounded-full bg-[#5170ff] px-5 py-2 text-sm font-semibold text-white shadow-sm shadow-blue-300 transition hover:bg-[#3f5bff]"
                >
                  Kostenlos starten
                </Link>
                <button
                  onClick={() => setMobileMenuOpen((prev) => !prev)}
                  className="md:hidden p-2 rounded-lg text-slate-700 hover:text-slate-900 hover:bg-slate-100"
                >
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6h16M4 12h16M4 18h16" />
                  </svg>
                </button>
              </div>
            </div>
          </div>

          {isMobileMenuOpen && (
            <div className="mt-3 rounded-2xl border bg-white/95 px-5 py-4 shadow-lg md:hidden">
              <Link to="/cv-generator" className="block py-2 text-slate-700 hover:text-slate-900">
                Lebenslauf
              </Link>
              <Link to="/company" className="block py-2 text-slate-700 hover:text-slate-900">
                Unternehmen
              </Link>
              <a href="#community" className="block py-2 text-slate-700 hover:text-slate-900">
                Community
              </a>
              <Link to="/about" className="block py-2 text-slate-700 hover:text-slate-900">
                Über uns
              </Link>
              <Link to="/company/onboarding" className="block py-2 text-slate-700 hover:text-slate-900">
                Kostenlos starten
              </Link>
              <Link to="/auth" className="block py-2 text-slate-700 hover:text-slate-900">
                Login
              </Link>
            </div>
          )}
        </nav>
      </header>

      <div className="relative mx-auto flex min-h-screen w-full max-w-6xl flex-col px-4 pb-12 pt-36 lg:flex-row lg:gap-12">
        {currentStep === 1 && (
          <aside className="relative mb-10 hidden w-full rounded-3xl border border-white/60 bg-white/80 p-8 shadow-xl shadow-blue-200/60 backdrop-blur lg:order-1 lg:block lg:max-w-sm">
            <img
              src="/assets/hero-main.png"
              alt="BeVisiblle Unternehmensnetzwerk"
              className="h-full w-full rounded-2xl object-cover"
            />
          </aside>
        )}
 
        <div className={`w-full ${currentStep === 1 ? "lg:order-2" : ""}`}>
          <div className={`mx-auto ${currentStep === 1 ? "max-w-3xl" : "max-w-6xl"}`}>
            {currentStep === 1 && (
              <div className="mb-8 space-y-6">
                <div className="space-y-2">
                  <h1 className="text-3xl font-semibold text-slate-900">
                    BeVisiblle für Unternehmen
                  </h1>
                  <p className="text-sm text-slate-600">
                    Erstelle dein Unternehmensprofil, teile Einblicke mit deiner Community und vernetze dich mit Talenten aus Ausbildung und Fachkräftenetzwerk.
                  </p>
                </div>

                <div className="rounded-3xl border border-white/60 bg-white/90 p-5 shadow-md shadow-blue-200/40">
                  <h2 className="text-lg font-semibold text-slate-900">Kostenlose Registrierung</h2>
                  <p className="text-sm text-slate-600">
                    Keine Kreditkarte benötigt. Du kannst sofort loslegen und dein Team sichtbar machen.
                  </p>
                </div>
              </div>
            )}

            {currentStep === 1 && (
              <Card className="border-none bg-white/95 p-6 shadow-xl shadow-blue-200/50 backdrop-blur">
                <div className="space-y-6 md:space-y-8">
                  {/* Company Basic Info */}
                  <div className="space-y-4 md:space-y-5">
                    <div className="flex items-center gap-3 text-primary">
                      <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary text-white shadow-md shadow-primary/30">
                        <Building2 className="h-5 w-5" />
                      </div>
                      <div>
                        <h2 className="text-lg font-semibold text-foreground md:text-xl">Unternehmensdaten</h2>
                        <p className="text-xs text-muted-foreground md:text-sm">Erzähl uns ein wenig über dein Unternehmen, damit wir dich bestmöglich präsentieren können.</p>
                      </div>
                    </div>
                    
                    <div className="grid gap-3 md:grid-cols-2 md:gap-4">
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

                    <div className="grid gap-3 md:grid-cols-2 md:gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="location">Standort *</Label>
                        <Input
                          id="location"
                          value={data.location}
                          onChange={(e) => updateData('location', e.target.value)}
                          placeholder="Stadt, Land (z.B. Berlin, Deutschland)"
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

                    <div className="grid gap-3 md:grid-cols-2 md:gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="contactPerson">Ansprechpartner *</Label>
                        <Input
                          id="contactPerson"
                          value={data.contactPerson}
                          onChange={(e) => updateData('contactPerson', e.target.value)}
                          placeholder="Vollständiger Name"
                          className={errors.contactPerson ? "border-destructive" : ""}
                        />
                        {errors.contactPerson && (
                          <p className="text-sm text-destructive">{errors.contactPerson}</p>
                        )}
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="phone">Telefon *</Label>
                        <Input
                          id="phone"
                          value={data.phone}
                          onChange={(e) => updateData('phone', e.target.value)}
                          placeholder="+49 30 1234567"
                          className={errors.phone ? "border-destructive" : ""}
                        />
                        {errors.phone && (
                          <p className="text-sm text-destructive">{errors.phone}</p>
                        )}
                      </div>
                    </div>
                  </div>

                  <Button
                    onClick={handleStep1Continue}
                    className="w-full h-12 text-lg font-semibold"
                    size="lg"
                  >
                    Weiter zu Branchen & Zielgruppen
                  </Button>
                </div>
              </Card>
            )}

            {currentStep === 2 && (
              <Card className="border-none bg-white/95 p-8 shadow-xl shadow-blue-200/40 backdrop-blur">
                <div className="space-y-8">
                  <div className="flex justify-between items-center">
                    <Button
                      variant="ghost"
                      onClick={() => setCurrentStep(1)}
                      className="sm:w-auto"
                    >
                      ← Zurück
                    </Button>
                    <span className="text-xs uppercase tracking-wide text-muted-foreground">Schritt 2 von 3</span>
                  </div>

                  <div className="grid gap-6 lg:grid-cols-2">
                    <BranchSelector
                      selectedBranches={data.industries}
                      onSelectionChange={(branches) => updateData('industries', branches)}
                      error={errors.industries}
                      customIndustry={data.customIndustry}
                      onCustomIndustryChange={(value) => updateData('customIndustry', value)}
                    />

                    <TargetGroupSelector
                      selectedGroups={data.targetGroups}
                      onSelectionChange={(groups) => updateData('targetGroups', groups)}
                      error={errors.targetGroups}
                    />
                  </div>

                  <div className="flex justify-end pt-2">
                    <Button
                      onClick={handleStep2Continue}
                      className="h-11 px-6"
                    >
                      Weiter zur Registrierung
                    </Button>
                  </div>
                </div>
              </Card>
            )}

            {currentStep === 3 && (
              <div className="grid gap-10 lg:grid-cols-[minmax(0,1fr)_320px]">
                <Card className="border-none bg-white/95 p-8 shadow-xl shadow-blue-200/50 backdrop-blur">
                  <div className="flex justify-between items-center mb-6">
                    <span className="text-xs uppercase tracking-wide text-muted-foreground">Schritt 3 von 3</span>
                    <Button
                      variant="ghost"
                      onClick={() => setCurrentStep(2)}
                      className="sm:w-auto"
                    >
                      ← Zurück
                    </Button>
                  </div>

                  <div className="text-center mb-8">
                    <h2 className="text-2xl font-bold mb-2">Letzter Schritt</h2>
                    <p className="text-muted-foreground">Registriere dein Konto, um loszulegen.</p>
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

                  <div className="space-y-3 pt-6">
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

                  <div className="flex justify-end pt-8">
                    <Button
                      onClick={handleSubmit}
                      disabled={loading}
                      className="px-6"
                    >
                      {loading ? "Unternehmen wird erstellt..." : "Unternehmen erstellen"}
                    </Button>
                  </div>

                  <div className="bg-blue-100 border border-blue-400 rounded-lg p-3 mt-4">
                    <p className="text-xs text-blue-800">
                      <strong>Hinweis:</strong> Nach der Registrierung erhältst du eine E-Mail zur Bestätigung. Du kannst jedoch direkt im Dashboard starten.
                    </p>
                  </div>

                  <p className="text-xs text-muted-foreground text-center mt-4">
                    Mit dem Start erklärst du dich mit unseren Nutzungsbedingungen einverstanden.
                  </p>
                </Card>

                <div className="hidden lg:flex lg:flex-col lg:items-center lg:justify-center">
                  <img
                    src="/assets/hero-main.png"
                    alt="BeVisiblle Team"
                    className="h-[360px] w-full max-w-sm rounded-[32px] object-cover shadow-xl shadow-blue-200/30"
                  />
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}