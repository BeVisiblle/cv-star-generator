import React from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Sheet, SheetContent, SheetHeader, SheetTitle } from '@/components/ui/sheet';
import { useIsMobile } from '@/hooks/use-mobile';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { CommunityComposer } from './CommunityComposer';
import { useAuth } from '@/hooks/useAuth';

interface NewPostComposerProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

function NewPostComposer({ open, onOpenChange }: NewPostComposerProps) {
  const isMobile = useIsMobile();
  const { profile } = useAuth();

  const Header = (
    <div className="flex items-center gap-3 sticky top-0 bg-background pb-4 border-b">
      <Avatar className="h-9 w-9">
        <AvatarImage src={profile?.avatar_url || undefined} />
        <AvatarFallback>
          {profile?.vorname && profile?.nachname ? `${profile.vorname[0]}${profile.nachname[0]}` : "U"}
        </AvatarFallback>
      </Avatar>
      <div className="flex-1 min-w-0">
        <div className="text-sm font-medium leading-tight truncate">
          {profile?.vorname && profile?.nachname ? `${profile.vorname} ${profile.nachname}` : "Unbekannter Nutzer"}
        </div>
        <div className="text-xs text-muted-foreground">
          Neuer Beitrag
        </div>
      </div>
    </div>
  );

  if (isMobile) {
    return (
      <Sheet open={open} onOpenChange={onOpenChange}>
        <SheetContent side="bottom" className="h-[85vh] p-6 flex flex-col">
          <SheetHeader className="sr-only">
            <SheetTitle>Neuer Beitrag</SheetTitle>
          </SheetHeader>
          {Header}
          <div className="flex-1 overflow-y-auto pt-4">
            <CommunityComposer />
          </div>
        </SheetContent>
      </Sheet>
    );
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[600px] max-h-[85vh] overflow-hidden p-6">
        <DialogHeader className="sr-only">
          <DialogTitle>Neuer Beitrag</DialogTitle>
        </DialogHeader>
        {Header}
        <div className="max-h-[60vh] overflow-y-auto pt-4">
          <CommunityComposer />
        </div>
      </DialogContent>
    </Dialog>
  );
}

export { NewPostComposer };
export default NewPostComposer;