import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { useCompany } from "@/hooks/useCompany";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { 
  Settings as SettingsIcon, 
  Users, 
  Target, 
  CreditCard, 
  Bell,
  Plus,
  Trash2,
  Coins,
  Package
} from "lucide-react";

interface TeamMember {
  id: string;
  user_id: string;
  role: string;
  invited_at: string;
  accepted_at: string | null;
  // Would need profile data from join
}

interface CompanySettings {
  target_industries: string[];
  target_locations: string[];
  target_status: string[];
  notification_prefs: {
    email_matches: boolean;
    email_tokens: boolean;
    email_team: boolean;
  };
}

export default function CompanySettings() {
  const { company, updateCompany, loading } = useCompany();
  const [teamMembers, setTeamMembers] = useState<TeamMember[]>([]);
  const [settings, setSettings] = useState<CompanySettings>({
    target_industries: [],
    target_locations: [],
    target_status: ["azubi", "schueler", "ausgelernt"],
    notification_prefs: {
      email_matches: true,
      email_tokens: true,
      email_team: true,
    },
  });
  const [newMemberEmail, setNewMemberEmail] = useState("");
  const [saving, setSaving] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    if (company) {
      loadTeamMembers();
      loadCompanySettings();
    }
  }, [company]);

  const loadTeamMembers = async () => {
    if (!company) return;

    try {
      const { data, error } = await supabase
        .from('company_users')
        .select('*')
        .eq('company_id', company.id);

      if (error) throw error;
      setTeamMembers(data || []);
    } catch (error) {
      console.error('Error loading team members:', error);
    }
  };

  const loadCompanySettings = async () => {
    if (!company) return;

    try {
      const { data, error } = await supabase
        .from('company_settings')
        .select('*')
        .eq('company_id', company.id)
        .single();

      if (data) {
        setSettings({
          target_industries: data.target_industries || [],
          target_locations: data.target_locations || [],
          target_status: data.target_status || ["azubi", "schueler", "ausgelernt"],
          notification_prefs: data.notification_prefs || {
            email_matches: true,
            email_tokens: true,
            email_team: true,
          },
        });
      }
    } catch (error) {
      console.error('Error loading company settings:', error);
    }
  };

  const saveSettings = async () => {
    if (!company) return;

    setSaving(true);
    try {
      const { error } = await supabase
        .from('company_settings')
        .upsert({
          company_id: company.id,
          target_industries: settings.target_industries,
          target_locations: settings.target_locations,
          target_status: settings.target_status,
          notification_prefs: settings.notification_prefs,
        });

      if (error) throw error;
      toast({ title: "Einstellungen gespeichert" });
    } catch (error: any) {
      toast({ 
        title: "Fehler beim Speichern", 
        description: error.message,
        variant: "destructive" 
      });
    } finally {
      setSaving(false);
    }
  };

  const inviteTeamMember = async () => {
    if (!company || !newMemberEmail) return;

    try {
      // In a real app, you'd send an invitation email
      const { error } = await supabase
        .from('company_users')
        .insert({
          company_id: company.id,
          // user_id would be set when they accept the invitation
          role: 'viewer',
        });

      if (error) throw error;
      toast({ title: "Einladung versendet" });
      setNewMemberEmail("");
      loadTeamMembers();
    } catch (error: any) {
      toast({ 
        title: "Fehler beim Einladen", 
        description: error.message,
        variant: "destructive" 
      });
    }
  };

  const removeTeamMember = async (memberId: string) => {
    try {
      const { error } = await supabase
        .from('company_users')
        .delete()
        .eq('id', memberId);

      if (error) throw error;
      toast({ title: "Mitglied entfernt" });
      loadTeamMembers();
    } catch (error: any) {
      toast({ 
        title: "Fehler beim Entfernen", 
        description: error.message,
        variant: "destructive" 
      });
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-96">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold">Einstellungen</h1>
        <Button onClick={saveSettings} disabled={saving}>
          {saving ? "Speichern..." : "Änderungen speichern"}
        </Button>
      </div>

      <Tabs defaultValue="general" className="space-y-6">
        <TabsList className="grid w-full grid-cols-5">
          <TabsTrigger value="general">Allgemein</TabsTrigger>
          <TabsTrigger value="team">Team & Sitze</TabsTrigger>
          <TabsTrigger value="targeting">Zielgruppen</TabsTrigger>
          <TabsTrigger value="billing">Tokens & Abrechnung</TabsTrigger>
          <TabsTrigger value="notifications">Benachrichtigungen</TabsTrigger>
        </TabsList>

        <TabsContent value="general">
          <Card>
            <CardHeader>
              <CardTitle>Allgemeine Informationen</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="company_name">Unternehmensname</Label>
                  <Input
                    id="company_name"
                    value={company?.name || ""}
                    onChange={(e) => updateCompany({ name: e.target.value })}
                    placeholder="Unternehmensname"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="industry">Branche</Label>
                  <Input
                    id="industry"
                    value={company?.industry || ""}
                    onChange={(e) => updateCompany({ industry: e.target.value })}
                    placeholder="z.B. IT, Handwerk"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="description">Unternehmensbeschreibung</Label>
                <Input
                  id="description"
                  value={company?.description || ""}
                  onChange={(e) => updateCompany({ description: e.target.value })}
                  placeholder="Beschreiben Sie Ihr Unternehmen..."
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="website">Website</Label>
                  <Input
                    id="website"
                    value={company?.website_url || ""}
                    onChange={(e) => updateCompany({ website_url: e.target.value })}
                    placeholder="https://www.ihr-unternehmen.de"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="location">Hauptsitz</Label>
                  <Input
                    id="location"
                    value={company?.main_location || ""}
                    onChange={(e) => updateCompany({ main_location: e.target.value })}
                    placeholder="Stadt, Land"
                  />
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="team">
          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center justify-between">
                  <span className="flex items-center">
                    <Users className="h-5 w-5 mr-2" />
                    Team-Mitglieder ({teamMembers.length}/{company?.seats || 0})
                  </span>
                  <Badge variant="secondary">
                    {company?.seats || 0} Sitze verfügbar
                  </Badge>
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex space-x-2">
                  <Input
                    placeholder="E-Mail-Adresse des neuen Mitglieds"
                    value={newMemberEmail}
                    onChange={(e) => setNewMemberEmail(e.target.value)}
                  />
                  <Button onClick={inviteTeamMember} disabled={!newMemberEmail}>
                    <Plus className="h-4 w-4 mr-2" />
                    Einladen
                  </Button>
                </div>

                <div className="space-y-2">
                  {teamMembers.map((member) => (
                    <div key={member.id} className="flex items-center justify-between p-3 border rounded-lg">
                      <div className="flex items-center space-x-3">
                        <Avatar className="h-8 w-8">
                          <AvatarFallback>
                            {member.user_id?.charAt(0).toUpperCase()}
                          </AvatarFallback>
                        </Avatar>
                        <div>
                          <p className="font-medium">{member.user_id}</p>
                          <Badge variant="outline" className="text-xs">
                            {member.role}
                          </Badge>
                        </div>
                      </div>
                      <Button 
                        size="sm" 
                        variant="ghost"
                        onClick={() => removeTeamMember(member.id)}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  ))}
                  {teamMembers.length === 0 && (
                    <p className="text-muted-foreground text-center py-4">
                      Noch keine Team-Mitglieder eingeladen
                    </p>
                  )}
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="targeting">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <Target className="h-5 w-5 mr-2" />
                Zielgruppen-Einstellungen
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-4">
                <div>
                  <Label>Zielstatus</Label>
                  <div className="grid grid-cols-3 gap-2 mt-2">
                    {["azubi", "schueler", "ausgelernt"].map((status) => (
                      <label key={status} className="flex items-center space-x-2">
                        <input
                          type="checkbox"
                          checked={settings.target_status.includes(status)}
                          onChange={(e) => {
                            if (e.target.checked) {
                              setSettings(prev => ({
                                ...prev,
                                target_status: [...prev.target_status, status]
                              }));
                            } else {
                              setSettings(prev => ({
                                ...prev,
                                target_status: prev.target_status.filter(s => s !== status)
                              }));
                            }
                          }}
                        />
                        <span className="capitalize">{status}</span>
                      </label>
                    ))}
                  </div>
                </div>

                <div className="space-y-2">
                  <Label>Zielbranchen (kommagetrennt)</Label>
                  <Input
                    value={settings.target_industries.join(", ")}
                    onChange={(e) => setSettings(prev => ({
                      ...prev,
                      target_industries: e.target.value.split(",").map(s => s.trim()).filter(Boolean)
                    }))}
                    placeholder="IT, Handwerk, Einzelhandel"
                  />
                </div>

                <div className="space-y-2">
                  <Label>Zielregionen (kommagetrennt)</Label>
                  <Input
                    value={settings.target_locations.join(", ")}
                    onChange={(e) => setSettings(prev => ({
                      ...prev,
                      target_locations: e.target.value.split(",").map(s => s.trim()).filter(Boolean)
                    }))}
                    placeholder="Berlin, München, Hamburg"
                  />
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="billing">
          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Coins className="h-5 w-5 mr-2" />
                  Token-Übersicht
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 gap-4">
                  <div className="text-center p-4 border rounded-lg">
                    <div className="text-3xl font-bold text-accent">
                      {company?.active_tokens || 0}
                    </div>
                    <p className="text-sm text-muted-foreground">Verfügbare Tokens</p>
                  </div>
                  <div className="text-center p-4 border rounded-lg">
                    <div className="text-3xl font-bold">
                      {(company?.seats || 0) * 10}
                    </div>
                    <p className="text-sm text-muted-foreground">Tokens pro Monat</p>
                  </div>
                </div>

                <div className="mt-6 space-y-2">
                  <Button className="w-full">
                    <Package className="h-4 w-4 mr-2" />
                    Zusätzliche Tokens kaufen
                  </Button>
                  <Button variant="outline" className="w-full">
                    Plan upgraden
                  </Button>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <CreditCard className="h-5 w-5 mr-2" />
                  Abonnement
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <span>Plan:</span>
                    <span className="font-medium">{company?.plan_type || "Basic"}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Status:</span>
                    <Badge variant={company?.subscription_status === "active" ? "default" : "secondary"}>
                      {company?.subscription_status || "inactive"}
                    </Badge>
                  </div>
                  <div className="flex justify-between">
                    <span>Sitze:</span>
                    <span className="font-medium">{company?.seats || 0}</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="notifications">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <Bell className="h-5 w-5 mr-2" />
                Benachrichtigungseinstellungen
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-4">
                <label className="flex items-center justify-between">
                  <span>E-Mail bei neuen Matches</span>
                  <input
                    type="checkbox"
                    checked={settings.notification_prefs.email_matches}
                    onChange={(e) => setSettings(prev => ({
                      ...prev,
                      notification_prefs: {
                        ...prev.notification_prefs,
                        email_matches: e.target.checked
                      }
                    }))}
                  />
                </label>

                <label className="flex items-center justify-between">
                  <span>E-Mail bei niedrigem Token-Stand</span>
                  <input
                    type="checkbox"
                    checked={settings.notification_prefs.email_tokens}
                    onChange={(e) => setSettings(prev => ({
                      ...prev,
                      notification_prefs: {
                        ...prev.notification_prefs,
                        email_tokens: e.target.checked
                      }
                    }))}
                  />
                </label>

                <label className="flex items-center justify-between">
                  <span>E-Mail bei Team-Änderungen</span>
                  <input
                    type="checkbox"
                    checked={settings.notification_prefs.email_team}
                    onChange={(e) => setSettings(prev => ({
                      ...prev,
                      notification_prefs: {
                        ...prev.notification_prefs,
                        email_team: e.target.checked
                      }
                    }))}
                  />
                </label>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}