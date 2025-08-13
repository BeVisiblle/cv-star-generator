import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import { useDebounce } from '@/hooks/useDebounce';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Edit3, Check, Clock, X, Loader2, Mail, Phone, MapPin, Car, Eye, Download, Upload } from 'lucide-react';
import { toast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { LinkedInProfileHeader } from '@/components/linkedin/LinkedInProfileHeader';
import { LinkedInProfileMain } from '@/components/linkedin/LinkedInProfileMain';
import { LinkedInProfileSidebar } from '@/components/linkedin/LinkedInProfileSidebar';
import { LinkedInProfileExperience } from '@/components/linkedin/LinkedInProfileExperience';
import { LinkedInProfileEducation } from '@/components/linkedin/LinkedInProfileEducation';
import { LinkedInProfileActivity } from '@/components/linkedin/LinkedInProfileActivity';
import { RightRailAd } from '@/components/linkedin/right-rail/RightRailAd';
import { PeopleRecommendations } from '@/components/linkedin/right-rail/PeopleRecommendations';
import { CompanyRecommendations } from '@/components/linkedin/right-rail/CompanyRecommendations';
import { ProfilePreviewModal } from '@/components/ProfilePreviewModal';
import { SkillsLanguagesSidebar } from '@/components/linkedin/SkillsLanguagesSidebar';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { InView } from '@/components/util/InView';
import { openCvDownload, openCvEdit, openDocUpload } from '@/lib/event-bus';
const Profile = () => {
  const navigate = useNavigate();
  const {
    profile: authProfile,
    isLoading,
    refetchProfile
  } = useAuth();
  const [isEditing, setIsEditing] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [showPreview, setShowPreview] = useState(false);
  const [profile, setProfile] = useState<any>(null);
  const [documentsCount, setDocumentsCount] = useState<number>(0);
  const [profileVisits, setProfileVisits] = useState<number>(0);

  // All hooks must be called before any conditional returns
  const handleProfileUpdateImmediate = useCallback(async (updates: any) => {
    if (!profile?.id) return;
    setIsSaving(true);
    try {
      const { error } = await supabase
        .from('profiles')
        .update({
          ...updates,
          updated_at: new Date().toISOString(),
        })
        .eq('id', profile.id);
      if (error) throw error;

      // Update local profile state
      setProfile((prev) => ({
        ...prev,
        ...updates,
      }));

      // Ensure latest data is fetched from server
      refetchProfile?.();

      toast({
        title: "Profil aktualisiert",
        description: "Ihre Änderungen wurden gespeichert.",
      });
    } catch (error) {
      console.error('Update error:', error);
      toast({
        title: "Fehler beim Speichern",
        description: "Ihre Änderungen konnten nicht gespeichert werden.",
        variant: "destructive",
      });
    } finally {
      setIsSaving(false);
    }
  }, [profile?.id, refetchProfile]);

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
      // Resolve canonical location_id from PLZ + Ort
      let locationId: number | null = null;
      if (profile.plz && profile.ort) {
        const { data: locId, error: locErr } = await supabase.rpc('resolve_location_id', {
          p_postal_code: String(profile.plz),
          p_city: String(profile.ort),
          p_country_code: 'DE',
        });
        if (locErr) {
          console.warn('resolve_location_id error', locErr);
        } else if (typeof locId === 'number') {
          locationId = locId;
        }
      }

      const { error } = await supabase.from('profiles').update({
        vorname: profile.vorname,
        nachname: profile.nachname,
        telefon: profile.telefon,
        strasse: profile.strasse,
        hausnummer: profile.hausnummer,
        plz: profile.plz,
        ort: profile.ort,
        location_id: locationId,
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
      refetchProfile?.();
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

  useEffect(() => {
    const loadCounts = async () => {
      if (!profile?.id) return;
      try {
        const { count: docsCount, error: docsError } = await supabase
          .from('user_documents')
          .select('*', { count: 'exact', head: true })
          .eq('user_id', profile.id);
        if (!docsError) setDocumentsCount(docsCount ?? 0);
      } catch (e) {
        console.warn('Dokumente zählen fehlgeschlagen:', e);
      }
      try {
        const { count: visitsCount, error: visitsError } = await supabase
          .from('tokens_used')
          .select('*', { count: 'exact', head: true })
          .eq('profile_id', profile.id);
        if (!visitsError) setProfileVisits(visitsCount ?? 0);
      } catch (e) {
        console.warn('Profilbesuche zählen fehlgeschlagen:', e);
      }
    };
    loadCounts();
  }, [profile?.id]);
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

  return <div className={`min-h-screen w-full overflow-x-hidden bg-neutral-50 dark:bg-black ${isEditing ? 'pb-24' : 'pb-24 md:pb-6'} pt-safe`}>{/* Mobile-first design with neutral background */}
      {/* Mobile-optimized Profile Actions Header */}
      <div className="hidden md:block sticky top-0 z-30 mb-4 md:mb-6 bg-background/80 supports-[backdrop-filter]:bg-background/60 backdrop-blur border-b">
        <div className="px-3 sm:px-0 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 sm:gap-0">
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

      {/* Mobile-first main wrapper with exact 10px margins */}
      <main className="mx-auto w-full px-[10px] py-3">
        {/* Top profile section */}
        <section className="w-full rounded-xl shadow-md bg-white dark:bg-neutral-900 p-4 mb-3">
          <LinkedInProfileHeader profile={profile} isEditing={isEditing} onProfileUpdate={handleProfileUpdate} />
        </section>

        {/* Content cards with proper spacing */}
        <div className="space-y-3">
          {/* About Section */}
          <section className="w-full rounded-xl shadow-md bg-white dark:bg-neutral-900 p-4">
            <LinkedInProfileMain profile={profile} isEditing={isEditing} onProfileUpdate={handleProfileUpdate} />
          </section>

          {/* Activity Section */}
          <section className="w-full rounded-xl shadow-md bg-white dark:bg-neutral-900 p-4">
            <LinkedInProfileActivity profile={profile} />
          </section>

          {/* Experience Section */}
          <section className="w-full rounded-xl shadow-md bg-white dark:bg-neutral-900 p-4">
            <LinkedInProfileExperience experiences={profile?.berufserfahrung || []} isEditing={isEditing} onExperiencesUpdate={handleExperiencesUpdate} />
          </section>

          {/* Education Section */}
          <section className="w-full rounded-xl shadow-md bg-white dark:bg-neutral-900 p-4">
            <LinkedInProfileEducation education={profile?.schulbildung || []} isEditing={isEditing} onEducationUpdate={handleEducationUpdate} />
          </section>

          {/* Skills & Languages */}
          <section className="w-full rounded-xl shadow-md bg-white dark:bg-neutral-900 p-4">
            <SkillsLanguagesSidebar profile={profile} isEditing={isEditing} onProfileUpdate={handleProfileUpdate} />
          </section>

          {/* Contact & Profile Stats - Grid on mobile */}
          <div className="grid grid-cols-2 gap-2">
            <div className="w-full rounded-xl shadow-md bg-white dark:bg-neutral-900 p-4">
              <h4 className="text-base font-semibold mb-2">Kontakt</h4>
              {isEditing ? (
                <div className="space-y-3">
                  <div className="space-y-1">
                    <Label htmlFor="email" className="text-sm">E-Mail</Label>
                    <Input id="email" type="email" value={profile.email || ''} disabled readOnly className="text-sm" />
                  </div>
                  <div className="space-y-1">
                    <Label htmlFor="telefon" className="text-sm">Telefon</Label>
                    <Input id="telefon" value={profile.telefon || ''} onChange={(e) => setProfile((p: any) => ({...p, telefon: e.target.value}))} onBlur={(e) => handleProfileUpdateImmediate({ telefon: e.target.value })} className="text-sm" />
                  </div>
                  <div className="space-y-1">
                    <Label htmlFor="ort" className="text-sm">Ort</Label>
                    <Input id="ort" value={profile.ort || ''} onChange={(e) => setProfile((p: any) => ({...p, ort: e.target.value}))} onBlur={(e) => handleProfileUpdateImmediate({ ort: e.target.value })} className="text-sm" />
                  </div>
                </div>
              ) : (
                <div className="space-y-1 text-sm text-neutral-600 dark:text-neutral-300">
                  {profile?.email && (
                    <div className="flex items-center gap-2"><Mail className="h-4 w-4" /> <span className="truncate">{profile.email}</span></div>
                  )}
                  {profile?.telefon && (
                    <div className="flex items-center gap-2"><Phone className="h-4 w-4" /> <span>{profile.telefon}</span></div>
                  )}
                  {profile?.ort && (
                    <div className="flex items-center gap-2"><MapPin className="h-4 w-4" /> <span>{profile.ort}</span></div>
                  )}
                </div>
              )}
            </div>
            <div className="w-full rounded-xl shadow-md bg-white dark:bg-neutral-900 p-4">
              <h4 className="text-base font-semibold mb-2">Status</h4>
              <div className="space-y-1 text-sm text-neutral-600 dark:text-neutral-300">
                <div>Vollständig: {profile?.profile_complete ? 'Ja' : 'Nein'}</div>
                <div>Öffentlich: {profile?.profile_published ? 'Ja' : 'Nein'}</div>
                <div>Besuche: {profileVisits}</div>
              </div>
            </div>
          </div>

          {/* Sidebar content for mobile */}
          <div className="md:hidden space-y-3">
            <LinkedInProfileSidebar profile={profile} isEditing={isEditing} onProfileUpdate={handleProfileUpdate} showLanguagesAndSkills={false} showLicenseAndStats={false} />
            <InView rootMargin="300px" placeholder={<div className="h-32 rounded-md bg-muted/50 animate-pulse" />}> 
              <PeopleRecommendations limit={3} showMoreLink="/entdecken/azubis" showMore />
            </InView>
            <InView rootMargin="300px" placeholder={<div className="h-32 rounded-md bg-muted/50 animate-pulse" />}> 
              <CompanyRecommendations limit={3} showMoreLink="/entdecken/unternehmen" showMore />
            </InView>
          </div>
        </div>
      </main>

      {/* Sticky bottom Save Bar (mobile) */}
      {isEditing && <div className="fixed inset-x-0 bottom-0 z-[61] border-t bg-background/95 supports-[backdrop-filter]:bg-background/80 backdrop-blur px-[10px] py-2 pb-safe md:hidden">
          <div className="flex items-center justify-end gap-2">
            <Button variant="outline" onClick={() => setIsEditing(false)} disabled={isSaving} size="sm" className="min-h-[38px] md:min-h-[44px]">
              Abbrechen
            </Button>
            <Button onClick={handleSave} disabled={isSaving} size="sm" className="min-h-[38px] md:min-h-[44px]">
              {isSaving ? <Clock className="h-4 w-4 mr-2 animate-spin" /> : <Check className="h-4 w-4 mr-2" />}
              Speichern
            </Button>
          </div>
        </div>}

      {/* Mobile Quick Actions Bar (visible when not editing) */}
      {!isEditing && (
        <div className="fixed inset-x-0 bottom-0 z-[61] border-t bg-background/95 supports-[backdrop-filter]:bg-background/80 backdrop-blur px-[10px] py-2 pb-safe md:hidden">
          <div className="grid grid-cols-5 gap-2">
            <Button size="sm" variant="outline" className="min-h-[44px]" onClick={() => setIsEditing(true)} aria-label="Profil bearbeiten">
              <Edit3 className="h-4 w-4" />
            </Button>
            <Button size="sm" variant="outline" className="min-h-[44px]" onClick={() => setShowPreview(true)} aria-label="Vorschau">
              <Eye className="h-4 w-4" />
            </Button>
            <Button size="sm" className="min-h-[44px]" onClick={() => openCvDownload()} aria-label="CV herunterladen">
              <Download className="h-4 w-4" />
            </Button>
            <Button size="sm" variant="secondary" className="min-h-[44px]" onClick={() => openCvEdit()} aria-label="CV bearbeiten">
              <Edit3 className="h-4 w-4" />
            </Button>
            <Button size="sm" variant="outline" className="min-h-[44px]" onClick={() => openDocUpload()} aria-label="Dokumente hochladen">
              <Upload className="h-4 w-4" />
            </Button>
          </div>
        </div>
      )}

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