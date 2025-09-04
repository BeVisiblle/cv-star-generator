import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/lib/supabase';
import type { 
  File, 
  FilePage,
  Annotation,
  CreateAnnotationRequest 
} from '@/types/groups';

// Files API
export const useFiles = (groupId: string) => {
  return useQuery({
    queryKey: ['files', groupId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('files')
        .select(`
          *,
          uploader:profiles(id, display_name, avatar_url),
          page_count:file_pages(count)
        `)
        .eq('group_id', groupId)
        .order('created_at', { ascending: false });

      if (error) throw error;
      return data as File[];
    },
    enabled: !!groupId,
  });
};

export const useFile = (fileId: string) => {
  return useQuery({
    queryKey: ['file', fileId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('files')
        .select(`
          *,
          uploader:profiles(id, display_name, avatar_url),
          page_count:file_pages(count)
        `)
        .eq('id', fileId)
        .single();

      if (error) throw error;
      return data as File;
    },
    enabled: !!fileId,
  });
};

export const useFilePages = (fileId: string) => {
  return useQuery({
    queryKey: ['file-pages', fileId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('file_pages')
        .select('*')
        .eq('file_id', fileId)
        .order('page_number', { ascending: true });

      if (error) throw error;
      return data as FilePage[];
    },
    enabled: !!fileId,
  });
};

export const useFilePage = (pageId: string) => {
  return useQuery({
    queryKey: ['file-page', pageId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('file_pages')
        .select('*')
        .eq('id', pageId)
        .single();

      if (error) throw error;
      return data as FilePage;
    },
    enabled: !!pageId,
  });
};

export const useUploadFile = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ 
      file, 
      groupId, 
      metadata 
    }: { 
      file: File; 
      groupId: string; 
      metadata?: Record<string, any> 
    }) => {
      const { data: user } = await supabase.auth.getUser();
      if (!user.user) throw new Error('Not authenticated');

      // Calculate file hash for deduplication
      const fileBuffer = await file.arrayBuffer();
      const hashBuffer = await crypto.subtle.digest('SHA-256', fileBuffer);
      const hashArray = Array.from(new Uint8Array(hashBuffer));
      const checksum = hashArray.map(b => b.toString(16).padStart(2, '0')).join('');

      // Check if file already exists
      const { data: existingFile } = await supabase
        .from('files')
        .select('id')
        .eq('checksum', checksum)
        .single();

      if (existingFile) {
        return existingFile;
      }

      // Upload file to storage
      const fileName = `${Date.now()}-${file.name}`;
      const { data: uploadData, error: uploadError } = await supabase.storage
        .from('files')
        .upload(fileName, file);

      if (uploadError) throw uploadError;

      // Create file record
      const { data: fileRecord, error: fileError } = await supabase
        .from('files')
        .insert({
          group_id: groupId,
          uploader_id: user.user.id,
          filename: file.name,
          mime_type: file.type,
          byte_size: file.size,
          checksum,
          storage_path: uploadData.path,
          ...metadata,
        })
        .select()
        .single();

      if (fileError) throw fileError;

      // Trigger PDF processing
      try {
        await fetch('/api/files/process', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ fileId: fileRecord.id }),
        });
      } catch (error) {
        console.warn('Failed to trigger PDF processing:', error);
      }

      return fileRecord;
    },
    onSuccess: (_, { groupId }) => {
      queryClient.invalidateQueries({ queryKey: ['files', groupId] });
    },
  });
};

export const useDeleteFile = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (fileId: string) => {
      // Get file info
      const { data: file, error: fileError } = await supabase
        .from('files')
        .select('storage_path')
        .eq('id', fileId)
        .single();

      if (fileError) throw fileError;

      // Delete from storage
      const { error: storageError } = await supabase.storage
        .from('files')
        .remove([file.storage_path]);

      if (storageError) throw storageError;

      // Delete file record (cascades to file_pages)
      const { error: deleteError } = await supabase
        .from('files')
        .delete()
        .eq('id', fileId);

      if (deleteError) throw deleteError;
    },
    onSuccess: (_, fileId) => {
      queryClient.invalidateQueries({ queryKey: ['files'] });
      queryClient.invalidateQueries({ queryKey: ['file', fileId] });
    },
  });
};

// Annotations API
export const useAnnotations = (fileId: string) => {
  return useQuery({
    queryKey: ['annotations', fileId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('annotations')
        .select(`
          *,
          author:profiles(id, display_name, avatar_url)
        `)
        .eq('file_id', fileId)
        .order('created_at', { ascending: false });

      if (error) throw error;
      return data as Annotation[];
    },
    enabled: !!fileId,
  });
};

export const usePageAnnotations = (pageId: string) => {
  return useQuery({
    queryKey: ['page-annotations', pageId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('annotations')
        .select(`
          *,
          author:profiles(id, display_name, avatar_url)
        `)
        .eq('page_id', pageId)
        .order('created_at', { ascending: false });

      if (error) throw error;
      return data as Annotation[];
    },
    enabled: !!pageId,
  });
};

export const useCreateAnnotation = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (data: CreateAnnotationRequest) => {
      const { data: user } = await supabase.auth.getUser();
      if (!user.user) throw new Error('Not authenticated');

      const { data: annotation, error } = await supabase
        .from('annotations')
        .insert({
          ...data,
          author_id: user.user.id,
        })
        .select()
        .single();

      if (error) throw error;
      return annotation;
    },
    onSuccess: (_, { file_id, page_id }) => {
      queryClient.invalidateQueries({ queryKey: ['annotations', file_id] });
      queryClient.invalidateQueries({ queryKey: ['page-annotations', page_id] });
    },
  });
};

export const useUpdateAnnotation = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ 
      annotationId, 
      data 
    }: { 
      annotationId: string; 
      data: Partial<CreateAnnotationRequest> 
    }) => {
      const { error } = await supabase
        .from('annotations')
        .update(data)
        .eq('id', annotationId);

      if (error) throw error;
    },
    onSuccess: (_, { annotationId }) => {
      queryClient.invalidateQueries({ queryKey: ['annotations'] });
      queryClient.invalidateQueries({ queryKey: ['page-annotations'] });
    },
  });
};

export const useDeleteAnnotation = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (annotationId: string) => {
      const { error } = await supabase
        .from('annotations')
        .delete()
        .eq('id', annotationId);

      if (error) throw error;
    },
    onSuccess: (_, annotationId) => {
      queryClient.invalidateQueries({ queryKey: ['annotations'] });
      queryClient.invalidateQueries({ queryKey: ['page-annotations'] });
    },
  });
};

// PDF Search
export const useSearchPDF = () => {
  return useMutation({
    mutationFn: async ({ 
      fileId, 
      query, 
      pageId 
    }: { 
      fileId: string; 
      query: string; 
      pageId?: string 
    }) => {
      const { data, error } = await supabase
        .from('file_pages')
        .select('*')
        .eq('file_id', fileId)
        .textSearch('text', query);

      if (error) throw error;
      return data as FilePage[];
    },
  });
};
