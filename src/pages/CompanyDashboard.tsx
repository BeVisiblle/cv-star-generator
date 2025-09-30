import React, { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Search, Users, Coins, Settings, Building2 } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

interface Profile {
  id: string;
  vorname: string;
  nachname: string;
  status: string;
  branche: string;
  ort: string;
  plz: string;
  avatar_url?: string;
  faehigkeiten: any;
  sprachen: any;
  driver_license_class?: string;
  has_drivers_license: boolean;
  geburtsdatum?: string;
}

interface Company {
  id: string;
  name: string;
  active_tokens: number;
  plan_type: string;
  subscription_status: string;
}

interface CompanyUser {
  role: string;
}

export default function CompanyDashboard() {
  const { user } = useAuth();
  const { toast } = useToast();
  const [profiles, setProfiles] = useState<Profile[]>([]);
  const [company, setCompany] = useState<Company | null>(null);
  const [companyUser, setCompanyUser] = useState<CompanyUser | null>(null);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('alle');
  const [brancheFilter, setBrancheFilter] = useState('alle');
  const [locationFilter, setLocationFilter] = useState('');

  useEffect(() => {
    if (user) {
      loadCompanyData();
    }
  }, [user]);

  const loadCompanyData = async () => {
    try {
      // Load company user data
      const { data: companyUserData, error: companyUserError } = await supabase
        .from('company_users')
        .select('*, companies(*)')
        .eq('user_id', user?.id)
        .single();

      if (companyUserError) {
        console.error('Error loading company user:', companyUserError);
        return;
      }

      setCompanyUser(companyUserData);
      setCompany(companyUserData.companies);

      // Load profiles based on company settings
      await loadProfiles();
    } catch (error) {
      console.error('Error loading company data:', error);
    } finally {
      setLoading(false);
    }
  };

  const loadProfiles = async () => {
    try {
      let query = supabase
        .from('profiles')
        .select('*')
        .eq('profile_published', true)
        .not('status', 'is', null);

      // Apply filters
      if (statusFilter !== 'alle') {
        query = query.eq('status', statusFilter);
      }

      if (brancheFilter !== 'alle') {
        query = query.eq('branche', brancheFilter);
      }

      if (locationFilter) {
        query = query.ilike('ort', `%${locationFilter}%`);
      }

      if (searchTerm) {
        query = query.or(
          `vorname.ilike.%${searchTerm}%,nachname.ilike.%${searchTerm}%,aktueller_beruf.ilike.%${searchTerm}%`
        );
      }

      const { data, error } = await query.limit(50);

      if (error) {
        console.error('Error loading profiles:', error);
        return;
      }

      setProfiles(data || []);
    } catch (error) {
      console.error('Error loading profiles:', error);
    }
  };

  const useToken = async (profileId: string) => {
    if (!company) return;

    try {
      const { data, error } = await supabase.rpc('use_token', { p_profile_id: profileId });
      if (error) {
        const msg = String(error.message || '').toUpperCase();
        if (msg.includes('ALREADY_USED')) {
          toast({ title: 'Bereits freigeschaltet', description: 'Sie haben bereits ein Token für dieses Profil verwendet.' });
        } else if (msg.includes('NO_TOKENS')) {
          toast({ title: 'Keine Token verfügbar', description: 'Sie haben keine aktiven Token mehr. Bitte upgraden Sie Ihr Abo.', variant: 'destructive' });
        } else if (msg.includes('NO_COMPANY')) {
          toast({ title: 'Kein Unternehmen', description: 'Sie sind keinem Unternehmen zugeordnet.', variant: 'destructive' });
        } else if (msg.includes('NO_CONSENT')) {
          toast({ title: 'Nicht freigegeben', description: 'Das Profil ist nicht veröffentlicht oder ohne Einwilligung.', variant: 'destructive' });
        } else {
          toast({ title: 'Fehler', description: 'Token konnte nicht verwendet werden.', variant: 'destructive' });
        }
        return;
      }

      const remaining = Array.isArray(data) ? (data[0] as any)?.remaining_tokens : (data as any)?.remaining_tokens;
      if (typeof remaining === 'number') {
        setCompany({ ...company, active_tokens: remaining });
      }

      toast({ title: 'Profil freigeschaltet', description: 'Sie können jetzt alle Details des Profils einsehen.' });
    } catch (error) {
      console.error('Error using token:', error);
      toast({ title: 'Fehler', description: 'Token konnte nicht verwendet werden.', variant: 'destructive' });
    }
  };

  useEffect(() => {
    loadProfiles();
  }, [searchTerm, statusFilter, brancheFilter, locationFilter]);

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">Lade Dashboard...</p>
        </div>
      </div>
    );
  }

  if (!company) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <Card className="w-full max-w-md">
          <CardHeader className="text-center">
            <Building2 className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
            <CardTitle>Kein Unternehmen gefunden</CardTitle>
            <CardDescription>
              Sie sind keinem Unternehmen zugeordnet. Kontaktieren Sie Ihren Administrator.
            </CardDescription>
          </CardHeader>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <div className="max-w-7xl mx-auto px-6 py-8">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-foreground">{company.name}</h1>
              <p className="text-muted-foreground">Unternehmens-Dashboard</p>
            </div>
            <div className="flex items-center gap-4">
              <Badge variant="secondary" className="flex items-center gap-2">
                <Coins className="h-4 w-4" />
                {company.active_tokens} Token
              </Badge>
              <Badge variant={company.subscription_status === 'active' ? 'default' : 'secondary'}>
                {company.plan_type}
              </Badge>
            </div>
          </div>
        </div>

        <Tabs defaultValue="profiles" className="space-y-6">
          <TabsList>
            <TabsTrigger value="profiles" className="flex items-center gap-2">
              <Users className="h-4 w-4" />
              Profile
            </TabsTrigger>
            <TabsTrigger value="settings" className="flex items-center gap-2">
              <Settings className="h-4 w-4" />
              Einstellungen
            </TabsTrigger>
          </TabsList>

          <TabsContent value="profiles">
            {/* Search and Filters */}
            <Card className="mb-6">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Search className="h-5 w-5" />
                  Profile suchen
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                  <Input
                    placeholder="Name oder Beruf suchen..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                  />
                  <Select value={statusFilter} onValueChange={setStatusFilter}>
                    <SelectTrigger>
                      <SelectValue placeholder="Status" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="alle">Alle Status</SelectItem>
                      <SelectItem value="schueler">Schüler</SelectItem>
                      <SelectItem value="azubi">Azubis</SelectItem>
                      <SelectItem value="ausgelernt">Ausgelernte</SelectItem>
                    </SelectContent>
                  </Select>
                  <Select value={brancheFilter} onValueChange={setBrancheFilter}>
                    <SelectTrigger>
                      <SelectValue placeholder="Branche" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="alle">Alle Branchen</SelectItem>
                      <SelectItem value="handwerk">Handwerk</SelectItem>
                      <SelectItem value="technik">Technik</SelectItem>
                      <SelectItem value="gastronomie">Gastronomie</SelectItem>
                      <SelectItem value="einzelhandel">Einzelhandel</SelectItem>
                    </SelectContent>
                  </Select>
                  <Input
                    placeholder="Ort..."
                    value={locationFilter}
                    onChange={(e) => setLocationFilter(e.target.value)}
                  />
                </div>
              </CardContent>
            </Card>

            {/* Profiles Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {profiles.map((profile) => (
                <Card key={profile.id} className="hover:shadow-lg transition-shadow">
                  <CardHeader>
                    <div className="flex items-center gap-3">
                      <Avatar>
                        <AvatarImage src={profile.avatar_url} />
                        <AvatarFallback>
                          {profile.vorname?.[0]}{profile.nachname?.[0]}
                        </AvatarFallback>
                      </Avatar>
                      <div>
                        <CardTitle className="text-lg">
                          {profile.vorname} {profile.nachname}
                        </CardTitle>
                        <div className="flex items-center gap-2">
                          <Badge variant="outline">
                            {profile.status === 'schueler' ? 'Schüler' :
                             profile.status === 'azubi' ? 'Azubi' :
                             profile.status === 'ausgelernt' ? 'Ausgelernt' : profile.status}
                          </Badge>
                          {profile.branche && (
                            <Badge variant="secondary">{profile.branche}</Badge>
                          )}
                        </div>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-3">
                      <div className="text-sm text-muted-foreground">
                        📍 {profile.ort} {profile.plz && `(${profile.plz})`}
                      </div>
                      
                      {profile.faehigkeiten && Array.isArray(profile.faehigkeiten) && profile.faehigkeiten.length > 0 && (
                        <div>
                          <p className="text-sm font-medium mb-2">Fähigkeiten:</p>
                          <div className="flex flex-wrap gap-1">
                            {profile.faehigkeiten.slice(0, 3).map((skill: any, index: number) => (
                              <Badge key={index} variant="outline" className="text-xs">
                                {skill.name}
                              </Badge>
                            ))}
                            {profile.faehigkeiten.length > 3 && (
                              <Badge variant="outline" className="text-xs">
                                +{profile.faehigkeiten.length - 3} weitere
                              </Badge>
                            )}
                          </div>
                        </div>
                      )}

                      {profile.has_drivers_license && (
                        <div className="flex items-center gap-2 text-sm">
                          <span>🚗 Führerschein</span>
                          {profile.driver_license_class && (
                            <Badge variant="outline" className="text-xs">
                              Klasse {profile.driver_license_class}
                            </Badge>
                          )}
                        </div>
                      )}

                      <Button 
                        onClick={() => useToken(profile.id)}
                        className="w-full"
                        disabled={company.active_tokens <= 0}
                      >
                        <Coins className="h-4 w-4 mr-2" />
                        Profil freischalten (1 Token)
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>

            {profiles.length === 0 && (
              <Card>
                <CardContent className="text-center py-12">
                  <Users className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
                  <p className="text-lg font-medium text-foreground mb-2">Keine Profile gefunden</p>
                  <p className="text-muted-foreground">
                    Passen Sie Ihre Suchkriterien an, um passende Kandidaten zu finden.
                  </p>
                </CardContent>
              </Card>
            )}
          </TabsContent>

          <TabsContent value="settings">
            <Card>
              <CardHeader>
                <CardTitle>Unternehmenseinstellungen</CardTitle>
                <CardDescription>
                  Verwalten Sie Ihre Suchkriterien und Präferenzen
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-6">
                  <div>
                    <h3 className="text-lg font-medium mb-4">Abo-Informationen</h3>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      <Card>
                        <CardContent className="pt-6">
                          <div className="text-center">
                            <Coins className="h-8 w-8 mx-auto mb-2 text-primary" />
                            <p className="text-2xl font-bold">{company.active_tokens}</p>
                            <p className="text-sm text-muted-foreground">Verfügbare Token</p>
                          </div>
                        </CardContent>
                      </Card>
                      <Card>
                        <CardContent className="pt-6">
                          <div className="text-center">
                            <Building2 className="h-8 w-8 mx-auto mb-2 text-primary" />
                            <p className="text-lg font-semibold capitalize">{company.plan_type}</p>
                            <p className="text-sm text-muted-foreground">Aktueller Plan</p>
                          </div>
                        </CardContent>
                      </Card>
                      <Card>
                        <CardContent className="pt-6">
                          <div className="text-center">
                            <div className={`h-8 w-8 mx-auto mb-2 rounded-full flex items-center justify-center ${
                              company.subscription_status === 'active' ? 'bg-green-100 text-green-600' : 'bg-gray-100 text-gray-600'
                            }`}>
                              ●
                            </div>
                            <p className="text-lg font-semibold capitalize">{company.subscription_status}</p>
                            <p className="text-sm text-muted-foreground">Status</p>
                          </div>
                        </CardContent>
                      </Card>
                    </div>
                  </div>

                  <div>
                    <h3 className="text-lg font-medium mb-4">Team-Verwaltung</h3>
                    <div className="text-sm text-muted-foreground">
                      Ihre Rolle: <Badge variant="outline" className="ml-2">{companyUser?.role}</Badge>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}