import { useState, useEffect, useRef } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { useCompany } from "@/hooks/useCompany";
import { useNavigate } from "react-router-dom";
import { useToast } from "@/hooks/use-toast";
import { uploadFile } from "@/lib/supabase-storage";
import { 
  Building2, 
  Globe, 
  MapPin, 
  Calendar, 
  Users, 
  Eye,
  Camera,
  Save
} from "lucide-react";

interface CompanyProfile {
  name: string;
  description: string;
  industry: string;
  founded_year: number | null;
  main_location: string;
  additional_locations: string[];
  website_url: string;
  logo_url: string;
  header_image: string;
  size_range: string;
  mission_statement: string;
  employee_count: number | null;
}

export default function CompanyProfile() {
  const { company, updateCompany, loading } = useCompany();
  const navigate = useNavigate();
const [editing, setEditing] = useState(false);
const [profileData, setProfileData] = useState<CompanyProfile>({
  name: "",
  description: "",
  industry: "",
  founded_year: null,
  main_location: "",
  additional_locations: [],
  website_url: "",
  logo_url: "",
  header_image: "",
  size_range: "",
  mission_statement: "",
  employee_count: null,
});
const [showPreview, setShowPreview] = useState(false);
const [saving, setSaving] = useState(false);
const { toast } = useToast();

  useEffect(() => {
    if (company) {
      setProfileData({
        name: company.name || "",
        description: company.description || "",
        industry: company.industry || "",
        founded_year: company.founded_year ?? null,
        main_location: company.main_location || "",
        additional_locations: company.additional_locations || [],
        website_url: company.website_url || "",
        logo_url: company.logo_url || "",
        header_image: company.header_image || "",
        size_range: company.size_range || "",
        mission_statement: company.mission_statement || "",
        employee_count: company.employee_count ?? null,
      });
    }
  }, [company]);

  const handleSave = async () => {
    setSaving(true);
    try {
      const result = await updateCompany(profileData);
      if (result?.success) {
        toast({ title: "Profil erfolgreich aktualisiert" });
        setEditing(false);
      } else {
        throw new Error(result?.error || "Unbekannter Fehler");
      }
    } catch (error: any) {
      toast({ 
        title: "Fehler beim Speichern", 
        description: error.message,
        variant: "destructive" 
      });
    } finally {
      setSaving(false);
    }
  };

  const updateField = (field: keyof CompanyProfile, value: any) => {
    setProfileData(prev => ({ ...prev, [field]: value }));
  };

  // Image upload refs and handlers
  const logoInputRef = useRef<HTMLInputElement>(null);
  const headerInputRef = useRef<HTMLInputElement>(null);

  const onHeaderBtnClick = () => headerInputRef.current?.click();
  const onLogoBtnClick = () => logoInputRef.current?.click();

  const handleHeaderChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !company?.id) return;
    try {
      setSaving(true);
      const { url } = await uploadFile(file, 'company-media', `companies/${company.id}/cover`);
      await updateCompany({ header_image: url });
      setProfileData(prev => ({ ...prev, header_image: url }));
      toast({ title: 'Cover aktualisiert' });
    } catch (err: any) {
      toast({ title: 'Upload fehlgeschlagen', description: err.message, variant: 'destructive' });
    } finally {
      setSaving(false);
      e.target.value = '';
    }
  };

  const handleLogoChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !company?.id) return;
    try {
      setSaving(true);
      const { url } = await uploadFile(file, 'company-media', `companies/${company.id}/logo`);
      await updateCompany({ logo_url: url });
      setProfileData(prev => ({ ...prev, logo_url: url }));
      toast({ title: 'Logo aktualisiert' });
    } catch (err: any) {
      toast({ title: 'Upload fehlgeschlagen', description: err.message, variant: 'destructive' });
    } finally {
      setSaving(false);
      e.target.value = '';
    }
  };
  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-96">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (!company) {
    return (
      <div className="text-center py-12">
        <Building2 className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
        <h2 className="text-xl font-semibold mb-2">Kein Unternehmen gefunden</h2>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background overflow-x-hidden pt-safe pb-24 space-y-6">
      {/* Header */}
      <div className="sticky top-0 z-30 bg-background/80 supports-[backdrop-filter]:bg-background/60 backdrop-blur border-b py-3 px-1 flex items-center justify-between">
        <h1 className="text-2xl md:text-3xl font-bold truncate">Unternehmensprofil</h1>
        <div className="flex space-x-2 items-center">
          <Button variant="outline" className="min-h-[44px]" onClick={() => setShowPreview(true)}>
            <Eye className="h-4 w-4 mr-2" />
            Vorschau als Bewerber
          </Button>
          {editing ? (
            <div className="hidden md:flex space-x-2">
              <Button variant="outline" onClick={() => setEditing(false)} className="min-h-[44px]">
                Abbrechen
              </Button>
              <Button onClick={handleSave} disabled={saving} className="min-h-[44px]">
                <Save className="h-4 w-4 mr-2" />
                {saving ? "Speichern..." : "Speichern"}
              </Button>
            </div>
          ) : (
            <Button onClick={() => setEditing(true)} className="min-h-[44px]">
              Profil bearbeiten
            </Button>
          )}
        </div>
      </div>

      <Tabs defaultValue="about" className="space-y-6">
        <TabsList>
          <TabsTrigger value="about">Über uns</TabsTrigger>
          <TabsTrigger value="posts">Beiträge</TabsTrigger>
          <TabsTrigger value="team">Team</TabsTrigger>
        </TabsList>

        <TabsContent value="about" className="space-y-6">
          {/* Header Image & Logo */}
          <Card>
            <CardContent className="p-0">
              <div className="relative h-40 sm:h-56 md:h-64 bg-gradient-to-r from-accent/20 to-primary/20 rounded-t-lg">
                {profileData.header_image && (
                  <img 
                    src={profileData.header_image} 
                    alt={`${profileData.name} Header`} 
                    className="w-full h-full object-cover rounded-t-lg"
                  />
                )}
                {/* subtle bottom gradient for readability */}
                <div className="pointer-events-none absolute inset-x-0 bottom-0 h-16 bg-gradient-to-t from-background/60 to-transparent rounded-b-lg" />
                {editing && (
                  <Button 
                    size="sm" 
                    variant="secondary" 
                    className="absolute top-4 right-4"
                    onClick={onHeaderBtnClick}
                  >
                    <Camera className="h-4 w-4 mr-2" />
                    Header ändern
                  </Button>
                )}
              </div>

              <input type="file" accept="image/*" ref={headerInputRef} className="hidden" onChange={handleHeaderChange} />
              <input type="file" accept="image/*" ref={logoInputRef} className="hidden" onChange={handleLogoChange} />
              
              <div className="p-6 mt-2 sm:mt-3">
                <div className="flex items-start space-x-4">
                  <div className="relative">
                    <Avatar className="h-20 w-20 sm:h-24 sm:w-24 ring-2 ring-background shadow-md">
                      <AvatarImage src={profileData.logo_url} alt={profileData.name} />
                      <AvatarFallback className="text-2xl">
                        {profileData.name.charAt(0)}
                      </AvatarFallback>
                    </Avatar>
                    {editing && (
                      <Button 
                        size="sm" 
                        variant="secondary" 
                        className="absolute -bottom-2 -right-2 h-8 w-8 p-0"
                        onClick={onLogoBtnClick}
                      >
                        <Camera className="h-4 w-4" />
                      </Button>
                    )}
                  </div>
                  
                  <div className="flex-1">
                    <h2 className="text-2xl font-bold mb-2">{profileData.name}</h2>
                    
                    <div className="flex flex-wrap gap-2 mb-3">
                      <Badge variant="secondary">
                        <Building2 className="h-3 w-3 mr-1" />
                        {profileData.industry}
                      </Badge>
                      <Badge variant="secondary">
                        <Users className="h-3 w-3 mr-1" />
                        {profileData.size_range} Mitarbeiter
                      </Badge>
                      <Badge variant="secondary">
                        <MapPin className="h-3 w-3 mr-1" />
                        {profileData.main_location}
                      </Badge>
                      {profileData.founded_year && (
                        <Badge variant="secondary">
                          <Calendar className="h-3 w-3 mr-1" />
                          Gegründet {profileData.founded_year}
                        </Badge>
                      )}
                    </div>

                    {profileData.website_url && (
                      <a 
                        href={profileData.website_url} 
                        target="_blank" 
                        rel="noopener noreferrer"
                        className="flex items-center text-accent hover:underline"
                      >
                        <Globe className="h-4 w-4 mr-1" />
                        Website besuchen
                      </a>
                    )}
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Company Information */}
          <Card>
            <CardHeader>
              <CardTitle>Unternehmensinformationen</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="description">Beschreibung</Label>
                {editing ? (
                  <Textarea
                    id="description"
                    value={profileData.description}
                    onChange={(e) => updateField('description', e.target.value)}
                    placeholder="Beschreiben Sie Ihr Unternehmen..."
                    rows={4}
                  />
                ) : (
                  <p className="text-muted-foreground">
                    {profileData.description || "Noch keine Beschreibung verfügbar."}
                  </p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="mission_statement">Mission</Label>
                {editing ? (
                  <Textarea
                    id="mission_statement"
                    value={profileData.mission_statement}
                    onChange={(e) => updateField('mission_statement', e.target.value)}
                    placeholder="Wofür steht Ihr Unternehmen?"
                    rows={3}
                  />
                ) : (
                  <p className="text-muted-foreground">
                    {profileData.mission_statement || "Noch keine Mission angegeben."}
                  </p>
                )}
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="industry">Branche</Label>
                  {editing ? (
                    <Input
                      id="industry"
                      value={profileData.industry}
                      onChange={(e) => updateField('industry', e.target.value)}
                      placeholder="z.B. IT, Handwerk"
                    />
                  ) : (
                    <p className="text-muted-foreground">{profileData.industry}</p>
                  )}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="founded_year">Gründungsjahr</Label>
                  {editing ? (
                    <Input
                      id="founded_year"
                      type="number"
                      value={profileData.founded_year || ""}
                      onChange={(e) => updateField('founded_year', e.target.value ? parseInt(e.target.value) : null)}
                      placeholder="z.B. 2010"
                    />
                  ) : (
                    <p className="text-muted-foreground">{profileData.founded_year || "Nicht angegeben"}</p>
                  )}
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="main_location">Hauptsitz</Label>
                  {editing ? (
                    <Input
                      id="main_location"
                      value={profileData.main_location}
                      onChange={(e) => updateField('main_location', e.target.value)}
                      placeholder="Stadt, Land"
                    />
                  ) : (
                    <p className="text-muted-foreground">{profileData.main_location}</p>
                  )}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="website_url">Website</Label>
                  {editing ? (
                    <Input
                      id="website_url"
                      value={profileData.website_url}
                      onChange={(e) => updateField('website_url', e.target.value)}
                      placeholder="https://www.ihr-unternehmen.de"
                    />
                  ) : (
                    <p className="text-muted-foreground">{profileData.website_url || "Nicht angegeben"}</p>
                  )}
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="employee_count">Mitarbeiterzahl</Label>
                {editing ? (
                  <Input
                    id="employee_count"
                    type="number"
                    min={0}
                    value={profileData.employee_count ?? ""}
                    onChange={(e) => updateField('employee_count', e.target.value === '' ? null : parseInt(e.target.value))}
                    placeholder="z.B. 42"
                  />
                ) : (
                  <p className="text-muted-foreground">{profileData.employee_count ?? "Nicht angegeben"}</p>
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="posts">
          <Card>
            <CardHeader>
              <CardTitle>Unternehmensbeiträge</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground text-center py-8">
                Noch keine Beiträge veröffentlicht.
              </p>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="team">
          <Card>
            <CardHeader>
              <CardTitle>Team-Mitglieder</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground text-center py-8">
                Team-Verwaltung wird bald verfügbar sein.
              </p>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      <Dialog open={showPreview} onOpenChange={setShowPreview}>
        <DialogContent className="max-w-4xl">
          <DialogHeader>
            <DialogTitle>Vorschau für Bewerber</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <section>
              <div className="w-full h-40 sm:h-56 md:h-64 rounded-lg overflow-hidden bg-muted">
                {profileData.header_image && (
                  <img src={profileData.header_image} alt={`${profileData.name} Titelbild`} className="w-full h-full object-cover" />
                )}
              </div>
            </section>
            <section className="-mt-10 sm:-mt-12">
              <div className="bg-card rounded-lg shadow p-4 sm:p-5 md:p-6 flex items-start gap-4">
                <div className="h-20 w-20 sm:h-24 sm:w-24 rounded-xl overflow-hidden border bg-muted flex-shrink-0">
                  {profileData.logo_url && <img src={profileData.logo_url} alt={`${profileData.name} Logo`} className="w-full h-full object-cover" />}
                </div>
                <div className="min-w-0 flex-1">
                  <h2 className="text-xl md:text-2xl font-bold truncate">{profileData.name}</h2>
                  <div className="text-sm text-muted-foreground mt-1 truncate">
                    {[profileData.industry, profileData.size_range, typeof profileData.employee_count === 'number' ? `${profileData.employee_count} Mitarbeitende` : null].filter(Boolean).join(' • ')}
                  </div>
                  <div className="text-sm text-muted-foreground mt-1 truncate">
                    {profileData.main_location && (
                      <span className="inline-flex items-center"><MapPin className="h-4 w-4 mr-1" />{profileData.main_location}</span>
                    )}
                  </div>
                </div>
              </div>
            </section>
            <section className="grid grid-cols-1 lg:grid-cols-[minmax(0,1fr)_320px] gap-4 md:gap-6 pt-2">
              <div className="space-y-4 md:space-y-6">
                <Card className="p-4 sm:p-5 md:p-6">
                  <h3 className="text-lg font-semibold">Über uns</h3>
                  <p className="mt-2 whitespace-pre-line text-sm leading-relaxed text-muted-foreground">
                    {profileData.description || 'Dieses Unternehmen hat noch keine Beschreibung hinzugefügt.'}
                  </p>
                </Card>
                {profileData.mission_statement && (
                  <Card className="p-4 sm:p-5 md:p-6">
                    <h3 className="text-lg font-semibold">Mission</h3>
                    <p className="mt-2 whitespace-pre-line text-sm leading-relaxed text-muted-foreground">
                      {profileData.mission_statement}
                    </p>
                  </Card>
                )}
              </div>
              <aside className="space-y-4 md:space-y-6">
                <Card className="p-4 sm:p-5 md:p-6">
                  <h3 className="text-lg font-semibold">Links</h3>
                  <div className="mt-2 flex flex-col gap-2 text-sm">
                    {profileData.website_url && (
                      <a href={profileData.website_url} target="_blank" rel="noreferrer" className="inline-flex items-center text-primary hover:underline">
                        <Globe className="h-4 w-4 mr-2" /> Webseite
                      </a>
                    )}
                  </div>
                </Card>
                <Card className="p-4 sm:p-5 md:p-6">
                  <h3 className="text-lg font-semibold">Standort</h3>
                  <div className="mt-2 text-sm text-muted-foreground">
                    {profileData.main_location || '—'}
                  </div>
                </Card>
              </aside>
            </section>
          </div>
        </DialogContent>
      </Dialog>

      {editing && (
        <div className="fixed inset-x-0 bottom-0 z-40 border-t bg-background/95 supports-[backdrop-filter]:bg-background/80 backdrop-blur px-4 py-3 pb-safe md:hidden">
          <div className="container mx-auto flex items-center justify-end gap-2">
            <Button variant="outline" onClick={() => setEditing(false)} className="min-h-[44px]">Abbrechen</Button>
            <Button onClick={handleSave} disabled={saving} className="min-h-[44px]">
              <Save className="h-4 w-4 mr-2" />
              {saving ? "Speichern..." : "Speichern"}
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}