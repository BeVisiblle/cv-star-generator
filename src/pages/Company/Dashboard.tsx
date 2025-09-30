import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { useCompany } from "@/hooks/useCompany";
import { supabase } from "@/integrations/supabase/client";
import { 
  Users, 
  Coins, 
  Heart, 
  TrendingUp, 
  Search, 
  FileText, 
  Eye,
  Building2,
  Target,
  CreditCard
} from "lucide-react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { KpiCard } from "@/components/admin/KpiCard";
import { TopMatchedCandidates } from "@/components/dashboard/TopMatchedCandidates";
import { TokenManagementModal } from "@/components/company/dashboard/TokenManagementModal";
import { useToast } from "@/hooks/use-toast";

interface Profile {
  id: string;
  vorname: string;
  nachname: string;
  status: string;
  branche: string;
  ort: string;
  avatar_url?: string;
  headline?: string;
  faehigkeiten?: any;
}

interface DashboardStats {
  totalMatches: number;
  monthlyMatches: number;
  unlockedProfiles: number;
  followedProfiles: number;
}

export default function CompanyDashboard() {
  const { company, loading: companyLoading, refetch: refetchCompany } = useCompany();
  const [stats, setStats] = useState<DashboardStats>({
    totalMatches: 0,
    monthlyMatches: 0,
    unlockedProfiles: 0,
    followedProfiles: 0,
  });
  const [bestMatches, setBestMatches] = useState<Profile[]>([]);
  const [recentlyUnlocked, setRecentlyUnlocked] = useState<Profile[]>([]);
  const [recentlyViewed, setRecentlyViewed] = useState<Profile[]>([]);
  const [activeRecentTab, setActiveRecentTab] = useState<'unlocked' | 'viewed'>('unlocked');
  const [loading, setLoading] = useState(true);
  const [demoMode, setDemoMode] = useState(false);
  const [demoCompanyData, setDemoCompanyData] = useState<any>(null);
  const [showTokenModal, setShowTokenModal] = useState(false);
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { toast } = useToast();


  useEffect(() => {
    // Check for demo mode
    const isDemoMode = localStorage.getItem('demoMode') === 'true';
    const storedDemoData = localStorage.getItem('demoCompanyData');
    
    if (isDemoMode && storedDemoData) {
      setDemoMode(true);
      setDemoCompanyData(JSON.parse(storedDemoData));
      loadDemoData();
    } else if (company) {
      loadDashboardData();
    }
  }, [company]);

  useEffect(() => {
    // Check for success/token_success params
    const success = searchParams.get('success');
    const tokenSuccess = searchParams.get('token_success');
    
    if (success) {
      toast({
        title: "Plan erfolgreich aktiviert!",
        description: "Ihr neuer Plan ist jetzt aktiv.",
      });
      refetchCompany();
      // Remove success param from URL
      const newUrl = new URL(window.location.href);
      newUrl.searchParams.delete('success');
      window.history.replaceState({}, '', newUrl.toString());
    }
    
    if (tokenSuccess) {
      toast({
        title: "Credits erfolgreich gekauft!",
        description: "Ihre neuen Credits sind verfügbar.",
      });
      refetchCompany();
      // Remove token_success param from URL
      const newUrl = new URL(window.location.href);
      newUrl.searchParams.delete('token_success');
      window.history.replaceState({}, '', newUrl.toString());
    }
  }, [searchParams, refetchCompany, toast]);

  const loadDashboardData = async () => {
    if (!company) return;

    try {
      setLoading(true);

      // Load stats
      const [matchesData, unlockedData, followsData] = await Promise.all([
        supabase
          .from('matches')
          .select('*')
          .eq('company_id', company.id),
        supabase
          .from('tokens_used')
          .select('*')
          .eq('company_id', company.id),
        supabase
          .from('follows')
          .select('*')
          .eq('follower_id', company.id),
      ]);

      const now = new Date();
      const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);

      setStats({
        totalMatches: matchesData.data?.length || 0,
        monthlyMatches: matchesData.data?.filter(m => 
          new Date(m.created_at) >= startOfMonth
        ).length || 0,
        unlockedProfiles: unlockedData.data?.length || 0,
        followedProfiles: followsData.data?.length || 0,
      });

      // Load best matches (published profiles that match company's target criteria)
      const { data: profilesData } = await supabase
        .from('profiles')
        .select('*')
        .eq('profile_published', true)
        .limit(6);

      setBestMatches(profilesData || []);

      // Load recently unlocked profiles
      const { data: recentUnlocked } = await supabase
        .from('tokens_used')
        .select(`
          *,
          profiles (*)
        `)
        .eq('company_id', company.id)
        .order('used_at', { ascending: false })
        .limit(4);

      let unlockedProfilesList = recentUnlocked?.map(item => item.profiles).filter(Boolean) || [];

      // Fallback/merge from pipeline
      const { data: ccRows } = await supabase
        .from('company_candidates')
        .select('*, profiles(*)')
        .eq('company_id', company.id)
        .order('updated_at', { ascending: false })
        .limit(8);

      const fromPipeline = (ccRows || []).map((r: any) => r.profiles).filter(Boolean) as any[];
      const map = new Map<string, any>();
      [...unlockedProfilesList, ...fromPipeline].forEach((p: any) => { if (p && !map.has(p.id)) map.set(p.id, p); });
      unlockedProfilesList = Array.from(map.values()).slice(0, 4);

      setRecentlyUnlocked(unlockedProfilesList);

      // Load recently viewed profiles
      const { data: views } = await supabase
        .from('company_activity')
        .select('payload')
        .eq('company_id', company.id)
        .eq('type', 'profile_view')
        .order('created_at', { ascending: false })
        .limit(12);

      const ids = Array.from(new Set((views || []).map((v: any) => v.payload?.profile_id).filter(Boolean)));
      if (ids.length) {
        const { data: viewProfiles } = await supabase
          .from('profiles')
          .select('*')
          .in('id', ids)
          .limit(6);
        setRecentlyViewed(viewProfiles || []);
      } else {
        setRecentlyViewed([]);
      }

    } catch (error) {
      console.error('Error loading dashboard data:', error);
    } finally {
      setLoading(false);
    }
  };

  const loadDemoData = () => {
    // Set demo stats
    setStats({
      totalMatches: 12,
      monthlyMatches: 5,
      unlockedProfiles: 8,
      followedProfiles: 3,
    });

    // Set demo profiles
    setBestMatches([
      {
        id: '1',
        vorname: 'Max',
        nachname: 'Mustermann',
        status: 'Azubi',
        branche: 'Handwerk',
        ort: 'Frankfurt',
        headline: 'Motivierter Azubi Elektrotechnik'
      },
      {
        id: '2',
        vorname: 'Anna',
        nachname: 'Schmidt',
        status: 'Schüler',
        branche: 'IT',
        ort: 'München',
        headline: 'Interessiert an IT-Ausbildung'
      }
    ]);

    setLoading(false);
  };

  if (companyLoading || loading) {
    return (
      <div className="flex items-center justify-center min-h-96">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (!company && !demoMode) {
    return (
      <div className="text-center py-12">
        <Building2 className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
        <h2 className="text-xl font-semibold mb-2">Kein Unternehmen gefunden</h2>
        <p className="text-muted-foreground">
          Sie sind noch keinem Unternehmen zugeordnet.
        </p>
        <Button className="mt-4" onClick={() => navigate('/company/onboarding')}>
          Unternehmen registrieren
        </Button>
      </div>
    );
  }

  const displayCompany = demoMode ? demoCompanyData : company;
  const currentTokens = demoMode ? 50 : (company?.active_tokens ?? 0);

  const handleTokenBalanceUpdate = (balance: number) => {
    if (company) {
      // Update company state with new balance
      refetchCompany();
    }
  };

  return (
    <div className="p-3 md:p-6 min-h-screen bg-background max-w-full overflow-x-hidden space-y-6">
      {/* Demo Mode Banner */}
      {demoMode && (
        <div className="bg-yellow-100 border border-yellow-400 rounded-lg p-4">
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <svg className="h-5 w-5 text-yellow-400" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
              </svg>
            </div>
            <div className="ml-3">
              <p className="text-sm text-yellow-800">
                <strong>Demo-Modus aktiv:</strong> Dies ist eine Vorschau. Echte Registrierung folgt später.
              </p>
            </div>
            <div className="ml-auto">
              <Button 
                variant="ghost" 
                size="sm"
                onClick={() => {
                  localStorage.removeItem('demoMode');
                  localStorage.removeItem('demoCompanyData');
                  navigate('/company/onboarding');
                }}
              >
                Beenden
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* Welcome Section */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Willkommen zurück!</h1>
          <p className="text-muted-foreground">
            Hier ist eine Übersicht über {displayCompany.name}
          </p>
        </div>
        <div className="flex flex-wrap gap-2">
          <Button onClick={() => navigate('/company/needs')}>
            <Target className="h-4 w-4 mr-2" />
            Anforderungsprofile
          </Button>
          <Button variant="outline" onClick={() => navigate('/company/search')}>
            <Search className="h-4 w-4 mr-2" />
            Profile suchen
          </Button>
          <Button variant="outline" onClick={() => navigate('/company/posts')}>
            <FileText className="h-4 w-4 mr-2" />
            Beitrag erstellen
          </Button>
        </div>
      </div>

      {/* Top Matched Candidates */}
      {(company || demoMode) && (
        <div className="mb-6">
          <TopMatchedCandidates companyId={company?.id || 'demo'} />
        </div>
      )}

      {/* Low Credit Banner */}
      {currentTokens < 3 && (
        <Card className="border-orange-200 bg-orange-50">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 bg-orange-100 rounded-full flex items-center justify-center">
                  <CreditCard className="h-4 w-4 text-orange-600" />
                </div>
                <div>
                  <p className="font-medium text-orange-900">
                    {company?.plan_type === 'free' || !company?.plan_type 
                      ? "Ihre Credits sind aufgebraucht. Upgrade auf Starter, um weiter Profile freizuschalten."
                      : "Credits sind aufgebraucht. Jetzt Credits nachkaufen."
                    }
                  </p>
                </div>
              </div>
              <Button 
                size="sm" 
                className="bg-[hsl(var(--accent))] hover:bg-[hsl(var(--accent-hover))] text-white"
                onClick={() => setShowTokenModal(true)}
              >
                {company?.plan_type === 'free' || !company?.plan_type 
                  ? "Upgrade auf Starter" 
                  : "Credits verwalten"
                }
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Stats Overview */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <div onClick={() => setShowTokenModal(true)} className="cursor-pointer">
          <KpiCard 
            title="Tokens übrig" 
            value={currentTokens} 
            hint="3 Credits je vollständigem Profil (1 Profil + 2 Kontakt)"
          />
        </div>
        <KpiCard title="Matches (Monat)" value={stats.monthlyMatches} hint={`${stats.totalMatches} insgesamt`} />
        <KpiCard title="Freigeschaltet" value={stats.unlockedProfiles} hint="Profile angesehen" />
        <KpiCard title="Team Größe" value={demoMode ? 5 : (company?.seats ?? 0)} hint="aktive Mitglieder" />
      </div>

      {/* Recently Unlocked / Viewed */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <Eye className="h-5 w-5 mr-2" />
            Kürzlich
          </CardTitle>
          <div className="mt-2 flex gap-2">
            <Button size="sm" variant={activeRecentTab === 'unlocked' ? 'default' : 'outline'} onClick={() => setActiveRecentTab('unlocked')}>
              Freigeschaltet
            </Button>
            <Button size="sm" variant={activeRecentTab === 'viewed' ? 'default' : 'outline'} onClick={() => setActiveRecentTab('viewed')}>
              Angeschaut
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          {activeRecentTab === 'unlocked' ? (
            <div className="space-y-4">
              {recentlyUnlocked.length === 0 ? (
                <p className="text-muted-foreground text-center py-4">
                  Noch keine Profile freigeschaltet
                </p>
              ) : (
                recentlyUnlocked.map((profile) => (
                  <div key={profile.id} className="flex items-center space-x-3 p-3 border rounded-lg">
                    <Avatar className="h-10 w-10">
                      <AvatarImage src={profile.avatar_url || ""} />
                      <AvatarFallback>
                        {profile.vorname?.charAt(0)}{profile.nachname?.charAt(0)}
                      </AvatarFallback>
                    </Avatar>
                    <div className="flex-1">
                      <p className="font-medium">
                        {profile.vorname} {profile.nachname}
                      </p>
                      <p className="text-sm text-muted-foreground">
                        {profile.headline || profile.branche}
                      </p>
                    </div>
                    <Button size="sm" variant="ghost" onClick={() => navigate('/company/unlocked')}>
                      Anzeigen
                    </Button>
                  </div>
                ))
              )}
            </div>
          ) : (
            <div className="space-y-4">
              {recentlyViewed.length === 0 ? (
                <p className="text-muted-foreground text-center py-4">
                  Noch keine Profile angesehen
                </p>
              ) : (
                recentlyViewed.map((profile) => (
                  <div key={profile.id} className="flex items-center space-x-3 p-3 border rounded-lg">
                    <Avatar className="h-10 w-10">
                      <AvatarImage src={profile.avatar_url || ""} />
                      <AvatarFallback>
                        {profile.vorname?.charAt(0)}{profile.nachname?.charAt(0)}
                      </AvatarFallback>
                    </Avatar>
                    <div className="flex-1">
                      <p className="font-medium">
                        {profile.vorname} {profile.nachname}
                      </p>
                      <p className="text-sm text-muted-foreground">
                        {profile.headline || profile.branche}
                      </p>
                    </div>
                    <Button size="sm" variant="ghost" onClick={() => navigate(`/company/profile/${profile.id}`)}>
                      Öffnen
                    </Button>
                  </div>
                ))
              )}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Token Management Modal */}
      <TokenManagementModal 
        open={showTokenModal}
        onOpenChange={setShowTokenModal}
        currentBalance={currentTokens}
        onBalanceUpdate={handleTokenBalanceUpdate}
      />
    </div>
  );
}