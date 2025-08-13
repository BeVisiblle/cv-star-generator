import { useAuth } from '@/hooks/useAuth';
import { useCompaniesViews } from '@/hooks/useCompaniesViews';
import FollowButton from '@/components/company/FollowButton';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { Check, X } from 'lucide-react';

export default function CommunityCompanies() {
  const { profile } = useAuth();
  const { toast } = useToast();
  const { loading, pending, following, suggested, refetch } = useCompaniesViews(profile?.id ?? null);
  const profileId = profile?.id;

  const acceptFollowRequest = async (followId: string, followerCompanyId: string) => {
    try {
      const { error } = await supabase.functions.invoke('accept-follow', {
        body: { 
          follower_type: 'company', 
          follower_id: followerCompanyId, 
          followee_type: 'profile', 
          followee_id: profileId 
        }
      });
      
      if (error) throw error;
      
      toast({ description: 'Follow-Anfrage angenommen!' });
      refetch();
    } catch (error) {
      console.error('Error accepting follow request:', error);
      toast({ 
        variant: 'destructive',
        description: 'Fehler beim Annehmen der Anfrage'
      });
    }
  };

  const declineFollowRequest = async (followId: string, followerCompanyId: string) => {
    try {
      const { error } = await supabase.functions.invoke('decline-follow', {
        body: { 
          follower_type: 'company', 
          follower_id: followerCompanyId, 
          followee_type: 'profile', 
          followee_id: profileId 
        }
      });
      
      if (error) throw error;
      
      toast({ description: 'Follow-Anfrage abgelehnt' });
      refetch();
    } catch (error) {
      console.error('Error declining follow request:', error);
      toast({ 
        variant: 'destructive',
        description: 'Fehler beim Ablehnen der Anfrage'
      });
    }
  };

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
        {/* Follow Requests */}
        <Card className="p-4">
          <h2 className="text-sm font-semibold mb-1">Follow‑Anfragen</h2>
          <p className="text-xs text-muted-foreground mb-4">Unternehmen möchten dir folgen</p>
          
          <div className="space-y-3">
            {loading && <LoadingSkeleton />}
            {!loading && !pending.length && <EmptyState text="Keine Anfragen" />}
            {pending.map((request) => {
              const company = request.companies;
              return (
                <div key={request.id} className="flex items-center justify-between rounded-xl border p-3">
                  <div className="flex items-center gap-3 min-w-0">
                    <img 
                      src={company.logo_url || '/placeholder.svg'} 
                      alt={company.name}
                      className="h-10 w-10 rounded-md bg-muted object-cover flex-shrink-0" 
                    />
                    <div className="min-w-0">
                      <div className="text-sm font-medium truncate">{company.name}</div>
                      <div className="text-xs text-muted-foreground truncate">
                        {company.industry && company.main_location 
                          ? `${company.industry} • ${company.main_location}`
                          : company.industry || company.main_location || 'Unternehmen'
                        }
                      </div>
                    </div>
                  </div>
                  <div className="flex gap-2 flex-shrink-0">
                    <Button
                      size="sm"
                      onClick={() => acceptFollowRequest(request.id, company.id)}
                      className="bg-gradient-to-r from-primary to-primary-foreground text-primary-foreground"
                    >
                      <Check className="h-4 w-4" />
                    </Button>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => declineFollowRequest(request.id, company.id)}
                    >
                      <X className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              );
            })}
          </div>
        </Card>

        {/* Following Companies */}
        <Card className="p-4">
          <h2 className="text-sm font-semibold mb-1">Gefolgte Unternehmen</h2>
          <p className="text-xs text-muted-foreground mb-4">Du erhältst Updates in deinem Feed</p>
          
          <div className="space-y-3">
            {loading && <LoadingSkeleton />}
            {!loading && !following.length && <EmptyState text="Du folgst noch keinen Unternehmen" />}
            {following.map((company) => (
              <div key={company.id} className="flex items-center justify-between rounded-xl border p-3">
                <div className="flex items-center gap-3 min-w-0">
                  <img 
                    src={company.logo_url || '/placeholder.svg'} 
                    alt={company.name}
                    className="h-10 w-10 rounded-md bg-muted object-cover flex-shrink-0" 
                  />
                  <div className="min-w-0">
                    <div className="text-sm font-medium truncate">{company.name}</div>
                    <div className="text-xs text-muted-foreground truncate">
                      {company.industry && company.main_location 
                        ? `${company.industry} • ${company.main_location}`
                        : company.industry || company.main_location || 'Unternehmen'
                      }
                    </div>
                  </div>
                </div>
                <div className="flex-shrink-0">
                  <FollowButton 
                    companyId={company.id} 
                    profileId={profileId} 
                    initialFollowing={true} 
                    initialBell="highlights"
                    onChange={refetch}
                  />
                </div>
              </div>
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
              <div key={company.id} className="rounded-xl border p-3">
                <div className="flex items-start justify-between gap-3 mb-2">
                  <div className="flex items-center gap-3 min-w-0">
                    <img 
                      src={company.logo_url || '/placeholder.svg'} 
                      alt={company.name}
                      className="h-10 w-10 rounded-md bg-muted object-cover flex-shrink-0" 
                    />
                    <div className="min-w-0">
                      <div className="text-sm font-medium truncate">{company.name}</div>
                      <div className="text-xs text-muted-foreground truncate">
                        {company.industry && company.city 
                          ? `${company.industry} • ${company.city}`
                          : company.industry || company.city || 'Unternehmen'
                        }
                      </div>
                    </div>
                  </div>
                  <div className="flex-shrink-0">
                    <FollowButton 
                      companyId={company.id} 
                      profileId={profileId} 
                      initialFollowing={false}
                      onChange={refetch}
                    />
                  </div>
                </div>
                
                {company.reasons && company.reasons.length > 0 && (
                  <div className="flex flex-wrap gap-1">
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
