import React from 'react';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { usePostLikers } from '@/hooks/useLinkedInPosts';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';

interface LikeFacesProps {
  postId: string;
  likeCount: number;
}

export default function LikeFaces({ postId, likeCount }: LikeFacesProps) {
  const { data: likers, isLoading } = usePostLikers(postId);

  if (isLoading || !likers || likers.length === 0) {
    return null;
  }

  // Show up to 3 avatars
  const displayLikers = likers.slice(0, 3);
  const remainingCount = Math.max(0, likeCount - 3);

  const getLikeText = () => {
    if (likeCount === 1) {
      const liker = displayLikers[0]?.profiles;
      const name = liker?.vorname && liker?.nachname 
        ? `${liker.vorname} ${liker.nachname}` 
        : 'Jemand';
      return `${name} gefällt das`;
    } else if (likeCount === 2) {
      const names = displayLikers.slice(0, 2).map(liker => {
        const profile = liker?.profiles;
        return profile?.vorname && profile?.nachname 
          ? `${profile.vorname} ${profile.nachname}` 
          : 'Jemand';
      });
      return `${names.join(' und ')} gefällt das`;
    } else {
      const firstName = displayLikers[0]?.profiles;
      const name = firstName?.vorname && firstName?.nachname 
        ? `${firstName.vorname} ${firstName.nachname}` 
        : 'Jemand';
      
      if (remainingCount > 0) {
        return `${name} und ${remainingCount} anderen gefällt das`;
      } else {
        return `${name} und anderen gefällt das`;
      }
    }
  };

  return (
    <div className="px-4 pb-2">
      <Dialog>
        <DialogTrigger asChild>
          <button className="flex items-center gap-2 hover:underline text-sm text-muted-foreground">
            {/* Overlapping Avatars */}
            <div className="flex -space-x-1">
              {displayLikers.map((liker, index) => {
                const profile = liker?.profiles;
                const initials = profile?.vorname && profile?.nachname 
                  ? `${profile.vorname[0]}${profile.nachname[0]}` 
                  : 'U';
                
                return (
                  <Avatar 
                    key={liker.user_id} 
                    className="h-6 w-6 border-2 border-background"
                    style={{ zIndex: 10 - index }}
                  >
                    <AvatarImage src={profile?.avatar_url} />
                    <AvatarFallback className="text-xs">{initials}</AvatarFallback>
                  </Avatar>
                );
              })}
            </div>
            
            <span>{getLikeText()}</span>
          </button>
        </DialogTrigger>
        
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Personen, denen das gefällt</DialogTitle>
          </DialogHeader>
          
          <div className="space-y-3 max-h-96 overflow-y-auto">
            {likers.map((liker) => {
              const profile = liker?.profiles;
              const name = profile?.vorname && profile?.nachname 
                ? `${profile.vorname} ${profile.nachname}` 
                : 'Unbekannt';
              const initials = profile?.vorname && profile?.nachname 
                ? `${profile.vorname[0]}${profile.nachname[0]}` 
                : 'U';
              
              return (
                <div key={liker.user_id} className="flex items-center gap-3">
                  <Avatar className="h-10 w-10">
                    <AvatarImage src={profile?.avatar_url} />
                    <AvatarFallback>{initials}</AvatarFallback>
                  </Avatar>
                  <div>
                    <div className="font-medium text-sm">{name}</div>
                  </div>
                </div>
              );
            })}
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}