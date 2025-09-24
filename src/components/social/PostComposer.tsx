import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { ImageIcon, Calendar, FileText, BarChart3, MapPin } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

interface PostComposerProps {
  authorId: string;
  companyId?: string;
  onPostCreated?: () => void;
}

export default function PostComposer({ authorId, companyId, onPostCreated }: PostComposerProps) {
  const [content, setContent] = useState("");
  const [schedule, setSchedule] = useState(false);
  const [scheduledAt, setScheduledAt] = useState<Date | null>(null);
  const [isPosting, setIsPosting] = useState(false);
  const { toast } = useToast();

  const canPublish = content.trim().length > 0 && (!schedule || !!scheduledAt);

  const onPublish = async () => {
    if (!canPublish) return;
    
    setIsPosting(true);
    try {
      const payload: any = {
        author_user_id: authorId,
        body_md: content,
        status: schedule ? "scheduled" : "published",
        post_kind: "text",
        visibility: "public"
      };

      if (schedule && scheduledAt) {
        payload.scheduled_at = scheduledAt.toISOString();
      }

      if (companyId) {
        payload.actor_company_id = companyId;
        payload.author_user_id = null;
      }

      const { error } = await supabase.from("community_posts").insert(payload);

      if (error) {
        console.error("Post creation error:", error);
        toast({
          title: "Fehler beim Posten",
          description: error.message,
          variant: "destructive",
        });
        return;
      }

      setContent("");
      setSchedule(false);
      setScheduledAt(null);
      
      toast({
        title: schedule ? "Post geplant" : "Post veröffentlicht",
        description: schedule 
          ? `Wird am ${scheduledAt?.toLocaleDateString()} um ${scheduledAt?.toLocaleTimeString()} veröffentlicht`
          : "Dein Post ist jetzt live",
      });

      onPostCreated?.();
    } catch (error) {
      console.error("Post creation error:", error);
      toast({
        title: "Fehler",
        description: "Beim Posten ist ein Fehler aufgetreten",
        variant: "destructive",
      });
    } finally {
      setIsPosting(false);
    }
  };

  const formatDatetimeLocal = (date: Date | null) => {
    if (!date) return "";
    const localDate = new Date(date.getTime() - date.getTimezoneOffset() * 60000);
    return localDate.toISOString().slice(0, 16);
  };

  return (
    <Card className="rounded-2xl border-border/50">
      <CardContent className="p-6 space-y-4">
        <Textarea
          placeholder="Was möchtest du posten?"
          value={content}
          onChange={(e) => setContent(e.target.value)}
          className="min-h-[120px] resize-none border-0 p-0 text-base focus-visible:ring-0"
        />
        
        <div className="flex items-center justify-between pt-4 border-t border-border/50">
          <div className="flex items-center gap-3">
            <Button variant="ghost" size="sm" className="h-9 px-3">
              <ImageIcon className="h-4 w-4 mr-2" />
              Bild/Video
            </Button>
            <Button variant="ghost" size="sm" className="h-9 px-3">
              <Calendar className="h-4 w-4 mr-2" />
              Event
            </Button>
            <Button variant="ghost" size="sm" className="h-9 px-3">
              <FileText className="h-4 w-4 mr-2" />
              Dokument
            </Button>
            <Button variant="ghost" size="sm" className="h-9 px-3">
              <BarChart3 className="h-4 w-4 mr-2" />
              Umfrage
            </Button>
          </div>

          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2">
              <Switch
                checked={schedule}
                onCheckedChange={setSchedule}
                id="schedule-toggle"
              />
              <label htmlFor="schedule-toggle" className="text-sm text-muted-foreground">
                Später planen
              </label>
            </div>

            {schedule && (
              <input
                type="datetime-local"
                className="px-3 py-2 border border-border rounded-lg text-sm"
                value={formatDatetimeLocal(scheduledAt)}
                onChange={(e) => setScheduledAt(new Date(e.target.value))}
                min={new Date().toISOString().slice(0, 16)}
              />
            )}

            <Button 
              disabled={!canPublish || isPosting} 
              onClick={onPublish}
              className="px-6"
            >
              {isPosting ? "Wird gepostet..." : "Veröffentlichen"}
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}