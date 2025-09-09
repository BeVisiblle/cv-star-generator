import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Sheet, SheetContent, SheetHeader, SheetTitle } from '@/components/ui/sheet';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Card, CardContent } from '@/components/ui/card';
import { Image, Briefcase, Upload, X, MapPin, Euro } from 'lucide-react';
import { useIsMobile } from '@/hooks/use-mobile';
import { useAuth } from '@/hooks/useAuth';
import { useCompany } from '@/hooks/useCompany';
import { useCreateCommunityPost, useShareJobAsPost } from '@/hooks/useCommunityPosts';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';

interface CommunityComposerProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export default function CommunityComposer({ open, onOpenChange }: CommunityComposerProps) {
  const isMobile = useIsMobile();
  const { user } = useAuth();
  const { company } = useCompany();
  
  const [activeTab, setActiveTab] = useState('text');
  const [postAs, setPostAs] = useState<'user' | 'company'>('user');
  const [visibility, setVisibility] = useState<'public' | 'followers' | 'connections' | 'org_only'>('public');
  const [content, setContent] = useState('');
  const [selectedJob, setSelectedJob] = useState<string>('');
  const [customJobMessage, setCustomJobMessage] = useState('');
  const [media, setMedia] = useState<File[]>([]);

  const createPost = useCreateCommunityPost();
  const shareJob = useShareJobAsPost();

  // Fetch company jobs for job sharing
  const { data: companyJobs } = useQuery({
    queryKey: ['company-jobs', company?.id],
    enabled: !!company?.id && postAs === 'company',
    queryFn: async () => {
      const { data, error } = await supabase
        .from('job_posts')
        .select('id, title, city, employment_type, salary_min, salary_max, is_active')
        .eq('company_id', company!.id)
        .eq('is_active', true)
        .order('created_at', { ascending: false });
      
      if (error) throw error;
      return data;
    }
  });

  const canPost = () => {
    if (activeTab === 'text') {
      return content.trim().length > 0;
    }
    if (activeTab === 'job' && postAs === 'company') {
      return selectedJob.length > 0;
    }
    return false;
  };

  const handleSubmit = async () => {
    if (!canPost()) return;

    try {
      if (activeTab === 'job' && selectedJob && company) {
        await shareJob.mutateAsync({
          companyId: company.id,
          jobId: selectedJob,
          visibility,
          customMessage: customJobMessage.trim() || undefined
        });
      } else {
        await createPost.mutateAsync({
          post_kind: activeTab as any,
          actor_user_id: postAs === 'user' ? user?.id : undefined,
          actor_company_id: postAs === 'company' ? company?.id : undefined,
          visibility,
          body_md: content.trim(),
          media: [], // TODO: Handle media uploads
          mentions: []
        });
      }

      // Reset form
      setContent('');
      setSelectedJob('');
      setCustomJobMessage('');
      setMedia([]);
      onOpenChange(false);
    } catch (error) {
      console.error('Error creating post:', error);
    }
  };

  const renderJobPreview = () => {
    if (!selectedJob || !companyJobs) return null;
    
    const job = companyJobs.find(j => j.id === selectedJob);
    if (!job) return null;

    return (
      <Card className="mt-4 border-l-4 border-l-primary">
        <CardContent className="p-4">
          <div className="flex items-start justify-between">
            <div className="flex-1">
              <h4 className="font-semibold text-base">{job.title}</h4>
              <div className="flex items-center gap-2 mt-1 text-sm text-muted-foreground">
                <MapPin className="h-4 w-4" />
                <span>{job.city}</span>
                {job.employment_type && (
                  <>
                    <span>•</span>
                    <Badge variant="secondary" className="text-xs">
                      {job.employment_type}
                    </Badge>
                  </>
                )}
              </div>
              {(job.salary_min || job.salary_max) && (
                <div className="flex items-center gap-1 mt-1 text-sm text-muted-foreground">
                  <Euro className="h-4 w-4" />
                  <span>
                    {job.salary_min && job.salary_max
                      ? `${job.salary_min} - ${job.salary_max} €`
                      : job.salary_min
                      ? `ab ${job.salary_min} €`
                      : `bis ${job.salary_max} €`}
                  </span>
                </div>
              )}
            </div>
            <Badge className="ml-4">
              Jetzt bewerben
            </Badge>
          </div>
        </CardContent>
      </Card>
    );
  };

