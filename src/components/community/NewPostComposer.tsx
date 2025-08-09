import React from 'react';
import { Dialog, DialogContent } from '@/components/ui/dialog';
import { Sheet, SheetContent, SheetHeader, SheetTitle } from '@/components/ui/sheet';
import { useIsMobile } from '@/hooks/use-mobile';
import { subscribeOpenPostComposer } from '@/lib/event-bus';
import { CreatePost } from '@/components/community/CreatePost';
import { useAuth } from '@/hooks/useAuth';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Clock } from 'lucide-react';
import { Button } from '@/components/ui/button';

export const NewPostComposer: React.FC = () => {
  const isMobile = useIsMobile();
  const [open, setOpen] = React.useState(false);
  const [audience, setAudience] = React.useState<'public' | 'connections'>('public');
  const { profile } = useAuth();

  React.useEffect(() => {
    return subscribeOpenPostComposer(() => setOpen(true));
  }, []);

  if (isMobile) {
    return (
      <Sheet open={open} onOpenChange={setOpen}>
        <SheetContent side="bottom" className="h-[92vh] p-0">
          <SheetHeader className="px-6 pt-4 pb-2">
            <SheetTitle>Neuer Beitrag</SheetTitle>
          </SheetHeader>
          <div className="h-full overflow-y-auto px-6 pb-6">
            <CreatePost />
          </div>
        </SheetContent>
      </Sheet>
    );
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogContent className="md:max-w-3xl w-full p-0 rounded-xl overflow-hidden">
        {/* Header */}
        <div className="px-6 pt-5 pb-3 border-b bg-background">
          <div className="flex items-start gap-3">
            <Avatar className="h-9 w-9">
              <AvatarImage src={profile?.avatar_url || undefined} />
              <AvatarFallback>
                {profile?.vorname && profile?.nachname ? `${profile.vorname[0]}${profile.nachname[0]}` : 'U'}
              </AvatarFallback>
            </Avatar>
            <div className="flex-1 min-w-0">
              <div className="text-sm font-medium leading-tight truncate">
                {profile?.vorname && profile?.nachname ? `${profile.vorname} ${profile.nachname}` : 'Unbekannter Nutzer'}
              </div>
              <div className="mt-1">
                <Select value={audience} onValueChange={(v) => setAudience(v as any)}>
                  <SelectTrigger className="h-8 w-[200px] text-xs">
                    <SelectValue placeholder="Auf Alle posten" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="public">Auf Alle posten</SelectItem>
                    <SelectItem value="connections">Nur Verbindungen</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            <Button variant="ghost" size="icon" className="h-8 w-8" title="Später planen">
              <Clock className="h-4 w-4" />
            </Button>
          </div>
        </div>

        {/* Body */}
        <div className="px-6 py-5">
          <CreatePost container="none" hideHeader variant="composer" />
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default NewPostComposer;
