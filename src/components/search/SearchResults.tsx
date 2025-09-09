'use client';
import React, { useState, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { Search, Users, Building2, Calendar, FileText, Hash, ArrowLeft } from 'lucide-react';
import { useTranslation } from '@/lib/i18n';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';

interface SearchResult {
  id: string;
  type: string;
  title: string;
  content: string;
  author_name: string;
  author_avatar: string;
  created_at: string;
  url: string;
  rank: number;
}

interface SearchResultsProps {
  className?: string;
}

export function SearchResults({ className }: SearchResultsProps) {
  const { t } = useTranslation();
  const router = useRouter();
  const searchParams = useSearchParams();
  
  const [query, setQuery] = useState('');
  const [activeTab, setActiveTab] = useState('all');
  const [results, setResults] = useState<SearchResult[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [hasSearched, setHasSearched] = useState(false);
  const [page, setPage] = useState(0);
  const [hasMore, setHasMore] = useState(true);

  const tabs = [
    { id: 'all', label: t('search.all'), icon: Search },
    { id: 'people', label: t('search.people'), icon: Users },
    { id: 'companies', label: t('search.companies'), icon: Building2 },
    { id: 'events', label: t('search.events'), icon: Calendar },
    { id: 'posts', label: t('search.posts'), icon: FileText },
    { id: 'hashtags', label: t('search.hashtags'), icon: Hash },
  ];

  // Initialize from URL params
  useEffect(() => {
    const urlQuery = searchParams.get('q') || '';
    const urlType = searchParams.get('type') || 'all';
    
    setQuery(urlQuery);
    setActiveTab(urlType);
    
    if (urlQuery) {
      performSearch(urlQuery, urlType, 0, true);
    }
  }, [searchParams]);

  // Perform search
  const performSearch = async (
    searchQuery: string, 
    searchType: string, 
    pageOffset: number = 0, 
    reset: boolean = false
  ) => {
    if (!searchQuery.trim()) return;

    setIsLoading(true);
    try {
      const { data, error } = await fetch('/api/search/all', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          query: searchQuery,
          search_type: searchType,
          page_offset: pageOffset,
          page_limit: 20,
        }),
      }).then(res => res.json());

      if (error) throw error;

      if (reset) {
        setResults(data || []);
        setPage(0);
      } else {
        setResults(prev => [...prev, ...(data || [])]);
        setPage(pageOffset / 20);
      }
      
      setHasMore((data || []).length === 20);
      setHasSearched(true);
    } catch (error) {
      console.error('Search error:', error);
      setResults([]);
    } finally {
      setIsLoading(false);
    }
  };

  // Handle search submission
  const handleSearch = () => {
    if (!query.trim()) return;
    
    // Update URL
    const params = new URLSearchParams();
    params.set('q', query);
    params.set('type', activeTab);
    router.push(`/search?${params.toString()}`);
    
    // Perform search
    performSearch(query, activeTab, 0, true);
  };

  // Handle tab change
  const handleTabChange = (tabId: string) => {
    setActiveTab(tabId);
    if (query.trim()) {
      performSearch(query, tabId, 0, true);
    }
  };

  // Handle load more
  const handleLoadMore = () => {
    if (!isLoading && hasMore) {
      performSearch(query, activeTab, (page + 1) * 20, false);
    }
  };

  // Handle result click
  const handleResultClick = (result: SearchResult) => {
    router.push(result.url);
  };

  // Get type icon
  const getTypeIcon = (type: string) => {
    const tab = tabs.find(t => t.id === type);
    return tab?.icon || Search;
  };

  // Get type color
  const getTypeColor = (type: string) => {
    const colors = {
      person: 'text-blue-500',
      company: 'text-green-500',
      event: 'text-purple-500',
      post: 'text-orange-500',
      hashtag: 'text-pink-500',
    };
    return colors[type as keyof typeof colors] || 'text-gray-500';
  };

  // Highlight text
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

  // Filter results by active tab
  const filteredResults = results.filter(result => {
    if (activeTab === 'all') return true;
    if (activeTab === 'people') return result.type === 'person';
    if (activeTab === 'companies') return result.type === 'company';
    if (activeTab === 'events') return result.type === 'event';
    if (activeTab === 'posts') return result.type === 'post';
    if (activeTab === 'hashtags') return result.type === 'hashtag';
    return true;
  });

  return (
    <div className={cn('w-full max-w-4xl mx-auto', className)}>
      {/* Header */}
      <div className="mb-6">
        <div className="flex items-center gap-4 mb-4">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => router.back()}
            className="flex items-center gap-2"
          >
            <ArrowLeft className="h-4 w-4" />
            Zurück
          </Button>
          <h1 className="text-2xl font-bold">Suchergebnisse</h1>
        </div>

        {/* Search Input */}
        <div className="flex gap-2">
          <Input
            type="text"
            placeholder={t('search.placeholder')}
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
            className="flex-1"
          />
          <Button onClick={handleSearch} disabled={!query.trim() || isLoading}>
            <Search className="h-4 w-4 mr-2" />
            Suchen
          </Button>
        </div>
      </div>

      {/* Results */}
      {hasSearched && (
        <div className="space-y-4">
          {/* Results Count */}
          <div className="text-sm text-muted-foreground">
            {isLoading ? 'Suche...' : `${filteredResults.length} Ergebnisse für "${query}"`}
          </div>

          {/* Tabs */}
          <Tabs value={activeTab} onValueChange={handleTabChange}>
            <TabsList className="grid w-full grid-cols-6">
              {tabs.map((tab) => {
                const Icon = tab.icon;
                return (
                  <TabsTrigger key={tab.id} value={tab.id} className="flex items-center gap-2">
                    <Icon className="h-4 w-4" />
                    <span className="hidden sm:inline">{tab.label}</span>
                  </TabsTrigger>
                );
              })}
            </TabsList>

            <TabsContent value={activeTab} className="mt-4">
              {isLoading && results.length === 0 ? (
                // Loading skeleton
                <div className="space-y-4">
                  {Array.from({ length: 5 }).map((_, i) => (
                    <Card key={i}>
                      <CardContent className="p-4">
                        <div className="flex items-center gap-3">
                          <Skeleton className="h-10 w-10 rounded-full" />
                          <div className="flex-1 space-y-2">
                            <Skeleton className="h-4 w-3/4" />
                            <Skeleton className="h-3 w-1/2" />
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              ) : filteredResults.length > 0 ? (
                // Results
                <div className="space-y-4">
                  {filteredResults.map((result) => {
                    const Icon = getTypeIcon(result.type);
                    const typeColor = getTypeColor(result.type);
                    
                    return (
                      <Card 
                        key={`${result.type}-${result.id}`}
                        className="cursor-pointer hover:shadow-md transition-shadow"
                        onClick={() => handleResultClick(result)}
                      >
                        <CardContent className="p-4">
                          <div className="flex items-start gap-3">
                            {/* Avatar/Icon */}
                            <div className="flex-shrink-0">
                              {result.author_avatar ? (
                                <Avatar className="h-10 w-10">
                                  <AvatarImage src={result.author_avatar} alt={result.author_name} />
                                  <AvatarFallback>
                                    <Icon className="h-5 w-5" />
                                  </AvatarFallback>
                                </Avatar>
                              ) : (
                                <div className={cn(
                                  'h-10 w-10 rounded-full bg-muted flex items-center justify-center',
                                  typeColor
                                )}>
                                  <Icon className="h-5 w-5" />
                                </div>
                              )}
                            </div>

                            {/* Content */}
                            <div className="flex-1 min-w-0">
                              <div className="flex items-center gap-2 mb-2">
                                <h3 className="font-semibold text-sm truncate">
                                  {highlightText(result.title, query)}
                                </h3>
                                <Badge variant="secondary" className="text-xs">
                                  {result.type}
                                </Badge>
                              </div>
                              
                              <p className="text-sm text-muted-foreground mb-2 line-clamp-2">
                                {highlightText(result.content, query)}
                              </p>
                              
                              <div className="flex items-center gap-2 text-xs text-muted-foreground">
                                <span>{result.author_name}</span>
                                <span>•</span>
                                <span>{new Date(result.created_at).toLocaleDateString('de-DE')}</span>
                              </div>
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    );
                  })}

                  {/* Load More */}
                  {hasMore && (
                    <div className="text-center pt-4">
                      <Button
                        variant="outline"
                        onClick={handleLoadMore}
                        disabled={isLoading}
                      >
                        {isLoading ? 'Lade...' : 'Mehr laden'}
                      </Button>
                    </div>
                  )}
                </div>
              ) : (
                // No results
                <div className="text-center py-12">
                  <Search className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
                  <h3 className="text-lg font-semibold mb-2">Keine Ergebnisse gefunden</h3>
                  <p className="text-muted-foreground">
                    Versuche andere Suchbegriffe oder ändere die Kategorie
                  </p>
                </div>
              )}
            </TabsContent>
          </Tabs>
        </div>
      )}

      {/* Initial state */}
      {!hasSearched && (
        <div className="text-center py-12">
          <Search className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
          <h3 className="text-lg font-semibold mb-2">Suche starten</h3>
          <p className="text-muted-foreground">
            Gib einen Suchbegriff ein, um Personen, Unternehmen, Events und Posts zu finden
          </p>
        </div>
      )}
    </div>
  );
}
