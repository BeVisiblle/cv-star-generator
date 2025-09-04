import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
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
    queryFn: async (): Promise<Question[]> => {
      let query = supabase
        .from('questions')
        .select(`
          *,
          answers(count)
        `)
        .eq('group_id', groupId)
        .order('created_at', { ascending: false });

      if (filters?.status) {
        query = query.eq('status', filters.status);
      }
      if (filters?.search) {
        query = query.or(`title.ilike.%${filters.search}%,body.ilike.%${filters.search}%`);
      }

      const { data, error } = await query;
      if (error) throw error;
      return data as Question[];
    },
    staleTime: 30000,
  });
};

export const useQuestion = (id: string) => {
  return useQuery({
    queryKey: ['question', id],
    queryFn: async (): Promise<Question | null> => {
      const { data, error } = await supabase
        .from('questions')
        .select(`
          *,
          answers(
            *
          )
        `)
        .eq('id', id)
        .single();

      if (error) {
        if (error.code === 'PGRST116') return null;
        throw error;
      }
      return data as Question;
    },
    staleTime: 30000,
  });
};

export const useCreateQuestion = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (data: CreateQuestionRequest): Promise<Question> => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('User not authenticated');

      const { data: question, error } = await supabase
        .from('questions')
        .insert({
          group_id: data.groupId,
          author_id: user.id,
          file_id: data.fileId,
          page_id: data.pageId,
          anchor: data.anchor,
          title: data.title,
          body: data.body,
          tags: data.tags || [],
        })
        .select()
        .single();

      if (error) throw error;
      return question as Question;
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['questions', variables.groupId] });
    },
  });
};

export const useCreateAnswer = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (data: CreateAnswerRequest): Promise<Answer> => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('User not authenticated');

      const { data: answer, error } = await supabase
        .from('answers')
        .insert({
          question_id: data.questionId,
          author_id: user.id,
          body: data.body,
        })
        .select()
        .single();

      if (error) throw error;
      return answer as Answer;
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['question', variables.questionId] });
    },
  });
};

export const useAcceptAnswer = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (answerId: string): Promise<void> => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('User not authenticated');

      // First get the answer to verify the user can accept it
      const { data: answer, error: fetchError } = await supabase
        .from('answers')
        .select(`
          id,
          question_id,
          questions (
            author_id
          )
        `)
        .eq('id', answerId)
        .single();

      if (fetchError) {
        throw new Error(`Answer not found: ${fetchError.message}`);
      }

      if (!answer.questions || (answer.questions as any).author_id !== user.id) {
        throw new Error('Only the question author can accept answers');
      }

      // Update answer as accepted
      const { error: updateError } = await supabase
        .from('answers')
        .update({ is_accepted: true })
        .eq('id', answerId);

      if (updateError) throw updateError;

      // Update question status
      const { error: questionError } = await supabase
        .from('questions')
        .update({ 
          status: 'answered',
          accepted_answer_id: answerId,
        })
        .eq('id', answer.question_id);

      if (questionError) throw questionError;
    },
    onSuccess: (_, answerId) => {
      queryClient.invalidateQueries({ queryKey: ['question'] });
      queryClient.invalidateQueries({ queryKey: ['questions'] });
    },
  });
};