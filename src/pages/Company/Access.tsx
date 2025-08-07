import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { Building2, ArrowRight } from "lucide-react";

export default function CompanyAccess() {
  const [loading, setLoading] = useState(false);
  const [email, setEmail] = useState("tom@ausbildungsbasis.de");
  const [password, setPassword] = useState("test123");
  const { toast } = useToast();
  const navigate = useNavigate();

  const handleTestLogin = async () => {
    setLoading(true);
    try {
      // Sign in the existing user
      const { data: authData, error: authError } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (authError) {
        // If user doesn't exist, create them
        const { data: signUpData, error: signUpError } = await supabase.auth.signUp({
          email,
          password,
        });

        if (signUpError) throw signUpError;
        
        if (signUpData.user) {
          toast({ 
            title: "Test-Account erstellt!", 
            description: "Sie werden automatisch eingeloggt und weitergeleitet." 
          });
        }
      } else {
        toast({ 
          title: "Erfolgreich eingeloggt!", 
          description: "Weiterleitung zum Company Dashboard..." 
        });
      }

      // Short delay then redirect
      setTimeout(() => {
        navigate("/company/dashboard");
      }, 1500);

    } catch (error: any) {
      toast({ 
        title: "Fehler beim Login", 
        description: error.message,
        variant: "destructive" 
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-accent/5 to-primary/5 p-4">
      <div className="max-w-md mx-auto mt-20">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="w-16 h-16 bg-primary rounded-full flex items-center justify-center mx-auto mb-4">
            <Building2 className="h-8 w-8 text-white" />
          </div>
          <h1 className="text-3xl font-bold mb-2">Company Dashboard Zugang</h1>
          <p className="text-muted-foreground">
            Test-Zugang für "Müller Handwerk GmbH"
          </p>
        </div>

        {/* Test Login Card */}
        <Card className="p-6">
          <div className="space-y-6">
            <div className="space-y-4">
              <h2 className="text-xl font-semibold">Test-Unternehmen Login</h2>
              
              <div className="bg-blue-50 rounded-lg p-4 border border-blue-200">
                <h3 className="font-medium text-blue-900 mb-2">✓ Bereit konfiguriert:</h3>
                <ul className="text-sm text-blue-800 space-y-1">
                  <li>• Müller Handwerk GmbH</li>
                  <li>• 74 aktive Tokens</li>
                  <li>• 1 Match mit Peter Mor (Schüler, Handwerk)</li>
                  <li>• 1 freigeschaltetes Profil</li>
                  <li>• Premium-Account mit 5 Seats</li>
                </ul>
              </div>

              <div className="space-y-3">
                <div>
                  <Label htmlFor="email">E-Mail</Label>
                  <Input
                    id="email"
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="E-Mail-Adresse"
                  />
                </div>

                <div>
                  <Label htmlFor="password">Passwort</Label>
                  <Input
                    id="password"
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="Passwort"
                  />
                </div>
              </div>

              <Button 
                onClick={handleTestLogin} 
                disabled={loading}
                className="w-full h-12 text-lg font-semibold"
                size="lg"
              >
                {loading ? (
                  "Verbindung wird hergestellt..."
                ) : (
                  <>
                    Zum Company Dashboard
                    <ArrowRight className="ml-2 h-5 w-5" />
                  </>
                )}
              </Button>

              <div className="text-center">
                <Button 
                  variant="ghost" 
                  onClick={() => navigate("/company/onboarding")}
                  className="text-sm"
                >
                  ← Zurück zum Onboarding
                </Button>
              </div>
            </div>
          </div>
        </Card>

        {/* Info Card */}
        <Card className="mt-6 p-4 bg-green-50 border-green-200">
          <div className="text-center">
            <h3 className="font-medium text-green-900 mb-2">🎯 Was Sie sehen werden:</h3>
            <ul className="text-sm text-green-800 space-y-1">
              <li>• Echte Profile von Bewerbern</li>
              <li>• Funktionsfähige Suche & Filter</li>
              <li>• Token-System</li>
              <li>• Vollständige Unternehmensverwaltung</li>
            </ul>
          </div>
        </Card>
      </div>
    </div>
  );
}