import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { KeyValueRow } from '@/components/ui/key-value-row';
import { ArrowLeft, Loader2 } from 'lucide-react';
import { toast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { LinkedInProfileHeader } from '@/components/linkedin/LinkedInProfileHeader';
import { LinkedInProfileMain } from '@/components/linkedin/LinkedInProfileMain';
import { LinkedInProfileSidebar } from '@/components/linkedin/LinkedInProfileSidebar';
import { LinkedInProfileExperience } from '@/components/linkedin/LinkedInProfileExperience';
import { LinkedInProfileEducation } from '@/components/linkedin/LinkedInProfileEducation';
import { LinkedInProfileActivity } from '@/components/linkedin/LinkedInProfileActivity';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import { Textarea } from '@/components/ui/textarea';
import { useCompany } from '@/hooks/useCompany';
import { useAuth } from '@/hooks/useAuth';
import FollowButton from '@/components/company/FollowButton';

const CompanyProfileView = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { company } = useCompany();
  const { user } = useAuth();
  const [profile, setProfile] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isUnlocked, setIsUnlocked] = useState(false);
  const [notes, setNotes] = useState<any[]>([]);
  const [newNote, setNewNote] = useState("");
  const [history, setHistory] = useState<any[]>([]);

  useEffect(() => {
    const fetchProfile = async () => {
      if (!id || !company?.id) return; // wait until we have company context

      try {
        setIsLoading(true);
        
        // Check if profile is unlocked for this company via company_candidates
        const { data: pipelineRow, error: pipelineError } = await supabase
          .from('company_candidates')
          .select('stage, unlocked_at')
          .eq('candidate_id', id)
          .eq('company_id', company.id)
          .limit(1)
          .maybeSingle();

        if (pipelineError && pipelineError.code !== 'PGRST116') {
          console.error('Pipeline check error:', pipelineError);
        }

        const unlocked = !!pipelineRow && (!!pipelineRow.unlocked_at || pipelineRow.stage !== 'new');
        setIsUnlocked(unlocked);

        // Fetch profile data
        const { data: profileData, error } = await supabase
          .from('profiles')
          .select('*')
          .eq('id', id)
          .single();

        if (error) {
          console.error('Error fetching profile:', error);
          toast({
            title: 'Fehler',
            description: 'Profil konnte nicht geladen werden.',
            variant: 'destructive'
          });
          navigate('/company/search');
          return;
        }

        setProfile(profileData);
      } catch (error) {
        console.error('Error:', error);
        toast({
          title: 'Fehler',
          description: 'Ein unerwarteter Fehler ist aufgetreten.',
          variant: 'destructive'
        });
        navigate('/company/search');
      } finally {
        setIsLoading(false);
      }
    };

    fetchProfile();
  }, [id, company?.id, navigate]);

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="flex items-center space-x-2">
          <Loader2 className="h-8 w-8 animate-spin" />
          <span>Profil wird geladen...</span>
        </div>
      </div>
    );
  }

  if (!profile) {
    return (
      <div className="container mx-auto p-6">
        <Card className="p-6 text-center">
          <h1 className="text-2xl font-bold mb-4">Profil nicht gefunden</h1>
          <p className="text-muted-foreground mb-4">
            Das angeforderte Profil konnte nicht gefunden werden.
          </p>
          <Button onClick={() => navigate('/company/search')}>
            Zurück zur Suche
          </Button>
        </Card>
      </div>
    );
  }

  // Create display profile based on unlock status
  const displayProfile = isUnlocked ? profile : {
    ...profile,
    nachname: profile.nachname?.charAt(0) + '.',
    email: null,
    telefon: null,
    avatar_url: null,
    strasse: null,
    hausnummer: null
  };

  const displayEmail = displayProfile?.email || null;
  const displayPhone = displayProfile?.telefon || null;
  const addressParts = [
    displayProfile?.strasse
      ? `${displayProfile.strasse}${displayProfile.hausnummer ? ' ' + displayProfile.hausnummer : ''}`
      : null,
    displayProfile?.plz || null,
    displayProfile?.ort || null,
  ].filter(Boolean) as string[];
  const displayAddress = addressParts.length ? addressParts.join(', ') : null;

  return (
    <div className="p-3 md:p-6 min-h-screen bg-background max-w-full overflow-x-hidden">
      {/* Breadcrumb Header */}
      <div className="mb-4 md:mb-6 max-w-full">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
          <Button 
            variant="outline" 
            onClick={() => navigate('/company/search')}
            className="flex items-center gap-2 w-fit"
          >
            <ArrowLeft className="h-4 w-4" />
            <span className="hidden sm:inline">Zurück zur Suche</span>
            <span className="sm:hidden">Zurück</span>
          </Button>
          
          {!isUnlocked && (
            <div className="bg-yellow-100 text-yellow-800 px-3 py-1 rounded-full text-xs sm:text-sm text-center">
              <span className="hidden sm:inline">Limitierte Ansicht - Profil nicht freigeschaltet</span>
              <span className="sm:hidden">Nicht freigeschaltet</span>
            </div>
          )}
        </div>
        
        <div className="mt-4">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
            <div>
              <h1 className="text-lg sm:text-xl md:text-2xl font-bold truncate">
                {isUnlocked ? `${profile.vorname} ${profile.nachname}` : profile.vorname}
              </h1>
              <p className="text-muted-foreground text-xs md:text-sm">
                Profil-Details
              </p>
            </div>
            
            {/* Follow Button */}
            {company?.id && (
              <div className="sm:ml-auto">
                <FollowButton
                  companyId={company.id}
                  profileId={id!}
                  mode="company-to-profile"
                />
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Responsive layout: Mobile stacked, Desktop with sidebar */}
      <div className="flex flex-col lg:grid lg:grid-cols-12 gap-4 md:gap-6">
        {/* Main Content Area */}
        <main className="lg:col-span-8 space-y-4 md:space-y-6">
          {/* Profile Header with Cover Photo - Always first */}
          <LinkedInProfileHeader
            profile={displayProfile}
            isEditing={false}
            onProfileUpdate={() => {}} // Read-only
          />

          {/* About Section */}
          <LinkedInProfileMain
            profile={displayProfile}
            isEditing={false}
            onProfileUpdate={() => {}} // Read-only
            readOnly={true}
          />

          {/* Experience Section */}
          <LinkedInProfileExperience
            experiences={profile?.berufserfahrung || []}
            isEditing={false}
            onExperiencesUpdate={() => {}} // Read-only
          />

          {/* Education Section */}
          <LinkedInProfileEducation
            education={profile?.schulbildung || []}
            isEditing={false}
            onEducationUpdate={() => {}} // Read-only
          />

          {/* Activity Section */}
          <LinkedInProfileActivity 
            profile={displayProfile}
          />
        </main>

        {/* Right Sidebar */}
        <aside className="lg:col-span-4">
          <div className="lg:sticky lg:top-24 space-y-4 md:space-y-6">
            <LinkedInProfileSidebar
              profile={displayProfile}
              isEditing={false}
              onProfileUpdate={() => {}} // Read-only
              readOnly={true}
            />
            
            {/* Kontaktdaten Box */}
            <Card className="p-4">
              <h3 className="font-semibold mb-3">Kontaktdaten</h3>
              <div className="space-y-2">
                <KeyValueRow
                  label="E-Mail"
                  value={
                    displayEmail ? (
                      <a href={`mailto:${displayEmail}`} className="underline">{displayEmail}</a>
                    ) : (
                      <span className="text-muted-foreground">{isUnlocked ? 'Keine Angabe' : 'Verdeckt'}</span>
                    )
                  }
                />
                <KeyValueRow
                  label="Telefon"
                  value={
                    displayPhone ? (
                      <a href={`tel:${displayPhone}`} className="underline">{displayPhone}</a>
                    ) : (
                      <span className="text-muted-foreground">{isUnlocked ? 'Keine Angabe' : 'Verdeckt'}</span>
                    )
                  }
                />
                <KeyValueRow
                  label="Adresse"
                  value={
                    displayAddress ? (
                      displayAddress
                    ) : (
                      <span className="text-muted-foreground">{isUnlocked ? 'Keine Angabe' : 'Verdeckt'}</span>
                    )
                  }
                />
              </div>
              {!isUnlocked && (
                <p className="mt-3 text-xs text-muted-foreground">
                  Profil freischalten, um vollständige Kontaktdaten zu sehen.
                </p>
              )}
            </Card>

            {/* Contact Action Card for Unlocked Profiles */}
            {isUnlocked && (profile.email || profile.telefon) && (
              <Card className="p-4">
                <h3 className="font-semibold mb-3">Kontakt aufnehmen</h3>
                <div className="space-y-2">
                  {profile.email && (
                    <Button 
                      variant="outline" 
                      className="w-full"
                      onClick={() => window.location.href = `mailto:${profile.email}`}
                    >
                      E-Mail senden
                    </Button>
                  )}
                  {profile.telefon && (
                    <Button 
                      variant="outline" 
                      className="w-full"
                      onClick={() => window.location.href = `tel:${profile.telefon}`}
                    >
                      Anrufen
                    </Button>
                  )}
                </div>
              </Card>
            )}
          </div>
        </aside>
      </div>
    </div>
  );
};

export default CompanyProfileView;