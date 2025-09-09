import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { useTranslation } from '@/lib/i18n';
import { CompanyMiniCard } from '../cards/CompanyMiniCard';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';

interface CompanyProfile {
  id: string;
  display_name: string;
  headline?: string;
  avatar_url?: string;
  verified?: boolean;
  follower_count?: number;
  is_following?: boolean;
}

export function InterestingCompaniesWidget() {
  const { t } = useTranslation();
  const { user } = useAuth();
  const [companies, setCompanies] = useState<CompanyProfile[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (user) {
      loadInterestingCompanies();
    }
  }, [user]);

  const loadInterestingCompanies = async () => {
    try {
      setIsLoading(true);
      setError(null);

      // Use the RPC function to get interesting companies
      const { data, error: rpcError } = await supabase
        .rpc('get_interesting_profiles', {
          viewer_id: user?.id,
          profile_type: 'company',
          limit_count: 5
        });

      if (rpcError) {
        console.error('Error loading interesting companies:', rpcError);
        setError('Fehler beim Laden der Unternehmen');
        return;
      }

      // Transform the data to match our interface
      const transformedCompanies: CompanyProfile[] = (data || []).map((company: any) => ({
        id: company.profile_id,
        display_name: company.display_name,
        headline: company.headline,
        avatar_url: company.avatar_url,
        verified: company.verified,
        follower_count: company.follower_count,
        is_following: company.is_following
      }));

      setCompanies(transformedCompanies);
    } catch (error) {
      console.error('Error loading interesting companies:', error);
      setError('Fehler beim Laden der Unternehmen');
    } finally {
      setIsLoading(false);
    }
  };

  const handleFollow = async (companyId: string) => {
    try {
      // TODO: Implement follow functionality
      console.log('Follow company:', companyId);
      
      // Update local state optimistically
      setCompanies(prev => prev.map(company => 
        company.id === companyId 
          ? { ...company, is_following: true }
          : company
      ));
    } catch (error) {
      console.error('Error following company:', error);
    }
  };

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">{t('widgets.interesting_companies')}</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          {Array.from({ length: 3 }).map((_, i) => (
            <div key={i} className="flex items-center space-x-3">
              <Skeleton className="h-10 w-10 rounded-full" />
              <div className="flex-1 space-y-2">
                <Skeleton className="h-4 w-3/4" />
                <Skeleton className="h-3 w-1/2" />
              </div>
              <Skeleton className="h-7 w-16" />
            </div>
          ))}
        </CardContent>
      </Card>
    );
  }

  if (error) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">{t('widgets.interesting_companies')}</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center py-4">
            <p className="text-sm text-muted-foreground mb-2">{error}</p>
            <Button variant="outline" size="sm" onClick={loadInterestingCompanies}>
              Erneut versuchen
            </Button>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (companies.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">{t('widgets.interesting_companies')}</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center py-4">
            <p className="text-sm text-muted-foreground">
              Keine interessanten Unternehmen gefunden
            </p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-lg">{t('widgets.interesting_companies')}</CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        {companies.map((company) => (
          <CompanyMiniCard
            key={company.id}
            company={company}
            onFollow={handleFollow}
          />
        ))}
        
        {companies.length >= 5 && (
          <div className="text-center pt-2">
            <Button variant="ghost" size="sm" className="text-xs">
              Alle anzeigen
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
