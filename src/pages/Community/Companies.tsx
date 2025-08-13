import { useAuth } from '@/hooks/useAuth';
import { useCompaniesViews, type CompanyLite, type SuggestedCompany } from '@/hooks/useCompaniesViews';
import FollowButton from '@/components/company/FollowButton';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';

function CompanyCardRow({ c, right }: { c: CompanyLite | SuggestedCompany; right?: React.ReactNode }) {
  return (
    <div className="flex items-center justify-between rounded-xl border p-3 hover:bg-muted/50 transition-colors">
      <a href={`/companies/${c.id}`} className="flex min-w-0 items-center gap-3 flex-1">
        <img 
          src={c.logo_url || '/placeholder.svg'} 
          alt={c.name}
          className="h-10 w-10 rounded-md bg-muted object-cover flex-shrink-0" 
        />
        <div className="min-w-0 flex-1">
          <div className="text-sm font-medium truncate">{c.name}</div>
          <div className="text-xs text-muted-foreground truncate">
            {c.main_location || (c as SuggestedCompany).city || '—'} • {c.industry || '—'} • {c.employee_count ? `${c.employee_count} MA` : '—'}
          </div>
        </div>
      </a>
      {right && <div className="flex-shrink-0 ml-3">{right}</div>}
    </div>
  );
}

export default function CommunityCompanies() {
  const { profile } = useAuth();
  const { loading, pending, following, suggested, refetch } = useCompaniesViews(profile?.id ?? null);
  const profileId = profile?.id;

  if (!profileId) {
    return (
      <main className="w-full py-6">
        <h1 className="text-xl font-semibold mb-2">Unternehmen</h1>
        <p className="text-muted-foreground">Bitte melden Sie sich an, um Unternehmen zu folgen.</p>
      </main>
    );
  }

  return (
    <div className="mx-auto max-w-[1100px] p-3 md:p-6">
      <h1 className="text-xl font-semibold mb-6">Unternehmen</h1>
      
      <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
        {/* Follow Requests - Only "View" button */}
        <Card className="p-4">
          <h2 className="text-sm font-semibold mb-1">Follow‑Anfragen</h2>
          <p className="text-xs text-muted-foreground mb-4">Unternehmen möchten dir folgen. Du kannst nur im Profil annehmen/ablehnen.</p>
          
          <div className="space-y-3">
            {loading && <LoadingSkeleton />}
            {!loading && !pending.length && <EmptyState text="Keine Anfragen" />}
            {pending.map((company) => (
              <CompanyCardRow 
                key={company.id} 
                c={company} 
                right={
                  <Button
                    size="sm"
                    variant="outline"
                    asChild
                  >
                    <a href={`/companies/${company.id}`}>Ansehen</a>
                  </Button>
                }
              />
            ))}
          </div>
        </Card>

        {/* Following Companies - With metadata and follow button */}
        <Card className="p-4">
          <h2 className="text-sm font-semibold mb-1">Gefolgte Unternehmen</h2>
          <p className="text-xs text-muted-foreground mb-4">Updates im Feed • Glocke für Benachrichtigungen</p>
          
          <div className="space-y-3">
            {loading && <LoadingSkeleton />}
            {!loading && !following.length && <EmptyState text="Du folgst noch keinen Unternehmen" />}
            {following.map((company) => (
              <CompanyCardRow 
                key={company.id} 
                c={company} 
                right={
                  <FollowButton 
                    companyId={company.id} 
                    profileId={profileId} 
                    initialFollowing={true} 
                    initialBell="highlights"
                    onChange={() => refetch()}
                  />
                }
              />
            ))}
          </div>
        </Card>

        {/* Suggested Companies */}
        <Card className="p-4">
          <h2 className="text-sm font-semibold mb-1">Interessante Unternehmen</h2>
          <p className="text-xs text-muted-foreground mb-4">Basierend auf Branche, Ort und deinem Netzwerk</p>
          
          <div className="space-y-3">
            {loading && <LoadingSkeleton />}
            {!loading && !suggested.length && <EmptyState text="Aktuell keine Vorschläge" />}
            {suggested.map((company) => (
              <div key={company.id} className="space-y-2">
                <CompanyCardRow 
                  c={company} 
                  right={
                    <FollowButton 
                      companyId={company.id} 
                      profileId={profileId} 
                      initialFollowing={false}
                      onChange={() => refetch()}
                    />
                  }
                />
                
                {company.reasons && company.reasons.length > 0 && (
                  <div className="flex flex-wrap gap-1 pl-13">
                    {company.reasons.slice(0, 3).map((reason, i) => (
                      <span 
                        key={i} 
                        className="rounded-full border px-2 py-0.5 text-[11px] text-muted-foreground bg-muted/50"
                      >
                        {reason}
                      </span>
                    ))}
                  </div>
                )}
              </div>
            ))}
          </div>
        </Card>
      </div>
    </div>
  );
}

function LoadingSkeleton() {
  return (
    <div className="space-y-3">
      {[1, 2, 3].map(i => (
        <div key={i} className="rounded-xl border p-3">
          <div className="flex items-center gap-3">
            <Skeleton className="h-10 w-10 rounded-md" />
            <div className="space-y-2 flex-1">
              <Skeleton className="h-4 w-32" />
              <Skeleton className="h-3 w-48" />
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}

function EmptyState({ text }: { text: string }) {
  return (
    <div className="rounded-xl border bg-muted/20 p-6 text-center">
      <p className="text-sm text-muted-foreground">{text}</p>
    </div>
  );
}
