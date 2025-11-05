import { useState, useEffect } from "react";
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
    // ✅ Fixed: Only show candidates NOT unlocked yet
    filter: (app: any) => 
      app.stage === "new" && 
      !app.unlocked_at && 
      !app.global_unlocked_at && 
      !app.archived_at,
  },
  freigeschaltet: {
    key: "freigeschaltet",
    title: "Freigeschaltet",
    // ✅ Fixed: Show candidates that ARE unlocked with stage "new" (awaiting interview decision)
    filter: (app: any) => 
      (app.unlocked_at || app.global_unlocked_at) && 
      !app.archived_at && 
      app.stage === "new",
  },
  interview: {
    key: "interview",
    title: "Interview geplant",
    filter: (app: any) => app.stage === "interview" && !app.archived_at,
  },
  finale: {
    key: "finale",
    title: "Finale Runde",
    filter: (app: any) => app.stage === "final" && !app.archived_at,
  },
  angebot: {
    key: "angebot",
    title: "Angebot",
    filter: (app: any) => app.stage === "approved" && !app.archived_at,
  },
  archiv: {
    key: "archiv",
    title: "Archiv",
    filter: (app: any) => app.archived_at !== null
  },
};

export function JobCandidatesTab({ jobId }: JobCandidatesTabProps) {
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
    queryKey: ["job-applications-detailed", jobId],
    refetchOnMount: true, // Always refetch when component mounts
    refetchOnWindowFocus: false,
    queryFn: async () => {
      console.log("🔄 Fetching applications for job:", jobId);
      
      // Step 1: Load applications WITHOUT join first
      const { data: appData, error: appError } = await supabase
        .from("applications")
        .select(`
          id,
          candidate_id,
          job_post_id,
          stage,
          match_score,
          unlocked_at,
          created_at
        `)
        .eq("job_post_id", jobId)
        .is("archived_at", null)
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
            availability_status
          `)
          .in('id', candidateIds);

        if (candidatesError) {
          console.error("Error loading candidates:", candidatesError);
        }

        // Map candidates to applications
        const candidateMap = new Map(
          (candidatesData || []).map(c => [c.id, c])
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
          // ✅ CRITICAL: Override application stage with company_candidates stage if unlocked
          appData.forEach((app: any) => {
            const userId = candidateIdToUserId.get(app.candidate_id);
            console.log(`📎 App ${app.id}: candidate_id=${app.candidate_id}, userId=${userId}`);
            if (userId) {
              const cc = ccMap.get(userId);
              console.log(`   → CC data:`, cc);
              app.global_unlocked_at = cc?.unlocked_at || null;
              app.companyCandidate = cc || null;
              
              // ✅ USE COMPANY_CANDIDATES STAGE AS SOURCE OF TRUTH
              if (cc?.unlocked_at) {
                const oldStage = app.stage;
                app.stage = cc.stage;
                console.log(`   ✅ Overriding stage from "${oldStage}" to "${cc.stage}" (company_candidates is source of truth)`);
              }
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
      console.log("New stage (should show in Bewerber):", appData?.filter(a => a.stage === 'new' && !a.unlocked_at && !(a as any).global_unlocked_at).length || 0);
      console.log("Data:", appData);

      // Step 2: Load linked candidates - FIX: Don't select phone/email from profiles (they don't exist)
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
        .contains("linked_job_ids", [jobId])
        .not("unlocked_at", "is", null);

      if (linkedError) {
        console.warn("Could not load linked candidates:", linkedError);
        // Continue with just the regular applications
      }
      
      // Now get candidate details separately for linked candidates
      let linkedCandidatesWithDetails = [];
      if (linkedCandidates && linkedCandidates.length > 0) {
        const linkedCandidateIds = linkedCandidates.map(cc => cc.candidate_id);
        
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
            availability_status
          `)
          .in('user_id', linkedCandidateIds);
        
        const candidateMap = new Map(
          (candidateDetails || []).map(c => [c.user_id, c])
        );
        
        linkedCandidatesWithDetails = linkedCandidates.map(cc => ({
          ...cc,
          candidates: candidateMap.get(cc.candidate_id)
        }));
      }

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
      // ✅ Update company_candidates stage (source of truth for unlocked candidates)
      const app = applications?.find(a => a.id === applicationId);
      if (!app) throw new Error("Application not found");
      
      const userId = app.candidates?.user_id;
      if (!userId) throw new Error("User ID not found");
      
      const { error: ccError } = await supabase
        .from('company_candidates')
        .update({ stage })
        .eq('candidate_id', userId)
        .eq('company_id', company?.id || '');
      
      if (ccError) throw ccError;
      
      // Also update applications table for consistency
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

  const handleViewProfile = (application: any) => {
    setSelectedApplication(application);

    const isGloballyUnlocked = application.global_unlocked_at;
    const isUnlocked = application.unlocked_at || isGloballyUnlocked;

    if (!isUnlocked) {
      // ✅ NEW: Open preview modal instead of unlock modal
      setPreviewModalOpen(true);
    } else if (application.stage === "new" || application.is_virtual) {
      setModalMode("full-actions");
      setIsProfileModalOpen(true);
    } else {
      setModalMode("full-readonly");
      setIsProfileModalOpen(true);
    }

    // Show info if globally unlocked but not for this job
    if (isGloballyUnlocked && !application.unlocked_at) {
      toast.info("Dieser Kandidat wurde bereits für eine andere Stelle freigeschaltet");
    }
  };

  // ✅ NEW: Handler for opening unlock modal from preview
  const handleUnlockFromPreview = (application: any) => {
    setPreviewModalOpen(false);
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
          stage: 'rejected',
          rejection_reason: reason || 'Profil passt nicht zur Stelle',
          archived_at: new Date().toISOString(), // ✅ Set archived_at
          archived_by: (await supabase.auth.getUser()).data.user?.id,
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
    finale: applications?.filter(STAGES.finale.filter) || [],
    angebot: applications?.filter(STAGES.angebot.filter) || [],
    archiv: applications?.filter(STAGES.archiv.filter) || [],
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
                      const isNewStage = app.stage === "new" || app.is_virtual;
                      
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
                      
                      // Determine variant based on stage and tab
                      let variant: "preview" | "unlocked" | "unlocked-actions" = "preview";
                      
                      if (isUnlocked) {
                        // In "Freigeschaltet" tab: always show actions (Interview/Absagen)
                        if (key === "freigeschaltet") {
                          variant = "unlocked-actions";
                        } else if (key === "interview" || key === "finale" || key === "angebot") {
                          // In later stages: read-only view
                          variant = "unlocked";
                        } else {
                          // Default: unlocked with actions if new stage
                          variant = isNewStage ? "unlocked-actions" : "unlocked";
                        }
                      }

                      return (
                        <CandidateCard
                          key={app.id}
                          name={candidate?.full_name || `${candidate?.vorname} ${candidate?.nachname}`.trim() || "Unbekannt"}
                          matchPercent={app.match_score || 0}
                          avatarUrl={candidate?.profile_image}
                          role={candidate?.title}
                          city={candidate?.city}
                          hasLicense={false}
                          seeking={candidate?.bio_short}
                          skills={Array.isArray(candidate?.skills) ? candidate.skills : []}
                          email={isUnlocked ? candidate?.email : undefined}
                          phone={isUnlocked ? candidate?.phone : undefined}
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
                      {key === "finale" && "Noch keine Kandidaten in der finalen Runde"}
                      {key === "angebot" && "Noch keine Angebote gemacht"}
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
          companyCandidate={selectedApplication.companyCandidate}
          linkedJobs={selectedApplication.linkedJobTitles}
          applicationId={modalMode === "full-actions" ? selectedApplication.id : undefined}
          currentStage={selectedApplication.stage}
          onStageChange={handleStageChange}
          onArchive={(reason) => handleArchive(selectedApplication.id, reason)}
          showUnlockButton={!selectedApplication.unlocked_at && !selectedApplication.global_unlocked_at}
          onUnlock={() => {
            setIsProfileModalOpen(false);
            setUnlockModalOpen(true);
          }}
          onMarkUnsuitable={(reason) => handleMarkUnsuitableApplication(selectedApplication, reason)}
          showDownloadButtons={true}
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
            
            // Wait a bit for the refetch to complete
            await new Promise(resolve => setTimeout(resolve, 300));
            
            // Get the updated data from cache
            const updatedData = queryClient.getQueryData<any[]>(["job-applications-detailed", jobId]);
            
            // Open the profile modal with unlocked data
            if (updatedData) {
              const unlockedApp = updatedData.find(a => a.candidate_id === selectedApplication.candidate_id);
              
              if (unlockedApp) {
                setSelectedApplication(unlockedApp);
                setModalMode("full-actions");
                setIsProfileModalOpen(true);
              }
            }
            
            toast.success("Profil wurde freigeschaltet");
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
