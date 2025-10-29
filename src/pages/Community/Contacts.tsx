import React, { useState, useMemo } from "react";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Input } from "@/components/ui/input";
import { Search } from "lucide-react";
import { ConnectionRequestCard } from "@/components/community/ConnectionRequestCard";
import { CompanyFollowRequestCard } from "@/components/community/CompanyFollowRequestCard";
import { FriendCard } from "@/components/community/FriendCard";
import { FollowedCompanyCard } from "@/components/community/FollowedCompanyCard";
import { useConnections } from "@/hooks/useConnections";
import { useFollowRelations } from "@/hooks/useFollowRelations";
import { Badge } from "@/components/ui/badge";

interface BasicProfile {
  id: string;
  vorname: string | null;
  nachname: string | null;
  avatar_url: string | null;
  headline: string | null;
  ort: string | null;
  branche: string | null;
}

export default function Contacts() {
  const { user } = useAuth();
  const { acceptRequest, declineRequest, cancelRequest } = useConnections();
  const {
    companyFollowRequests,
    followedCompanies,
    loading: followLoading,
    acceptCompanyFollow,
    declineCompanyFollow,
    unfollowCompany,
    refetch: refetchFollows,
  } = useFollowRelations();

  const [incoming, setIncoming] = React.useState<string[]>([]);
  const [outgoing, setOutgoing] = React.useState<string[]>([]);
  const [friends, setFriends] = React.useState<string[]>([]);
  const [profiles, setProfiles] = React.useState<Record<string, BasicProfile>>({});
  const [loading, setLoading] = React.useState(true);

  // Search states
  const [friendsSearch, setFriendsSearch] = useState("");
  const [requestsSearch, setRequestsSearch] = useState("");
  const [companiesSearch, setCompaniesSearch] = useState("");

  const fullName = (p?: BasicProfile) =>
    [p?.vorname, p?.nachname].filter(Boolean).join(" ") || "Unbekannt";

  const load = React.useCallback(async () => {
    if (!user) return;
    setLoading(true);
    try {
      const [inc, out, acc] = await Promise.all([
        supabase
          .from("connections")
          .select("requester_id")
          .eq("addressee_id", user.id)
          .eq("status", "pending"),
        supabase
          .from("connections")
          .select("addressee_id")
          .eq("requester_id", user.id)
          .eq("status", "pending"),
        supabase
          .from("connections")
          .select("requester_id,addressee_id")
          .or(`requester_id.eq.${user.id},addressee_id.eq.${user.id}`)
          .eq("status", "accepted"),
      ]);

      const incIds = (inc.data || []).map((r) => (r as any).requester_id as string);
      const outIds = (out.data || []).map((r) => (r as any).addressee_id as string);
      const friendIds = (acc.data || []).map((r) =>
        (r as any).requester_id === user.id
          ? (r as any).addressee_id
          : (r as any).requester_id
      ) as string[];

      setIncoming(incIds);
      setOutgoing(outIds);
      setFriends(friendIds);

      const ids = Array.from(new Set([...incIds, ...outIds, ...friendIds]));
      if (ids.length) {
        const { data: profs } = await supabase
          .from("profiles")
          .select("id, vorname, nachname, avatar_url, headline, ort, branche")
          .in("id", ids);
        const map: Record<string, BasicProfile> = {};
        (profs || []).forEach((p: any) => {
          map[p.id] = p;
        });
        setProfiles(map);
      } else {
        setProfiles({});
      }
    } finally {
      setLoading(false);
    }
  }, [user]);

  React.useEffect(() => {
    load();
  }, [load]);

  const handleAccept = async (id: string) => {
    await acceptRequest(id);
    await load();
  };

  const handleDecline = async (id: string) => {
    await declineRequest(id);
    await load();
  };

  const handleCancel = async (id: string) => {
    await cancelRequest(id);
    await load();
  };

  const handleAcceptCompany = async (followId: string, companyId: string) => {
    await acceptCompanyFollow(followId, companyId);
    await refetchFollows();
  };

  const handleDeclineCompany = async (followId: string) => {
    await declineCompanyFollow(followId);
    await refetchFollows();
  };

  const handleUnfollowCompany = async (followId: string) => {
    await unfollowCompany(followId);
  };

  // Filtered lists
  const filteredFriends = useMemo(() => {
    if (!friendsSearch.trim()) return friends;
    const search = friendsSearch.toLowerCase();
    return friends.filter(id => {
      const profile = profiles[id];
      const name = fullName(profile).toLowerCase();
      const headline = profile?.headline?.toLowerCase() || "";
      const location = profile?.ort?.toLowerCase() || "";
      return name.includes(search) || headline.includes(search) || location.includes(search);
    });
  }, [friends, friendsSearch, profiles]);

  const filteredIncoming = useMemo(() => {
    if (!requestsSearch.trim()) return incoming;
    const search = requestsSearch.toLowerCase();
    return incoming.filter(id => {
      const profile = profiles[id];
      const name = fullName(profile).toLowerCase();
      return name.includes(search);
    });
  }, [incoming, requestsSearch, profiles]);

  const filteredOutgoing = useMemo(() => {
    if (!requestsSearch.trim()) return outgoing;
    const search = requestsSearch.toLowerCase();
    return outgoing.filter(id => {
      const profile = profiles[id];
      const name = fullName(profile).toLowerCase();
      return name.includes(search);
    });
  }, [outgoing, requestsSearch, profiles]);

  const filteredCompanyRequests = useMemo(() => {
    if (!requestsSearch.trim()) return companyFollowRequests;
    const search = requestsSearch.toLowerCase();
    return companyFollowRequests.filter(req => 
      req.company.name.toLowerCase().includes(search) ||
      req.company.industry?.toLowerCase().includes(search) ||
      req.company.main_location?.toLowerCase().includes(search)
    );
  }, [companyFollowRequests, requestsSearch]);

  const filteredCompanies = useMemo(() => {
    if (!companiesSearch.trim()) return followedCompanies;
    const search = companiesSearch.toLowerCase();
    return followedCompanies.filter(company => 
      company.company.name.toLowerCase().includes(search) ||
      company.company.industry?.toLowerCase().includes(search) ||
      company.company.main_location?.toLowerCase().includes(search)
    );
  }, [followedCompanies, companiesSearch]);

  const totalRequests = incoming.length + outgoing.length + companyFollowRequests.length;

  return (
    <main className="w-full py-3 px-3 max-w-7xl mx-auto pb-[56px] md:pb-6">
      <h1 className="text-xl font-semibold mb-4">Meine Kontakte</h1>

      <Tabs defaultValue="friends" className="w-full">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="friends">Freunde</TabsTrigger>
          <TabsTrigger value="requests" className="relative">
            Anfragen
            {totalRequests > 0 && (
              <Badge 
                variant="secondary" 
                className="ml-2 bg-blue-100 text-blue-700 dark:bg-blue-900 dark:text-blue-300"
              >
                {totalRequests}
              </Badge>
            )}
          </TabsTrigger>
          <TabsTrigger value="companies">Unternehmen</TabsTrigger>
        </TabsList>

        {/* Tab 1: Freunde */}
        <TabsContent value="friends" className="space-y-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Freunde durchsuchen..."
              value={friendsSearch}
              onChange={(e) => setFriendsSearch(e.target.value)}
              className="pl-10"
            />
          </div>

          {loading && <div className="text-sm text-muted-foreground">Lädt…</div>}
          {!loading && filteredFriends.length === 0 && (
            <div className="text-sm text-muted-foreground text-center py-8">
              {friendsSearch ? 'Keine passenden Freunde gefunden.' : 'Noch keine Verbindungen.'}
            </div>
          )}
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {filteredFriends.map((id) => (
              <FriendCard
                key={id}
                id={id}
                name={fullName(profiles[id])}
                avatarUrl={profiles[id]?.avatar_url ?? undefined}
                headline={profiles[id]?.headline ?? undefined}
                location={profiles[id]?.ort ?? undefined}
                branche={profiles[id]?.branche ?? undefined}
              />
            ))}
          </div>
        </TabsContent>

        {/* Tab 2: Anfragen */}
        <TabsContent value="requests" className="space-y-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Anfragen durchsuchen..."
              value={requestsSearch}
              onChange={(e) => setRequestsSearch(e.target.value)}
              className="pl-10"
            />
          </div>

          {/* Eingehende Connection-Anfragen */}
          {filteredIncoming.length > 0 && (
            <div>
              <h2 className="text-sm font-semibold mb-3">Eingehende Anfragen</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {filteredIncoming.map((id) => (
                  <ConnectionRequestCard
                    key={id}
                    id={id}
                    name={fullName(profiles[id])}
                    avatarUrl={profiles[id]?.avatar_url ?? undefined}
                    headline={profiles[id]?.headline ?? undefined}
                    location={profiles[id]?.ort ?? undefined}
                    type="incoming"
                    onAccept={() => handleAccept(id)}
                    onDecline={() => handleDecline(id)}
                    loading={loading}
                  />
                ))}
              </div>
            </div>
          )}

          {/* Follow-Anfragen von Unternehmen */}
          {filteredCompanyRequests.length > 0 && (
            <div>
              <h2 className="text-sm font-semibold mb-3">Unternehmen möchten Ihnen folgen</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {filteredCompanyRequests.map((req) => (
                  <CompanyFollowRequestCard
                    key={req.id}
                    id={req.id}
                    companyId={req.follower_id}
                    companyName={req.company.name}
                    logoUrl={req.company.logo_url ?? undefined}
                    industry={req.company.industry ?? undefined}
                    location={req.company.main_location ?? undefined}
                    onAccept={handleAcceptCompany}
                    onDecline={handleDeclineCompany}
                    loading={followLoading}
                  />
                ))}
              </div>
            </div>
          )}

          {/* Ausgehende Connection-Anfragen */}
          {filteredOutgoing.length > 0 && (
            <div>
              <h2 className="text-sm font-semibold mb-3">Gesendete Anfragen</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {filteredOutgoing.map((id) => (
                  <ConnectionRequestCard
                    key={id}
                    id={id}
                    name={fullName(profiles[id])}
                    avatarUrl={profiles[id]?.avatar_url ?? undefined}
                    headline={profiles[id]?.headline ?? undefined}
                    type="outgoing"
                    onCancel={() => handleCancel(id)}
                    loading={loading}
                  />
                ))}
              </div>
            </div>
          )}

          {loading && <div className="text-sm text-muted-foreground">Lädt…</div>}
          {!loading && totalRequests === 0 && (
            <div className="text-sm text-muted-foreground text-center py-8">
              Keine ausstehenden Anfragen.
            </div>
          )}
          {!loading && requestsSearch && filteredIncoming.length === 0 && filteredOutgoing.length === 0 && filteredCompanyRequests.length === 0 && totalRequests > 0 && (
            <div className="text-sm text-muted-foreground text-center py-8">
              Keine passenden Anfragen gefunden.
            </div>
          )}
        </TabsContent>

        {/* Tab 3: Unternehmen */}
        <TabsContent value="companies" className="space-y-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Unternehmen durchsuchen..."
              value={companiesSearch}
              onChange={(e) => setCompaniesSearch(e.target.value)}
              className="pl-10"
            />
          </div>

          {!followLoading && filteredCompanies.length === 0 && (
            <div className="text-sm text-muted-foreground text-center py-8">
              {companiesSearch ? 'Keine passenden Unternehmen gefunden.' : 'Sie folgen noch keinen Unternehmen.'}
            </div>
          )}
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {filteredCompanies.map((company) => (
              <FollowedCompanyCard
                key={company.id}
                followId={company.id}
                companyId={company.followee_id}
                companyName={company.company.name}
                logoUrl={company.company.logo_url ?? undefined}
                industry={company.company.industry ?? undefined}
                location={company.company.main_location ?? undefined}
                onUnfollow={handleUnfollowCompany}
                loading={followLoading}
              />
            ))}
          </div>
        </TabsContent>
      </Tabs>
    </main>
  );
}
