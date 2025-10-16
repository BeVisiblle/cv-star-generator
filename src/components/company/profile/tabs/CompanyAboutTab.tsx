import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Globe, Users, MapPin, Edit2 } from "lucide-react";
import { Link } from "react-router-dom";
import { useState } from "react";

interface CompanyAboutTabProps {
  company: {
    id: string;
    name: string;
    description?: string | null;
    website_url?: string | null;
    employee_count?: number | null;
    size_range?: string | null;
    main_location?: string | null;
  };
  isOwner?: boolean;
  onSave?: (data: { description?: string; website_url?: string }) => void;
}

export function CompanyAboutTab({ company, isOwner, onSave }: CompanyAboutTabProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [description, setDescription] = useState(company.description || '');
  const [website, setWebsite] = useState(company.website_url || '');

  const handleSave = () => {
    onSave?.({ description, website_url: website });
    setIsEditing(false);
  };

  return (
    <div className="max-w-4xl mx-auto px-6 py-8 space-y-6">
      {/* Full Description */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle>Über uns</CardTitle>
            {isOwner && (
              <Button 
                size="sm" 
                variant={isEditing ? "default" : "outline"}
                onClick={() => isEditing ? handleSave() : setIsEditing(true)}
              >
                {isEditing ? (
                  'Speichern'
                ) : (
                  <>
                    <Edit2 className="h-4 w-4 mr-2" />
                    Bearbeiten
                  </>
                )}
              </Button>
            )}
          </div>
        </CardHeader>
        <CardContent>
          {isEditing ? (
            <Textarea 
              value={description}
              onChange={e => setDescription(e.target.value)}
              rows={10}
              placeholder="Erzählen Sie mehr über Ihr Unternehmen..."
              className="resize-none"
            />
          ) : (
            <p className="whitespace-pre-line text-muted-foreground">
              {company.description || 'Dieses Unternehmen hat noch keine Beschreibung hinzugefügt.'}
            </p>
          )}
        </CardContent>
      </Card>
      
      {/* Info Grid */}
      <div className="grid md:grid-cols-2 gap-6">
        {/* Webseite */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Webseite</CardTitle>
          </CardHeader>
          <CardContent>
            {isEditing ? (
              <Input 
                value={website} 
                onChange={e => setWebsite(e.target.value)}
                placeholder="https://beispiel.de"
              />
            ) : company.website_url ? (
              <a 
                href={company.website_url} 
                target="_blank" 
                rel="noopener noreferrer"
                className="text-primary hover:underline flex items-center gap-2"
              >
                <Globe className="h-4 w-4" />
                {company.website_url}
              </a>
            ) : (
              <p className="text-sm text-muted-foreground">Keine Webseite angegeben</p>
            )}
          </CardContent>
        </Card>
        
        {/* Inhaber / Geschäftsführer */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Inhaber</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground">Informationen folgen</p>
          </CardContent>
        </Card>
      </div>
      
      {/* Locations & Employees Grid */}
      <div className="grid md:grid-cols-2 gap-6">
        {/* Mitarbeiteranzahl */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg flex items-center gap-2">
              <Users className="h-5 w-5" />
              Mitarbeiter
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {company.employee_count || company.size_range || 'Nicht angegeben'}
            </div>
          </CardContent>
        </Card>
        
        {/* Standorte */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg flex items-center gap-2">
              <MapPin className="h-5 w-5" />
              Standorte
            </CardTitle>
          </CardHeader>
          <CardContent>
            {company.main_location ? (
              <div className="font-medium">{company.main_location}</div>
            ) : (
              <p className="text-sm text-muted-foreground">Kein Standort angegeben</p>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
