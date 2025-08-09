import { useState } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { useToast } from "@/hooks/use-toast";
import { Send, Image, X } from "lucide-react";

export interface CreatePostProps {
  container?: "card" | "none"; // render inside Card (default) or bare content for composer dialog
  hideHeader?: boolean;          // hide avatar/header row (for dialog header)
  variant?: "default" | "composer"; // adjusts spacing/labels
}

export const CreatePost = ({ container = "card", hideHeader = false, variant = "default" }: CreatePostProps) => {
  const [content, setContent] = useState("");
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const queryClient = useQueryClient();
  const { toast } = useToast();

  const createPostMutation = useMutation({
    mutationFn: async ({ content, imageUrl }: { content: string; imageUrl?: string }) => {
      const { data: user } = await supabase.auth.getUser();
      if (!user.user) throw new Error("Not authenticated");

      const { data, error } = await supabase
        .from("posts")
        .insert({
          content,
          image_url: imageUrl,
          user_id: user.user.id,
          post_type: imageUrl ? "image" : "text"
        })
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["community-posts"] });
      setContent("");
      setImageFile(null);
      setImagePreview(null);
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

  const handleImageSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      setImageFile(file);
      const reader = new FileReader();
      reader.onload = (e) => {
        setImagePreview(e.target?.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const removeImage = () => {
    setImageFile(null);
    setImagePreview(null);
  };

  const uploadImage = async (file: File): Promise<string> => {
    const fileExt = file.name.split('.').pop();
    const fileName = `${Math.random()}.${fileExt}`;
    const filePath = `posts/${fileName}`;

    const { error: uploadError } = await supabase.storage
      .from('avatars')
      .upload(filePath, file);

    if (uploadError) throw uploadError;

    const { data: { publicUrl } } = supabase.storage
      .from('avatars')
      .getPublicUrl(filePath);

    return publicUrl;
  };

  const handleSubmit = async () => {
    if (!content.trim() && !imageFile) return;

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

      let imageUrl;
      if (imageFile) {
        imageUrl = await uploadImage(imageFile);
      }

      await createPostMutation.mutateAsync({ content, imageUrl });
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
        placeholder="Worüber möchten Sie sprechen?"
        value={content}
        onChange={(e) => setContent(e.target.value)}
        className={
          variant === 'composer' ? 'min-h-[280px] resize-none' : 'min-h-[100px] resize-none'
        }
      />

      {imagePreview && (
        <div className="relative inline-block">
          <img src={imagePreview} alt="Preview" className="max-h-60 rounded-lg border" />
          <Button
            variant="destructive"
            size="sm"
            className="absolute -top-2 -right-2 h-6 w-6 rounded-full p-0"
            onClick={removeImage}
          >
            <X className="h-3 w-3" />
          </Button>
        </div>
      )}

      <div className="flex justify-between items-center">
        <div className="flex items-center space-x-2">
          <input
            type="file"
            accept="image/*"
            onChange={handleImageSelect}
            className="hidden"
            id="image-upload"
          />
          <label htmlFor="image-upload">
            <Button variant="outline" size="sm" asChild className="cursor-pointer">
              <span>
                <Image className="h-4 w-4 mr-2" />
                Bild hinzufügen
              </span>
            </Button>
          </label>
          <div className="text-sm text-muted-foreground">
            {content.length}/500 Zeichen
          </div>
        </div>
        <Button 
          disabled={(!content.trim() && !imageFile) || isSubmitting}
          onClick={handleSubmit}
          className="flex items-center gap-2"
        >
          <Send className="h-4 w-4" />
          {isSubmitting ? "Wird veröffentlicht..." : "Posten"}
        </Button>
      </div>
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
