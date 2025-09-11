import React from 'react';
import { PostComposer } from '@/components/post/PostComposer';
import { PostCard } from '@/components/post/PostCard';
import { usePosts } from '@/hooks/usePosts';

export function PostFeed() {
  const { data: posts, isLoading, error } = usePosts();

  if (error) {
    return (
      <div className="text-center py-8">
        <p className="text-muted-foreground">Fehler beim Laden der Beiträge.</p>
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <PostComposer />
      
      {isLoading ? (
        <div className="text-center py-8">
          <p className="text-muted-foreground">Beiträge werden geladen...</p>
        </div>
      ) : posts && posts.length > 0 ? (
        posts.map((post) => (
          <PostCard key={post.id} post={post} />
        ))
      ) : (
        <div className="text-center py-8">
          <p className="text-muted-foreground">Noch keine Beiträge vorhanden.</p>
        </div>
      )}
    </div>
  );
}