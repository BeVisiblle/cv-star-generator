import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import { useDebounce } from '@/hooks/useDebounce';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Edit3, Check, Clock, X, Loader2, Mail, Phone, MapPin, Car } from 'lucide-react';
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
import { FeedCard, FeedPost } from '@/components/FeedCard';
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
      const { 
        error
      } = await supabase.from('profiles').update({
        vorname: profile.vorname,
        nachname: profile.nachname,
        telefon: profile.telefon,
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
  const mobilePosts: FeedPost[] = [
    {
      id: 'p1',
      author: { name: `${profile?.vorname || ''} ${profile?.nachname || ''}`.trim(), avatar_url: profile?.avatar_url || undefined, subtitle: profile?.ort || undefined },
      content: profile?.uebermich || null,
      image: profile?.cover_image_url || null,
      created_at: new Date().toISOString(),
      like_count: 0,
      comment_count: 0,
      repost_count: 0,
      liked_by_me: false,
    },
  ];
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

  return <div className={`px-3 sm:px-6 lg:px-8 py-3 md:py-6 min-h-screen bg-background max-w-full overflow-x-hidden ${isEditing ? 'pb-24' : 'pb-6'} pt-safe`}>{/* Prevent horizontal scroll and reserve for sticky footer */}
      {/* Mobile-optimized Profile Actions Header */}
      {/* Mobile layout matching dashboard cards */}
      <div className="md:hidden">
        <header className="sticky top-14 z-30 bg-background/90 supports-[backdrop-filter]:bg-background/70 backdrop-blur border-b">
          <div className="mx-auto max-w-[420px] px-3 h-12 flex items-center">
            <h1 className="text-base font-semibold truncate">{profile.vorname} {profile.nachname}</h1>
          </div>
        </header>
        <main className="mx-auto max-w-[420px] px-3 py-4 space-y-4">
          <Card className="p-4">
            <div className="flex items-center gap-3">
              <img src={profile?.avatar_url || '/placeholder.svg'} alt="Profilbild" className="h-12 w-12 rounded-full object-cover" />
              <div className="min-w-0">
                <div className="text-base font-semibold truncate">{profile.vorname} {profile.nachname}</div>
                <div className="text-xs text-muted-foreground truncate">{profile?.ort || ''}</div>
              </div>
              <Button variant="outline" size="sm" className="ml-auto">Connect</Button>
            </div>
          </Card>
          <Card className="p-4">
            <h2 className="text-sm font-semibold mb-1">About</h2>
            <p className="text-[15px] text-foreground/80 whitespace-pre-wrap">
              {profile?.uebermich || 'Noch keine Beschreibung vorhanden.'}
            </p>
          </Card>
          <section className="space-y-3">
            {mobilePosts.map((p) => (
              <FeedCard key={p.id} post={p} />
            ))}
          </section>
        </main>
      </div>

      <div className="hidden md:block sticky top-14 md:top-0 z-30 mb-4 md:mb-6 bg-background/80 supports-[backdrop-filter]:bg-background/60 backdrop-blur border-b">
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

      {/* Responsive layout: Mobile stacked with prioritized content, Desktop with sidebar */}
      <div className="mx-auto max-w-screen-2xl px-3 sm:px-6 lg:px-8 hidden md:flex flex-col lg:grid lg:grid-cols-12 gap-4 md:gap-6">
        {/* Main Content Area */}
        <main className="lg:col-span-8">
          <div className="w-full max-w-[560px] mx-auto px-4 md:max-w-none md:px-0 space-y-4 md:space-y-6">
            {/* Profile Header with Cover Photo - Always first */}
            <LinkedInProfileHeader profile={profile} isEditing={isEditing} onProfileUpdate={handleProfileUpdate} />
            {/* About Section - High priority on mobile */}
            <LinkedInProfileMain profile={profile} isEditing={isEditing} onProfileUpdate={handleProfileUpdate} />

            {/* Activity Section (moved above Experience) */}
            <LinkedInProfileActivity profile={profile} />

            {/* Experience Section */}
            <LinkedInProfileExperience experiences={profile?.berufserfahrung || []} isEditing={isEditing} onExperiencesUpdate={handleExperiencesUpdate} />

            {/* Education Section */}
            <LinkedInProfileEducation education={profile?.schulbildung || []} isEditing={isEditing} onEducationUpdate={handleEducationUpdate} />

            {/* Small tiles under Education: Contact & Profile Highlights */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <Card className="p-4">
                <h4 className="text-sm font-semibold mb-2">Kontaktdaten</h4>
                {isEditing ? (
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div className="space-y-1">
                      <Label htmlFor="email">E-Mail</Label>
                      <Input id="email" type="email" value={profile.email || ''} disabled readOnly />
                    </div>
                    <div className="space-y-1">
                      <Label htmlFor="telefon">Telefon</Label>
                      <Input id="telefon" value={profile.telefon || ''} onChange={(e) => setProfile((p: any) => ({...p, telefon: e.target.value}))} onBlur={(e) => handleProfileUpdateImmediate({ telefon: e.target.value })} />
                    </div>
                    <div className="space-y-1">
                      <Label htmlFor="strasse">Straße</Label>
                      <Input id="strasse" value={profile.strasse || ''} onChange={(e) => setProfile((p: any) => ({...p, strasse: e.target.value}))} onBlur={(e) => handleProfileUpdateImmediate({ strasse: e.target.value })} />
                    </div>
                    <div className="space-y-1">
                      <Label htmlFor="hausnummer">Hausnummer</Label>
                      <Input id="hausnummer" value={profile.hausnummer || ''} onChange={(e) => setProfile((p: any) => ({...p, hausnummer: e.target.value}))} onBlur={(e) => handleProfileUpdateImmediate({ hausnummer: e.target.value })} />
                    </div>
                    <div className="space-y-1">
                      <Label htmlFor="plz">PLZ</Label>
                      <Input id="plz" value={profile.plz || ''} onChange={(e) => setProfile((p: any) => ({...p, plz: e.target.value}))} onBlur={(e) => handleProfileUpdateImmediate({ plz: e.target.value })} />
                    </div>
                    <div className="space-y-1">
                      <Label htmlFor="ort">Ort</Label>
                      <Input id="ort" value={profile.ort || ''} onChange={(e) => setProfile((p: any) => ({...p, ort: e.target.value}))} onBlur={(e) => handleProfileUpdateImmediate({ ort: e.target.value })} />
                    </div>

                    {/* Führerschein unten bei Kontaktdaten */}
                    <div className="col-span-1 sm:col-span-2 border-t pt-3 mt-1">
                      <h5 className="text-sm font-semibold mb-2 flex items-center gap-2"><Car className="h-4 w-4" /> Führerschein</h5>
                      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                        <div className="space-y-1">
                          <Label>Vorhanden</Label>
                          <div className="flex items-center gap-3">
                            <Switch
                              checked={!!profile?.has_drivers_license}
                              onCheckedChange={(val) => {
                                const v = !!val;
                                setProfile((p: any) => ({ ...p, has_drivers_license: v, driver_license_class: v ? (p.driver_license_class || null) : null }));
                                handleProfileUpdateImmediate({ has_drivers_license: v, driver_license_class: v ? (profile?.driver_license_class || null) : null });
                              }}
                            />
                            <span className="text-sm text-muted-foreground">{profile?.has_drivers_license ? 'Ja' : 'Nein'}</span>
                          </div>
                        </div>
                        <div className="space-y-1 sm:col-span-2">
                          <Label>Klasse</Label>
                          <Select
                            value={profile?.driver_license_class || ''}
                            onValueChange={(val) => {
                              setProfile((p: any) => ({ ...p, driver_license_class: val, has_drivers_license: true }));
                              handleProfileUpdateImmediate({ has_drivers_license: true, driver_license_class: val });
                            }}
                            disabled={!profile?.has_drivers_license}
                          >
                            <SelectTrigger className="w-full">
                              <SelectValue placeholder="Klasse wählen" />
                            </SelectTrigger>
                            <SelectContent className="z-50 bg-background">
                              {['AM','A1','A2','A','B','BE','C','CE','D','DE','T','L'].map((k) => (
                                <SelectItem key={k} value={k}>{k}</SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        </div>
                      </div>
                    </div>
                  </div>
                ) : (
                  <div className="space-y-1 text-sm text-muted-foreground">
                    {profile?.email && (
                      <div className="flex items-center gap-2"><Mail className="h-4 w-4" /> <span>{profile.email}</span></div>
                    )}
                    {profile?.telefon && (
                      <div className="flex items-center gap-2"><Phone className="h-4 w-4" /> <span>{profile.telefon}</span></div>
                    )}
                    {(profile?.ort || profile?.strasse) && (
                      <div className="flex items-center gap-2"><MapPin className="h-4 w-4" /> <span>{[profile?.strasse && `${profile.strasse} ${profile.hausnummer || ''}`.trim(), profile?.plz && profile?.ort && `${profile.plz} ${profile.ort}`].filter(Boolean).join(' • ') || profile?.ort}</span></div>
                    )}
                    {typeof profile?.has_drivers_license === 'boolean' && (
                      <div className="flex items-center gap-2"><Car className="h-4 w-4" /> <span>Führerschein: {profile.has_drivers_license ? (profile?.driver_license_class ? `Ja, Klasse ${profile.driver_license_class}` : 'Ja') : 'Nein'}</span></div>
                    )}
                  </div>
                )}
              </Card>
              <Card className="p-4">
                <h4 className="text-sm font-semibold mb-2">Profilaktivitäten</h4>
                <div className="space-y-1 text-sm text-muted-foreground">
                  <div>• Profil vollständig: {profile?.profile_complete ? 'Ja' : 'Nein'}</div>
                  <div>• Öffentlich sichtbar: {profile?.profile_published ? 'Ja' : 'Nein'}</div>
                  <div>• Erstellt am: {profile?.created_at ? new Date(profile.created_at).toLocaleDateString('de-DE') : '—'}</div>
                  <div>• Dokumente hochgeladen: {documentsCount > 0 ? 'Ja' : 'Nein'}</div>
                  <div>• Profilbesuche: {profileVisits}</div>
                </div>
              </Card>
            </div>
          </div>
        </main>

        {/* Right Sidebar - Desktop: sidebar, Mobile: after main content */}
        <aside className="lg:col-span-4">
          <div className="lg:sticky lg:top-24 space-y-4 md:space-y-6">
            <LinkedInProfileSidebar profile={profile} isEditing={isEditing} onProfileUpdate={handleProfileUpdate} showLanguagesAndSkills={false} showLicenseAndStats={false} />
            <RightRailAd variant="card" size="sm" />
            <SkillsLanguagesSidebar profile={profile} isEditing={isEditing} onProfileUpdate={handleProfileUpdate} />
            <InView rootMargin="300px" placeholder={<div className="h-32 rounded-md bg-muted/50 animate-pulse" />}> 
              <PeopleRecommendations limit={3} showMoreLink="/entdecken/azubis" showMore />
            </InView>
            <InView rootMargin="300px" placeholder={<div className="h-32 rounded-md bg-muted/50 animate-pulse" />}> 
              <CompanyRecommendations limit={3} showMoreLink="/entdecken/unternehmen" showMore />
            </InView>
            <RightRailAd variant="banner" size="sm" />
          </div>
        </aside>
      </div>

      {/* Sticky bottom Save Bar (mobile) */}
      {isEditing && <div className="fixed inset-x-0 bottom-0 z-40 border-t bg-background/95 supports-[backdrop-filter]:bg-background/80 backdrop-blur px-3 py-2 pb-safe md:hidden">
          <div className="max-w-[560px] mx-auto px-4 flex items-center justify-end gap-2">
            <Button variant="outline" onClick={() => setIsEditing(false)} disabled={isSaving} size="sm" className="min-h-[38px] md:min-h-[44px]">
              Abbrechen
            </Button>
            <Button onClick={handleSave} disabled={isSaving} size="sm" className="min-h-[38px] md:min-h-[44px]">
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