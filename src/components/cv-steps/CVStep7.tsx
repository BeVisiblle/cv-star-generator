import React from 'react';
import { useCVForm } from '@/contexts/CVFormContext';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Checkbox } from '@/components/ui/checkbox';
import { Label } from '@/components/ui/label';
import { Separator } from '@/components/ui/separator';
import { Download, UserPlus } from 'lucide-react';
import { toast } from '@/hooks/use-toast';

const CVStep5 = () => {
  const { formData, updateFormData } = useCVForm();

  const getBrancheTitle = () => {
    switch (formData.branche) {
      case 'handwerk': return 'Handwerk';
      case 'it': return 'IT';
      case 'gesundheit': return 'Gesundheit';
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
    const layouts = ['Klassisch', 'Modern', 'Kreativ', 'Technisch', 'Handwerk'];
    return formData.layout ? layouts[formData.layout - 1] : 'Nicht gewählt';
  };

  const handleDownloadPDF = () => {
    toast({
      title: "PDF wird erstellt",
      description: "Dein Lebenslauf wird als PDF heruntergeladen.",
    });
    // TODO: Implement PDF generation
  };

  const handleCreateProfile = () => {
    if (!formData.einwilligung) {
      toast({
        title: "Einverständnis erforderlich",
        description: "Bitte stimme der Speicherung deiner Daten zu, um ein Profil zu erstellen.",
        variant: "destructive"
      });
      return;
    }
    
    toast({
      title: "Profil wird erstellt",
      description: "Du wirst zur Profilregistrierung weitergeleitet.",
    });
    // TODO: Implement profile creation
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-xl font-semibold mb-2">Zusammenfassung</h2>
        <p className="text-muted-foreground mb-6">
          Perfekt! Hier ist eine Übersicht deiner Angaben.
        </p>
      </div>

      <Card className="p-6">
        <h3 className="font-semibold mb-4">Deine CV-Daten</h3>
        
        <div className="space-y-3">
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
            <span className="font-medium">{formData.wohnort}</span>
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
        </div>
      </Card>

      <Card className="p-6">
        <h3 className="font-semibold mb-4">Deine Optionen</h3>
        
        <div className="space-y-4">
          <div className="flex items-center space-x-2">
            <Checkbox
              id="einwilligung"
              checked={formData.einwilligung || false}
              onCheckedChange={(checked) => updateFormData({ einwilligung: !!checked })}
            />
            <Label htmlFor="einwilligung" className="text-sm">
              Ich möchte ein Profil anlegen und stimme der Speicherung meiner Daten zu
            </Label>
          </div>
          
          <p className="text-xs text-muted-foreground">
            Mit einem Profil kannst du von Arbeitgebern gefunden werden und deine Daten 
            später bearbeiten. Ohne Profil kannst du trotzdem dein PDF herunterladen.
          </p>
        </div>
      </Card>

      <div className="grid md:grid-cols-2 gap-4">
        <Button
          onClick={handleDownloadPDF}
          className="w-full h-12"
          variant="outline"
        >
          <Download className="h-4 w-4 mr-2" />
          CV als PDF herunterladen
        </Button>
        
        <Button
          onClick={handleCreateProfile}
          className="w-full h-12"
          disabled={!formData.einwilligung}
        >
          <UserPlus className="h-4 w-4 mr-2" />
          Jetzt Profil anlegen
        </Button>
      </div>

      <div className="p-4 bg-primary/5 rounded-lg border text-center">
        <p className="text-sm text-foreground">
          🎉 <strong>Glückwunsch!</strong> Du hast deinen Lebenslauf erfolgreich erstellt. 
          Jetzt kannst du ihn herunterladen oder ein Profil anlegen, um von Arbeitgebern gefunden zu werden.
        </p>
      </div>
    </div>
  );
};

export default CVStep5;