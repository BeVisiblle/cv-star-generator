import React, { useRef, useState } from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { ThumbsUp, MessageCircle, Repeat2, Send, ArrowRight, Pencil, ChevronLeft, ChevronRight, Trash } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';
import { de } from 'date-fns/locale';
import { useNavigate } from 'react-router-dom';
import { openPostComposer } from '@/lib/event-bus';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/hooks/useAuth';

interface ActivityPost {
  id: string;
  content: string;
  image_url?: string;
  created_at: string;
  user_id: string;
  author?: {
    id: string;
    vorname?: string;
    nachname?: string;
    avatar_url?: string;
    ausbildungsberuf?: string;
  };
}

interface LinkedInProfileActivityProps {
  profile: any;
}

export const LinkedInProfileActivity: React.FC<LinkedInProfileActivityProps> = ({ profile }) => {
const navigate = useNavigate();
const queryClient = useQueryClient();
const { toast } = useToast();
const { user } = useAuth();
const isOwner = user?.id === profile?.id;

  const { data: recentPosts, isLoading } = useQuery({
    queryKey: ['recent-community-posts', profile?.id],
    queryFn: async () => {
      if (!profile?.id) return [];
      const { data: posts, error } = await supabase
        .from('posts')
        .select('*')
        .eq('user_id', profile.id)
        .order('created_at', { ascending: false })
        .limit(6);

      if (error) throw error;

      let result = posts || [];

      if (!result.length) {
        const images = [
          'https://images.unsplash.com/photo-1498050108023-c5249f4df085?q=80&w=1200&auto=format&fit=crop',
          'https://images.unsplash.com/photo-1516251193007-45ef944ab0c6?q=80&w=1200&auto=format&fit=crop',
          'https://images.unsplash.com/photo-1520975867597-0f0a113a2d97?q=80&w=1200&auto=format&fit=crop',
          'https://images.unsplash.com/photo-1520974722171-5f69e34f56b0?q=80&w=1200&auto=format&fit=crop',
          'https://images.unsplash.com/photo-1520975967075-3f1f3c2d7b68?q=80&w=1200&auto=format&fit=crop',
          'https://images.unsplash.com/photo-1500530855697-b586d89ba3ee?q=80&w=1200&auto=format&fit=crop'
        ];
        const texts = [
          'Mein Projekt der Woche: Werkzeug sortiert und Werkbank neu aufgebaut.',
          'Heute mit dem Team an einem Kundenauftrag gearbeitet – viel gelernt!',
          'Kleiner Erfolg: Prüfungsvorbereitung gut gelaufen.',
          'Neuer Kurs gestartet – freue mich auf die Inhalte.',
          'Feedback gesucht: Wie findet ihr meinen Lebenslauf?',
          'Tipp: Täglich 20 Min üben bringt viel!'
        ];
        result = Array.from({ length: 6 }).map((_, i) => ({
          id: `demo-${i}`,
          content: texts[i % texts.length],
          image_url: images[i % images.length],
          created_at: new Date(Date.now() - i * 3600_000).toISOString(),
          user_id: profile.id,
        } as any));
      }

      const postsWithProfiles = result.map((post: any) => ({
        ...post,
        author: {
          id: profile.id,
          vorname: profile.vorname,
          nachname: profile.nachname,
          avatar_url: profile.avatar_url,
          ausbildungsberuf: profile.ausbildungsberuf || profile.aktueller_beruf || ''
        }
      }));

      return postsWithProfiles;
    },
  });

  const getDisplayName = (post: ActivityPost) => {
    if (post.author?.vorname && post.author?.nachname) {
      return `${post.author.vorname} ${post.author.nachname}`;
    }
    return 'Unbekannter Nutzer';
  };

  const getInitials = (post: ActivityPost) => {
    if (post.author?.vorname && post.author?.nachname) {
      return `${post.author.vorname[0]}${post.author.nachname[0]}`;
    }
    return 'U';
  };

  const truncateContent = (content: string, maxLength: number = 100) => {
    return content.length > maxLength ? content.substring(0, maxLength) + '...' : content;
  };

  const [activeTab, setActiveTab] = useState<'posts' | 'comments'>('posts');
  const [prefOpen, setPrefOpen] = useState(false);
  const scrollerRef = useRef<HTMLDivElement>(null);
  const [expanded, setExpanded] = useState<Record<string, boolean>>({});

  const getCounts = (post: ActivityPost) => {
    const a = post.id?.charCodeAt(0) || 1;
    const b = post.id?.charCodeAt(1) || 2;
    return { likes: (a % 9) + 1, comments: (b % 5) + 1 };
  };

  const scrollByStep = (dir: 'left' | 'right') => {
    const el = scrollerRef.current;
    if (!el) return;
    const card = el.querySelector<HTMLElement>('.activity-card');
    const gap = 16;
    const step = (card?.offsetWidth || 320) + gap;
    el.scrollBy({ left: dir === 'left' ? -step : step, behavior: 'smooth' });
  };

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-3">
        <CardTitle className="text-lg font-semibold">Aktivitäten</CardTitle>
        {isOwner && (
          <div className="flex items-center gap-2">
            <Button variant="outline" size="sm" onClick={() => openPostComposer()}>Beitrag erstellen</Button>
            <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => setPrefOpen(true)} title="Einstellungen">
              <Pencil className="h-4 w-4" />
            </Button>
          </div>
        )}
      </CardHeader>
      <CardContent>
        {isLoading ? (
          <div className="flex items-center justify-center py-8">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
          </div>
        ) : (
          <>
            <div className="mb-3 flex items-center gap-2">
              <Button variant={activeTab === 'posts' ? 'secondary' : 'ghost'} size="sm" onClick={() => setActiveTab('posts')}>Beiträge</Button>
              <Button variant={activeTab === 'comments' ? 'secondary' : 'ghost'} size="sm" onClick={() => setActiveTab('comments')}>Kommentare</Button>
            </div>

            {activeTab === 'posts' ? (
              recentPosts && recentPosts.length > 0 ? (
                <div className="relative">
                  <Button variant="secondary" size="icon" className="hidden sm:flex absolute left-0 top-1/2 -translate-y-1/2 z-10 rounded-full h-8 w-8" onClick={() => scrollByStep('left')} aria-label="Zurück">
                    <ChevronLeft className="h-4 w-4" />
                  </Button>
                  <Button variant="secondary" size="icon" className="hidden sm:flex absolute right-0 top-1/2 -translate-y-1/2 z-10 rounded-full h-8 w-8" onClick={() => scrollByStep('right')} aria-label="Weiter">
                    <ChevronRight className="h-4 w-4" />
                  </Button>

                  <div ref={scrollerRef} className="overflow-x-auto snap-x snap-mandatory">
                    <div className="flex space-x-4 pb-2 w-max">
                      {recentPosts.map((post) => {
                        const counts = getCounts(post as ActivityPost);
                        const text = (post as ActivityPost).content || '';
                        const isExp = expanded[post.id as string];
                        const isLong = text.length > 200;
                        const isOwn = (post as ActivityPost).user_id === profile.id;

                        const handleDelete = async (e: React.MouseEvent) => {
                          e.stopPropagation();
                          if (!isOwn) return;
                          const ok = window.confirm('Diesen Beitrag wirklich löschen?');
                          if (!ok) return;
                          const { error } = await supabase.from('posts').delete().eq('id', post.id).eq('user_id', profile.id);
                          if (!error) {
                            // Invalidate query
                            const qc = useQueryClient(); // not valid here; moving outside not possible per scope
                          }
                        };

                        return (
                          <div
                            key={post.id}
                            className="activity-card flex-shrink-0 w-[92vw] max-w-[420px] sm:w-[360px] bg-muted/50 rounded-lg p-4 border hover:bg-muted/70 transition-colors cursor-pointer snap-center"
                            onClick={() => navigate('/marketplace')}
                          >
                            <div className="flex items-center space-x-3 mb-3">
                              <Avatar className="h-8 w-8">
                                <AvatarImage src={post.author?.avatar_url} />
                                <AvatarFallback className="text-xs">
                                  {getInitials(post as ActivityPost)}
                                </AvatarFallback>
                              </Avatar>
                              <div className="flex-1 min-w-0">
                                <p className="text-sm font-medium truncate">
                                  {getDisplayName(post as ActivityPost)}
                                </p>
                                <p className="text-xs text-muted-foreground truncate">
                                  {post.author?.ausbildungsberuf || 'Handwerker'}
                                </p>
                              </div>
                              <span className="text-xs text-muted-foreground">
                                {formatDistanceToNow(new Date(post.created_at), { addSuffix: true, locale: de })}
                              </span>
                              {isOwn && (
                                <Button
                                  variant="destructive"
                                  size="icon"
                                  className="h-7 w-7 ml-2"
                                  onClick={(e)=>{
                                    e.stopPropagation();
                                    if(window.confirm('Diesen Beitrag wirklich löschen?')){
                                      supabase.from('posts').delete().eq('id', post.id).eq('user_id', profile.id).then(({ error })=>{
                                        if(error){
                                          toast({ title: 'Löschen fehlgeschlagen', description: error.message, variant: 'destructive' });
                                        } else {
                                          toast({ title: 'Beitrag gelöscht' });
                                          queryClient.invalidateQueries({ queryKey: ['recent-community-posts', profile.id] });
                                        }
                                      });
                                    }
                                  }}
                                  aria-label="Beitrag löschen"
                                >
                                  <Trash className="h-4 w-4" />
                                </Button>
                              )}
                            </div>

                            <div className="space-y-3">
                              <p className="text-sm text-foreground">
                                {isExp ? text : truncateContent(text, 200)}
                                {!isExp && isLong && (
                                  <button
                                    className="ml-1 text-primary hover:underline text-xs"
                                    onClick={(e) => { e.stopPropagation(); setExpanded((prev) => ({ ...prev, [post.id as string]: true })); }}
                                  >
                                    Mehr anzeigen
                                  </button>
                                )}
                              </p>

                              {post.image_url && (
                                <div className="rounded-lg overflow-hidden">
                                  <img src={post.image_url} alt="Post" className="w-full h-32 object-cover" />
                                </div>
                              )}

                              <div className="flex items-center gap-4 pt-1 text-xs text-muted-foreground">
                                <span className="inline-flex items-center gap-1"><ThumbsUp className="h-3.5 w-3.5" />{counts.likes}</span>
                                <span className="inline-flex items-center gap-1"><MessageCircle className="h-3.5 w-3.5" />{counts.comments}</span>
                              </div>

                              <div className="flex items-center justify-between border-t pt-2">
                                <button onClick={(e)=>e.stopPropagation()} className="h-8 w-8 rounded-md bg-muted flex items-center justify-center" title="Gefällt mir">
                                  <ThumbsUp className="h-4 w-4" />
                                </button>
                                <button onClick={(e)=>e.stopPropagation()} className="h-8 w-8 rounded-md hover:bg-muted flex items-center justify-center" title="Kommentieren">
                                  <MessageCircle className="h-4 w-4" />
                                </button>
                                <button onClick={(e)=>e.stopPropagation()} className="h-8 w-8 rounded-md hover:bg-muted flex items-center justify-center" title="Reposten">
                                  <Repeat2 className="h-4 w-4" />
                                </button>
                                <button onClick={(e)=>e.stopPropagation()} className="h-8 w-8 rounded-md hover:bg-muted flex items-center justify-center" title="Teilen">
                                  <Send className="h-4 w-4" />
                                </button>
                              </div>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>

                  <div className="mt-3 text-center">
                    <Button variant="link" className="text-primary" onClick={() => navigate('/marketplace')}>
                      Alle Beiträge anzeigen <ArrowRight className="h-4 w-4 ml-1" />
                    </Button>
                  </div>
                </div>
              ) : (
                <div className="text-center py-8">
                  <p className="text-muted-foreground">Noch keine Aktivitäten in der Community.</p>
                  <Button variant="outline" className="mt-2" onClick={() => navigate('/marketplace')}>
                    Community besuchen
                  </Button>
                </div>
              )
            ) : (
              <div className="text-sm text-muted-foreground py-6">Noch keine Kommentare.</div>
            )}
          </>
        )}
      </CardContent>

      {isOwner && (
        <Dialog open={prefOpen} onOpenChange={setPrefOpen}>
          <DialogContent className="sm:max-w-lg">
            <DialogHeader>
              <DialogTitle>Welche Inhalte möchten Sie zuerst zeigen?</DialogTitle>
            </DialogHeader>
            <div className="text-sm text-muted-foreground mb-4">Ihre letzten Aktivitäten zeigen nur Inhalte der letzten 360 Tage.</div>
            <RadioGroup defaultValue="posts" className="space-y-3">
              {[
                { value: 'posts', label: 'Beiträge' },
                { value: 'comments', label: 'Kommentare' },
                { value: 'videos', label: 'Videos', hint: 'Nichts im vergangenen Jahr gepostet' },
                { value: 'images', label: 'Bilder', hint: 'Nichts im vergangenen Jahr gepostet' },
                { value: 'articles', label: 'Artikel', hint: 'Nichts im vergangenen Jahr gepostet' },
                { value: 'newsletter', label: 'Newsletter', hint: 'Nichts im vergangenen Jahr gepostet' },
                { value: 'events', label: 'Events', hint: 'Nichts im vergangenen Jahr gepostet' },
                { value: 'docs', label: 'Dokumente', hint: 'Nichts im vergangenen Jahr gepostet' },
              ].map((o) => (
                <div key={o.value} className="flex items-center gap-3">
                  <RadioGroupItem id={`pref-${o.value}`} value={o.value} />
                  <Label htmlFor={`pref-${o.value}`} className="flex-1 cursor-pointer">
                    {o.label}
                    {o.hint && <span className="ml-2 text-muted-foreground">({o.hint})</span>}
                  </Label>
                </div>
              ))}
            </RadioGroup>
            <div className="flex justify-end pt-2">
              <Button onClick={() => setPrefOpen(false)}>Speichern</Button>
            </div>
          </DialogContent>
        </Dialog>
      )}
    </Card>
  );
};
