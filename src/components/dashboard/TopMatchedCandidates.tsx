import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { ProfileCard } from "@/components/profile/ProfileCard";
import { useProfiles } from "@/hooks/useProfiles";
import { useCompany } from "@/hooks/useCompany";
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { UnlockProfileModal } from "@/components/Company/UnlockProfileModal";

interface TopMatchedCandidatesProps {
  companyId: string;
}

export function TopMatchedCandidates({ companyId }: TopMatchedCandidatesProps) {
  const navigate = useNavigate();
  const { company, useToken, hasUsedToken } = useCompany();
  const { user } = useAuth();
  const { toast } = useToast();
  const [selectedProfile, setSelectedProfile] = useState<any>(null);
  const [isUnlockModalOpen, setIsUnlockModalOpen] = useState(false);
  const [isUnlocking, setIsUnlocking] = useState(false);
  const [unlockedProfiles, setUnlockedProfiles] = useState<Set<string>>(new Set());

  const { data, isLoading, refetch } = useProfiles({ 
    companyId, 
    variant: "search", // Use search variant to get non-unlocked profiles
    limit: 3 
  });

  useEffect(() => {
    loadUnlockedProfiles();
  }, [company]);

  const loadUnlockedProfiles = async () => {
    if (!company) return;

    try {
      const { data } = await supabase
        .from('company_candidates')
        .select('candidate_id')
        .eq('company_id', company.id)
        .not('unlocked_at', 'is', null);

      setUnlockedProfiles(new Set(data?.map(item => item.candidate_id) || []));
    } catch (error) {
      console.error('Error loading unlocked profiles:', error);
    }
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
        // Add to pipeline in 'new' stage
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

        setIsUnlockModalOpen(false);
        const openedId = selectedProfile.id;
        setSelectedProfile(null);
        
        // Refresh the data to get a new candidate
        refetch();
        
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

  const handleUnlockProfile = async (profile: any) => {
    setSelectedProfile(profile);
    setIsUnlockModalOpen(true);
  };

  const handleSaveMatch = async (profile: any) => {
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
      toast({ title: "Profil gespeichert" });
    } catch (error) {
      console.error('Error saving match:', error);
      toast({ title: "Fehler beim Speichern", variant: "destructive" });
    }
  };

  const calculateMatchPercentage = (profile: any) => {
    // Simple fallback with some randomness for demo
    return Math.floor(Math.random() * 40) + 60;
  };

  // Filter out already unlocked profiles
  const availableProfiles = (data ?? []).filter(p => !unlockedProfiles.has(p.id));

  return (
    <section>
      <h2 className="mb-3 text-base font-semibold">Deine perfekten Kandidaten</h2>
      {isLoading ? (
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {Array.from({ length: 3 }).map((_, i) => (
            <div key={i} className="h-[200px] animate-pulse rounded-xl bg-muted" />
          ))}
        </div>
      ) : availableProfiles.length === 0 ? (
        <div className="text-center py-8">
          <p className="text-muted-foreground">Keine neuen Kandidaten verfügbar</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {availableProfiles.slice(0, 3).map((profile) => (
            <ProfileCard
              key={profile.id}
              profile={profile}
              variant="search"
              onUnlock={() => handleUnlockProfile(profile)}
              onToggleFavorite={() => handleSaveMatch(profile)}
            />
          ))}
        </div>
      )}

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
    </section>
  );
}