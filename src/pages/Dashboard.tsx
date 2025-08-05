import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { User, FileText, Eye, Settings } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { useQuery } from "@tanstack/react-query";

const Dashboard = () => {
  const navigate = useNavigate();

  const { data: profile } = useQuery({
    queryKey: ['profile'],
    queryFn: async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return null;
      
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', user.id)
        .single();
      
      if (error) throw error;
      return data;
    }
  });

  // Calculate profile completeness
  const calculateProfileCompleteness = () => {
    if (!profile) return 0;
    
    const fields = [
      profile.full_name,
      profile.email,
      profile.phone,
      profile.location,
      profile.about_me,
      profile.skills?.length > 0,
      profile.avatar_url,
      profile.ausbildungsberuf,
      profile.industry
    ];
    
    const completedFields = fields.filter(Boolean).length;
    return Math.round((completedFields / fields.length) * 100);
  };

  const completeness = calculateProfileCompleteness();

  return (
    <div className="space-y-6">
      {/* Welcome Section */}
      <div className="space-y-2">
        <h1 className="text-3xl font-bold tracking-tight">
          Willkommen zurück{profile?.full_name ? `, ${profile.full_name}` : ''}!
        </h1>
        <p className="text-muted-foreground">
          Hier ist deine Übersicht über dein Azubi-Profil und deine Aktivitäten.
        </p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Profil-Vollständigkeit</CardTitle>
            <User className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{completeness}%</div>
            <Progress value={completeness} className="mt-2" />
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">CV Status</CardTitle>
            <FileText className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {profile?.cv_url ? 'Erstellt' : 'Ausstehend'}
            </div>
            <p className="text-xs text-muted-foreground">
              {profile?.cv_url ? 'CV ist bereit' : 'CV noch nicht erstellt'}
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Profilaufrufe</CardTitle>
            <Eye className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{profile?.profile_views || 0}</div>
            <p className="text-xs text-muted-foreground">
              Diese Woche
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Status</CardTitle>
            <Badge variant={profile?.industry ? "default" : "secondary"}>
              {profile?.industry || "Unvollständig"}
            </Badge>
          </CardHeader>
          <CardContent>
            <div className="text-sm font-medium">
              {profile?.ausbildungsberuf || 'Kein Berufswunsch'}
            </div>
            <p className="text-xs text-muted-foreground">
              Aktueller Status
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Quick Actions */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Profil vervollständigen</CardTitle>
            <CardDescription>
              Erhöhe deine Sichtbarkeit für Unternehmen
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {completeness < 100 && (
              <div className="space-y-2">
                <p className="text-sm text-muted-foreground">
                  Dein Profil ist zu {completeness}% vollständig. Vervollständige es, um mehr Aufmerksamkeit zu erhalten.
                </p>
                <Button onClick={() => navigate('/profile')} className="w-full">
                  Profil bearbeiten
                </Button>
              </div>
            )}
            
            {!profile?.cv_url && (
              <div className="space-y-2">
                <p className="text-sm text-muted-foreground">
                  Erstelle deinen professionellen Lebenslauf.
                </p>
                <Button 
                  variant="outline" 
                  onClick={() => navigate('/cv-generator')} 
                  className="w-full"
                >
                  CV erstellen
                </Button>
              </div>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Community beitreten</CardTitle>
            <CardDescription>
              Tausche dich mit anderen Azubis aus und stelle Fragen
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <p className="text-sm text-muted-foreground">
              Vernetze dich mit anderen Azubis, teile Erfahrungen und hole dir Rat.
            </p>
            <div className="flex space-x-2">
              <Button onClick={() => navigate('/marketplace')} className="flex-1">
                Community besuchen
              </Button>
              <Button 
                variant="outline" 
                size="icon"
                onClick={() => navigate('/profile')}
              >
                <Settings className="h-4 w-4" />
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Recent Activity */}
      {profile?.skills && profile.skills.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Deine Fähigkeiten</CardTitle>
            <CardDescription>
              Aktuelle Skills in deinem Profil
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex flex-wrap gap-2">
              {profile.skills.slice(0, 8).map((skill, index) => (
                <Badge key={index} variant="secondary">
                  {skill}
                </Badge>
              ))}
              {profile.skills.length > 8 && (
                <Badge variant="outline">
                  +{profile.skills.length - 8} weitere
                </Badge>
              )}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default Dashboard;