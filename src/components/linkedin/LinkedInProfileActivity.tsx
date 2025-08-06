import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { Heart, MessageCircle, Share2, ArrowRight } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';
import { de } from 'date-fns/locale';
import { useNavigate } from 'react-router-dom';

interface ActivityPost {
  id: string;
  content: string;
  image_url?: string;
  created_at: string;
  user_id: string;
  author?: {
    id: string;
    vorname?: string;
    nachname?: string;
    avatar_url?: string;
    ausbildungsberuf?: string;
  };
}

interface LinkedInProfileActivityProps {
  profile: any;
}

export const LinkedInProfileActivity: React.FC<LinkedInProfileActivityProps> = ({ profile }) => {
  const navigate = useNavigate();

  const { data: recentPosts, isLoading } = useQuery({
    queryKey: ['recent-community-posts'],
    queryFn: async () => {
      const { data: posts, error } = await supabase
        .from('posts')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(10);

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

  const getDisplayName = (post: ActivityPost) => {
    if (post.author?.vorname && post.author?.nachname) {
      return `${post.author.vorname} ${post.author.nachname}`;
    }
    return 'Unbekannter Nutzer';
  };

  const getInitials = (post: ActivityPost) => {
    if (post.author?.vorname && post.author?.nachname) {
      return `${post.author.vorname[0]}${post.author.nachname[0]}`;
    }
    return 'U';
  };

  const truncateContent = (content: string, maxLength: number = 100) => {
    return content.length > maxLength ? content.substring(0, maxLength) + '...' : content;
  };

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-3">
        <CardTitle className="text-lg font-semibold">Aktivität</CardTitle>
        <Button 
          variant="ghost" 
          size="sm" 
          onClick={() => navigate('/marketplace')}
          className="text-primary hover:text-primary/80"
        >
          Alle anzeigen
          <ArrowRight className="h-4 w-4 ml-1" />
        </Button>
      </CardHeader>
      <CardContent>
        {isLoading ? (
          <div className="flex items-center justify-center py-8">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
          </div>
        ) : (
          <>
            <p className="text-sm text-muted-foreground mb-4">
              Neueste Beiträge aus der Community
            </p>
            
            {recentPosts && recentPosts.length > 0 ? (
              <div className="overflow-x-auto">
                <div className="flex space-x-4 pb-2" style={{ width: 'max-content' }}>
                  {recentPosts.map((post) => (
                    <div
                      key={post.id}
                      className="flex-shrink-0 w-80 bg-muted/50 rounded-lg p-4 border hover:bg-muted/70 transition-colors cursor-pointer"
                      onClick={() => navigate('/marketplace')}
                    >
                      {/* Post Header */}
                      <div className="flex items-center space-x-3 mb-3">
                        <Avatar className="h-8 w-8">
                          <AvatarImage src={post.author?.avatar_url} />
                          <AvatarFallback className="text-xs">
                            {getInitials(post)}
                          </AvatarFallback>
                        </Avatar>
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium truncate">
                            {getDisplayName(post)}
                          </p>
                          <p className="text-xs text-muted-foreground">
                            {post.author?.ausbildungsberuf || 'Handwerker'}
                          </p>
                        </div>
                        <span className="text-xs text-muted-foreground">
                          {formatDistanceToNow(new Date(post.created_at), { 
                            addSuffix: true,
                            locale: de 
                          })}
                        </span>
                      </div>

                      {/* Post Content */}
                      <div className="space-y-3">
                        <p className="text-sm text-foreground">
                          {truncateContent(post.content)}
                        </p>

                        {/* Post Image */}
                        {post.image_url && (
                          <div className="rounded-lg overflow-hidden">
                            <img
                              src={post.image_url}
                              alt="Post"
                              className="w-full h-32 object-cover"
                            />
                          </div>
                        )}

                        {/* Post Actions */}
                        <div className="flex items-center space-x-4 pt-2">
                          <Button
                            variant="ghost"
                            size="sm"
                            className="h-8 px-2 text-muted-foreground hover:text-foreground"
                            onClick={(e) => {
                              e.stopPropagation();
                              // Handle like
                            }}
                          >
                            <Heart className="h-4 w-4 mr-1" />
                            <span className="text-xs">Gefällt mir</span>
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            className="h-8 px-2 text-muted-foreground hover:text-foreground"
                            onClick={(e) => {
                              e.stopPropagation();
                              // Handle comment
                            }}
                          >
                            <MessageCircle className="h-4 w-4 mr-1" />
                            <span className="text-xs">Kommentieren</span>
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            className="h-8 px-2 text-muted-foreground hover:text-foreground"
                            onClick={(e) => {
                              e.stopPropagation();
                              // Handle share
                            }}
                          >
                            <Share2 className="h-4 w-4 mr-1" />
                            <span className="text-xs">Teilen</span>
                          </Button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            ) : (
              <div className="text-center py-8">
                <p className="text-muted-foreground">
                  Noch keine Aktivitäten in der Community.
                </p>
                <Button 
                  variant="outline" 
                  className="mt-2"
                  onClick={() => navigate('/marketplace')}
                >
                  Community besuchen
                </Button>
              </div>
            )}
          </>
        )}
      </CardContent>
    </Card>
  );
};