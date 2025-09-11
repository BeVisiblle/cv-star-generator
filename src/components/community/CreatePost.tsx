import React, { useState, useEffect } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { uploadFile } from "@/lib/supabase-storage";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Input } from "@/components/ui/input";
import { Switch } from "@/components/ui/switch";
import { useToast } from "@/hooks/use-toast";
import { Send, Image, X, FileText } from "lucide-react";
import AttachmentUploader from "@/components/upload/AttachmentUploader";
import FilePreview from "@/components/upload/FilePreview";
import { UploadedAttachment } from "@/lib/uploads";

export interface CreatePostProps {
  container?: "card" | "none"; // render inside Card (default) or bare content for composer dialog
  hideHeader?: boolean;          // hide avatar/header row (for dialog header)
  variant?: "default" | "composer"; // adjusts spacing/labels
  hideBottomBar?: boolean;       // hide default bottom actions to allow external toolbar
  onStateChange?: (state: { canPost: boolean; isSubmitting: boolean }) => void; // notify parent
  scheduledAt?: Date | null;     // optional scheduled time (UTC stored)
  showPoll?: boolean;
  showEvent?: boolean;
  celebration?: boolean;
  visibility?: 'public' | 'connections' | 'private';
  // NEW: posting context (user vs. company)
  context?: 'user' | 'company';
  companyId?: string;            // required when context==='company'
}

