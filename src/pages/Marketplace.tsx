import { useState, useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { CommunityFeed } from "@/components/community/CommunityFeed";
import { CommunityFriends } from "@/components/community/CommunityFriends";
import { Users, TrendingUp } from "lucide-react";

const Community = () => {
  const [greeting, setGreeting] = useState("");

  // Get current user profile for greeting
  const { data: profile } = useQuery({
    queryKey: ["user-profile"],
    queryFn: async () => {
      const { data: user } = await supabase.auth.getUser();
      if (!user.user) return null;

      const { data } = await supabase
        .from("profiles")
        .select("full_name")
        .eq("id", user.user.id)
        .single();

      return data;
    },
  });

  useEffect(() => {
    const updateGreeting = () => {
      const hour = new Date().getHours();
      const firstName = profile?.full_name?.split(" ")[0] || "";
      
      if (hour >= 6 && hour < 12) {
        setGreeting(`Guten Morgen${firstName ? `, ${firstName}` : ""}!`);
      } else if (hour >= 12 && hour < 18) {
        setGreeting(`Guten Tag${firstName ? `, ${firstName}` : ""}!`);
      } else {
        setGreeting(`Guten Abend${firstName ? `, ${firstName}` : ""}!`);
      }
    };

    updateGreeting();
    const interval = setInterval(updateGreeting, 60000); // Update every minute

    return () => clearInterval(interval);
  }, [profile]);

  return (
    <div className="space-y-6">
      {/* Header with Time-based Greeting */}
      <div className="space-y-4">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">{greeting}</h1>
            <p className="text-muted-foreground">
              Tausche dich mit anderen Azubis aus, stelle Fragen und teile deine Erfahrungen
            </p>
          </div>
          <div className="flex items-center gap-4">
            <Badge variant="outline" className="flex items-center gap-2">
              <Users className="h-4 w-4" />
              1,234 Mitglieder
            </Badge>
            <Badge variant="outline" className="flex items-center gap-2">
              <TrendingUp className="h-4 w-4" />
              42 aktiv heute
            </Badge>
          </div>
        </div>
      </div>

      {/* Tabs for Feed and Friends */}
      <Tabs defaultValue="feed" className="w-full">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="feed">Feed</TabsTrigger>
          <TabsTrigger value="friends">Freunde</TabsTrigger>
        </TabsList>
        
        <TabsContent value="feed" className="space-y-6 mt-6">
          <CommunityFeed />
        </TabsContent>
        
        <TabsContent value="friends" className="space-y-6 mt-6">
          <CommunityFriends />
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default Community;