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
        <div className="text-center mb-8">
          <div className="flex items-center justify-center mb-4">
            <Building2 className="h-12 w-12 text-primary" />
          </div>
          <h1 className="text-4xl font-bold mb-2">Unternehmens-Registrierung</h1>
          <p className="text-muted-foreground">Finden Sie die besten Talente für Ihr Unternehmen</p>
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
              </div>
            </Card>

            {/* Auth Section */}
            <Card className="p-6">
              <div className="space-y-4">
                <h2 className="text-2xl font-semibold">Account erstellen</h2>
                
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

                  <div className="grid md:grid-cols-2 gap-4">
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
                </div>

                <Button 
                  onClick={handleSubmit} 
                  disabled={loading}
                  className="w-full h-12 text-lg font-semibold"
                  size="lg"
                >
                  {loading ? "Registrierung läuft..." : "Jetzt registrieren"}
                </Button>
              </div>
            </Card>
          </div>

          {/* Right Column - Price Calculator */}
          <div className="lg:col-span-1">
            <PriceCalculator
              selectedGroups={data.targetGroups}
              companyName={data.companyName}
            />
          </div>
        </div>
      </div>
    </div>
  );
}