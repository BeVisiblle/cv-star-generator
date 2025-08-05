import { useState, useEffect } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { CreatePost } from "./CreatePost";
import { PostCard } from "./PostCard";
import { Button } from "@/components/ui/button";
import { RefreshCw } from "lucide-react";

export const CommunityFeed = () => {
  const queryClient = useQueryClient();

  const { data: posts, isLoading, refetch } = useQuery({
    queryKey: ["community-posts"],
    queryFn: async () => {
      const { data: posts, error } = await supabase
        .from("posts")
        .select("*")
        .order("created_at", { ascending: false });

      if (error) throw error;

      // Get profile data for each post
      const userIds = posts?.map(post => post.user_id) || [];
      if (userIds.length === 0) return [];

      const { data: profiles, error: profileError } = await supabase
        .from("profiles")
        .select("id, full_name, avatar_url, ausbildungsberuf")
        .in("id", userIds);

      if (profileError) throw profileError;

      // Combine posts with profiles
      const postsWithProfiles = posts?.map(post => ({
        ...post,
        author: profiles?.find(p => p.id === post.user_id)
      })) || [];

      return postsWithProfiles;
    },
  });

  // Set up real-time subscription for posts
  useEffect(() => {
    const channel = supabase
      .channel('posts_changes')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'posts'
        },
        (payload) => {
          console.log('Post change received:', payload);
          queryClient.invalidateQueries({ queryKey: ["community-posts"] });
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [queryClient]);

  if (isLoading) {
    return (
      <div className="space-y-6">
        <CreatePost />
        <div className="text-center py-8">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <CreatePost />
      
      <div className="flex justify-between items-center">
        <h2 className="text-lg font-semibold">Neueste Beiträge</h2>
        <Button variant="outline" size="sm" onClick={() => refetch()}>
          <RefreshCw className="h-4 w-4 mr-2" />
          Aktualisieren
        </Button>
      </div>

      <div className="space-y-6">
        {posts && posts.length > 0 ? (
          posts.map((post) => (
            <PostCard key={post.id} post={post} />
          ))
        ) : (
          <div className="text-center py-8 text-muted-foreground">
            <p>Noch keine Beiträge vorhanden.</p>
            <p className="text-sm">Sei der erste und teile etwas mit der Community!</p>
          </div>
        )}
      </div>
    </div>
  );
};