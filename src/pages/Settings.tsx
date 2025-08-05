import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { Eye, Shield, Bell, Trash2 } from "lucide-react";

const Settings = () => {
  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="space-y-2">
        <h1 className="text-3xl font-bold tracking-tight">Einstellungen</h1>
        <p className="text-muted-foreground">
          Verwalte deine Privatsphäre und Profil-Einstellungen
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Privacy Settings */}
        <Card>
          <CardHeader>
            <div className="flex items-center space-x-2">
              <Shield className="h-5 w-5" />
              <CardTitle>Datenschutz & Sichtbarkeit</CardTitle>
            </div>
            <CardDescription>
              Kontrolliere, wer dein Profil sehen kann
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label htmlFor="publish-profile">Profil veröffentlichen</Label>
                <p className="text-sm text-muted-foreground">
                  Dein Profil im Marketplace für Unternehmen sichtbar machen
                </p>
              </div>
              <Switch id="publish-profile" />
            </div>

            <Separator />

            <div className="space-y-4">
              <h4 className="text-sm font-medium">Branchen-Sichtbarkeit</h4>
              {['IT', 'Handwerk', 'Gesundheit', 'Handel', 'Industrie'].map((branch) => (
                <div key={branch} className="flex items-center justify-between">
                  <Label htmlFor={`branch-${branch}`} className="text-sm">
                    {branch}
                  </Label>
                  <Switch id={`branch-${branch}`} defaultChecked />
                </div>
              ))}
            </div>

            <Separator />

            <div className="space-y-2">
              <Label htmlFor="regional-visibility">Regionale Sichtbarkeit</Label>
              <p className="text-sm text-muted-foreground">
                Nur für Unternehmen in deiner Region sichtbar
              </p>
              <Switch id="regional-visibility" defaultChecked />
            </div>
          </CardContent>
        </Card>

        {/* Profile Settings */}
        <Card>
          <CardHeader>
            <div className="flex items-center space-x-2">
              <Eye className="h-5 w-5" />
              <CardTitle>Profil-Einstellungen</CardTitle>
            </div>
            <CardDescription>
              Konfiguriere deine Profil-Darstellung
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label htmlFor="show-contact">Kontaktdaten anzeigen</Label>
                <p className="text-sm text-muted-foreground">
                  E-Mail und Telefonnummer für Unternehmen sichtbar
                </p>
              </div>
              <Switch id="show-contact" defaultChecked />
            </div>

            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label htmlFor="show-documents">Dokumente anzeigen</Label>
                <p className="text-sm text-muted-foreground">
                  Hochgeladene Zeugnisse und Bescheinigungen zeigen
                </p>
              </div>
              <Switch id="show-documents" defaultChecked />
            </div>

            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label htmlFor="profile-analytics">Profil-Statistiken</Label>
                <p className="text-sm text-muted-foreground">
                  Erlaube uns, Statistiken über dein Profil zu sammeln
                </p>
              </div>
              <Switch id="profile-analytics" defaultChecked />
            </div>
          </CardContent>
        </Card>

        {/* Notification Settings */}
        <Card>
          <CardHeader>
            <div className="flex items-center space-x-2">
              <Bell className="h-5 w-5" />
              <CardTitle>Benachrichtigungen</CardTitle>
            </div>
            <CardDescription>
              Verwalte deine E-Mail-Benachrichtigungen
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label htmlFor="profile-views">Profil-Aufrufe</Label>
                <p className="text-sm text-muted-foreground">
                  Benachrichtigung bei neuen Profil-Ansichten
                </p>
              </div>
              <Switch id="profile-views" defaultChecked />
            </div>

            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label htmlFor="weekly-summary">Wöchentliche Zusammenfassung</Label>
                <p className="text-sm text-muted-foreground">
                  Wöchentlicher Bericht über deine Aktivitäten
                </p>
              </div>
              <Switch id="weekly-summary" defaultChecked />
            </div>

            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label htmlFor="marketplace-updates">Marketplace Updates</Label>
                <p className="text-sm text-muted-foreground">
                  Neuigkeiten und Updates zum Marketplace
                </p>
              </div>
              <Switch id="marketplace-updates" />
            </div>
          </CardContent>
        </Card>

        {/* Account Management */}
        <Card>
          <CardHeader>
            <div className="flex items-center space-x-2">
              <Trash2 className="h-5 w-5" />
              <CardTitle>Account-Verwaltung</CardTitle>
            </div>
            <CardDescription>
              Verwalte deine Account-Daten
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="space-y-4">
              <Button variant="outline" className="w-full">
                Daten exportieren
              </Button>
              <Button variant="outline" className="w-full">
                Account deaktivieren
              </Button>
              <Button variant="destructive" className="w-full">
                Account löschen
              </Button>
            </div>
            
            <div className="text-xs text-muted-foreground">
              <p>
                <strong>Hinweis:</strong> Inaktive Profile werden nach 6 Monaten automatisch gelöscht.
                Durch die Nutzung unserer Plattform stimmst du unseren AGB und Datenschutzbestimmungen zu.
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default Settings;