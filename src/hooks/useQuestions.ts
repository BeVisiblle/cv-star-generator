import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/lib/supabase';
import type { 
  Question, 
  Answer,
  CreateQuestionRequest, 
  CreateAnswerRequest,
  QuestionFilters 
} from '@/types/groups';

// Questions API
export const useQuestions = (groupId: string, filters?: QuestionFilters) => {
  return useQuery({
    queryKey: ['questions', groupId, filters],
    queryFn: async () => {
      let query = supabase
        .from('questions')
        .select(`
          *,
          author:profiles(id, display_name, avatar_url),
          file:files(id, filename, mime_type),
          page:file_pages(id, page_number, thumb_path),
          answer_count:answers(count),
          vote_count:votes(count),
          user_vote:votes!left(value)
        `)
        .eq('group_id', groupId)
        .order('created_at', { ascending: false });

      if (filters?.status) {
        query = query.eq('status', filters.status);
      }
      if (filters?.file_id) {
        query = query.eq('file_id', filters.file_id);
      }
      if (filters?.tags && filters.tags.length > 0) {
        query = query.overlaps('tags', filters.tags);
      }
      if (filters?.author_id) {
        query = query.eq('author_id', filters.author_id);
      }

      const { data, error } = await query;
      if (error) throw error;
      return data as Question[];
    },
    enabled: !!groupId,
  });
};

export const useQuestion = (questionId: string) => {
  return useQuery({
    queryKey: ['question', questionId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('questions')
        .select(`
          *,
          author:profiles(id, display_name, avatar_url),
          file:files(id, filename, mime_type),
          page:file_pages(id, page_number, thumb_path),
          answer_count:answers(count),
          vote_count:votes(count),
          user_vote:votes!left(value)
        `)
        .eq('id', questionId)
        .single();

      if (error) throw error;
      return data as Question;
    },
    enabled: !!questionId,
  });
};

export const useCreateQuestion = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (data: CreateQuestionRequest) => {
      const { data: user } = await supabase.auth.getUser();
      if (!user.user) throw new Error('Not authenticated');

      const { data: question, error } = await supabase
        .from('questions')
        .insert({
          ...data,
          author_id: user.user.id,
        })
        .select()
        .single();

      if (error) throw error;
      return question;
    },
    onSuccess: (_, { group_id }) => {
      queryClient.invalidateQueries({ queryKey: ['questions', group_id] });
    },
  });
};

export const useUpdateQuestion = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ 
      questionId, 
      data 
    }: { 
      questionId: string; 
      data: Partial<CreateQuestionRequest> 
    }) => {
      const { error } = await supabase
        .from('questions')
        .update(data)
        .eq('id', questionId);

      if (error) throw error;
    },
    onSuccess: (_, { questionId }) => {
      queryClient.invalidateQueries({ queryKey: ['question', questionId] });
    },
  });
};

export const useDeleteQuestion = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (questionId: string) => {
      const { error } = await supabase
        .from('questions')
        .delete()
        .eq('id', questionId);

      if (error) throw error;
    },
    onSuccess: (_, questionId) => {
      queryClient.invalidateQueries({ queryKey: ['questions'] });
      queryClient.invalidateQueries({ queryKey: ['question', questionId] });
    },
  });
};

// Answers API
export const useAnswers = (questionId: string) => {
  return useQuery({
    queryKey: ['answers', questionId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('answers')
        .select(`
          *,
          author:profiles(id, display_name, avatar_url),
          vote_count:votes(count),
          user_vote:votes!left(value)
        `)
        .eq('question_id', questionId)
        .order('is_accepted', { ascending: false })
        .order('created_at', { ascending: true });

      if (error) throw error;
      return data as Answer[];
    },
    enabled: !!questionId,
  });
};

