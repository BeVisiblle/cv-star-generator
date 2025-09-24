import { useAuth } from "@/hooks/useAuth";
import PostComposer from "@/components/social/PostComposer";
import FeedList from "@/components/social/FeedList";

export default function Feed() {
  const { user } = useAuth();

  return (
    <div className="min-h-screen bg-background">
      <div className="container max-w-2xl mx-auto pt-8 pb-12 px-4">
        <div className="space-y-6">
          <div className="text-center">
            <h1 className="text-2xl font-bold text-foreground mb-2">Feed</h1>
            <p className="text-muted-foreground">
              Entdecke was in deinem Netzwerk passiert
            </p>
          </div>

          {user && (
            <PostComposer 
              authorId={user.id}
              onPostCreated={() => {
                // Trigger feed refresh
                document.dispatchEvent(new CustomEvent("feed:refresh"));
              }}
            />
          )}

          <FeedList />
        </div>
      </div>
    </div>
  );
}