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

  const validateForm = () => {
    const newErrors: Record<string, string> = {};
    
    if (!data.companyName.trim()) newErrors.companyName = "Unternehmensname ist erforderlich";
    if (!data.companySize) newErrors.companySize = "Unternehmensgröße ist erforderlich";
    if (!data.location.trim()) newErrors.location = "Standort ist erforderlich";
    if (data.industries.length === 0) newErrors.industries = "Mindestens eine Branche auswählen";
    if (data.targetGroups.length === 0) newErrors.targetGroups = "Mindestens eine Zielgruppe auswählen";
    if (!data.email.trim()) newErrors.email = "E-Mail ist erforderlich";
    if (!data.password) newErrors.password = "Passwort ist erforderlich";
    if (data.password !== data.confirmPassword) newErrors.confirmPassword = "Passwörter stimmen nicht überein";
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async () => {
    if (!validateForm()) {
      toast({ title: "Bitte korrigieren Sie die Fehler", variant: "destructive" });
      return;
    }

    setLoading(true);
    try {
      // Sign up user
      const { data: authData, error: authError } = await supabase.auth.signUp({
        email: data.email,
        password: data.password,
        options: {
          emailRedirectTo: `${window.location.origin}/company/dashboard`
        }
      });

      if (authError) throw authError;

      if (authData.user) {
        // Create company
        const { data: companyData, error: companyError } = await supabase
          .from('companies')
          .insert({
            name: data.companyName,
            size_range: data.companySize,
            website_url: data.website || null,
            industry: data.industries.join(', '),
            main_location: data.location,
          })
          .select()
          .single();

        if (companyError) throw companyError;

        // Add user as admin
        const { error: userError } = await supabase
          .from('company_users')
          .insert({
            user_id: authData.user.id,
            company_id: companyData.id,
            role: 'admin',
            accepted_at: new Date().toISOString(),
          });

        if (userError) throw userError;

        // Create company settings with target groups
        const { error: settingsError } = await supabase
          .from('company_settings')
          .insert({
            company_id: companyData.id,
            target_status: data.targetGroups,
            target_industries: data.industries,
          });

        if (settingsError) throw settingsError;

        toast({ title: "Unternehmen erfolgreich registriert!" });
        navigate("/company/dashboard");
      }
    } catch (error: any) {
      toast({ 
        title: "Fehler bei der Registrierung", 
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

                {/* Auth Section - Coming Soon */}
                <div className="bg-accent/10 rounded-lg p-6 text-center">
                  <h3 className="text-lg font-semibold mb-2">Nächster Schritt</h3>
                  <p className="text-muted-foreground mb-4">Account-Erstellung mit E-Mail oder Google</p>
                  <div className="space-y-3">
                    <Button variant="outline" className="w-full" disabled>
                      <svg className="w-4 h-4 mr-2" viewBox="0 0 24 24">
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
                        <span className="bg-background px-2 text-muted-foreground">oder</span>
                      </div>
                    </div>
                    <Button className="w-full" disabled>
                      Jetzt registrieren
                    </Button>
                  </div>
                  <p className="text-xs text-muted-foreground mt-3">
                    Mit der Anmeldung erklärst du dich mit unseren{" "}
                    <span className="text-primary cursor-pointer">Nutzungsbedingungen</span> einverstanden.
                  </p>
                </div>
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
      </div>
    </div>
  );
}