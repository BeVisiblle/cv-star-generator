import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { CommunityCommentItem } from './CommunityCommentItem';
import { CommunityCommentComposer } from './CommunityCommentComposer';

interface CommunityComment {
  id: string;
  body_md: string;
  created_at: string;
  author_user_id?: string;
  author_company_id?: string;
  parent_comment_id?: string;
  author?: any;
  company?: any;
}

interface CommunityCommentsListProps {
  postId: string;
}

export const CommunityCommentsList: React.FC<CommunityCommentsListProps> = ({ postId }) => {
  const [sortBy, setSortBy] = useState<'top' | 'newest'>('top');

  const { data: comments = [], isLoading, error } = useQuery({
    queryKey: ['community-comments', postId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('community_comments')
        .select(`
          *,
          author:profiles_public(id, vorname, nachname, avatar_url, headline),
          company:companies(id, name, logo_url, industry)
        `)
        .eq('post_id', postId)
        .is('parent_comment_id', null)
        .order('created_at', { ascending: false });

      if (error) throw error;
      return data as CommunityComment[];
    }
  });

  if (isLoading) {
    return (
      <div className="space-y-3 mt-4">
        <div className="animate-pulse space-y-2">
          {[1, 2, 3].map(i => (
            <div key={i} className="flex gap-3">
              <div className="h-8 w-8 bg-muted rounded-full"></div>
              <div className="flex-1 space-y-2">
                <div className="h-4 bg-muted rounded w-1/4"></div>
                <div className="h-4 bg-muted rounded w-3/4"></div>
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center py-4">
        <p className="text-sm text-muted-foreground">Kommentare konnten nicht geladen werden.</p>
      </div>
    );
  }

  if (comments.length === 0) {
    return (
      <div className="space-y-3 mt-4">
        <CommunityCommentComposer postId={postId} />
        <div className="text-center py-4">
          <p className="text-sm text-muted-foreground">Noch keine Kommentare. Sei der Erste!</p>
        </div>
      </div>
    );
  }

  // Sort comments
  const sortedComments = [...comments].sort((a, b) => {
    if (sortBy === 'newest') {
      return new Date(b.created_at).getTime() - new Date(a.created_at).getTime();
    }
    // For 'top', we would normally sort by like count, but for now just use creation date
    return new Date(b.created_at).getTime() - new Date(a.created_at).getTime();
  });

  return (
    <div className="space-y-4 mt-4">
      <CommunityCommentComposer postId={postId} />
      
      {/* Sort controls */}
      <div className="flex items-center gap-2 text-sm">
        <Button
          variant={sortBy === 'top' ? 'secondary' : 'ghost'}
          size="sm"
          onClick={() => setSortBy('top')}
          className="h-8 px-3"
        >
          Top
        </Button>
        <Button
          variant={sortBy === 'newest' ? 'secondary' : 'ghost'}
          size="sm"
          onClick={() => setSortBy('newest')}
          className="h-8 px-3"
        >
          Neueste
        </Button>
      </div>

      {/* Comments */}
      <div className="space-y-4">
        {sortedComments.map(comment => (
          <CommunityCommentItem
            key={comment.id}
            comment={comment}
            onReplyCreated={() => {
              // Refetch comments when a reply is created
            }}
          />
        ))}
      </div>

      {/* Load more button if there are many comments */}
      {comments.length >= 20 && (
        <div className="text-center">
          <Button variant="ghost" size="sm">
            Weitere Kommentare laden
          </Button>
        </div>
      )}
    </div>
  );
};