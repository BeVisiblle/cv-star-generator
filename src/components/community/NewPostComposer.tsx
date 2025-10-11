import { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/hooks/use-toast";
import { subscribeOpenPostComposer } from "@/lib/event-bus";
import { Loader2, Image as ImageIcon, FileText, X } from "lucide-react";
import { useQueryClient } from "@tanstack/react-query";
import { capitalizeFirst } from "@/lib/utils";

interface MediaFile {
  file: File;
  preview: string;
}

interface DocumentFile {
  file: File;
  name: string;
}

export default function NewPostComposer() {
  const [isOpen, setIsOpen] = useState(false);
  const [content, setContent] = useState("");
  const [media, setMedia] = useState<MediaFile[]>([]);
  const [documents, setDocuments] = useState<DocumentFile[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { user } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();

  useEffect(() => {
    const unsubscribe = subscribeOpenPostComposer(() => {
      if (user) {
        setIsOpen(true);
      } else {
        toast({
          title: "Anmeldung erforderlich",
          description: "Bitte melde dich an, um einen Beitrag zu erstellen.",
          variant: "destructive",
        });
      }
    });
    return unsubscribe;
  }, [user, toast]);

  const handleClose = () => {
    setIsOpen(false);
    setContent("");
    setMedia([]);
    setDocuments([]);
  };

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    const newMedia = files.map(file => ({
      file,
      preview: URL.createObjectURL(file),
    }));
    setMedia(prev => [...prev, ...newMedia]);
  };

  const handleDocumentUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    const newDocs = files.map(file => ({
      file,
      name: file.name,
    }));
    setDocuments(prev => [...prev, ...newDocs]);
  };

  const removeMedia = (index: number) => {
    setMedia(prev => {
      URL.revokeObjectURL(prev[index].preview);
      return prev.filter((_, i) => i !== index);
    });
  };

  const removeDocument = (index: number) => {
    setDocuments(prev => prev.filter((_, i) => i !== index));
  };

  const uploadFile = async (file: File, bucket: string, folder: string): Promise<string> => {
    const fileExt = file.name.split('.').pop();
    const fileName = `${folder}/${user!.id}/${Date.now()}.${fileExt}`;
    
    const { error: uploadError, data } = await supabase.storage
      .from(bucket)
      .upload(fileName, file);

    if (uploadError) throw uploadError;

    const { data: { publicUrl } } = supabase.storage
      .from(bucket)
      .getPublicUrl(fileName);

    return publicUrl;
  };

  const handleSubmit = async () => {
    if (!content.trim() && media.length === 0 && documents.length === 0) {
      toast({
        title: "Leerer Beitrag",
        description: "Bitte füge Text, Bilder oder Dokumente hinzu.",
        variant: "destructive",
      });
      return;
    }

    setIsSubmitting(true);

    try {
      // Upload media files
      const mediaUrls = await Promise.all(
        media.map(m => uploadFile(m.file, 'post-media', 'images'))
      );

      // Upload documents
      const documentUrls = await Promise.all(
        documents.map(d => uploadFile(d.file, 'post-documents', 'docs'))
      );

      // Create post with auto-capitalization
      const mediaUrl = mediaUrls.length > 0 ? mediaUrls[0] : null;
      const { error } = await supabase.from("posts").insert({
        content: capitalizeFirst(content.trim()),
        user_id: user!.id,
        image_url: mediaUrl,
      });

      if (error) throw error;

      toast({
        title: "Beitrag erstellt",
        description: "Dein Beitrag wurde erfolgreich veröffentlicht.",
      });

      // Invalidate queries to refresh feed
      queryClient.invalidateQueries({ queryKey: ["clean-feed"] });
      queryClient.invalidateQueries({ queryKey: ["home-feed"] });

      handleClose();
    } catch (error: any) {
      console.error("Error creating post:", error);
      toast({
        title: "Fehler",
        description: "Der Beitrag konnte nicht erstellt werden.",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-[600px]">
        <DialogHeader>
          <DialogTitle>Beitrag erstellen</DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          <Textarea
            placeholder="Was möchtest du teilen?"
            value={content}
            onChange={(e) => setContent(e.target.value)}
            className="min-h-[120px] resize-none"
          />

          {/* Media Preview */}
          {media.length > 0 && (
            <div className="grid grid-cols-2 gap-2">
              {media.map((m, i) => (
                <div key={i} className="relative group">
                  <img
                    src={m.preview}
                    alt={`Upload ${i + 1}`}
                    className="w-full h-32 object-cover rounded-lg"
                  />
                  <button
                    onClick={() => removeMedia(i)}
                    className="absolute top-2 right-2 p-1 bg-destructive text-destructive-foreground rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
                  >
                    <X className="h-4 w-4" />
                  </button>
                </div>
              ))}
            </div>
          )}

          {/* Documents List */}
          {documents.length > 0 && (
            <div className="space-y-2">
              {documents.map((doc, i) => (
                <div key={i} className="flex items-center justify-between p-2 bg-muted rounded-lg">
                  <div className="flex items-center gap-2">
                    <FileText className="h-4 w-4 text-muted-foreground" />
                    <span className="text-sm truncate">{doc.name}</span>
                  </div>
                  <button
                    onClick={() => removeDocument(i)}
                    className="p-1 hover:bg-destructive/10 rounded"
                  >
                    <X className="h-4 w-4 text-destructive" />
                  </button>
                </div>
              ))}
            </div>
          )}

          {/* Upload Buttons */}
          <div className="flex gap-2">
            <label className="cursor-pointer">
              <input
                type="file"
                accept="image/*"
                multiple
                className="hidden"
                onChange={handleImageUpload}
              />
              <Button variant="outline" size="sm" type="button" asChild>
                <span>
                  <ImageIcon className="h-4 w-4 mr-2" />
                  Bilder
                </span>
              </Button>
            </label>

            <label className="cursor-pointer">
              <input
                type="file"
                accept=".pdf,.doc,.docx,.txt"
                multiple
                className="hidden"
                onChange={handleDocumentUpload}
              />
              <Button variant="outline" size="sm" type="button" asChild>
                <span>
                  <FileText className="h-4 w-4 mr-2" />
                  Dokumente
                </span>
              </Button>
            </label>
          </div>

          {/* Action Buttons */}
          <div className="flex justify-end gap-2">
            <Button variant="outline" onClick={handleClose} disabled={isSubmitting}>
              Abbrechen
            </Button>
            <Button onClick={handleSubmit} disabled={isSubmitting}>
              {isSubmitting && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
              Posten
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
