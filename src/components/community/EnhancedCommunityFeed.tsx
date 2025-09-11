import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Plus, Loader2 } from 'lucide-react';
import { useCommunityFeed } from '@/hooks/useCommunityPosts';
import CommunityPostCard from './CommunityPostCard';
import { CommunityComposer } from './CommunityComposer';
import CommunityComposerTeaser from './CommunityComposerTeaser';
import { useAuth } from '@/hooks/useAuth';

export default function EnhancedCommunityFeed() {
  const { user } = useAuth();
  const [composerOpen, setComposerOpen] = useState(false);
  const [sortBy, setSortBy] = useState('relevant');
  
  const {
    data,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
    isLoading,
    isError
  } = useCommunityFeed(sortBy);

  // Listen for sort changes from FeedSortBar
  React.useEffect(() => {
    const handleSortChange = (event: CustomEvent<string>) => {
      setSortBy(event.detail);
    };

    window.addEventListener('feed-sort-changed', handleSortChange as EventListener);
    return () => window.removeEventListener('feed-sort-changed', handleSortChange as EventListener);
  }, []);

  const posts = data?.pages.flatMap(page => page.posts) || [];

  // Move all early returns after all hooks
  if (!user) {
    return (
      <Card>
        <CardContent className="p-6 text-center">
          <p className="text-muted-foreground">
            Bitte melde dich an, um die Community zu nutzen.
          </p>
        </CardContent>
      </Card>
    );
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center p-8">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    );
  }

  if (isError) {
    return (
      <Card>
        <CardContent className="p-6 text-center">
          <p className="text-muted-foreground">
            Fehler beim Laden der Community-Posts.
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      {/* Composer Teaser */}
      <CommunityComposerTeaser onOpenComposer={() => setComposerOpen(true)} />

      {/* Posts */}
      <div className="space-y-6">
        {posts.length === 0 ? (
          <Card>
            <CardHeader>
              <CardTitle>Willkommen in der Community!</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground mb-4">
                Noch keine Beiträge in deinem Feed. Erstelle den ersten Beitrag oder folge anderen Nutzern und Unternehmen.
              </p>
              <Button onClick={() => setComposerOpen(true)}>
                <Plus className="h-4 w-4 mr-2" />
                Ersten Beitrag erstellen
              </Button>
            </CardContent>
          </Card>
        ) : (
          <>
            {posts.map((post) => (
              <CommunityPostCard key={post.id} post={post} />
            ))}

            {/* Load More */}
            {hasNextPage && (
              <div className="flex justify-center">
                <Button
                  variant="outline"
                  onClick={() => fetchNextPage()}
                  disabled={isFetchingNextPage}
                >
                  {isFetchingNextPage ? (
                    <>
                      <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                      Lädt...
                    </>
                  ) : (
                    'Mehr laden'
                  )}
                </Button>
              </div>
            )}

            {!hasNextPage && posts.length > 0 && (
              <div className="text-center text-sm text-muted-foreground">
                Alle Beiträge geladen
              </div>
            )}
          </>
        )}
      </div>

      {/* Composer Modal is now handled by CommunityComposerTeaser */}
    </div>
  );
}