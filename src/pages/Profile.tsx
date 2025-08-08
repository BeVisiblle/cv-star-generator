import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import { useDebounce } from '@/hooks/useDebounce';
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
  const {
    profile: authProfile,
    isLoading
  } = useAuth();
  const [isEditing, setIsEditing] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [showPreview, setShowPreview] = useState(false);
  const [profile, setProfile] = useState<any>(null);

  // All hooks must be called before any conditional returns
  const handleProfileUpdateImmediate = useCallback(async (updates: any) => {
    if (!profile?.id) return;
    setIsSaving(true);
    try {
      const {
        error
      } = await supabase.from('profiles').update({
        ...updates,
        updated_at: new Date().toISOString()
      }).eq('id', profile.id);
      if (error) throw error;

      // Update local profile state
      setProfile(prev => ({
        ...prev,
        ...updates
      }));
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
  }, [profile?.id]);

  // Simple profile update without debouncing for form submissions
  const handleProfileUpdate = handleProfileUpdateImmediate;
  const handleExperiencesUpdate = useCallback((experiences: any[]) => {
    handleProfileUpdateImmediate({
      berufserfahrung: experiences
    });
  }, [handleProfileUpdateImmediate]);
  const handleEducationUpdate = useCallback((education: any[]) => {
    handleProfileUpdateImmediate({
      schulbildung: education
    });
  }, [handleProfileUpdateImmediate]);
  const handleSave = async () => {
    if (!profile?.id) return;
    setIsSaving(true);
    try {
      const {
        error
      } = await supabase.from('profiles').update({
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
        avatar_url: profile.avatar_url,
        cover_image_url: profile.cover_image_url,
        updated_at: new Date().toISOString()
      }).eq('id', profile.id);
      if (error) throw error;
      toast({
        title: "Profil gespeichert",
        description: "Ihre Änderungen wurden erfolgreich gespeichert."
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
  useEffect(() => {
    if (authProfile) {
      setProfile({
        ...authProfile
      });
    }
  }, [authProfile]);
  if (isLoading) {
    return <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-primary"></div>
      </div>;
  }
  if (!profile) {
    return <div className="container mx-auto p-6">
        <Card className="p-6 text-center">
          <h1 className="text-2xl font-bold mb-4">Willkommen!</h1>
          <p className="text-muted-foreground mb-4">
            Erstellen Sie jetzt Ihren ersten Lebenslauf, um von Unternehmen gefunden zu werden.
          </p>
          <Button onClick={() => navigate('/cv-generator')}>
            Jetzt Lebenslauf erstellen
          </Button>
        </Card>
      </div>;
  }

  // Early returns after all hooks are declared

  return <div className="p-3 md:p-6 min-h-screen bg-background max-w-full overflow-x-hidden pb-24 pt-safe">{/* Prevent horizontal scroll and reserve for sticky footer */}
      {/* Mobile-optimized Profile Actions Header */}
      <div className="sticky top-0 z-30 mb-4 md:mb-6 bg-background/80 supports-[backdrop-filter]:bg-background/60 backdrop-blur border-b">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 sm:gap-0">
          <div className="min-w-0 flex-1">
            <h1 className="text-xl md:text-2xl font-bold truncate">
              {profile.vorname} {profile.nachname}
            </h1>
            
          </div>
          
          <div className="flex flex-wrap gap-2 w-full sm:w-auto">
            {!profile.profile_published && <Button variant="outline" onClick={() => setShowPreview(true)} size="sm" className="flex-1 sm:flex-none min-h-[44px]">
                Vorschau
              </Button>}
            
            {isEditing ? <div className="hidden md:flex gap-2 flex-1 sm:flex-none">
                <Button variant="outline" onClick={() => setIsEditing(false)} disabled={isSaving} size="sm" className="flex-1 sm:flex-none min-h-[44px]">
                  <X className="h-4 w-4 mr-1 sm:mr-2" />
                  <span className="hidden sm:inline">Abbrechen</span>
                  <span className="sm:hidden">Abbr.</span>
                </Button>
                <Button onClick={handleSave} disabled={isSaving} size="sm" className="flex-1 sm:flex-none min-h-[44px]">
                  {isSaving ? <Clock className="h-4 w-4 mr-1 sm:mr-2 animate-spin" /> : <Check className="h-4 w-4 mr-1 sm:mr-2" />}
                  <span className="hidden sm:inline">Speichern</span>
                  <span className="sm:hidden">Save</span>
                </Button>
              </div> : <Button onClick={() => setIsEditing(true)} size="sm" className="flex-1 sm:flex-none min-h-[44px]">
                <Edit3 className="h-4 w-4 mr-1 sm:mr-2" />
                <span className="hidden sm:inline">Bearbeiten</span>
                <span className="sm:hidden">Edit</span>
              </Button>}
          </div>
        </div>
      </div>

      {/* Responsive layout: Mobile stacked with prioritized content, Desktop with sidebar */}
      <div className="flex flex-col lg:grid lg:grid-cols-12 gap-4 md:gap-6">
        {/* Main Content Area */}
        <main className="lg:col-span-8 space-y-4 md:space-y-6">
          {/* Profile Header with Cover Photo - Always first */}
          <LinkedInProfileHeader profile={profile} isEditing={isEditing} onProfileUpdate={handleProfileUpdate} />

          {/* About Section - High priority on mobile */}
          <LinkedInProfileMain profile={profile} isEditing={isEditing} onProfileUpdate={handleProfileUpdate} />

          {/* Experience Section */}
          <LinkedInProfileExperience experiences={profile?.berufserfahrung || []} isEditing={isEditing} onExperiencesUpdate={handleExperiencesUpdate} />

          {/* Education Section */}
          <LinkedInProfileEducation education={profile?.schulbildung || []} isEditing={isEditing} onEducationUpdate={handleEducationUpdate} />

          {/* Activity Section */}
          <LinkedInProfileActivity profile={profile} />
        </main>

        {/* Right Sidebar - Desktop: sidebar, Mobile: after main content */}
        <aside className="lg:col-span-4">
          <div className="lg:sticky lg:top-24 space-y-4 md:space-y-6">
            <LinkedInProfileSidebar profile={profile} isEditing={isEditing} onProfileUpdate={handleProfileUpdate} />
          </div>
        </aside>
      </div>

      {/* Sticky bottom Save Bar (mobile) */}
      {isEditing && <div className="fixed inset-x-0 bottom-0 z-40 border-t bg-background/95 supports-[backdrop-filter]:bg-background/80 backdrop-blur px-4 py-3 pb-safe md:hidden">
          <div className="container mx-auto flex items-center justify-end gap-2">
            <Button variant="outline" onClick={() => setIsEditing(false)} disabled={isSaving} size="sm" className="min-h-[44px]">
              Abbrechen
            </Button>
            <Button onClick={handleSave} disabled={isSaving} size="sm" className="min-h-[44px]">
              {isSaving ? <Clock className="h-4 w-4 mr-2 animate-spin" /> : <Check className="h-4 w-4 mr-2" />}
              Speichern
            </Button>
          </div>
        </div>}

      {/* Preview Modal */}
      {showPreview && <ProfilePreviewModal isOpen={showPreview} profileData={profile} onPublish={async () => {
      await handleProfileUpdate({
        profile_published: true
      });
      setShowPreview(false);
    }} onClose={() => setShowPreview(false)} />}
    </div>;
};
export default Profile;