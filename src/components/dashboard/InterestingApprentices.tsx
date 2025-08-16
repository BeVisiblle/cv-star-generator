import { ProfileCard } from "@/components/profile/ProfileCard";
import { useProfiles } from "@/hooks/useProfiles";

interface InterestingApprenticesProps {
  companyId: string;
}

export function InterestingApprentices({ companyId }: InterestingApprenticesProps) {
  const { data, isLoading } = useProfiles({ 
    companyId, 
    variant: "dashboard", 
    limit: 6 
  });

  return (
    <section>
      <h2 className="mb-3 text-base font-semibold">Interessante Azubis</h2>
      {isLoading ? (
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {Array.from({ length: 6 }).map((_, i) => (
            <div key={i} className="h-[260px] w-[280px] animate-pulse rounded-xl bg-gray-100" />
          ))}
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {(data ?? []).map((p) => (
            <ProfileCard
              key={p.id}
              profile={p}
              variant="dashboard"
              onUnlock={() => {
                // TODO: implement unlock functionality
                console.log('Unlock profile:', p.id);
              }}
              onToggleFavorite={() => {
                // TODO: implement favorite functionality
                console.log('Toggle favorite:', p.id);
              }}
            />
          ))}
        </div>
      )}
    </section>
  );
}