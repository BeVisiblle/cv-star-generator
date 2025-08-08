import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { useCompany } from "@/hooks/useCompany";
import { supabase } from "@/integrations/supabase/client";
import { Eye, Coins } from "lucide-react";
import { ProfileCard } from "@/components/Company/ProfileCard";

interface Profile {
  id: string;
  vorname: string;
  nachname: string;
  status: string;
  branche: string;
  ort: string;
  plz?: string;
  avatar_url?: string;
  headline?: string;
  faehigkeiten?: any;
  email?: string;
  telefon?: string;
  cv_url?: string;
}

export default function CompanyUnlocked() {
  const { company } = useCompany();
  const navigate = useNavigate();
  const [profiles, setProfiles] = useState<Profile[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!company) return;
    const load = async () => {
      setLoading(true);
      try {
        const { data, error } = await supabase
          .from('tokens_used')
          .select(`*, profiles (*)`)
          .eq('company_id', company.id)
          .order('used_at', { ascending: false });
        if (error) throw error;
        const list = (data || []).map((row: any) => row.profiles).filter(Boolean);
        setProfiles(list as Profile[]);
      } catch (e) {
        console.error('Error loading unlocked profiles', e);
      } finally {
        setLoading(false);
      }
    };
    load();
  }, [company]);

  return (
    <div className="p-3 md:p-6 min-h-screen bg-background max-w-full overflow-x-hidden space-y-6">
      <div className="flex items-center justify-between mb-2">
        <h1 className="text-2xl sm:text-3xl font-bold">Freigeschaltete Kontakte</h1>
        <Badge variant="secondary" className="px-3 py-1">
          <Eye className="h-4 w-4 mr-1" /> {profiles.length}
        </Badge>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Kürzlich freigeschaltet</CardTitle>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="flex items-center justify-center py-16">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
            </div>
          ) : profiles.length === 0 ? (
            <div className="text-center py-16 text-muted-foreground">
              Noch keine Profile freigeschaltet.
              <div className="mt-4">
                <Button onClick={() => navigate('/company/search')}>
                  <Coins className="h-4 w-4 mr-2" /> Kandidaten suchen
                </Button>
              </div>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {profiles.map((p) => (
                <ProfileCard
                  key={p.id}
                  profile={p}
                  isUnlocked={true}
                  matchPercentage={75}
                  onUnlock={() => {}}
                  onSave={() => {}}
                  onPreview={() => navigate(`/company/profile/${p.id}`)}
                />
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
