import React from 'react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { 
  Filter, 
  X, 
  Briefcase, 
  BarChart3, 
  Calendar, 
  FileText,
  Building,
  Users
} from 'lucide-react';
import { useTranslation } from '@/lib/i18n';
import { useFeedSettings } from '@/hooks/useFeedSettings';
import { cn } from '@/lib/utils';

interface FeedFilterProps {
  className?: string;
}

export function FeedFilter({ className }: FeedFilterProps) {
  const { t } = useTranslation();
  const { settings, updateSetting } = useFeedSettings();

  const getActiveFilters = () => {
    const filters = [];
    
    if (!settings.showJobs) filters.push({ key: 'showJobs', label: 'Stellenanzeigen', icon: Briefcase });
    if (!settings.showPolls) filters.push({ key: 'showPolls', label: 'Umfragen', icon: BarChart3 });
    if (!settings.showEvents) filters.push({ key: 'showEvents', label: 'Events', icon: Calendar });
    if (!settings.showTextPosts) filters.push({ key: 'showTextPosts', label: 'Text-Beiträge', icon: FileText });
    if (!settings.showJobShares) filters.push({ key: 'showJobShares', label: 'Job-Geteilt', icon: Briefcase });
    if (!settings.showCompanyPosts) filters.push({ key: 'showCompanyPosts', label: 'Unternehmen', icon: Building });
    if (!settings.showUserPosts) filters.push({ key: 'showUserPosts', label: 'Benutzer', icon: Users });
    
    return filters;
  };

  const activeFilters = getActiveFilters();

  if (activeFilters.length === 0) {
    return null;
  }

  const removeFilter = (key: string) => {
    updateSetting(key as keyof typeof settings, true);
  };

  const clearAllFilters = () => {
    updateSetting('showJobs', true);
    updateSetting('showPolls', true);
    updateSetting('showEvents', true);
    updateSetting('showTextPosts', true);
    updateSetting('showJobShares', true);
    updateSetting('showCompanyPosts', true);
    updateSetting('showUserPosts', true);
  };

  return (
    <div className={cn("flex items-center gap-2 flex-wrap", className)}>
      <div className="flex items-center gap-2 text-sm text-muted-foreground">
        <Filter className="h-4 w-4" />
        <span>Filter aktiv:</span>
      </div>
      
      {activeFilters.map((filter) => {
        const Icon = filter.icon;
        return (
          <Badge
            key={filter.key}
            variant="secondary"
            className="flex items-center gap-1 pr-1"
          >
            <Icon className="h-3 w-3" />
            <span className="text-xs">{filter.label}</span>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => removeFilter(filter.key)}
              className="h-4 w-4 p-0 hover:bg-transparent"
            >
              <X className="h-3 w-3" />
            </Button>
          </Badge>
        );
      })}
      
      {activeFilters.length > 1 && (
        <Button
          variant="ghost"
          size="sm"
          onClick={clearAllFilters}
          className="text-xs text-muted-foreground hover:text-foreground"
        >
          Alle entfernen
        </Button>
      )}
    </div>
  );
}

