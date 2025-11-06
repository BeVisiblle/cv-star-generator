import { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "@/hooks/use-toast";
import { setApplicationStatus, unlockCandidate } from "@/lib/api/applications";
import type { ApplicationStatus } from "@/utils/applicationStatus";
import { MapPin, Briefcase, Mail, Phone, User, Calendar } from "lucide-react";
import { formatDistanceToNow } from "date-fns";
import { de } from "date-fns/locale";

interface JobApplicationTabsProps {
  jobId: string;
  companyId: string;
  job?: {
    title: string;
    city?: string;
    employment_type?: string;
    industry?: string;
  };
}

export function JobApplicationTabs({ jobId, companyId, job }: JobApplicationTabsProps) {
  const navigate = useNavigate();
  const location = useLocation();
  const urlParams = new URLSearchParams(location.search);
  const statusParam = urlParams.get("status") || "all";
  
  const [activeTab, setActiveTab] = useState(statusParam);
  const [selectedCandidate, setSelectedCandidate] = useState<any>(null);
  const [showUnlockModal, setShowUnlockModal] = useState(false);

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

  const handleUnlock = async (application: any) => {
    setSelectedCandidate(application);
    setShowUnlockModal(true);
  };

  const confirmUnlock = async () => {
    if (!selectedCandidate) return;
    
    try {
      await unlockCandidate({
        companyId: companyId,
        candidateId: selectedCandidate.candidates.id,
      });

      await handleStatusChange(selectedCandidate.id, "unlocked");

      toast({
        title: "Profil freigeschaltet",
        description: "Sie können nun die Kontaktdaten einsehen.",
      });

      setShowUnlockModal(false);
      setSelectedCandidate(null);
      refetch();
    } catch (error: any) {
      toast({
        title: "Fehler",
        description: error.message || "Profil konnte nicht freigeschaltet werden.",
        variant: "destructive",
      });
    }
  };

  const handleReject = async (applicationId: string) => {
    await handleStatusChange(applicationId, "rejected");
  };

  const getInitials = (name: string) => {
    return name
      .split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase()
      .slice(0, 2);
  };

  const statusCounts = {
    all: applications?.length || 0,
    new: applications?.filter((a: any) => a.status === "new").length || 0,
    unlocked: applications?.filter((a: any) => a.status === "unlocked").length || 0,
    interview: applications?.filter((a: any) => a.status === "interview").length || 0,
    offer: applications?.filter((a: any) => a.status === "offer").length || 0,
    hired: applications?.filter((a: any) => a.status === "hired").length || 0,
  };

  return (
    <div className="space-y-6">
      {/* Job Preview Card */}
      {job && (
        <Card>
          <CardHeader>
            <div className="flex items-start justify-between">
              <div>
                <CardTitle className="text-2xl mb-2">{job.title}</CardTitle>
                <div className="flex flex-wrap gap-3 text-sm text-muted-foreground">
                  {job.city && (
                    <div className="flex items-center gap-1">
                      <MapPin className="h-4 w-4" />
                      {job.city}
                    </div>
                  )}
                  {job.employment_type && (
                    <div className="flex items-center gap-1">
                      <Briefcase className="h-4 w-4" />
                      {job.employment_type}
                    </div>
                  )}
                  {job.industry && (
                    <Badge variant="secondary">{job.industry}</Badge>
                  )}
                </div>
              </div>
              <div className="text-right">
                <div className="text-2xl font-bold text-primary">
                  {statusCounts.all}
                </div>
                <div className="text-sm text-muted-foreground">
                  {statusCounts.all === 1 ? "Bewerber:in" : "Bewerber:innen"}
                </div>
              </div>
            </div>
          </CardHeader>
        </Card>
      )}

      <Tabs value={activeTab} onValueChange={handleTabChange} className="w-full">
        <TabsList className="grid w-full grid-cols-6">
          <TabsTrigger value="all">
            Alle {statusCounts.all > 0 && <span className="ml-1">({statusCounts.all})</span>}
          </TabsTrigger>
          <TabsTrigger value="new">
            Neu {statusCounts.new > 0 && <span className="ml-1">({statusCounts.new})</span>}
          </TabsTrigger>
          <TabsTrigger value="unlocked">
            Freigeschaltet {statusCounts.unlocked > 0 && <span className="ml-1">({statusCounts.unlocked})</span>}
          </TabsTrigger>
          <TabsTrigger value="interview">
            Gespräch {statusCounts.interview > 0 && <span className="ml-1">({statusCounts.interview})</span>}
          </TabsTrigger>
          <TabsTrigger value="offer">
            Angebot {statusCounts.offer > 0 && <span className="ml-1">({statusCounts.offer})</span>}
          </TabsTrigger>
          <TabsTrigger value="hired">
            Eingestellt {statusCounts.hired > 0 && <span className="ml-1">({statusCounts.hired})</span>}
          </TabsTrigger>
        </TabsList>

        <TabsContent value={activeTab} className="mt-6">
          {isLoading ? (
            <div className="flex items-center justify-center py-12">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
            </div>
          ) : !applications || applications.length === 0 ? (
            <Card>
              <CardContent className="py-12 text-center">
                <p className="text-muted-foreground">
                  Keine Bewerbungen gefunden.
                </p>
              </CardContent>
            </Card>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {applications.map((app: any) => {
                const candidate = app.candidates;
                const isUnlocked = ["unlocked", "interview", "offer", "hired"].includes(app.status);
                
                return (
                  <Card key={app.id} className="hover:shadow-soft-lg transition-all">
                    <CardHeader className="pb-3">
                      <div className="flex items-start justify-between mb-3">
                        <div className="flex items-center gap-3">
                          <Avatar className="h-12 w-12">
                            <AvatarImage src={candidate.profile_image} />
                            <AvatarFallback className="bg-primary/10 text-primary">
                              {getInitials(candidate.full_name)}
                            </AvatarFallback>
                          </Avatar>
                          <div>
                            <h3 className="font-semibold text-base">{candidate.full_name}</h3>
                            <div className="flex items-center gap-1 text-xs text-muted-foreground">
                              <MapPin className="h-3 w-3" />
                              {candidate.city || "Kein Ort"}
                            </div>
                          </div>
                        </div>
                        <Badge
                          className={
                            app.status === "new"
                              ? "bg-blue-500 hover:bg-blue-600"
                              : app.status === "unlocked"
                              ? "bg-yellow-500 hover:bg-yellow-600"
                              : app.status === "interview"
                              ? "bg-green-500 hover:bg-green-600"
                              : app.status === "rejected"
                              ? "bg-red-500 hover:bg-red-600"
                              : "bg-gray-500 hover:bg-gray-600"
                          }
                        >
                          {app.status === "new" && "Neu"}
                          {app.status === "unlocked" && "Freigeschaltet"}
                          {app.status === "interview" && "Gespräch"}
                          {app.status === "offer" && "Angebot"}
                          {app.status === "hired" && "Eingestellt"}
                          {app.status === "rejected" && "Abgelehnt"}
                        </Badge>
                      </div>
                      
                      {candidate.bio_short && (
                        <p className="text-sm text-muted-foreground line-clamp-2 mb-3">
                          {candidate.bio_short}
                        </p>
                      )}
                      
                      {isUnlocked && (
                        <div className="space-y-1 text-xs mb-3">
                          {candidate.email && (
                            <div className="flex items-center gap-2">
                              <Mail className="h-3 w-3 text-muted-foreground" />
                              <a href={`mailto:${candidate.email}`} className="text-primary hover:underline">
                                {candidate.email}
                              </a>
                            </div>
                          )}
                          {candidate.phone && (
                            <div className="flex items-center gap-2">
                              <Phone className="h-3 w-3 text-muted-foreground" />
                              <a href={`tel:${candidate.phone}`} className="text-primary hover:underline">
                                {candidate.phone}
                              </a>
                            </div>
                          )}
                        </div>
                      )}

                      {candidate.skills && candidate.skills.length > 0 && (
                        <div className="flex flex-wrap gap-1.5 mb-3">
                          {candidate.skills.slice(0, 3).map((skill: string) => (
                            <Badge key={skill} variant="outline" className="text-xs">
                              {skill}
                            </Badge>
                          ))}
                          {candidate.skills.length > 3 && (
                            <Badge variant="outline" className="text-xs">
                              +{candidate.skills.length - 3}
                            </Badge>
                          )}
                        </div>
                      )}
                      
                      <div className="flex items-center gap-1 text-xs text-muted-foreground">
                        <Calendar className="h-3 w-3" />
                        Beworben {formatDistanceToNow(new Date(app.created_at), { addSuffix: true, locale: de })}
                      </div>
                    </CardHeader>
                    
                    <CardContent className="pt-0">
                      {/* Buttons based on status */}
                      {app.status === "new" && (
                        <div className="flex gap-2">
                          <Button
                            onClick={() => handleUnlock(app)}
                            className="flex-1 bg-[#2563EB] hover:bg-[#1d4ed8]"
                            size="sm"
                          >
                            Profil freischalten
                          </Button>
                          <Button
                            onClick={() => handleReject(app.id)}
                            variant="outline"
                            size="sm"
                          >
                            Ablehnen
                          </Button>
                        </div>
                      )}
                      
                      {app.status === "unlocked" && (
                        <div className="flex gap-2">
                          <Button
                            onClick={() => handleStatusChange(app.id, "interview")}
                            className="flex-1 bg-[#22C55E] hover:bg-[#16a34a]"
                            size="sm"
                          >
                            Gespräch
                          </Button>
                          <Button
                            onClick={() => handleReject(app.id)}
                            className="bg-[#EF4444] hover:bg-[#dc2626] text-white"
                            size="sm"
                          >
                            Absagen
                          </Button>
                        </div>
                      )}
                      
                      {app.status === "interview" && (
                        <Button
                          disabled
                          className="w-full bg-[#22C55E] hover:bg-[#16a34a]"
                          size="sm"
                        >
                          Gespräch geplant
                        </Button>
                      )}
                      
                      {app.status === "rejected" && (
                        <Button
                          disabled
                          className="w-full bg-[#EF4444] hover:bg-[#dc2626] text-white"
                          size="sm"
                        >
                          Abgelehnt
                        </Button>
                      )}

                      {app.status === "offer" && (
                        <Button
                          onClick={() => handleStatusChange(app.id, "hired")}
                          className="w-full bg-[#22C55E] hover:bg-[#16a34a]"
                          size="sm"
                        >
                          Einstellen
                        </Button>
                      )}

                      {app.status === "hired" && (
                        <Button
                          disabled
                          className="w-full bg-[#22C55E] hover:bg-[#16a34a]"
                          size="sm"
                        >
                          Eingestellt
                        </Button>
                      )}
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          )}
        </TabsContent>
      </Tabs>

      {/* Unlock Modal */}
      <Dialog open={showUnlockModal} onOpenChange={setShowUnlockModal}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Profil freischalten</DialogTitle>
          </DialogHeader>
          
          {selectedCandidate && (
            <div className="space-y-4">
              <div className="flex items-center gap-3">
                <Avatar className="h-16 w-16">
                  <AvatarImage src={selectedCandidate.candidates.profile_image} />
                  <AvatarFallback className="bg-primary/10 text-primary text-lg">
                    {getInitials(selectedCandidate.candidates.full_name)}
                  </AvatarFallback>
                </Avatar>
                <div>
                  <h3 className="font-semibold text-lg">{selectedCandidate.candidates.full_name}</h3>
                  <div className="flex items-center gap-1 text-sm text-muted-foreground">
                    <MapPin className="h-3 w-3" />
                    {selectedCandidate.candidates.city}
                  </div>
                </div>
              </div>
              
              {selectedCandidate.candidates.bio_short && (
                <div>
                  <h4 className="font-medium text-sm mb-1">Über mich</h4>
                  <p className="text-sm text-muted-foreground">{selectedCandidate.candidates.bio_short}</p>
                </div>
              )}
              
              {selectedCandidate.candidates.skills && selectedCandidate.candidates.skills.length > 0 && (
                <div>
                  <h4 className="font-medium text-sm mb-2">Skills</h4>
                  <div className="flex flex-wrap gap-1.5">
                    {selectedCandidate.candidates.skills.map((skill: string) => (
                      <Badge key={skill} variant="outline" className="text-xs">
                        {skill}
                      </Badge>
                    ))}
                  </div>
                </div>
              )}
              
              {selectedCandidate.candidates.experience_years !== undefined && (
                <div>
                  <h4 className="font-medium text-sm mb-1">Berufserfahrung</h4>
                  <p className="text-sm text-muted-foreground">
                    {selectedCandidate.candidates.experience_years} Jahre
                  </p>
                </div>
              )}
              
              <div className="bg-muted p-3 rounded-lg">
                <p className="text-sm text-muted-foreground">
                  Nach dem Freischalten erhalten Sie Zugriff auf die vollständigen Kontaktdaten dieses Kandidaten.
                </p>
              </div>
              
              <div className="flex gap-2 pt-2">
                <Button
                  onClick={confirmUnlock}
                  className="flex-1 bg-[#2563EB] hover:bg-[#1d4ed8]"
                >
                  Freischalten
                </Button>
                <Button
                  onClick={() => {
                    handleReject(selectedCandidate.id);
                    setShowUnlockModal(false);
                    setSelectedCandidate(null);
                  }}
                  variant="outline"
                >
                  Ablehnen
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
