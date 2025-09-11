import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/hooks/useAuth';

export interface LinkedInPost {
  id: string;
  author_id: string;
  body: string;
  attachments: any[];
  visibility: string;
  like_count: number;
  comment_count: number;
  repost_count: number;
  created_at: string;
  updated_at: string;
  author?: {
    id: string;
    vorname?: string;
    nachname?: string;
    headline?: string;
    avatar_url?: string;
  };
  liked_by_user?: boolean;
}

// Simplified version for demo purposes - maps existing posts table
export interface DemoPost {
  id: string;
  user_id: string;
  content: string;
  image_url?: string;
  created_at: string;
  updated_at: string;
  visibility: string;
  author?: {
    id: string;
    vorname?: string;
    nachname?: string;
    headline?: string;
    avatar_url?: string;
  };
}

export interface LinkedInComment {
  id: string;
  post_id: string;
  parent_id: string | null;
  author_id: string;
  body: string;
  attachments: any[];
  like_count: number;
  reply_count: number;
  created_at: string;
  author?: {
    id: string;
    vorname?: string;
    nachname?: string;
    headline?: string;
    avatar_url?: string;
  };
  liked_by_user?: boolean;
  replies?: LinkedInComment[];
}

// Demo function - returns mock data since database tables don't match yet
export const useLinkedInPosts = () => {
  const { user } = useAuth();

  return useQuery({
    queryKey: ['linkedin-posts'],
    queryFn: async (): Promise<LinkedInPost[]> => {
      // Return demo data for now
      return [
        {
          id: '1',
          author_id: 'user1',
          body: `Spannende Entwicklungen in der Tech-Branche! 🚀

AI und Machine Learning revolutionieren weiterhin die Art, wie wir arbeiten. Besonders beeindruckend finde ich die Fortschritte in der natürlichen Sprachverarbeitung.

Was sind eure Gedanken zu den neuesten Entwicklungen? Welche Tools nutzt ihr bereits in eurem Arbeitsalltag?

#TechTrends #AI #MachineLearning #Innovation`,
          attachments: [],
          visibility: 'public',
          like_count: 42,
          comment_count: 18,
          repost_count: 7,
          created_at: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(),
          updated_at: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(),
          author: {
            id: 'user1',
            vorname: 'Max',
            nachname: 'Mustermann',
            headline: 'Senior Software Engineer bei TechCorp',
            avatar_url: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150&h=150&fit=crop&crop=face'
          },
          liked_by_user: false
        },
        {
          id: '2',
          author_id: 'user2',
          body: `Heute hatte ich ein faszinierendes Gespräch über die Zukunft der Arbeit. Remote Work ist nicht mehr nur ein Trend, sondern die neue Realität.

Wichtige Erkenntnisse:
• Flexibilität steigert die Produktivität
• Work-Life-Balance wird neu definiert  
• Tools für virtuelle Zusammenarbeit sind entscheidend

Wie seht ihr die Entwicklung? Arbeitet ihr lieber remote oder im Büro?`,
          attachments: [],
          visibility: 'public',
          like_count: 89,
          comment_count: 34,
          repost_count: 12,
          created_at: new Date(Date.now() - 5 * 60 * 60 * 1000).toISOString(),
          updated_at: new Date(Date.now() - 5 * 60 * 60 * 1000).toISOString(),
          author: {
            id: 'user2',
            vorname: 'Anna',
            nachname: 'Schmidt',
            headline: 'HR Director | People & Culture',
            avatar_url: 'https://images.unsplash.com/photo-1494790108755-2616b612b812?w=150&h=150&fit=crop&crop=face'
          },
          liked_by_user: true
        }
      ];
    },
    staleTime: 30000,
  });
};

// Get post likes for "who liked this" display
export const usePostLikers = (postId: string) => {
  return useQuery({
    queryKey: ['post-likers', postId],
    queryFn: async () => {
      const { data: likes, error } = await supabase
        .from('post_likes')
        .select('user_id')
        .eq('post_id', postId)
        .limit(20);

      if (error) throw error;

      if (!likes?.length) return [];

      const { data: profiles } = await supabase
        .from('profiles')
        .select('id, vorname, nachname, avatar_url')
        .in('id', likes.map(l => l.user_id));

      return likes.map(like => ({
        user_id: like.user_id,
        profiles: profiles?.find(p => p.id === like.user_id)
      }));
    },
    enabled: !!postId,
  });
};

