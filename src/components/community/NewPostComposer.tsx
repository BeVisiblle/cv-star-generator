import React from 'react';
import { Dialog, DialogContent } from '@/components/ui/dialog';
import { Sheet, SheetContent, SheetHeader, SheetTitle } from '@/components/ui/sheet';
import { useIsMobile } from '@/hooks/use-mobile';
import { subscribeOpenPostComposer } from '@/lib/event-bus';
import { CreatePost } from '@/components/community/CreatePost';
import { useAuth } from '@/hooks/useAuth';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Button } from '@/components/ui/button';
import { Calendar, Image as ImageIcon, Plus, PartyPopper, FileText, BarChart3, Users, Globe, Lock } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

export const NewPostComposer: React.FC = () => {
  const isMobile = useIsMobile();
  const [open, setOpen] = React.useState(false);
  const [audience, setAudience] = React.useState<'public' | 'connections' | 'private'>('public');
  const [trayOpen, setTrayOpen] = React.useState(false);
  const [canPost, setCanPost] = React.useState(false);
  const [isSubmitting, setIsSubmitting] = React.useState(false);
  const { profile } = useAuth();

  React.useEffect(() => {
    return subscribeOpenPostComposer(() => setOpen(true));
  }, []);

  const handleStateChange = React.useCallback((s: { canPost: boolean; isSubmitting: boolean }) => {
    setCanPost(s.canPost);
    setIsSubmitting(s.isSubmitting);
  }, []);

  const AudienceIcon = audience === 'public' ? Globe : audience === 'connections' ? Users : Lock;

  const Header = (
    <div className="px-6 pt-5 pb-3 border-b bg-background">
      <div className="flex items-center gap-3">
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
              <SelectTrigger className="h-8 w-[220px] text-xs">
                <SelectValue placeholder="Sichtbarkeit wählen" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="public">Jeder (öffentlich)</SelectItem>
                <SelectItem value="connections">Nur Verbindungen</SelectItem>
                <SelectItem value="private">Privat</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="ghost" size="icon" className="h-8 w-8" title="Planen">
            <Calendar className="h-4 w-4" />
          </Button>
          <Button disabled={!canPost || isSubmitting} onClick={() => document.getElementById('createpost-submit')?.click()}>
            {isSubmitting ? 'Wird veröffentlicht…' : 'Posten'}
          </Button>
        </div>
      </div>
    </div>
  );

  const ActionTray = (
    <AnimatePresence>
      {trayOpen && (
        <motion.div
          initial={{ opacity: 0, scale: 0.9, y: 10 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 10 }}
          transition={{ type: 'spring', stiffness: 260, damping: 18 }}
          className="absolute -top-16 right-3 flex gap-3"
        >
          {[{ Icon: ImageIcon, label: 'Medien' }, { Icon: Calendar, label: 'Event' }, { Icon: PartyPopper, label: 'Feier' }, { Icon: FileText, label: 'Dokument' }, { Icon: BarChart3, label: 'Umfrage' }, { Icon: Users, label: 'Gruppe' }].map(({ Icon, label }, i) => (
            <motion.button
              key={label}
              whileTap={{ scale: 0.9 }}
              className="h-11 w-11 rounded-full bg-muted text-muted-foreground flex items-center justify-center shadow-md"
              style={{ boxShadow: 'var(--shadow-elegant)' }}
              onClick={() => setTrayOpen(false)}
              title={label}
            >
              <Icon className="h-5 w-5" />
            </motion.button>
          ))}
        </motion.div>
      )}
    </AnimatePresence>
  );

  const BottomToolbar = (
    <div className="relative border-t bg-background/95 supports-[backdrop-filter]:bg-background/80 backdrop-blur px-4 py-3">
      {ActionTray}
      <div className="flex items-center justify-between">
        <label htmlFor="image-upload" className="cursor-pointer">
          <span className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors">
            <ImageIcon className="h-5 w-5" /> Bild/Video
          </span>
        </label>
        <Button variant="secondary" size="icon" className="h-10 w-10 rounded-full" onClick={() => setTrayOpen((v) => !v)} aria-expanded={trayOpen} aria-label="Weitere Aktionen">
          <Plus className="h-5 w-5" />
        </Button>
      </div>
    </div>
  );

  if (isMobile) {
    return (
      <Sheet open={open} onOpenChange={(v) => { setOpen(v); setTrayOpen(false); }}>
        <SheetContent side="bottom" className="h-[92vh] p-0 flex flex-col">
          <SheetHeader className="px-6 pt-4 pb-2">
            <SheetTitle>Neuer Beitrag</SheetTitle>
          </SheetHeader>
          {Header}
          <div className="flex-1 overflow-y-auto px-6 pb-6">
            <CreatePost container="none" hideHeader variant="composer" hideBottomBar onStateChange={handleStateChange} />
          </div>
          <div className="sticky bottom-0">{BottomToolbar}</div>
        </SheetContent>
      </Sheet>
    );
  }

  return (
    <Dialog open={open} onOpenChange={(v) => { setOpen(v); setTrayOpen(false); }}>
      <DialogContent className="md:max-w-3xl w-full p-0 rounded-xl overflow-hidden">
        {Header}
        <div className="px-6 py-5">
          <CreatePost container="none" hideHeader variant="composer" hideBottomBar onStateChange={handleStateChange} />
        </div>
        {BottomToolbar}
      </DialogContent>
    </Dialog>
  );
};

export default NewPostComposer;
