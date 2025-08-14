import { useAuth } from '@/hooks/useAuth';
import { useCompaniesViews } from '@/hooks/useCompaniesViews';
import { CompanyCard, formatCompanySubtitle } from '@/components/shared/CompanyCard';
import { LoadingSkeleton } from '@/components/shared/LoadingSkeleton';
import { EmptyState } from '@/components/shared/EmptyState';
import FollowButton from '@/components/company/FollowButton';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import type { CompanyLite, SuggestedCompany } from '@/types/company';

export default function CommunityCompanies() {
  const { profile } = useAuth();
  const { loading, pending, following, suggested, error, refetch } = useCompaniesViews(profile?.id ?? null);
  const profileId = profile?.id;

  if (!profileId) {
    return (
      <main className="w-full py-6">
        <h1 className="text-xl font-semibold mb-2">Unternehmen</h1>
        <p className="text-muted-foreground">Bitte melden Sie sich an, um Unternehmen zu folgen.</p>
      </main>
    );
  }

  if (error) {
    return (
      <div className="mx-auto max-w-[1100px] p-3 md:p-6">
        <h1 className="text-xl font-semibold mb-6">Unternehmen</h1>
        <EmptyState 
          text={`Fehler beim Laden: ${error}`} 
          icon="⚠️"
          action={
            <Button onClick={refetch} variant="outline" size="sm">
              Erneut versuchen
            </Button>
          }
        />
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-[1100px] p-3 md:p-6">
      <h1 className="text-xl font-semibold mb-6">Unternehmen</h1>
      
      <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
        {/* Follow Requests */}
        <Card className="p-4">
          <h2 className="text-sm font-semibold mb-1">Follow‑Anfragen</h2>
          <p className="text-xs text-muted-foreground mb-4">
            Unternehmen möchten dir folgen. Du kannst nur im Profil annehmen/ablehnen.
          </p>
          
          <div className="space-y-3">
            {loading && <LoadingSkeleton rows={3} />}
            {!loading && pending.length === 0 && (
              <EmptyState text="Keine Anfragen" icon="📭" />
            )}
            {pending.map((company) => (
              <CompanyCard
                key={company.id}
                company={company}
                subtitle={formatCompanySubtitle(company)}
                href={`/companies/${company.id}`}
                action={
                  <Button size="sm" variant="outline" asChild>
                    <a href={`/companies/${company.id}`}>Ansehen</a>
                  </Button>
                }
              />
            ))}
          </div>
        </Card>

        {/* Following Companies */}
        <Card className="p-4">
          <h2 className="text-sm font-semibold mb-1">Gefolgte Unternehmen</h2>
          <p className="text-xs text-muted-foreground mb-4">
            Updates im Feed • Glocke für Benachrichtigungen
          </p>
          
          <div className="space-y-3">
            {loading && <LoadingSkeleton rows={3} />}
            {!loading && following.length === 0 && (
              <EmptyState text="Du folgst noch keinen Unternehmen" icon="🏢" />
            )}
            {following.map((company) => (
              <CompanyCard
                key={company.id}
                company={company}
                subtitle={formatCompanySubtitle(company)}
                href={`/companies/${company.id}`}
                action={
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
          <p className="text-xs text-muted-foreground mb-4">
            Basierend auf Branche, Ort und deinem Netzwerk
          </p>
          
          <div className="space-y-3">
            {loading && <LoadingSkeleton rows={3} />}
            {!loading && suggested.length === 0 && (
              <EmptyState text="Aktuell keine Vorschläge" icon="🔍" />
            )}
            {suggested.map((company) => (
              <div key={company.id} className="space-y-2">
                <CompanyCard
                  company={company}
                  subtitle={formatCompanySubtitle(company)}
                  href={`/companies/${company.id}`}
                  action={
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
