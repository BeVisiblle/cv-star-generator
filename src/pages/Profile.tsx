import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Separator } from '@/components/ui/separator';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ProfilePreviewModal } from '@/components/ProfilePreviewModal';
import { supabase } from '@/integrations/supabase/client';
import { 
  User, 
  Download, 
  Edit, 
  Eye, 
  Plus, 
  Save, 
  Building, 
  GraduationCap,
  MapPin,
  Phone,
  Mail,
  Globe,
  Loader2
} from 'lucide-react';
import { toast } from '@/hooks/use-toast';

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

  const getBrancheTitle = (branche?: string) => {
    const titles = {
      'handwerk': 'Handwerk',
      'it': 'IT & Technik', 
      'gesundheit': 'Gesundheit & Pflege',
      'buero': 'Büro & Verwaltung',
      'verkauf': 'Verkauf & Handel',
      'gastronomie': 'Gastronomie',
      'bau': 'Bau & Architektur'
    };
    return branche ? titles[branche as keyof typeof titles] || branche : '';
  };

  const getStatusTitle = (status?: string) => {
    const titles = {
      'schueler': 'Schüler',
      'azubi': 'Azubi',
      'ausgelernt': 'Geselle/Fachkraft'
    };
    return status ? titles[status as keyof typeof titles] || status : '';
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

  return (
    <div className="container mx-auto p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Mein Profil</h1>
          <p className="text-muted-foreground">
            Verwalten Sie Ihre Profil-Informationen und Sichtbarkeit
          </p>
        </div>
        
        <div className="flex gap-2">
          {!profile.profile_published && (
            <Button 
              variant="outline" 
              onClick={() => setShowPreview(true)}
            >
              <Eye className="h-4 w-4 mr-2" />
              Vorschau
            </Button>
          )}
          
          {isEditing ? (
            <div className="flex gap-2">
              <Button 
                variant="outline" 
                onClick={() => setIsEditing(false)}
                disabled={isSaving}
              >
                Abbrechen
              </Button>
              <Button onClick={handleSave} disabled={isSaving}>
                {isSaving ? (
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                ) : (
                  <Save className="h-4 w-4 mr-2" />
                )}
                {isSaving ? 'Speichern...' : 'Speichern'}
              </Button>
            </div>
          ) : (
            <Button onClick={() => setIsEditing(true)}>
              <Edit className="h-4 w-4 mr-2" />
              Bearbeiten
            </Button>
          )}
        </div>
      </div>

      <Tabs defaultValue="personal" className="space-y-6">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="personal">Persönlich</TabsTrigger>
          <TabsTrigger value="professional">Beruflich</TabsTrigger>
          <TabsTrigger value="skills">Kompetenzen</TabsTrigger>
          <TabsTrigger value="settings">Einstellungen</TabsTrigger>
        </TabsList>

        {/* Personal Info Tab */}
        <TabsContent value="personal" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <User className="h-5 w-5" />
                Persönliche Informationen
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Profile Header */}
              <div className="flex items-center gap-4">
                <Avatar className="w-16 h-16 border-2 border-background shadow-md">
                  <AvatarImage src={profile.avatar_url} alt="Profilbild" />
                  <AvatarFallback className="text-lg font-semibold bg-primary/10">
                    {profile.vorname?.[0]}{profile.nachname?.[0]}
                  </AvatarFallback>
                </Avatar>
                <div>
                  <h3 className="text-xl font-bold">
                    {profile.vorname} {profile.nachname}
                  </h3>
                  <p className="text-primary font-medium">
                    {getStatusTitle(profile.status)} • {getBrancheTitle(profile.branche)}
                  </p>
                  {profile.profile_published && (
                    <Badge variant="secondary" className="mt-1">
                      <Globe className="h-3 w-3 mr-1" />
                      Öffentlich sichtbar
                    </Badge>
                  )}
                </div>
              </div>

              <Separator />

              {/* Contact Information */}
              <div className="grid md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="vorname">Vorname</Label>
                  <Input
                    id="vorname"
                    value={profile.vorname || ''}
                    onChange={(e) => setProfile({ ...profile, vorname: e.target.value })}
                    disabled={!isEditing}
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="nachname">Nachname</Label>
                  <Input
                    id="nachname"
                    value={profile.nachname || ''}
                    onChange={(e) => setProfile({ ...profile, nachname: e.target.value })}
                    disabled={!isEditing}
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="email">E-Mail</Label>
                  <div className="flex items-center gap-2">
                    <Mail className="h-4 w-4 text-muted-foreground" />
                    <Input
                      id="email"
                      type="email"
                      value={profile.email || ''}
                      onChange={(e) => setProfile({ ...profile, email: e.target.value })}
                      disabled={!isEditing}
                    />
                  </div>
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="telefon">Telefon</Label>
                  <div className="flex items-center gap-2">
                    <Phone className="h-4 w-4 text-muted-foreground" />
                    <Input
                      id="telefon"
                      value={profile.telefon || ''}
                      onChange={(e) => setProfile({ ...profile, telefon: e.target.value })}
                      disabled={!isEditing}
                    />
                  </div>
                </div>
              </div>

              {/* Address */}
              <div className="space-y-4">
                <h4 className="font-semibold flex items-center gap-2">
                  <MapPin className="h-4 w-4" />
                  Adresse
                </h4>
                <div className="grid md:grid-cols-3 gap-4">
                  <div className="space-y-2 md:col-span-2">
                    <Label htmlFor="strasse">Straße</Label>
                    <Input
                      id="strasse"
                      value={profile.strasse || ''}
                      onChange={(e) => setProfile({ ...profile, strasse: e.target.value })}
                      disabled={!isEditing}
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="hausnummer">Hausnummer</Label>
                    <Input
                      id="hausnummer"
                      value={profile.hausnummer || ''}
                      onChange={(e) => setProfile({ ...profile, hausnummer: e.target.value })}
                      disabled={!isEditing}
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="plz">PLZ</Label>
                    <Input
                      id="plz"
                      value={profile.plz || ''}
                      onChange={(e) => setProfile({ ...profile, plz: e.target.value })}
                      disabled={!isEditing}
                    />
                  </div>
                  
                  <div className="space-y-2 md:col-span-2">
                    <Label htmlFor="ort">Ort</Label>
                    <Input
                      id="ort"
                      value={profile.ort || ''}
                      onChange={(e) => setProfile({ ...profile, ort: e.target.value })}
                      disabled={!isEditing}
                    />
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Professional Tab */}
        <TabsContent value="professional" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Building className="h-5 w-5" />
                Berufliche Informationen
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* About Me */}
              <div className="space-y-2">
                <Label htmlFor="uebermich">Über mich</Label>
                <Textarea
                  id="uebermich"
                  value={profile.uebermich || ''}
                  onChange={(e) => setProfile({ ...profile, uebermich: e.target.value })}
                  disabled={!isEditing}
                  rows={4}
                  placeholder="Erzählen Sie etwas über sich und Ihre Erfahrungen..."
                />
              </div>

              {/* Experience & Education */}
              {profile.berufserfahrung && profile.berufserfahrung.length > 0 && (
                <div className="space-y-2">
                  <h4 className="font-semibold">Berufserfahrung</h4>
                  <div className="space-y-2">
                    {profile.berufserfahrung.map((exp: any, index: number) => (
                      <Card key={index} className="p-4">
                        <h5 className="font-medium">{exp.titel}</h5>
                        <p className="text-sm text-muted-foreground">
                          {exp.unternehmen} • {exp.zeitraum_von} - {exp.zeitraum_bis}
                        </p>
                        {exp.beschreibung && (
                          <p className="text-sm mt-2">{exp.beschreibung}</p>
                        )}
                      </Card>
                    ))}
                  </div>
                </div>
              )}

              {profile.schulbildung && profile.schulbildung.length > 0 && (
                <div className="space-y-2">
                  <h4 className="font-semibold flex items-center gap-2">
                    <GraduationCap className="h-4 w-4" />
                    Schulbildung
                  </h4>
                  <div className="space-y-2">
                    {profile.schulbildung.map((edu: any, index: number) => (
                      <Card key={index} className="p-4">
                        <h5 className="font-medium">{edu.schulform}</h5>
                        <p className="text-sm text-muted-foreground">
                          {edu.name} • {edu.zeitraum_von} - {edu.zeitraum_bis}
                        </p>
                        {edu.beschreibung && (
                          <p className="text-sm mt-2">{edu.beschreibung}</p>
                        )}
                      </Card>
                    ))}
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Skills Tab */}
        <TabsContent value="skills" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Kompetenzen & Fähigkeiten</CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Skills */}
              {profile.faehigkeiten && profile.faehigkeiten.length > 0 && (
                <div className="space-y-3">
                  <h4 className="font-semibold">Fähigkeiten</h4>
                  <div className="flex flex-wrap gap-2">
                    {profile.faehigkeiten.map((skill: string, index: number) => (
                      <Badge key={index} variant="secondary">
                        {skill}
                      </Badge>
                    ))}
                  </div>
                </div>
              )}

              {/* Languages */}
              {profile.sprachen && profile.sprachen.length > 0 && (
                <div className="space-y-3">
                  <h4 className="font-semibold">Sprachen</h4>
                  <div className="space-y-2">
                    {profile.sprachen.map((lang: any, index: number) => (
                      <div key={index} className="flex justify-between items-center">
                        <span>{lang.sprache}</span>
                        <Badge variant="outline">{lang.niveau}</Badge>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Knowledge & Motivation */}
              <div className="grid md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="kenntnisse">Kenntnisse</Label>
                  <Textarea
                    id="kenntnisse"
                    value={profile.kenntnisse || ''}
                    onChange={(e) => setProfile({ ...profile, kenntnisse: e.target.value })}
                    disabled={!isEditing}
                    rows={3}
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="motivation">Motivation</Label>
                  <Textarea
                    id="motivation"
                    value={profile.motivation || ''}
                    onChange={(e) => setProfile({ ...profile, motivation: e.target.value })}
                    disabled={!isEditing}
                    rows={3}
                  />
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Settings Tab */}
        <TabsContent value="settings" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Profil-Einstellungen</CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-4">
                <div className="flex items-center justify-between p-4 border rounded-lg">
                  <div>
                    <h4 className="font-medium">Profil veröffentlichen</h4>
                    <p className="text-sm text-muted-foreground">
                      Machen Sie Ihr Profil für Arbeitgeber sichtbar
                    </p>
                  </div>
                  {profile.profile_published ? (
                    <Badge variant="secondary">
                      <Globe className="h-3 w-3 mr-1" />
                      Veröffentlicht
                    </Badge>
                  ) : (
                    <Button 
                      variant="outline"
                      onClick={() => setShowPreview(true)}
                    >
                      <Eye className="h-4 w-4 mr-2" />
                      Vorschau & Veröffentlichen
                    </Button>
                  )}
                </div>

                <div className="flex items-center justify-between p-4 border rounded-lg">
                  <div>
                    <h4 className="font-medium">Neuen CV erstellen</h4>
                    <p className="text-sm text-muted-foreground">
                      Erstellen Sie einen neuen Lebenslauf
                    </p>
                  </div>
                  <Button 
                    variant="outline"
                    onClick={() => navigate('/cv-generator')}
                  >
                    <Plus className="h-4 w-4 mr-2" />
                    Neuer CV
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Profile Preview Modal */}
      <ProfilePreviewModal
        isOpen={showPreview}
        onClose={() => setShowPreview(false)}
        profileData={{
          vorname: profile.vorname,
          nachname: profile.nachname,
          status: profile.status,
          branche: profile.branche,
          ort: profile.ort,
          profilbild: profile.avatar_url,
          faehigkeiten: profile.faehigkeiten,
          ueber_mich: profile.uebermich
        }}
        onPublish={() => {
          // Refresh profile to get updated data
          window.location.reload();
        }}
      />
    </div>
  );
};

export default Profile;