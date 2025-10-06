import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { CVPreviewCard } from '@/components/CVPreviewCard';
import { WeitereDokumenteSection } from '@/components/linkedin/right-rail/WeitereDokumenteSection';
import WeitereDokumenteWidget from '@/components/profile/WeitereDokumenteWidget';
import { Badge } from '@/components/ui/badge';
import { Award, Languages } from 'lucide-react';

interface LinkedInProfileSidebarProps {
  profile: any;
  isEditing?: boolean;
  onProfileUpdate?: (updates: any) => void;
  readOnly?: boolean;
  showLanguagesAndSkills?: boolean;
  showLicenseAndStats?: boolean;
  showCVSection?: boolean;
}

export function LinkedInProfileSidebar({
  profile,
  isEditing,
  onProfileUpdate,
  readOnly = false,
  showLanguagesAndSkills = true,
  showLicenseAndStats = true,
  showCVSection = true,
}: LinkedInProfileSidebarProps) {
  const [isDocumentWidgetOpen, setIsDocumentWidgetOpen] = useState(false);
  const [documentUpdateTrigger, setDocumentUpdateTrigger] = useState(0);

  const handleDocumentUploaded = () => {
    // Trigger reload of documents section
    setDocumentUpdateTrigger(prev => prev + 1);
  };

  return (
    <div className="space-y-4">
      {/* CV Download Section - First */}
      {showCVSection && profile && (
        <CVPreviewCard
          profile={profile}
          onDownload={() => {
            const params = new URLSearchParams({
              layout: String(profile.layout || 1),
              userId: profile.id
            });
            window.open(`/cv/print?${params.toString()}`, '_blank');
          }}
        />
      )}

      {/* Weitere Dokumente Section - Second */}
      <WeitereDokumenteSection
        userId={profile?.id}
        readOnly={readOnly}
        openWidget={() => setIsDocumentWidgetOpen(true)}
        refreshTrigger={documentUpdateTrigger}
      />

      {/* Skills Section - After Ads */}
      {showLanguagesAndSkills && profile?.faehigkeiten && profile.faehigkeiten.length > 0 && (
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-lg font-semibold flex items-center gap-2">
              <Award className="h-5 w-5" />
              Fähigkeiten
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex flex-wrap gap-2">
              {profile.faehigkeiten.map((skill: string, idx: number) => (
                <Badge key={idx} variant="secondary">
                  {skill}
                </Badge>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Languages Section - After Skills */}
      {showLanguagesAndSkills && profile?.sprachen && profile.sprachen.length > 0 && (
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-lg font-semibold flex items-center gap-2">
              <Languages className="h-5 w-5" />
              Sprachen
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {profile.sprachen.map((lang: any, idx: number) => (
                <div key={idx} className="flex justify-between items-center">
                  <span className="font-medium">{lang.sprache || lang}</span>
                  {lang.niveau && (
                    <Badge variant="outline">{lang.niveau}</Badge>
                  )}
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Weitere Dokumente Widget Modal */}
      <WeitereDokumenteWidget
        isOpen={isDocumentWidgetOpen}
        onClose={() => setIsDocumentWidgetOpen(false)}
        userId={profile?.id}
        onDocumentUploaded={handleDocumentUploaded}
      />
    </div>
  );
}

export default LinkedInProfileSidebar;
