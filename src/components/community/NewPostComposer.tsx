import React from "react";
import { Dialog, DialogContent, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Sheet, SheetContent, SheetHeader, SheetTitle } from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { AnimatePresence, motion } from "framer-motion";
import { useIsMobile } from "@/hooks/useIsMobile";
import { useAuth } from "@/hooks/useAuth";
import { subscribeOpenPostComposer } from "@/lib/event-bus";
import CreatePost from "@/components/community/CreatePost";
import { 
  Globe, 
  Users, 
  ImageIcon, 
  Calendar, 
  FileText, 
  BarChart3, 
  Briefcase, 
  Plus,
  Clock,
  X
} from "lucide-react";
import { formatNameWithJob } from '@/utils/profileUtils';

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

  const handleStateChange = React.useCallback((isSubmitting: boolean, canPost: boolean) => {
    setIsSubmitting(isSubmitting);
    setCanPost(canPost);
  }, []);

  // Listen for successful post creation to close modal
  React.useEffect(() => {
    const handlePostSuccess = () => {
      // Close modal after successful post creation
      setTimeout(() => {
        setOpen(false);
      }, 500); // Small delay to show success toast
    };
    
    window.addEventListener('post-created', handlePostSuccess);
    return () => window.removeEventListener('post-created', handlePostSuccess);
  }, []);

  const AudienceIcon = audience === 'public' ? Globe : Users;

  const [scheduledAt, setScheduledAt] = React.useState<Date | null>(null);
  const [scheduleOpen, setScheduleOpen] = React.useState(false);
  const [scheduleDate, setScheduleDate] = React.useState<Date | undefined>(undefined);
  const [scheduleTime, setScheduleTime] = React.useState<string>('09:00');
  const [showPoll, setShowPoll] = React.useState(false);
  const [showEvent, setShowEvent] = React.useState(false);
  const [celebration, setCelebration] = React.useState(false);
  
  const nameInfo = formatNameWithJob(profile);

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

  // FIXED: Proper post submit handler
  const handlePostSubmit = React.useCallback(() => {
    console.log('Posten button clicked, canPost:', canPost, 'isSubmitting:', isSubmitting);
    
    if (!canPost || isSubmitting) {
      console.log('Cannot post - canPost:', canPost, 'isSubmitting:', isSubmitting);
      return;
    }

    // Try multiple methods to trigger form submit
    const submitButton = document.getElementById('createpost-submit');
    if (submitButton) {
      console.log('Found submit button, clicking...');
      submitButton.click();
    } else {
      console.log('Submit button not found, trying form submit...');
      const form = document.querySelector('form');
      if (form) {
        console.log('Found form, submitting...');
        form.requestSubmit();
      } else {
        console.log('No form found!');
      }
    }
  }, [canPost, isSubmitting]);

  const Header = (
    <div className="px-6 pt-5 pb-3 border-b bg-background">
      <div className="flex items-center gap-3">
        <Avatar className="h-9 w-9">
          <AvatarImage src={profile?.avatar_url || undefined} alt={`${profile?.vorname ?? 'Unbekannt'} Avatar`} />
          <AvatarFallback>
            {profile?.vorname && profile?.nachname
              ? `${profile.vorname[0]}${profile.nachname[0]}`
              : 'U'}
          </AvatarFallback>
        </Avatar>
        <div className="flex-1 min-w-0">
          <div className="text-sm font-medium leading-tight truncate">
            {nameInfo.name}
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
          {scheduledAt && (
            <Badge variant="outline" className="text-xs">
              <Clock className="h-3 w-3 mr-1" />
              {scheduledAt.toLocaleDateString('de-DE')} {scheduledAt.toLocaleTimeString('de-DE', { hour: '2-digit', minute: '2-digit' })}
              <Button
                variant="ghost"
                size="sm"
                className="h-4 w-4 p-0 ml-1"
                onClick={clearSchedule}
              >
                <X className="h-3 w-3" />
              </Button>
            </Badge>
          )}
        </div>
      </div>
    </div>
  );

  const ActionTray = (
    <AnimatePresence>
      {trayOpen && (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: 10 }}
          className="absolute bottom-full left-0 right-0 mb-2 flex justify-center"
        >
          <div className="flex items-center gap-3 bg-background/95 backdrop-blur rounded-full px-4 py-2 shadow-lg border">
            <TooltipProvider>
              {[
                { Icon: ImageIcon, label: 'Medien' },
                { Icon: FileText, label: 'Dokument' },
                { Icon: BarChart3, label: 'Umfrage' },
                { Icon: Calendar, label: 'Event' },
                { Icon: Briefcase, label: 'Feier' },
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
          </div>
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
            onClick={handlePostSubmit}
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
            <CreatePost container="none" hideHeader hideBottomBar onStateChange={handleStateChange} scheduledAt={scheduledAt?.toISOString()} celebration={celebration} visibility={audience} />
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
          <CreatePost container="none" hideHeader hideBottomBar onStateChange={handleStateChange} scheduledAt={scheduledAt?.toISOString()} celebration={celebration} visibility={audience} />
        </div>
        {BottomToolbar}
      </DialogContent>
    </Dialog>
  );
};

export default NewPostComposer;