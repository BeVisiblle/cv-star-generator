import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Checkbox } from "@/components/ui/checkbox";
import { useCompany } from "@/hooks/useCompany";
import { supabase } from "@/integrations/supabase/client";
import { Eye, Coins } from "lucide-react";
import { ProfileCard } from "@/components/Company/ProfileCard";
import { useAuth } from "@/hooks/useAuth";
import { SelectionBar } from "@/components/Company/SelectionBar";
import { useBulkStageUpdate, useExportCandidates } from "@/hooks/useUnlockedBulk";
import { toast } from "sonner";

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

  return (
    <div className="p-3 md:p-6 min-h-screen bg-background max-w-full overflow-x-hidden space-y-6">
      <div className="flex items-center justify-between mb-2">
        <h1 className="text-2xl sm:text-3xl font-bold">Freigeschaltete Kontakte</h1>
        <Badge variant="secondary" className="px-3 py-1">
          <Eye className="h-4 w-4 mr-1" /> {profiles.length}
        </Badge>
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
            profiles.length === 0 ? (
              <div className="text-center py-16 text-muted-foreground">
                Noch keine Profile freigeschaltet.
                <div className="mt-4">
                  <Button onClick={() => navigate('/company/search')}>
                    <Coins className="h-4 w-4 mr-2" /> Kandidaten suchen
                  </Button>
                </div>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {profiles.map((p) => (
                  <div key={p.id} className="relative">
                    <Checkbox
                      checked={selected.includes(p.id)}
                      onCheckedChange={() => toggleSelection(p.id)}
                      className="absolute left-3 top-3 z-10 bg-white shadow-sm"
                      aria-label={`${p.vorname} ${p.nachname} auswählen`}
                    />
                    <ProfileCard
                      profile={p}
                      isUnlocked={true}
                      matchPercentage={75}
                      onUnlock={() => {}}
                      onSave={() => {}}
                      onPreview={() => handlePreview(p)}
                    />
                  </div>
                ))}
              </div>
            )
          ) : (
            recentlyViewed.length === 0 ? (
              <div className="text-center py-16 text-muted-foreground">
                Noch keine Profile angesehen.
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {recentlyViewed.map((p) => (
                  <div key={p.id} className="relative">
                    <Checkbox
                      checked={selected.includes(p.id)}
                      onCheckedChange={() => toggleSelection(p.id)}
                      className="absolute left-3 top-3 z-10 bg-white shadow-sm"
                      aria-label={`${p.vorname} ${p.nachname} auswählen`}
                    />
                    <ProfileCard
                      profile={p}
                      isUnlocked={true}
                      matchPercentage={75}
                      onUnlock={() => {}}
                      onSave={() => {}}
                      onPreview={() => handlePreview(p)}
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
