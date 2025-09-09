import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { FileText, BarChart3, Calendar } from 'lucide-react';
import { useTranslation } from '@/lib/i18n';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { PollComposer } from './PollComposer';
import { EventComposer } from './EventComposer';
import { useComposerGuard } from './ComposerProvider';
import AttachmentUploader from '@/components/upload/AttachmentUploader';
import FilePreview from '@/components/upload/FilePreview';
import { UploadedAttachment, saveAttachmentToDatabase, linkAttachmentToPost } from '@/lib/uploads';

interface FeedComposerProps {
  onPostCreated?: () => void;
  onPollCreated?: (pollId: string) => void;
  onEventCreated?: (eventId: string) => void;
}

export function FeedComposer({ onPostCreated, onPollCreated, onEventCreated }: FeedComposerProps) {
  const { t } = useTranslation();
  const { user } = useAuth();
  const { canRender } = useComposerGuard('main-composer');
  const [activeTab, setActiveTab] = useState<'post' | 'poll' | 'event'>('post');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [postContent, setPostContent] = useState('');
  const [attachments, setAttachments] = useState<UploadedAttachment[]>([]);

  if (!canRender) return null;

  const handlePostSubmit = async () => {
    if (!user) return;

    if (!postContent.trim() && attachments.length === 0) {
      toast.error('Bitte gib einen Inhalt ein oder füge Dateien hinzu');
      return;
    }

    setIsSubmitting(true);

    try {
      // Create post
      const { data: postData, error: postError } = await supabase
        .from('posts')
        .insert({
          content: postContent,
          post_type: 'text',
          author_id: user.id,
          author_type: 'user',
          status: 'published',
          visibility: 'CommunityAndCompanies',
          published_at: new Date().toISOString(),
        })
        .select()
        .single();

      if (postError) throw postError;

      // Save attachments to database and link to post
      if (attachments.length > 0) {
        for (const attachment of attachments) {
          await saveAttachmentToDatabase(attachment, user.id);
          await linkAttachmentToPost(attachment.id, postData.id);
        }
      }

      toast.success('Beitrag erfolgreich erstellt!');
      setPostContent('');
      setAttachments([]);
      onPostCreated?.();

    } catch (error: any) {
      console.error('Error creating post:', error);
      toast.error('Fehler beim Erstellen des Beitrags: ' + error.message);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleAttachmentUpload = (newAttachments: UploadedAttachment[]) => {
    setAttachments(prev => [...prev, ...newAttachments]);
  };

  const canSubmit = () => {
    return postContent.trim().length > 0 || attachments.length > 0;
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <FileText className="h-5 w-5" />
          Neuen Inhalt erstellen
        </CardTitle>
      </CardHeader>
      <CardContent>
        <Tabs value={activeTab} onValueChange={(value) => setActiveTab(value as any)}>
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="post" className="flex items-center gap-2">
              <FileText className="h-4 w-4" />
              {t('feed.composer.tab_post')}
            </TabsTrigger>
            <TabsTrigger value="poll" className="flex items-center gap-2">
              <BarChart3 className="h-4 w-4" />
              {t('feed.composer.tab_poll')}
            </TabsTrigger>
            <TabsTrigger value="event" className="flex items-center gap-2">
              <Calendar className="h-4 w-4" />
              {t('feed.composer.tab_event')}
            </TabsTrigger>
          </TabsList>

          <TabsContent value="post" className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="post-content">Beitrag</Label>
              <Textarea
                id="post-content"
                placeholder={t('feed.composer.placeholder')}
                value={postContent}
                onChange={(e) => setPostContent(e.target.value)}
                className="min-h-[100px]"
              />
            </div>
            
            <AttachmentUploader 
              onUploaded={handleAttachmentUpload}
              maxFiles={6}
            />
            
            {attachments.length > 0 && (
              <FilePreview files={attachments} />
            )}
            
            <div className="flex justify-end">
              <Button
                onClick={handlePostSubmit}
                disabled={!canSubmit() || isSubmitting}
                className="min-w-[100px]"
              >
                {isSubmitting ? 'Erstelle...' : t('feed.composer.post')}
              </Button>
            </div>
          </TabsContent>

          <TabsContent value="poll" className="space-y-4">
            <PollComposer onPollCreated={onPollCreated} />
          </TabsContent>

          <TabsContent value="event" className="space-y-4">
            <EventComposer onEventCreated={onEventCreated} />
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  );
}