  const composerContent = (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex items-center gap-3">
        <Avatar className="h-10 w-10">
          <AvatarImage src={postAs === 'company' ? company?.logo_url : user?.user_metadata?.avatar_url} />
          <AvatarFallback>
            {postAs === 'company' 
              ? company?.name?.slice(0, 2).toUpperCase() 
              : user?.user_metadata?.full_name?.slice(0, 2).toUpperCase() || 'U'
            }
          </AvatarFallback>
        </Avatar>
        <div className="flex-1">
          <Select value={postAs} onValueChange={(value: 'user' | 'company') => setPostAs(value)}>
            <SelectTrigger className="w-full">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="user">
                Posten als {user?.user_metadata?.full_name || 'Ich'}
              </SelectItem>
              {company && (
                <SelectItem value="company">
                  Posten als {company.name}
                </SelectItem>
              )}
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Content Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="text">Text</TabsTrigger>
          <TabsTrigger value="media">Medien</TabsTrigger>
          <TabsTrigger value="job" disabled={postAs !== 'company'}>
            Job
          </TabsTrigger>
        </TabsList>

        <TabsContent value="text" className="space-y-4">
          <Textarea
            placeholder="Teile ein Update mit der Community..."
            value={content}
            onChange={(e) => setContent(e.target.value)}
            rows={4}
            maxLength={2000}
          />
          <div className="text-xs text-muted-foreground text-right">
            {content.length}/2000
          </div>
        </TabsContent>

        <TabsContent value="media" className="space-y-4">
          <Textarea
            placeholder="Beschreibe dein Bild oder Video..."
            value={content}
            onChange={(e) => setContent(e.target.value)}
            rows={3}
            maxLength={2000}
          />
          
          <div className="border-2 border-dashed border-muted-foreground/25 rounded-lg p-6">
            <div className="text-center">
              <Upload className="mx-auto h-12 w-12 text-muted-foreground" />
              <div className="mt-4">
                <Button variant="outline" size="sm">
                  <Image className="h-4 w-4 mr-2" />
                  Bild oder Video hochladen
                </Button>
              </div>
              <p className="text-xs text-muted-foreground mt-2">
                JPG, PNG, GIF oder MP4 bis 10 MB
              </p>
            </div>
          </div>
        </TabsContent>

        <TabsContent value="job" className="space-y-4">
          {companyJobs && companyJobs.length > 0 ? (
            <>
              <Select value={selectedJob} onValueChange={setSelectedJob}>
                <SelectTrigger>
                  <SelectValue placeholder="Wähle eine Stellenanzeige" />
                </SelectTrigger>
                <SelectContent>
                  {companyJobs.map((job) => (
                    <SelectItem key={job.id} value={job.id}>
                      {job.title} - {job.city}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>

              {selectedJob && (
                <>
                  {renderJobPreview()}
                  
                  <Textarea
                    placeholder="Optionale Nachricht zum Job (wird automatisch generiert, wenn leer)..."
                    value={customJobMessage}
                    onChange={(e) => setCustomJobMessage(e.target.value)}
                    rows={3}
                    maxLength={500}
                  />
                  
                  <div className="bg-muted/50 rounded-lg p-3">
                    <div className="text-xs text-muted-foreground">
                      <Badge variant="outline" className="mr-2">Rate Limit</Badge>
                      Du kannst jeden Job 1× pro Woche kostenlos teilen.
                    </div>
                  </div>
                </>
              )}
            </>
          ) : (
            <div className="text-center py-8 text-muted-foreground">
              <Briefcase className="mx-auto h-12 w-12 mb-4" />
              <p>Keine aktiven Stellenanzeigen gefunden.</p>
              <Button variant="outline" size="sm" className="mt-2">
                Neue Stelle erstellen
              </Button>
            </div>
          )}
        </TabsContent>
      </Tabs>

      {/* Visibility & Post */}
      <div className="flex items-center justify-between pt-4 border-t">
        <Select value={visibility} onValueChange={(value: any) => setVisibility(value)}>
          <SelectTrigger className="w-[180px]">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="public">🌍 Öffentlich</SelectItem>
            <SelectItem value="followers">👥 Nur Follower</SelectItem>
            <SelectItem value="connections">🤝 Nur Verbindungen</SelectItem>
            {postAs === 'company' && (
              <SelectItem value="org_only">🏢 Nur Unternehmen</SelectItem>
            )}
          </SelectContent>
        </Select>

        <Button 
          onClick={handleSubmit}
          disabled={!canPost() || createPost.isPending || shareJob.isPending}
        >
          {createPost.isPending || shareJob.isPending ? 'Wird gepostet...' : 'Posten'}
        </Button>
      </div>
    </div>
  );

  if (isMobile) {
    return (
      <Sheet open={open} onOpenChange={onOpenChange}>
        <SheetContent side="bottom" className="h-[90vh]">
          <SheetHeader>
            <SheetTitle>Neuen Beitrag erstellen</SheetTitle>
          </SheetHeader>
          <div className="mt-6">
            {composerContent}
          </div>
        </SheetContent>
      </Sheet>
    );
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>Neuen Beitrag erstellen</DialogTitle>
        </DialogHeader>
        {composerContent}
      </DialogContent>
    </Dialog>
  );
}