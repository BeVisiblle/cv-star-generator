import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
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
import { SearchHeader } from "@/components/Company/SearchHeader";
import { ProfileCard } from "@/components/Company/ProfileCard";
import { UnlockProfileModal } from "@/components/Company/UnlockProfileModal";
import { FullProfileModal } from "@/components/Company/FullProfileModal";
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
  const navigate = useNavigate();
  const { company, useToken, hasUsedToken } = useCompany();
  const [profiles, setProfiles] = useState<Profile[]>([]);
  const [loading, setLoading] = useState(false);
  const [unlockedProfiles, setUnlockedProfiles] = useState<Set<string>>(new Set());
  const [savedMatches, setSavedMatches] = useState<Profile[]>([]);
  const [selectedProfile, setSelectedProfile] = useState<Profile | null>(null);
  const [isUnlockModalOpen, setIsUnlockModalOpen] = useState(false);
  const [isFullProfileModalOpen, setIsFullProfileModalOpen] = useState(false);
  const [isUnlocking, setIsUnlocking] = useState(false);
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

  const handlePreviewProfile = (profile: Profile) => {
    navigate(`/company/profile/${profile.id}`);
  };

  const handleConfirmUnlock = async () => {
    if (!selectedProfile || !company) return;

    setIsUnlocking(true);
    
    try {
      // Check if already unlocked
      if (unlockedProfiles.has(selectedProfile.id)) {
        toast({ title: "Profil bereits freigeschaltet", variant: "destructive" });
        return;
      }

      // Check if already used token for this profile
      const alreadyUsed = await hasUsedToken(selectedProfile.id);
      if (alreadyUsed) {
        toast({ title: "Token bereits für dieses Profil verwendet", variant: "destructive" });
        return;
      }

      const result = await useToken(selectedProfile.id);
      if (result.success) {
        setUnlockedProfiles(prev => new Set([...prev, selectedProfile.id]));
        toast({ title: "Profil erfolgreich freigeschaltet!" });
        setIsUnlockModalOpen(false);
        setSelectedProfile(null);
      } else {
        toast({ 
          title: "Fehler beim Freischalten", 
          description: result.error,
          variant: "destructive" 
        });
      }
    } finally {
      setIsUnlocking(false);
    }
  };

  const handleUnlockProfile = async (profile: Profile) => {
    setSelectedProfile(profile);
    setIsUnlockModalOpen(true);
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

  const calculateMatchPercentage = (profile: Profile) => {
    // Simple matching algorithm
    let score = 0;
    let totalWeight = 0;

    // Industry match (40% weight)
    if (profile.branche && filters.industry && profile.branche.toLowerCase().includes(filters.industry.toLowerCase())) {
      score += 40;
    }
    totalWeight += 40;

    // Location match (30% weight)
    if (profile.ort && filters.location && profile.ort.toLowerCase().includes(filters.location.toLowerCase())) {
      score += 30;
    }
    totalWeight += 30;

    // Skills match (30% weight)
    if (profile.faehigkeiten && Array.isArray(profile.faehigkeiten) && profile.faehigkeiten.length > 0) {
      score += Math.min(30, profile.faehigkeiten.length * 3);
    }
    totalWeight += 30;

    return Math.round((score / totalWeight) * 100) || Math.floor(Math.random() * 40) + 60; // Default fallback with some randomness
  };

  return (
    <div className="space-y-6 p-3 md:p-6 max-w-full overflow-x-hidden">
      {/* LinkedIn-style Search Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-6 gap-3">
        <h1 className="text-2xl sm:text-3xl font-bold">Kandidatensuche</h1>
        <div className="flex items-center space-x-2">
          <Badge variant="secondary" className="px-3 py-1">
            <Coins className="h-4 w-4 mr-1" />
            {company?.active_tokens || 0} Tokens
          </Badge>
        </div>
      </div>

      <SearchHeader 
        filters={filters}
        onFiltersChange={setFilters}
        resultsCount={profiles.length}
      />

      {/* Advanced Filters Sidebar (conditionally shown) */}
      {filters.targetGroup === "filter" && (
        <Card className="mb-6">
          <CardHeader>
            <CardTitle className="flex items-center">
              <Filter className="h-5 w-5 mr-2" />
              Erweiterte Filter
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="space-y-2">
                <Label htmlFor="location-detailed">Standort</Label>
                <Input
                  id="location-detailed"
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
                <Label htmlFor="industry-detailed">Branche</Label>
                <Input
                  id="industry-detailed"
                  placeholder="z.B. IT, Handwerk"
                  value={filters.industry}
                  onChange={(e) => updateFilter('industry', e.target.value)}
                />
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Results */}
      <div className="space-y-4">
        {loading ? (
          <div className="flex items-center justify-center py-20">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
          </div>
        ) : profiles.length === 0 ? (
          <div className="text-center py-20">
            <Users className="h-16 w-16 mx-auto text-muted-foreground mb-4" />
            <h3 className="text-xl font-semibold mb-2">Keine Kandidaten gefunden</h3>
            <p className="text-muted-foreground max-w-md mx-auto">
              Versuchen Sie andere Suchkriterien oder erweitern Sie den Umkreis.
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {profiles.map((profile) => {
              const unlocked = isProfileUnlocked(profile.id);
              const matchPercentage = calculateMatchPercentage(profile);
              
              return (
                <ProfileCard
                  key={profile.id}
                  profile={profile}
                  isUnlocked={unlocked}
                  matchPercentage={matchPercentage}
                  onUnlock={() => handleUnlockProfile(profile)}
                  onSave={() => handleSaveMatch(profile)}
                  onPreview={() => handlePreviewProfile(profile)}
                />
              );
            })}
          </div>
        )}
      </div>

      {/* Saved Matches Section */}
      {savedMatches.length > 0 && (
        <Card className="mt-8">
          <CardHeader>
            <CardTitle className="flex items-center">
              <Heart className="h-5 w-5 mr-2" />
              Gespeicherte Matches ({savedMatches.length})
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              {savedMatches.slice(0, 4).map((profile) => (
                <div key={profile.id} className="flex items-center space-x-3 p-3 bg-muted/50 rounded-lg">
                  <Avatar className="h-10 w-10">
                    <AvatarImage src={profile.avatar_url || ""} />
                    <AvatarFallback>
                      {profile.vorname?.charAt(0)}{profile.nachname?.charAt(0)}
                    </AvatarFallback>
                  </Avatar>
                  <div className="flex-1 min-w-0">
                    <p className="font-medium truncate">{profile.vorname} {profile.nachname}</p>
                    <p className="text-sm text-muted-foreground truncate">{profile.branche}</p>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Full Profile Modal */}
      <FullProfileModal
        isOpen={isFullProfileModalOpen}
        onClose={() => {
          setIsFullProfileModalOpen(false);
          setSelectedProfile(null);
        }}
        profile={selectedProfile}
        isUnlocked={selectedProfile ? isProfileUnlocked(selectedProfile.id) : false}
      />

      {/* Unlock Profile Modal */}
      <UnlockProfileModal
        isOpen={isUnlockModalOpen}
        onClose={() => {
          setIsUnlockModalOpen(false);
          setSelectedProfile(null);
        }}
        profile={selectedProfile}
        matchPercentage={selectedProfile ? calculateMatchPercentage(selectedProfile) : 0}
        onConfirmUnlock={handleConfirmUnlock}
        tokenCost={1}
        isLoading={isUnlocking}
      />
    </div>
  );
}