import React from 'react';
import { Button } from '@/components/ui/button';
import { Loader2 } from 'lucide-react';
import { useLinkedInFeed } from '@/hooks/useLinkedInFeed';
import LinkedInPostCard from './LinkedInPostCard';
import LinkedInPostComposer from './LinkedInPostComposer';

export default function LinkedInFeed() {
  const {
    data,
    error,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
    isLoading,
    refetch
  } = useLinkedInFeed();

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-8">
        <Loader2 className="h-6 w-6 animate-spin mr-2" />
        <span>Feed wird geladen...</span>
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center py-8">
        <p className="text-muted-foreground mb-4">
          Fehler beim Laden des Feeds.
        </p>
        <Button onClick={() => refetch()} variant="outline">
          Erneut versuchen
        </Button>
      </div>
    );
  }

  const posts = data?.pages.flatMap(page => page.posts) || [];

  return (
    <div className="space-y-4">
      {/* Post Composer */}
      <LinkedInPostComposer />
      
      {/* Posts */}
      {posts.length === 0 ? (
        <div className="text-center py-8">
          <p className="text-muted-foreground mb-4">
            Noch keine Beiträge vorhanden.
          </p>
          <p className="text-sm text-muted-foreground">
            Erstellen Sie Ihren ersten Beitrag, um loszulegen!
          </p>
        </div>
      ) : (
        <>
          {posts.map((post) => (
            <LinkedInPostCard key={post.id} post={post} />
          ))}
          
          {/* Load more button */}
          {hasNextPage && (
            <div className="text-center py-4">
              <Button 
                onClick={() => fetchNextPage()}
                disabled={isFetchingNextPage}
                variant="outline"
                className="w-full"
              >
                {isFetchingNextPage ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin mr-2" />
                    Weitere Beiträge werden geladen...
                  </>
                ) : (
                  'Weitere Beiträge laden'
                )}
              </Button>
            </div>
          )}
        </>
      )}
    </div>
  );
}