import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Edit3, Check, Clock, X, Loader2 } from 'lucide-react';
import { toast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { LinkedInProfileHeader } from '@/components/linkedin/LinkedInProfileHeader';
import { LinkedInProfileMain } from '@/components/linkedin/LinkedInProfileMain';
import { LinkedInProfileSidebar } from '@/components/linkedin/LinkedInProfileSidebar';
import { LinkedInProfileExperience } from '@/components/linkedin/LinkedInProfileExperience';
import { LinkedInProfileEducation } from '@/components/linkedin/LinkedInProfileEducation';
import { LinkedInProfileActivity } from '@/components/linkedin/LinkedInProfileActivity';

import { ProfilePreviewModal } from '@/components/ProfilePreviewModal';

const Profile = () => {
  const navigate = useNavigate();
  const { profile: authProfile, isLoading } = useAuth();
  const [isEditing, setIsEditing] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [showPreview, setShowPreview] = useState(false);
  const [profile, setProfile] = useState<any>(null);

  useEffect(() => {
    if (authProfile) {
      setProfile({ ...authProfile });
    }
  }, [authProfile]);

  const handleSave = async () => {
    if (!profile?.id) return;
    
    setIsSaving(true);
    try {
      const { error } = await supabase
        .from('profiles')
        .update({
          vorname: profile.vorname,
          nachname: profile.nachname,
          telefon: profile.telefon,
          email: profile.email,
          strasse: profile.strasse,
          hausnummer: profile.hausnummer,
          plz: profile.plz,
          ort: profile.ort,
          uebermich: profile.uebermich,
          kenntnisse: profile.kenntnisse,
          motivation: profile.motivation,
          faehigkeiten: profile.faehigkeiten,
          sprachen: profile.sprachen,
          berufserfahrung: profile.berufserfahrung,
          schulbildung: profile.schulbildung,
          updated_at: new Date().toISOString()
        })
        .eq('id', profile.id);

      if (error) throw error;

      toast({
        title: "Profil gespeichert",
        description: "Ihre Änderungen wurden erfolgreich gespeichert.",
      });
      setIsEditing(false);
    } catch (error) {
      console.error('Save error:', error);
      toast({
        title: "Fehler beim Speichern",
        description: "Ihre Änderungen konnten nicht gespeichert werden.",
        variant: "destructive"
      });
    } finally {
      setIsSaving(false);
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (!profile) {
    return (
      <div className="container mx-auto p-6">
        <Card className="p-6 text-center">
          <h1 className="text-2xl font-bold mb-4">Kein Profil gefunden</h1>
          <p className="text-muted-foreground mb-4">
            Sie haben noch kein Profil erstellt. Erstellen Sie zunächst einen CV.
          </p>
          <Button onClick={() => navigate('/cv-generator')}>
            CV erstellen
          </Button>
        </Card>
      </div>
    );
  }

  const handleProfileUpdate = async (updates: any) => {
    if (!profile?.id) return;
    
    setIsSaving(true);
    try {
      const { error } = await supabase
        .from('profiles')
        .update({
          ...updates,
          updated_at: new Date().toISOString()
        })
        .eq('id', profile.id);

      if (error) throw error;

      // Update local profile state
      setProfile(prev => ({ ...prev, ...updates }));

      toast({
        title: "Profil aktualisiert",
        description: "Ihre Änderungen wurden gespeichert."
      });
    } catch (error) {
      console.error('Update error:', error);
      toast({
        title: "Fehler beim Speichern",
        description: "Ihre Änderungen konnten nicht gespeichert werden.",
        variant: "destructive"
      });
    } finally {
      setIsSaving(false);
    }
  };

  const handleExperiencesUpdate = (experiences: any[]) => {
    handleProfileUpdate({ berufserfahrung: experiences });
  };

  const handleEducationUpdate = (education: any[]) => {
    handleProfileUpdate({ schulbildung: education });
  };

  return (
    <div className="p-6">
      {/* Profile Actions Header */}
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">
            {profile.vorname} {profile.nachname}
          </h1>
          <p className="text-muted-foreground text-sm">
            LinkedIn-Style Professional Profile
          </p>
        </div>
        
        <div className="flex gap-2">
          {!profile.profile_published && (
            <Button 
              variant="outline" 
              onClick={() => setShowPreview(true)}
              size="sm"
            >
              Vorschau
            </Button>
          )}
          
          {isEditing ? (
            <div className="flex gap-2">
              <Button 
                variant="outline" 
                onClick={() => setIsEditing(false)}
                disabled={isSaving}
                size="sm"
              >
                <X className="h-4 w-4 mr-2" />
                Abbrechen
              </Button>
              <Button onClick={handleSave} disabled={isSaving} size="sm">
                {isSaving ? (
                  <Clock className="h-4 w-4 mr-2 animate-spin" />
                ) : (
                  <Check className="h-4 w-4 mr-2" />
                )}
                Speichern
              </Button>
            </div>
          ) : (
            <Button onClick={() => setIsEditing(true)} size="sm">
              <Edit3 className="h-4 w-4 mr-2" />
              Bearbeiten
            </Button>
          )}
        </div>
      </div>

      {/* Main Content */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Main Content Area */}
        <main className="lg:col-span-8 space-y-6">
          {/* Profile Header with Cover Photo */}
          <LinkedInProfileHeader
            profile={profile}
            isEditing={isEditing}
            onProfileUpdate={handleProfileUpdate}
          />

          {/* About Section */}
          <LinkedInProfileMain
            profile={profile}
            isEditing={isEditing}
            onProfileUpdate={handleProfileUpdate}
          />

          {/* Experience Section */}
          <LinkedInProfileExperience
            experiences={profile?.berufserfahrung || []}
            isEditing={isEditing}
            onExperiencesUpdate={handleExperiencesUpdate}
          />

          {/* Education Section */}
          <LinkedInProfileEducation
            education={profile?.schulbildung || []}
            isEditing={isEditing}
            onEducationUpdate={handleEducationUpdate}
          />

          {/* Activity Section */}
          <LinkedInProfileActivity profile={profile} />
        </main>

        {/* Right Sidebar */}
        <aside className="lg:col-span-4">
          <div className="sticky top-24">
            <LinkedInProfileSidebar
              profile={profile}
              isEditing={isEditing}
              onProfileUpdate={handleProfileUpdate}
            />
          </div>
        </aside>
      </div>

      {/* Preview Modal */}
      {showPreview && (
        <ProfilePreviewModal
          isOpen={showPreview}
          profileData={profile}
          onPublish={async () => {
            await handleProfileUpdate({ profile_published: true });
            setShowPreview(false);
          }}
          onClose={() => setShowPreview(false)}
        />
      )}
    </div>
  );
};

export default Profile;