import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { Search, UserPlus, UserMinus, MessageCircle } from "lucide-react";

export const CommunityFriends = () => {
  const [searchQuery, setSearchQuery] = useState("");
  const queryClient = useQueryClient();
  const { toast } = useToast();

  // Get current user's connections
  const { data: connections } = useQuery({
    queryKey: ["user-connections"],
    queryFn: async () => {
      const { data: user } = await supabase.auth.getUser();
      if (!user.user) return [];

      const { data, error } = await supabase
        .from("connections")
        .select("*")
        .eq("follower_id", user.user.id);

      if (error) throw error;

      // Get profile data for each connection
      const connectionIds = data?.map(conn => conn.following_id) || [];
      if (connectionIds.length === 0) return [];

      const { data: profiles, error: profileError } = await supabase
        .from("profiles")
        .select("id, full_name, avatar_url, ausbildungsberuf, location")
        .in("id", connectionIds);

      if (profileError) throw profileError;

      // Combine connections with profiles
      const connectionsWithProfiles = data?.map(conn => ({
        ...conn,
        following: profiles?.find(p => p.id === conn.following_id)
      })) || [];

      return connectionsWithProfiles;
    },
  });

  // Search for users
  const { data: searchResults } = useQuery({
    queryKey: ["user-search", searchQuery],
    queryFn: async () => {
      if (!searchQuery.trim()) return [];

      const { data: user } = await supabase.auth.getUser();
      if (!user.user) return [];

      const { data, error } = await supabase
        .from("profiles")
        .select("id, full_name, avatar_url, ausbildungsberuf, location")
        .neq("id", user.user.id)
        .or(`full_name.ilike.%${searchQuery}%,ausbildungsberuf.ilike.%${searchQuery}%`)
        .limit(10);

      if (error) throw error;
      return data;
    },
    enabled: !!searchQuery.trim(),
  });

  const followMutation = useMutation({
    mutationFn: async (targetUserId: string) => {
      const { data: user } = await supabase.auth.getUser();
      if (!user.user) throw new Error("Not authenticated");

      const { error } = await supabase
        .from("connections")
        .insert({
          follower_id: user.user.id,
          following_id: targetUserId,
        });

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["user-connections"] });
      toast({
        title: "Verbindung hinzugefügt",
        description: "Du folgst jetzt diesem Nutzer.",
      });
    },
  });

  const unfollowMutation = useMutation({
    mutationFn: async (connectionId: string) => {
      const { error } = await supabase
        .from("connections")
        .delete()
        .eq("id", connectionId);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["user-connections"] });
      toast({
        title: "Verbindung entfernt",
        description: "Du folgst diesem Nutzer nicht mehr.",
      });
    },
  });

  const isFollowing = (userId: string) => {
    return connections?.some(conn => conn.following_id === userId);
  };

  const getConnectionId = (userId: string) => {
    return connections?.find(conn => conn.following_id === userId)?.id;
  };

  return (
    <div className="space-y-6">
      {/* Search Section */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Search className="h-5 w-5" />
            Neue Verbindungen finden
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <Input
            placeholder="Nach Namen oder Ausbildungsberuf suchen..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />

          {searchResults && searchResults.length > 0 && (
            <div className="space-y-3">
              {searchResults.map((user) => (
                <div key={user.id} className="flex items-center justify-between p-3 border rounded-lg">
                  <div className="flex items-center space-x-3">
                    <Avatar className="h-10 w-10">
                      <AvatarImage src={user.avatar_url} />
                      <AvatarFallback>{user.full_name?.[0] || "U"}</AvatarFallback>
                    </Avatar>
                    <div>
                      <div className="font-medium">{user.full_name}</div>
                      <div className="text-sm text-muted-foreground">
                        {user.ausbildungsberuf && (
                          <Badge variant="outline" className="mr-2">
                            {user.ausbildungsberuf}
                          </Badge>
                        )}
                        {user.location}
                      </div>
                    </div>
                  </div>
                  <Button
                    variant={isFollowing(user.id) ? "outline" : "default"}
                    size="sm"
                    onClick={() => {
                      if (isFollowing(user.id)) {
                        const connectionId = getConnectionId(user.id);
                        if (connectionId) {
                          unfollowMutation.mutate(connectionId);
                        }
                      } else {
                        followMutation.mutate(user.id);
                      }
                    }}
                  >
                    {isFollowing(user.id) ? (
                      <>
                        <UserMinus className="h-4 w-4 mr-2" />
                        Entfolgen
                      </>
                    ) : (
                      <>
                        <UserPlus className="h-4 w-4 mr-2" />
                        Folgen
                      </>
                    )}
                  </Button>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Friends List */}
      <Card>
        <CardHeader>
          <CardTitle>
            Meine Verbindungen ({connections?.length || 0})
          </CardTitle>
        </CardHeader>
        <CardContent>
          {connections && connections.length > 0 ? (
            <div className="space-y-3">
              {connections.map((connection) => (
                <div key={connection.id} className="flex items-center justify-between p-3 border rounded-lg">
                  <div className="flex items-center space-x-3">
                    <Avatar className="h-10 w-10">
                      <AvatarImage src={connection.following?.avatar_url} />
                      <AvatarFallback>
                        {connection.following?.full_name?.[0] || "U"}
                      </AvatarFallback>
                    </Avatar>
                    <div>
                      <div className="font-medium">
                        {connection.following?.full_name || "Unbekannter Nutzer"}
                      </div>
                      <div className="text-sm text-muted-foreground">
                        {connection.following?.ausbildungsberuf && (
                          <Badge variant="outline" className="mr-2">
                            {connection.following.ausbildungsberuf}
                          </Badge>
                        )}
                        {connection.following?.location}
                      </div>
                    </div>
                  </div>
                  <div className="flex space-x-2">
                    <Button variant="outline" size="sm">
                      <MessageCircle className="h-4 w-4 mr-2" />
                      Nachricht
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => unfollowMutation.mutate(connection.id)}
                    >
                      <UserMinus className="h-4 w-4 mr-2" />
                      Entfolgen
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-8 text-muted-foreground">
              <p>Du hast noch keine Verbindungen.</p>
              <p className="text-sm">Suche nach anderen Azubis und folge ihnen!</p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};