import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Plus, Loader2 } from 'lucide-react';
import { useCommunityFeed } from '@/hooks/useCommunityPosts';
import CommunityPostCard from './CommunityPostCard';
import CommunityComposer from './CommunityComposer';
import CommunityFeedControls from './CommunityFeedControls';
import { useAuth } from '@/hooks/useAuth';

export default function EnhancedCommunityFeed() {
  const { user } = useAuth();
  const [composerOpen, setComposerOpen] = useState(false);
  
  const {
    data,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
    isLoading,
    isError
  } = useCommunityFeed();

  const posts = data?.pages.flatMap(page => page.posts) || [];

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
      <Card>
        <CardContent className="p-4">
          <Button 
            variant="outline" 
            className="w-full justify-start text-muted-foreground"
            onClick={() => setComposerOpen(true)}
          >
            <Plus className="h-4 w-4 mr-2" />
            Teile ein Update mit der Community...
          </Button>
        </CardContent>
      </Card>

      {/* Feed Controls */}
      <CommunityFeedControls />

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

      {/* Composer Modal */}
      <CommunityComposer 
        open={composerOpen} 
        onOpenChange={setComposerOpen} 
      />
    </div>
  );
}