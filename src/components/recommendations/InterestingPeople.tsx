import { supabase } from "@/integrations/supabase/client";
import { SuggestionList } from "./SuggestionList";
import { useAuth } from "@/hooks/useAuth";
const AnySuggestionList = SuggestionList as unknown as any;

type Person = {
  id: string;
  display_name: string | null;
  avatar_url?: string | null;
  status?: string | null;
  branche?: string | null;
  ort?: string | null;
};

export function InterestingPeople() {
  const { user } = useAuth();
  const viewerId = user?.id;

  if (!viewerId) return null;

  return (
    <AnySuggestionList
      title="Interessante Personen für dich"
      fetchFn={() =>
        (supabase as any).rpc("suggest_people", { p_viewer: viewerId, p_limit: 3 }) as Promise<{
          data: Person[] | null;
          error: any;
        }>
      }
      onPrimary={async (p: Person) => {
        await supabase.from("connections").insert({ requester_id: viewerId, addressee_id: p.id, status: "pending" });
        await supabase.rpc("suggestions_touch", { p_viewer: viewerId, p_type: "profile", p_target: p.id });
      }}
      onView={(p: Person) => {
        window.location.href = `/u/${p.id}`;
      }}
      onSkip={async (p: Person) => {
        await supabase.rpc("suggestions_touch", { p_viewer: viewerId, p_type: "profile", p_target: p.id });
      }}
      primaryLabel="Vernetzen"
      itemKey={(p) => p.id}
      renderItem={(p) => ({
        id: p.id,
        avatar: p.avatar_url || null,
        title: p.display_name || "Profile",
        subtitle: [p.status, p.branche].filter(Boolean).join(" • "),
        meta: p.ort || "",
      })}
    />
  );
}
