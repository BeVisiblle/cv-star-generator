import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useQuery, useQueryClient, useMutation } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { CandidateCard } from "../CandidateCard";
import { FullProfileModal } from "@/components/Company/FullProfileModal";
import { UnlockProfileModal } from "@/components/Company/UnlockProfileModal";
import CandidateUnlockModal from "@/components/unlock/CandidateUnlockModal";
import { toast } from "sonner";
import { unlockService } from "@/services/unlockService";
import { useCompany } from "@/hooks/useCompany";

interface JobCandidatesTabProps {
  jobId: string;
}

const STAGES = {
  bewerber: {
    key: "bewerber",
    title: "Bewerber",
    // Show new applications not yet unlocked
    filter: (app: any) => 
      app.status === "new" && 
      !app.unlocked_at,
  },
  freigeschaltet: {
    key: "freigeschaltet",
    title: "Freigeschaltet",
    // Show unlocked applications
    filter: (app: any) => 
      app.status === "unlocked",
  },
  interview: {
    key: "interview",
    title: "Interview geplant",
    filter: (app: any) => app.status === "interview_scheduled",
  },
  angebot: {
    key: "angebot",
    title: "Angebot",
    filter: (app: any) => app.status === "accepted",
  },
  abgelehnt: {
    key: "abgelehnt",
    title: "Abgelehnt",
    filter: (app: any) => app.status === "rejected"
  },
};

