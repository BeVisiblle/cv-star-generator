import React, { useState, useRef } from 'react';
import { Camera, Edit3 } from 'lucide-react';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/integrations/supabase/client';
import { toast } from '@/hooks/use-toast';

interface LinkedInProfileHeaderProps {
  profile: any;
  isEditing: boolean;
  onProfileUpdate: (updates: any) => void;
}

export const LinkedInProfileHeader: React.FC<LinkedInProfileHeaderProps> = ({
  profile,
  isEditing,
  onProfileUpdate
}) => {
  const [isUploadingCover, setIsUploadingCover] = useState(false);
  const [isUploadingAvatar, setIsUploadingAvatar] = useState(false);
  const [headline, setHeadline] = useState(profile?.headline || '');
  const coverInputRef = useRef<HTMLInputElement>(null);
  const avatarInputRef = useRef<HTMLInputElement>(null);

  const handleCoverUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file || !profile?.id) return;

    setIsUploadingCover(true);
    try {
      // For now, just store as base64 or implement proper storage bucket
      const reader = new FileReader();
      reader.onload = (e) => {
        const result = e.target?.result as string;
        onProfileUpdate({ cover_url: result });
        toast({
          title: "Titelbild hochgeladen",
          description: "Ihr Titelbild wurde erfolgreich aktualisiert."
        });
        setIsUploadingCover(false);
      };
      reader.onerror = () => {
        toast({
          title: "Upload fehlgeschlagen",
          description: "Das Titelbild konnte nicht hochgeladen werden.",
          variant: "destructive"
        });
        setIsUploadingCover(false);
      };
      reader.readAsDataURL(file);
    } catch (error) {
      toast({
        title: "Upload fehlgeschlagen",
        description: "Das Titelbild konnte nicht hochgeladen werden.",
        variant: "destructive"
      });
      setIsUploadingCover(false);
    }
  };

  const handleAvatarUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file || !profile?.id) return;

    setIsUploadingAvatar(true);
    try {
      // For now, just store as base64 - similar to how CVStep2 handles it
      const reader = new FileReader();
      reader.onload = (e) => {
        const result = e.target?.result as string;
        onProfileUpdate({ avatar_url: result });
        toast({
          title: "Profilbild hochgeladen",  
          description: "Ihr Profilbild wurde erfolgreich aktualisiert."
        });
        setIsUploadingAvatar(false);
      };
      reader.onerror = () => {
        toast({
          title: "Upload fehlgeschlagen",
          description: "Das Profilbild konnte nicht hochgeladen werden.",
          variant: "destructive"
        });
        setIsUploadingAvatar(false);
      };
      reader.readAsDataURL(file);
    } catch (error) {
      toast({
        title: "Upload fehlgeschlagen", 
        description: "Das Profilbild konnte nicht hochgeladen werden.",
        variant: "destructive"
      });
      setIsUploadingAvatar(false);
    }
  };

  const handleHeadlineUpdate = () => {
    onProfileUpdate({ headline });
  };

  return (
    <div className="relative bg-card rounded-xl overflow-hidden shadow-sm border">
      {/* Cover Photo */}
      <div className="relative h-48 bg-gradient-to-r from-primary/20 to-accent/30">
        {profile?.cover_url ? (
          <img 
            src={profile.cover_url} 
            alt="Cover" 
            className="w-full h-full object-cover"
          />
        ) : (
          <div className="w-full h-full bg-gradient-to-r from-primary/10 to-accent/20" />
        )}
        
        {isEditing && (
          <Button
            variant="secondary"
            size="sm"
            className="absolute top-4 right-4 bg-background/80 backdrop-blur-sm"
            onClick={() => coverInputRef.current?.click()}
            disabled={isUploadingCover}
          >
            <Camera className="h-4 w-4 mr-2" />
            Cover
          </Button>
        )}
        
        <input
          ref={coverInputRef}
          type="file"
          accept="image/*"
          className="hidden"
          onChange={handleCoverUpload}
        />
      </div>

      {/* Profile Info */}
      <div className="px-6 pb-6">
        {/* Avatar */}
        <div className="relative -mt-16 mb-4">
          <div className="relative inline-block">
            <Avatar className="w-32 h-32 border-4 border-background shadow-lg">
              <AvatarImage src={profile?.avatar_url} alt="Profile" />
              <AvatarFallback className="text-2xl font-bold bg-primary/10">
                {profile?.vorname?.[0]}{profile?.nachname?.[0]}
              </AvatarFallback>
            </Avatar>
            
            {isEditing && (
              <Button
                variant="secondary"
                size="sm"
                className="absolute bottom-2 right-2 rounded-full w-8 h-8 p-0"
                onClick={() => avatarInputRef.current?.click()}
                disabled={isUploadingAvatar}
              >
                <Camera className="h-4 w-4" />
              </Button>
            )}
          </div>
          
          <input
            ref={avatarInputRef}
            type="file"
            accept="image/*"
            className="hidden"
            onChange={handleAvatarUpload}
          />
        </div>

        {/* Name and Headline */}
        <div className="space-y-2">
          <h1 className="text-3xl font-bold text-foreground">
            {profile?.vorname} {profile?.nachname}
          </h1>
          
          {isEditing ? (
            <div className="flex items-center gap-2">
              <Input
                value={headline}
                onChange={(e) => setHeadline(e.target.value)}
                placeholder="Add a professional headline..."
                className="text-lg font-medium"
                onBlur={handleHeadlineUpdate}
              />
              <Edit3 className="h-4 w-4 text-muted-foreground" />
            </div>
          ) : (
            <p className="text-lg font-medium text-muted-foreground">
              {headline || 'Professional seeking opportunities'}
            </p>
          )}
          
          <p className="text-muted-foreground">
            {profile?.ort && `${profile.ort}${profile?.plz ? ` • ${profile.plz}` : ''}`}
          </p>
        </div>
      </div>
    </div>
  );
};