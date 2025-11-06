import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ArrowLeft, Lock, CheckCircle2, UserCheck, Clock, Download } from "lucide-react";
import { toast } from "sonner";
import { useCompany } from "@/hooks/useCompany";
import { unlockService } from "@/services/unlockService";
import { LinkedInProfileHeader } from "@/components/linkedin/LinkedInProfileHeader";
import { LinkedInProfileMain } from "@/components/linkedin/LinkedInProfileMain";
import { LinkedInProfileExperience } from "@/components/linkedin/LinkedInProfileExperience";
import { LinkedInProfileEducation } from "@/components/linkedin/LinkedInProfileEducation";
import { LinkedInProfileActivity } from "@/components/linkedin/LinkedInProfileActivity";
import { LinkedInProfileSidebar } from "@/components/linkedin/LinkedInProfileSidebar";
import { WeitereDokumenteSection } from "@/components/linkedin/right-rail/WeitereDokumenteSection";
import { ContactInfoCard } from "@/components/linkedin/right-rail/ContactInfoCard";
import { AdCard } from "@/components/linkedin/right-rail/AdCard";
import CandidateUnlockModal from "@/components/unlock/CandidateUnlockModal";

export default function ProfileView() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { company } = useCompany();
  
  const [profile, setProfile] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [isUnlocked, setIsUnlocked] = useState(false);
  const [followStatus, setFollowStatus] = useState<'none' | 'pending' | 'accepted'>('none');
  const [following, setFollowing] = useState(false);
  const [applications, setApplications] = useState<any[]>([]);
  const [unlockModalOpen, setUnlockModalOpen] = useState(false);
  const [actualUserId, setActualUserId] = useState<string | null>(null); // Store the actual user_id for unlock checks

  useEffect(() => {
    if (!id || !company) return;
    loadProfile();
  }, [id, company]);

  // Separate useEffect for unlock/follow/applications that waits for actualUserId
  useEffect(() => {
    if (!actualUserId || !company) return;
    checkUnlockState();
    checkFollowState();
    loadApplications();
  }, [actualUserId, company]);

  const loadProfile = async () => {
    try {
      console.log("🔍 Loading profile for ID:", id);
      
      let userId = id; // This will be the actual user_id
      
      // First, try to load from profiles table directly (user_id)
      let { data: profileData, error: profileError } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', id)
        .maybeSingle();

      // If not found in profiles, check if it's a candidate_id
      if (!profileData) {
        console.log("❌ Not found in profiles, checking candidates table...");
        
        const { data: candidateData, error: candidateError } = await supabase
          .from('candidates')
          .select('user_id')
          .eq('id', id)
          .maybeSingle();

        if (candidateError) {
          console.error("Error loading from candidates:", candidateError);
        }

        if (candidateData?.user_id) {
          console.log("✅ Found in candidates table, loading profile for user_id:", candidateData.user_id);
          userId = candidateData.user_id;
          
          // Now load the full profile using the user_id
          const { data: userProfile, error: userProfileError } = await supabase
            .from('profiles')
            .select('*')
            .eq('id', candidateData.user_id)
            .maybeSingle();

          if (userProfileError) {
            console.error("Error loading user profile:", userProfileError);
          }

          // Use the full user profile if it exists
          if (userProfile) {
            profileData = userProfile;
          }
        }
      }

      if (!profileData) {
        throw new Error('Profil nicht gefunden');
      }

      console.log("✅ Profile loaded:", profileData);
      setProfile(profileData);
      setActualUserId(userId || null);
    } catch (error: any) {
      console.error('Error loading profile:', error);
      toast.error('Fehler beim Laden des Profils');
    } finally {
      setLoading(false);
    }
  };

  const checkUnlockState = async () => {
    if (!actualUserId || !company) return;
    
    console.log("🔓 Checking unlock state for user_id:", actualUserId);
    
    try {
      const { data, error } = await supabase
        .from('company_candidates')
        .select('unlocked_at, stage')
        .eq('candidate_id', actualUserId)
        .eq('company_id', company.id)
        .maybeSingle();

      if (error) {
        console.error("Error checking unlock:", error);
      }

      const unlocked = !!data?.unlocked_at;
      console.log("🔓 Unlock state:", { unlocked, data });
      setIsUnlocked(unlocked);
    } catch (error) {
      console.error('Error checking unlock state:', error);
    }
  };

  const checkFollowState = async () => {
    if (!actualUserId || !company) return;
    try {
      const { data, error } = await supabase
        .from('company_follows')
        .select('status')
        .eq('company_id', company.id)
        .eq('candidate_id', actualUserId)
        .maybeSingle();

      if (error) throw error;
      if (data) {
        setFollowStatus(data.status as any);
      }
    } catch (error) {
      console.error('Error checking follow state:', error);
    }
  };

  const loadApplications = async () => {
    if (!actualUserId || !company) return;
    try {
      const { data, error } = await supabase
        .from('applications')
        .select(`
          *,
          job_posts!applications_job_id_fkey (
            id,
            title,
            city
          )
        `)
        .eq('candidate_id', actualUserId)
        .eq('company_id', company.id);

      if (error) throw error;
      setApplications(data || []);
    } catch (error) {
      console.error('Error loading applications:', error);
    }
  };


  const handleFollow = async () => {
    if (!actualUserId || !company) return;
    setFollowing(true);
    try {
      if (followStatus === 'accepted') {
        // Unfollow
        const { error } = await supabase
          .from('company_follows')
          .delete()
          .eq('company_id', company.id)
          .eq('candidate_id', actualUserId);

        if (error) throw error;
        setFollowStatus('none');
        toast.success('Nicht mehr gefolgt');
      } else if (followStatus === 'none') {
        // Follow
        const { error } = await supabase
          .from('company_follows')
          .insert({
            company_id: company.id,
            candidate_id: actualUserId,
            status: 'pending'
          });

        if (error) throw error;
        setFollowStatus('pending');
        toast.success('Follow-Anfrage gesendet');
      }
    } catch (error: any) {
      console.error('Error following:', error);
      toast.error('Fehler beim Folgen');
    } finally {
      setFollowing(false);
    }
  };

  const handleDownloadCV = async () => {
    if (!profile?.cv_url) return;
    
    try {
      const link = document.createElement('a');
      link.href = profile.cv_url;
      link.download = `CV_${profile.vorname}_${profile.nachname}.pdf`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      
      toast.success('CV wird heruntergeladen');
    } catch (error) {
      console.error('Error downloading CV:', error);
      toast.error('Fehler beim Download');
    }
  };

  // Mask data if not unlocked
  const displayProfile = isUnlocked ? profile : profile ? {
    ...profile,
    nachname: profile.nachname ? `${profile.nachname[0]}.` : '',
    email: null,
    telefon: null,
  } : null;

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

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto py-6 px-4 max-w-7xl">
        {/* Header with Back Button */}
        <div className="flex items-center justify-between mb-6">
          <Button
            variant="ghost"
            onClick={() => navigate('/company/candidates')}
            className="gap-2"
          >
            <ArrowLeft className="h-4 w-4" />
            Zurück zur Kandidatensuche
          </Button>
          
          {/* Follow Button - only show if unlocked */}
          {isUnlocked && (
            <Button
              variant={followStatus === 'accepted' ? 'secondary' : 'outline'}
              onClick={handleFollow}
              disabled={following || followStatus === 'pending'}
              className="gap-2"
            >
              {followStatus === 'pending' ? (
                <>
                  <Clock className="h-4 w-4" />
                  Ausstehend
                </>
              ) : followStatus === 'accepted' ? (
                <>
                  <UserCheck className="h-4 w-4" />
                  Gefolgt
                </>
              ) : (
                <>
                  <UserCheck className="h-4 w-4" />
                  Folgen
                </>
              )}
            </Button>
          )}
        </div>

        {/* Application Status Banner */}
        {applications.length > 0 && (
          <div className="mb-6 p-4 bg-green-50 border border-green-200 rounded-lg flex items-center gap-3">
            <CheckCircle2 className="h-5 w-5 text-green-600" />
            <div>
              <p className="font-medium text-green-900">
                Hat sich beworben auf: {applications[0].job_posts?.title || 'Ihre Stelle'}
              </p>
              <p className="text-sm text-green-700">
                Bewerbung vom {new Date(applications[0].created_at).toLocaleDateString('de-DE')}
              </p>
            </div>
          </div>
        )}

        {/* Unlock Section if not unlocked */}
        {!isUnlocked && (
          <div className="mb-6 p-6 bg-yellow-50 border border-yellow-200 rounded-lg">
            <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
              <div className="flex items-center gap-3">
                <Lock className="h-6 w-6 text-yellow-600 flex-shrink-0" />
                <div>
                  <h3 className="font-semibold text-yellow-900">Profil nicht freigeschaltet</h3>
                  <p className="text-sm text-yellow-700">
                    Schalten Sie das Profil frei, um vollständige Kontaktdaten und Dokumente zu sehen
                  </p>
                </div>
              </div>
              <Button
                onClick={() => setUnlockModalOpen(true)}
                size="lg"
                className="flex-shrink-0"
              >
                <Lock className="h-4 w-4 mr-2" />
                Profil freischalten
              </Button>
            </div>
          </div>
        )}

        {/* 2-Column Layout - Same as UserProfile */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* Left Column - Main Content */}
          <div className="lg:col-span-8 space-y-6">
            <LinkedInProfileHeader
              profile={displayProfile}
              isEditing={false}
              onProfileUpdate={() => {}}
            />
            
            <LinkedInProfileMain
              profile={displayProfile}
              isEditing={false}
              onProfileUpdate={() => {}}
              readOnly={true}
            />
            
            <LinkedInProfileExperience
              experiences={displayProfile?.berufserfahrung || []}
              isEditing={false}
              onExperiencesUpdate={() => {}}
            />
            
            <LinkedInProfileEducation
              education={displayProfile?.schulbildung || []}
              isEditing={false}
              onEducationUpdate={() => {}}
            />
            
            {/* Activity only if follow is accepted */}
            {followStatus === 'accepted' && (
              <LinkedInProfileActivity profile={displayProfile} />
            )}
          </div>

          {/* Right Column - Sidebar */}
          <div className="lg:col-span-4">
            <div className="lg:sticky lg:top-20 space-y-4">
              {/* Contact Info Card - only when unlocked */}
              {isUnlocked && (
                <ContactInfoCard
                  email={profile?.email || profile?.telefon}
                  phone={profile?.telefon}
                  location={profile?.ort}
                  website={profile?.website}
                />
              )}

              <LinkedInProfileSidebar
                profile={displayProfile}
                isEditing={false}
                onProfileUpdate={() => {}}
                onEditingChange={() => {}}
                readOnly={true}
                showCVSection={isUnlocked}
                showLanguagesAndSkills={true}
                showLicenseAndStats={true}
              />

              {/* Weitere Dokumente - only when unlocked */}
              {isUnlocked && actualUserId && (
                <WeitereDokumenteSection
                  userId={actualUserId}
                  readOnly={true}
                  openWidget={() => {}}
                  refreshTrigger={0}
                />
              )}

              {/* Werbung */}
              <AdCard />
            </div>
          </div>
        </div>

        {/* Unlock Modal */}
        {profile && actualUserId && (
          <CandidateUnlockModal
            open={unlockModalOpen}
            onOpenChange={setUnlockModalOpen}
            candidate={{
              id: actualUserId,
              full_name: profile.full_name,
              vorname: profile.vorname,
              nachname: profile.nachname,
            }}
            companyId={company?.id || ""}
            contextApplication={null}
            contextType="none"
            onSuccess={async () => {
              setIsUnlocked(true);
              await loadProfile();
              await checkUnlockState();
              toast.success("Profil freigeschaltet!");
              setUnlockModalOpen(false);
            }}
          />
        )}
      </div>
    </div>
  );
}
