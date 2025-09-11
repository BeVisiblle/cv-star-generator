import React, { useState } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Globe, Users, UserCheck, Send, Loader2, Image } from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';
import { useCreateCommunityPost } from '@/hooks/useCommunityPosts';
import AttachmentUploader from '@/components/upload/AttachmentUploader';
import { UploadedAttachment } from '@/lib/uploads';

type PostVisibility = "public" | "followers" | "connections";

const visibilityOptions = [
  { value: "public" as const, label: "Öffentlich", icon: Globe, description: "Für alle sichtbar" },
  { value: "followers" as const, label: "Nur Follower", icon: Users, description: "Nur für Ihre Follower" },
  { value: "connections" as const, label: "Nur Verbindungen", icon: UserCheck, description: "Nur für Ihre Verbindungen" },
];

export const CommunityComposer = () => {
  const { user, profile } = useAuth();
  const createPost = useCreateCommunityPost();
  const [content, setContent] = useState('');
  const [visibility, setVisibility] = useState<PostVisibility>('public');
  const [attachments, setAttachments] = useState<UploadedAttachment[]>([]);

  if (!user) return null;

  const handleSubmit = async () => {
    if (!content.trim() && attachments.length === 0) return;

    try {
      await createPost.mutateAsync({
        post_kind: attachments.length > 0 ? 'media' : 'text',
        body_md: content.trim(),
        visibility,
        media: attachments.map(att => ({
          type: att.mime_type.startsWith('image/') ? 'image' : 'document',
          url: att.url,
          filename: att.storage_path.split('/').pop(),
          size: att.size_bytes
        }))
      });

      setContent('');
      setAttachments([]);
    } catch (error) {
      console.error('Error creating post:', error);
    }
  };

  const selectedOption = visibilityOptions.find(opt => opt.value === visibility)!;
  const Icon = selectedOption.icon;

  const displayName = profile?.vorname 
    ? `${profile.vorname} ${profile.nachname || ''}`.trim() 
    : user?.email || 'Nutzer';

  const avatarUrl = profile?.avatar_url;
  const initials = profile?.vorname 
    ? `${profile.vorname[0]}${profile.nachname?.[0] || ''}` 
    : user?.email?.[0] || 'N';

  return (
    <Card className="p-4 space-y-4">
      <div className="flex items-start space-x-3">
        <Avatar className="h-10 w-10">
          <AvatarImage src={avatarUrl} alt={displayName} />
          <AvatarFallback>
            {initials}
          </AvatarFallback>
        </Avatar>
        
        <div className="flex-1 space-y-3">
          <Textarea
            placeholder="Was gibt's Neues?"
            value={content}
            onChange={(e) => setContent(e.target.value)}
            className="min-h-[120px] resize-none border-0 p-0 shadow-none focus-visible:ring-0"
            maxLength={5000}
          />
          
          <AttachmentUploader
            maxFiles={4}
            accept="image/*,application/pdf"
            onUploaded={setAttachments}
            className="w-full"
          />
          
          <div className="flex items-center justify-between">
            <Select value={visibility} onValueChange={(value: PostVisibility) => setVisibility(value)}>
              <SelectTrigger className="w-auto">
                <div className="flex items-center space-x-2">
                  <Icon className="h-4 w-4" />
                  <SelectValue />
                </div>
              </SelectTrigger>
              <SelectContent>
                {visibilityOptions.map((option) => (
                  <SelectItem key={option.value} value={option.value}>
                    <div className="flex items-center space-x-2">
                      <option.icon className="h-4 w-4" />
                      <div>
                        <div className="font-medium">{option.label}</div>
                        <div className="text-xs text-muted-foreground">{option.description}</div>
                      </div>
                    </div>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            <Button 
              onClick={handleSubmit}
              disabled={(!content.trim() && attachments.length === 0) || createPost.isPending}
              size="sm"
            >
              {createPost.isPending ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <>
                  <Send className="h-4 w-4 mr-2" />
                  Posten
                </>
              )}
            </Button>
          </div>
        </div>
      </div>
    </Card>
  );
};