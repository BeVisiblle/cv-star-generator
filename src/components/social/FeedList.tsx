// FeedList.tsx - KOMPLETT AKTUALISIERT für posts-Tabelle

import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Heart, MessageCircle, Share, Send } from "lucide-react";
import { NameBlock } from "./NameBlock";
import { formatDistanceToNow } from "date-fns";
import { de } from "date-fns/locale";

interface FeedPost {
  id: string;
  content: string; // Changed from body_md
  created_at: string;
  user_id: string; // Changed from actor_user_id
  like_count: number;
  comment_count: number;
  share_count: number;
  author?: PostAuthor;
}

interface PostAuthor {
  id: string;
  vorname?: string;
  nachname?: string;
  headline?: string;
  aktueller_beruf?: string;
  ausbildungsbetrieb?: string;
  avatar_url?: string;
}

export default function FeedList() {
  const [posts, setPosts] = useState<FeedPost[]>([]);
  const [loading, setLoading] = useState(true);

  const loadFeed = async () => {
    try {
      console.log('[FeedList] Loading posts from posts table...');
      
      // Get posts from community_posts table (schema: actor_user_id, body_md, like_count, comment_count, share_count)
      const { data: postsData, error: postsError } = await supabase
        .from("community_posts" as any)
        .select("*")
        .order("created_at", { ascending: false })
        .limit(50);

      if (postsError) {
        console.error("[FeedList] Error loading feed:", postsError);
        return;
      }

      console.log('[FeedList] Loaded posts:', postsData?.length, postsData);
      
      // Cast to any to avoid TypeScript errors
      const rawPosts = (postsData || []) as any[];

      // Get author info for each post
      const postsWithAuthors = await Promise.all(
        rawPosts.map(async (post: any) => {
          if (post.actor_user_id) {
            try {
              const { data: authorData, error: authorError } = await supabase
                .from("profiles")
                .select("id, vorname, nachname, headline, aktueller_beruf, ausbildungsbetrieb, avatar_url")
                .eq("id", post.actor_user_id)
                .maybeSingle();
              
              if (authorError) {
                console.error("[FeedList] Error loading author:", authorError);
              }
              
              return {
                id: post.id,
                created_at: post.created_at,
                user_id: post.actor_user_id,
                content: post.body_md || '', // Map body_md to content
                like_count: post.like_count || 0,
                comment_count: post.comment_count || 0,
                share_count: post.share_count || 0,
                author: authorData || undefined
              };
            } catch (error) {
              console.error("[FeedList] Error loading author for post:", post.id, error);
              return {
                id: post.id,
                created_at: post.created_at,
                user_id: post.actor_user_id,
                content: post.body_md || '',
                like_count: post.like_count || 0,
                comment_count: post.comment_count || 0,
                share_count: post.share_count || 0
              };
            }
          }
          return {
            id: post.id,
            created_at: post.created_at,
            user_id: post.actor_user_id,
            content: post.body_md || '',
            like_count: post.like_count || 0,
            comment_count: post.comment_count || 0,
            share_count: post.share_count || 0
          };
        })
      );

      console.log('[FeedList] Posts with authors:', postsWithAuthors);
      setPosts(postsWithAuthors);
    } catch (error) {
      console.error("[FeedList] Error loading feed:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadFeed();

    // Listen for new posts on posts table
    const channel = supabase
      .channel('feed-updates')
      .on('postgres_changes', 
        { event: 'INSERT', schema: 'public', table: 'posts' },
        () => {
          console.log('[FeedList] New post detected, reloading...');
          loadFeed();
        }
      )
      .on('postgres_changes', 
        { event: 'UPDATE', schema: 'public', table: 'posts' },
        () => {
          console.log('[FeedList] Post updated, reloading...');
          loadFeed();
        }
      )
      .subscribe();

    // Listen for feed refresh events
    const handleRefresh = () => loadFeed();
    document.addEventListener("feed:refresh", handleRefresh);

    return () => {
      supabase.removeChannel(channel);
      document.removeEventListener("feed:refresh", handleRefresh);
    };
  }, []);

  const getDisplayName = (author?: PostAuthor) => {
    if (!author) return "Unbekannter Nutzer";
    if (author.vorname && author.nachname) {
      return `${author.vorname} ${author.nachname}`;
    }
    if (author.vorname) return author.vorname;
    if (author.nachname) return author.nachname;
    return "Aktiver Nutzer";
  };

  const getSubline = (author?: PostAuthor) => {
    if (!author) return null;
    
    if (author.headline && author.ausbildungsbetrieb) {
      return `${author.headline} @ ${author.ausbildungsbetrieb}`;
    }
    if (author.aktueller_beruf && author.ausbildungsbetrieb) {
      return `${author.aktueller_beruf} @ ${author.ausbildungsbetrieb}`;
    }
    if (author.headline) {
      return author.headline;
    }
    if (author.aktueller_beruf) {
      return author.aktueller_beruf;
    }
    return null;
  };

  const getInitials = (author?: PostAuthor) => {
    if (!author) return "?";
    const first = author.vorname?.[0] || "";
    const last = author.nachname?.[0] || "";
    return (first + last).toUpperCase() || "?";
  };

  if (loading) {
    return (
      <div className="space-y-4">
        {[...Array(3)].map((_, i) => (
          <Card key={i} className="rounded-2xl animate-pulse">
            <CardContent className="p-6">
              <div className="flex gap-3">
                <div className="w-12 h-12 bg-muted rounded-full" />
                <div className="flex-1 space-y-2">
                  <div className="h-4 bg-muted rounded w-1/3" />
                  <div className="h-3 bg-muted rounded w-1/4" />
                  <div className="mt-4 space-y-2">
                    <div className="h-4 bg-muted rounded" />
                    <div className="h-4 bg-muted rounded w-3/4" />
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {posts.map((post) => (
        <Card key={post.id} className="rounded-2xl border-border/50">
          <CardContent className="p-6">
            <div className="flex gap-3">
              <Avatar className="h-12 w-12">
                <AvatarImage src={post.author?.avatar_url || undefined} />
                <AvatarFallback className="bg-primary text-primary-foreground">
                  {getInitials(post.author)}
                </AvatarFallback>
              </Avatar>
              
              <div className="flex-1 min-w-0">
                <div className="flex items-start justify-between">
                  <NameBlock
                    displayName={getDisplayName(post.author)}
                    subline={getSubline(post.author)}
                    userId={post.user_id || undefined}
                  />
                  <span className="text-xs text-muted-foreground">
                    {formatDistanceToNow(new Date(post.created_at), { 
                      addSuffix: true, 
                      locale: de 
                    })}
                  </span>
                </div>
                
                <div className="mt-3">
                  <p className="text-foreground whitespace-pre-wrap leading-relaxed">
                    {post.content}
                  </p>
                </div>

                <div className="flex items-center justify-between mt-4 pt-3 border-t border-border/50">
                  <div className="flex items-center gap-6">
                    <Button variant="ghost" size="sm" className="h-9 px-3 gap-2">
                      <Heart className="h-4 w-4" />
                      <span className="text-sm">{post.like_count || 0}</span>
                    </Button>
                    <Button variant="ghost" size="sm" className="h-9 px-3 gap-2">
                      <MessageCircle className="h-4 w-4" />
                      <span className="text-sm">{post.comment_count || 0}</span>
                    </Button>
                    <Button variant="ghost" size="sm" className="h-9 px-3 gap-2">
                      <Share className="h-4 w-4" />
                      <span className="text-sm">{post.share_count || 0}</span>
                    </Button>
                  </div>
                  <Button variant="ghost" size="sm" className="h-9 px-3">
                    <Send className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      ))}

      {posts.length === 0 && (
        <Card className="rounded-2xl">
          <CardContent className="p-12 text-center">
            <p className="text-muted-foreground">
              Noch keine Posts im Feed. Sei der erste und teile etwas!
            </p>
          </CardContent>
        </Card>
      )}
    </div>
  );
}