export const useAnswer = (answerId: string) => {
  return useQuery({
    queryKey: ['answer', answerId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('answers')
        .select(`
          *,
          author:profiles(id, display_name, avatar_url),
          vote_count:votes(count),
          user_vote:votes!left(value)
        `)
        .eq('id', answerId)
        .single();

      if (error) throw error;
      return data as Answer;
    },
    enabled: !!answerId,
  });
};

export const useCreateAnswer = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (data: CreateAnswerRequest) => {
      const { data: user } = await supabase.auth.getUser();
      if (!user.user) throw new Error('Not authenticated');

      const { data: answer, error } = await supabase
        .from('answers')
        .insert({
          ...data,
          author_id: user.user.id,
        })
        .select()
        .single();

      if (error) throw error;

      // Update question status to answered
      await supabase
        .from('questions')
        .update({ status: 'answered' })
        .eq('id', data.question_id);

      return answer;
    },
    onSuccess: (_, { question_id }) => {
      queryClient.invalidateQueries({ queryKey: ['answers', question_id] });
      queryClient.invalidateQueries({ queryKey: ['question', question_id] });
      queryClient.invalidateQueries({ queryKey: ['questions'] });
    },
  });
};

export const useUpdateAnswer = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ 
      answerId, 
      data 
    }: { 
      answerId: string; 
      data: Partial<CreateAnswerRequest> 
    }) => {
      const { error } = await supabase
        .from('answers')
        .update(data)
        .eq('id', answerId);

      if (error) throw error;
    },
    onSuccess: (_, { answerId }) => {
      queryClient.invalidateQueries({ queryKey: ['answer', answerId] });
    },
  });
};

export const useDeleteAnswer = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (answerId: string) => {
      const { error } = await supabase
        .from('answers')
        .delete()
        .eq('id', answerId);

      if (error) throw error;
    },
    onSuccess: (_, answerId) => {
      queryClient.invalidateQueries({ queryKey: ['answers'] });
      queryClient.invalidateQueries({ queryKey: ['answer', answerId] });
    },
  });
};

export const useAcceptAnswer = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (answerId: string) => {
      // Get the answer to find the question_id
      const { data: answer, error: answerError } = await supabase
        .from('answers')
        .select('question_id')
        .eq('id', answerId)
        .single();

      if (answerError) throw answerError;

      // Update the answer to be accepted
      const { error: updateError } = await supabase
        .from('answers')
        .update({ is_accepted: true })
        .eq('id', answerId);

      if (updateError) throw updateError;

      // Update the question status to solved and set accepted_answer_id
      const { error: questionError } = await supabase
        .from('questions')
        .update({ 
          status: 'solved',
          accepted_answer_id: answerId
        })
        .eq('id', answer.question_id);

      if (questionError) throw questionError;
    },
    onSuccess: (_, answerId) => {
      queryClient.invalidateQueries({ queryKey: ['answers'] });
      queryClient.invalidateQueries({ queryKey: ['answer', answerId] });
      queryClient.invalidateQueries({ queryKey: ['questions'] });
    },
  });
};

export const useUnacceptAnswer = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (answerId: string) => {
      // Get the answer to find the question_id
      const { data: answer, error: answerError } = await supabase
        .from('answers')
        .select('question_id')
        .eq('id', answerId)
        .single();

      if (answerError) throw answerError;

      // Update the answer to not be accepted
      const { error: updateError } = await supabase
        .from('answers')
        .update({ is_accepted: false })
        .eq('id', answerId);

      if (updateError) throw updateError;

      // Update the question status to answered and clear accepted_answer_id
      const { error: questionError } = await supabase
        .from('questions')
        .update({ 
          status: 'answered',
          accepted_answer_id: null
        })
        .eq('id', answer.question_id);

      if (questionError) throw questionError;
    },
    onSuccess: (_, answerId) => {
      queryClient.invalidateQueries({ queryKey: ['answers'] });
      queryClient.invalidateQueries({ queryKey: ['answer', answerId] });
      queryClient.invalidateQueries({ queryKey: ['questions'] });
    },
  });
};
