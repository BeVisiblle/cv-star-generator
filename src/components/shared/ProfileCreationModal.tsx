import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Loader2, UserPlus, Eye, EyeOff } from 'lucide-react';
import { toast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { useNavigate } from 'react-router-dom';

interface ProfileCreationModalProps {
  isOpen: boolean;
  onClose: () => void;
  prefilledEmail: string;
  formData: any;
}

export const ProfileCreationModal = ({ 
  isOpen, 
  onClose, 
  prefilledEmail, 
  formData 
}: ProfileCreationModalProps) => {
  const [email, setEmail] = useState(prefilledEmail);
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isCreating, setIsCreating] = useState(false);
  const navigate = useNavigate();

  const validatePassword = (password: string) => {
    if (password.length < 8) return "Passwort muss mindestens 8 Zeichen haben";
    if (!/[A-Z]/.test(password)) return "Passwort muss einen Großbuchstaben enthalten";
    if (!/[0-9]/.test(password)) return "Passwort muss eine Zahl enthalten";
    return null;
  };

  const handleCreateProfile = async () => {
    if (!email || !password) {
      toast({
        title: "Fehler",
        description: "Bitte füllen Sie alle Felder aus.",
        variant: "destructive"
      });
      return;
    }

    const passwordError = validatePassword(password);
    if (passwordError) {
      toast({
        title: "Passwort zu schwach",
        description: passwordError,
        variant: "destructive"
      });
      return;
    }

    setIsCreating(true);

    try {
      // Create Supabase account
      const { data: authData, error: authError } = await supabase.auth.signUp({
        email,
        password,
        options: {
          emailRedirectTo: `${window.location.origin}/profile`
        }
      });

      if (authError) {
        console.error('Auth error:', authError);
        toast({
          title: "Fehler beim Account erstellen",
          description: authError.message,
          variant: "destructive"
        });
        return;
      }

      if (authData.user) {
        // Create profile with CV data
        const profileData = {
          id: authData.user.id,
          email: email,
          vorname: formData.vorname,
          nachname: formData.nachname,
          geburtsdatum: formData.geburtsdatum?.toISOString().split('T')[0],
          strasse: formData.strasse,
          hausnummer: formData.hausnummer,
          plz: formData.plz,
          ort: formData.ort,
          telefon: formData.telefon,
          avatar_url: typeof formData.profilbild === 'string' ? formData.profilbild : null,
          branche: formData.branche,
          status: formData.status,
          schule: formData.schule,
          geplanter_abschluss: formData.geplanter_abschluss,
          abschlussjahr: formData.abschlussjahr,
          ausbildungsberuf: formData.ausbildungsberuf,
          ausbildungsbetrieb: formData.ausbildungsbetrieb,
          startjahr: formData.startjahr,
          voraussichtliches_ende: formData.voraussichtliches_ende,
          abschlussjahr_ausgelernt: formData.abschlussjahr_ausgelernt,
          aktueller_beruf: formData.aktueller_beruf,
          sprachen: formData.sprachen || [],
          faehigkeiten: formData.faehigkeiten || [],
          schulbildung: formData.schulbildung || [],
          berufserfahrung: formData.berufserfahrung || [],
          layout: formData.layout,
          uebermich: formData.ueberMich,
          kenntnisse: formData.kenntnisse,
          motivation: formData.motivation,
          praktische_erfahrung: formData.praktische_erfahrung,
          einwilligung: formData.einwilligung,
          profile_complete: true,
          profile_published: false,
          account_created: true
        };

        const { error: profileError } = await supabase
          .from('profiles')
          .insert(profileData);

        if (profileError) {
          console.error('Profile error:', profileError);
          toast({
            title: "Fehler beim Profil erstellen",
            description: profileError.message,
            variant: "destructive"
          });
          return;
        }

        toast({
          title: "Profil erfolgreich erstellt!",
          description: "Ihr Account wurde erstellt und Sie werden automatisch eingeloggt.",
        });
        
        // Store CV data temporarily for profile page
        localStorage.setItem('cvData', JSON.stringify(formData));
        
        // Close modal and navigate to profile
        onClose();
        navigate('/profile');
      }
    } catch (error) {
      console.error('Unexpected error:', error);
      toast({
        title: "Unerwarteter Fehler",
        description: "Ein unerwarteter Fehler ist aufgetreten.",
        variant: "destructive"
      });
    } finally {
      setIsCreating(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Profil erstellen</DialogTitle>
        </DialogHeader>
        
        <div className="space-y-4">
          <p className="text-sm text-muted-foreground">
            Erstellen Sie jetzt Ihr Profil, um von Arbeitgebern gefunden zu werden.
          </p>
          
          <div className="space-y-2">
            <Label htmlFor="email">E-Mail-Adresse</Label>
            <Input
              id="email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="ihre@email.com"
            />
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="password">Passwort</Label>
            <div className="relative">
              <Input
                id="password"
                type={showPassword ? "text" : "password"}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Mindestens 8 Zeichen"
              />
              <Button
                type="button"
                variant="ghost"
                size="sm"
                className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                onClick={() => setShowPassword(!showPassword)}
              >
                {showPassword ? (
                  <EyeOff className="h-4 w-4" />
                ) : (
                  <Eye className="h-4 w-4" />
                )}
              </Button>
            </div>
            <p className="text-xs text-muted-foreground">
              Passwort muss mindestens 8 Zeichen, einen Großbuchstaben und eine Zahl enthalten.
            </p>
          </div>
          
          <div className="flex gap-3 pt-4">
            <Button variant="outline" onClick={onClose} className="flex-1">
              Abbrechen
            </Button>
            <Button 
              onClick={handleCreateProfile} 
              disabled={isCreating}
              className="flex-1"
            >
              {isCreating ? (
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
              ) : (
                <UserPlus className="h-4 w-4 mr-2" />
              )}
              {isCreating ? 'Erstelle...' : 'Profil erstellen'}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};