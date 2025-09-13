import React from 'react';
import { Dialog, DialogContent, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { Sheet, SheetContent, SheetHeader, SheetTitle } from '@/components/ui/sheet';
import { useIsMobile } from '@/hooks/use-mobile';
import { subscribeOpenPostComposer } from '@/lib/event-bus';
import { CreatePost } from '@/components/community/CreatePost';
import { useAuth } from '@/hooks/useAuth';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Button } from '@/components/ui/button';
import { Calendar as CalendarIcon, Image as ImageIcon, Plus, PartyPopper, FileText, BarChart3, Users, Globe } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Calendar as DateCalendar } from '@/components/ui/calendar';
import { TooltipProvider, Tooltip, TooltipTrigger, TooltipContent } from '@/components/ui/tooltip';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';

export const NewPostComposer: React.FC = () => {
  const isMobile = useIsMobile();
  const [open, setOpen] = React.useState(false);
  const [audience, setAudience] = React.useState<'public' | 'connections'>('public');
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

  // Close dialog when post is successfully created
  React.useEffect(() => {
    if (!isSubmitting && canPost === false && open) {
      // Post was successfully created, close dialog
      setOpen(false);
    }
  }, [isSubmitting, canPost, open]);

  const AudienceIcon = audience === 'public' ? Globe : Users;

  const [scheduledAt, setScheduledAt] = React.useState<Date | null>(null);
  const [scheduleOpen, setScheduleOpen] = React.useState(false);
  const [scheduleDate, setScheduleDate] = React.useState<Date | undefined>(undefined);
  const [scheduleTime, setScheduleTime] = React.useState<string>('09:00');
  const [showPoll, setShowPoll] = React.useState(false);
  const [showEvent, setShowEvent] = React.useState(false);
  const [celebration, setCelebration] = React.useState(false);

  const applySchedule = () => {
    if (scheduleDate && scheduleTime) {
      const [hh, mm] = scheduleTime.split(':').map(Number);
      const d = new Date(scheduleDate);
      d.setHours(hh || 0, mm || 0, 0, 0);
      setScheduledAt(d);
      setScheduleOpen(false);
    }
  };
  const clearSchedule = () => {
    setScheduledAt(null);
    setScheduleOpen(false);
  };

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
                <SelectItem value="connections">Nur Community</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <Popover open={scheduleOpen} onOpenChange={setScheduleOpen}>
            <PopoverTrigger asChild>
              <Button variant="ghost" size="icon" className="h-8 w-8" title="Planen">
                <CalendarIcon className="h-4 w-4" />
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-[320px]" align="end">
              <div className="space-y-3">
                <div className="text-sm font-medium">Beitrag planen</div>
                <DateCalendar mode="single" selected={scheduleDate} onSelect={setScheduleDate as any} className="p-3 pointer-events-auto" />
                <div className="flex items-center gap-2">
                  <Input type="time" value={scheduleTime} onChange={(e) => setScheduleTime(e.target.value)} className="h-9" />
                </div>
                <div className="flex justify-between gap-2">
                  <Button variant="outline" size="sm" onClick={clearSchedule}>Löschen</Button>
                  <Button size="sm" onClick={applySchedule}>Übernehmen</Button>
                </div>
                {scheduledAt && (
                  <div className="text-xs text-muted-foreground">Geplant für: {scheduledAt.toLocaleString()}</div>
                )}
              </div>
            </PopoverContent>
          </Popover>
          {scheduledAt && <Badge variant="secondary">Geplant</Badge>}
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
          <TooltipProvider>
            {[
              { Icon: ImageIcon, label: 'Medien' },
              { Icon: CalendarIcon, label: 'Event' },
              { Icon: PartyPopper, label: 'Feier' },
              { Icon: FileText, label: 'Dokument' },
              { Icon: BarChart3, label: 'Umfrage' },
              { Icon: Users, label: 'Gruppe' }
            ].map(({ Icon, label }) => (
              <Tooltip key={label} delayDuration={150}>
                <TooltipTrigger asChild>
                  <motion.button
                    whileTap={{ scale: 0.9 }}
                    className="h-11 w-11 rounded-full bg-muted text-muted-foreground flex items-center justify-center shadow-md focus:outline-none focus:ring-2 focus:ring-primary"
                    style={{ boxShadow: 'var(--shadow-elegant)' }}
                    onClick={() => {
                      if (label === 'Medien') {
                        document.getElementById('image-upload')?.click();
                      } else if (label === 'Dokument') {
                        document.getElementById('document-upload')?.click();
                      } else if (label === 'Umfrage') {
                        setShowPoll(true);
                      } else if (label === 'Event') {
                        setShowEvent(true);
                      } else if (label === 'Feier') {
                        setCelebration((v) => !v);
                      }
                      setTrayOpen(false);
                    }}
                    aria-label={label}
                  >
                    <Icon className="h-5 w-5" />
                  </motion.button>
                </TooltipTrigger>
                <TooltipContent side="top">{label}</TooltipContent>
              </Tooltip>
            ))}
          </TooltipProvider>
        </motion.div>
      )}
    </AnimatePresence>
  );

  const BottomToolbar = (
    <div className="relative border-t bg-background/95 supports-[backdrop-filter]:bg-background/80 backdrop-blur px-4 py-3">
      {ActionTray}
      <div className="flex items-center justify-between">
        <button 
          type="button"
          onClick={() => document.getElementById('image-upload')?.click()}
          className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors"
        >
          <ImageIcon className="h-5 w-5" /> Bild/Video
        </button>
        <div className="flex items-center gap-2">
          <Button variant="secondary" size="icon" className="h-10 w-10 rounded-full" onClick={() => setTrayOpen((v) => !v)} aria-expanded={trayOpen} aria-label="Weitere Aktionen">
            <Plus className="h-5 w-5" />
          </Button>
          <Button
            onClick={() => document.getElementById('createpost-submit')?.click()}
            disabled={!canPost || isSubmitting}
            className="px-6"
          >
            {isSubmitting ? 'Wird veröffentlicht...' : 'Posten'}
          </Button>
        </div>
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
          <div className="flex-1 overflow-y-auto px-6 pb-6 max-h-[calc(92vh-180px)]">
            <CreatePost container="none" hideHeader variant="composer" hideBottomBar onStateChange={handleStateChange} scheduledAt={scheduledAt} showPoll={showPoll} showEvent={showEvent} celebration={celebration} visibility={audience} />
          </div>
          <div className="sticky bottom-0">{BottomToolbar}</div>
        </SheetContent>
      </Sheet>
    );
  }

  return (
    <Dialog open={open} onOpenChange={(v) => { setOpen(v); setTrayOpen(false); }}>
      <DialogContent className="md:max-w-3xl w-full p-0 rounded-xl overflow-hidden max-h-[90vh] flex flex-col">
        <DialogTitle className="sr-only">Neuer Beitrag</DialogTitle>
        <DialogDescription className="sr-only">Verfasse und veröffentliche einen neuen Beitrag.</DialogDescription>
        {Header}
        <div className="px-6 py-5 flex-1 overflow-y-auto">
          <CreatePost container="none" hideHeader variant="composer" hideBottomBar onStateChange={handleStateChange} scheduledAt={scheduledAt} showPoll={showPoll} showEvent={showEvent} celebration={celebration} visibility={audience} />
        </div>
        {BottomToolbar}
      </DialogContent>
    </Dialog>
  );
};

export default NewPostComposer;
