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
import { ProfileCard } from "@/components/profile/ProfileCard";
import { UnlockProfileModal } from "@/components/Company/UnlockProfileModal";
import { FullProfileModal } from "@/components/Company/FullProfileModal";
import { useProfiles } from "@/hooks/useProfiles";
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
import { useAuth } from "@/hooks/useAuth";
import {
  Pagination,
  PaginationContent,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from "@/components/ui/pagination";

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
  job_search_preferences?: string[];
}

interface SearchFilters {
  keywords: string;
  targetGroup: string;
  location: string;
  radius: number;
  industry: string;
  availability: string;
  jobTitle: string;
  jobSearchType: string[];
}

const ITEMS_PER_PAGE = 20;

export default function CompanySearch() {
  const navigate = useNavigate();
  const { company, useToken, hasUsedToken } = useCompany();
  const { user } = useAuth();
  const [profiles, setProfiles] = useState<Profile[]>([]);
  const [loading, setLoading] = useState(false);
  const [unlockedProfiles, setUnlockedProfiles] = useState<Set<string>>(new Set());
  const [savedMatches, setSavedMatches] = useState<Profile[]>([]);
  const [selectedProfile, setSelectedProfile] = useState<Profile | null>(null);
  const [isUnlockModalOpen, setIsUnlockModalOpen] = useState(false);
  const [isFullProfileModalOpen, setIsFullProfileModalOpen] = useState(false);
  const [isUnlocking, setIsUnlocking] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [filters, setFilters] = useState<SearchFilters>({
    keywords: "",
    targetGroup: "",
    location: "",
    radius: 50,
    industry: "",
    availability: "",
    jobTitle: "",
    jobSearchType: [],
  });
  const [showAdvancedFilters, setShowAdvancedFilters] = useState(false);
  const [totalCount, setTotalCount] = useState(0);
  const [selectedNeedId, setSelectedNeedId] = useState<string | null>(null);
  const { toast } = useToast();

  useEffect(() => {
    loadProfiles();
  }, [company?.id, JSON.stringify(filters), currentPage, selectedNeedId]);
  
  useEffect(() => {
    if (company) {
      loadUnlockedProfiles();
      loadSavedMatches();
    }
  }, [company?.id]);

  useEffect(() => {
    // Reset to first page when filters or company change
    setCurrentPage(1);
  }, [JSON.stringify(filters), company?.id, selectedNeedId]);

  useEffect(() => {
    // Check for need parameter in URL
    const urlParams = new URLSearchParams(window.location.search);
    const needParam = urlParams.get('need');
    if (needParam) {
      setSelectedNeedId(needParam);
    }
  }, []);

  const loadProfiles = async () => {
    setLoading(true);
    try {
      if (!company) return;

      const from = (currentPage - 1) * ITEMS_PER_PAGE;
      const to = from + ITEMS_PER_PAGE - 1;

      // First get unlocked profile IDs
      const { data: unlockedData } = await supabase
        .from('tokens_used')
        .select('profile_id')
        .eq('company_id', company.id);

      const unlockedIds = unlockedData?.map(item => item.profile_id) || [];

      let query = supabase
        .from('profiles')
        .select('*', { count: 'exact' })
        .eq('profile_published', true);

      // Exclude already unlocked profiles
      if (unlockedIds.length > 0) {
        query = query.not('id', 'in', `(${unlockedIds.map(id => `"${id}"`).join(',')})`);
      }

      // Apply filters including need-based matching
      if (selectedNeedId) {
        // If a specific need is selected, get matches from need_matches table
        const { data: needMatches } = await supabase
          .from('need_matches')
          .select('candidate_id, score')
          .eq('need_id', selectedNeedId)
          .order('score', { ascending: false });
        
        if (needMatches && needMatches.length > 0) {
          const candidateIds = needMatches.map(m => m.candidate_id);
          query = query.in('id', candidateIds);
        } else {
          // No matches for this need, return empty results
          setProfiles([]);
          setTotalCount(0);
          return;
        }
      }
      
      // Apply other filters
      if (filters.targetGroup) {
        query = query.eq('status', filters.targetGroup);
      }
      if (filters.industry) {
        query = query.ilike('branche', `%${filters.industry}%`);
      }
      if (filters.location) {
        query = query.ilike('ort', `%${filters.location}%`);
      }
      if (filters.jobTitle) {
        query = query.or(`ausbildungsberuf.ilike.%${filters.jobTitle}%,aktueller_beruf.ilike.%${filters.jobTitle}%,headline.ilike.%${filters.jobTitle}%`);
      }
      if (filters.jobSearchType && filters.jobSearchType.length > 0) {
        const esc = (s: string) => s.replace(/"/g, '\\"');
        const jobSearchConditions = filters.jobSearchType.map(type => 
          `job_search_preferences.ov.{"${esc(type)}"}`
        ).join(',');
        query = query.or(jobSearchConditions);
      }
      if (filters.keywords) {
        query = query.or(`vorname.ilike.%${filters.keywords}%,nachname.ilike.%${filters.keywords}%,headline.ilike.%${filters.keywords}%`);
      }

      const { data, error, count } = await query
        .order('updated_at', { ascending: false })
        .range(from, to);

      if (error) throw error;
      setProfiles((data || []) as Profile[]);
      setTotalCount(count || 0);
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

  const handlePreviewProfile = async (profile: Profile) => {
    if (company && user) {
      try {
        await supabase.from('company_activity').insert({
          company_id: company.id,
          type: 'profile_view',
          actor_user_id: user.id,
          payload: { profile_id: profile.id }
        });
      } catch (e) {
        console.error('Failed to log profile view', e);
      }
    }
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
        // Add to pipeline in 'new' stage (but mark as unlocked)
        try {
          if (company) {
            const { data: existing } = await supabase
              .from('company_candidates')
              .select('id, stage')
              .eq('company_id', company.id)
              .eq('candidate_id', selectedProfile.id)
              .maybeSingle();

            if (existing) {
              // Only update if not already in a later stage
              const shouldUpdateStage = existing.stage === 'new' || !existing.stage;
              await supabase
                .from('company_candidates')
                .update({
                  ...(shouldUpdateStage && { stage: 'new' }),
                  unlocked_at: new Date().toISOString(),
                  unlocked_by_user_id: user?.id ?? null,
                  last_touched_at: new Date().toISOString(),
                })
                .eq('id', existing.id)
                .eq('company_id', company.id);
            } else {
              await supabase.from('company_candidates').insert({
                company_id: company.id,
                candidate_id: selectedProfile.id,
                stage: 'new',
                unlocked_at: new Date().toISOString(),
                unlocked_by_user_id: user?.id ?? null,
                owner_user_id: user?.id ?? null,
              });
            }
          }
        } catch (e) {
          console.error('Failed to add to pipeline', e);
        }

        setUnlockedProfiles(prev => new Set([...prev, selectedProfile.id]));
        toast({ title: "Profil erfolgreich freigeschaltet!" });

        // Ensure tokens_used row exists (fallback if RPC didn't create it)
        try {
          if (company) {
            const { data: existing } = await supabase
              .from('tokens_used')
              .select('id')
              .eq('company_id', company.id)
              .eq('profile_id', selectedProfile.id)
              .maybeSingle();
            if (!existing) {
              await supabase.from('tokens_used').insert({
                company_id: company.id,
                profile_id: selectedProfile.id,
                used_at: new Date().toISOString()
              });
            }
          }
        } catch (e) {
          console.warn('Konnte tokens_used Fallback nicht schreiben (optional):', e);
        }

        setIsUnlockModalOpen(false);
        const openedId = selectedProfile.id;
        setSelectedProfile(null);
        // Open profile immediately
        navigate(`/company/profile/${openedId}`);
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

  // Use profiles directly since filtering is done at database level
  const totalPages = Math.max(1, Math.ceil(totalCount / ITEMS_PER_PAGE));

  return (
    <div className="p-3 md:p-6 min-h-screen bg-background max-w-full overflow-x-hidden space-y-6">
      {/* LinkedIn-style Search Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-6 gap-3">
          <div>
            <h1 className="text-2xl sm:text-3xl font-bold">Kandidatensuche</h1>
            {selectedNeedId && (
              <p className="text-muted-foreground text-sm mt-1">Gefiltert nach Anforderungsprofil</p>
            )}
          </div>
          <div className="flex items-center space-x-2">
            {selectedNeedId && (
              <Button 
                variant="outline" 
                size="sm" 
                onClick={() => {
                  setSelectedNeedId(null);
                  const url = new URL(window.location.href);
                  url.searchParams.delete('need');
                  window.history.replaceState({}, '', url.toString());
                }}
              >
                Filter entfernen
              </Button>
            )}
            <Badge variant="secondary" className="px-3 py-1">
              <Coins className="h-4 w-4 mr-1" />
              {company?.active_tokens || 0} Tokens
            </Badge>
            <Badge variant="outline" className="px-3 py-1">
              {totalCount} Kandidaten
            </Badge>
          </div>
        </div>

      <SearchHeader 
        filters={filters}
        onFiltersChange={setFilters}
        resultsCount={totalCount}
        showAdvancedFilters={showAdvancedFilters}
        onToggleAdvancedFilters={() => setShowAdvancedFilters(!showAdvancedFilters)}
      />

      {/* Advanced Filters - Pipeline Style */}
      {showAdvancedFilters && (
        <Card className="mb-6">
          <CardHeader>
            <CardTitle className="flex items-center">
              <Filter className="h-5 w-5 mr-2" />
              Filter
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-6">
              {/* Art der Suche */}
              <div>
                <Label className="text-sm font-medium mb-3 block">Art der Suche</Label>
                <div className="flex flex-wrap gap-2">
                  {['Praktikum', 'Ausbildung', 'Nach der Ausbildung Job', 'Ausbildungsplatzwechsel'].map((type) => (
                    <Button
                      key={type}
                      variant={filters.jobSearchType.includes(type) ? "default" : "outline"}
                      size="sm"
                      onClick={() => {
                        const newTypes = filters.jobSearchType.includes(type)
                          ? filters.jobSearchType.filter(t => t !== type)
                          : [...filters.jobSearchType, type];
                        setFilters({ ...filters, jobSearchType: newTypes });
                      }}
                      className="h-8"
                    >
                      {type}
                    </Button>
                  ))}
                </div>
              </div>

              {/* Weitere Filter */}
              <div>
                <Label className="text-sm font-medium mb-3 block">Weitere Filter</Label>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="job-title">Jobtitel</Label>
                    <Input
                      id="job-title"
                      placeholder="z. B. Azubi im Handwerk"
                      value={filters.jobTitle}
                      onChange={(e) => updateFilter('jobTitle', e.target.value)}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="industry-detailed">Branche</Label>
                    <Input
                      id="industry-detailed"
                      placeholder="z. B. Bau, IT"
                      value={filters.industry}
                      onChange={(e) => updateFilter('industry', e.target.value)}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="location-detailed">Standort</Label>
                    <Input
                      id="location-detailed"
                      placeholder="z. B. Berlin"
                      value={filters.location}
                      onChange={(e) => updateFilter('location', e.target.value)}
                    />
                  </div>
                </div>
              </div>

              {/* Reset Button */}
              <div className="flex justify-end pt-4">
                <Button
                  variant="outline"
                  onClick={() => setFilters({
                    keywords: filters.keywords,
                    targetGroup: filters.targetGroup,
                    location: "",
                    radius: 50,
                    industry: "",
                    availability: "",
                    jobTitle: "",
                    jobSearchType: [],
                  })}
                >
                  Zurücksetzen
                </Button>
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
          <>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {profiles.map((profile) => {
                const unlocked = isProfileUnlocked(profile.id);
                const matchPercentage = calculateMatchPercentage(profile);
                
                return (
                  <ProfileCard
                    key={profile.id}
                    profile={{
                      id: profile.id,
                      name: profile.vorname, // Only first name for anonymity
                      avatar_url: null, // No avatar for anonymity
                      role: profile.branche,
                      city: profile.ort,
                      fs: true, // Default for search results
                      seeking: Array.isArray(profile.job_search_preferences) && profile.job_search_preferences.length > 0
                        ? profile.job_search_preferences.join(', ')
                        : undefined,
                      skills: Array.isArray(profile.faehigkeiten) ? profile.faehigkeiten : [],
                      match: matchPercentage,
                    }}
                    variant="search"
                    onUnlock={() => handleUnlockProfile(profile)}
                    onToggleFavorite={() => handleSaveMatch(profile)}
                  />
                );
              })}
            </div>
            
            {/* Pagination */}
            {totalPages > 1 && (
              <div className="mt-8 flex justify-center">
                <Pagination>
                  <PaginationContent>
                    <PaginationItem>
                      <PaginationPrevious 
                        onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
                        className={currentPage === 1 ? "pointer-events-none opacity-50" : "cursor-pointer"}
                      />
                    </PaginationItem>
                    
                    {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
                      <PaginationItem key={page}>
                        <PaginationLink
                          onClick={() => setCurrentPage(page)}
                          isActive={currentPage === page}
                          className="cursor-pointer"
                        >
                          {page}
                        </PaginationLink>
                      </PaginationItem>
                    ))}
                    
                    <PaginationItem>
                      <PaginationNext 
                        onClick={() => setCurrentPage(Math.min(totalPages, currentPage + 1))}
                        className={currentPage === totalPages ? "pointer-events-none opacity-50" : "cursor-pointer"}
                      />
                    </PaginationItem>
                  </PaginationContent>
                </Pagination>
              </div>
            )}
          </>
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