// Toggle like on post
export const useTogglePostLike = () => {
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: async (postId: string) => {
      if (!user) {
        toast({
          title: "Anmeldung erforderlich",
          description: "Melde dich an, um Beiträge zu liken.",
          variant: "destructive",
        });
        return;
      }

      // Check if already liked
      const { data: existingLike } = await supabase
        .from('post_likes')
        .select('user_id')
        .eq('post_id', postId)
        .eq('user_id', user.id)
        .maybeSingle();

      if (existingLike) {
        // Unlike
        const { error } = await supabase
          .from('post_likes')
          .delete()
          .eq('post_id', postId)
          .eq('user_id', user.id);
        
        if (error) throw error;
        return { action: 'unliked' };
      } else {
        // Like
        const { error } = await supabase
          .from('post_likes')
          .insert({
            post_id: postId,
            user_id: user.id
          });
        
        if (error) throw error;
        return { action: 'liked' };
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['linkedin-posts'] });
      queryClient.invalidateQueries({ queryKey: ['post-likers'] });
    },
  });
};

// Get comments for a post - Demo version
export const usePostComments = (postId: string) => {
  const { user } = useAuth();

  return useQuery({
    queryKey: ['post-comments', postId],
    queryFn: async (): Promise<LinkedInComment[]> => {
      // Return demo comments for now
      return [
        {
          id: `comment-${postId}-1`,
          post_id: postId,
          parent_id: null,
          author_id: 'commenter1',
          body: 'Großartiger Beitrag! Besonders der Punkt über KI-Integration ist sehr interessant. Wir nutzen bereits ähnliche Tools in unserem Team.',
          attachments: [],
          like_count: 5,
          reply_count: 2,
          created_at: new Date(Date.now() - 1 * 60 * 60 * 1000).toISOString(),
          author: {
            id: 'commenter1',
            vorname: 'Lisa',
            nachname: 'Müller',
            headline: 'Product Manager',
            avatar_url: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=150&h=150&fit=crop&crop=face'
          },
          liked_by_user: false,
          replies: [
            {
              id: `reply-${postId}-1-1`,
              post_id: postId,
              parent_id: `comment-${postId}-1`,
              author_id: 'replier1',
              body: 'Welche Tools verwendet ihr denn konkret? Bin immer auf der Suche nach neuen Lösungen.',
              attachments: [],
              like_count: 2,
              reply_count: 0,
              created_at: new Date(Date.now() - 30 * 60 * 1000).toISOString(),
              author: {
                id: 'replier1',
                vorname: 'Marc',
                nachname: 'Schneider',
                headline: 'Developer',
                avatar_url: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&h=150&fit=crop&crop=face'
              },
              liked_by_user: true
            }
          ]
        }
      ];
    },
    enabled: !!postId,
    staleTime: 30000,
  });
};

// Add comment to post
export const useAddComment = () => {
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: async ({ postId, body, parentId }: { 
      postId: string; 
      body: string; 
      parentId?: string | null;
    }) => {
      if (!user) {
        toast({
          title: "Anmeldung erforderlich",
          description: "Melde dich an, um zu kommentieren.",
          variant: "destructive",
        });
        return;
      }

      const { data, error } = await supabase
        .from('comments')
        .insert({
          post_id: postId,
          author_id: user.id,
          body,
          parent_id: parentId,
        })
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['post-comments', variables.postId] });
      queryClient.invalidateQueries({ queryKey: ['linkedin-posts'] });
    },
  });
};

// Toggle like on comment
export const useToggleCommentLike = () => {
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: async (commentId: string) => {
      if (!user) {
        toast({
          title: "Anmeldung erforderlich",
          description: "Melde dich an, um Kommentare zu liken.",
          variant: "destructive",
        });
        return;
      }

      // Check if already liked
      const { data: existingLike } = await supabase
        .from('comment_likes')
        .select('user_id')
        .eq('comment_id', commentId)
        .eq('user_id', user.id)
        .maybeSingle();

      if (existingLike) {
        // Unlike
        const { error } = await supabase
          .from('comment_likes')
          .delete()
          .eq('comment_id', commentId)
          .eq('user_id', user.id);
        
        if (error) throw error;
        return { action: 'unliked' };
      } else {
        // Like
        const { error } = await supabase
          .from('comment_likes')
          .insert({
            comment_id: commentId,
            user_id: user.id
          });
        
        if (error) throw error;
        return { action: 'liked' };
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['post-comments'] });
    },
  });
};