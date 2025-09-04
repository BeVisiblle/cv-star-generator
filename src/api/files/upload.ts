import { supabase } from '@/lib/supabase';
import { v4 as uuidv4 } from 'uuid';

export interface UploadResponse {
  success: boolean;
  fileId?: string;
  fileUrl?: string;
  thumbnailUrl?: string;
  error?: string;
}

export interface FileUploadData {
  file: File;
  groupId: string;
  title: string;
  description?: string;
}

export async function uploadFile(data: FileUploadData): Promise<UploadResponse> {
  try {
    const fileId = uuidv4();
    const fileExt = data.file.name.split('.').pop();
    const fileName = `${fileId}.${fileExt}`;
    const filePath = `${data.groupId}/${fileName}`;

    // Upload file to Supabase storage
    const { data: uploadData, error: uploadError } = await supabase.storage
      .from('files')
      .upload(filePath, data.file, {
        cacheControl: '3600',
        upsert: false
      });

    if (uploadError) {
      throw new Error(`Upload failed: ${uploadError.message}`);
    }

    // Get public URL
    const { data: { publicUrl } } = supabase.storage
      .from('files')
      .getPublicUrl(filePath);

    // Create file record in database
    const { data: fileRecord, error: dbError } = await supabase
      .from('files')
      .insert({
        id: fileId,
        group_id: data.groupId,
        title: data.title,
        description: data.description,
        file_name: data.file.name,
        file_size: data.file.size,
        mime_type: data.file.type,
        file_url: publicUrl,
        uploaded_by: (await supabase.auth.getUser()).data.user?.id
      })
      .select()
      .single();

    if (dbError) {
      // Clean up uploaded file if database insert fails
      await supabase.storage.from('files').remove([filePath]);
      throw new Error(`Database error: ${dbError.message}`);
    }

    // Generate thumbnail for PDF files
    let thumbnailUrl: string | undefined;
    if (data.file.type === 'application/pdf') {
      thumbnailUrl = await generatePdfThumbnail(fileId, data.file);
    }

    return {
      success: true,
      fileId: fileRecord.id,
      fileUrl: publicUrl,
      thumbnailUrl
    };

  } catch (error) {
    console.error('File upload error:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error occurred'
    };
  }
}

async function generatePdfThumbnail(fileId: string, file: File): Promise<string | undefined> {
  try {
    // This would typically use a server-side PDF processing service
    // For now, we'll return undefined and implement this later
    console.log(`Thumbnail generation for PDF ${fileId} would happen here`);
    return undefined;
  } catch (error) {
    console.error('Thumbnail generation error:', error);
    return undefined;
  }
}

export async function deleteFile(fileId: string): Promise<{ success: boolean; error?: string }> {
  try {
    // Get file record
    const { data: file, error: fetchError } = await supabase
      .from('files')
      .select('file_url, uploaded_by')
      .eq('id', fileId)
      .single();

    if (fetchError) {
      throw new Error(`File not found: ${fetchError.message}`);
    }

    // Check if user owns the file
    const { data: { user } } = await supabase.auth.getUser();
    if (file.uploaded_by !== user?.id) {
      throw new Error('Unauthorized to delete this file');
    }

    // Extract file path from URL
    const url = new URL(file.file_url);
    const filePath = url.pathname.split('/').slice(-2).join('/');

    // Delete from storage
    const { error: storageError } = await supabase.storage
      .from('files')
      .remove([filePath]);

    if (storageError) {
      console.warn('Storage deletion failed:', storageError);
    }

    // Delete from database
    const { error: dbError } = await supabase
      .from('files')
      .delete()
      .eq('id', fileId);

    if (dbError) {
      throw new Error(`Database deletion failed: ${dbError.message}`);
    }

    return { success: true };

  } catch (error) {
    console.error('File deletion error:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error occurred'
    };
  }
}