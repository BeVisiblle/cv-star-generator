import { useState } from "react";
import { useCompany } from "@/hooks/useCompany";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import { UnifiedCandidateCard } from "@/components/candidate/UnifiedCandidateCard";
import { ProfileManagementPanel } from "@/components/candidate/ProfileManagementPanel";
import { Search, SlidersHorizontal } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { searchCandidates, unlockCandidate } from "@/lib/api/applications";
import { toast } from "@/hooks/use-toast";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";

export default function CandidateSearch() {
  const { company } = useCompany();
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedProfile, setSelectedProfile] = useState<any>(null);
  const [panelOpen, setPanelOpen] = useState(false);

  const { data: candidates, isLoading, refetch } = useQuery({
    queryKey: ["search-candidates", company?.id, searchQuery],
    queryFn: async () => {
      if (!company?.id) return [];
      
      const result = await searchCandidates({
        companyId: company.id,
        searchText: searchQuery || undefined,
        limit: 50,
        offset: 0,
      });
      
      return result;
    },
    enabled: !!company?.id,
  });

  const handleUnlock = async (candidateId: string) => {
    if (!company?.id) return;

    try {
      await unlockCandidate({
        companyId: company.id,
        candidateId,
      });

      toast({
        title: "Profil freigeschaltet",
        description: "Sie können nun die Kontaktdaten einsehen.",
      });

      refetch();
    } catch (error: any) {
      toast({
        title: "Fehler",
        description: error.message || "Profil konnte nicht freigeschaltet werden.",
        variant: "destructive",
      });
    }
  };

  const handleViewProfile = (profile: any) => {
    setSelectedProfile(profile);
    setPanelOpen(true);
  };

  return (
    <div className="min-h-screen bg-background">
      <div className="max-w-[1600px] mx-auto px-6 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold mb-2">Kandidatensuche</h1>
          <p className="text-muted-foreground">
            Finden Sie passende Kandidaten für Ihre offenen Stellen
          </p>
        </div>

        {/* Search Bar */}
        <Card className="mb-6">
          <CardContent className="p-6">
            <div className="flex gap-3">
              <div className="flex-1 relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Nach Kandidaten suchen (Skills, Standort, Fachrichtung...)"
                  className="pl-10"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
              </div>
              <Button variant="outline">
                <SlidersHorizontal className="h-4 w-4 mr-2" />
                Filter
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Results */}
        {isLoading ? (
          <div className="flex items-center justify-center py-12">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
          </div>
        ) : !candidates || candidates.length === 0 ? (
          <Card>
            <CardContent className="py-12 text-center">
              <p className="text-muted-foreground">
                Keine Kandidaten gefunden. Versuchen Sie eine andere Suche.
              </p>
            </CardContent>
          </Card>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {candidates.map((candidate: any) => (
              <UnifiedCandidateCard
                key={candidate.id}
                candidate={{
                  id: candidate.id,
                  full_name: candidate.full_name,
                  email: candidate.email,
                  phone: candidate.phone,
                  city: candidate.city,
                  country: candidate.country,
                  skills: candidate.skills || [],
                  profile_image: candidate.profile_image,
                  experience_years: candidate.experience_years,
                  bio_short: candidate.bio_short,
                }}
                onViewDetails={() => handleViewProfile(candidate)}
                onUnlock={() => handleUnlock(candidate.id)}
                isUnlocked={candidate.is_unlocked}
              />
            ))}
          </div>
        )}
      </div>

      {/* Profile Panel */}
      <Sheet open={panelOpen} onOpenChange={setPanelOpen}>
        <SheetContent className="w-full sm:max-w-lg">
          <SheetHeader>
            <SheetTitle>Kandidatenprofil</SheetTitle>
            <SheetDescription>
              Detaillierte Informationen zum Kandidaten
            </SheetDescription>
          </SheetHeader>
          {selectedProfile && (
            <div className="mt-6">
              <ProfileManagementPanel
                profile={selectedProfile}
                isUnlocked={selectedProfile.is_unlocked}
                onUnlock={() => handleUnlock(selectedProfile.id)}
              />
            </div>
          )}
        </SheetContent>
      </Sheet>
    </div>
  );
}
