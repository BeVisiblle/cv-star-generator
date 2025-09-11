import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { X, FileText, Image as ImageIcon } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { toast } from 'sonner';

interface AttachmentUploaderProps {
  attachments: any[];
  onAttachmentsChange: (attachments: any[]) => void;
  maxFiles?: number;
}

export function AttachmentUploader({ 
  attachments, 
  onAttachmentsChange, 
  maxFiles = 4 
}: AttachmentUploaderProps) {
  const { user } = useAuth();
  const [uploading, setUploading] = useState(false);

  const handleFileSelect = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files;
    if (!files || !user) return;

    const newFiles = Array.from(files).slice(0, maxFiles - attachments.length);
    
    setUploading(true);
    
    try {
      const uploadPromises = newFiles.map(async (file) => {
        // Validate file type
        const allowedTypes = ['image/jpeg', 'image/png', 'image/webp', 'image/gif', 'application/pdf'];
        if (!allowedTypes.includes(file.type)) {
          toast.error(`Dateityp nicht unterstützt: ${file.name}`);
          return null;
        }

        // Validate file size (10MB max)
        if (file.size > 10 * 1024 * 1024) {
          toast.error(`Datei zu groß: ${file.name}`);
          return null;
        }

        const fileExt = file.name.split('.').pop();
        const fileName = `${user.id}/${Date.now()}-${Math.random().toString(36).slice(2)}.${fileExt}`;

        const { data, error } = await supabase.storage
          .from('post-attachments')
          .upload(fileName, file);

        if (error) throw error;

        const { data: publicUrl } = supabase.storage
          .from('post-attachments')
          .getPublicUrl(data.path);

        return {
          id: crypto.randomUUID(),
          name: file.name,
          type: file.type,
          size: file.size,
          url: publicUrl.publicUrl,
          path: data.path
        };
      });

      const uploadedFiles = (await Promise.all(uploadPromises)).filter(Boolean);
      onAttachmentsChange([...attachments, ...uploadedFiles]);
      
      if (uploadedFiles.length > 0) {
        toast.success(`${uploadedFiles.length} Datei(en) erfolgreich hochgeladen`);
      }
    } catch (error) {
      console.error('Error uploading files:', error);
      toast.error('Fehler beim Hochladen der Dateien');
    } finally {
      setUploading(false);
    }

    // Reset input
    event.target.value = '';
  };

  const removeAttachment = async (index: number) => {
    const attachment = attachments[index];
    
    // Delete from storage
    if (attachment.path) {
      await supabase.storage
        .from('post-attachments')
        .remove([attachment.path]);
    }
    
    onAttachmentsChange(attachments.filter((_, i) => i !== index));
  };

  return (
    <div className="space-y-3">
      {attachments.length > 0 && (
        <div className="grid grid-cols-2 gap-2">
          {attachments.map((attachment, index) => (
            <div key={attachment.id} className="relative group">
              {attachment.type?.startsWith('image/') ? (
                <div className="relative">
                  <img
                    src={attachment.url}
                    alt={attachment.name}
                    className="w-full h-24 object-cover rounded-lg"
                  />
                  <Button
                    variant="destructive"
                    size="sm"
                    className="absolute top-1 right-1 h-6 w-6 p-0 opacity-0 group-hover:opacity-100 transition-opacity"
                    onClick={() => removeAttachment(index)}
                  >
                    <X className="h-3 w-3" />
                  </Button>
                </div>
              ) : (
                <div className="relative bg-muted rounded-lg p-3 border-2 border-dashed border-muted-foreground/25">
                  <div className="flex items-center gap-2">
                    <FileText className="h-4 w-4 text-muted-foreground" />
                    <div className="flex-1 min-w-0">
                      <p className="text-xs font-medium truncate">{attachment.name}</p>
                      <p className="text-xs text-muted-foreground">
                        {(attachment.size / 1024 / 1024).toFixed(1)} MB
                      </p>
                    </div>
                    <Button
                      variant="destructive"
                      size="sm"
                      className="h-6 w-6 p-0 opacity-0 group-hover:opacity-100 transition-opacity"
                      onClick={() => removeAttachment(index)}
                    >
                      <X className="h-3 w-3" />
                    </Button>
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
      )}
      
      {attachments.length < maxFiles && (
        <div>
          <Input
            type="file"
            multiple
            accept="image/*,application/pdf"
            onChange={handleFileSelect}
            disabled={uploading}
            className="hidden"
            id="file-upload"
          />
          <Button
            variant="outline"
            className="w-full"
            disabled={uploading}
            onClick={() => document.getElementById('file-upload')?.click()}
          >
            <ImageIcon className="h-4 w-4 mr-2" />
            {uploading ? 'Wird hochgeladen...' : 'Dateien hinzufügen'}
          </Button>
        </div>
      )}
    </div>
  );
}