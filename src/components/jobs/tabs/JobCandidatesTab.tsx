import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { ApplicationCandidateCard } from "../ApplicationCandidateCard";
import { UnlockProfileModal } from "@/components/Company/UnlockProfileModal";
import { FullProfileModal } from "@/components/Company/FullProfileModal";

interface JobCandidatesTabProps {
  jobId: string;
}

const STAGES = {
  bewerber: {
    key: "bewerber",
    title: "Bewerber",
    filter: (app: any) => app.stage === "new" && !app.unlocked_at,
  },
  freigeschaltet: {
    key: "freigeschaltet",
    title: "Freigeschaltet",
    filter: (app: any) => app.unlocked_at !== null,
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
  const [selectedApplication, setSelectedApplication] = useState<any | null>(null);
  const [isProfileModalOpen, setIsProfileModalOpen] = useState(false);
  const [modalMode, setModalMode] = useState<"preview" | "full">("preview");

  const { data: applications, isLoading } = useQuery({
    queryKey: ["job-applications-detailed", jobId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("applications")
        .select(
          `
          *,
          candidates (
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
        `
        )
        .eq("job_post_id", jobId)
        .order("created_at", { ascending: false });

      if (error) throw error;
      return data;
    },
  });

  const handleViewProfile = (application: any) => {
    setSelectedApplication(application);

    if (application.unlocked_at) {
      setModalMode("full");
    } else {
      setModalMode("preview");
    }

    setIsProfileModalOpen(true);
  };

  const handleUnlockProfile = async () => {
    // TODO: Implement unlock logic
    console.log("Unlock profile:", selectedApplication?.id);
    setIsProfileModalOpen(false);
  };

  if (isLoading) {
    return (
      <div className="py-12 text-center">
        <div className="mx-auto h-12 w-12 animate-spin rounded-full border-b-2 border-primary"></div>
      </div>
    );
  }

  const stageApplications = {
    bewerber: applications?.filter(STAGES.bewerber.filter) || [],
    freigeschaltet: applications?.filter(STAGES.freigeschaltet.filter) || [],
    interview: applications?.filter(STAGES.interview.filter) || [],
    finale: applications?.filter(STAGES.finale.filter) || [],
    angebot: applications?.filter(STAGES.angebot.filter) || [],
  };

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
                    {apps.map((app) => (
                      <ApplicationCandidateCard
                        key={app.id}
                        application={app}
                        onViewProfile={() => handleViewProfile(app)}
                      />
                    ))}
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
      {modalMode === "full" && selectedApplication && (
        <FullProfileModal
          isOpen={isProfileModalOpen}
          onClose={() => setIsProfileModalOpen(false)}
          profile={selectedApplication.candidates}
          isUnlocked={true}
        />
      )}

      {modalMode === "preview" && selectedApplication && (
        <UnlockProfileModal
          isOpen={isProfileModalOpen}
          onClose={() => setIsProfileModalOpen(false)}
          profile={selectedApplication.candidates}
          matchPercentage={selectedApplication.match_score || 0}
          onConfirmUnlock={handleUnlockProfile}
          tokenCost={10}
          isLoading={false}
        />
      )}
    </>
  );
}
