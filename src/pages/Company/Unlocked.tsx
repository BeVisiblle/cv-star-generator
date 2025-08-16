import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Checkbox } from "@/components/ui/checkbox";
import { useCompany } from "@/hooks/useCompany";
import { supabase } from "@/integrations/supabase/client";
import { Eye, Coins } from "lucide-react";
import { useAuth } from "@/hooks/useAuth";
import { SelectionBar } from "@/components/Company/SelectionBar";
import { useBulkStageUpdate, useExportCandidates } from "@/hooks/useUnlockedBulk";
import { toast } from "sonner";
import { ProfileCard } from "@/components/profile/ProfileCard";
import { useEqualizeCards } from "@/components/unlocked/useEqualizeCards";
import { useProfiles } from "@/hooks/useProfiles";

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

export default function CompanyUnlocked() {
  const { company } = useCompany();
  const { user } = useAuth();
  const navigate = useNavigate();
  const [profiles, setProfiles] = useState<Profile[]>([]);
  const [recentlyViewed, setRecentlyViewed] = useState<Profile[]>([]);
  const [activeRecentTab, setActiveRecentTab] = useState<'unlocked' | 'viewed'>('unlocked');
  const [loading, setLoading] = useState(true);
  const [selected, setSelected] = useState<string[]>([]);
  const [search, setSearch] = useState("");
  const gridRef = useEqualizeCards();

  // Bulk operations hooks
  const bulkStage = useBulkStageUpdate(company?.id || '');
  const exporter = useExportCandidates(company?.id || '');

  useEffect(() => {
    if (!company) return;
    const load = async () => {
      setLoading(true);
      try {
        // Primary source: tokens_used
        const { data: tokenRows, error: tuErr } = await supabase
          .from('tokens_used')
          .select(`*, profiles (*)`)
          .eq('company_id', company.id)
          .order('used_at', { ascending: false });
        if (tuErr) throw tuErr;
        const fromTokens = (tokenRows || [])
          .map((row: any) => row.profiles)
          .filter(Boolean) as Profile[];

        // Fallback/merge: company_candidates
        const { data: ccRows } = await supabase
          .from('company_candidates')
          .select(`*, profiles (*)`)
          .eq('company_id', company.id)
          .order('updated_at', { ascending: false });
        const fromPipeline = (ccRows || [])
          .map((row: any) => row.profiles)
          .filter(Boolean) as Profile[];

        // Merge unique by id, tokens first
        const map = new Map<string, Profile>();
        [...fromTokens, ...fromPipeline].forEach((p) => {
          if (p && !map.has(p.id)) map.set(p.id, { ...p, plz: (p as any).plz ?? '' });
        });

        setProfiles(Array.from(map.values()));
      } catch (e) {
        console.error('Error loading unlocked profiles', e);
      } finally {
        setLoading(false);
      }
    };
    load();
  }, [company]);

  useEffect(() => {
    if (!company) return;
    const loadViews = async () => {
      try {
        const { data: views } = await supabase
          .from('company_activity')
          .select('payload')
          .eq('company_id', company.id)
          .eq('type', 'profile_view')
          .order('created_at', { ascending: false })
          .limit(24);
        const ids = Array.from(new Set((views || []).map((v: any) => v.payload?.profile_id).filter(Boolean)));
        if (ids.length) {
          const { data: viewProfiles } = await supabase
            .from('profiles')
            .select('*')
            .in('id', ids)
            .limit(12);
          setRecentlyViewed(viewProfiles || []);
        } else {
          setRecentlyViewed([]);
        }
      } catch (e) {
        console.error('Error loading recently viewed profiles', e);
      }
    };
    loadViews();
  }, [company]);
  const handlePreview = async (p: Profile) => {
    if (company && user) {
      try {
        await supabase.from('company_activity').insert({
          company_id: company.id,
          type: 'profile_view',
          actor_user_id: user.id,
          payload: { profile_id: p.id }
        });
      } catch (e) {
        console.error('Failed to log profile view', e);
      }
    }
    navigate(`/company/profile/${p.id}`);
  };

  // Selection handlers
  const toggleSelection = (profileId: string) => {
    setSelected(prev => 
      prev.includes(profileId) 
        ? prev.filter(id => id !== profileId)
        : [...prev, profileId]
    );
  };

  const clearSelection = () => setSelected([]);

  const handleBulkStage = async (stage: any) => {
    if (!selected.length) return;
    try {
      await bulkStage.mutateAsync({ profileIds: selected, stage });
      clearSelection();
    } catch (error) {
      console.error('Bulk stage update failed:', error);
    }
  };

  const handleExportCsv = async () => {
    if (!selected.length) return;
    try {
      const url = await exporter.export("csv", selected);
      window.open(url, "_blank");
      clearSelection();
    } catch (error) {
      console.error('CSV export failed:', error);
    }
  };

  const handleExportXlsx = async () => {
    if (!selected.length) return;
    try {
      const url = await exporter.export("xlsx", selected);
      window.open(url, "_blank");
      clearSelection();
    } catch (error) {
      console.error('Excel export failed:', error);
    }
  };

  // Filter profiles based on search
  const filteredProfiles = profiles.filter(p =>
    `${p.vorname} ${p.nachname}`.toLowerCase().includes(search.toLowerCase()) ||
    p.ort?.toLowerCase().includes(search.toLowerCase()) ||
    p.branche?.toLowerCase().includes(search.toLowerCase())
  );

  const filteredRecentlyViewed = recentlyViewed.filter(p =>
    `${p.vorname} ${p.nachname}`.toLowerCase().includes(search.toLowerCase()) ||
    p.ort?.toLowerCase().includes(search.toLowerCase()) ||
    p.branche?.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="mx-auto max-w-[1200px] p-4 md:p-6">
      {/* Header */}
      <div className="mb-4 flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <h1 className="text-2xl font-bold">Freigeschaltete Azubis</h1>
        <div className="flex items-center gap-2">
          <Input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Suche nach Name, Ort, Branche..."
            className="w-72"
          />
          <Badge variant="secondary" className="px-3 py-1">
            <Eye className="h-4 w-4 mr-1" /> {activeRecentTab === 'unlocked' ? filteredProfiles.length : filteredRecentlyViewed.length}
          </Badge>
        </div>
      </div>

      {/* Selection Bar */}
      {selected.length > 0 && (
        <SelectionBar
          count={selected.length}
          onClear={clearSelection}
          onBulkStage={handleBulkStage}
          onExportCsv={handleExportCsv}
          onExportXlsx={handleExportXlsx}
          busy={bulkStage.isPending || exporter.isPending}
        />
      )}

      <Card>
        <CardHeader>
          <CardTitle>Kürzlich</CardTitle>
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
          {loading ? (
            <div className="flex items-center justify-center py-16">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
            </div>
          ) : activeRecentTab === 'unlocked' ? (
            filteredProfiles.length === 0 ? (
              <div className="text-center py-16 text-muted-foreground">
                {search ? "Keine Treffer für deine Suche." : "Noch keine Profile freigeschaltet."}
                <div className="mt-4">
                  <Button onClick={() => navigate('/company/search')}>
                    <Coins className="h-4 w-4 mr-2" /> Kandidaten suchen
                  </Button>
                </div>
              </div>
            ) : (
              <div ref={gridRef} className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {filteredProfiles.map((p) => (
                  <div key={p.id} className="relative">
                    <Checkbox
                      checked={selected.includes(p.id)}
                      onCheckedChange={() => toggleSelection(p.id)}
                      className="absolute left-3 top-3 z-10 bg-white shadow-sm"
                      aria-label={`${p.vorname} ${p.nachname} auswählen`}
                    />
                     <ProfileCard
                       profile={{
                         id: p.id,
                         name: `${p.vorname} ${p.nachname}`.trim(),
                         avatar_url: p.avatar_url || null,
                         role: p.branche,
                         city: p.ort,
                         fs: (p as any).has_drivers_license || false,
                         seeking: (p as any).job_search_preferences ? (Array.isArray((p as any).job_search_preferences) ? (p as any).job_search_preferences.join(', ') : (p as any).job_search_preferences) : null,
                         status: p.status,
                         email: p.email || null,
                         phone: p.telefon || null,
                         skills: p.faehigkeiten ? (Array.isArray(p.faehigkeiten) ? p.faehigkeiten : []) : [],
                         match: 75,
                       }}
                       variant="unlocked"
                       onView={() => handlePreview(p)}
                       onDownload={() => {
                         if (p.cv_url) {
                           window.open(p.cv_url, '_blank');
                         } else {
                           toast.error('Kein CV verfügbar');
                         }
                       }}
                       onToggleFavorite={() => {
                         toast.success('Favorit-Funktion wird bald verfügbar sein');
                       }}
                     />
                  </div>
                ))}
              </div>
            )
          ) : (
            filteredRecentlyViewed.length === 0 ? (
              <div className="text-center py-16 text-muted-foreground">
                {search ? "Keine Treffer für deine Suche." : "Noch keine Profile angesehen."}
              </div>
            ) : (
              <div ref={gridRef} className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {filteredRecentlyViewed.map((p) => (
                  <div key={p.id} className="relative">
                    <Checkbox
                      checked={selected.includes(p.id)}
                      onCheckedChange={() => toggleSelection(p.id)}
                      className="absolute left-3 top-3 z-10 bg-white shadow-sm"
                      aria-label={`${p.vorname} ${p.nachname} auswählen`}
                    />
                     <ProfileCard
                       profile={{
                         id: p.id,
                         name: `${p.vorname} ${p.nachname}`.trim(),
                         avatar_url: p.avatar_url || null,
                         role: p.branche,
                         city: p.ort,
                         fs: (p as any).has_drivers_license || false,
                         seeking: (p as any).job_search_preferences ? (Array.isArray((p as any).job_search_preferences) ? (p as any).job_search_preferences.join(', ') : (p as any).job_search_preferences) : null,
                         status: p.status,
                         email: p.email || null,
                         phone: p.telefon || null,
                         skills: p.faehigkeiten ? (Array.isArray(p.faehigkeiten) ? p.faehigkeiten : []) : [],
                         match: 75,
                       }}
                       variant="unlocked"
                       onView={() => handlePreview(p)}
                       onDownload={() => {
                         if (p.cv_url) {
                           window.open(p.cv_url, '_blank');
                         } else {
                           toast.error('Kein CV verfügbar');
                         }
                       }}
                       onToggleFavorite={() => {
                         toast.success('Favorit-Funktion wird bald verfügbar sein');
                       }}
                     />
                  </div>
                ))}
              </div>
            )
          )}
        </CardContent>
      </Card>
    </div>
  );
}
