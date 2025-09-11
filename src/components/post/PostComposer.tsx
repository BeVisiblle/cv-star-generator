import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Card } from '@/components/ui/card';
import { ImageIcon, Paperclip } from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';
import { useCreateSocialPost } from '@/hooks/useSocialFeed';
import { AttachmentUploader } from '@/components/common/AttachmentUploader';

export function PostComposer() {
  const { user, profile } = useAuth();
  const [content, setContent] = useState('');
  const [attachments, setAttachments] = useState<any[]>([]);
  const [isOpen, setIsOpen] = useState(false);
  const createPost = useCreateSocialPost();

  const getUserName = () => {
    if (profile?.vorname && profile?.nachname) {
      return `${profile.vorname} ${profile.nachname}`;
    }
    return user?.email || 'Unbekannt';
  };

  const getInitials = () => {
    if (profile?.vorname && profile?.nachname) {
      return `${profile.vorname[0]}${profile.nachname[0]}`;
    }
    return user?.email?.[0] || 'U';
  };

  const handleSubmit = async () => {
    if (!content.trim()) return;

    try {
      await createPost.mutateAsync({
        body: content.trim(),
        attachments
      });
      
      setContent('');
      setAttachments([]);
      setIsOpen(false);
    } catch (error) {
      console.error('Error creating post:', error);
    }
  };

  if (!user) return null;

  return (
    <Card className="rounded-2xl border bg-card shadow-sm p-4 mb-6">
      <div className="flex items-center gap-3">
        <Avatar className="h-10 w-10">
          <AvatarImage src={profile?.avatar_url} alt={getUserName()} />
          <AvatarFallback>{getInitials()}</AvatarFallback>
        </Avatar>
        
        <Dialog open={isOpen} onOpenChange={setIsOpen}>
          <DialogTrigger asChild>
            <Button 
              variant="outline" 
              className="flex-1 h-12 rounded-full justify-start text-muted-foreground bg-muted/50"
            >
              Beginne einen Beitrag zu schreiben...
            </Button>
          </DialogTrigger>
          
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>Beitrag erstellen</DialogTitle>
            </DialogHeader>
            
            <div className="space-y-4">
              <div className="flex items-center gap-3">
                <Avatar className="h-10 w-10">
                  <AvatarImage src={profile?.avatar_url} alt={getUserName()} />
                  <AvatarFallback>{getInitials()}</AvatarFallback>
                </Avatar>
                <div>
                  <p className="font-semibold text-sm">{getUserName()}</p>
                  <p className="text-xs text-muted-foreground">{profile?.headline || 'Mitglied'}</p>
                </div>
              </div>
              
              <Textarea
                value={content}
                onChange={(e) => setContent(e.target.value)}
                placeholder="Worüber möchtest du sprechen?"
                className="min-h-32 border-none resize-none text-base focus-visible:ring-0"
                maxLength={3000}
              />
              
              <AttachmentUploader 
                attachments={attachments}
                onAttachmentsChange={setAttachments}
                maxFiles={4}
              />
              
              <div className="flex items-center justify-between pt-4 border-t">
                <div className="flex items-center gap-2">
                  <Button variant="ghost" size="sm" className="text-muted-foreground">
                    <ImageIcon className="h-4 w-4 mr-2" />
                    Medien
                  </Button>
                  <Button variant="ghost" size="sm" className="text-muted-foreground">
                    <Paperclip className="h-4 w-4 mr-2" />
                    Dokument
                  </Button>
                </div>
                
                <Button 
                  onClick={handleSubmit}
                  disabled={!content.trim() || createPost.isPending}
                  className="px-6"
                >
                  {createPost.isPending ? 'Wird veröffentlicht...' : 'Posten'}
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      </div>
      
      <div className="flex items-center gap-4 mt-3 ml-13">
        <Button variant="ghost" size="sm" className="text-primary">
          <ImageIcon className="h-4 w-4 mr-2" />
          Medien
        </Button>
        <Button variant="ghost" size="sm" className="text-primary">
          <Paperclip className="h-4 w-4 mr-2" />
          Dokument
        </Button>
      </div>
    </Card>
  );
}