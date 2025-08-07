import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Slider } from "@/components/ui/slider";
import { useCompany } from "@/hooks/useCompany";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { 
  Search as SearchIcon, 
  Filter, 
  MapPin, 
  Briefcase, 
  Coins, 
  Heart,
  Eye,
  Download,
  Phone,
  Mail,
  Users
} from "lucide-react";

interface Profile {
  id: string;
  vorname: string;
  nachname: string;
  status: string;
  branche: string;
  ort: string;
  plz: string;
  avatar_url?: string;
  headline?: string;
  faehigkeiten?: any;
  email?: string;
  telefon?: string;
  cv_url?: string;
}

interface SearchFilters {
  keywords: string;
  targetGroup: string;
  location: string;
  radius: number;
  industry: string;
  availability: string;
}

export default function CompanySearch() {
  const { company, useToken, hasUsedToken } = useCompany();
  const [profiles, setProfiles] = useState<Profile[]>([]);
  const [loading, setLoading] = useState(false);
  const [unlockedProfiles, setUnlockedProfiles] = useState<Set<string>>(new Set());
  const [savedMatches, setSavedMatches] = useState<Profile[]>([]);
  const [filters, setFilters] = useState<SearchFilters>({
    keywords: "",
    targetGroup: "",
    location: "",
    radius: 50,
    industry: "",
    availability: "",
  });
  const { toast } = useToast();

  useEffect(() => {
    loadProfiles();
    loadUnlockedProfiles();
    loadSavedMatches();
  }, [company, filters]);

  const loadProfiles = async () => {
    setLoading(true);
    try {
      let query = supabase
        .from('profiles')
        .select('*')
        .eq('profile_published', true);

      // Apply filters
      if (filters.targetGroup) {
        query = query.eq('status', filters.targetGroup);
      }
      if (filters.industry) {
        query = query.ilike('branche', `%${filters.industry}%`);
      }
      if (filters.location) {
        query = query.ilike('ort', `%${filters.location}%`);
      }
      if (filters.keywords) {
        query = query.or(`vorname.ilike.%${filters.keywords}%,nachname.ilike.%${filters.keywords}%,headline.ilike.%${filters.keywords}%`);
      }

      const { data, error } = await query.limit(20);

      if (error) throw error;
      setProfiles((data || []) as Profile[]);
    } catch (error) {
      console.error('Error loading profiles:', error);
      toast({ title: "Fehler beim Laden der Profile", variant: "destructive" });
    } finally {
      setLoading(false);
    }
  };

  const loadUnlockedProfiles = async () => {
    if (!company) return;

    try {
      const { data } = await supabase
        .from('tokens_used')
        .select('profile_id')
        .eq('company_id', company.id);

      setUnlockedProfiles(new Set(data?.map(item => item.profile_id) || []));
    } catch (error) {
      console.error('Error loading unlocked profiles:', error);
    }
  };

  const loadSavedMatches = async () => {
    if (!company) return;

    try {
      const { data } = await supabase
        .from('matches')
        .select(`
          *,
          profiles (*)
        `)
        .eq('company_id', company.id)
        .eq('status', 'saved');

      setSavedMatches((data?.map(item => item.profiles).filter(Boolean) || []) as Profile[]);
    } catch (error) {
      console.error('Error loading saved matches:', error);
    }
  };

  const handleUnlockProfile = async (profileId: string) => {
    if (!company) return;

    // Check if already unlocked
    if (unlockedProfiles.has(profileId)) {
      toast({ title: "Profil bereits freigeschaltet", variant: "destructive" });
      return;
    }

    // Check if already used token for this profile
    const alreadyUsed = await hasUsedToken(profileId);
    if (alreadyUsed) {
      toast({ title: "Token bereits für dieses Profil verwendet", variant: "destructive" });
      return;
    }

    const result = await useToken(profileId);
    if (result.success) {
      setUnlockedProfiles(prev => new Set([...prev, profileId]));
      toast({ title: "Profil erfolgreich freigeschaltet!" });
    } else {
      toast({ 
        title: "Fehler beim Freischalten", 
        description: result.error,
        variant: "destructive" 
      });
    }
  };

  const handleSaveMatch = async (profile: Profile) => {
    if (!company) return;

    try {
      const { error } = await supabase
        .from('matches')
        .insert({
          company_id: company.id,
          profile_id: profile.id,
          status: 'saved',
        });

      if (error) throw error;
      setSavedMatches(prev => [...prev, profile]);
      toast({ title: "Profil gespeichert" });
    } catch (error) {
      console.error('Error saving match:', error);
      toast({ title: "Fehler beim Speichern", variant: "destructive" });
    }
  };

  const updateFilter = (key: keyof SearchFilters, value: any) => {
    setFilters(prev => ({ ...prev, [key]: value }));
  };

  const isProfileUnlocked = (profileId: string) => unlockedProfiles.has(profileId);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold">Kandidatensuche</h1>
        <div className="flex items-center space-x-2">
          <Badge variant="secondary">
            <Coins className="h-4 w-4 mr-1" />
            {company?.active_tokens || 0} Tokens
          </Badge>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        {/* Sidebar with Filters */}
        <div className="lg:col-span-1 space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <Filter className="h-5 w-5 mr-2" />
                Filter
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="keywords">Suchbegriff</Label>
                <Input
                  id="keywords"
                  placeholder="Name, Fähigkeiten..."
                  value={filters.keywords}
                  onChange={(e) => updateFilter('keywords', e.target.value)}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="targetGroup">Zielgruppe</Label>
                <Select value={filters.targetGroup} onValueChange={(value) => updateFilter('targetGroup', value)}>
                  <SelectTrigger>
                    <SelectValue placeholder="Alle" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="">Alle</SelectItem>
                    <SelectItem value="azubi">Azubis</SelectItem>
                    <SelectItem value="schueler">Schüler:innen</SelectItem>
                    <SelectItem value="ausgelernt">Gesellen</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="location">Standort</Label>
                <Input
                  id="location"
                  placeholder="Stadt oder PLZ"
                  value={filters.location}
                  onChange={(e) => updateFilter('location', e.target.value)}
                />
              </div>

              <div className="space-y-2">
                <Label>Umkreis: {filters.radius}km</Label>
                <Slider
                  value={[filters.radius]}
                  onValueChange={(value) => updateFilter('radius', value[0])}
                  max={200}
                  min={10}
                  step={10}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="industry">Branche</Label>
                <Input
                  id="industry"
                  placeholder="z.B. IT, Handwerk"
                  value={filters.industry}
                  onChange={(e) => updateFilter('industry', e.target.value)}
                />
              </div>

              <Button variant="outline" className="w-full" onClick={() => setFilters({
                keywords: "",
                targetGroup: "",
                location: "",
                radius: 50,
                industry: "",
                availability: "",
              })}>
                Filter zurücksetzen
              </Button>
            </CardContent>
          </Card>

          {/* Saved Matches */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <Heart className="h-5 w-5 mr-2" />
                Gespeicherte Matches ({savedMatches.length})
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                {savedMatches.slice(0, 3).map((profile) => (
                  <div key={profile.id} className="flex items-center space-x-2 text-sm">
                    <Avatar className="h-6 w-6">
                      <AvatarImage src={profile.avatar_url || ""} />
                      <AvatarFallback className="text-xs">
                        {profile.vorname?.charAt(0)}{profile.nachname?.charAt(0)}
                      </AvatarFallback>
                    </Avatar>
                    <span className="truncate">{profile.vorname} {profile.nachname}</span>
                  </div>
                ))}
                {savedMatches.length === 0 && (
                  <p className="text-muted-foreground text-sm">Noch keine gespeicherten Matches</p>
                )}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Main Content */}
        <div className="lg:col-span-3">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center justify-between">
                <span className="flex items-center">
                  <SearchIcon className="h-5 w-5 mr-2" />
                  Suchergebnisse ({profiles.length})
                </span>
                <Button onClick={loadProfiles} disabled={loading}>
                  {loading ? "Lädt..." : "Aktualisieren"}
                </Button>
              </CardTitle>
            </CardHeader>
            <CardContent>
              {loading ? (
                <div className="flex items-center justify-center py-12">
                  <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
                </div>
              ) : profiles.length === 0 ? (
                <div className="text-center py-12">
                  <Users className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                  <h3 className="text-lg font-semibold mb-2">Keine Profile gefunden</h3>
                  <p className="text-muted-foreground">
                    Versuchen Sie andere Suchkriterien oder erweitern Sie den Umkreis.
                  </p>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {profiles.map((profile) => {
                    const unlocked = isProfileUnlocked(profile.id);
                    
                    return (
                      <Card key={profile.id} className="relative">
                        <CardHeader className="pb-3">
                          <div className="flex items-start space-x-3">
                            <Avatar className="h-12 w-12">
                              <AvatarImage src={profile.avatar_url || ""} />
                              <AvatarFallback>
                                {profile.vorname?.charAt(0)}{profile.nachname?.charAt(0)}
                              </AvatarFallback>
                            </Avatar>
                            <div className="flex-1">
                              <h3 className="font-semibold">
                                {unlocked ? `${profile.vorname} ${profile.nachname}` : `${profile.vorname} ${profile.nachname?.charAt(0)}.`}
                              </h3>
                              <p className="text-sm text-muted-foreground">
                                {profile.headline || profile.branche}
                              </p>
                              <div className="flex items-center space-x-2 mt-1">
                                <Badge variant="secondary" className="text-xs">
                                  {profile.status}
                                </Badge>
                                <span className="text-xs text-muted-foreground flex items-center">
                                  <MapPin className="h-3 w-3 mr-1" />
                                  {profile.ort}
                                </span>
                              </div>
                            </div>
                          </div>
                        </CardHeader>
                        
                        <CardContent className="pt-0">
                          {profile.faehigkeiten && Array.isArray(profile.faehigkeiten) && profile.faehigkeiten.length > 0 && (
                            <div className="mb-3">
                              <div className="flex flex-wrap gap-1">
                                {profile.faehigkeiten.slice(0, 3).map((skill: any, index: number) => (
                                  <Badge key={index} variant="outline" className="text-xs">
                                    {skill.name || skill}
                                  </Badge>
                                ))}
                                {profile.faehigkeiten.length > 3 && (
                                  <Badge variant="outline" className="text-xs">
                                    +{profile.faehigkeiten.length - 3}
                                  </Badge>
                                )}
                              </div>
                            </div>
                          )}

                          <div className="flex items-center justify-between">
                            {unlocked ? (
                              <div className="flex space-x-2">
                                <Button size="sm" variant="outline">
                                  <Phone className="h-4 w-4 mr-1" />
                                  Kontakt
                                </Button>
                                <Button size="sm" variant="outline">
                                  <Download className="h-4 w-4 mr-1" />
                                  CV
                                </Button>
                                <Button 
                                  size="sm" 
                                  variant="ghost"
                                  onClick={() => handleSaveMatch(profile)}
                                >
                                  <Heart className="h-4 w-4" />
                                </Button>
                              </div>
                            ) : (
                              <div className="flex items-center space-x-2">
                                <Button 
                                  size="sm"
                                  onClick={() => handleUnlockProfile(profile.id)}
                                  className="relative"
                                >
                                  <Coins className="h-4 w-4 mr-1" />
                                  Freischalten (1 Token)
                                </Button>
                                <Button 
                                  size="sm" 
                                  variant="ghost"
                                  onClick={() => handleSaveMatch(profile)}
                                >
                                  <Heart className="h-4 w-4" />
                                </Button>
                              </div>
                            )}
                          </div>

                          {unlocked && (
                            <div className="mt-3 pt-3 border-t text-sm space-y-1">
                              {profile.email && (
                                <div className="flex items-center">
                                  <Mail className="h-4 w-4 mr-2 text-muted-foreground" />
                                  <span>{profile.email}</span>
                                </div>
                              )}
                              {profile.telefon && (
                                <div className="flex items-center">
                                  <Phone className="h-4 w-4 mr-2 text-muted-foreground" />
                                  <span>{profile.telefon}</span>
                                </div>
                              )}
                            </div>
                          )}
                        </CardContent>
                      </Card>
                    );
                  })}
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}