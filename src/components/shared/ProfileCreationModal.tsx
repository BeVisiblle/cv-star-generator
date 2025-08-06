import React, { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Loader2, UserPlus, Eye, EyeOff, Clock } from 'lucide-react';
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
  const [rateLimitSeconds, setRateLimitSeconds] = useState(0);
  const navigate = useNavigate();

  // Auth state cleanup utility
  const cleanupAuthState = () => {
    try {
      // Remove all Supabase auth keys from localStorage
      Object.keys(localStorage).forEach((key) => {
        if (key.startsWith('supabase.auth.') || key.includes('sb-')) {
          localStorage.removeItem(key);
        }
      });
      // Remove from sessionStorage if in use
      Object.keys(sessionStorage || {}).forEach((key) => {
        if (key.startsWith('supabase.auth.') || key.includes('sb-')) {
          sessionStorage.removeItem(key);
        }
      });
    } catch (error) {
      console.log('Error cleaning auth state:', error);
    }
  };

  // Email validation utility
  const validateEmail = (email: string) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return "Bitte geben Sie eine gültige E-Mail-Adresse ein";
    }
    return null;
  };

  // Rate limit countdown effect
  useEffect(() => {
    if (rateLimitSeconds > 0) {
      const timer = setTimeout(() => {
        setRateLimitSeconds(prev => prev - 1);
      }, 1000);
      return () => clearTimeout(timer);
    }
  }, [rateLimitSeconds]);

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

    // Client-side email validation
    const emailError = validateEmail(email);
    if (emailError) {
      toast({
        title: "E-Mail ungültig",
        description: emailError,
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
      // Clean up auth state before new signup
      cleanupAuthState();
      
      // Attempt global sign out first
      try {
        await supabase.auth.signOut({ scope: 'global' });
      } catch (err) {
        // Continue even if this fails
        console.log('Sign out failed:', err);
      }

      // Create Supabase account without email confirmation
      const { data: authData, error: authError } = await supabase.auth.signUp({
        email,
        password,
        options: {
          emailRedirectTo: `${window.location.origin}/profile`,
          data: {
            email_confirm: false
          }
        }
      });

      if (authError) {
        console.error('Auth error:', authError);
        
        // Handle rate limiting specifically
        if (authError.message.includes('For security purposes') || authError.message.includes('rate')) {
          const match = authError.message.match(/(\d+)\s*seconds?/);
          const seconds = match ? parseInt(match[1]) : 60;
          setRateLimitSeconds(seconds);
          
          toast({
            title: "Zu viele Versuche",
            description: `Bitte warten Sie ${seconds} Sekunden und versuchen Sie es erneut.`,
            variant: "destructive"
          });
          return;
        }

        // Handle user already registered
        if (authError.message.includes('User already registered')) {
          toast({
            title: "Account bereits vorhanden",
            description: "Ein Account mit dieser E-Mail-Adresse existiert bereits. Versuchen Sie sich anzumelden.",
            variant: "destructive"
          });
          return;
        }

        // Handle other auth errors
        toast({
          title: "Fehler beim Account erstellen",
          description: authError.message,
          variant: "destructive"
        });
        return;
      }

      if (authData.user) {
        console.log('User created:', authData.user.id);
        
        // CRITICAL: Set session immediately to ensure proper authentication
        if (authData.session) {
          await supabase.auth.setSession(authData.session);
          console.log('Session set for user:', authData.user.id);
        }
        
        // Wait for auth state to propagate
        await new Promise(resolve => setTimeout(resolve, 1000));
        
        // Verify authentication before proceeding
        const { data: { user: currentUser } } = await supabase.auth.getUser();
        if (!currentUser) {
          console.error('User not authenticated after session set');
          toast({
            title: "Authentifizierungsfehler",
            description: "Benutzer konnte nicht authentifiziert werden. Bitte versuchen Sie es erneut.",
            variant: "destructive"
          });
          return;
        }
        
        console.log('User authenticated:', currentUser.id);
        
        // Wait for trigger to create basic profile
        await new Promise(resolve => setTimeout(resolve, 2000));
        
        // Check if profile was created by trigger
        const { data: profileCheck } = await supabase
          .from('profiles')
          .select('id')
          .eq('id', authData.user.id)
          .maybeSingle();
          
        if (!profileCheck) {
          console.log('Profile not created by trigger, attempting manual creation');
          
          // Try to create basic profile manually as authenticated user
          const { data: newProfile, error: insertError } = await supabase
            .from('profiles')
            .insert({
              id: authData.user.id,
              email: email,
              account_created: true
            })
            .select()
            .single();
            
          if (insertError) {
            console.error('Manual profile creation failed:', insertError);
            
            // If RLS error, try using the service role approach
            if (insertError.code === '42501') {
              console.log('RLS policy violation, profile should be created by trigger');
              toast({
                title: "Profil wird erstellt",
                description: "Ihr Account wurde erfolgreich erstellt. Das Profil wird automatisch angelegt.",
                variant: "default"
              });
              
              // Navigate to profile page anyway, the trigger should work
              onClose();
              navigate('/profile');
              return;
            }
            
            toast({
              title: "Fehler beim Profil erstellen",
              description: "Das Profil konnte nicht erstellt werden. Bitte versuchen Sie es erneut.",
              variant: "destructive"
            });
            return;
          }
          console.log('Profile created manually:', newProfile);
        } else {
          console.log('Profile exists:', profileCheck);
        }
        
        // Handle file uploads first
        let avatarUrl = typeof formData.profilbild === 'string' ? formData.profilbild : null;
        let coverImageUrl = typeof formData.cover_image === 'string' ? formData.cover_image : null;
        let cvUrl = null;

        try {
          // Upload profile image if it's a File
          if (formData.profilbild instanceof File) {
            const { uploadProfileImage } = await import('@/lib/supabase-storage');
            const uploadResult = await uploadProfileImage(formData.profilbild);
            avatarUrl = uploadResult.url;
          }

          // Upload cover image if it's a File  
          if (formData.cover_image instanceof File) {
            const { uploadCoverImage } = await import('@/lib/supabase-storage');
            const uploadResult = await uploadCoverImage(formData.cover_image);
            coverImageUrl = uploadResult.url;
          }

          // Generate and upload CV PDF
          if (formData.vorname && formData.nachname) {
            const { generateCVFilename } = await import('@/lib/pdf-generator');
            const { generateCVFromHTML, uploadCV } = await import('@/lib/supabase-storage');
            
            // Find CV preview element
            const cvElement = document.querySelector('[data-cv-preview]') as HTMLElement;
            if (cvElement) {
              const filename = generateCVFilename(formData.vorname, formData.nachname);
              const cvFile = await generateCVFromHTML(cvElement, filename);
              const uploadResult = await uploadCV(cvFile);
              cvUrl = uploadResult.url;
            }
          }
        } catch (uploadError) {
          console.warn('File upload error:', uploadError);
          // Continue with profile creation even if uploads fail
        }

        // Helper functions for profile data
        const getBrancheTitle = () => {
          switch (formData.branche) {
            case 'handwerk': return 'Handwerk';
            case 'it': return 'IT';
            case 'gesundheit': return 'Gesundheit';
            case 'buero': return 'Büro';
            case 'verkauf': return 'Verkauf';
            case 'gastronomie': return 'Gastronomie';
            case 'bau': return 'Bau';
            default: return '';
          }
        };

        const getStatusTitle = () => {
          switch (formData.status) {
            case 'schueler': return 'Schüler:in';
            case 'azubi': return 'Azubi';
            case 'ausgelernt': return 'Ausgelernte Fachkraft';
            default: return '';
          }
        };

        
        // Generate AI-powered bio from form data
        const bioText = [
          formData.ueberMich,
          formData.kenntnisse && `Kenntnisse: ${formData.kenntnisse}`,
          formData.motivation && `Motivation: ${formData.motivation}`,
          formData.praktische_erfahrung && `Praktische Erfahrung: ${formData.praktische_erfahrung}`
        ].filter(Boolean).join('\n\n');
        
        // Prepare profile update data
        const profileData = {
          email: email,
          vorname: formData.vorname,
          nachname: formData.nachname,
          geburtsdatum: formData.geburtsdatum?.toISOString().split('T')[0],
          strasse: formData.strasse,
          hausnummer: formData.hausnummer,
          plz: formData.plz,
          ort: formData.ort,
          telefon: formData.telefon,
          avatar_url: avatarUrl,
          cover_image_url: coverImageUrl,
          cv_url: cvUrl,
          headline: formData.headline || `${getStatusTitle()} ${formData.branche ? `in ${getBrancheTitle()}` : ''}`,
          bio: bioText || formData.ueberMich,
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
          layout: formData.layout || 1,
          uebermich: formData.ueberMich,
          kenntnisse: formData.kenntnisse,
          motivation: formData.motivation,
          praktische_erfahrung: formData.praktische_erfahrung,
          has_drivers_license: formData.has_drivers_license || false,
          has_own_vehicle: formData.has_own_vehicle || false,
          target_year: formData.target_year,
          visibility_industry: formData.visibility_industry || [],
          visibility_region: formData.visibility_region || [],
          einwilligung: formData.einwilligung,
          profile_complete: true,
          profile_published: false,
          updated_at: new Date().toISOString()
        };

        console.log('Form data received:', formData);
        console.log('Updating profile with data:', profileData);

        // Update the profile with all the CV data
        const { data: updatedProfile, error: profileError } = await supabase
          .from('profiles')
          .update(profileData)
          .eq('id', authData.user.id)
          .select()
          .single();

        if (profileError) {
          console.error('Profile update error:', profileError);
          toast({
            title: "Fehler beim Profil aktualisieren",
            description: profileError.message,
            variant: "destructive"
          });
          return;
        }

        console.log('Profile updated successfully:', updatedProfile);

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
          
          {rateLimitSeconds > 0 && (
            <div className="bg-orange-50 border border-orange-200 rounded-lg p-3 text-center">
              <Clock className="h-4 w-4 inline mr-2 text-orange-600" />
              <span className="text-sm text-orange-700">
                Bitte warten Sie noch {rateLimitSeconds} Sekunden
              </span>
            </div>
          )}
          
          <div className="flex gap-3 pt-4">
            <Button variant="outline" onClick={onClose} className="flex-1">
              Abbrechen
            </Button>
            <Button 
              onClick={handleCreateProfile} 
              disabled={isCreating || rateLimitSeconds > 0}
              className="flex-1"
            >
              {isCreating ? (
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
              ) : rateLimitSeconds > 0 ? (
                <Clock className="h-4 w-4 mr-2" />
              ) : (
                <UserPlus className="h-4 w-4 mr-2" />
              )}
              {isCreating ? 'Erstelle...' : rateLimitSeconds > 0 ? 'Warten...' : 'Profil erstellen'}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};