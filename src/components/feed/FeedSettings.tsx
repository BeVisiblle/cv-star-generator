import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Separator } from '@/components/ui/separator';
import { Badge } from '@/components/ui/badge';
import { 
  Settings, 
  Filter, 
  SortAsc, 
  RefreshCw,
  Eye,
  EyeOff,
  BarChart3,
  Calendar,
  FileText,
  Briefcase,
  Building,
  Users
} from 'lucide-react';
import { useTranslation } from '@/lib/i18n';
import { useFeedSettings } from '@/hooks/useFeedSettings';
import { cn } from '@/lib/utils';

interface FeedSettingsProps {
  className?: string;
}

export function FeedSettings({ className }: FeedSettingsProps) {
  const { t } = useTranslation();
  const [isOpen, setIsOpen] = useState(false);
  
  const {
    settings,
    isLoading,
    updateSetting,
    resetToDefaults,
    isSaving
  } = useFeedSettings();

  const getActiveFilterCount = () => {
    let count = 0;
    if (!settings.showJobs) count++;
    if (!settings.showPolls) count++;
    if (!settings.showEvents) count++;
    if (!settings.showTextPosts) count++;
    if (!settings.showJobShares) count++;
    if (!settings.showCompanyPosts) count++;
    if (!settings.showUserPosts) count++;
    return count;
  };

  const activeFilterCount = getActiveFilterCount();

  if (!isOpen) {
    return (
      <Button
        variant="outline"
        onClick={() => setIsOpen(true)}
        className={cn("relative", className)}
      >
        <Settings className="h-4 w-4 mr-2" />
        Feed-Einstellungen
        {activeFilterCount > 0 && (
          <Badge variant="secondary" className="ml-2 h-5 w-5 p-0 flex items-center justify-center text-xs">
            {activeFilterCount}
          </Badge>
        )}
      </Button>
    );
  }

  return (
    <Card className={cn("w-full", className)}>
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Settings className="h-5 w-5" />
            Feed-Einstellungen
          </div>
          <div className="flex items-center gap-2">
            {activeFilterCount > 0 && (
              <Badge variant="secondary" className="text-xs">
                {activeFilterCount} Filter aktiv
              </Badge>
            )}
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setIsOpen(false)}
            >
              ✕
            </Button>
          </div>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Content Type Filters */}
        <div className="space-y-4">
          <div className="flex items-center gap-2">
            <Filter className="h-4 w-4" />
            <Label className="text-sm font-medium">Inhaltstypen anzeigen</Label>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Briefcase className="h-4 w-4 text-muted-foreground" />
                <Label htmlFor="show-jobs" className="text-sm">Stellenanzeigen</Label>
              </div>
              <Switch
                id="show-jobs"
                checked={settings.showJobs}
                onCheckedChange={(checked) => updateSetting('showJobs', checked)}
                disabled={isSaving}
              />
            </div>

            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <BarChart3 className="h-4 w-4 text-muted-foreground" />
                <Label htmlFor="show-polls" className="text-sm">Umfragen</Label>
              </div>
              <Switch
                id="show-polls"
                checked={settings.showPolls}
                onCheckedChange={(checked) => updateSetting('showPolls', checked)}
                disabled={isSaving}
              />
            </div>

            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Calendar className="h-4 w-4 text-muted-foreground" />
                <Label htmlFor="show-events" className="text-sm">Events</Label>
              </div>
              <Switch
                id="show-events"
                checked={settings.showEvents}
                onCheckedChange={(checked) => updateSetting('showEvents', checked)}
                disabled={isSaving}
              />
            </div>

            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <FileText className="h-4 w-4 text-muted-foreground" />
                <Label htmlFor="show-text-posts" className="text-sm">Text-Beiträge</Label>
              </div>
              <Switch
                id="show-text-posts"
                checked={settings.showTextPosts}
                onCheckedChange={(checked) => updateSetting('showTextPosts', checked)}
                disabled={isSaving}
              />
            </div>

            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Briefcase className="h-4 w-4 text-muted-foreground" />
                <Label htmlFor="show-job-shares" className="text-sm">Job-Geteilt</Label>
              </div>
              <Switch
                id="show-job-shares"
                checked={settings.showJobShares}
                onCheckedChange={(checked) => updateSetting('showJobShares', checked)}
                disabled={isSaving}
              />
            </div>
          </div>
        </div>

        <Separator />

        {/* Author Type Filters */}
        <div className="space-y-4">
          <div className="flex items-center gap-2">
            <Users className="h-4 w-4" />
            <Label className="text-sm font-medium">Autoren anzeigen</Label>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Building className="h-4 w-4 text-muted-foreground" />
                <Label htmlFor="show-company-posts" className="text-sm">Unternehmen</Label>
              </div>
              <Switch
                id="show-company-posts"
                checked={settings.showCompanyPosts}
                onCheckedChange={(checked) => updateSetting('showCompanyPosts', checked)}
                disabled={isSaving}
              />
            </div>

            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Users className="h-4 w-4 text-muted-foreground" />
                <Label htmlFor="show-user-posts" className="text-sm">Benutzer</Label>
              </div>
              <Switch
                id="show-user-posts"
                checked={settings.showUserPosts}
                onCheckedChange={(checked) => updateSetting('showUserPosts', checked)}
                disabled={isSaving}
              />
            </div>
          </div>
        </div>

        <Separator />

        {/* Sort and Filter Options */}
        <div className="space-y-4">
          <div className="flex items-center gap-2">
            <SortAsc className="h-4 w-4" />
            <Label className="text-sm font-medium">Sortierung und Filter</Label>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="sort-by" className="text-sm">Sortieren nach</Label>
              <Select
                value={settings.sortBy}
                onValueChange={(value) => updateSetting('sortBy', value)}
                disabled={isSaving}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="newest">Neueste zuerst</SelectItem>
                  <SelectItem value="popular">Beliebteste zuerst</SelectItem>
                  <SelectItem value="trending">Trending</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="filter-by" className="text-sm">Anzeigen von</Label>
              <Select
                value={settings.filterBy}
                onValueChange={(value) => updateSetting('filterBy', value)}
                disabled={isSaving}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Alle</SelectItem>
                  <SelectItem value="following">Folgende</SelectItem>
                  <SelectItem value="connections">Verbindungen</SelectItem>
                  <SelectItem value="companies">Unternehmen</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </div>

        <Separator />

        {/* Actions */}
        <div className="flex items-center justify-between">
          <Button
            variant="outline"
            onClick={resetToDefaults}
            disabled={isSaving}
            className="flex items-center gap-2"
          >
            <RefreshCw className="h-4 w-4" />
            Zurücksetzen
          </Button>
          
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            {isSaving ? (
              <div className="flex items-center gap-2">
                <RefreshCw className="h-4 w-4 animate-spin" />
                Speichere...
              </div>
            ) : (
              <div className="flex items-center gap-2">
                <Eye className="h-4 w-4" />
                Einstellungen werden automatisch gespeichert
              </div>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

