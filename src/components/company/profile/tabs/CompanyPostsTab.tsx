import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import CompanyNewPostComposer from "@/components/community/CompanyNewPostComposer";

interface CompanyPostsTabProps {
  companyId: string;
  isOwner?: boolean;
}

export function CompanyPostsTab({ companyId, isOwner }: CompanyPostsTabProps) {
  const { data: posts, isLoading } = useQuery({
    queryKey: ["company-posts", companyId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("posts" as any)
        .select("*")
        .eq("user_id", companyId)
        .order("created_at", { ascending: false });
      if (error) throw error;
      return data;
    },
  });

  return (
    <div className="max-w-4xl mx-auto px-6 py-8">
      {isOwner && (
        <div className="mb-6">
          <CompanyNewPostComposer companyId={companyId} />
        </div>
      )}
      
      <div className="space-y-6">
        {isLoading && (
          <div className="text-center py-8 text-muted-foreground">
            Lade Beiträge...
          </div>
        )}
        
        {!isLoading && posts?.length === 0 && (
          <div className="text-center py-12 text-muted-foreground">
            Noch keine Beiträge vorhanden
          </div>
        )}
        
        {!isLoading && posts?.map((post: any) => (
          <div key={post.id} className="border rounded-lg p-4">
            <p>{post.content}</p>
            <p className="text-xs text-muted-foreground mt-2">
              {new Date(post.created_at).toLocaleDateString('de-DE')}
            </p>
          </div>
        ))}
      </div>
    </div>
  );
}
