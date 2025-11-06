import { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { UnifiedCandidateCard } from "@/components/candidate/UnifiedCandidateCard";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "@/hooks/use-toast";
import { setApplicationStatus } from "@/lib/api/applications";
import type { ApplicationStatus } from "@/utils/applicationStatus";

interface JobApplicationTabsProps {
  jobId: string;
  companyId: string;
}

export function JobApplicationTabs({ jobId, companyId }: JobApplicationTabsProps) {
  const navigate = useNavigate();
  const location = useLocation();
  const urlParams = new URLSearchParams(location.search);
  const statusParam = urlParams.get("status") || "all";
  
  const [activeTab, setActiveTab] = useState(statusParam);

  // Sync URL with tab
  useEffect(() => {
    const newStatus = urlParams.get("status") || "all";
    if (newStatus !== activeTab) {
      setActiveTab(newStatus);
    }
  }, [location.search]);

  const handleTabChange = (value: string) => {
    setActiveTab(value);
    const params = new URLSearchParams(location.search);
    params.set("status", value);
    navigate(`${location.pathname}?${params.toString()}`, { replace: true });
  };

  // Fetch applications with candidates
  const { data: applications, isLoading, refetch } = useQuery({
    queryKey: ["job-applications", jobId, activeTab],
    queryFn: async () => {
      let query = supabase
        .from("applications")
        .select(`
          *,
          candidates (
            id,
            full_name,
            email,
            phone,
            city,
            country,
            skills,
            profile_image,
            experience_years,
            bio_short
          )
        `)
        .eq("job_id", jobId)
        .eq("company_id", companyId)
        .order("created_at", { ascending: false });

      if (activeTab !== "all" && activeTab !== "rejected" && activeTab !== "archived") {
        query = query.eq("status", activeTab as ApplicationStatus);
      }

      const { data, error } = await query;
      if (error) throw error;
      return data;
    },
  });

  const handleStatusChange = async (applicationId: string, newStatus: ApplicationStatus) => {
    try {
      await setApplicationStatus({
        applicationId,
        newStatus,
      });

      toast({
        title: "Status aktualisiert",
        description: "Der Bewerbungsstatus wurde erfolgreich geändert.",
      });

      refetch();
    } catch (error) {
      console.error("Error updating status:", error);
      toast({
        title: "Fehler",
        description: "Status konnte nicht aktualisiert werden.",
        variant: "destructive",
      });
    }
  };

  const handleViewProfile = (candidateId: string) => {
    navigate(`/company/candidates/${candidateId}?job=${jobId}`);
  };

  return (
    <Tabs value={activeTab} onValueChange={handleTabChange} className="w-full">
      <TabsList className="grid w-full grid-cols-6">
        <TabsTrigger value="all">Alle</TabsTrigger>
        <TabsTrigger value="new">Neu</TabsTrigger>
        <TabsTrigger value="unlocked">Freigeschaltet</TabsTrigger>
        <TabsTrigger value="interview">Gespräch</TabsTrigger>
        <TabsTrigger value="offer">Angebot</TabsTrigger>
        <TabsTrigger value="hired">Eingestellt</TabsTrigger>
      </TabsList>

      <TabsContent value={activeTab} className="mt-6">
        {isLoading ? (
          <div className="flex items-center justify-center py-12">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
          </div>
        ) : !applications || applications.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-muted-foreground">
              Keine Bewerbungen gefunden.
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {applications.map((app: any) => (
              <UnifiedCandidateCard
                key={app.id}
                candidate={{
                  id: app.candidates.id,
                  full_name: app.candidates.full_name,
                  email: app.candidates.email,
                  phone: app.candidates.phone,
                  city: app.candidates.city,
                  country: app.candidates.country,
                  skills: app.candidates.skills || [],
                  profile_image: app.candidates.profile_image,
                  experience_years: app.candidates.experience_years,
                  bio_short: app.candidates.bio_short,
                }}
                application={{
                  id: app.id,
                  status: app.status,
                  source: app.source,
                  created_at: app.created_at,
                  is_new: app.is_new,
                }}
                onStatusChange={(newStatus) => handleStatusChange(app.id, newStatus)}
                onViewDetails={() => handleViewProfile(app.candidates.id)}
                isUnlocked={app.status === "unlocked" || app.status === "interview" || app.status === "offer" || app.status === "hired"}
              />
            ))}
          </div>
        )}
      </TabsContent>
    </Tabs>
  );
}
