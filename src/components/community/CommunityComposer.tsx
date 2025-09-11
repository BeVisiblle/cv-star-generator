import React, { useState, useRef } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Globe, Users, UserCheck, Send, Loader2, Image, Video, X } from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';
import { useCreateCommunityPost } from '@/hooks/useCommunityPosts';
import { uploadToSupabase, UploadedAttachment } from '@/lib/uploads';

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
  const [uploading, setUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  if (!user) return null;

  const handleFileSelect = async (files: FileList | null) => {
    if (!files || files.length === 0) return;
    
    setUploading(true);
    try {
      const uploadPromises = Array.from(files).map(file => 
        uploadToSupabase(file, file.type.startsWith('image/') ? 'images' : 'attachments')
      );
      
      const uploaded = await Promise.all(uploadPromises);
      setAttachments(prev => [...prev, ...uploaded]);
    } catch (error) {
      console.error('Error uploading files:', error);
    } finally {
      setUploading(false);
    }
  };

  const removeAttachment = (id: string) => {
    setAttachments(prev => prev.filter(att => att.id !== id));
  };

  const handleSubmit = async () => {
    if (!content.trim() && attachments.length === 0) return;

    try {
      await createPost.mutateAsync({
        post_kind: attachments.length > 0 ? 'media' : 'text',
        body_md: content.trim(),
        visibility,
        media: attachments.map(att => att.url)
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
          
          {/* Attachment previews */}
          {attachments.length > 0 && (
            <div className="grid grid-cols-2 gap-2 mt-3">
              {attachments.map((attachment) => (
                <div key={attachment.id} className="relative group">
                  <img 
                    src={attachment.url} 
                    alt="Upload preview"
                    className="w-full h-32 object-cover rounded-lg"
                  />
                  <button
                    onClick={() => removeAttachment(attachment.id)}
                    className="absolute top-2 right-2 bg-black/50 text-white rounded-full p-1 opacity-0 group-hover:opacity-100 transition-opacity"
                  >
                    <X className="h-4 w-4" />
                  </button>
                </div>
              ))}
            </div>
          )}
          
          <div className="flex items-center justify-between border-t pt-3">
            {/* Bottom bar with media buttons */}
            <div className="flex items-center gap-2">
              <input
                ref={fileInputRef}
                type="file"
                multiple
                accept="image/*,video/*"
                className="hidden"
                onChange={(e) => handleFileSelect(e.target.files)}
              />
              
              <Button
                variant="ghost"
                size="sm"
                onClick={() => fileInputRef.current?.click()}
                disabled={uploading}
                className="text-muted-foreground"
              >
                <Image className="h-4 w-4 mr-1" />
                Foto
              </Button>
              
              <Button
                variant="ghost"
                size="sm"
                onClick={() => fileInputRef.current?.click()}
                disabled={uploading}
                className="text-muted-foreground"
              >
                <Video className="h-4 w-4 mr-1" />
                Video
              </Button>
              
              <Select value={visibility} onValueChange={(value: PostVisibility) => setVisibility(value)}>
                <SelectTrigger className="w-auto border-0 shadow-none">
                  <div className="flex items-center space-x-2">
                    <Icon className="h-4 w-4" />
                    <span className="text-sm">{selectedOption.label}</span>
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
            </div>

            <Button 
              onClick={handleSubmit}
              disabled={(!content.trim() && attachments.length === 0) || createPost.isPending || uploading}
              size="sm"
            >
              {createPost.isPending || uploading ? (
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