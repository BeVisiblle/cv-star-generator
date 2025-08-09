import React, { useState } from 'react';
import { Edit3, Save, X } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { useAuth } from '@/hooks/useAuth';
interface LinkedInProfileMainProps {
  profile: any;
  isEditing: boolean;
  onProfileUpdate: (updates: any) => void;
  readOnly?: boolean;
}
export const LinkedInProfileMain: React.FC<LinkedInProfileMainProps> = ({
  profile,
  isEditing,
  onProfileUpdate,
  readOnly = false
}) => {
  const { user } = useAuth();
  const isOwner = user?.id === profile?.id;
  const [isEditingAbout, setIsEditingAbout] = useState(false);
  const [aboutText, setAboutText] = useState(profile?.uebermich || '');
  const handleSaveAbout = () => {
    onProfileUpdate({
      uebermich: aboutText
    });
    setIsEditingAbout(false);
  };
  const handleCancelAbout = () => {
    setAboutText(profile?.uebermich || '');
    setIsEditingAbout(false);
  };
  return <div className="space-y-6">
      {/* About Section */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-4">
          <CardTitle className="text-xl font-semibold">{isOwner ? 'Über mich' : `Über ${profile?.vorname || 'diese Person'}`}</CardTitle>
          {isOwner && !isEditingAbout && (
            <Button variant="ghost" size="sm" onClick={() => setIsEditingAbout(true)} className="opacity-60 hover:opacity-100">
              <Edit3 className="h-4 w-4" />
            </Button>
          )}
        </CardHeader>
        <CardContent>
          {!readOnly && isEditingAbout ? <div className="space-y-4">
              <Textarea value={aboutText} onChange={e => setAboutText(e.target.value)} placeholder="Erzählen Sie etwas über sich, Ihre Erfahrungen und Ziele..." className="min-h-[120px] md:min-h-[150px] resize-none text-sm md:text-base break-words" />
              <div className="flex flex-col sm:flex-row gap-2">
                <Button onClick={handleSaveAbout} size="sm" className="flex-1 sm:flex-none min-h-[44px]">
                  <Save className="h-4 w-4 mr-2" />
                  <span className="hidden sm:inline">Speichern</span>
                  <span className="sm:hidden">Save</span>
                </Button>
                <Button variant="outline" onClick={handleCancelAbout} size="sm" className="flex-1 sm:flex-none min-h-[44px]">
                  <X className="h-4 w-4 mr-2" />
                  <span className="hidden sm:inline">Abbrechen</span>
                  <span className="sm:hidden">Cancel</span>
                </Button>
              </div>
            </div> : <div className="space-y-4">
              {aboutText ? <p className="text-foreground leading-relaxed whitespace-pre-wrap break-words">
                  {aboutText}
                </p> : <p className="text-muted-foreground italic">
                  {readOnly ? "Keine Beschreibung verfügbar." : "Fügen Sie eine Beschreibung hinzu, um Ihr Profil zu vervollständigen."}
                </p>}
            </div>}
        </CardContent>
      </Card>

    </div>;
  };