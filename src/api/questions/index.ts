import { supabase } from '@/lib/supabase';
import type { Question, Answer, Annotation } from '@/types/groups';

export interface CreateQuestionData {
  fileId: string;
  pageNumber: number;
  content: string;
  position?: {
    x: number;
    y: number;
    width: number;
    height: number;
  };
  context?: string;
}

export interface CreateAnswerData {
  questionId: string;
  content: string;
  pageNumber?: number;
  position?: {
    x: number;
    y: number;
    width: number;
    height: number;
  };
}

export interface CreateAnnotationData {
  fileId: string;
  pageNumber: number;
  content: string;
  position: {
    x: number;
    y: number;
    width: number;
    height: number;
  };
  type: 'highlight' | 'note' | 'question';
}

export async function createQuestion(data: CreateQuestionData): Promise<{ success: boolean; questionId?: string; error?: string }> {
  try {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      throw new Error('User not authenticated');
    }

    // Check if user has access to the file
    const { data: file } = await supabase
      .from('files')
      .select(`
        id,
        groups!inner (
          id,
          group_members!inner (
            user_id
          )
        )
      `)
      .eq('id', data.fileId)
      .eq('groups.group_members.user_id', user.id)
      .single();

    if (!file) {
      throw new Error('You do not have access to this file');
    }

    const { data: question, error } = await supabase
      .from('questions')
      .insert({
        file_id: data.fileId,
        page_number: data.pageNumber,
        content: data.content,
        position: data.position,
        context: data.context,
        author_id: user.id,
        status: 'open'
      })
      .select()
      .single();

    if (error) {
      throw new Error(`Failed to create question: ${error.message}`);
    }

    return { success: true, questionId: question.id };

  } catch (error) {
    console.error('Create question error:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error occurred'
    };
  }
}

export async function createAnswer(data: CreateAnswerData): Promise<{ success: boolean; answerId?: string; error?: string }> {
  try {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      throw new Error('User not authenticated');
    }

    // Check if user has access to the question's file
    const { data: question } = await supabase
      .from('questions')
      .select(`
        id,
        file_id,
        files!inner (
          groups!inner (
            group_members!inner (
              user_id
            )
          )
        )
      `)
      .eq('id', data.questionId)
      .eq('files.groups.group_members.user_id', user.id)
      .single();

    if (!question) {
      throw new Error('You do not have access to this question');
    }

    const { data: answer, error } = await supabase
      .from('answers')
      .insert({
        question_id: data.questionId,
        content: data.content,
        page_number: data.pageNumber,
        position: data.position,
        author_id: user.id
      })
      .select()
      .single();

    if (error) {
      throw new Error(`Failed to create answer: ${error.message}`);
    }

    return { success: true, answerId: answer.id };

  } catch (error) {
    console.error('Create answer error:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error occurred'
    };
  }
}

export async function acceptAnswer(answerId: string): Promise<{ success: boolean; error?: string }> {
  try {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      throw new Error('User not authenticated');
    }

    // Get the answer and check if user is the question author
    const { data: answer, error: fetchError } = await supabase
      .from('answers')
      .select(`
        id,
        question_id,
        questions (
          user_id
        )
      `)
      .eq('id', answerId)
      .single();

    if (fetchError) {
      throw new Error(`Answer not found: ${fetchError.message}`);
    }

    if (!answer.questions || (answer.questions as any).user_id !== user.id) {
      throw new Error('Only the question author can accept answers');
    }

    // Update answer as accepted
    const { error: updateError } = await supabase
      .from('answers')
      .update({ is_accepted: true })
      .eq('id', answerId);

    if (updateError) {
      throw new Error(`Failed to accept answer: ${updateError.message}`);
    }

    // Close the question
    const { error: closeError } = await supabase
      .from('questions')
      .update({ status: 'closed' })
      .eq('id', answer.question_id);

    if (closeError) {
      console.warn('Failed to close question:', closeError);
    }

    return { success: true };

  } catch (error) {
    console.error('Accept answer error:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error occurred'
    };
  }
}

export async function createAnnotation(data: CreateAnnotationData): Promise<{ success: boolean; annotationId?: string; error?: string }> {
  try {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      throw new Error('User not authenticated');
    }

    // Check if user has access to the file
    const { data: file } = await supabase
      .from('files')
      .select(`
        id,
        groups!inner (
          group_members!inner (
            user_id
          )
        )
      `)
      .eq('id', data.fileId)
      .eq('groups.group_members.user_id', user.id)
      .single();

    if (!file) {
      throw new Error('You do not have access to this file');
    }

    const { data: annotation, error } = await supabase
      .from('annotations')
      .insert({
        file_id: data.fileId,
        page_number: data.pageNumber,
        content: data.content,
        position: data.position,
        type: data.type,
        author_id: user.id
      })
      .select()
      .single();

    if (error) {
      throw new Error(`Failed to create annotation: ${error.message}`);
    }

    return { success: true, annotationId: annotation.id };

  } catch (error) {
    console.error('Create annotation error:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error occurred'
    };
  }
}

export async function voteOnContent(contentType: 'question' | 'answer', contentId: string, voteType: 'up' | 'down'): Promise<{ success: boolean; error?: string }> {
  try {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      throw new Error('User not authenticated');
    }

    const tableName = contentType === 'question' ? 'questions' : 'answers';
    const voteValue = voteType === 'up' ? 1 : -1;

    // Check if user already voted
    const { data: existingVote } = await supabase
      .from('votes')
      .select('id, vote_type')
      .eq('content_type', contentType)
      .eq('content_id', contentId)
      .eq('user_id', user.id)
      .single();

    if (existingVote) {
      if (existingVote.vote_type === voteValue) {
        // Remove vote
        await supabase
          .from('votes')
          .delete()
          .eq('id', existingVote.id);
      } else {
        // Update vote
        await supabase
          .from('votes')
          .update({ vote_type: voteValue })
          .eq('id', existingVote.id);
      }
    } else {
      // Create new vote
      await supabase
        .from('votes')
        .insert({
          content_type: contentType,
          content_id: contentId,
          user_id: user.id,
          vote_type: voteValue
        });
    }

    return { success: true };

  } catch (error) {
    console.error('Vote error:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error occurred'
    };
  }
}
