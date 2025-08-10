import React from "react";
import { Heart, MessageCircle, Repeat2, Send, MoreHorizontal } from "lucide-react";
import { Card } from "@/components/ui/card";

export type FeedPost = {
  id: string;
  author?: { name: string; avatar_url?: string; subtitle?: string };
  content?: string | null;
  image?: string | null;
  video?: string | null;
  created_at?: string;
  published_at?: string | null;
  visibility?: "CommunityOnly" | "CommunityAndCompanies";
  like_count?: number;
  comment_count?: number;
  repost_count?: number;
  liked_by_me?: boolean;
};

function timeAgo(iso?: string | null) {
  if (!iso) return "";
  const s = (Date.now() - new Date(iso).getTime()) / 1000;
  if (s < 60) return `${Math.floor(s)}s`;
  if (s < 3600) return `${Math.floor(s / 60)}m`;
  if (s < 86400) return `${Math.floor(s / 3600)}h`;
  return `${Math.floor(s / 86400)}d`;
}

export function FeedCard({
  post,
  onLike,
  onComment,
  onRepost,
  onSend,
}: {
  post: FeedPost;
  onLike?: (p: FeedPost) => void;
  onComment?: (p: FeedPost) => void;
  onRepost?: (p: FeedPost) => void;
  onSend?: (p: FeedPost) => void;
}) {
  return (
    <article className="w-full max-w-[420px] mx-auto">
      <Card className="p-4">
        {/* header */}
        <header className="flex items-center gap-3">
          <img
            src={post.author?.avatar_url || "/placeholder.svg"}
            className="h-9 w-9 rounded-full object-cover bg-muted"
            alt={`${post.author?.name || "User"} avatar`}
            loading="lazy"
          />
          <div className="min-w-0">
            <div className="text-sm font-medium truncate">{post.author?.name || "User"}</div>
            <div className="text-xs text-muted-foreground truncate">
              {post.author?.subtitle || "—"} · {timeAgo(post.published_at || post.created_at)}
            </div>
          </div>
          <button className="ml-auto p-2 rounded-full hover:bg-muted/50" aria-label="More actions">
            <MoreHorizontal className="h-5 w-5 text-muted-foreground" />
          </button>
        </header>

        {/* content */}
        {post.content && (
          <p className="mt-3 text-[15px] leading-6 text-foreground/90 whitespace-pre-wrap">
            {post.content}
          </p>
        )}

        {/* media (height capped for mobile) */}
        {post.image && (
          <img
            src={post.image}
            alt={post.author?.name ? `${post.author.name}'s post image` : "Post image"}
            loading="lazy"
            className="mt-3 w-full max-h-[52vh] object-cover rounded-xl bg-muted"
          />
        )}

        {/* footer actions */}
        <footer className="mt-4">
          <div className="flex items-center gap-5 text-sm text-muted-foreground">
            <button
              onClick={() => onLike?.(post)}
              className="inline-flex items-center gap-1 px-2 py-1 rounded hover:bg-muted/50"
              aria-label="Like"
            >
              <Heart className={`h-4 w-4 ${post.liked_by_me ? "text-accent" : ""}`} />
              {post.like_count ?? 0}
            </button>
            <button
              onClick={() => onComment?.(post)}
              className="inline-flex items-center gap-1 px-2 py-1 rounded hover:bg-muted/50"
              aria-label="Comment"
            >
              <MessageCircle className="h-4 w-4" />
              {post.comment_count ?? 0}
            </button>
            <button
              onClick={() => onRepost?.(post)}
              className="inline-flex items-center gap-1 px-2 py-1 rounded hover:bg-muted/50"
              aria-label="Repost"
            >
              <Repeat2 className="h-4 w-4" />
              {post.repost_count ?? 0}
            </button>
            <button
              onClick={() => onSend?.(post)}
              className="ml-auto inline-flex items-center gap-1 px-2 py-1 rounded hover:bg-muted/50"
              aria-label="Send"
            >
              <Send className="h-4 w-4" />
              Send
            </button>
          </div>
        </footer>
      </Card>
    </article>
  );
}
