import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

export interface CompanyNeed {
  id: string;
  company_id: string;
  name: string;
  profession_id?: string;
  employment_type: string;
  radius_km: number;
  start_date?: string;
  seniority?: string;
  visibility: 'active' | 'paused' | 'archived';
  created_at: string;
  updated_at: string;
  location_city?: string;
  must_skills_count?: number;
  nice_skills_count?: number;
  target_groups?: string[];
}

export interface CompanyNeedQuota {
  company_id: string;
  included_needs: number;
  need_credits: number;
  used_needs: number;
  remaining_needs: number;
}

export interface TopMatch {
  id: string;
  name: string;
  vorname: string;
  nachname: string;
  avatar_url?: string;
  headline?: string;
  ort?: string;
  city?: string;
  skills?: string[];
  seeking?: string;
  fs?: string;
  role?: string;
  match_score: number;
  match_breakdown?: any;
}

export interface Package {
  id: string;
  code: string;
  name: string;
  monthly_price_cents: number;
  included_needs: number;
  extra_need_price_cents: number;
  active: boolean;
}

export function useCompanyNeeds(companyId?: string) {
  const [needs, setNeeds] = useState<CompanyNeed[]>([]);
  const [quota, setQuota] = useState<CompanyNeedQuota | null>(null);
  const [packages, setPackages] = useState<Package[]>([]);
  const [topMatches, setTopMatches] = useState<Record<string, TopMatch[]>>({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { toast } = useToast();

  const loadNeeds = async () => {
    if (!companyId) return;

    try {
      setLoading(true);
      setError(null);

      // Load company needs
      const { data: needsData, error: needsError } = await supabase
        .from('company_needs')
        .select(`
          *,
          need_skills!inner(skill, type),
          need_target_groups!inner(target_group)
        `)
        .eq('company_id', companyId)
        .order('created_at', { ascending: false });

      if (needsError) throw needsError;

      // Process needs data
      const processedNeeds = (needsData || []).map((need: any) => ({
        ...need,
        must_skills_count: need.need_skills?.filter((s: any) => s.type === 'must').length || 0,
        nice_skills_count: need.need_skills?.filter((s: any) => s.type === 'nice').length || 0,
        target_groups: need.need_target_groups?.map((tg: any) => tg.target_group) || []
      }));

      setNeeds(processedNeeds);

      // Load quota
      const { data: quotaData, error: quotaError } = await supabase
        .rpc('get_company_need_quota', { p_company_id: companyId });

      if (quotaError) {
        console.error('Quota error:', quotaError);
      } else if (quotaData && quotaData.length > 0) {
        setQuota(quotaData[0]);
      }

      // Load top matches for active needs
      const activeNeeds = processedNeeds.filter((need: CompanyNeed) => need.visibility === 'active');
      const matchesPromises = activeNeeds.slice(0, 5).map(async (need: CompanyNeed) => {
        try {
          const { data: matchesData } = await supabase
            .rpc('get_matches_for_need', { p_need_id: need.id, p_limit: 4 });

          if (matchesData && matchesData.length > 0) {
            const candidateIds = matchesData.map((m: any) => m.candidate_id);
            
            const { data: profilesData } = await supabase
              .from('profiles')
              .select('id, vorname, nachname, avatar_url, headline, ort')
              .in('id', candidateIds);

            if (profilesData) {
              const matches = profilesData.map(profile => {
                const match = matchesData.find((m: any) => m.candidate_id === profile.id);
                return {
                  ...profile,
                  name: `${profile.vorname} ${profile.nachname}`,
                  city: profile.ort,
                  skills: [],
                  seeking: profile.headline || '',
                  fs: null,
                  role: profile.headline || '',
                  match_score: match?.score || 0,
                  match_breakdown: match?.breakdown || {}
                };
              });
              return { needId: need.id, matches };
            }
          }
          return { needId: need.id, matches: [] };
        } catch (error) {
          console.error(`Error loading matches for need ${need.id}:`, error);
          return { needId: need.id, matches: [] };
        }
      });

      const matchesResults = await Promise.all(matchesPromises);
      const matchesMap = matchesResults.reduce((acc, result) => {
        acc[result.needId] = result.matches;
        return acc;
      }, {} as Record<string, TopMatch[]>);

      setTopMatches(matchesMap);

    } catch (err: any) {
      console.error('Error loading needs:', err);
      setError(err.message || 'Failed to load needs');
    } finally {
      setLoading(false);
    }
  };

  const loadPackages = async () => {
    try {
      const { data, error } = await supabase
        .from('company_packages')
        .select('*')
        .eq('active', true)
        .order('monthly_price_cents');

      if (error) throw error;
      setPackages(data || []);
    } catch (err: any) {
      console.error('Error loading packages:', err);
    }
  };

  const createNeed = async (needData: any) => {
    try {
      const { data, error } = await supabase.functions.invoke('create-need', {
        body: needData
      });

      if (error) throw error;

      if (data.error) {
        if (data.error === 'quota_exceeded') {
          return { success: false, error: 'quota_exceeded', quota: data.quota };
        }
        throw new Error(data.error);
      }

      toast({
        title: "Anforderungsprofil erstellt!",
        description: `${data.top_matches?.length || 0} passende Kandidaten gefunden.`
      });

      // Refresh data
      await loadNeeds();

      return { 
        success: true, 
        need: data.need, 
        topMatches: data.top_matches || [],
        quota: data.quota
      };
    } catch (err: any) {
      console.error('Error creating need:', err);
      toast({
        title: "Fehler beim Erstellen",
        description: err.message || "Unbekannter Fehler",
        variant: "destructive"
      });
      return { success: false, error: err.message };
    }
  };

  const toggleNeedVisibility = async (needId: string, visibility: 'active' | 'paused') => {
    try {
      const { error } = await supabase
        .from('company_needs')
        .update({ visibility, updated_at: new Date().toISOString() })
        .eq('id', needId)
        .eq('company_id', companyId);

      if (error) throw error;

      toast({
        title: visibility === 'active' ? "Anforderungsprofil aktiviert" : "Anforderungsprofil pausiert"
      });

      await loadNeeds();
      return { success: true };
    } catch (err: any) {
      console.error('Error toggling need visibility:', err);
      toast({
        title: "Fehler beim Aktualisieren",
        description: err.message,
        variant: "destructive"
      });
      return { success: false, error: err.message };
    }
  };

  const archiveNeed = async (needId: string) => {
    try {
      const { error } = await supabase
        .from('company_needs')
        .update({ visibility: 'archived', updated_at: new Date().toISOString() })
        .eq('id', needId)
        .eq('company_id', companyId);

      if (error) throw error;

      toast({
        title: "Anforderungsprofil archiviert"
      });

      await loadNeeds();
      return { success: true };
    } catch (err: any) {
      console.error('Error archiving need:', err);
      toast({
        title: "Fehler beim Archivieren",
        description: err.message,
        variant: "destructive"
      });
      return { success: false, error: err.message };
    }
  };

  const purchaseExtraNeed = async () => {
    try {
      // For now, just add a credit directly
      // In production, this would integrate with a payment system
      const { error } = await supabase
        .from('companies')
        .update({ need_credits: (quota?.need_credits || 0) + 1 })
        .eq('id', companyId);

      if (error) throw error;

      toast({
        title: "Extra Anforderungsprofil gekauft!",
        description: "Sie können jetzt ein weiteres Anforderungsprofil erstellen."
      });

      await loadNeeds();
      return { success: true };
    } catch (err: any) {
      console.error('Error purchasing extra need:', err);
      toast({
        title: "Fehler beim Kauf",
        description: err.message,
        variant: "destructive"
      });
      return { success: false, error: err.message };
    }
  };

  const upgradePackage = async (packageId: string) => {
    try {
      const { error } = await supabase
        .from('companies')
        .update({ package_id: packageId })
        .eq('id', companyId);

      if (error) throw error;

      const selectedPackage = packages.find(p => p.id === packageId);
      toast({
        title: "Paket erfolgreich geändert!",
        description: `Sie haben jetzt ${selectedPackage?.included_needs} Anforderungsprofile im ${selectedPackage?.name} Paket.`
      });

      await loadNeeds();
      return { success: true };
    } catch (err: any) {
      console.error('Error upgrading package:', err);
      toast({
        title: "Fehler beim Upgrade",
        description: err.message,
        variant: "destructive"
      });
      return { success: false, error: err.message };
    }
  };

  useEffect(() => {
    if (companyId) {
      loadNeeds();
      loadPackages();
    }
  }, [companyId]);

  return {
    needs,
    quota,
    packages,
    topMatches,
    loading,
    error,
    createNeed,
    toggleNeedVisibility,
    archiveNeed,
    purchaseExtraNeed,
    upgradePackage,
    refetch: loadNeeds
  };
}