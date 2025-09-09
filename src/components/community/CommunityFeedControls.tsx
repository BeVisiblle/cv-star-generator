import React from 'react';
import { Card } from '@/components/ui/card';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useCommunityPreferences, useUpdateCommunityPreferences } from '@/hooks/useCommunityPosts';

export default function CommunityFeedControls() {
  const { data: preferences, isLoading } = useCommunityPreferences();
  const updatePreferences = useUpdateCommunityPreferences();

  if (isLoading || !preferences) return null;

  const handlePreferenceChange = (key: string, value: any) => {
    updatePreferences.mutate({ [key]: value });
  };

  return (
    <Card className="p-4 space-y-4">
      <h3 className="font-semibold text-sm">Feed-Einstellungen</h3>
      
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <Label htmlFor="show-jobs" className="text-sm">
            Job-Shares anzeigen
          </Label>
          <Switch
            id="show-jobs"
            checked={preferences.show_job_shares}
            onCheckedChange={(checked) => handlePreferenceChange('show_job_shares', checked)}
          />
        </div>

        <div className="flex items-center justify-between">
          <Label htmlFor="show-companies" className="text-sm">
            Unternehmensposts anzeigen
          </Label>
          <Switch
            id="show-companies"
            checked={preferences.show_company_posts}
            onCheckedChange={(checked) => handlePreferenceChange('show_company_posts', checked)}
          />
        </div>

        <div className="flex items-center justify-between">
          <Label htmlFor="show-users" className="text-sm">
            Nutzerposts anzeigen
          </Label>
          <Switch
            id="show-users"
            checked={preferences.show_user_posts}
            onCheckedChange={(checked) => handlePreferenceChange('show_user_posts', checked)}
          />
        </div>

        <div className="space-y-2">
          <Label className="text-sm">Von wem Beiträge anzeigen</Label>
          <Select
            value={preferences.origin_filter}
            onValueChange={(value) => handlePreferenceChange('origin_filter', value)}
          >
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Alle</SelectItem>
              <SelectItem value="followers">Nur Gefolgte</SelectItem>
              <SelectItem value="recommended">Gefolgte + Empfehlungen</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>
    </Card>
  );
}