import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Separator } from "@/components/ui/separator";
import { 
  MapPin, 
  Mail, 
  Phone, 
  Download, 
  FileText, 
  Calendar,
  Building2,
  School,
  Award,
  UserPlus,
  UserCheck,
  Briefcase,
  ArrowLeft,
  CheckCircle2
} from "lucide-react";
import { toast } from "sonner";
import { useCompany } from "@/hooks/useCompany";
import { unlockService } from "@/services/unlockService";

interface Profile {
  id: string;
  vorname: string;
  nachname: string;
  status: string;
  branche: string;
  ort: string;
  plz: string;
  avatar_url?: string | null;
  email?: string | null;
  telefon?: string | null;
  cv_url?: string | null;
  headline?: string | null;
  bio?: string | null;
  geburtsdatum?: string | null;
  schule?: string | null;
  ausbildungsberuf?: string | null;
  ausbildungsbetrieb?: string | null;
  startjahr?: string | null;
  voraussichtliches_ende?: string | null;
  abschlussjahr?: string | null;
  has_drivers_license?: boolean | null;
  driver_license_class?: string | null;
  faehigkeiten?: any | null;
  sprachen?: any | null;
  berufserfahrung?: any | null;
}

export default function ProfileView() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { company } = useCompany();
  const [profile, setProfile] = useState<Profile | null>(null);
  const [loading, setLoading] = useState(true);
  const [isUnlocked, setIsUnlocked] = useState(false);
  const [isFollowing, setIsFollowing] = useState(false);
  const [followStatus, setFollowStatus] = useState<'none' | 'pending' | 'accepted'>('none');
  const [applications, setApplications] = useState<any[]>([]);
  const [unlocking, setUnlocking] = useState(false);

  useEffect(() => {
    if (!id || !company) return;
    loadProfile();
    checkUnlockState();
    checkFollowState();
    loadApplications();
  }, [id, company]);

  const loadProfile = async () => {
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', id)
        .single();

      if (error) throw error;
      setProfile(data as Profile);
    } catch (error: any) {
      console.error('Error loading profile:', error);
      toast.error('Fehler beim Laden des Profils');
    } finally {
      setLoading(false);
    }
  };

  const checkUnlockState = async () => {
    if (!id) return;
    const state = await unlockService.checkUnlockState(id);
    setIsUnlocked(state?.basic_unlocked || false);
  };

  const checkFollowState = async () => {
    if (!id || !company) return;
    try {
      const { data, error } = await supabase
        .from('company_follows')
        .select('status')
        .eq('company_id', company.id)
        .eq('candidate_id', id)
        .maybeSingle();

      if (error) throw error;
      if (data) {
        setIsFollowing(true);
        setFollowStatus(data.status as any);
      }
    } catch (error) {
      console.error('Error checking follow state:', error);
    }
  };

  const loadApplications = async () => {
    if (!id || !company) return;
    try {
      const { data, error } = await supabase
        .from('applications')
        .select(`
          *,
          job_posts (
            id,
            title,
            location
          )
        `)
        .eq('candidate_id', id)
        .eq('company_id', company.id);

      if (error) throw error;
      setApplications(data || []);
    } catch (error) {
      console.error('Error loading applications:', error);
    }
  };

  const handleUnlock = async () => {
    if (!id) return;
    setUnlocking(true);
    try {
      const result = await unlockService.unlockBasic({ profileId: id });
      if (result.success) {
        toast.success('Profil freigeschaltet!');
        setIsUnlocked(true);
        await loadProfile(); // Reload with full data
      } else {
        const errorMsg = 'error' in result ? result.error : 'Fehler beim Freischalten';
        toast.error(errorMsg);
      }
    } catch (error: any) {
      toast.error(error.message || 'Fehler beim Freischalten');
    } finally {
      setUnlocking(false);
    }
  };

  const handleFollow = async () => {
    if (!id || !company) return;
    try {
      if (isFollowing) {
        // Unfollow
        const { error } = await supabase
          .from('company_follows')
          .delete()
          .eq('company_id', company.id)
          .eq('candidate_id', id);

        if (error) throw error;
        setIsFollowing(false);
        setFollowStatus('none');
        toast.success('Nicht mehr gefolgt');
      } else {
        // Follow
        const { error } = await supabase
          .from('company_follows')
          .insert({
            company_id: company.id,
            candidate_id: id,
            status: 'pending'
          });

        if (error) throw error;
        setIsFollowing(true);
        setFollowStatus('pending');
        toast.success('Follow-Anfrage gesendet');
      }
    } catch (error: any) {
      console.error('Error following:', error);
      toast.error('Fehler beim Folgen');
    }
  };

  const downloadCV = async () => {
    if (!profile?.cv_url) return;
    try {
      const link = document.createElement('a');
      link.href = profile.cv_url;
      link.download = `CV_${profile.vorname}_${profile.nachname}.pdf`;
      link.click();
      toast.success('CV wird heruntergeladen');
    } catch (error) {
      toast.error('Fehler beim Download');
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (!profile) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen gap-4">
        <p className="text-lg text-muted-foreground">Profil nicht gefunden</p>
        <Button onClick={() => navigate('/company/search')}>
          Zurück zur Suche
        </Button>
      </div>
    );
  }

  const displayName = isUnlocked 
    ? `${profile.vorname} ${profile.nachname}`
    : `${profile.vorname} ${profile.nachname?.charAt(0)}.`;

  const age = profile.geburtsdatum 
    ? new Date().getFullYear() - new Date(profile.geburtsdatum).getFullYear()
    : null;

  return (
    <div className="container max-w-5xl mx-auto p-6 space-y-6">
      {/* Back Button */}
      <Button variant="ghost" onClick={() => navigate(-1)}>
        <ArrowLeft className="h-4 w-4 mr-2" />
        Zurück
      </Button>

      {/* Header Card */}
      <Card>
        <CardHeader>
          <div className="flex items-start justify-between">
            <div className="flex items-start gap-6">
              <Avatar className="h-24 w-24">
                {isUnlocked && profile.avatar_url && (
                  <AvatarImage src={profile.avatar_url} alt={displayName} />
                )}
                <AvatarFallback className="text-2xl">
                  {profile.vorname?.charAt(0)}{profile.nachname?.charAt(0)}
                </AvatarFallback>
              </Avatar>

              <div className="space-y-2">
                <div className="flex items-center gap-3">
                  <h1 className="text-3xl font-bold">{displayName}</h1>
                  {!isUnlocked && (
                    <Badge variant="outline" className="text-yellow-600 border-yellow-600">
                      Nicht freigeschaltet
                    </Badge>
                  )}
                </div>
                
                <p className="text-lg text-muted-foreground">
                  {profile.headline || profile.branche}
                </p>

                <div className="flex items-center gap-4 text-sm text-muted-foreground">
                  <div className="flex items-center gap-1">
                    <MapPin className="h-4 w-4" />
                    <span>{profile.ort}</span>
                  </div>
                  {age && (
                    <div className="flex items-center gap-1">
                      <Calendar className="h-4 w-4" />
                      <span>{age} Jahre</span>
                    </div>
                  )}
                  <Badge variant="secondary">{profile.status}</Badge>
                </div>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex gap-2">
              {!isUnlocked ? (
                <Button 
                  onClick={handleUnlock}
                  disabled={unlocking}
                  className="bg-blue-600 hover:bg-blue-700"
                >
                  {unlocking ? 'Schalte frei...' : 'Profil freischalten (1 Token)'}
                </Button>
              ) : (
                <>
                  <Button
                    variant={isFollowing ? "outline" : "default"}
                    onClick={handleFollow}
                  >
                    {isFollowing ? (
                      followStatus === 'accepted' ? (
                        <>
                          <UserCheck className="h-4 w-4 mr-2" />
                          Gefolgt
                        </>
                      ) : (
                        <>
                          <UserPlus className="h-4 w-4 mr-2" />
                          Ausstehend
                        </>
                      )
                    ) : (
                      <>
                        <UserPlus className="h-4 w-4 mr-2" />
                        Folgen
                      </>
                    )}
                  </Button>
                  {profile.cv_url && (
                    <Button variant="outline" onClick={downloadCV}>
                      <Download className="h-4 w-4 mr-2" />
                      CV Download
                    </Button>
                  )}
                </>
              )}
            </div>
          </div>

          {/* Applications Banner */}
          {applications.length > 0 && (
            <div className="mt-4 p-3 bg-green-50 border border-green-200 rounded-lg">
              <div className="flex items-center gap-2 text-green-700">
                <CheckCircle2 className="h-5 w-5" />
                <span className="font-medium">
                  Hat sich beworben auf: {applications.map((app: any) => app.job_posts?.title).join(', ')}
                </span>
              </div>
            </div>
          )}
        </CardHeader>

        <CardContent className="space-y-6">
          <Separator />

          {/* Contact Information */}
          {isUnlocked && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {profile.email && (
                <div className="flex items-center gap-2">
                  <Mail className="h-4 w-4 text-muted-foreground" />
                  <a href={`mailto:${profile.email}`} className="text-blue-600 hover:underline">
                    {profile.email}
                  </a>
                </div>
              )}
              {profile.telefon && (
                <div className="flex items-center gap-2">
                  <Phone className="h-4 w-4 text-muted-foreground" />
                  <a href={`tel:${profile.telefon}`} className="text-blue-600 hover:underline">
                    {profile.telefon}
                  </a>
                </div>
              )}
            </div>
          )}

          {!isUnlocked && (
            <div className="p-4 bg-yellow-50 border border-yellow-200 rounded-lg text-center">
              <p className="text-yellow-800">
                Schalte das Profil frei, um vollständige Kontaktdaten, CV und alle Details zu sehen.
              </p>
            </div>
          )}

          <Separator />

          {/* Professional Information */}
          {isUnlocked && (
            <>
              <div className="space-y-4">
                <h3 className="text-lg font-semibold">Berufliche Informationen</h3>
                
                {profile.status === 'azubi' && (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {profile.ausbildungsberuf && (
                      <div className="flex items-start gap-2">
                        <Briefcase className="h-4 w-4 text-muted-foreground mt-1" />
                        <div>
                          <p className="text-sm text-muted-foreground">Ausbildungsberuf</p>
                          <p className="font-medium">{profile.ausbildungsberuf}</p>
                        </div>
                      </div>
                    )}
                    {profile.ausbildungsbetrieb && (
                      <div className="flex items-start gap-2">
                        <Building2 className="h-4 w-4 text-muted-foreground mt-1" />
                        <div>
                          <p className="text-sm text-muted-foreground">Ausbildungsbetrieb</p>
                          <p className="font-medium">{profile.ausbildungsbetrieb}</p>
                        </div>
                      </div>
                    )}
                    {profile.startjahr && (
                      <div className="flex items-start gap-2">
                        <Calendar className="h-4 w-4 text-muted-foreground mt-1" />
                        <div>
                          <p className="text-sm text-muted-foreground">Ausbildungsstart</p>
                          <p className="font-medium">{profile.startjahr}</p>
                        </div>
                      </div>
                    )}
                    {profile.voraussichtliches_ende && (
                      <div className="flex items-start gap-2">
                        <Award className="h-4 w-4 text-muted-foreground mt-1" />
                        <div>
                          <p className="text-sm text-muted-foreground">Voraussichtliches Ende</p>
                          <p className="font-medium">{profile.voraussichtliches_ende}</p>
                        </div>
                      </div>
                    )}
                  </div>
                )}

                {profile.status === 'schueler' && profile.schule && (
                  <div className="flex items-start gap-2">
                    <School className="h-4 w-4 text-muted-foreground mt-1" />
                    <div>
                      <p className="text-sm text-muted-foreground">Schule</p>
                      <p className="font-medium">{profile.schule}</p>
                      {profile.abschlussjahr && (
                        <p className="text-sm text-muted-foreground">Abschluss: {profile.abschlussjahr}</p>
                      )}
                    </div>
                  </div>
                )}
              </div>

              <Separator />

              {/* Bio */}
              {profile.bio && (
                <>
                  <div className="space-y-2">
                    <h3 className="text-lg font-semibold">Über mich</h3>
                    <p className="text-muted-foreground whitespace-pre-wrap">{profile.bio}</p>
                  </div>
                  <Separator />
                </>
              )}

              {/* Skills */}
              {profile.faehigkeiten && Array.isArray(profile.faehigkeiten) && profile.faehigkeiten.length > 0 && (
                <>
                  <div className="space-y-3">
                    <h3 className="text-lg font-semibold">Fähigkeiten</h3>
                    <div className="flex flex-wrap gap-2">
                      {profile.faehigkeiten.map((skill: any, index: number) => (
                        <Badge key={index} variant="secondary">
                          {skill.name || skill}
                        </Badge>
                      ))}
                    </div>
                  </div>
                  <Separator />
                </>
              )}

              {/* Languages */}
              {profile.sprachen && Array.isArray(profile.sprachen) && profile.sprachen.length > 0 && (
                <>
                  <div className="space-y-3">
                    <h3 className="text-lg font-semibold">Sprachen</h3>
                    <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
                      {profile.sprachen.map((lang: any, index: number) => (
                        <div key={index} className="flex items-center justify-between p-2 bg-muted rounded">
                          <span>{lang.name || lang}</span>
                          {lang.level && (
                            <Badge variant="outline" className="ml-2">{lang.level}</Badge>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>
                  <Separator />
                </>
              )}

              {/* Driver License */}
              {profile.has_drivers_license && (
                <div className="flex items-center gap-2">
                  <Award className="h-4 w-4 text-green-600" />
                  <span className="text-green-600 font-medium">
                    Führerschein
                    {profile.driver_license_class && ` (Klasse ${profile.driver_license_class})`}
                  </span>
                </div>
              )}
            </>
          )}
        </CardContent>
      </Card>

      {/* Documents Section */}
      {isUnlocked && profile.cv_url && (
        <Card>
          <CardHeader>
            <h3 className="text-lg font-semibold">Dokumente</h3>
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-between p-4 bg-muted rounded-lg">
              <div className="flex items-center gap-3">
                <FileText className="h-8 w-8 text-blue-600" />
                <div>
                  <p className="font-medium">Lebenslauf</p>
                  <p className="text-sm text-muted-foreground">PDF Dokument</p>
                </div>
              </div>
              <Button variant="outline" onClick={downloadCV}>
                <Download className="h-4 w-4 mr-2" />
                Download
              </Button>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
