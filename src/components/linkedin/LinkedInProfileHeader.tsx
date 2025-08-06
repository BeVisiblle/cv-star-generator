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
    if (!file) return;

    setIsUploadingCover(true);
    try {
      // Upload to Supabase Storage and update profile
      const { uploadCoverImage } = await import('@/lib/supabase-storage');
      
      const uploadResult = await uploadCoverImage(file);
      
      // Update profile in database
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        const { error } = await supabase
          .from('profiles')
          .update({ cover_image_url: uploadResult.url })
          .eq('id', user.id);
          
        if (!error) {
          onProfileUpdate({ cover_image_url: uploadResult.url });
          toast({
            title: "Titelbild hochgeladen",
            description: "Ihr Titelbild wurde erfolgreich aktualisiert."
          });
        }
      }
    } catch (error) {
      console.error('Error uploading cover:', error);
      // Fallback to base64 if Supabase upload fails
      const reader = new FileReader();
      reader.onload = (e) => {
        const result = e.target?.result as string;
        onProfileUpdate({ cover_image_url: result });
        toast({
          title: "Titelbild hochgeladen",
          description: "Ihr Titelbild wurde erfolgreich aktualisiert."
        });
      };
      reader.readAsDataURL(file);
    } finally {
      setIsUploadingCover(false);
    }
  };

  const handleAvatarUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    setIsUploadingAvatar(true);
    try {
      // Upload to Supabase Storage and update profile
      const { uploadProfileImage } = await import('@/lib/supabase-storage');
      
      const uploadResult = await uploadProfileImage(file);
      
      // Update profile in database
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        const { error } = await supabase
          .from('profiles')
          .update({ avatar_url: uploadResult.url })
          .eq('id', user.id);
          
        if (!error) {
          onProfileUpdate({ avatar_url: uploadResult.url });
          toast({
            title: "Profilbild hochgeladen",  
            description: "Ihr Profilbild wurde erfolgreich aktualisiert."
          });
        }
      }
    } catch (error) {
      console.error('Error uploading avatar:', error);
      // Fallback to base64 if Supabase upload fails
      const reader = new FileReader();
      reader.onload = (e) => {
        const result = e.target?.result as string;
        onProfileUpdate({ avatar_url: result });
        toast({
          title: "Profilbild hochgeladen",  
          description: "Ihr Profilbild wurde erfolgreich aktualisiert."
        });
      };
      reader.readAsDataURL(file);
    } finally {
      setIsUploadingAvatar(false);
    }
  };

  const handleHeadlineUpdate = () => {
    onProfileUpdate({ headline });
  };

  const getStatusDescription = (profile: any) => {
    if (!profile.status) return '';
    
    const currentYear = new Date().getFullYear();
    
    switch (profile.status) {
      case 'schueler':
        const schoolName = profile.schulbildung?.[0]?.institution || 'Schule';
        const graduationYear = profile.schulbildung?.[0]?.bis ? 
          new Date(profile.schulbildung[0].bis).getFullYear() : currentYear + 1;
        return `Abitur an der ${schoolName}, Abschluss voraussichtlich ${graduationYear}`;
      
      case 'azubi':
        const currentJob = profile.berufserfahrung?.find((job: any) => !job.bis || new Date(job.bis) > new Date());
        if (currentJob) {
          const endDate = currentJob.bis ? new Date(currentJob.bis).getFullYear() : currentYear + 2;
          return `Auszubildender für ${currentJob.position} bei ${currentJob.unternehmen} bis ${endDate}`;
        }
        return 'Auszubildender im Handwerk';
      
      case 'ausgelernt':
        const currentEmployment = profile.berufserfahrung?.find((job: any) => !job.bis || new Date(job.bis) > new Date());
        if (currentEmployment) {
          const startYear = new Date(currentEmployment.von).getFullYear();
          return `Angestellter im Bereich ${currentEmployment.position} bei ${currentEmployment.unternehmen} seit ${startYear}`;
        }
        return 'Angestellter im Handwerk';
      
      default:
        return '';
    }
  };

  return (
    <div className="relative bg-card rounded-xl overflow-hidden shadow-sm border">
      {/* Cover Photo */}
      <div className="relative h-48 bg-gradient-to-r from-primary/20 to-accent/30">
        {profile?.cover_image_url ? (
          <img 
            src={profile.cover_image_url} 
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
          
          {/* Professional Status */}
          {profile?.status && (
            <p className="text-lg font-medium text-primary">
              {getStatusDescription(profile)}
            </p>
          )}
          
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