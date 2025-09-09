// lib/uploads.ts
import { supabase } from '@/integrations/supabase/client';

export type UploadedAttachment = {
  id: string;
  storage_path: string;
  mime_type: string;
  size_bytes?: number;
  width?: number;
  height?: number;
  url: string; // öffentlich oder signed URL
};

export const MAX_FILE_BYTES = 10 * 1024 * 1024; // 10 MB
export const ALLOWED_MIME = new Set([
  'image/jpeg', 'image/png', 'image/webp', 'image/gif',
  'application/pdf',
]);

export function isAllowedFile(file: File) {
  return ALLOWED_MIME.has(file.type) && file.size <= MAX_FILE_BYTES;
}

export function humanFileSize(bytes: number) {
  const units = ['B','KB','MB','GB'];
  let i = 0; let n = bytes;
  while (n >= 1024 && i < units.length-1) { n /= 1024; i++; }
  return `${n.toFixed(1)} ${units[i]}`;
}

export async function uploadToSupabase(file: File, bucket: 'images'|'attachments' = 'attachments'): Promise<UploadedAttachment> {
  const ext = file.name.split('.').pop()?.toLowerCase() || 'bin';
  const path = `${bucket}/${Date.now()}-${Math.random().toString(36).slice(2)}.${ext}`;
  const { data, error } = await supabase.storage.from(bucket).upload(path.replace(`${bucket}/`, ''), file, { upsert: false });
  if (error) throw error;
  const { data: pub } = supabase.storage.from(bucket).getPublicUrl(data.path);
  
  // naive Dimensionserkennung nur für Bilder
  let width: number | undefined; let height: number | undefined;
  if (file.type.startsWith('image/')) {
    const img = await new Promise<HTMLImageElement>((resolve, reject) => {
      const i = new Image();
      i.onload = () => resolve(i);
      i.onerror = reject;
      i.src = pub.publicUrl;
    });
    width = img.naturalWidth; height = img.naturalHeight;
  }
  
  return {
    id: crypto.randomUUID(),
    storage_path: data.path,
    mime_type: file.type,
    size_bytes: file.size,
    width, height,
    url: pub.publicUrl,
  };
}

export async function saveAttachmentToDatabase(attachment: UploadedAttachment, ownerId: string): Promise<void> {
  const { error } = await supabase
    .from('attachments')
    .insert({
      id: attachment.id,
      owner_id: ownerId,
      storage_path: attachment.storage_path,
      mime_type: attachment.mime_type,
      size_bytes: attachment.size_bytes,
      width: attachment.width,
      height: attachment.height,
    });
  
  if (error) throw error;
}

export async function linkAttachmentToPost(attachmentId: string, postId: string): Promise<void> {
  const { error } = await supabase
    .from('attachment_links')
    .insert({
      attachment_id: attachmentId,
      post_id: postId,
    });
  
  if (error) throw error;
}

export async function linkAttachmentToComment(attachmentId: string, commentId: string): Promise<void> {
  const { error } = await supabase
    .from('attachment_links')
    .insert({
      attachment_id: attachmentId,
      comment_id: commentId,
    });
  
  if (error) throw error;
}