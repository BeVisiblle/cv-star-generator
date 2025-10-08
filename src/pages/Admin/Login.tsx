import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { supabase } from '@/integrations/supabase/client';
import { Loader2, Eye, EyeOff, Shield } from 'lucide-react';
import { toast } from '@/hooks/use-toast';
import { useAdminSession } from '@/hooks/useAdminSession';

export default function AdminLogin() {
  const navigate = useNavigate();
  const { admin, role, isLoading } = useAdminSession();
  const [email, setEmail] = useState('Admin@BeVisiblle.de');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isAuthenticating, setIsAuthenticating] = useState(false);
  const [isCreatingAdmin, setIsCreatingAdmin] = useState(false);

  // Redirect if already authenticated as admin
  useEffect(() => {
    if (admin && role && !isLoading) {
      navigate('/admin');
    }
  }, [admin, role, isLoading, navigate]);

  const handleCreateAdmin = async () => {
    if (!email || !password) {
      toast({
        title: "Fehler",
        description: "Bitte füllen Sie Email und Passwort aus.",
        variant: "destructive"
      });
      return;
    }

    setIsCreatingAdmin(true);

    try {
      // Call edge function WITHOUT authorization header for bootstrap mode
      const response = await fetch(
        `https://koymmvuhcxlvcuoyjnvv.supabase.co/functions/v1/admin-user-actions`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'apikey': 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImtveW1tdnVoY3hsdmN1b3lqbnZ2Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTQzODA3NTcsImV4cCI6MjA2OTk1Njc1N30.Pb5uz3xFH2Fupk9JSjcbxNrS-s_mE3ySnFy5B7HcZFw',
            // NO Authorization header - this allows bootstrap mode!
          },
          body: JSON.stringify({
            action: 'create_admin',
            email: email,
            password: password,
          })
        }
      );

      const data = await response.json();

      if (!response.ok) {
        console.error('Error creating admin:', data);
        toast({
          title: "Fehler beim Erstellen",
          description: data.error || "Admin-Account konnte nicht erstellt werden.",
          variant: "destructive"
        });
        return;
      }

      if (data?.error) {
        toast({
          title: "Fehler",
          description: data.error,
          variant: "destructive"
        });
        return;
      }

      toast({
        title: "Admin-Account erstellt",
        description: "Sie können sich jetzt anmelden.",
      });

    } catch (error) {
      console.error('Create admin error:', error);
      toast({
        title: "Unerwarteter Fehler",
        description: "Fehler beim Erstellen des Admin-Accounts.",
        variant: "destructive"
      });
    } finally {
      setIsCreatingAdmin(false);
    }
  };

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!email || !password) {
      toast({
        title: "Fehler",
        description: "Bitte füllen Sie alle Felder aus.",
        variant: "destructive"
      });
      return;
    }

    setIsAuthenticating(true);

    try {
      // Sign in with Supabase Auth
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) {
        toast({
          title: "Anmeldung fehlgeschlagen",
          description: "E-Mail oder Passwort ist falsch.",
          variant: "destructive"
        });
        return;
      }

      if (data.user) {
        // Check if user has admin role in user_roles table
        const { data: roles, error: rolesError } = await supabase
          .from('user_roles')
          .select('role')
          .eq('user_id', data.user.id);

        if (rolesError) {
          console.error('Error checking admin role:', rolesError);
          toast({
            title: "Fehler",
            description: "Fehler beim Überprüfen der Admin-Berechtigung.",
            variant: "destructive"
          });
          await supabase.auth.signOut();
          return;
        }

        // Check if user has any admin role
        const hasAdminRole = roles && roles.length > 0;

        if (!hasAdminRole) {
          toast({
            title: "Kein Admin-Zugriff",
            description: "Sie haben keine Berechtigung für das Admin-Panel.",
            variant: "destructive"
          });
          await supabase.auth.signOut();
          return;
        }

        toast({
          title: "Erfolgreich angemeldet",
          description: "Willkommen im Admin-Panel!",
        });

        navigate('/admin');
      }
    } catch (error) {
      console.error('Login error:', error);
      toast({
        title: "Unerwarteter Fehler",
        description: "Ein unerwarteter Fehler ist aufgetreten.",
        variant: "destructive"
      });
    } finally {
      setIsAuthenticating(false);
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 flex items-center justify-center p-4">
      <div className="w-full max-w-md space-y-6">
        {/* Logo/Branding */}
        <div className="text-center space-y-2">
          <div className="flex items-center justify-center mb-4">
            <Shield className="h-16 w-16 text-primary" />
          </div>
          <h1 className="text-3xl font-bold text-white">BeVisiblle Admin</h1>
          <p className="text-slate-400">
            Sicherer Admin-Zugang
          </p>
        </div>

        {/* Login Form */}
        <Card className="border-slate-700 bg-slate-800/50 backdrop-blur">
          <CardHeader>
            <CardTitle className="text-center text-white">Admin Login</CardTitle>
            <CardDescription className="text-center text-slate-400">
              Nur für autorisierte Administratoren
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleLogin} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="email" className="text-slate-200">E-Mail-Adresse</Label>
                <Input
                  id="email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="admin@bevisiblle.de"
                  disabled={isAuthenticating}
                  className="bg-slate-900/50 border-slate-600 text-white placeholder:text-slate-500"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="password" className="text-slate-200">Passwort</Label>
                <div className="relative">
                  <Input
                    id="password"
                    type={showPassword ? "text" : "password"}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="••••••••"
                    disabled={isAuthenticating}
                    className="bg-slate-900/50 border-slate-600 text-white placeholder:text-slate-500"
                  />
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent text-slate-400 hover:text-slate-200"
                    onClick={() => setShowPassword(!showPassword)}
                    disabled={isAuthenticating}
                  >
                    {showPassword ? (
                      <EyeOff className="h-4 w-4" />
                    ) : (
                      <Eye className="h-4 w-4" />
                    )}
                  </Button>
                </div>
              </div>

              <Button
                type="submit"
                className="w-full"
                disabled={isAuthenticating || isCreatingAdmin}
              >
                {isAuthenticating ? (
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                ) : (
                  <Shield className="h-4 w-4 mr-2" />
                )}
                {isAuthenticating ? 'Anmelden...' : 'Admin Login'}
              </Button>

              <div className="relative my-4">
                <div className="absolute inset-0 flex items-center">
                  <span className="w-full border-t border-slate-600" />
                </div>
                <div className="relative flex justify-center text-xs uppercase">
                  <span className="bg-slate-800 px-2 text-slate-400">Noch kein Account?</span>
                </div>
              </div>

              <Button
                type="button"
                variant="outline"
                className="w-full border-slate-600 bg-slate-900/50 text-slate-200 hover:bg-slate-700"
                onClick={handleCreateAdmin}
                disabled={isAuthenticating || isCreatingAdmin}
              >
                {isCreatingAdmin ? (
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                ) : (
                  <Shield className="h-4 w-4 mr-2" />
                )}
                {isCreatingAdmin ? 'Erstelle Account...' : 'Admin-Account erstellen'}
              </Button>
            </form>
          </CardContent>
        </Card>

        <p className="text-center text-sm text-slate-500">
          Geschützter Bereich - Alle Aktivitäten werden protokolliert
        </p>
      </div>
    </div>
  );
}
