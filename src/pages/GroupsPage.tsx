import React from 'react';
import { useGroups, useCreateGroup } from '@/hooks/useGroups';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Users, Plus, Search } from 'lucide-react';
import { Link } from 'react-router-dom';
import { Input } from '@/components/ui/input';
import { useState } from 'react';
import { LoadingSkeleton } from '@/components/shared/LoadingSkeleton';
import { EmptyState } from '@/components/shared/EmptyState';

export default function GroupsPage() {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedType, setSelectedType] = useState<'course' | 'exam' | 'profession' | undefined>();
  
  const { data: groups = [], isLoading, error } = useGroups({
    search: searchTerm,
    type: selectedType,
  });

  if (isLoading) {
    return (
      <div className="container mx-auto py-6 space-y-6">
        <LoadingSkeleton rows={6} showAvatar={false} />
      </div>
    );
  }

  if (error) {
    return (
      <div className="container mx-auto py-6">
        <EmptyState 
          text="Fehler beim Laden der Gruppen" 
          icon="⚠️"
        />
      </div>
    );
  }

  return (
    <div className="container mx-auto py-6 space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold">Lerngruppen</h1>
          <p className="text-muted-foreground">
            Finde deine perfekte Lerngruppe oder erstelle eine neue
          </p>
        </div>
        <Button asChild>
          <Link to="/groups/create">
            <Plus className="h-4 w-4 mr-2" />
            Neue Gruppe
          </Link>
        </Button>
      </div>

      {/* Search and Filter */}
      <div className="flex flex-col sm:flex-row gap-4">
        <div className="flex-1 relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Gruppen suchen..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10"
          />
        </div>
        <div className="flex gap-2">
          <Button
            variant={selectedType === undefined ? "default" : "outline"}
            size="sm"
            onClick={() => setSelectedType(undefined)}
          >
            Alle
          </Button>
          <Button
            variant={selectedType === 'course' ? "default" : "outline"}
            size="sm"
            onClick={() => setSelectedType('course')}
          >
            Studiengang
          </Button>
          <Button
            variant={selectedType === 'exam' ? "default" : "outline"}
            size="sm"
            onClick={() => setSelectedType('exam')}
          >
            Prüfung
          </Button>
          <Button
            variant={selectedType === 'profession' ? "default" : "outline"}
            size="sm"
            onClick={() => setSelectedType('profession')}
          >
            Beruf
          </Button>
        </div>
      </div>

      {/* Groups Grid */}
      {groups.length === 0 ? (
        <EmptyState 
          text="Keine Gruppen gefunden" 
          icon="👥"
          action={
            <Button asChild>
              <Link to="/groups/create">
                <Plus className="h-4 w-4 mr-2" />
                Erste Gruppe erstellen
              </Link>
            </Button>
          }
        />
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {groups.map((group) => (
            <Card key={group.id} className="hover:shadow-md transition-shadow">
              <CardHeader>
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <CardTitle className="text-lg line-clamp-2">
                      <Link 
                        to={`/groups/${group.id}`}
                        className="hover:text-primary transition-colors"
                      >
                        {group.title}
                      </Link>
                    </CardTitle>
                    <div className="flex items-center gap-2 mt-2">
                      <Badge variant="secondary" className="text-xs">
                        {group.type === 'course' ? 'Studiengang' : 
                         group.type === 'exam' ? 'Prüfung' : 'Beruf'}
                      </Badge>
                      {group.visibility === 'private' && (
                        <Badge variant="outline" className="text-xs">
                          Privat
                        </Badge>
                      )}
                    </div>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground line-clamp-3 mb-4">
                  {group.description || 'Keine Beschreibung verfügbar'}
                </p>
                
                <div className="flex items-center justify-between">
                  <div className="flex items-center text-sm text-muted-foreground">
                    <Users className="h-4 w-4 mr-1" />
                    {(group as any).group_members?.[0]?.count || 0} Mitglieder
                  </div>
                  
                  <Button asChild size="sm">
                    <Link to={`/groups/${group.id}`}>
                      Beitreten
                    </Link>
                  </Button>
                </div>

                {group.school && (
                  <div className="mt-3 pt-3 border-t">
                    <p className="text-xs text-muted-foreground">
                      {group.school}
                      {group.course_code && ` • ${group.course_code}`}
                    </p>
                  </div>
                )}
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}