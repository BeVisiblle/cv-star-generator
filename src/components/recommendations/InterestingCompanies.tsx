import React, { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { CompanyMiniCard } from '@/components/cards/CompanyMiniCard';
import { useTranslation } from '@/lib/i18n';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { Loader2 } from 'lucide-react';

type Company = {
  id: string;
  name: string;
  logo_url?: string | null;
  industry?: string | null;
  main_location?: string | null;
  description?: string | null;
  verified?: boolean;
  follower_count?: number;
  is_following?: boolean;
};

export function InterestingCompanies() {
  const { t } = useTranslation();
  const { user } = useAuth();
  const [companies, setCompanies] = useState<Company[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const viewerId = user?.id;

  useEffect(() => {
    if (!viewerId) return;
    loadCompanies();
  }, [viewerId]);

  const loadCompanies = async () => {
    if (!viewerId) return;
    
    setLoading(true);
    setError(null);
    
    try {
      const { data, error: fetchError } = await (supabase as any).rpc("suggest_companies", { 
        p_viewer: viewerId, 
        p_limit: 3 
      }) as { data: Company[] | null; error: any };

      if (fetchError) throw fetchError;
      
      setCompanies(data || []);
    } catch (err: any) {
      console.error('Error loading companies:', err);
      setError(err.message || 'Fehler beim Laden der Empfehlungen');
    } finally {
      setLoading(false);
    }
  };

  const handleFollow = async (companyId: string) => {
    if (!viewerId) return;
    
    try {
      await supabase.from("follows").insert({ 
        follower_id: viewerId, 
        target_id: companyId 
      });
      
      await supabase.rpc("suggestions_touch", { 
        p_viewer: viewerId, 
        p_type: "company", 
        p_target: companyId 
      });
      
      // Update local state
      setCompanies(prev => prev.map(c => 
        c.id === companyId 
          ? { ...c, is_following: true }
          : c
      ));
    } catch (error) {
      console.error('Error following company:', error);
      throw error;
    }
  };

  if (!viewerId) return null;

  return (
    <Card>
      <CardHeader className="pb-2">
        <CardTitle className="text-sm font-semibold">
          {t('widgets.interesting_companies')}
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-2">
        {loading && (
          <div className="flex items-center justify-center py-8">
            <Loader2 className="h-6 w-6 animate-spin" />
          </div>
        )}
        
        {error && (
          <div className="text-center py-4">
            <p className="text-sm text-muted-foreground">{error}</p>
          </div>
        )}
        
        {!loading && !error && companies.length === 0 && (
          <div className="text-center py-4">
            <p className="text-sm text-muted-foreground">
              Keine Empfehlungen verfügbar
            </p>
          </div>
        )}
        
        {!loading && !error && companies.map((company) => (
          <CompanyMiniCard
            key={company.id}
            company={{
              id: company.id,
              display_name: company.name,
              headline: company.industry || company.description,
              avatar_url: company.logo_url,
              verified: company.verified,
              follower_count: company.follower_count,
              is_following: company.is_following,
            }}
            onFollow={handleFollow}
          />
        ))}
      </CardContent>
    </Card>
  );
}
