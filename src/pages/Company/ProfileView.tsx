import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { ArrowLeft, Loader2 } from 'lucide-react';
import { toast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { LinkedInProfileHeader } from '@/components/linkedin/LinkedInProfileHeader';
import { LinkedInProfileMain } from '@/components/linkedin/LinkedInProfileMain';
import { LinkedInProfileSidebar } from '@/components/linkedin/LinkedInProfileSidebar';
import { LinkedInProfileExperience } from '@/components/linkedin/LinkedInProfileExperience';
import { LinkedInProfileEducation } from '@/components/linkedin/LinkedInProfileEducation';
import { LinkedInProfileActivity } from '@/components/linkedin/LinkedInProfileActivity';

const CompanyProfileView = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [profile, setProfile] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isUnlocked, setIsUnlocked] = useState(false);

  useEffect(() => {
    const fetchProfile = async () => {
      if (!id) return;

      try {
        setIsLoading(true);
        
        // Check if profile is unlocked (from tokens_used table)
        const { data: tokenUsage } = await supabase
          .from('tokens_used')
          .select('*')
          .eq('profile_id', id)
          .single();

        setIsUnlocked(!!tokenUsage);

        // Fetch profile data
        const { data: profileData, error } = await supabase
          .from('profiles')
          .select('*')
          .eq('id', id)
          .single();

        if (error) {
          console.error('Error fetching profile:', error);
          toast({
            title: "Fehler",
            description: "Profil konnte nicht geladen werden.",
            variant: "destructive"
          });
          navigate('/company/search');
          return;
        }

        setProfile(profileData);
      } catch (error) {
        console.error('Error:', error);
        toast({
          title: "Fehler",
          description: "Ein unerwarteter Fehler ist aufgetreten.",
          variant: "destructive"
        });
        navigate('/company/search');
      } finally {
        setIsLoading(false);
      }
    };

    fetchProfile();
  }, [id, navigate]);

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

  return (
    <div className="p-3 md:p-6 min-h-screen bg-background max-w-full overflow-x-hidden">
      {/* Breadcrumb Header */}
      <div className="mb-4 md:mb-6">
        <div className="flex items-center justify-between gap-3">
          <Button 
            variant="outline" 
            onClick={() => navigate('/company/search')}
            className="flex items-center gap-2"
          >
            <ArrowLeft className="h-4 w-4" />
            Zurück zur Suche
          </Button>
          
          {!isUnlocked && (
            <div className="bg-yellow-100 text-yellow-800 px-3 py-1 rounded-full text-sm">
              Limitierte Ansicht - Profil nicht freigeschaltet
            </div>
          )}
        </div>
        
        <div className="mt-4">
          <h1 className="text-xl md:text-2xl font-bold">
            {isUnlocked ? `${profile.vorname} ${profile.nachname}` : profile.vorname}
          </h1>
          <p className="text-muted-foreground text-xs md:text-sm">
            Profil-Details
          </p>
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