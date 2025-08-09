import React, { useState, useRef } from 'react';
import { Camera, Edit3, MapPin } from 'lucide-react';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
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
  const [currentPosition, setCurrentPosition] = useState('');
  const coverInputRef = useRef<HTMLInputElement>(null);
  const avatarInputRef = useRef<HTMLInputElement>(null);

  // Get current position from profile data
  React.useEffect(() => {
    const position = getCurrentPosition(profile);
    setCurrentPosition(position);
  }, [profile]);

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

  const handleHeadlineUpdate = async () => {
    await onProfileUpdate({ headline });
  };

  const getCurrentPosition = (profile: any) => {
    if (!profile?.status) return '';
    
    switch (profile.status) {
      case 'schueler':
        return profile.geplanter_abschluss || 'Abitur';
      case 'azubi':
        const currentJob = profile.berufserfahrung?.find((job: any) => !job.bis || new Date(job.bis) > new Date());
        return currentJob?.position || profile.ausbildungsberuf || 'Ausbildung';
      case 'ausgelernt':
        const currentEmployment = profile.berufserfahrung?.find((job: any) => !job.bis || new Date(job.bis) > new Date());
        return currentEmployment?.position || profile.aktueller_beruf || 'Position';
      default:
        return '';
    }
  };

  const updateCurrentPosition = async (newPosition: string) => {
    if (!profile?.status) return;
    
    let updates: any = {};
    
    switch (profile.status) {
      case 'schueler':
        updates.geplanter_abschluss = newPosition;
        // Update schulbildung if exists
        if (profile.schulbildung && profile.schulbildung.length > 0) {
          const updatedSchulbildung = [...profile.schulbildung];
          updatedSchulbildung[0] = { ...updatedSchulbildung[0], abschluss: newPosition };
          updates.schulbildung = updatedSchulbildung;
        }
        break;
        
      case 'azubi':
        updates.ausbildungsberuf = newPosition;
        // Update berufserfahrung if exists
        if (profile.berufserfahrung && profile.berufserfahrung.length > 0) {
          const updatedBerufserfahrung = [...profile.berufserfahrung];
          const currentJobIndex = updatedBerufserfahrung.findIndex((job: any) => !job.bis || new Date(job.bis) > new Date());
          if (currentJobIndex !== -1) {
            updatedBerufserfahrung[currentJobIndex] = { 
              ...updatedBerufserfahrung[currentJobIndex], 
              position: newPosition 
            };
            updates.berufserfahrung = updatedBerufserfahrung;
          }
        }
        break;
        
      case 'ausgelernt':
        updates.aktueller_beruf = newPosition;
        // Update berufserfahrung if exists
        if (profile.berufserfahrung && profile.berufserfahrung.length > 0) {
          const updatedBerufserfahrung = [...profile.berufserfahrung];
          const currentJobIndex = updatedBerufserfahrung.findIndex((job: any) => !job.bis || new Date(job.bis) > new Date());
          if (currentJobIndex !== -1) {
            updatedBerufserfahrung[currentJobIndex] = { 
              ...updatedBerufserfahrung[currentJobIndex], 
              position: newPosition 
            };
            updates.berufserfahrung = updatedBerufserfahrung;
          }
        }
        break;
    }
    
    try {
      await onProfileUpdate(updates);
      toast({
        title: "Position aktualisiert",
        description: "Ihre Position wurde erfolgreich aktualisiert."
      });
    } catch (error) {
      console.error('Error updating position:', error);
      toast({
        title: "Fehler beim Speichern",
        description: "Die Position konnte nicht aktualisiert werden.",
        variant: "destructive"
      });
    }
  };

  const getEmployerOrSchool = (p: any) => {
    if (!p) return '';
    if (p.status === 'schueler') {
      return p.schule || p.schulbildung?.[0]?.institution || '';
    }
    if (p.status === 'azubi' || p.status === 'ausgelernt') {
      const current = p.berufserfahrung?.find((job: any) => !job.bis || new Date(job.bis) > new Date());
      return current?.unternehmen || p.ausbildungsbetrieb || '';
    }
    return '';
  };

  const getStatusDescription = (profile: any) => {
    if (!profile?.status) return '';
    
    const currentYear = new Date().getFullYear();
    
    switch (profile.status) {
      case 'schueler':
        const schoolName = profile.schule || profile.schulbildung?.[0]?.institution || 'Schule';
        const graduationYear = profile.abschlussjahr || 
          (profile.schulbildung?.[0]?.bis ? new Date(profile.schulbildung[0].bis).getFullYear() : currentYear + 1);
        const studentPosition = getCurrentPosition(profile);
        return `${studentPosition} an der ${schoolName}, Abschluss voraussichtlich ${graduationYear}`;
      
      case 'azubi':
        const currentJob = profile.berufserfahrung?.find((job: any) => !job.bis || new Date(job.bis) > new Date());
        const company = profile.ausbildungsbetrieb || currentJob?.unternehmen || 'Betrieb';
        const endDate = profile.voraussichtliches_ende || 
          (currentJob?.bis ? new Date(currentJob.bis).getFullYear() : currentYear + 2);
        const apprenticePosition = getCurrentPosition(profile);
        return `${apprenticePosition} bei ${company} bis ${endDate}`;
      
      case 'ausgelernt':
        const currentEmployment = profile.berufserfahrung?.find((job: any) => !job.bis || new Date(job.bis) > new Date());
        const employer = currentEmployment?.unternehmen || 'Unternehmen';
        const startYear = profile.abschlussjahr_ausgelernt || 
          (currentEmployment?.von ? new Date(currentEmployment.von).getFullYear() : currentYear);
        const employeePosition = getCurrentPosition(profile);
        return `${employeePosition} bei ${employer} seit ${startYear}`;
      
      default:
        return '';
    }
  };

  return (
    <div className="relative bg-background rounded-xl overflow-hidden shadow-sm border">
      {/* Cover Photo */}
      <div className="relative h-16 sm:h-20 md:h-24 lg:h-28 overflow-hidden bg-gradient-to-r from-primary/20 to-accent/30">
        {profile?.cover_image_url || profile?.cover_url || profile?.titelbild_url ? (
          <img 
            src={(profile.cover_image_url || profile.cover_url || profile.titelbild_url) as string}
            alt={(profile?.vorname || profile?.nachname) ? `Titelbild von ${profile?.vorname ?? ''} ${profile?.nachname ?? ''}`.trim() : 'Titelbild'} 
            className="w-full h-full object-cover object-[center_top]"
            loading="lazy"
          />
        ) : (
          <div className="w-full h-full bg-gradient-to-r from-primary/10 to-accent/20" />
        )}
        
        {isEditing && (
          <Button
            variant="secondary"
            size="sm"
            className="absolute top-2 right-2 bg-background/80 backdrop-blur-sm text-xs"
            onClick={() => coverInputRef.current?.click()}
            disabled={isUploadingCover}
          >
            <Camera className="h-3 w-3 mr-1" />
            <span className="hidden sm:inline">Cover</span>
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
      <div className="px-4 md:px-6 pb-4 md:pb-6">
        {/* Avatar */}
        <div className="relative -mt-12 sm:-mt-16 mb-3 md:mb-4">
          <div className="relative inline-block">
            <Avatar className="w-20 h-20 sm:w-24 sm:h-24 md:w-32 md:h-32 border-4 border-background shadow-lg">
              <AvatarImage src={profile?.avatar_url} alt="Profile" />
              <AvatarFallback className="text-lg md:text-2xl font-bold bg-primary/10">
                {profile?.vorname?.[0]}{profile?.nachname?.[0]}
              </AvatarFallback>
            </Avatar>
            
            {isEditing && (
              <Button
                variant="secondary"
                size="sm"
                className="absolute bottom-1 right-1 rounded-full w-6 h-6 sm:w-8 sm:h-8 p-0"
                onClick={() => avatarInputRef.current?.click()}
                disabled={isUploadingAvatar}
              >
                <Camera className="h-3 w-3 sm:h-4 sm:w-4" />
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
          <h1 className="text-2xl md:text-3xl font-bold text-foreground">
            {profile?.vorname} {profile?.nachname}
          </h1>
          
          {/* Professional Status - Mobile optimized badge + Editable position */}
          {profile?.status && (
            <div className="space-y-2">
              <div className="flex flex-col sm:flex-row sm:items-center gap-2">
                <Badge variant="secondary" className="text-xs sm:text-sm w-fit">
                  {profile.status === 'schueler' ? 'Schüler' : 
                   profile.status === 'azubi' ? 'Azubi im Handwerk' : 
                   'Angestellter im Handwerk'}
                </Badge>
                {isEditing && (
                  <Input
                    value={currentPosition}
                    onChange={(e) => setCurrentPosition(e.target.value)}
                    placeholder="Position eingeben..."
                    className="text-sm"
                    onBlur={() => updateCurrentPosition(currentPosition)}
                  />
                )}
              </div>
              <p className="text-sm md:text-lg font-medium text-primary leading-tight">
                {getStatusDescription(profile)}
              </p>
            </div>
          )}
          
          {isEditing ? (
            <div className="flex items-center gap-2">
              <Input
                value={headline}
                onChange={(e) => setHeadline(e.target.value)}
                placeholder="Add a professional headline..."
                className="text-sm md:text-lg font-medium"
                onBlur={handleHeadlineUpdate}
              />
              <Edit3 className="h-4 w-4 text-muted-foreground flex-shrink-0" />
            </div>
          ) : (
            <p className="text-sm md:text-lg font-medium text-muted-foreground">
              {headline || 'Professional seeking opportunities'}
            </p>
          )}
          
          <p className="text-sm text-muted-foreground flex items-center gap-1.5">
            <MapPin className="h-4 w-4" aria-hidden />
            <span>{profile?.ort || '—'}</span>
            {profile?.branche && <span> • {profile.branche}</span>}
            {getEmployerOrSchool(profile) && <span> • {getEmployerOrSchool(profile)}</span>}
          </p>
        </div>
      </div>
    </div>
  );
};