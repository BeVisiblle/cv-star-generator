import { supabase } from "@/integrations/supabase/client";
import { SuggestionList } from "./SuggestionList";
import { useAuth } from "@/hooks/useAuth";
const AnySuggestionList = SuggestionList as unknown as any;

type Job = {
  id: string;
  title: string;
  company_name?: string | null;
  city?: string | null;
  employment_type?: string | null;
  salary_min?: number | null;
  salary_max?: number | null;
};

export function InterestingJobs() {
  const { user } = useAuth();
  const viewerId = user?.id;

  if (!viewerId) return null;

  return (
    <AnySuggestionList
      title="Interessante Jobs für Dich"
      fetchFn={() =>
        (supabase as any).rpc("suggest_jobs", { p_viewer: viewerId, p_limit: 3 }) as Promise<{
          data: Job[] | null;
          error: any;
        }>
      }
      onPrimary={async (job: Job) => {
        window.location.href = `/jobs/${job.id}`;
      }}
      onView={async (job: Job) => {
        window.location.href = `/jobs/${job.id}`;
      }}
      onSkip={async (job: Job) => {
        await supabase.rpc("suggestions_touch", { p_viewer: viewerId, p_type: "job", p_target: job.id });
      }}
      primaryLabel="Jetzt bewerben"
      secondaryLabel="Details ansehen"
      itemKey={(job) => job.id}
      renderItem={(job) => ({
        id: job.id,
        avatar: null,
        title: job.title,
        subtitle: job.company_name || "",
        meta: [
          job.city,
          job.employment_type,
          job.salary_min && job.salary_max ? `${job.salary_min}-${job.salary_max}€` : null
        ].filter(Boolean).join(" • "),
      })}
    />
  );
}