export const CreatePost = ({ container = "card", hideHeader = false, variant = "default", hideBottomBar = false, onStateChange, scheduledAt, showPoll = false, showEvent = false, celebration = false, visibility = 'public', context = 'user', companyId }: CreatePostProps) => {
  const [content, setContent] = useState("");
  const [attachments, setAttachments] = useState<UploadedAttachment[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const queryClient = useQueryClient();
  const { toast } = useToast();

  // Poll state
  const [pollQuestion, setPollQuestion] = useState("");
  const [pollOptions, setPollOptions] = useState<string[]>(["", ""]);
  const [pollDurationDays, setPollDurationDays] = useState<number>(7);

  // Event state
  const [eventTitle, setEventTitle] = useState("");
  const [eventStartDate, setEventStartDate] = useState<string>("");
  const [eventStartTime, setEventStartTime] = useState<string>("");
  const [eventEndDate, setEventEndDate] = useState<string>("");
  const [eventEndTime, setEventEndTime] = useState<string>("");
  const [eventIsOnline, setEventIsOnline] = useState<boolean>(true);
  const [eventLocation, setEventLocation] = useState<string>("");
  const [eventLink, setEventLink] = useState<string>("");

  const createPostMutation = useMutation({
    mutationFn: async ({ id, content, imageUrl }: { id: string; content: string; imageUrl?: string }) => {
      const { data: authData } = await supabase.auth.getUser();
      const user = authData.user;
      if (!user) throw new Error("Not authenticated");

      const scheduledISO = scheduledAt && new Date(scheduledAt) > new Date()
        ? new Date(scheduledAt).toISOString()
        : null;

      // Map UI audience to DB visibility values
      const visibilityMap: Record<'public' | 'connections' | 'private', string> = {
        public: 'CommunityAndCompanies',
        connections: 'CommunityOnly',
        private: 'CommunityOnly'
      };
      const dbVisibility = visibilityMap[visibility ?? 'public'] ?? 'CommunityAndCompanies';

      const { error } = await supabase
        .from("posts")
        .insert({
          id,
          content,
          image_url: imageUrl,
          user_id: user.id,
          author_id: context === 'company' ? (companyId as string) : user.id,
          author_type: context === 'company' ? 'company' : 'user',
          celebration,
          visibility: dbVisibility,
          status: scheduledISO ? 'scheduled' : 'published',
          scheduled_at: scheduledISO
        });

      if (error) throw error;
      return { id };
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["community-posts"] });
      setContent("");
      setAttachments([]);
      toast({
        title: "Beitrag veröffentlicht",
        description: "Dein Beitrag wurde erfolgreich geteilt.",
      });
    },
    onError: (error) => {
      console.error("Error creating post:", error);
      toast({
        title: "Fehler",
        description: "Beitrag konnte nicht veröffentlicht werden.",
        variant: "destructive",
      });
    },
  });

  // Notify parent on state changes
  useEffect(() => {
    const pollValid = showPoll ? Boolean(pollQuestion.trim() && pollOptions.filter(o => o.trim()).length >= 2) : false;
    const eventValid = showEvent ? Boolean(eventTitle.trim() && eventStartDate && eventStartTime && eventEndDate && eventEndTime) : false;

    // Min. 10 Zeichen, wenn Umfrage oder Dokument vorhanden ist
    const needsMinText = (showPoll && pollValid) || attachments.length > 0;
    const hasMinText = content.trim().length >= 10;

    const canPost = needsMinText
      ? hasMinText
      : Boolean(content.trim() || attachments.length > 0 || pollValid || eventValid);

    onStateChange?.({ canPost, isSubmitting });
  }, [content, attachments, pollQuestion, pollOptions, eventTitle, eventStartDate, eventStartTime, eventEndDate, eventEndTime, showPoll, showEvent, isSubmitting, onStateChange]);

  // File handling is now done by AttachmentUploader

  const uploadImage = async (file: File): Promise<string> => {
    const result = await uploadFile(file, 'post-media', 'images');
    return result.url;
  };

  const handleSubmit = async () => {
    // Pflichttext bei Umfrage oder Dokument
    const needsMinText = (showPoll && Boolean(pollQuestion.trim() && pollOptions.filter(o => o.trim()).length >= 2)) || attachments.length > 0;
    if (needsMinText && content.trim().length < 10) {
      toast({ title: 'Bitte mehr schreiben', description: 'Du musst mind. 10 Zeichen zum Beitrag schreiben.', variant: 'destructive' });
      return;
    }

    if (!content.trim() && attachments.length === 0 && !(showPoll && pollQuestion.trim() && pollOptions.filter(o=>o.trim()).length>=2) && !(showEvent && eventTitle.trim() && eventStartDate && eventStartTime && eventEndDate && eventEndTime)) {
      return;
    }

    setIsSubmitting(true);
    try {
      // Rate limit: 10 posts per day
      const { data: rlData, error: rlError } = await supabase.functions.invoke(
        'check-rate-limit',
        {
          body: { action: 'post', limit: 10, window_minutes: 1440 },
        }
      );

      if (rlError) {
        console.error('Rate limit check error:', rlError);
      }

      if (rlData && rlData.allowed === false) {
        toast({
          title: 'Limit erreicht',
          description: 'Du hast dein tägliches Beitragslimit erreicht. Bitte versuche es später erneut.',
          variant: 'destructive',
        });
        return;
      }

      // Use attachments for media
      const mediaUrls = attachments.map(a => a.url);

      const postId = crypto.randomUUID();
      const newPost = await createPostMutation.mutateAsync({ id: postId, content, imageUrl: mediaUrls[0] || null });

      // Create poll if requested and valid
      if (showPoll && pollQuestion.trim()) {
        const options = pollOptions.map(o => o.trim()).filter(Boolean);
        if (options.length >= 2) {
          const endsAt = new Date(Date.now() + pollDurationDays * 24 * 60 * 60 * 1000).toISOString();
          const pollId = crypto.randomUUID();
          const { error: pollErr } = await supabase
            .from('post_polls')
            .insert({ id: pollId, post_id: newPost.id, question: pollQuestion.trim(), ends_at: endsAt });
          if (pollErr) throw pollErr;

          const { error: optErr } = await supabase
            .from('post_poll_options')
            .insert(options.map((option_text: string) => ({ poll_id: pollId, option_text })));
          if (optErr) throw optErr;
        }
      }

      // Create event if requested and valid
      if (showEvent && eventTitle.trim() && eventStartDate && eventStartTime && eventEndDate && eventEndTime) {
        const startAt = new Date(`${eventStartDate}T${eventStartTime}:00`);
        const endAt = new Date(`${eventEndDate}T${eventEndTime}:00`);
        const { error: eventErr } = await supabase
          .from('post_events')
          .insert({
            post_id: newPost.id,
            title: eventTitle.trim(),
            start_at: startAt.toISOString(),
            end_at: endAt.toISOString(),
            is_online: eventIsOnline,
            location: eventIsOnline ? null : (eventLocation || null),
            link_url: eventIsOnline ? (eventLink || null) : null,
          });
        if (eventErr) throw eventErr;
      }

      // Reset add-on states
      setAttachments([]);
      setPollQuestion("");
      setPollOptions(["", ""]);
      setPollDurationDays(7);
      setEventTitle("");
      setEventStartDate("");
      setEventStartTime("");
      setEventEndDate("");
      setEventEndTime("");
      setEventIsOnline(true);
      setEventLocation("");
      setEventLink("");
    } catch (error) {
      console.error('Error submitting post:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const Inner = (
    <div className="space-y-4">
      {!hideHeader && (
        <div className="flex items-start space-x-4">
          <Avatar className="h-10 w-10">
            <AvatarFallback>Du</AvatarFallback>
            <AvatarImage src={undefined} />
          </Avatar>
          <div className="flex-1" />
        </div>
      )}

      <Textarea
        placeholder={variant === 'composer' ? "Worüber möchtest du posten?" : "Worüber möchten Sie sprechen?"}
        value={content}
        onChange={(e) => setContent(e.target.value)}
        className={
          variant === 'composer' ? 'min-h-[280px] resize-none text-base md:text-lg' : 'min-h-[100px] resize-none'
        }
      />

      <AttachmentUploader
        maxFiles={6}
        accept="image/*,application/pdf"
        onUploaded={setAttachments}
        className="w-full"
      />
      
      {attachments.length > 0 && (
        <div className="mt-4">
          <FilePreview files={attachments} />
        </div>
      )}

      {showPoll && (
        <div className="space-y-3">
          <div className="text-sm font-medium">Umfrage erstellen</div>
          <div>
            <Input placeholder="Ihre Frage* (z. B.: Wie kommen Sie zur Arbeit?)" value={pollQuestion} onChange={(e) => setPollQuestion(e.target.value)} />
            <div className="text-[11px] text-muted-foreground mt-1">{pollQuestion.length}/140</div>
          </div>
          {pollOptions.map((opt, idx) => (
            <div key={idx}>
              <Input
                placeholder={idx === 0 ? "Option 1* (z. B.: mit öffentlichen Verkehrsmitteln)" : `Option ${idx + 1}${idx<2?' *':''}`}
                value={opt}
                onChange={(e) => {
                  const arr = [...pollOptions];
                  arr[idx] = e.target.value;
                  setPollOptions(arr);
                }}
                className="mt-1"
              />
              <div className="text-[11px] text-muted-foreground mt-1">{opt.length}/30</div>
            </div>
          ))}
          <div className="flex gap-2">
            <Button type="button" variant="outline" size="sm" onClick={() => setPollOptions((opts) => (opts.length < 4 ? [...opts, ""] : opts))}>+ Option hinzufügen</Button>
            <Button type="button" variant="outline" size="sm" onClick={() => setPollOptions((opts) => (opts.length > 2 ? opts.slice(0, -1) : opts))} disabled={pollOptions.length <= 2}>Letzte Option entfernen</Button>
          </div>
          <div>
            <div className="text-sm font-medium">Dauer der Umfrage</div>
            <select className="mt-1 h-9 border rounded-md px-2 bg-background" value={pollDurationDays} onChange={(e)=>setPollDurationDays(parseInt(e.target.value))}>
              <option value={1}>1 Tag</option>
              <option value={3}>3 Tage</option>
              <option value={7}>1 Woche</option>
              <option value={14}>2 Wochen</option>
            </select>
          </div>
          <p className="text-[11px] text-muted-foreground">Umfragen, mit denen sensible Daten abgefragt werden, sind nicht gestattet.</p>
        </div>
      )}

      {showEvent && (
        <div className="space-y-2">
          <div className="text-sm font-medium">Event</div>
          <Input placeholder="Titel" value={eventTitle} onChange={(e) => setEventTitle(e.target.value)} />
          <div className="grid grid-cols-2 gap-2">
            <Input type="date" value={eventStartDate} onChange={(e) => setEventStartDate(e.target.value)} />
            <Input type="time" value={eventStartTime} onChange={(e) => setEventStartTime(e.target.value)} />
            <Input type="date" value={eventEndDate} onChange={(e) => setEventEndDate(e.target.value)} />
            <Input type="time" value={eventEndTime} onChange={(e) => setEventEndTime(e.target.value)} />
          </div>
          <div className="flex items-center gap-2">
            <Switch checked={eventIsOnline} onCheckedChange={setEventIsOnline} id="is-online" />
            <label htmlFor="is-online" className="text-sm">Online-Event</label>
          </div>
          {!eventIsOnline ? (
            <Input placeholder="Ort" value={eventLocation} onChange={(e) => setEventLocation(e.target.value)} />
          ) : (
            <Input placeholder="Link (optional)" value={eventLink} onChange={(e) => setEventLink(e.target.value)} />
          )}
        </div>
      )}

      {/* External toolbars can point to these inputs via htmlFor */}
      {/* File uploads are now handled by AttachmentUploader */}

      {/* Hidden submit button for external triggers */}
      <button id="createpost-submit" onClick={handleSubmit} className="sr-only" aria-hidden="true">
        Submit
      </button>

      {!hideBottomBar && (
        <div className="flex justify-between items-center">
          <div className="text-sm text-muted-foreground">
            {content.length}/500 Zeichen
          </div>
          <Button 
            disabled={isSubmitting || !((() => { const pollValid = showPoll && !!pollQuestion.trim() && pollOptions.filter(o=>o.trim()).length>=2; const eventValid = showEvent && !!eventTitle.trim() && eventStartDate && eventStartTime && eventEndDate && eventEndTime; const needsMinText = pollValid || attachments.length > 0; return needsMinText ? content.trim().length >= 10 : Boolean(content.trim() || attachments.length > 0 || pollValid || eventValid); })())}
            onClick={handleSubmit}
            className="flex items-center gap-2"
          >
            <Send className="h-4 w-4" />
            {isSubmitting ? "Wird veröffentlicht..." : "Posten"}
          </Button>
        </div>
      )}
    </div>
  );

  if (container === "none") {
    return <div className="p-0">{Inner}</div>;
  }

  return (
    <Card>
      <CardContent className="p-6">
        {Inner}
      </CardContent>
    </Card>
  );
};
