import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Card } from '@/components/ui/card';
import { ImageIcon, Video, FileText, Calendar, X } from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';
import { useCreateLinkedInPost } from '@/hooks/useLinkedInFeed';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';

interface LinkedInPostComposerProps {
  onPostCreated?: () => void;
}

export default function LinkedInPostComposer({ onPostCreated }: LinkedInPostComposerProps) {
  const [content, setContent] = useState('');
  const [isOpen, setIsOpen] = useState(false);
  const { user } = useAuth();
  const createPost = useCreateLinkedInPost();

  const handleSubmit = async () => {
    if (!content.trim()) return;

    try {
      await createPost.mutateAsync({
        body: content.trim(),
        visibility: 'public'
      });
      
      setContent('');
      setIsOpen(false);
      onPostCreated?.();
    } catch (error) {
      console.error('Failed to create post:', error);
    }
  };

  const getUserName = () => {
    if ((user as any)?.vorname && (user as any)?.nachname) {
      return `${(user as any).vorname} ${(user as any).nachname}`;
    }
    return user?.email?.split('@')[0] || 'Du';
  };

  const getInitials = () => {
    if ((user as any)?.vorname && (user as any)?.nachname) {
      return `${(user as any).vorname[0]}${(user as any).nachname[0]}`;
    }
    return user?.email?.[0]?.toUpperCase() || 'D';
  };

  if (!user) {
    return null;
  }

  return (
    <Card className="p-4">
      <div className="flex gap-3 items-start">
        <Avatar className="h-10 w-10">
          <AvatarImage 
            src={(user as any)?.avatar_url || undefined} 
            alt={getUserName()} 
          />
          <AvatarFallback>{getInitials()}</AvatarFallback>
        </Avatar>
        
        <Dialog open={isOpen} onOpenChange={setIsOpen}>
          <DialogTrigger asChild>
            <button className="flex-1 text-left px-4 py-3 border border-input rounded-full text-muted-foreground hover:bg-muted transition-colors">
              Einen Beitrag beginnen...
            </button>
          </DialogTrigger>
          
          <DialogContent className="sm:max-w-lg">
            <DialogHeader>
              <DialogTitle className="flex items-center justify-between">
                Beitrag erstellen
                <Button 
                  variant="ghost" 
                  size="icon" 
                  onClick={() => setIsOpen(false)}
                  className="h-6 w-6"
                >
                  <X className="h-4 w-4" />
                </Button>
              </DialogTitle>
            </DialogHeader>
            
            <div className="space-y-4">
              {/* Author info */}
              <div className="flex items-center gap-3">
                <Avatar className="h-10 w-10">
                  <AvatarImage 
                    src={(user as any)?.avatar_url || undefined} 
                    alt={getUserName()} 
                  />
                  <AvatarFallback>{getInitials()}</AvatarFallback>
                </Avatar>
                <div>
                  <div className="font-medium">{getUserName()}</div>
                  <div className="text-sm text-muted-foreground">
                    Öffentlich posten
                  </div>
                </div>
              </div>
              
              {/* Content input */}
              <Textarea
                value={content}
                onChange={(e) => setContent(e.target.value)}
                placeholder="Was beschäftigt Sie?"
                className="min-h-[120px] resize-none border-none text-lg placeholder:text-lg focus-visible:ring-0"
                autoFocus
              />
              
              {/* Media options */}
              <div className="flex items-center gap-2 pt-2 border-t">
                <Button variant="ghost" size="sm" className="gap-2">
                  <ImageIcon className="h-4 w-4" />
                  Foto
                </Button>
                <Button variant="ghost" size="sm" className="gap-2">
                  <Video className="h-4 w-4" />
                  Video
                </Button>
                <Button variant="ghost" size="sm" className="gap-2">
                  <FileText className="h-4 w-4" />
                  Dokument
                </Button>
                <Button variant="ghost" size="sm" className="gap-2">
                  <Calendar className="h-4 w-4" />
                  Event
                </Button>
              </div>
              
              {/* Actions */}
              <div className="flex justify-end gap-2 pt-2">
                <Button 
                  variant="outline" 
                  onClick={() => setIsOpen(false)}
                  disabled={createPost.isPending}
                >
                  Abbrechen
                </Button>
                <Button 
                  onClick={handleSubmit}
                  disabled={!content.trim() || createPost.isPending}
                >
                  {createPost.isPending ? 'Wird veröffentlicht...' : 'Posten'}
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      </div>
      
      {/* Quick action buttons */}
      <div className="flex items-center gap-2 mt-3 ml-13">
        <Button variant="ghost" size="sm" className="flex-1 gap-2 text-primary">
          <ImageIcon className="h-4 w-4" />
          Foto
        </Button>
        <Button variant="ghost" size="sm" className="flex-1 gap-2 text-primary">
          <Video className="h-4 w-4" />
          Video
        </Button>
        <Button variant="ghost" size="sm" className="flex-1 gap-2 text-primary">
          <Calendar className="h-4 w-4" />
          Event
        </Button>
        <Button variant="ghost" size="sm" className="flex-1 gap-2 text-primary">
          <FileText className="h-4 w-4" />
          Artikel
        </Button>
      </div>
    </Card>
  );
}