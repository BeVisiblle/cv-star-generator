import React, { useState, useEffect } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { ImageIcon, X } from "lucide-react";
import { useAuth } from "@/hooks/useAuth";

interface CreatePostProps {
  container?: "card" | "none";
  hideHeader?: boolean;
  variant?: "default" | "compact";
  hideBottomBar?: boolean;
  onStateChange?: (isOpen: boolean) => void;
  scheduledAt?: string;
  showPoll?: boolean;
  showEvent?: boolean;
  celebration?: boolean;
  visibility?: 'public' | 'followers' | 'connections';
  context?: 'user' | 'company';
  companyId?: string;
}

export const CreatePost = ({ 
  container = "card", 
  hideHeader = false, 
  variant = "default", 
  hideBottomBar = false, 
  onStateChange, 
  scheduledAt, 
  showPoll = false, 
  showEvent = false, 
  celebration = false, 
  visibility = 'public', 
  context = 'user', 
  companyId 
}: CreatePostProps) => {
  const [content, setContent] = useState("");
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [isExpanded, setIsExpanded] = useState(false);
  
  const { user } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const createPostMutation = useMutation({
    mutationFn: async ({ id, content, imageUrl }: { id: string; content: string; imageUrl?: string }) => {
      const { data: authData } = await supabase.auth.getUser();
      const user = authData.user;
      if (!user) throw new Error("Not authenticated");

      const scheduledISO = scheduledAt && new Date(scheduledAt) > new Date()
        ? new Date(scheduledAt).toISOString()
        : null;

      // Map UI visibility to DB values
      const dbVisibility = visibility || 'public';

      const { error } = await supabase
        .from("posts")
        .insert({
          id,
          content,
          image_url: imageUrl,
          user_id: context === 'company' ? null : user.id,
          author_type: context === 'company' ? 'company' : 'user',
          author_id: context === 'company' ? (companyId as string) : user.id,
          company_id: context === 'company' ? (companyId as string) : null,
          post_type: 'text',
          visibility: dbVisibility,
          status: scheduledISO ? 'scheduled' : 'published',
          scheduled_at: scheduledISO,
          published_at: scheduledISO || new Date().toISOString()
        });

      if (error) throw error;
      return { id };
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["home-feed"] });
      setContent("");
      setImageFile(null);
      setImagePreview(null);
      setIsExpanded(false);
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
    const canPost = (content.trim() || imageFile) && !createPostMutation.isPending;
    const isSubmitting = createPostMutation.isPending;
    onStateChange?.({ canPost, isSubmitting });
  }, [content, imageFile, createPostMutation.isPending, onStateChange]);

  const handleImageUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!content.trim() && !imageFile) return;

    const postId = crypto.randomUUID();
    let imageUrl: string | undefined;

    // Upload image if present
    if (imageFile) {
      const fileExt = imageFile.name.split('.').pop();
      const fileName = `${postId}.${fileExt}`;
      const filePath = `${user.id}/posts/${fileName}`;

      const { error: uploadError } = await supabase.storage
        .from('post-media')
        .upload(filePath, imageFile);

      if (uploadError) {
        toast({
          title: "Fehler beim Hochladen",
          description: "Das Bild konnte nicht hochgeladen werden.",
          variant: "destructive",
        });
        return;
      }

      const { data: { publicUrl } } = supabase.storage
        .from('post-media')
        .getPublicUrl(filePath);

      imageUrl = publicUrl;
    }

    createPostMutation.mutate({ id: postId, content, imageUrl });
  };

  const Wrapper = container === "card" ? Card : "div";
  const wrapperProps = container === "card" ? { className: "p-4" } : {};

  return (
    <Wrapper {...wrapperProps}>
      <form onSubmit={handleSubmit} className="space-y-4">
        {!hideHeader && (
          <div className="flex items-center gap-3">
            <Avatar className="h-10 w-10">
              <AvatarImage src={user?.user_metadata?.avatar_url} />
              <AvatarFallback>
                {user?.user_metadata?.full_name?.charAt(0) || "U"}
              </AvatarFallback>
            </Avatar>
            <div>
              <div className="font-medium text-sm">
                {user?.user_metadata?.full_name || "Unbekannter Nutzer"}
              </div>
              <div className="text-xs text-muted-foreground">
                {visibility === 'public' ? 'Öffentlich' : 
                 visibility === 'followers' ? 'Nur Follower' : 
                 'Nur Kontakte'}
              </div>
            </div>
          </div>
        )}

        <div className="space-y-3">
          <Textarea
            value={content}
            onChange={(e) => setContent(e.target.value)}
            placeholder="Was möchtest du teilen?"
            className="min-h-[100px] resize-none"
            onFocus={() => setIsExpanded(true)}
          />

          {imagePreview && (
            <div className="relative">
              <img
                src={imagePreview}
                alt="Preview"
                className="w-full max-h-96 object-cover rounded-lg"
              />
              <Button
                type="button"
                variant="destructive"
                size="sm"
                className="absolute top-2 right-2"
                onClick={removeImage}
              >
                <X className="h-4 w-4" />
              </Button>
            </div>
          )}
        </div>

        {/* Hidden image upload input - always present for external triggers */}
        <input
          id="image-upload"
          type="file"
          accept="image/*"
          onChange={handleImageUpload}
          className="hidden"
        />

        {!hideBottomBar && (
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <label htmlFor="image-upload" className="cursor-pointer">
                <ImageIcon className="h-5 w-5 text-muted-foreground hover:text-foreground" />
              </label>
            </div>

            <div className="flex items-center gap-2">
              <Button
                type="button"
                variant="outline"
                onClick={() => setIsExpanded(false)}
              >
                Abbrechen
              </Button>
              <Button
                id="createpost-submit"
                type="submit"
                disabled={!content.trim() && !imageFile}
                loading={createPostMutation.isPending}
              >
                Posten
              </Button>
            </div>
          </div>
        )}
      </form>
    </Wrapper>
  );
};

export default CreatePost;
