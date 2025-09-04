import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { Search, Filter, Plus, Users, GraduationCap, BookOpen, Briefcase } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { GroupCard } from '@/components/groups/GroupCard';
import { SearchBar } from '@/components/search/SearchBar';
import { useGroups, useJoinGroup, useLeaveGroup } from '@/hooks/useGroups';
import type { GroupFilters } from '@/types/groups';

export default function GroupsPage() {
  const [search, setSearch] = useState('');
  const [filters, setFilters] = useState<GroupFilters>({});
  const [activeTab, setActiveTab] = useState<string>('all');

  const { data: groups, isLoading, error } = useGroups(filters);
  const joinGroup = useJoinGroup();
  const leaveGroup = useLeaveGroup();

  const handleSearch = (value: string) => {
    setSearch(value);
    setFilters(prev => ({ ...prev, search: value || undefined }));
  };

  const handleTypeFilter = (type: string) => {
    setActiveTab(type);
    setFilters(prev => ({ 
      ...prev, 
      type: type === 'all' ? undefined : type as GroupFilters['type']
    }));
  };

  const handleVisibilityFilter = (visibility: string) => {
    setFilters(prev => ({ 
      ...prev, 
      visibility: visibility === 'all' ? undefined : visibility as GroupFilters['visibility']
    }));
  };

  const handleJoinGroup = async (groupId: string) => {
    try {
      await joinGroup.mutateAsync({ group_id: groupId });
    } catch (error) {
      console.error('Failed to join group:', error);
    }
  };

  const handleLeaveGroup = async (groupId: string) => {
    try {
      await leaveGroup.mutateAsync(groupId);
    } catch (error) {
      console.error('Failed to leave group:', error);
    }
  };

  const filteredGroups = groups?.filter(group => {
    if (activeTab === 'all') return true;
    return group.type === activeTab;
  }) || [];

  if (error) {
    return (
      <div className="container mx-auto px-4 py-8">
        <Card>
          <CardContent className="flex items-center justify-center py-8">
            <div className="text-center">
              <h3 className="text-lg font-semibold text-destructive mb-2">
                Fehler beim Laden der Gruppen
              </h3>
              <p className="text-muted-foreground">
                Bitte versuchen Sie es später erneut.
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      {/* Header */}
      <div className="mb-8">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-3xl font-bold">Gruppen entdecken</h1>
            <p className="text-muted-foreground mt-2">
              Finde und trete Gruppen bei, die zu deinen Interessen passen
            </p>
          </div>
          <Button asChild>
            <Link to="/groups/create">
              <Plus className="h-4 w-4 mr-2" />
              Gruppe erstellen
            </Link>
          </Button>
        </div>

        {/* Search and Filters */}
        <div className="flex flex-col sm:flex-row gap-4">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <SearchBar
              placeholder="Suche nach Fach, Schule, Jahrgang..."
              onResultClick={(result) => {
                if (result.type === 'group') {
                  // Navigate to group detail
                  window.location.href = `/groups/${result.data.id}`;
                }
              }}
              className="flex-1"
            />
          </div>
          <div className="flex gap-2">
            <Select onValueChange={handleVisibilityFilter}>
              <SelectTrigger className="w-[140px]">
                <SelectValue placeholder="Sichtbarkeit" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Alle</SelectItem>
                <SelectItem value="public">Öffentlich</SelectItem>
                <SelectItem value="private">Privat</SelectItem>
              </SelectContent>
            </Select>
            <Button variant="outline" size="icon">
              <Filter className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <Tabs value={activeTab} onValueChange={handleTypeFilter} className="mb-6">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="all" className="flex items-center gap-2">
            <Users className="h-4 w-4" />
            Alle
          </TabsTrigger>
          <TabsTrigger value="course" className="flex items-center gap-2">
            <GraduationCap className="h-4 w-4" />
            Kurse
          </TabsTrigger>
          <TabsTrigger value="exam" className="flex items-center gap-2">
            <BookOpen className="h-4 w-4" />
            Prüfungen
          </TabsTrigger>
          <TabsTrigger value="profession" className="flex items-center gap-2">
            <Briefcase className="h-4 w-4" />
            Berufe
          </TabsTrigger>
        </TabsList>

        <TabsContent value={activeTab} className="mt-6">
          {isLoading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {Array.from({ length: 6 }).map((_, i) => (
                <Card key={i} className="animate-pulse">
                  <CardHeader>
                    <div className="h-4 bg-muted rounded w-3/4"></div>
                    <div className="h-3 bg-muted rounded w-1/2"></div>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-2">
                      <div className="h-3 bg-muted rounded"></div>
                      <div className="h-3 bg-muted rounded w-2/3"></div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : filteredGroups.length === 0 ? (
            <Card>
              <CardContent className="flex items-center justify-center py-12">
                <div className="text-center">
                  <Users className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                  <h3 className="text-lg font-semibold mb-2">
                    {search ? 'Keine Gruppen gefunden' : 'Noch keine Gruppen vorhanden'}
                  </h3>
                  <p className="text-muted-foreground mb-4">
                    {search 
                      ? 'Versuche es mit anderen Suchbegriffen oder erstelle eine neue Gruppe.'
                      : 'Erstelle die erste Gruppe für deinen Kurs oder deine Prüfung.'
                    }
                  </p>
                  <Button asChild>
                    <Link to="/groups/create">
                      <Plus className="h-4 w-4 mr-2" />
                      Gruppe erstellen
                    </Link>
                  </Button>
                </div>
              </CardContent>
            </Card>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredGroups.map((group) => (
                <GroupCard
                  key={group.id}
                  group={group}
                  onJoin={handleJoinGroup}
                  onLeave={handleLeaveGroup}
                />
              ))}
            </div>
          )}
        </TabsContent>
      </Tabs>

      {/* Stats */}
      {groups && groups.length > 0 && (
        <div className="mt-8">
          <div className="flex items-center gap-4 text-sm text-muted-foreground">
            <Badge variant="secondary">
              {groups.length} Gruppen gefunden
            </Badge>
            {search && (
              <Badge variant="outline">
                Suche: "{search}"
              </Badge>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
