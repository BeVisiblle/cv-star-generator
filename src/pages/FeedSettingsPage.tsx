import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { 
  Filter, 
  SortAsc, 
  RefreshCw,
  Eye,
  BarChart3,
  Calendar,
  FileText,
  Briefcase,
  Building,
  Users,
  ArrowLeft
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';

export function FeedSettingsPage() {
  const navigate = useNavigate();
  
  const [settings, setSettings] = useState({
    showJobs: true,
    showPolls: true,
    showEvents: true,
    showTextPosts: true,
    showJobShares: true,
    showCompanyPosts: true,
    showUserPosts: true,
    sortBy: 'newest',
    filterBy: 'all'
  });

  const [isSaving, setIsSaving] = useState(false);

  const updateSetting = (key: string, value: any) => {
    setSettings(prev => ({ ...prev, [key]: value }));
    setIsSaving(true);
    setTimeout(() => setIsSaving(false), 500); // Simulate save
  };

  const resetToDefaults = () => {
    setSettings({
      showJobs: true,
      showPolls: true,
      showEvents: true,
      showTextPosts: true,
      showJobShares: true,
      showCompanyPosts: true,
      showUserPosts: true,
      sortBy: 'newest',
      filterBy: 'all'
    });
  };

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

  return (
    <div className="max-w-4xl mx-auto p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="sm" onClick={() => navigate(-1)}>
          <ArrowLeft className="h-4 w-4 mr-2" />
          Zurück
        </Button>
        <div className="flex-1">
          <h1 className="text-2xl font-bold">Feed-Einstellungen</h1>
          <p className="text-muted-foreground">
            Passe deinen Feed nach deinen Vorlieben an
          </p>
        </div>
        {activeFilterCount > 0 && (
          <Badge variant="secondary" className="text-sm">
            {activeFilterCount} Filter aktiv
          </Badge>
        )}
      </div>

      {/* Content Type Filters */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Filter className="h-5 w-5" />
            Inhaltstypen anzeigen
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
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
        </CardContent>
      </Card>

      {/* Author Type Filters */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Users className="h-5 w-5" />
            Autoren anzeigen
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
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
        </CardContent>
      </Card>

      {/* Sort and Filter Options */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <SortAsc className="h-5 w-5" />
            Sortierung und Filter
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
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
        </CardContent>
      </Card>

      {/* Actions */}
      <Card>
        <CardContent className="pt-6">
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
    </div>
  );
}