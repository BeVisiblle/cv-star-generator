import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { Progress } from "@/components/ui/progress";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { ChevronLeft, ChevronRight, Building2 } from "lucide-react";

interface OnboardingData {
  // Step 1
  companyName: string;
  email: string;
  password: string;
  confirmPassword: string;
  
  // Step 2
  companySize: string;
  foundedYear: string;
  website: string;
  industry: string;
  headquarters: string;
  additionalLocations: string[];
  
  // Step 3
  targetGroups: string[];
}

export default function CompanyOnboarding() {
  const [currentStep, setCurrentStep] = useState(1);
  const [data, setData] = useState<OnboardingData>({
    companyName: "",
    email: "",
    password: "",
    confirmPassword: "",
    companySize: "",
    foundedYear: "",
    website: "",
    industry: "",
    headquarters: "",
    additionalLocations: [],
    targetGroups: [],
  });
  const [loading, setLoading] = useState(false);
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

  const targetGroupOptions = [
    { id: "azubis", label: "Azubis", price: 49 },
    { id: "schueler", label: "Schüler:innen", price: 39 },
    { id: "gesellen", label: "Gesellen", price: 59 },
  ];

  const updateData = (field: string, value: any) => {
    setData(prev => ({ ...prev, [field]: value }));
  };

  const validateStep1 = () => {
    if (!data.companyName || !data.email || !data.password) {
      toast({ title: "Bitte füllen Sie alle Pflichtfelder aus", variant: "destructive" });
      return false;
    }
    if (data.password !== data.confirmPassword) {
      toast({ title: "Passwörter stimmen nicht überein", variant: "destructive" });
      return false;
    }
    return true;
  };

  const validateStep2 = () => {
    if (!data.companySize || !data.industry || !data.headquarters) {
      toast({ title: "Bitte füllen Sie alle Pflichtfelder aus", variant: "destructive" });
      return false;
    }
    return true;
  };

  const nextStep = () => {
    if (currentStep === 1 && !validateStep1()) return;
    if (currentStep === 2 && !validateStep2()) return;
    setCurrentStep(prev => Math.min(prev + 1, 3));
  };

  const prevStep = () => {
    setCurrentStep(prev => Math.max(prev - 1, 1));
  };

  const handleSubmit = async () => {
    if (data.targetGroups.length === 0) {
      toast({ title: "Bitte wählen Sie mindestens eine Zielgruppe", variant: "destructive" });
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
            founded_year: data.foundedYear ? parseInt(data.foundedYear) : null,
            website_url: data.website,
            industry: data.industry,
            main_location: data.headquarters,
            additional_locations: data.additionalLocations,
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

  const calculatePrice = () => {
    return data.targetGroups.reduce((total, groupId) => {
      const group = targetGroupOptions.find(g => g.id === groupId);
      return total + (group?.price || 0);
    }, 0);
  };

  return (
    <div className="min-h-screen bg-hero-gradient flex items-center justify-center p-4">
      <Card className="w-full max-w-2xl">
        <CardHeader className="text-center">
          <div className="flex items-center justify-center mb-4">
            <Building2 className="h-12 w-12 text-accent" />
          </div>
          <CardTitle className="text-3xl">Unternehmens-Registrierung</CardTitle>
          <Progress value={(currentStep / 3) * 100} className="mt-4" />
          <p className="text-muted-foreground">Schritt {currentStep} von 3</p>
        </CardHeader>

        <CardContent className="space-y-6">
          {currentStep === 1 && (
            <div className="space-y-4">
              <h3 className="text-xl font-semibold">Grundinformationen</h3>
              
              <div className="space-y-2">
                <Label htmlFor="companyName">Unternehmensname *</Label>
                <Input
                  id="companyName"
                  value={data.companyName}
                  onChange={(e) => updateData('companyName', e.target.value)}
                  placeholder="Ihr Unternehmensname"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="email">E-Mail-Adresse *</Label>
                <Input
                  id="email"
                  type="email"
                  value={data.email}
                  onChange={(e) => updateData('email', e.target.value)}
                  placeholder="unternehmen@beispiel.de"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="password">Passwort *</Label>
                <Input
                  id="password"
                  type="password"
                  value={data.password}
                  onChange={(e) => updateData('password', e.target.value)}
                  placeholder="Mindestens 6 Zeichen"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="confirmPassword">Passwort bestätigen *</Label>
                <Input
                  id="confirmPassword"
                  type="password"
                  value={data.confirmPassword}
                  onChange={(e) => updateData('confirmPassword', e.target.value)}
                  placeholder="Passwort wiederholen"
                />
              </div>
            </div>
          )}

          {currentStep === 2 && (
            <div className="space-y-4">
              <h3 className="text-xl font-semibold">Unternehmensdetails</h3>
              
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="companySize">Unternehmensgröße *</Label>
                  <Select value={data.companySize} onValueChange={(value) => updateData('companySize', value)}>
                    <SelectTrigger>
                      <SelectValue placeholder="Wählen Sie die Größe" />
                    </SelectTrigger>
                    <SelectContent>
                      {companySizes.map(size => (
                        <SelectItem key={size} value={size}>{size} Mitarbeiter</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="foundedYear">Gründungsjahr</Label>
                  <Input
                    id="foundedYear"
                    type="number"
                    value={data.foundedYear}
                    onChange={(e) => updateData('foundedYear', e.target.value)}
                    placeholder="z.B. 2010"
                    min="1900"
                    max={new Date().getFullYear()}
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="industry">Branche *</Label>
                <Input
                  id="industry"
                  value={data.industry}
                  onChange={(e) => updateData('industry', e.target.value)}
                  placeholder="z.B. IT, Handwerk, Einzelhandel"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="website">Website</Label>
                <Input
                  id="website"
                  value={data.website}
                  onChange={(e) => updateData('website', e.target.value)}
                  placeholder="https://www.ihr-unternehmen.de"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="headquarters">Hauptsitz *</Label>
                <Input
                  id="headquarters"
                  value={data.headquarters}
                  onChange={(e) => updateData('headquarters', e.target.value)}
                  placeholder="Stadt, Land"
                />
              </div>
            </div>
          )}

          {currentStep === 3 && (
            <div className="space-y-4">
              <h3 className="text-xl font-semibold">Zielgruppe wählen</h3>
              <p className="text-muted-foreground">Für wen suchen Sie?</p>
              
              <div className="space-y-3">
                {targetGroupOptions.map(group => (
                  <div key={group.id} className="flex items-center space-x-3 p-4 border rounded-lg">
                    <Checkbox
                      id={group.id}
                      checked={data.targetGroups.includes(group.id)}
                      onCheckedChange={(checked) => {
                        if (checked) {
                          updateData('targetGroups', [...data.targetGroups, group.id]);
                        } else {
                          updateData('targetGroups', data.targetGroups.filter(g => g !== group.id));
                        }
                      }}
                    />
                    <div className="flex-1">
                      <Label htmlFor={group.id} className="font-medium">{group.label}</Label>
                    </div>
                    <div className="text-right">
                      <span className="font-bold">{group.price}€</span>
                      <span className="text-sm text-muted-foreground">/Monat</span>
                    </div>
                  </div>
                ))}
              </div>

              {data.targetGroups.length > 0 && (
                <div className="p-4 bg-accent/10 rounded-lg">
                  <div className="flex justify-between items-center">
                    <span className="font-medium">Gesamtpreis:</span>
                    <span className="text-2xl font-bold text-accent">{calculatePrice()}€/Monat</span>
                  </div>
                  <p className="text-sm text-muted-foreground mt-2">
                    30 Tage kostenlos testen, danach monatlich kündbar
                  </p>
                </div>
              )}
            </div>
          )}

          <div className="flex justify-between pt-4">
            {currentStep > 1 && (
              <Button variant="outline" onClick={prevStep}>
                <ChevronLeft className="h-4 w-4 mr-2" />
                Zurück
              </Button>
            )}
            
            <div className="ml-auto">
              {currentStep < 3 ? (
                <Button onClick={nextStep}>
                  Weiter
                  <ChevronRight className="h-4 w-4 ml-2" />
                </Button>
              ) : (
                <Button onClick={handleSubmit} disabled={loading}>
                  {loading ? "Wird erstellt..." : "Registrierung abschließen"}
                </Button>
              )}
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}