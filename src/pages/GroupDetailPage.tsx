import React, { useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { Users, FileText, MessageSquare, Settings, Plus, Upload } from 'lucide-react';
import { useGroup, useGroupMembers, useJoinGroup, useLeaveGroup } from '@/hooks/useGroups';
import { usePosts } from '@/hooks/usePosts';
import { useFiles } from '@/hooks/useFiles';
import { useQuestions } from '@/hooks/useQuestions';

export default function GroupDetailPage() {
  const { id } = useParams<{ id: string }>();
  const [activeTab, setActiveTab] = useState<'feed' | 'files' | 'members' | 'about'>('feed');

  const { data: group, isLoading: groupLoading, error: groupError } = useGroup(id!);
  const { data: members = [] } = useGroupMembers(id!);
  const { data: posts = [] } = usePosts(id!, { type: 'thread' });
  const { data: files = [] } = useFiles(id!);
  const { data: questions = [] } = useQuestions(id!, { status: 'open' });

  const joinGroup = useJoinGroup();
  const leaveGroup = useLeaveGroup();

  const isMember = group?.member_count && group.member_count > 0;

  const handleJoinGroup = async () => {
    if (!id) return;
    try {
      await joinGroup.mutateAsync({ group_id: id });
    } catch (error) {
      console.error('Failed to join group:', error);
    }
  };

  const handleLeaveGroup = async () => {
    if (!id) return;
    try {
      await leaveGroup.mutateAsync(id);
    } catch (error) {
      console.error('Failed to leave group:', error);
    }
  };

  if (groupLoading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="animate-pulse">
          <div className="h-8 bg-muted rounded w-1/3 mb-4"></div>
          <div className="h-4 bg-muted rounded w-1/2 mb-8"></div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="md:col-span-2 space-y-4">
              {Array.from({ length: 3 }).map((_, i) => (
                <div key={i} className="h-32 bg-muted rounded"></div>
              ))}
            </div>
            <div className="space-y-4">
              {Array.from({ length: 2 }).map((_, i) => (
                <div key={i} className="h-24 bg-muted rounded"></div>
              ))}
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (groupError || !group) {
    return (
      <div className="container mx-auto px-4 py-8">
        <Card>
          <CardContent className="flex items-center justify-center py-8">
            <div className="text-center">
              <h3 className="text-lg font-semibold text-destructive mb-2">
                Gruppe nicht gefunden
              </h3>
              <p className="text-muted-foreground mb-4">
                Diese Gruppe existiert nicht oder du hast keinen Zugriff darauf.
              </p>
              <Button asChild>
                <Link to="/groups">Zurück zu den Gruppen</Link>
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      {/* Group Header */}
      <div className="mb-8">
        <div className="flex items-start justify-between mb-6">
          <div>
            <h1 className="text-3xl font-bold mb-2">{group.title}</h1>
            <p className="text-muted-foreground text-lg">{group.description}</p>
            <div className="flex items-center gap-4 mt-4">
              <Badge variant="secondary">
                {group.type === 'course' ? 'Kurs' : 
                 group.type === 'exam' ? 'Prüfung' : 'Beruf'}
              </Badge>
              <Badge variant="outline">
                {group.visibility === 'public' ? 'Öffentlich' : 
                 group.visibility === 'private' ? 'Privat' : 'Versteckt'}
              </Badge>
              {group.school && (
                <span className="text-sm text-muted-foreground">
                  {group.school}
                </span>
              )}
              {group.course_code && (
                <span className="text-sm text-muted-foreground">
                  {group.course_code}
                </span>
              )}
            </div>
          </div>
          <div className="flex gap-2">
            {isMember ? (
              <Button variant="destructive" onClick={handleLeaveGroup}>
                Gruppe verlassen
              </Button>
            ) : (
              <Button onClick={handleJoinGroup}>
                Gruppe beitreten
              </Button>
            )}
          </div>
        </div>
      </div>

      {/* Tabs */}
      <Tabs value={activeTab} onValueChange={(value) => setActiveTab(value as any)}>
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="feed" className="flex items-center gap-2">
            <MessageSquare className="h-4 w-4" />
            Feed
          </TabsTrigger>
          <TabsTrigger value="files" className="flex items-center gap-2">
            <FileText className="h-4 w-4" />
            Dateien
          </TabsTrigger>
          <TabsTrigger value="members" className="flex items-center gap-2">
            <Users className="h-4 w-4" />
            Mitglieder
          </TabsTrigger>
          <TabsTrigger value="about" className="flex items-center gap-2">
            <Settings className="h-4 w-4" />
            Über
          </TabsTrigger>
        </TabsList>

        <div className="mt-6">
          <TabsContent value="feed">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="md:col-span-2 space-y-4">
                {/* Create Post Button */}
                <Card>
                  <CardContent className="p-4">
                    <Button className="w-full" variant="outline">
                      <Plus className="h-4 w-4 mr-2" />
                      Neuen Beitrag erstellen
                    </Button>
                  </CardContent>
                </Card>

                {/* Posts */}
                {posts.length === 0 ? (
                  <Card>
                    <CardContent className="flex items-center justify-center py-8">
                      <div className="text-center">
                        <MessageSquare className="h-8 w-8 text-muted-foreground mx-auto mb-2" />
                        <h3 className="text-lg font-semibold mb-2">Noch keine Beiträge</h3>
                        <p className="text-muted-foreground">
                          Erstelle den ersten Beitrag in dieser Gruppe.
                        </p>
                      </div>
                    </CardContent>
                  </Card>
                ) : (
                  posts.map((post) => (
                    <Card key={post.id}>
                      <CardContent className="p-4">
                        <div className="flex items-start gap-3">
                          <div className="w-8 h-8 bg-primary/10 rounded-full flex items-center justify-center">
                            <MessageSquare className="h-4 w-4 text-primary" />
                          </div>
                          <div className="flex-1">
                            <h3 className="font-semibold">{post.title}</h3>
                            <p className="text-muted-foreground text-sm mt-1">
                              {post.body}
                            </p>
                            <div className="flex items-center gap-4 mt-2 text-xs text-muted-foreground">
                              <span>{post.author?.display_name || 'Unbekannt'}</span>
                              <span>
                                {new Date(post.created_at).toLocaleDateString('de-DE')}
                              </span>
                            </div>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))
                )}
              </div>

              {/* Sidebar */}
              <div className="space-y-4">
                {/* Quick Stats */}
                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg">Statistiken</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-2">
                    <div className="flex justify-between">
                      <span className="text-sm text-muted-foreground">Mitglieder</span>
                      <span className="font-medium">{members.length}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm text-muted-foreground">Beiträge</span>
                      <span className="font-medium">{posts.length}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm text-muted-foreground">Dateien</span>
                      <span className="font-medium">{files.length}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm text-muted-foreground">Fragen</span>
                      <span className="font-medium">{questions.length}</span>
                    </div>
                  </CardContent>
                </Card>

                {/* Recent Questions */}
                {questions.length > 0 && (
                  <Card>
                    <CardHeader>
                      <CardTitle className="text-lg">Aktuelle Fragen</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-2">
                      {questions.slice(0, 3).map((question) => (
                        <div key={question.id} className="text-sm">
                          <div className="font-medium line-clamp-2">
                            {question.title}
                          </div>
                          <div className="text-xs text-muted-foreground mt-1">
                            {question.answer_count || 0} Antworten
                          </div>
                        </div>
                      ))}
                    </CardContent>
                  </Card>
                )}
              </div>
            </div>
          </TabsContent>

          <TabsContent value="files">
            <div className="space-y-4">
              <div className="flex justify-between items-center">
                <h2 className="text-xl font-semibold">Dateien</h2>
                <Button>
                  <Upload className="h-4 w-4 mr-2" />
                  Datei hochladen
                </Button>
              </div>

              {files.length === 0 ? (
                <Card>
                  <CardContent className="flex items-center justify-center py-8">
                    <div className="text-center">
                      <FileText className="h-8 w-8 text-muted-foreground mx-auto mb-2" />
                      <h3 className="text-lg font-semibold mb-2">Noch keine Dateien</h3>
                      <p className="text-muted-foreground">
                        Lade die erste Datei in diese Gruppe hoch.
                      </p>
                    </div>
                  </CardContent>
                </Card>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {files.map((file) => (
                    <Card key={file.id} className="cursor-pointer hover:shadow-md transition-shadow">
                      <CardContent className="p-4">
                        <div className="flex items-start gap-3">
                          <div className="w-10 h-10 bg-primary/10 rounded flex items-center justify-center">
                            <FileText className="h-5 w-5 text-primary" />
                          </div>
                          <div className="flex-1 min-w-0">
                            <h3 className="font-medium truncate">{file.filename}</h3>
                            <p className="text-sm text-muted-foreground">
                              {file.uploader?.display_name || 'Unbekannt'}
                            </p>
                            <p className="text-xs text-muted-foreground">
                              {new Date(file.created_at).toLocaleDateString('de-DE')}
                            </p>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              )}
            </div>
          </TabsContent>

          <TabsContent value="members">
            <div className="space-y-4">
              <h2 className="text-xl font-semibold">Mitglieder ({members.length})</h2>
              
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {members.map((member) => (
                  <Card key={member.user_id}>
                    <CardContent className="p-4">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-primary/10 rounded-full flex items-center justify-center">
                          <span className="text-sm font-medium">
                            {member.user?.display_name?.charAt(0) || '?'}
                          </span>
                        </div>
                        <div className="flex-1">
                          <h3 className="font-medium">{member.user?.display_name || 'Unbekannt'}</h3>
                          <p className="text-sm text-muted-foreground">
                            {member.role === 'owner' ? 'Besitzer' :
                             member.role === 'moderator' ? 'Moderator' : 'Mitglied'}
                          </p>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </div>
          </TabsContent>

          <TabsContent value="about">
            <div className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle>Gruppendetails</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <label className="text-sm font-medium text-muted-foreground">Typ</label>
                    <p className="text-sm">
                      {group.type === 'course' ? 'Kurs' : 
                       group.type === 'exam' ? 'Prüfung' : 'Beruf'}
                    </p>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-muted-foreground">Sichtbarkeit</label>
                    <p className="text-sm">
                      {group.visibility === 'public' ? 'Öffentlich' : 
                       group.visibility === 'private' ? 'Privat' : 'Versteckt'}
                    </p>
                  </div>
                  {group.school && (
                    <div>
                      <label className="text-sm font-medium text-muted-foreground">Schule</label>
                      <p className="text-sm">{group.school}</p>
                    </div>
                  )}
                  {group.course_code && (
                    <div>
                      <label className="text-sm font-medium text-muted-foreground">Kurs</label>
                      <p className="text-sm">{group.course_code}</p>
                    </div>
                  )}
                  {group.region && (
                    <div>
                      <label className="text-sm font-medium text-muted-foreground">Region</label>
                      <p className="text-sm">{group.region}</p>
                    </div>
                  )}
                  <div>
                    <label className="text-sm font-medium text-muted-foreground">Erstellt</label>
                    <p className="text-sm">
                      {new Date(group.created_at).toLocaleDateString('de-DE')}
                    </p>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>
        </div>
      </Tabs>
    </div>
  );
}
