import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import type { 
  File as GroupFile, 
  FilePage,
  Annotation,
  CreateAnnotationRequest 
} from '@/types/groups';

// Files API
export const useFiles = (groupId: string) => {
  return useQuery({
    queryKey: ['files', groupId],
    queryFn: async (): Promise<GroupFile[]> => {
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
      return data as GroupFile[];
    },
    staleTime: 30000,
  });
};

export const useFile = (id: string) => {
  return useQuery({
    queryKey: ['file', id],
    queryFn: async (): Promise<GroupFile | null> => {
      const { data, error } = await supabase
        .from('files')
        .select(`
          *,
          uploader:profiles(id, display_name, avatar_url),
          file_pages(*)
        `)
        .eq('id', id)
        .single();

      if (error) {
        if (error.code === 'PGRST116') return null;
        throw error;
      }
      return data as GroupFile;
    },
    staleTime: 30000,
  });
};

export const useFilePages = (fileId: string) => {
  return useQuery({
    queryKey: ['file-pages', fileId],
    queryFn: async (): Promise<FilePage[]> => {
      const { data, error } = await supabase
        .from('file_pages')
        .select('*')
        .eq('file_id', fileId)
        .order('page_number', { ascending: true });

      if (error) throw error;
      return data as FilePage[];
    },
    staleTime: 30000,
  });
};

export const useAnnotations = (fileId: string, pageId?: string) => {
  return useQuery({
    queryKey: ['annotations', fileId, pageId],
    queryFn: async (): Promise<Annotation[]> => {
      let query = supabase
        .from('annotations')
        .select('*')
        .eq('file_id', fileId);

      if (pageId) {
        query = query.eq('page_id', pageId);
      }

      const { data, error } = await query.order('created_at', { ascending: false });
      if (error) throw error;
      return data as Annotation[];
    },
    staleTime: 30000,
  });
};

export const useUploadFile = (groupId: string) => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (file: File) => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('User not authenticated');

      const buffer = await file.arrayBuffer();
      
      // Upload to Supabase storage
      const fileName = `${Date.now()}-${file.name}`;
      const { data: uploadData, error: uploadError } = await supabase.storage
        .from('group-files')
        .upload(fileName, buffer, {
          contentType: file.type,
          upsert: false
        });

      if (uploadError) {
        throw new Error(`Upload failed: ${uploadError.message}`);
      }

      // Get the public URL
      const { data: urlData } = supabase.storage
        .from('group-files')
        .getPublicUrl(fileName);

      // Save file info to database
      const { data, error } = await supabase
        .from('files')
        .insert({
          group_id: groupId,
          uploader_id: user.id,
          filename: file.name,
          mime_type: file.type,
          byte_size: file.size,
          checksum: fileName,
          storage_path: fileName,
        })
        .select()
        .single();

      if (error) throw error;

      return {
        file: data,
        url: urlData.publicUrl,
      };
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['files', groupId] });
    },
  });
};

export const useCreateAnnotation = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (data: CreateAnnotationRequest): Promise<Annotation> => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('User not authenticated');

      const { data: annotation, error } = await supabase
        .from('annotations')
        .insert({
          file_id: data.fileId,
          page_id: data.pageId,
          author_id: user.id,
          anchor: data.anchor,
          quote: data.quote,
          note: data.note,
          visibility: data.visibility || 'private',
        })
        .select()
        .single();

      if (error) throw error;
      return annotation as Annotation;
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['annotations', variables.fileId] });
    },
  });
};