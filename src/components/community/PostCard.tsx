import { useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";
import { Heart, MessageCircle, Share2, Send, Repeat2 } from "lucide-react";
import { formatDistanceToNow } from "date-fns";
import { de } from "date-fns/locale";

interface PostCardProps {
  post: any;
}

export const PostCard = ({ post }: PostCardProps) => {
  const [showComments, setShowComments] = useState(false);
  const [newComment, setNewComment] = useState("");
  const queryClient = useQueryClient();
  const { toast } = useToast();

  // Check if user has liked this post
  const { data: userLike } = useQuery({
    queryKey: ["user-like", post.id],
    queryFn: async () => {
      const { data: user } = await supabase.auth.getUser();
      if (!user.user) return null;

      const { data } = await supabase
        .from("likes")
        .select("id")
        .eq("post_id", post.id)
        .eq("user_id", user.user.id)
        .single();

      return data;
    },
  });

  // Get comments for this post
  const { data: comments } = useQuery({
    queryKey: ["post-comments", post.id],
    queryFn: async () => {
      const { data: comments, error } = await supabase
        .from("comments")
        .select("*")
        .eq("post_id", post.id)
        .order("created_at", { ascending: true });

      if (error) throw error;

      // Get profile data for each comment
      const userIds = comments?.map(comment => comment.user_id) || [];
      if (userIds.length === 0) return [];

      const { data: profiles, error: profileError } = await supabase
        .from("profiles")
        .select("id, full_name, avatar_url")
        .in("id", userIds);

      if (profileError) throw profileError;

      // Combine comments with profiles
      const commentsWithProfiles = comments?.map(comment => ({
        ...comment,
        author: profiles?.find(p => p.id === comment.user_id)
      })) || [];

      return commentsWithProfiles;
    },
    enabled: showComments,
  });

  const likeMutation = useMutation({
    mutationFn: async () => {
      const { data: user } = await supabase.auth.getUser();
      if (!user.user) throw new Error("Not authenticated");

      if (userLike) {
        // Unlike
        const { error } = await supabase
          .from("likes")
          .delete()
          .eq("id", userLike.id);
        if (error) throw error;
      } else {
        // Like
        const { error } = await supabase
          .from("likes")
          .insert({
            post_id: post.id,
            user_id: user.user.id,
          });
        if (error) throw error;
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["user-like", post.id] });
      queryClient.invalidateQueries({ queryKey: ["community-posts"] });
    },
  });

  const commentMutation = useMutation({
    mutationFn: async (content: string) => {
      const { data: user } = await supabase.auth.getUser();
      if (!user.user) throw new Error("Not authenticated");

      const { error } = await supabase
        .from("comments")
        .insert({
          post_id: post.id,
          user_id: user.user.id,
          content,
        });

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["post-comments", post.id] });
      queryClient.invalidateQueries({ queryKey: ["community-posts"] });
      setNewComment("");
      toast({
        title: "Kommentar hinzugefügt",
        description: "Dein Kommentar wurde veröffentlicht.",
      });
    },
  });

  const handleLike = () => {
    likeMutation.mutate();
  };

  const handleComment = () => {
    if (newComment.trim()) {
      commentMutation.mutate(newComment.trim());
    }
  };

  const handleShare = () => {
    if (navigator.share) {
      navigator.share({
        title: `Beitrag von ${post.author?.full_name}`,
        text: post.content,
      });
    } else {
      navigator.clipboard.writeText(window.location.href);
      toast({
        title: "Link kopiert",
        description: "Der Link wurde in die Zwischenablage kopiert.",
      });
    }
  };

  return (
    <Card className="hover:shadow-md transition-shadow">
      <CardContent className="p-6">
        <div className="space-y-4">
          {/* Post Header */}
          <div className="flex items-start space-x-3">
            <Avatar className="h-12 w-12">
              <AvatarImage src={post.author?.avatar_url} />
              <AvatarFallback>
                {post.author?.full_name?.[0] || "U"}
              </AvatarFallback>
            </Avatar>
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2">
                <h3 className="font-semibold">
                  {post.author?.full_name || "Unbekannter Nutzer"}
                </h3>
                {post.author?.ausbildungsberuf && (
                  <Badge variant="secondary" className="text-xs">
                    {post.author.ausbildungsberuf}
                  </Badge>
                )}
              </div>
              <div className="text-sm text-muted-foreground">
                {formatDistanceToNow(new Date(post.created_at), {
                  addSuffix: true,
                  locale: de,
                })}
              </div>
            </div>
          </div>

          {/* Post Content */}
          <div className="space-y-3">
            {post.content && (
              <div className="text-sm leading-relaxed">
                {post.content}
              </div>
            )}
            
            {post.image_url && (
              <div className="rounded-lg overflow-hidden">
                <img
                  src={post.image_url}
                  alt="Post content"
                  className="w-full max-h-96 object-cover"
                />
              </div>
            )}
          </div>

          {/* Post Actions */}
          <div className="flex items-center justify-between pt-2 border-t">
            <div className="flex items-center space-x-4">
              <Button
                variant="ghost"
                size="sm"
                onClick={handleLike}
                className={`flex items-center gap-2 ${
                  userLike ? "text-red-500" : ""
                }`}
              >
                <Heart className={`h-4 w-4 ${userLike ? "fill-current" : ""}`} />
                {post.likes_count || 0}
              </Button>
              
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setShowComments(!showComments)}
                className="flex items-center gap-2"
              >
                <MessageCircle className="h-4 w-4" />
                {post.comments_count || 0}
              </Button>
              
              <Button
                variant="ghost"
                size="sm"
                className="flex items-center gap-2"
              >
                <Repeat2 className="h-4 w-4" />
                Teilen
              </Button>
              
              <Button
                variant="ghost"
                size="sm"
                onClick={handleShare}
                className="flex items-center gap-2"
              >
                <Share2 className="h-4 w-4" />
                Senden
              </Button>
            </div>
          </div>

          {/* Comments Section */}
          {showComments && (
            <div className="space-y-4 border-t pt-4">
              {/* Add Comment */}
              <div className="flex space-x-3">
                <Avatar className="h-8 w-8">
                  <AvatarFallback>Du</AvatarFallback>
                </Avatar>
                <div className="flex-1 flex space-x-2">
                  <Textarea
                    placeholder="Schreibe einen Kommentar..."
                    value={newComment}
                    onChange={(e) => setNewComment(e.target.value)}
                    className="min-h-[60px] resize-none"
                  />
                  <Button
                    size="sm"
                    onClick={handleComment}
                    disabled={!newComment.trim()}
                  >
                    <Send className="h-4 w-4" />
                  </Button>
                </div>
              </div>

              {/* Comments List */}
              {comments && comments.length > 0 && (
                <div className="space-y-3">
                  {comments.map((comment) => (
                    <div key={comment.id} className="flex space-x-3">
                      <Avatar className="h-8 w-8">
                        <AvatarImage src={comment.author?.avatar_url} />
                        <AvatarFallback>
                          {comment.author?.full_name?.[0] || "U"}
                        </AvatarFallback>
                      </Avatar>
                      <div className="flex-1">
                        <div className="bg-muted rounded-lg p-3">
                          <div className="font-medium text-sm">
                            {comment.author?.full_name || "Unbekannter Nutzer"}
                          </div>
                          <div className="text-sm">{comment.content}</div>
                        </div>
                        <div className="text-xs text-muted-foreground mt-1">
                          {formatDistanceToNow(new Date(comment.created_at), {
                            addSuffix: true,
                            locale: de,
                          })}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
};