import React, { useState } from 'react';
import { Edit3, Save, X } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';

interface LinkedInProfileMainProps {
  profile: any;
  isEditing: boolean;
  onProfileUpdate: (updates: any) => void;
}

export const LinkedInProfileMain: React.FC<LinkedInProfileMainProps> = ({
  profile,
  isEditing,
  onProfileUpdate
}) => {
  const [isEditingAbout, setIsEditingAbout] = useState(false);
  const [aboutText, setAboutText] = useState(profile?.uebermich || '');

  const handleSaveAbout = () => {
    onProfileUpdate({ uebermich: aboutText });
    setIsEditingAbout(false);
  };

  const handleCancelAbout = () => {
    setAboutText(profile?.uebermich || '');
    setIsEditingAbout(false);
  };

  return (
    <div className="space-y-6">
      {/* About Section */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-4">
          <CardTitle className="text-xl font-semibold">Über mich</CardTitle>
          {!isEditingAbout && (
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setIsEditingAbout(true)}
              className="opacity-60 hover:opacity-100"
            >
              <Edit3 className="h-4 w-4" />
            </Button>
          )}
        </CardHeader>
        <CardContent>
          {isEditingAbout ? (
            <div className="space-y-4">
              <Textarea
                value={aboutText}
                onChange={(e) => setAboutText(e.target.value)}
                placeholder="Erzählen Sie etwas über sich, Ihre Erfahrungen und Ziele..."
                className="min-h-[120px] resize-none"
              />
              <div className="flex gap-2">
                <Button onClick={handleSaveAbout} size="sm">
                  <Save className="h-4 w-4 mr-2" />
                  Speichern
                </Button>
                <Button variant="outline" onClick={handleCancelAbout} size="sm">
                  <X className="h-4 w-4 mr-2" />
                  Abbrechen
                </Button>
              </div>
            </div>
          ) : (
            <div className="space-y-4">
              {aboutText ? (
                <p className="text-foreground leading-relaxed whitespace-pre-wrap">
                  {aboutText}
                </p>
              ) : (
                <p className="text-muted-foreground italic">
                  Fügen Sie eine Beschreibung hinzu, um Ihr Profil zu vervollständigen.
                </p>
              )}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Activity/Analytics Section (Future) */}
      <Card>
        <CardHeader>
          <CardTitle className="text-xl font-semibold">Aktivität</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center py-8 text-muted-foreground">
            <p>Aktivitäts-Dashboard wird bald verfügbar sein</p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};