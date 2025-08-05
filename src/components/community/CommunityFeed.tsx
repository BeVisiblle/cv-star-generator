import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Card } from '@/components/ui/card';
import PostCard from './PostCard';
import { Loader2 } from 'lucide-react';

export default function CommunityFeed() {
  const { data: posts, isLoading, error } = useQuery({
    queryKey: ['community-posts'],
    queryFn: async () => {
      const { data: posts, error } = await supabase
        .from('posts')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;

      // Get profile data for each post
      const userIds = posts?.map(post => post.user_id) || [];
      if (userIds.length === 0) return [];

      const { data: profiles, error: profileError } = await supabase
        .from("profiles")
        .select("id, vorname, nachname, avatar_url, ausbildungsberuf")
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

  // Temporarily disable real-time subscription due to database schema issues
  // useEffect(() => {
  //   const channel = supabase
  //     .channel('posts_changes')
  //     .on(
  //       'postgres_changes',
  //       {
  //         event: '*',
  //         schema: 'public',
  //         table: 'posts',
  //       },
  //       () => {
  //         queryClient.invalidateQueries({ queryKey: ['community-posts'] });
  //       }
  //     )
  //     .subscribe();

  //   return () => {
  //     channel.unsubscribe();
  //   };
  // }, [queryClient]);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center p-8">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    );
  }

  if (error) {
    return (
      <Card className="p-6">
        <p className="text-center text-muted-foreground">
          Fehler beim Laden der Beiträge. Bitte versuche es später erneut.
        </p>
      </Card>
    );
  }

  if (!posts || posts.length === 0) {
    return (
      <Card className="p-6">
        <p className="text-center text-muted-foreground">
          Noch keine Beiträge vorhanden. Sei der erste, der etwas teilt!
        </p>
      </Card>
    );
  }

  return (
    <div className="space-y-4">
      {posts.map((post) => (
        <PostCard key={post.id} post={post} />
      ))}
    </div>
  );
}