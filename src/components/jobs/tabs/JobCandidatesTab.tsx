import { useState } from "react";
import { useQuery, useQueryClient, useMutation } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { HeaderJobSummary } from "../candidates/HeaderJobSummary";
import { FilterBar } from "../candidates/FilterBar";
import { CandidateList, type Candidate } from "../candidates/CandidateList";
import { FullProfileModal } from "@/components/Company/FullProfileModal";
import CandidateUnlockModal from "@/components/unlock/CandidateUnlockModal";
import { toast } from "sonner";
import { useCompany } from "@/hooks/useCompany";
import type { Stage } from "@/components/Company/SelectionBar";

interface JobCandidatesTabProps {
  jobId: string;
}

const ITEMS_PER_PAGE = 20;

export function JobCandidatesTab({ jobId }: JobCandidatesTabProps) {
  const queryClient = useQueryClient();
  const { company } = useCompany();
  
  // Filters
  const [city, setCity] = useState("");
  const [skills, setSkills] = useState<string[]>([]);
  const [search, setSearch] = useState("");
  const [stageFilter, setStageFilter] = useState<string | null>(null);
  
  // Pagination
  const [limit, setLimit] = useState(ITEMS_PER_PAGE);
  
  // Modals
  const [selectedCandidate, setSelectedCandidate] = useState<any | null>(null);
  const [isProfileModalOpen, setIsProfileModalOpen] = useState(false);
  const [isUnlockModalOpen, setIsUnlockModalOpen] = useState(false);

  // Fetch candidates using the new RPC
  const { data: candidatesData, isLoading } = useQuery({
    queryKey: ["job-candidates", jobId, company?.id, city, skills, search, limit],
    enabled: !!jobId && !!company?.id,
    queryFn: async () => {
      const filters: any = {};
      if (city) filters.city = city;
      if (skills.length > 0) filters.skills = skills;
      if (search) filters.search_text = search;

      const { data, error } = await supabase.rpc("get_candidates_for_job", {
        p_job_id: jobId,
        p_filters: Object.keys(filters).length > 0 ? filters : null
      });

      if (error) throw error;
      return data;
    },
  });

  // Calculate statistics and map candidates
  const candidates: Candidate[] = (candidatesData || []).slice(0, limit).map((c: any) => ({
    id: c.candidate_id,
    name: `${c.first_name || ""} ${c.last_name || ""}`.trim() || "Unbekannt",
    avatar: c.avatar_url,
    city: c.city,
    skills: c.skills || [],
    matchScore: c.match_score,
    stage: (c.stage || "neu") as Stage,
    isUnlocked: c.is_unlocked,
    tokenCost: 5,
    email: c.email,
    phone: c.phone,
    role: "",
    hasLicense: false,
    seeking: "",
    jobSearchPreferences: [],
    linkedJobTitles: [],
  }));

  // Filter candidates by stage if active
  const filteredCandidates = stageFilter
    ? candidates.filter(c => c.stage === stageFilter)
    : candidates;

  const stageCounts = {
    neu: candidatesData?.filter((c: any) => c.stage === "neu").length || 0,
    freigeschaltet: candidatesData?.filter((c: any) => c.stage === "freigeschaltet").length || 0,
    gespräch: candidatesData?.filter((c: any) => c.stage === "gespräch").length || 0,
    archiv: candidatesData?.filter((c: any) => c.stage === "archiv").length || 0,
  };

  // Get unique skills for filter
  const availableSkills = Array.from(
    new Set(
      (candidatesData || [])
        .flatMap((c: any) => c.skills || [])
        .filter(Boolean)
    )
  );

  // Stage update mutation
  const stageUpdateMutation = useMutation({
    mutationFn: async ({ applicationId, stage }: { applicationId: string; stage: Stage }) => {
      const { error } = await supabase.rpc("move_application_stage", {
        p_application_id: applicationId,
        p_new_stage: stage
      });
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["job-candidates", jobId] });
      toast.success("Stage aktualisiert");
    },
    onError: (error: any) => {
      toast.error(error.message || "Fehler beim Aktualisieren");
    }
  });

  const handleViewProfile = (candidate: Candidate) => {
    const fullCandidate = candidatesData?.find((c: any) => 
      c.candidate_id === candidate.id
    );
    setSelectedCandidate(fullCandidate);
    setIsProfileModalOpen(true);
  };

  const handleUnlock = (candidate: Candidate) => {
    const fullCandidate = candidatesData?.find((c: any) => 
      c.candidate_id === candidate.id
    );
    setSelectedCandidate(fullCandidate);
    setIsUnlockModalOpen(true);
  };

  const handleStageChange = (applicationId: string, stage: Stage) => {
    stageUpdateMutation.mutate({ applicationId, stage });
  };

  const handleLoadMore = () => {
    setLimit((prev) => prev + ITEMS_PER_PAGE);
  };

  const handleUnlockSuccess = () => {
    queryClient.invalidateQueries({ queryKey: ["job-candidates", jobId] });
    setIsUnlockModalOpen(false);
    toast.success("Kandidat freigeschaltet!");
  };

  return (
    <div className="space-y-6">
      <HeaderJobSummary
        totalCandidates={candidatesData?.length || 0}
        unlockedCount={candidatesData?.filter((c: any) => c.unlocked_at).length || 0}
        tokenCost={(candidatesData?.filter((c: any) => c.unlocked_at).length || 0) * 5}
        stageCounts={stageCounts}
        activeStage={stageFilter}
        onStageFilter={setStageFilter}
      />

      <FilterBar
        onCityChange={setCity}
        onSkillsChange={setSkills}
        onSearchChange={setSearch}
        availableSkills={availableSkills}
      />

      <CandidateList
        candidates={filteredCandidates}
        isLoading={isLoading}
        hasMore={(candidatesData?.length || 0) > limit}
        onLoadMore={handleLoadMore}
        onViewProfile={handleViewProfile}
        onUnlock={handleUnlock}
        onStageChange={handleStageChange}
      />

      {/* Modals */}
      {selectedCandidate && (
        <>
          <FullProfileModal
            isOpen={isProfileModalOpen}
            onClose={() => setIsProfileModalOpen(false)}
            profile={{
              id: selectedCandidate.profile_id,
              vorname: selectedCandidate.first_name || "",
              nachname: selectedCandidate.last_name || "",
              status: "",
              branche: "",
              ort: selectedCandidate.city || "",
              plz: "",
              avatar_url: selectedCandidate.avatar_url,
              headline: "",
              email: selectedCandidate.email,
              telefon: selectedCandidate.phone,
              cv_url: null,
              faehigkeiten: selectedCandidate.skills,
            }}
            isUnlocked={selectedCandidate.is_unlocked}
            applicationId={selectedCandidate.candidate_id}
            currentStage={selectedCandidate.stage}
            onStageChange={(stage) => {
              handleStageChange(selectedCandidate.candidate_id, stage as Stage);
              setIsProfileModalOpen(false);
            }}
          />

          <CandidateUnlockModal
            open={isUnlockModalOpen}
            onOpenChange={setIsUnlockModalOpen}
            candidate={{
              id: selectedCandidate.profile_id,
              user_id: selectedCandidate.profile_id,
              full_name: `${selectedCandidate.first_name || ""} ${selectedCandidate.last_name || ""}`.trim(),
            }}
            companyId={company!.id}
            contextApplication={{
              id: selectedCandidate.candidate_id,
              job_id: jobId,
            }}
            contextType="application"
            onSuccess={handleUnlockSuccess}
          />
        </>
      )}
    </div>
  );
}
