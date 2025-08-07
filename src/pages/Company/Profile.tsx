import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useCompany } from "@/hooks/useCompany";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
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
}

export default function CompanyProfile() {
  const { company, updateCompany, loading } = useCompany();
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
  });
  const [saving, setSaving] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    if (company) {
      setProfileData({
        name: company.name || "",
        description: company.description || "",
        industry: company.industry || "",
        founded_year: company.founded_year,
        main_location: company.main_location || "",
        additional_locations: company.additional_locations || [],
        website_url: company.website_url || "",
        logo_url: company.logo_url || "",
        header_image: company.header_image || "",
        size_range: company.size_range || "",
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
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold">Unternehmensprofil</h1>
        <div className="flex space-x-2">
          <Button variant="outline">
            <Eye className="h-4 w-4 mr-2" />
            Vorschau als Bewerber
          </Button>
          {editing ? (
            <div className="flex space-x-2">
              <Button variant="outline" onClick={() => setEditing(false)}>
                Abbrechen
              </Button>
              <Button onClick={handleSave} disabled={saving}>
                <Save className="h-4 w-4 mr-2" />
                {saving ? "Speichern..." : "Speichern"}
              </Button>
            </div>
          ) : (
            <Button onClick={() => setEditing(true)}>
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
              <div className="relative h-48 bg-gradient-to-r from-accent/20 to-primary/20 rounded-t-lg">
                {profileData.header_image && (
                  <img 
                    src={profileData.header_image} 
                    alt="Header" 
                    className="w-full h-full object-cover rounded-t-lg"
                  />
                )}
                {editing && (
                  <Button 
                    size="sm" 
                    variant="secondary" 
                    className="absolute top-4 right-4"
                  >
                    <Camera className="h-4 w-4 mr-2" />
                    Header ändern
                  </Button>
                )}
              </div>
              
              <div className="p-6">
                <div className="flex items-start space-x-4">
                  <div className="relative">
                    <Avatar className="h-20 w-20">
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
                      >
                        <Camera className="h-4 w-4" />
                      </Button>
                    )}
                  </div>
                  
                  <div className="flex-1">
                    {editing ? (
                      <Input
                        value={profileData.name}
                        onChange={(e) => updateField('name', e.target.value)}
                        className="text-2xl font-bold mb-2"
                        placeholder="Unternehmensname"
                      />
                    ) : (
                      <h2 className="text-2xl font-bold mb-2">{profileData.name}</h2>
                    )}
                    
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
    </div>
  );
}