export function JobCandidatesTab({ jobId }: JobCandidatesTabProps) {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const { company } = useCompany();
  const [selectedApplication, setSelectedApplication] = useState<any | null>(null);
  const [isProfileModalOpen, setIsProfileModalOpen] = useState(false);
  const [modalMode, setModalMode] = useState<"preview" | "full-readonly" | "full-actions">("preview");
  const [unlockModalOpen, setUnlockModalOpen] = useState(false);
  const [previewModalOpen, setPreviewModalOpen] = useState(false); // ✅ NEW: Preview modal
  const [jobTitle, setJobTitle] = useState<string>("");
  const [postUnlockProfile, setPostUnlockProfile] = useState<any | null>(null);
  const [showPostUnlockModal, setShowPostUnlockModal] = useState(false);

  // Fetch job title
  useEffect(() => {
    const loadJobTitle = async () => {
      const jobResult: any = await supabase
        .from("job_posts")
        .select("title")
        .eq("id", jobId)
        .single();
      if (jobResult.data) setJobTitle(jobResult.data.title);
    };
    loadJobTitle();
  }, [jobId]);

  const { data: applications, isLoading } = useQuery({
    queryKey: ["job-applications-detailed", jobId, company?.id],
    enabled: !!company?.id, // Only run query when company is loaded
    refetchOnMount: true, // Always refetch when component mounts
    refetchOnWindowFocus: false,
    queryFn: async () => {
      console.log("🔄 Fetching applications for job:", jobId);
      console.log("🏢 Company ID:", company?.id);
      
      // Step 1: Load applications WITHOUT join first
      const { data: appData, error: appError } = await supabase
        .from("applications")
        .select(`
          id,
          candidate_id,
          job_id,
          status,
          match_score,
          unlocked_at,
          created_at
        `)
        .eq("job_id", jobId)
        .order("created_at", { ascending: false });

      if (appError) throw appError;

      console.log("📥 Raw applications:", appData?.length);

      // Step 1.5: Load full candidate details from candidates table
      // This ensures we get unmasked data if the candidate is unlocked
      if (appData && appData.length > 0) {
        const candidateIds = appData.map(a => a.candidate_id);
        
        const { data: candidatesData, error: candidatesError } = await supabase
          .from('candidates')
          .select(`
            id,
            user_id,
            full_name,
            vorname,
            nachname,
            email,
            phone,
            profile_image,
            title,
            city,
            skills,
            bio_short,
            cv_url,
            languages,
            experience_years,
            availability_status,
            linkedin_url
          `)
          .in('id', candidateIds);

        if (candidatesError) {
          console.error("Error loading candidates:", candidatesError);
        }

        // Also load profiles for job_search_preferences AND avatar_url
        const userIds = candidatesData?.map(c => c.user_id).filter(Boolean) || [];
        let profilesMap = new Map();
        
        if (userIds.length > 0) {
          const { data: profilesData } = await supabase
            .from('profiles')
            .select('id, job_search_preferences, avatar_url, full_name')
            .in('id', userIds);
          
          profilesMap = new Map(
            (profilesData || []).map(p => [p.id, p])
          );
        }

        // Map candidates to applications with job_search_preferences and avatar
        const candidateMap = new Map(
          (candidatesData || []).map(c => {
            const profile = profilesMap.get(c.user_id);
            return [c.id, {
              ...c,
              job_search_preferences: profile?.job_search_preferences || [],
              avatar_url: profile?.avatar_url || c.profile_image // Use profile avatar or candidate profile_image
            }];
          })
        );

        appData.forEach(app => {
          (app as any).candidates = candidateMap.get(app.candidate_id) || null;
        });
      }

      // Step 1.6: Add global unlock status AND company_candidate data
      if (appData && company?.id) {
        // First, resolve candidate IDs to user IDs
        const candidateIds = appData.map(a => a.candidate_id);
        
        console.log("🔍 Resolving candidate IDs to user IDs:", candidateIds);
        
        // Get user_ids from candidates table
        const { data: candidatesData, error: candidatesError } = await supabase
          .from('candidates')
          .select('id, user_id')
          .in('id', candidateIds);
        
        console.log("👥 Candidates data:", candidatesData, "Error:", candidatesError);
        
        const candidateIdToUserId = new Map(
          (candidatesData || []).map(c => [c.id, c.user_id])
        );
        
        console.log("🗺️ Candidate ID to User ID map:", Array.from(candidateIdToUserId.entries()));
        
        // Get all unique user_ids
        const userIds = Array.from(new Set(
          Array.from(candidateIdToUserId.values()).filter(Boolean)
        ));
        
        console.log("🎯 Unique user IDs:", userIds);
        
        if (userIds.length > 0) {
          // Query company_candidates using user_ids (profiles.id)
          const { data: companyCandidates, error: ccError } = await supabase
            .from('company_candidates')
            .select('candidate_id, unlocked_at, source, notes, linked_job_ids, stage')
            .eq('company_id', company.id)
            .in('candidate_id', userIds)
            .not('unlocked_at', 'is', null);

          console.log("🏢 Company candidates:", companyCandidates, "Error:", ccError);

          // Map by user_id
          const ccMap = new Map(
            (companyCandidates || []).map(cc => [cc.candidate_id, cc])
          );

          console.log("🗺️ CC Map:", Array.from(ccMap.entries()));

          // Attach to applications using the resolved user_id
          appData.forEach(app => {
            const userId = candidateIdToUserId.get(app.candidate_id);
            console.log(`📎 App ${app.id}: candidate_id=${app.candidate_id}, userId=${userId}`);
            if (userId) {
              const cc = ccMap.get(userId);
              console.log(`   → CC data:`, cc);
              (app as any).global_unlocked_at = cc?.unlocked_at || null;
              (app as any).companyCandidate = cc || null;
            }
          });
        }
      }

      console.log("=== Applications after global unlock check ===");
      console.log("Data with global_unlocked_at:", appData?.map(a => ({
        id: a.id,
        candidate_id: a.candidate_id,
        unlocked_at: a.unlocked_at,
        global_unlocked_at: (a as any).global_unlocked_at
      })));

      console.log("=== Applications loaded ===");
      console.log("Total applications:", appData?.length || 0);
      console.log("New status (should show in Bewerber):", appData?.filter(a => a.status === 'new' && !a.unlocked_at).length || 0);
      console.log("Data:", appData);

      // Step 2: Load linked candidates - use JSONB contains operator
      const { data: linkedCandidates, error: linkedError } = await supabase
        .from("company_candidates")
        .select(`
          id,
          candidate_id,
          stage,
          match_score,
          unlocked_at,
          created_at,
          linked_job_ids
        `)
        .eq('company_id', company?.id)
        .not("unlocked_at", "is", null);

      console.log("📋 Linked candidates raw:", linkedCandidates, "Error:", linkedError);

      // Filter in JavaScript since JSONB contains can be tricky
      const filteredLinkedCandidates = linkedCandidates?.filter(cc => {
        if (!cc.linked_job_ids) return false;
        const jobIds = Array.isArray(cc.linked_job_ids) ? cc.linked_job_ids : [];
        return jobIds.includes(jobId);
      });
      
      // Now get candidate details separately for linked candidates
      let linkedCandidatesWithDetails = [];
      if (filteredLinkedCandidates && filteredLinkedCandidates.length > 0) {
        const linkedCandidateIds = filteredLinkedCandidates.map(cc => cc.candidate_id);
        
        const { data: candidateDetails } = await supabase
          .from('candidates')
          .select(`
            id,
            user_id,
            full_name,
            vorname,
            nachname,
            email,
            phone,
            profile_image,
            title,
            city,
            skills,
            bio_short,
            cv_url,
            languages,
            experience_years,
            availability_status,
            linkedin_url
          `)
          .in('user_id', linkedCandidateIds);
        
        // Also load profiles for job_search_preferences AND avatar_url
        const userIds = candidateDetails?.map(c => c.user_id).filter(Boolean) || [];
        let profilesMap = new Map();
        
        if (userIds.length > 0) {
          const { data: profilesData } = await supabase
            .from('profiles')
            .select('id, job_search_preferences, avatar_url, full_name')
            .in('id', userIds);
          
          profilesMap = new Map(
            (profilesData || []).map(p => [p.id, p])
          );
        }
        
        const candidateMap = new Map(
          (candidateDetails || []).map(c => {
            const profile = profilesMap.get(c.user_id);
            return [c.user_id, {
              ...c,
              job_search_preferences: profile?.job_search_preferences || [],
              avatar_url: profile?.avatar_url || c.profile_image
            }];
          })
        );
        
        linkedCandidatesWithDetails = filteredLinkedCandidates.map(cc => ({
          ...cc,
          candidates: candidateMap.get(cc.candidate_id)
        }));
      }

      console.log("🔗 Filtered linked candidates with details:", linkedCandidatesWithDetails);

      // Step 3: Create virtual applications for linked candidates
      const virtualApplications = linkedCandidatesWithDetails
        ?.filter((cc) => {
          // Only include if no regular application exists
          return !appData?.some((app) => app.candidate_id === cc.candidate_id);
        })
        .map((cc) => {
          const linkedJobIds = cc.linked_job_ids as any;
          return {
            id: `virtual-${cc.id}`,
            candidate_id: cc.candidate_id,
            job_post_id: jobId,
            stage: cc.stage || "new",
            match_score: cc.match_score || 0,
            unlocked_at: cc.unlocked_at,
            created_at: cc.created_at,
            candidates: cc.candidates,
            linked_job_ids: Array.isArray(linkedJobIds) ? linkedJobIds as string[] : [],
            is_virtual: true,
          };
        }) || [];

      const allApplications = [...(appData || []), ...virtualApplications];

      // Step 4: Load job titles for linked_job_ids
      const allJobIds = new Set<string>();
      allApplications.forEach((app: any) => {
        if (app.linked_job_ids && Array.isArray(app.linked_job_ids)) {
          app.linked_job_ids.forEach((id: string) => allJobIds.add(id));
        }
      });

      if (allJobIds.size > 0) {
        const { data: jobTitles } = await supabase
          .from("job_posts")
          .select("id, title")
          .in("id", Array.from(allJobIds));

        const jobTitleMap = new Map(
          jobTitles?.map(j => [j.id, j.title]) || []
        );

        // Attach linkedJobTitles to each application
        return allApplications.map((app: any) => ({
          ...app,
          linkedJobTitles: app.linked_job_ids?.map((id: string) => ({
            id,
            title: jobTitleMap.get(id) || "Unbekannte Stelle"
          })) || []  // ✅ Fallback to empty array
        }));
      }

      // Ensure linkedJobTitles is always an array
      return allApplications.map((app: any) => ({
        ...app,
        linkedJobTitles: []  // ✅ Fallback to empty array
      }));
    },
  });

  const archiveMutation = useMutation({
    mutationFn: async ({ applicationId, reason }: { applicationId: string; reason?: string }) => {
      const { error } = await supabase.rpc('archive_application', {
        p_application_id: applicationId,
        p_rejection_reason: reason || null
      });
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["job-applications-detailed", jobId] });
      toast.success("Bewerbung archiviert");
      setIsProfileModalOpen(false);
    },
    onError: (error: any) => {
      toast.error(error.message || "Fehler beim Archivieren");
    }
  });

  const stageUpdateMutation = useMutation({
    mutationFn: async ({ applicationId, stage }: { applicationId: string; stage: string }) => {
      const { error } = await supabase
        .from('applications')
        .update({ stage })
        .eq('id', applicationId);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["job-applications-detailed", jobId] });
      toast.success("Status aktualisiert");
      setIsProfileModalOpen(false);
    },
    onError: (error: any) => {
      toast.error(error.message || "Fehler beim Aktualisieren");
    }
  });

  const handleArchive = (applicationId: string, reason?: string) => {
    archiveMutation.mutate({ applicationId, reason });
  };

  const handleViewProfile = async (application: any) => {
    console.log("🔍 handleViewProfile called:", {
      unlocked_at: application.unlocked_at,
      global_unlocked_at: application.global_unlocked_at,
      status: application.status,
      candidate: application.candidates
    });
    
    const isGloballyUnlocked = application.global_unlocked_at;
    const isUnlocked = application.unlocked_at || isGloballyUnlocked;

    console.log("🔓 Unlock status:", { isUnlocked, isGloballyUnlocked });

    if (!isUnlocked) {
      console.log("❌ Opening preview modal (not unlocked)");
      setSelectedApplication(application);
      setPreviewModalOpen(true);
    } else {
      console.log("✅ Navigating to profile page");
      
      // Log profile view activity
      if (company?.id && application.candidates?.id) {
        try {
          await unlockService.logProfileView(application.candidates.id, company.id);
        } catch (e) {
          console.error('Failed to log profile view', e);
        }
      }
      
      // Navigate to profile page (same as in Search and Unlocked pages)
      navigate(`/company/profile/${application.candidates.id}`);
    }

    // Show info if globally unlocked but not for this job
    if (isGloballyUnlocked && !application.unlocked_at) {
      toast.info("Dieser Kandidat wurde bereits für eine andere Stelle freigeschaltet");
    }
  };

  const handleUnlockFromPreview = (application: any) => {
    setPreviewModalOpen(false);
    setSelectedApplication(application);
    setUnlockModalOpen(true);
  };
  const handleStageChange = (newStage: string) => {
    if (!selectedApplication) return;
    stageUpdateMutation.mutate({ 
      applicationId: selectedApplication.id, 
      stage: newStage 
    });
  };

  const handleMarkUnsuitableApplication = async (application: any, reason?: string) => {
    if (!company?.id) return;
    
    try {
      // ✅ FIX: Update application to rejected AND archive it
      await supabase
        .from('applications')
        .update({ 
          status: 'rejected',
          reason_short: reason || 'Profil passt nicht zur Stelle',
          updated_at: new Date().toISOString()
        })
        .eq('id', application.id);

      // Log company activity
      const { data: userData } = await supabase.auth.getUser();
      if (userData.user) {
        await supabase.from('company_activity').insert([{
          type: 'application_rejected',
          company_id: company.id,
          actor_user_id: userData.user.id,
          payload: {
            candidate_id: application.candidate_id,
            job_id: jobId,
            application_id: application.id,
            reason: reason || 'Profil passt nicht zur Stelle'
          }
        }]);
      }

      toast.success("Bewerbung wurde abgesagt und archiviert");
      queryClient.invalidateQueries({ queryKey: ["job-applications-detailed", jobId] });
      setIsProfileModalOpen(false);
      setPreviewModalOpen(false);
    } catch (error) {
      console.error('Error:', error);
      toast.error("Fehler beim Absagen der Bewerbung");
    }
  };

  if (isLoading) {
    return (
      <div className="py-12 text-center">
        <div className="mx-auto h-12 w-12 animate-spin rounded-full border-b-2 border-primary"></div>
      </div>
    );
  }

  console.log("=== Filter Debug ===");
  console.log("applications array:", applications);
  console.log("First app:", applications?.[0]);
  console.log("Test filter on first:", applications?.[0] ? STAGES.bewerber.filter(applications[0]) : "no app");

  const stageApplications = {
    bewerber: applications?.filter(STAGES.bewerber.filter) || [],
    freigeschaltet: applications?.filter(STAGES.freigeschaltet.filter) || [],
    interview: applications?.filter(STAGES.interview.filter) || [],
    angebot: applications?.filter(STAGES.angebot.filter) || [],
    abgelehnt: applications?.filter(STAGES.abgelehnt.filter) || [],
  };

  console.log("=== Stage Breakdown ===", stageApplications);

  return (
    <>
      <Tabs defaultValue="bewerber" className="w-full">
        <TabsList className="inline-flex h-10 w-full items-center justify-start rounded-none border-b bg-transparent p-0">
          {Object.values(STAGES).map((stage) => (
            <TabsTrigger
              key={stage.key}
              value={stage.key}
              className="rounded-none border-b-2 border-transparent bg-transparent px-4 pb-3 pt-2 font-medium text-muted-foreground transition-all data-[state=active]:border-primary data-[state=active]:bg-transparent data-[state=active]:text-primary hover:text-foreground"
            >
              {stage.title}
              <span className="ml-2 text-xs">
                ({stageApplications[stage.key as keyof typeof stageApplications].length})
              </span>
            </TabsTrigger>
          ))}
        </TabsList>

        {Object.entries(STAGES).map(([key, stage]) => {
          const apps = stageApplications[key as keyof typeof stageApplications];
          return (
            <TabsContent key={key} value={key} className="mt-6">
              <div className="space-y-4">
                <h2 className="text-lg font-semibold">
                  {stage.title} ({apps.length})
                </h2>

                {apps.length > 0 ? (
                  <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
                    {apps.map((app) => {
                      const candidate = app.candidates;
                      const isUnlocked = !!app.unlocked_at || !!app.global_unlocked_at;
                      const isNewStage = app.status === "new" || app.is_virtual;
                      
                      // Calculate unlock reason
                      let unlockReason = "";
                      if (isUnlocked && app.companyCandidate) {
                        if (app.companyCandidate.source === "bewerbung") {
                          unlockReason = `Bewerbung auf ${jobTitle}`;
                        } else if (app.companyCandidate.source === "initiativ") {
                          unlockReason = "Initiativ freigeschaltet";
                        }
                        
                        // Check if unlocked for other jobs
                        if (app.linkedJobTitles && app.linkedJobTitles.length > 0) {
                          const otherJobs = app.linkedJobTitles
                            .filter((j: any) => j.id !== jobId)
                            .map((j: any) => j.title);
                          if (otherJobs.length > 0) {
                            unlockReason += ` (auch: ${otherJobs.join(", ")})`;
                          }
                        }
                      }
                      
                      // Determine variant based on unlock status and tab
                      let variant: "preview" | "unlocked" | "unlocked-actions" | "applicant" = "preview";
                      
                      // If globally unlocked, always show full info with actions
                      if (isUnlocked) {
                        if (key === "bewerber") {
                          // In "Bewerber" tab: show actions (Interview/Absagen) for unlocked candidates
                          variant = "unlocked-actions";
                        } else if (key === "freigeschaltet") {
                          // In "Freigeschaltet" tab: always show actions (Interview/Absagen)
                          variant = "unlocked-actions";
                        } else if (key === "interview" || key === "angebot") {
                          // In later stages: read-only view
                          variant = "unlocked";
                        } else {
                          // Default: unlocked with actions if new stage
                          variant = isNewStage ? "unlocked-actions" : "unlocked";
                        }
                      } else if (key === "bewerber") {
                        // Not unlocked and in "Bewerber" tab: show simplified applicant variant
                        variant = "applicant";
                      }

                      return (
                        <CandidateCard
                          key={app.id}
                          name={candidate?.full_name || `${candidate?.vorname} ${candidate?.nachname}`.trim() || "Unbekannt"}
                          matchPercent={app.match_score || 0}
                          avatarUrl={candidate?.avatar_url || candidate?.profile_image}
                          role={candidate?.title}
                          city={candidate?.city}
                          hasLicense={false}
                          seeking={candidate?.bio_short}
                          skills={Array.isArray(candidate?.skills) ? candidate.skills : []}
                          jobSearchPreferences={candidate?.job_search_preferences}
                          email={isUnlocked ? candidate?.email : undefined}
                          phone={isUnlocked ? candidate?.phone : undefined}
                          linkedinUrl={isUnlocked ? candidate?.linkedin_url : undefined}
                          variant={variant}
                          linkedJobTitles={app.linkedJobTitles}
                          unlockReason={unlockReason}
                          unlockSource={app.companyCandidate?.source}
                          unlockNotes={app.companyCandidate?.notes}
                          onViewProfile={() => handleViewProfile(app)}
                          onDownloadCV={() => {
                            if (candidate?.cv_url) {
                              window.open(candidate.cv_url, '_blank');
                            } else {
                              toast.error("Kein CV verfügbar");
                            }
                          }}
                          onUnlock={() => {
                            setSelectedApplication(app);
                            setUnlockModalOpen(true);
                          }}
                          onAcceptInterview={() => {
                            setSelectedApplication(app);
                            handleStageChange("interview");
                          }}
                          onReject={() => {
                            const reason = window.prompt("Bitte geben Sie einen Grund für die Absage ein (optional):");
                            if (reason !== null) {
                              setSelectedApplication(app);
                              handleMarkUnsuitableApplication(app, reason);
                            }
                          }}
                        />
                      );
                    })}
                  </div>
                ) : (
                  <div className="rounded-lg border border-dashed py-12 text-center">
                    <p className="text-sm text-muted-foreground">
                      {key === "bewerber" && "Noch keine Bewerbungen eingegangen"}
                      {key === "freigeschaltet" && "Noch keine Profile freigeschaltet"}
                      {key === "interview" && "Keine Interviews geplant"}
                      {key === "angebot" && "Noch keine Angebote gemacht"}
                      {key === "abgelehnt" && "Keine abgelehnten Bewerbungen"}
                    </p>
                  </div>
                )}
              </div>
            </TabsContent>
          );
        })}
      </Tabs>

      {/* Modals */}
      {(modalMode === "full-readonly" || modalMode === "full-actions") && selectedApplication && (
        <FullProfileModal
          isOpen={isProfileModalOpen}
          onClose={() => setIsProfileModalOpen(false)}
          profile={selectedApplication.candidates}
          isUnlocked={true}
          applicationId={modalMode === "full-actions" ? selectedApplication.id : undefined}
          currentStage={selectedApplication.status}
          onStageChange={handleStageChange}
          onArchive={(reason) => handleArchive(selectedApplication.id, reason)}
          showUnlockButton={!selectedApplication.unlocked_at}
          onUnlock={() => {
            setIsProfileModalOpen(false);
            setUnlockModalOpen(true);
          }}
          onMarkUnsuitable={(reason) => handleMarkUnsuitableApplication(selectedApplication, reason)}
        />
      )}

      {/* Preview Modal (shows profile without unlocking) */}
      {selectedApplication && (
        <UnlockProfileModal
          isOpen={previewModalOpen}
          onClose={() => setPreviewModalOpen(false)}
          profile={selectedApplication.candidates}
          matchPercentage={selectedApplication.match_score || 0}
          onConfirmUnlock={() => handleUnlockFromPreview(selectedApplication)}
          tokenCost={1}
          applicationId={selectedApplication.id}
          onReject={(reason) => handleMarkUnsuitableApplication(selectedApplication, reason)}
        />
      )}

      {/* Unlock Modal (actual unlock with token cost) */}
      {selectedApplication && (
        <CandidateUnlockModal
          open={unlockModalOpen}
          onOpenChange={setUnlockModalOpen}
          candidate={{
            id: selectedApplication.candidate_id,
            full_name: selectedApplication.candidates?.full_name,
            vorname: selectedApplication.candidates?.vorname,
            nachname: selectedApplication.candidates?.nachname,
          }}
          companyId={company?.id || ""}
          contextApplication={{
            id: selectedApplication.id,
            job_id: jobId,
            job_title: jobTitle || "Stellenanzeige",
            status: selectedApplication.stage,
          }}
          contextType="application"
          onSuccess={async () => {
            // Reload applications to update the lists AND candidate data
            await queryClient.invalidateQueries({ 
              queryKey: ["job-applications-detailed", jobId] 
            });
            
            // Force refetch to get unlocked data
            await queryClient.refetchQueries({
              queryKey: ["job-applications-detailed", jobId]
            });
            
            toast.success("Profil wurde freigeschaltet und ist jetzt verfügbar");
          }}
        />
      )}

      {/* Post-Unlock Profile Modal */}
      {postUnlockProfile && (
        <FullProfileModal
          isOpen={showPostUnlockModal}
          onClose={() => {
            setShowPostUnlockModal(false);
            setPostUnlockProfile(null);
          }}
          profile={postUnlockProfile}
          isUnlocked={true}
          companyCandidate={postUnlockProfile.companyCandidate}
          linkedJobs={postUnlockProfile.linkedJobTitles}
          currentStage={postUnlockProfile.companyCandidate?.stage}
          onStageChange={handleStageChange}
          onArchive={(reason) => handleArchive(selectedApplication.id, reason)}
          showDownloadButtons={true}
        />
      )}
    </>
  );
}
