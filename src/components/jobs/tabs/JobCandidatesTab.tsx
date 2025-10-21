import { useState, useEffect } from "react";
import { useQuery, useQueryClient, useMutation } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { CandidateCard } from "../CandidateCard";
import { FullProfileModal } from "@/components/Company/FullProfileModal";
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
    filter: (app: any) => app.stage === "new" && !app.unlocked_at && !app.global_unlocked_at,
  },
  freigeschaltet: {
    key: "freigeschaltet",
    title: "Freigeschaltet",
    filter: (app: any) => (app.unlocked_at || app.global_unlocked_at) && (app.stage === "new" || app.is_virtual),
  },
  interview: {
    key: "interview",
    title: "Interview geplant",
    filter: (app: any) => app.stage === "interview",
  },
  finale: {
    key: "finale",
    title: "Finale Runde",
    filter: (app: any) => app.stage === "final",
  },
  angebot: {
    key: "angebot",
    title: "Angebot",
    filter: (app: any) => app.stage === "approved",
  },
};

export function JobCandidatesTab({ jobId }: JobCandidatesTabProps) {
  const queryClient = useQueryClient();
  const { company } = useCompany();
  const [selectedApplication, setSelectedApplication] = useState<any | null>(null);
  const [isProfileModalOpen, setIsProfileModalOpen] = useState(false);
  const [modalMode, setModalMode] = useState<"preview" | "full-readonly" | "full-actions">("preview");
  const [unlockModalOpen, setUnlockModalOpen] = useState(false);
  const [jobTitle, setJobTitle] = useState<string>("");

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
    queryFn: async () => {
      // Step 1: Load applications WITH join (nutzt RLS-Permissions von applications)
      const { data: appData, error: appError } = await supabase
        .from("applications")
        .select(`
          id,
          candidate_id,
          job_post_id,
          stage,
          match_score,
          unlocked_at,
          created_at,
          candidates:candidate_id (
            id,
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
          )
        `)
        .eq("job_post_id", jobId)
        .is("archived_at", null)
        .order("created_at", { ascending: false });

      if (appError) throw appError;

      // Step 1.5: Add global unlock status from company_candidates
      if (appData && company?.id) {
        const candidateIds = appData.map(a => a.candidate_id);
        const { data: unlockData } = await supabase
          .from('company_candidates')
          .select('candidate_id, unlocked_at')
          .eq('company_id', company.id)
          .in('candidate_id', candidateIds)
          .not('unlocked_at', 'is', null);

        const unlockMap = new Map(
          (unlockData || []).map(u => [u.candidate_id, u.unlocked_at])
        );

        appData.forEach(app => {
          (app as any).global_unlocked_at = unlockMap.get(app.candidate_id) || null;
        });
      }

      console.log("=== Applications loaded ===");
      console.log("Total applications:", appData?.length || 0);
      console.log("New stage (should show in Bewerber):", appData?.filter(a => a.stage === 'new' && !a.unlocked_at && !(a as any).global_unlocked_at).length || 0);
      console.log("Data:", appData);

      // Step 2: Load linked candidates
      const { data: linkedCandidates, error: linkedError } = await supabase
        .from("company_candidates")
        .select(`
          id,
          candidate_id,
          stage,
          match_score,
          unlocked_at,
          created_at,
          linked_job_ids,
          candidates:candidate_id (
            id,
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
          )
        `)
        .contains("linked_job_ids", [jobId])
        .not("unlocked_at", "is", null);

      if (linkedError) {
        console.warn("Could not load linked candidates:", linkedError);
        // Continue with just the regular applications
      }

      // Step 3: Create virtual applications for linked candidates
      const virtualApplications = linkedCandidates
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
            candidates: Array.isArray(cc.candidates) ? cc.candidates[0] : cc.candidates,
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

  const handleViewProfile = (application: any) => {
    setSelectedApplication(application);

    const isUnlocked = application.unlocked_at || application.global_unlocked_at;

    if (!isUnlocked) {
      setUnlockModalOpen(true);
    } else if (application.stage === "new" || application.is_virtual) {
      setModalMode("full-actions");
      setIsProfileModalOpen(true);
    } else {
      setModalMode("full-readonly");
      setIsProfileModalOpen(true);
    }
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
      // Update application mit unsuitable-Flag
      await supabase
        .from('applications')
        .update({ 
          stage: 'unsuitable',
          rejection_reason: reason || 'Als unpassend markiert',
          updated_at: new Date().toISOString()
        })
        .eq('id', application.id);

      // Speichere für AI-Learning
      const { data: userData } = await supabase.auth.getUser();
      if (userData.user) {
        await supabase.from('company_activity').insert([{
          type: 'application_marked_unsuitable',
          company_id: company.id,
          actor_user_id: userData.user.id,
          payload: {
            candidate_id: application.candidate_id,
            job_id: jobId,
            application_id: application.id,
            reason: reason || 'Keine Angabe'
          }
        }]);
      }

      toast.success("Bewerbung als unpassend markiert");
      queryClient.invalidateQueries({ queryKey: ["job-applications-detailed", jobId] });
      setIsProfileModalOpen(false);
    } catch (error) {
      console.error('Error:', error);
      toast.error("Fehler beim Markieren");
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
                      
                      // Determine variant
                      let variant: "preview" | "unlocked" | "unlocked-actions" = "preview";
                      if (isUnlocked) {
                        variant = isNewStage ? "unlocked-actions" : "unlocked";
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
                          onViewProfile={() => handleViewProfile(app)}
                          onDownloadCV={() => {
                            if (candidate?.cv_url) {
                              window.open(candidate.cv_url, '_blank');
                            } else {
                              toast.error("Kein CV verfügbar");
                            }
                          }}
                          onUnlock={() => handleViewProfile(app)}
                          onAcceptInterview={() => {
                            setSelectedApplication(app);
                            handleStageChange("interview");
                          }}
                          onReject={() => {
                            setSelectedApplication(app);
                            handleMarkUnsuitableApplication(app);
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
          applicationId={modalMode === "full-actions" ? selectedApplication.id : undefined}
          currentStage={selectedApplication.stage}
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
          onSuccess={() => {
            queryClient.invalidateQueries({ queryKey: ["job-applications-detailed", jobId] });
            toast.success("Kandidat freigeschaltet!");
            setUnlockModalOpen(false);
            setModalMode("full-actions");
            setIsProfileModalOpen(true);
          }}
        />
      )}
    </>
  );
}
