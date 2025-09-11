import React, { useEffect, useMemo, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { useConnections, type ConnectionState } from "@/hooks/useConnections";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Loader2, UserPlus, Check, X, MessageSquareMore, ArrowLeft, HandHeart } from "lucide-react";
import { LinkedInProfileHeader } from "@/components/linkedin/LinkedInProfileHeader";
import { LinkedInProfileMain } from "@/components/linkedin/LinkedInProfileMain";
import { LinkedInProfileSidebar } from "@/components/linkedin/LinkedInProfileSidebar";
import { LinkedInProfileExperience } from "@/components/linkedin/LinkedInProfileExperience";
import { LinkedInProfileEducation } from "@/components/linkedin/LinkedInProfileEducation";
import { LinkedInProfileActivity } from "@/components/linkedin/LinkedInProfileActivity";
import { RightRailAd } from "@/components/linkedin/right-rail/RightRailAd";
import { PeopleRecommendations } from "@/components/linkedin/right-rail/PeopleRecommendations";
import { CompanyRecommendations } from "@/components/linkedin/right-rail/CompanyRecommendations";
import { toast } from "@/hooks/use-toast";
import { InView } from "@/components/util/InView";
import { useCompanyInterest } from "@/hooks/useCompanyInterest";

export default function UserProfilePage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const { getStatuses, requestConnection, acceptRequest, declineRequest, cancelRequest } = useConnections();

  const [profile, setProfile] = useState<any | null>(null);
  const [loading, setLoading] = useState(true);
  const [status, setStatus] = useState<ConnectionState>("none");
  const [isCompanyMember, setIsCompanyMember] = useState(false);
  const { interested, loading: interestLoading, toggle: toggleInterest } = useCompanyInterest(id);

  const isOwner = !!user && user.id === id;
  const isConnected = status === "accepted" || isOwner;

  useEffect(() => {
    const load = async () => {
      if (!id) return;
      setLoading(true);
      try {
        const { data, error } = await supabase
          .from("profiles")
          .select("*")
          .eq("id", id)
          .maybeSingle();
        if (error) throw error;
        if (!data) {
          toast({ title: "Profil nicht gefunden", description: "Dieses Profil existiert nicht.", variant: "destructive" });
          navigate("/dashboard");
          return;
        }
        setProfile(data);

        if (user && user.id !== id) {
          const s = await getStatuses([id]);
          setStatus(s[id] || "none");
        }
      } catch (e) {
        console.error(e);
        toast({ title: "Fehler", description: "Profil konnte nicht geladen werden.", variant: "destructive" });
      } finally {
        setLoading(false);
      }
    };
    load();
  }, [id, user, getStatuses, navigate]);

  useEffect(() => {
    if (profile) {
      const name = [profile.vorname, profile.nachname].filter(Boolean).join(" ") || "Profil";
      document.title = `${name} – Azubi Community`;
    }
  }, [profile]);

  useEffect(() => {
    const check = async () => {
      if (!user) { setIsCompanyMember(false); return; }
      const { data } = await supabase.rpc('is_company_member');
      setIsCompanyMember(!!data);
    };
    check();
  }, [user]);

  const displayProfile = useMemo(() => {
    if (!profile) return null;
    if (isConnected) return profile;
    // restricted view: hide sensitive fields
    return {
      ...profile,
      nachname: profile.nachname ? `${String(profile.nachname).charAt(0)}.` : null,
      email: null,
      telefon: null,
      strasse: null,
      hausnummer: null,
      sprachen: [],
      faehigkeiten: [],
      kenntnisse: null,
      praktische_erfahrung: null,
      cv_url: null,
    };
  }, [profile, isConnected]);

  const onConnect = async () => {
    if (!id) return;
    try {
      await requestConnection(id);
      setStatus("pending");
      toast({ title: "Anfrage gesendet", description: "Wartet auf Bestätigung." });
    } catch (e) {
      console.error(e);
      toast({ title: "Fehler", description: "Anfrage konnte nicht gesendet werden.", variant: "destructive" });
    }
  };
  const onAccept = async () => {
    if (!id) return;
    try {
      await acceptRequest(id);
      setStatus("accepted");
      toast({ title: "Verbunden", description: "Ihr könnt jetzt chatten." });
    } catch (e) {
      console.error(e);
      toast({ title: "Fehler", description: "Anfrage konnte nicht angenommen werden.", variant: "destructive" });
    }
  };
  const onDecline = async () => {
    if (!id) return;
    try {
      await declineRequest(id);
      setStatus("declined");
    } catch (e) {
      console.error(e);
      toast({ title: "Fehler", description: "Anfrage konnte nicht abgelehnt werden.", variant: "destructive" });
    }
  };
  const onCancel = async () => {
    if (!id) return;
    try {
      await cancelRequest(id);
      setStatus("none");
    } catch (e) {
      console.error(e);
      toast({ title: "Fehler", description: "Anfrage konnte nicht zurückgezogen werden.", variant: "destructive" });
    }
  };

  if (loading || !displayProfile) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="flex items-center gap-2"><Loader2 className="h-6 w-6 animate-spin" /> Profil wird geladen…</div>
      </div>
    );
  }

  const renderActions = () => {
    if (isOwner) return null;
    if (status === "accepted") {
      return (
        <div className="flex gap-2">
          <Button onClick={() => navigate("/community/messages")} className="min-h-[44px]">
            <MessageSquareMore className="h-4 w-4 mr-1" /> Nachricht
          </Button>
        </div>
      );
    }
    if (status === "none" || !user) {
      return (
        <div className="flex gap-2">
          <Button onClick={onConnect} className="min-h-[44px]"><UserPlus className="h-4 w-4 mr-1" /> Vernetzen</Button>
        </div>
      );
    }
    if (status === "pending") {
      return (
        <div className="flex items-center gap-2">
          <Button variant="secondary" disabled className="min-h-[44px]"><Check className="h-4 w-4 mr-1" /> Ausstehend</Button>
          <Button variant="ghost" onClick={onCancel} className="min-h-[44px]"><X className="h-4 w-4" /> Zurückziehen</Button>
        </div>
      );
    }
    if (status === "incoming") {
      return (
        <div className="flex items-center gap-2">
          <Button onClick={onAccept} className="min-h-[44px]">Annehmen</Button>
          <Button variant="outline" onClick={onDecline} className="min-h-[44px]">Ablehnen</Button>
        </div>
      );
    }
    if (status === "declined") {
      return (
        <div className="flex items-center gap-2">
          <Button onClick={onConnect} className="min-h-[44px]">Erneut senden</Button>
        </div>
      );
    }
    return null;
  };

  return (
    <div className="px-0 md:px-2 lg:px-4 py-3 md:py-6 min-h-screen bg-background max-w-full overflow-x-hidden">
      <div className="w-full max-w-[560px] mx-auto px-4 md:max-w-none md:px-0">
        <div className="mb-4 md:mb-6 max-w-full">
          <div className="flex items-center justify-between gap-3">
            <Button variant="outline" className="flex items-center gap-2 w-fit min-h-[44px]" onClick={() => navigate(-1)}>
              <ArrowLeft className="h-4 w-4" /> Zurück
            </Button>
            <div className="flex items-center gap-2">
              {isCompanyMember && !isOwner && (
                <Button onClick={toggleInterest} disabled={interestLoading} variant={interested ? 'secondary' : 'default'} className="min-h-[44px]">
                  <HandHeart className="h-4 w-4 mr-1" /> {interested ? 'Interesse gezeigt' : 'Interesse zeigen'}
                </Button>
              )}
              {renderActions()}
            </div>
          </div>
        </div>

        <div className="mx-auto max-w-screen-2xl px-3 sm:px-6 lg:px-8 flex flex-col lg:grid lg:grid-cols-12 gap-4 md:gap-6">
          <main className="lg:col-span-8">
            <div className="w-full max-w-[560px] mx-auto px-4 md:max-w-none md:px-0 space-y-4 md:space-y-6">
              <LinkedInProfileHeader profile={displayProfile} isEditing={false} onProfileUpdate={() => {}} />
              <LinkedInProfileMain profile={displayProfile} isEditing={false} onProfileUpdate={() => {}} readOnly={!isOwner} />
              <LinkedInProfileExperience experiences={displayProfile?.berufserfahrung || []} isEditing={false} onExperiencesUpdate={() => {}} />
              <LinkedInProfileEducation education={displayProfile?.schulbildung || []} isEditing={false} onEducationUpdate={() => {}} />
              <LinkedInProfileActivity profile={displayProfile} />
            </div>
          </main>
          <aside className="lg:col-span-4">
            <div className="lg:sticky lg:top-24 space-y-4 md:space-y-6">
              <LinkedInProfileSidebar profile={displayProfile} isEditing={false} onProfileUpdate={() => {}} readOnly={!isOwner} showLanguagesAndSkills={isOwner} showLicenseAndStats={isOwner} showCVSection={isOwner} />
              <RightRailAd variant="card" size="sm" />
              <InView rootMargin="300px" placeholder={<div className="h-32 rounded-md bg-muted/50 animate-pulse" />}> 
                <PeopleRecommendations limit={5} showMoreLink="/entdecken/azubis" showMore={true} />
              </InView>
              <InView rootMargin="300px" placeholder={<div className="h-32 rounded-md bg-muted/50 animate-pulse" />}> 
                <CompanyRecommendations limit={3} />
              </InView>
              <RightRailAd variant="banner" size="sm" />
            </div>
          </aside>
        </div>
      </div>
    </div>
  );
}
