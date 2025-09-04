import React, { useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { useGroup, useJoinGroup, useLeaveGroup } from '@/hooks/useGroups';
import { usePosts } from '@/hooks/usePosts';
import { useFiles } from '@/hooks/useFiles';
import { useQuestions } from '@/hooks/useQuestions';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  Users, 
  FileText, 
  MessageSquare, 
  HelpCircle, 
  Settings,
  UserPlus,
  UserMinus
} from 'lucide-react';
import { LoadingSkeleton } from '@/components/shared/LoadingSkeleton';
import { EmptyState } from '@/components/shared/EmptyState';
import { useAuth } from '@/hooks/useAuth';

export default function GroupDetailPage() {
  const { id } = useParams<{ id: string }>();
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState('posts');
  
  const { data: group, isLoading: groupLoading } = useGroup(id!);
  const { data: posts = [] } = usePosts(id!, { type: activeTab === 'posts' ? undefined : 'thread' });
  const { data: files = [] } = useFiles(id!);
  const { data: questions = [] } = useQuestions(id!);
  
  const joinGroup = useJoinGroup();
  const leaveGroup = useLeaveGroup();

  if (groupLoading) {
    return (
      <div className="container mx-auto py-6">
        <LoadingSkeleton rows={8} showAvatar={false} />
      </div>
    );
  }

  if (!group) {
    return (
      <div className="container mx-auto py-6">
        <EmptyState 
          text="Gruppe nicht gefunden" 
          icon="❌"
          action={
            <Button asChild>
              <Link to="/groups">Zurück zu Gruppen</Link>
            </Button>
          }
        />
      </div>
    );
  }

  const isMember = user && group.group_members?.some(
    (member: any) => member.user_id === user.id && member.status === 'active'
  );
  const isOwner = user && group.group_members?.some(
    (member: any) => member.user_id === user.id && member.role === 'owner'
  );
  const memberCount = group.group_members?.length || 0;

  const handleJoinGroup = async () => {
    if (!user || !id) return;
    try {
      await joinGroup.mutateAsync({ group_id: id });
    } catch (error) {
      console.error('Failed to join group:', error);
    }
  };

  const handleLeaveGroup = async () => {
    if (!user || !id) return;
    try {
      await leaveGroup.mutateAsync(id);
    } catch (error) {
      console.error('Failed to leave group:', error);
    }
  };

  return (
    <div className="container mx-auto py-6 space-y-6">
      {/* Group Header */}
      <div className="flex flex-col lg:flex-row gap-6">
        <div className="flex-1">
          <div className="flex items-start justify-between mb-4">
            <div className="flex-1">
              <h1 className="text-3xl font-bold mb-2">{group.title}</h1>
              <div className="flex items-center gap-2 mb-3">
                <Badge variant="secondary">
                  {group.type === 'course' ? 'Studiengang' : 
                   group.type === 'exam' ? 'Prüfung' : 'Beruf'}
                </Badge>
                {group.visibility === 'private' && (
                  <Badge variant="outline">Privat</Badge>
                )}
                <div className="flex items-center text-sm text-muted-foreground ml-2">
                  <Users className="h-4 w-4 mr-1" />
                  {memberCount} Mitglied{memberCount !== 1 ? 'er' : ''}
                </div>
              </div>
              {group.description && (
                <p className="text-muted-foreground mb-4">{group.description}</p>
              )}
            </div>
          </div>

          {group.school && (
            <div className="bg-muted/50 rounded-lg p-4 mb-6">
              <h3 className="font-semibold mb-2">Schule/Institution</h3>
              <p className="text-sm">
                {group.school}
                {group.course_code && ` • ${group.course_code}`}
                {group.region && ` • ${group.region}`}
              </p>
            </div>
          )}
        </div>

        {/* Actions */}
        <div className="lg:w-64">
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Aktionen</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              {!isMember ? (
                <Button 
                  onClick={handleJoinGroup}
                  disabled={joinGroup.isPending}
                  className="w-full"
                >
                  <UserPlus className="h-4 w-4 mr-2" />
                  {joinGroup.isPending ? 'Beitritt...' : 'Gruppe beitreten'}
                </Button>
              ) : (
                <Button 
                  variant="outline"
                  onClick={handleLeaveGroup}
                  disabled={leaveGroup.isPending}
                  className="w-full"
                >
                  <UserMinus className="h-4 w-4 mr-2" />
                  {leaveGroup.isPending ? 'Verlasse...' : 'Gruppe verlassen'}
                </Button>
              )}
              
              {isOwner && (
                <Button variant="outline" className="w-full">
                  <Settings className="h-4 w-4 mr-2" />
                  Gruppe verwalten
                </Button>
              )}
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Group Content */}
      {isMember ? (
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="posts" className="flex items-center gap-2">
              <MessageSquare className="h-4 w-4" />
              <span className="hidden sm:inline">Posts</span>
            </TabsTrigger>
            <TabsTrigger value="questions" className="flex items-center gap-2">
              <HelpCircle className="h-4 w-4" />
              <span className="hidden sm:inline">Fragen</span>
            </TabsTrigger>
            <TabsTrigger value="files" className="flex items-center gap-2">
              <FileText className="h-4 w-4" />
              <span className="hidden sm:inline">Dateien</span>
            </TabsTrigger>
            <TabsTrigger value="members" className="flex items-center gap-2">
              <Users className="h-4 w-4" />
              <span className="hidden sm:inline">Mitglieder</span>
            </TabsTrigger>
          </TabsList>

          <TabsContent value="posts" className="mt-6">
            {posts.length === 0 ? (
              <EmptyState 
                text="Noch keine Posts in dieser Gruppe" 
                icon="💬"
              />
            ) : (
              <div className="space-y-4">
                {posts.map((post) => (
                  <Card key={post.id}>
                    <CardHeader>
                      <CardTitle className="text-lg">{post.title}</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <p className="text-muted-foreground">{post.body}</p>
                      <div className="mt-4 text-xs text-muted-foreground">
                        {new Date(post.created_at).toLocaleDateString('de-DE')}
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </TabsContent>

          <TabsContent value="questions" className="mt-6">
            {questions.length === 0 ? (
              <EmptyState 
                text="Noch keine Fragen in dieser Gruppe" 
                icon="❓"
              />
            ) : (
              <div className="space-y-4">
                {questions.map((question) => (
                  <Card key={question.id}>
                    <CardHeader>
                      <CardTitle className="text-lg">{question.title}</CardTitle>
                      <div className="flex items-center gap-2">
                        <Badge 
                          variant={question.status === 'answered' ? 'default' : 'secondary'}
                        >
                          {question.status === 'open' ? 'Offen' :
                           question.status === 'answered' ? 'Beantwortet' :
                           question.status === 'solved' ? 'Gelöst' : 'Veraltet'}
                        </Badge>
                      </div>
                    </CardHeader>
                    <CardContent>
                      {question.body && (
                        <p className="text-muted-foreground mb-3">{question.body}</p>
                      )}
                      <div className="text-xs text-muted-foreground">
                        {new Date(question.created_at).toLocaleDateString('de-DE')}
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </TabsContent>

          <TabsContent value="files" className="mt-6">
            {files.length === 0 ? (
              <EmptyState 
                text="Noch keine Dateien in dieser Gruppe" 
                icon="📁"
              />
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
                            {(file as any).uploader?.display_name || 'Unbekannt'}
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
          </TabsContent>

          <TabsContent value="members" className="mt-6">
            <div className="space-y-4">
              {group.group_members?.map((member: any) => (
                <Card key={member.user_id}>
                  <CardContent className="p-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <h3 className="font-medium">Mitglied</h3>
                        <p className="text-sm text-muted-foreground">
                          Beigetreten: {new Date(member.joined_at).toLocaleDateString('de-DE')}
                        </p>
                      </div>
                      <Badge variant={member.role === 'owner' ? 'default' : 'secondary'}>
                        {member.role === 'owner' ? 'Besitzer' :
                         member.role === 'moderator' ? 'Moderator' : 'Mitglied'}
                      </Badge>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>
        </Tabs>
      ) : (
        <Card>
          <CardContent className="p-8 text-center">
            <h3 className="text-lg font-semibold mb-2">Gruppe beitreten erforderlich</h3>
            <p className="text-muted-foreground mb-4">
              Du musst der Gruppe beitreten, um Inhalte zu sehen.
            </p>
            <Button onClick={handleJoinGroup} disabled={joinGroup.isPending}>
              <UserPlus className="h-4 w-4 mr-2" />
              {joinGroup.isPending ? 'Beitritt...' : 'Jetzt beitreten'}
            </Button>
          </CardContent>
        </Card>
      )}
    </div>
  );
}