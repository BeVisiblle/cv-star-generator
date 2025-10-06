import React, { useState } from 'react';
import { useCVForm } from '@/contexts/CVFormContext';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Checkbox } from '@/components/ui/checkbox';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Separator } from '@/components/ui/separator';
import { Download, UserPlus, Loader2, Mail, CreditCard, CheckCircle2, Sparkles } from 'lucide-react';
import { toast } from 'sonner';
import { generatePDF, generateCVFilename } from '@/lib/pdf-generator';
import { ProfileCreationModal } from '@/components/shared/ProfileCreationModal';
import BerlinLayout from '@/components/cv-layouts/BerlinLayout';
import MuenchenLayout from '@/components/cv-layouts/MuenchenLayout';
import HamburgLayout from '@/components/cv-layouts/HamburgLayout';
import KoelnLayout from '@/components/cv-layouts/KoelnLayout';
import FrankfurtLayout from '@/components/cv-layouts/FrankfurtLayout';
import DuesseldorfLayout from '@/components/cv-layouts/DuesseldorfLayout';
import { mapFormDataToCVData } from '@/components/cv-layouts/mapFormDataToCVData';
import { cn } from '@/lib/utils';

const CVStep7 = () => {
  const { formData, updateFormData, setCurrentStep } = useCVForm();
  const [isGeneratingPDF, setIsGeneratingPDF] = useState(false);
  const [showProfileModal, setShowProfileModal] = useState(false);

  const getBrancheTitle = () => {
    switch (formData.branche) {
      case 'handwerk': return 'Handwerk';
      case 'it': return 'IT';
      case 'gesundheit': return 'Gesundheit';
      case 'buero': return 'Büro & Verwaltung';
      case 'verkauf': return 'Verkauf & Handel';
      case 'gastronomie': return 'Gastronomie';
      case 'bau': return 'Bau & Architektur';
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

  const getLayoutName = () => {
    switch (formData.layout) {
      case 1: return 'Berlin';
      case 2: return 'München';
      case 3: return 'Hamburg';
      case 4: return 'Köln';
      case 5: return 'Frankfurt';
      case 6: return 'Düsseldorf';
      default: return 'Berlin';
    }
  };

  const handleDownloadPDF = async () => {
    if (!formData.vorname || !formData.nachname) {
      toast.error("Vor- und Nachname sind erforderlich für den PDF-Download.");
      return;
    }

    setIsGeneratingPDF(true);
    
    try {
      // Create temporary container for rendering CV (like ProfileCard does)
      const tempContainer = document.createElement('div');
      tempContainer.style.position = 'fixed';
      tempContainer.style.left = '-10000px';
      tempContainer.style.top = '0';
      tempContainer.style.width = '794px';
      tempContainer.style.height = '1123px';
      tempContainer.style.backgroundColor = 'white';
      document.body.appendChild(tempContainer);

      // Map form data to CV data
      const cvData = mapFormDataToCVData(formData);
      
      // Get the correct layout component
      const selected = formData.layout ?? 1;
      const LayoutComponent =
        selected === 2 ? MuenchenLayout :
        selected === 3 ? HamburgLayout :
        selected === 4 ? KoelnLayout :
        selected === 5 ? FrankfurtLayout :
        selected === 6 ? DuesseldorfLayout :
        BerlinLayout;

      // Dynamically render the layout using React
      const React = await import('react');
      const ReactDOM = await import('react-dom/client');
      
      const cvElement = React.createElement(LayoutComponent, { 
        data: cvData
      });
      const root = ReactDOM.createRoot(tempContainer);
      
      await new Promise<void>((resolve) => {
        root.render(cvElement);
        // Wait for render to complete
        setTimeout(() => resolve(), 300);
      });

      // Generate filename
      const filename = generateCVFilename(formData.vorname, formData.nachname);
      
      // Generate PDF from the rendered container
      await generatePDF(tempContainer, {
        filename,
        quality: 2,
        format: 'a4',
        margin: 0
      });

      // Cleanup
      root.unmount();
      document.body.removeChild(tempContainer);
      
      toast.success(`Dein Lebenslauf wurde als ${filename} heruntergeladen.`);
    } catch (error) {
      console.error('PDF generation error:', error);
      toast.error("Es gab ein Problem beim Erstellen deines Lebenslaufs. Bitte versuche es erneut.");
    } finally {
      setIsGeneratingPDF(false);
    }
  };

  const handleCreateProfile = () => {
    if (!formData.einwilligung) {
      toast.error("Bitte stimme der Speicherung deiner Daten zu, um ein Profil zu erstellen.");
      return;
    }

    if (!formData.email) {
      toast.error("Bitte gib in Schritt 2 eine E-Mail-Adresse ein.");
      return;
    }

    localStorage.setItem('creating-profile', 'true');
    setShowProfileModal(true);
  };

  return (
    <div className="space-y-6">
      {/* Glückwunsch Header */}
      <Card className="border-2 border-primary/20 bg-gradient-to-r from-primary/5 to-primary/10">
        <CardHeader className="text-center pb-4">
          <div className="mx-auto w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center mb-4">
            <Sparkles className="h-8 w-8 text-primary" />
          </div>
          <CardTitle className="text-2xl">🎉 Glückwunsch!</CardTitle>
          <CardDescription className="text-base">
            Dein Lebenslauf ist fertig und sieht professionell aus!
          </CardDescription>
        </CardHeader>
      </Card>

      {/* Zusammenfassung */}
      <Card>
        <CardHeader>
          <CardTitle>📋 Zusammenfassung</CardTitle>
          <CardDescription>Eine Übersicht deiner Angaben</CardDescription>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="flex justify-between">
            <span className="text-muted-foreground">Branche:</span>
            <span className="font-medium">{getBrancheTitle()}</span>
          </div>
          
          <div className="flex justify-between">
            <span className="text-muted-foreground">Status:</span>
            <span className="font-medium">{getStatusTitle()}</span>
          </div>
          
          <Separator />
          
          <div className="flex justify-between">
            <span className="text-muted-foreground">Name:</span>
            <span className="font-medium">{formData.vorname} {formData.nachname}</span>
          </div>
          
          <div className="flex justify-between">
            <span className="text-muted-foreground">Wohnort:</span>
            <span className="font-medium">{formData.ort}</span>
          </div>
          
          {formData.status === 'schueler' && (
            <>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Schule:</span>
                <span className="font-medium">{formData.schule}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Abschluss:</span>
                <span className="font-medium">{formData.geplanter_abschluss} ({formData.abschlussjahr})</span>
              </div>
            </>
          )}
          
          {formData.status === 'azubi' && (
            <>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Ausbildung:</span>
                <span className="font-medium">{formData.ausbildungsberuf}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Betrieb:</span>
                <span className="font-medium">{formData.ausbildungsbetrieb}</span>
              </div>
            </>
          )}
          
          {formData.status === 'ausgelernt' && (
            <>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Ausbildung:</span>
                <span className="font-medium">{formData.ausbildungsberuf} ({formData.abschlussjahr_ausgelernt})</span>
              </div>
              {formData.aktueller_beruf && (
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Aktueller Beruf:</span>
                  <span className="font-medium">{formData.aktueller_beruf}</span>
                </div>
              )}
            </>
          )}
          
          <Separator />
          
          <div className="flex justify-between">
            <span className="text-muted-foreground">Layout:</span>
            <span className="font-medium">{getLayoutName()}</span>
          </div>
        </CardContent>
      </Card>

      {/* Optionen */}
      <Card>
        <CardHeader>
          <CardTitle>🎯 Was möchtest du tun?</CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          
          {/* Option 1: Profil erstellen (Empfohlen) */}
          <div className="border-2 border-primary rounded-lg p-5 bg-primary/5 space-y-4">
            <div className="flex items-start gap-3">
              <CheckCircle2 className="h-6 w-6 text-primary mt-0.5 flex-shrink-0" />
              <div className="flex-1">
                <h4 className="font-semibold text-lg mb-1">Profil erstellen (Empfohlen)</h4>
                <ul className="text-sm text-muted-foreground space-y-1 mb-4">
                  <li>✓ Von Arbeitgebern gefunden werden</li>
                  <li>✓ CV jederzeit kostenlos herunterladen</li>
                  <li>✓ Daten später bearbeiten</li>
                </ul>
                
                <div className="space-y-3">
                  <div className="flex items-center space-x-2">
                    <Checkbox
                      id="einwilligung"
                      checked={formData.einwilligung || false}
                      onCheckedChange={(checked) => updateFormData({ einwilligung: !!checked })}
                    />
                    <Label htmlFor="einwilligung" className="text-sm font-normal">
                      Einwilligung zur Speicherung meiner Daten
                    </Label>
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="email-input" className="text-sm">E-Mail-Adresse</Label>
                    <Input
                      id="email-input"
                      type="email"
                      placeholder="deine@email.de"
                      value={formData.email || ''}
                      onChange={(e) => updateFormData({ email: e.target.value })}
                      className="bg-background"
                    />
                  </div>
                  
                  <Button
                    onClick={handleCreateProfile}
                    className="w-full h-11"
                    disabled={!formData.einwilligung || !formData.email}
                  >
                    <UserPlus className="h-4 w-4 mr-2" />
                    Jetzt Profil erstellen
                  </Button>
                </div>
              </div>
            </div>
          </div>

          <div className="relative">
            <div className="absolute inset-0 flex items-center">
              <Separator />
            </div>
            <div className="relative flex justify-center text-xs uppercase">
              <span className="bg-background px-2 text-muted-foreground">Oder</span>
            </div>
          </div>

          {/* Option 2: Kostenpflichtig herunterladen */}
          <Button
            onClick={handleDownloadPDF}
            variant="outline"
            className="w-full h-11"
            disabled={isGeneratingPDF}
          >
            {isGeneratingPDF ? (
              <>
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                PDF wird erstellt...
              </>
            ) : (
              <>
                <Download className="h-4 w-4 mr-2" />
                CV sofort herunterladen
              </>
            )}
          </Button>

          <p className="text-xs text-center text-muted-foreground">
            Ohne Profil kannst du deinen CV direkt herunterladen, aber nicht später bearbeiten.
          </p>
        </CardContent>
      </Card>

      <ProfileCreationModal
        isOpen={showProfileModal}
        onClose={() => {
          localStorage.removeItem('creating-profile');
          setShowProfileModal(false);
        }}
        prefilledEmail={formData.email || ''}
        formData={formData}
      />
    </div>
  );
};

export default CVStep7;