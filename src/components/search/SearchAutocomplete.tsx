'use client';
import React from 'react';
import { Users, Building2, Calendar, FileText, Hash, User } from 'lucide-react';
import { useTranslation } from '@/lib/i18n';
import { cn } from '@/lib/utils';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';

interface SearchResult {
  id: string;
  type: 'person' | 'company' | 'event' | 'post' | 'hashtag';
  label: string;
  sublabel: string;
  avatar?: string;
  url: string;
  rank: number;
}

interface SearchAutocompleteProps {
  results: SearchResult[];
  selectedIndex: number;
  onResultClick: (result: SearchResult) => void;
  query: string;
}

const typeIcons = {
  person: Users,
  company: Building2,
  event: Calendar,
  post: FileText,
  hashtag: Hash,
};

const typeColors = {
  person: 'text-blue-500',
  company: 'text-green-500',
  event: 'text-purple-500',
  post: 'text-orange-500',
  hashtag: 'text-pink-500',
};

export function SearchAutocomplete({ 
  results, 
  selectedIndex, 
  onResultClick, 
  query 
}: SearchAutocompleteProps) {
  const { t } = useTranslation();

  const highlightText = (text: string, highlight: string) => {
    if (!highlight.trim()) return text;
    
    const regex = new RegExp(`(${highlight.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')})`, 'gi');
    const parts = text.split(regex);
    
    return parts.map((part, index) => 
      regex.test(part) ? (
        <mark key={index} className="bg-yellow-200 dark:bg-yellow-800 px-0.5 rounded">
          {part}
        </mark>
      ) : part
    );
  };

  const getTypeLabel = (type: string) => {
    switch (type) {
      case 'person': return t('search.people');
      case 'company': return t('search.companies');
      case 'event': return t('search.events');
      case 'post': return t('search.posts');
      case 'hashtag': return t('search.hashtags');
      default: return type;
    }
  };

  const getTypeIcon = (type: string) => {
    const Icon = typeIcons[type as keyof typeof typeIcons] || User;
    return Icon;
  };

  const getTypeColor = (type: string) => {
    return typeColors[type as keyof typeof typeColors] || 'text-gray-500';
  };

  if (results.length === 0) {
    return (
      <div className="p-4 text-center text-muted-foreground">
        <div className="text-sm">Keine Ergebnisse gefunden</div>
        <div className="text-xs mt-1">Versuche andere Suchbegriffe</div>
      </div>
    );
  }

  return (
    <div className="py-2">
      {results.map((result, index) => {
        const Icon = getTypeIcon(result.type);
        const isSelected = index === selectedIndex;
        
        return (
          <div
            key={`${result.type}-${result.id}`}
            className={cn(
              'flex items-center gap-3 px-4 py-3 cursor-pointer transition-colors',
              isSelected ? 'bg-muted' : 'hover:bg-muted/50'
            )}
            onClick={() => onResultClick(result)}
          >
            {/* Avatar/Icon */}
            <div className="flex-shrink-0">
              {result.avatar ? (
                <Avatar className="h-8 w-8">
                  <AvatarImage src={result.avatar} alt={result.label} />
                  <AvatarFallback>
                    <Icon className="h-4 w-4" />
                  </AvatarFallback>
                </Avatar>
              ) : (
                <div className={cn(
                  'h-8 w-8 rounded-full bg-muted flex items-center justify-center',
                  getTypeColor(result.type)
                )}>
                  <Icon className="h-4 w-4" />
                </div>
              )}
            </div>

            {/* Content */}
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 mb-1">
                <div className="font-medium text-sm truncate">
                  {highlightText(result.label, query)}
                </div>
                <Badge variant="secondary" className="text-xs px-1.5 py-0.5">
                  {getTypeLabel(result.type)}
                </Badge>
              </div>
              
              {result.sublabel && (
                <div className="text-xs text-muted-foreground truncate">
                  {highlightText(result.sublabel, query)}
                </div>
              )}
            </div>

            {/* Rank indicator (for debugging) */}
            {process.env.NODE_ENV === 'development' && (
              <div className="text-xs text-muted-foreground">
                {Math.round(result.rank * 100) / 100}
              </div>
            )}
          </div>
        );
      })}
      
      {/* Footer with search hint */}
      <div className="px-4 py-2 border-t bg-muted/30 text-xs text-muted-foreground">
        <div className="flex items-center justify-between">
          <span>Drücke Enter für vollständige Suche</span>
          <span>↑↓ zum Navigieren</span>
        </div>
      </div>
    </div>
  );
}
