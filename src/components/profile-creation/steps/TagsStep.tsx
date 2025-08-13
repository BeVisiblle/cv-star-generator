import React from "react";
import ProfileTagsPanel from "@/components/settings/ProfileTagsPanel";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";

export interface TagsStepProps {
  // Keep signature consistent with other steps even if not used
  profileData?: any;
  validationErrors?: any;
  onUpdate?: (updates: any) => void;
}

export const TagsStep: React.FC<TagsStepProps> = () => {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Profil‑Tags</CardTitle>
        <CardDescription>Wähle Berufe, Stärken, Arbeitsumfeld und Benefits – wir nutzen das für bessere Matches.</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="max-w-3xl">
          <ProfileTagsPanel autoSave />
        </div>
      </CardContent>
    </Card>
  );
};

export default TagsStep;
