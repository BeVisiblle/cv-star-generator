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

// Hilfsfunktion für Dateinamen
const makeFilePath = (userId: string, file: File) => {
  const ext = file.name.split(".").pop() || "jpg";
  const stamp = Date.now();
  return `${userId}/${stamp}-${Math.random().toString(36).slice(2)}.${ext}`;
};

interface CreatePostProps {
  container?: "card" | "none";
  hideHeader?: boolean;
  hideBottomBar?: boolean;
  onStateChange?: (isSubmitting: boolean, canPost: boolean) => void;
  onPostSuccess?: () => void;
}

export const CreatePost = ({ 
  container = "card", 
  hideHeader = false, 
  hideBottomBar = false, 
  onStateChange,
  onPostSuccess
}: CreatePostProps) => {
  const [content, setContent] = useState("");
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  
  const { user } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const createPostMutation = useMutation({
    mutationFn: async ({ content, imageFile }: { content: string, imageFile: File | null }) => {
      const { data: authData } = await supabase.auth.getUser();
      const user = authData.user;
      if (!user) throw new Error("Not authenticated");

      console.log('Creating post with content:', content, 'image:', !!imageFile);
      let image_url: string | null = null;

      // 1) Bild zu Storage hochladen (falls vorhanden)
      if (imageFile) {
        const bucket = "post-images";
        const filePath = makeFilePath(user.id, imageFile);
        
        console.log('🖼️ Starting image upload...');
        console.log('  - Bucket:', bucket);
        console.log('  - File path:', filePath);
        console.log('  - File type:', imageFile.type);
        console.log('  - File size:', imageFile.size, 'bytes');
        
        // Direkt hochladen ohne getBucket check (kann falsch negativ sein)
        console.log('📤 Attempting direct upload...');
        
        const { data: uploadData, error: uploadError } = await supabase.storage
          .from(bucket)
          .upload(filePath, imageFile, {
            cacheControl: "3600",
            upsert: false,
            contentType: imageFile.type || "image/jpeg",
          });
          
        if (uploadError) {
          console.error("❌ Image upload error:", uploadError);
          console.error("  - Error message:", uploadError.message);
          console.error("  - Error details:", JSON.stringify(uploadError, null, 2));
          
          // Nur bei echten Upload-Fehlern Alert zeigen
          if (uploadError.message.includes('Bucket not found') || uploadError.message.includes('bucket')) {
            alert(`BUCKET FEHLER!\n\nDer Bucket "${bucket}" wurde nicht gefunden.\n\nBitte:\n1. Gehen Sie zum Supabase Dashboard\n2. Storage → Buckets\n3. Erstellen Sie "${bucket}" als PUBLIC bucket\n\nFehler: ${uploadError.message}`);
          } else {
            alert(`UPLOAD FEHLER!\n\nMessage: ${uploadError.message}\n\nÖffnen Sie die Console (F12) für mehr Details.`);
          }
          
          toast({
            title: "Upload Fehler",
            description: `Bild konnte nicht hochgeladen werden: ${uploadError.message}`,
            variant: "destructive",
            duration: 10000,
          });
        } else {
          console.log('✅ Upload successful:', uploadData);
          
          // 2) Public URL holen
          const { data: pub } = supabase.storage.from(bucket).getPublicUrl(filePath);
          image_url = pub?.publicUrl || null;
          
          console.log('✅ Image uploaded successfully!');
          console.log('  - Public URL:', image_url);
          console.log('  - Full pub data:', pub);
          
          if (!image_url) {
            console.error('❌ Failed to get public URL!');
          }
        }
      } else {
        console.log('ℹ️ No image file provided');
      }

      // 3) Post in Datenbank speichern
      console.log('Saving post to DB with:', { content, user_id: user.id, image_url });
      
      const { data, error } = await supabase
        .from("community_posts" as any)
        .insert({
          body_md: content,
          actor_user_id: user.id,
          image_url: image_url
        })
        .select();

      console.log('Post creation result:', { data, error });
      
      if (error) {
        console.error('Post creation error:', error);
        throw error;
      }

      // Wenn keine Daten zurückkommen (RLS Problem), trotzdem als erfolgreich behandeln
      if (!data || data.length === 0) {
        console.warn('Post created but no data returned (RLS issue). Post should still be visible.');
        // Return mock data to avoid errors
        return [{ id: crypto.randomUUID(), content, user_id: user.id }];
      }
      
      // Verify data was saved
      console.log('Saved post:', data[0]);
      
      return data;
    },
    onSuccess: () => {
      // WICHTIG: Alle Feed Query-Keys invalidieren
      queryClient.invalidateQueries({ queryKey: ["posts"] });
      queryClient.invalidateQueries({ queryKey: ["clean-feed"] });
      queryClient.invalidateQueries({ queryKey: ["home-feed"] });
      queryClient.invalidateQueries({ queryKey: ["recent-community-posts"] });
      
      setContent("");
      setImageFile(null);
      setImagePreview(null);
      
      toast({
        title: "Beitrag veröffentlicht",
        description: "Dein Beitrag wurde erfolgreich geteilt.",
      });
      
      onPostSuccess?.();
      window.dispatchEvent(new CustomEvent('post-created'));
    },
    onError: (error) => {
      console.error("Error creating post:", error);
      toast({
        title: "Fehler",
        description: `Beitrag konnte nicht veröffentlicht werden: ${error.message}`,
        variant: "destructive",
      });
    },
  });

  // Notify parent on state changes
  useEffect(() => {
    const canPost = !!(content.trim() || imageFile) && !createPostMutation.isPending;
    const isSubmitting = createPostMutation.isPending;
    onStateChange?.(isSubmitting, canPost);
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

    createPostMutation.mutate({ content, imageFile });
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
                Öffentlich
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
                id="createpost-submit"
                type="submit"
                disabled={(!content.trim() && !imageFile) || createPostMutation.isPending}
              >
                {createPostMutation.isPending ? 'Wird veröffentlicht...' : 'Posten'}
              </Button>
            </div>
          </div>
        )}
      </form>
    </Wrapper>
  );
};

export default CreatePost;