import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { Separator } from '@/components/ui/separator';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Shield, Eye, EyeOff, Trash2, Download, AlertTriangle } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/hooks/useAuth';
import { secureApiService } from '@/services/secureApiService';
import { supabase } from '@/integrations/supabase/client';

export default function DataPrivacySettings() {
  const { user, profile } = useAuth();
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(false);
  const [consentSettings, setConsentSettings] = useState({
    publicEmploymentVisible: false,
    dataProcessingConsent: false,
    marketingConsent: false
  });

  useEffect(() => {
    if (profile) {
      setConsentSettings({
        publicEmploymentVisible: profile.public_employment_visible || false,
        dataProcessingConsent: profile.data_processing_consent || false,
        marketingConsent: profile.marketing_consent || false
      });
    }
  }, [profile]);

  const handleConsentUpdate = async (field: string, value: boolean) => {
    setIsLoading(true);
    try {
      const newSettings = { ...consentSettings, [field]: value };
      setConsentSettings(newSettings);

      await secureApiService.updateDataConsent(newSettings);
      
      toast({
        title: "Einstellungen aktualisiert",
        description: "Deine Datenschutzeinstellungen wurden erfolgreich gespeichert."
      });
    } catch (error) {
      console.error('Error updating consent:', error);
      toast({
        title: "Fehler",
        description: "Es gab einen Fehler beim Speichern der Einstellungen.",
        variant: "destructive"
      });
      // Revert the change
      setConsentSettings({ ...consentSettings, [field]: !value });
    } finally {
      setIsLoading(false);
    }
  };

  const handleDataExport = async () => {
    setIsLoading(true);
    try {
      if (!user) throw new Error('User not authenticated');

      // Export all user data
      const { data: profileData } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', user.id)
        .single();

      const { data: applicationsData } = await supabase
        .from('applications')
        .select('*')
        .eq('candidate_id', user.id);

      const { data: employmentData } = await supabase
        .from('company_employment_requests')
        .select('*')
        .eq('user_id', user.id);

      const exportData = {
        profile: profileData,
        applications: applicationsData,
        employment_requests: employmentData,
        exported_at: new Date().toISOString()
      };

      // Download as JSON file
      const blob = new Blob([JSON.stringify(exportData, null, 2)], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `cv-star-generator-data-export-${new Date().toISOString().split('T')[0]}.json`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);

      toast({
        title: "Datenexport erfolgreich",
        description: "Deine Daten wurden als JSON-Datei heruntergeladen."
      });
    } catch (error) {
      console.error('Error exporting data:', error);
      toast({
        title: "Export fehlgeschlagen",
        description: "Es gab einen Fehler beim Exportieren deiner Daten.",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleDataDeletion = async () => {
    if (!confirm('Bist du sicher, dass du deine Daten löschen möchtest? Diese Aktion kann nicht rückgängig gemacht werden.')) {
      return;
    }

    if (!confirm('Deine Daten werden in 30 Tagen endgültig gelöscht. Bist du wirklich sicher?')) {
      return;
    }

    setIsLoading(true);
    try {
      await secureApiService.requestDataDeletion();
      
      toast({
        title: "Löschung beantragt",
        description: "Deine Daten werden in 30 Tagen endgültig gelöscht. Du erhältst eine Bestätigungs-E-Mail."
      });
    } catch (error) {
      console.error('Error requesting data deletion:', error);
      toast({
        title: "Fehler",
        description: "Es gab einen Fehler beim Beantragen der Datenlöschung.",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Shield className="h-5 w-5" />
            Datenschutzeinstellungen
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Data Visibility Settings */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold">Sichtbarkeit deiner Daten</h3>
            
            <div className="flex items-center justify-between">
              <div className="space-y-1">
                <Label htmlFor="employment-visible" className="flex items-center gap-2">
                  <Eye className="h-4 w-4" />
                  Arbeitsplatz sichtbar machen
                </Label>
                <p className="text-sm text-muted-foreground">
                  Erlaubt es Unternehmen, zu sehen, wo du arbeitest
                </p>
              </div>
              <Switch
                id="employment-visible"
                checked={consentSettings.publicEmploymentVisible}
                onCheckedChange={(value) => handleConsentUpdate('publicEmploymentVisible', value)}
                disabled={isLoading}
              />
            </div>

            <div className="flex items-center justify-between">
              <div className="space-y-1">
                <Label htmlFor="marketing-consent" className="flex items-center gap-2">
                  <Eye className="h-4 w-4" />
                  Marketing-E-Mails erhalten
                </Label>
                <p className="text-sm text-muted-foreground">
                  Erlaubt uns, dir relevante Jobangebote und Updates zu senden
                </p>
              </div>
              <Switch
                id="marketing-consent"
                checked={consentSettings.marketingConsent}
                onCheckedChange={(value) => handleConsentUpdate('marketingConsent', value)}
                disabled={isLoading}
              />
            </div>
          </div>

          <Separator />

          {/* Data Processing Consent */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold">Datenverarbeitung</h3>
            
            <div className="flex items-center justify-between">
              <div className="space-y-1">
                <Label htmlFor="data-processing" className="flex items-center gap-2">
                  <Shield className="h-4 w-4" />
                  Datenverarbeitung zustimmen
                </Label>
                <p className="text-sm text-muted-foreground">
                  Erforderlich für die Nutzung der Plattform (DSGVO-konform)
                </p>
              </div>
              <Switch
                id="data-processing"
                checked={consentSettings.dataProcessingConsent}
                onCheckedChange={(value) => handleConsentUpdate('dataProcessingConsent', value)}
                disabled={isLoading}
              />
            </div>

            {!consentSettings.dataProcessingConsent && (
              <Alert>
                <AlertTriangle className="h-4 w-4" />
                <AlertDescription>
                  Ohne Zustimmung zur Datenverarbeitung können wir die Plattform nicht nutzen.
                </AlertDescription>
              </Alert>
            )}
          </div>

          <Separator />

          {/* Data Management */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold">Datenverwaltung</h3>
            
            <div className="space-y-3">
              <Button
                variant="outline"
                onClick={handleDataExport}
                disabled={isLoading}
                className="w-full justify-start"
              >
                <Download className="h-4 w-4 mr-2" />
                Meine Daten exportieren
              </Button>
              
              <Button
                variant="destructive"
                onClick={handleDataDeletion}
                disabled={isLoading}
                className="w-full justify-start"
              >
                <Trash2 className="h-4 w-4 mr-2" />
                Daten löschen beantragen
              </Button>
            </div>

            <Alert>
              <AlertTriangle className="h-4 w-4" />
              <AlertDescription>
                <strong>Hinweis:</strong> Die Löschung deiner Daten erfolgt erst nach 30 Tagen 
                und kann nicht rückgängig gemacht werden. Du erhältst eine Bestätigungs-E-Mail.
              </AlertDescription>
            </Alert>
          </div>

          <Separator />

          {/* Privacy Information */}
          <div className="space-y-2">
            <h3 className="text-lg font-semibold">Datenschutz-Informationen</h3>
            <div className="text-sm text-muted-foreground space-y-2">
              <p>
                • Deine Daten werden sicher verschlüsselt gespeichert
              </p>
              <p>
                • Wir verwenden deine Daten nur für die angegebenen Zwecke
              </p>
              <p>
                • Du kannst deine Einwilligungen jederzeit widerrufen
              </p>
              <p>
                • Alle Zugriffe auf deine Daten werden protokolliert
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
