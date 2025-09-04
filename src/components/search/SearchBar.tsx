import React, { useState, useRef, useEffect } from 'react';
import { Search, X, Clock, Hash, Users, FileText } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';
import { useSearch, useSearchSuggestions } from '@/hooks/useSearch';
import { useDebounce } from '@/hooks/useDebounce';
import type { SearchFilters } from '@/hooks/useSearch';

interface SearchBarProps {
  onResultClick?: (result: any) => void;
  placeholder?: string;
  className?: string;
}

export const SearchBar: React.FC<SearchBarProps> = ({
  onResultClick,
  placeholder = "Search groups, posts, and files...",
  className = ""
}) => {
  const [query, setQuery] = useState('');
  const [isOpen, setIsOpen] = useState(false);
  const [filters, setFilters] = useState<SearchFilters>({});
  const [showFilters, setShowFilters] = useState(false);
  
  const debouncedQuery = useDebounce(query, 300);
  const inputRef = useRef<HTMLInputElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  const { data: searchResults, isLoading, error } = useSearch(debouncedQuery, filters);
  const { data: suggestions } = useSearchSuggestions(debouncedQuery);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleQueryChange = (value: string) => {
    setQuery(value);
    setIsOpen(value.length > 0);
  };

  const handleSuggestionClick = (suggestion: string) => {
    setQuery(suggestion);
    setIsOpen(false);
    inputRef.current?.blur();
  };

  const handleResultClick = (result: any) => {
    onResultClick?.(result);
    setIsOpen(false);
    inputRef.current?.blur();
  };

  const clearSearch = () => {
    setQuery('');
    setIsOpen(false);
    inputRef.current?.focus();
  };

  const toggleFilters = () => {
    setShowFilters(!showFilters);
  };

  const updateFilter = (key: keyof SearchFilters, value: any) => {
    setFilters(prev => ({
      ...prev,
      [key]: value
    }));
  };

  const clearFilters = () => {
    setFilters({});
  };

  const renderSearchResults = () => {
    if (!searchResults || searchResults.total === 0) {
      return (
        <div className="p-4 text-center text-muted-foreground">
          {isLoading ? 'Searching...' : 'No results found'}
        </div>
      );
    }

    return (
      <div className="max-h-96 overflow-y-auto">
        {/* Groups */}
        {searchResults.groups.length > 0 && (
          <div className="p-2">
            <div className="flex items-center gap-2 px-2 py-1 text-sm font-medium text-muted-foreground">
              <Users className="h-4 w-4" />
              Groups ({searchResults.groups.length})
            </div>
            {searchResults.groups.map((group) => (
              <Card
                key={group.id}
                className="mb-2 cursor-pointer hover:bg-muted/50"
                onClick={() => handleResultClick({ type: 'group', data: group })}
              >
                <CardContent className="p-3">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <h4 className="font-medium">{group.title}</h4>
                      <p className="text-sm text-muted-foreground line-clamp-2">
                        {group.description}
                      </p>
                      <div className="flex gap-1 mt-2">
                        <span className="text-xs text-muted-foreground">
                          {group.description ? 'Mit Beschreibung' : 'Gruppe'}
                        </span>
                      </div>
                    </div>
                    <div className="text-right text-sm text-muted-foreground">
                      {group.member_count} members
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}

        {/* Posts */}
        {searchResults.posts.length > 0 && (
          <div className="p-2">
            <div className="flex items-center gap-2 px-2 py-1 text-sm font-medium text-muted-foreground">
              <FileText className="h-4 w-4" />
              Posts ({searchResults.posts.length})
            </div>
            {searchResults.posts.map((post) => (
              <Card
                key={post.id}
                className="mb-2 cursor-pointer hover:bg-muted/50"
                onClick={() => handleResultClick({ type: 'post', data: post })}
              >
                <CardContent className="p-3">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <h4 className="font-medium">{post.title}</h4>
                      <p className="text-sm text-muted-foreground line-clamp-2">
                        {post.title || 'Kein Inhalt'}
                      </p>
                      <div className="flex items-center gap-2 mt-2 text-xs text-muted-foreground">
                        <span>Post</span>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}

        {/* Files */}
        {searchResults.files.length > 0 && (
          <div className="p-2">
            <div className="flex items-center gap-2 px-2 py-1 text-sm font-medium text-muted-foreground">
              <FileText className="h-4 w-4" />
              Files ({searchResults.files.length})
            </div>
            {searchResults.files.map((file) => (
              <Card
                key={file.id}
                className="mb-2 cursor-pointer hover:bg-muted/50"
                onClick={() => handleResultClick({ type: 'file', data: file })}
              >
                <CardContent className="p-3">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <h4 className="font-medium">{file.filename || 'Datei'}</h4>
                      <p className="text-sm text-muted-foreground line-clamp-2">
                        Datei
                      </p>
                      <div className="flex items-center gap-2 mt-2 text-xs text-muted-foreground">
                        <span>Datei</span>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>
    );
  };

  const renderSuggestions = () => {
    if (!suggestions || suggestions.length === 0) return null;

    return (
      <div className="p-2">
        <div className="flex items-center gap-2 px-2 py-1 text-sm font-medium text-muted-foreground">
          <Clock className="h-4 w-4" />
          Suggestions
        </div>
        {suggestions.map((suggestion, index) => (
          <div
            key={index}
            className="flex items-center gap-2 px-2 py-2 cursor-pointer hover:bg-muted/50 rounded"
            onClick={() => handleSuggestionClick(suggestion)}
          >
            <Hash className="h-4 w-4 text-muted-foreground" />
            <span className="text-sm">{suggestion}</span>
          </div>
        ))}
      </div>
    );
  };

  return (
    <div ref={containerRef} className={`relative ${className}`}>
      <div className="relative">
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <Input
          ref={inputRef}
          value={query}
          onChange={(e) => handleQueryChange(e.target.value)}
          onFocus={() => setIsOpen(query.length > 0)}
          placeholder={placeholder}
          className="pl-10 pr-10"
        />
        {query && (
          <Button
            variant="ghost"
            size="sm"
            className="absolute right-1 top-1/2 transform -translate-y-1/2 h-6 w-6 p-0"
            onClick={clearSearch}
          >
            <X className="h-4 w-4" />
          </Button>
        )}
      </div>

      {isOpen && (
        <Card className="absolute top-full left-0 right-0 mt-1 z-50 max-h-96 overflow-hidden">
          <CardContent className="p-0">
            {query.length < 2 ? (
              <div className="p-4 text-center text-muted-foreground">
                Type at least 2 characters to search
              </div>
            ) : (
              <>
                {renderSuggestions()}
                {renderSearchResults()}
              </>
            )}
          </CardContent>
        </Card>
      )}

      {/* Filters */}
      {showFilters && (
        <Card className="absolute top-full left-0 right-0 mt-1 z-50">
          <CardContent className="p-4">
            <div className="space-y-4">
              <div>
                <label className="text-sm font-medium">Group Type</label>
                <div className="flex gap-2 mt-1">
                  {['study', 'professional', 'interest'].map((type) => (
                    <Button
                      key={type}
                      variant={filters.type === type ? 'default' : 'outline'}
                      size="sm"
                      onClick={() => updateFilter('type', filters.type === type ? undefined : type)}
                    >
                      {type}
                    </Button>
                  ))}
                </div>
              </div>
              
              <div>
                <label className="text-sm font-medium">Visibility</label>
                <div className="flex gap-2 mt-1">
                  {['public', 'private'].map((visibility) => (
                    <Button
                      key={visibility}
                      variant={filters.visibility === visibility ? 'default' : 'outline'}
                      size="sm"
                      onClick={() => updateFilter('visibility', filters.visibility === visibility ? undefined : visibility)}
                    >
                      {visibility}
                    </Button>
                  ))}
                </div>
              </div>

              <div className="flex gap-2">
                <Button variant="outline" size="sm" onClick={clearFilters}>
                  Clear Filters
                </Button>
                <Button variant="outline" size="sm" onClick={() => setShowFilters(false)}>
                  Close
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
};
