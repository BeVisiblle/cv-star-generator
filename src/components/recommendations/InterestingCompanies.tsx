import { supabase } from "@/integrations/supabase/client";
import { SuggestionList } from "./SuggestionList";
import { useAuth } from "@/hooks/useAuth";
const AnySuggestionList = SuggestionList as unknown as any;

type Company = {
  id: string;
  name: string;
  logo_url?: string | null;
  industry?: string | null;
  main_location?: string | null;
};

export function InterestingCompanies() {
  const { user } = useAuth();
  const viewerId = user?.id;

  if (!viewerId) return null;

  return (
    <AnySuggestionList
      title="Interessante Unternehmen"
      fetchFn={() =>
        (supabase as any).rpc("suggest_companies", { p_viewer: viewerId, p_limit: 3 }) as Promise<{
          data: Company[] | null;
          error: any;
        }>
      }
      onPrimary={async (c: Company) => {
        await supabase.from("follows").insert({ 
          follower_id: viewerId, 
          followee_id: c.id,
          follower_type: 'profile',
          followee_type: 'company',
          status: "accepted" 
        });
        await supabase.rpc("suggestions_touch", { p_viewer: viewerId, p_type: "company", p_target: c.id });
      }}
      onView={(c: Company) => {
        window.location.href = `/companies/${c.id}`;
      }}
      onSkip={async (c: Company) => {
        await supabase.rpc("suggestions_touch", { p_viewer: viewerId, p_type: "company", p_target: c.id });
      }}
      primaryLabel="Folgen"
      secondaryLabel="Mehr erfahren"
      itemKey={(c) => c.id}
      renderItem={(c) => ({
        id: c.id,
        avatar: c.logo_url || null,
        title: c.name,
        subtitle: c.industry || "",
        meta: c.main_location || "",
      })}
    />
  );
}
