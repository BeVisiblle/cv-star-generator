import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/lib/supabase';
import type { Notification } from '@/types/groups';

export function useNotifications() {
  return useQuery({
    queryKey: ['notifications'],
    queryFn: async (): Promise<Notification[]> => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return [];

      const { data: notifications, error } = await supabase
        .from('notifications')
        .select(`
          *,
          profiles!notifications_from_user_id_fkey (
            id,
            username,
            full_name,
            avatar_url
          )
        `)
        .eq('user_id', user.id)
        .order('created_at', { ascending: false })
        .limit(50);

      if (error) {
        console.error('Error fetching notifications:', error);
        return [];
      }

      return notifications || [];
    },
    staleTime: 30000, // 30 seconds
    refetchInterval: 60000, // Refetch every minute
  });
}

export function useUnreadNotificationCount() {
  return useQuery({
    queryKey: ['unread-notification-count'],
    queryFn: async (): Promise<number> => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return 0;

      const { count, error } = await supabase
        .from('notifications')
        .select('*', { count: 'exact', head: true })
        .eq('user_id', user.id)
        .eq('is_read', false);

      if (error) {
        console.error('Error fetching unread count:', error);
        return 0;
      }

      return count || 0;
    },
    staleTime: 30000,
    refetchInterval: 60000,
  });
}

export function useMarkNotificationAsRead() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (notificationId: string) => {
      const { error } = await supabase
        .from('notifications')
        .update({ is_read: true })
        .eq('id', notificationId);

      if (error) {
        throw new Error(`Failed to mark notification as read: ${error.message}`);
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['notifications'] });
      queryClient.invalidateQueries({ queryKey: ['unread-notification-count'] });
    },
  });
}

export function useMarkAllNotificationsAsRead() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('User not authenticated');

      const { error } = await supabase
        .from('notifications')
        .update({ is_read: true })
        .eq('user_id', user.id)
        .eq('is_read', false);

      if (error) {
        throw new Error(`Failed to mark all notifications as read: ${error.message}`);
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['notifications'] });
      queryClient.invalidateQueries({ queryKey: ['unread-notification-count'] });
    },
  });
}

export function useDeleteNotification() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (notificationId: string) => {
      const { error } = await supabase
        .from('notifications')
        .delete()
        .eq('id', notificationId);

      if (error) {
        throw new Error(`Failed to delete notification: ${error.message}`);
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['notifications'] });
      queryClient.invalidateQueries({ queryKey: ['unread-notification-count'] });
    },
  });
}

// Helper function to create notifications
export async function createNotification(data: {
  userId: string;
  type: 'answer' | 'question' | 'mention' | 'group_invite' | 'system';
  title: string;
  message: string;
  relatedId?: string;
  fromUserId?: string;
}): Promise<{ success: boolean; error?: string }> {
  try {
    const { error } = await supabase
      .from('notifications')
      .insert({
        user_id: data.userId,
        type: data.type,
        title: data.title,
        message: data.message,
        related_id: data.relatedId,
        from_user_id: data.fromUserId,
        is_read: false
      });

    if (error) {
      throw new Error(`Failed to create notification: ${error.message}`);
    }

    return { success: true };

  } catch (error) {
    console.error('Create notification error:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error occurred'
    };
  }
}

// Helper function to create notification for answer
export async function createAnswerNotification(
  questionAuthorId: string,
  answerAuthorId: string,
  questionId: string,
  answerContent: string
): Promise<void> {
  if (questionAuthorId === answerAuthorId) return; // Don't notify self

  await createNotification({
    userId: questionAuthorId,
    type: 'answer',
    title: 'New Answer',
    message: `Someone answered your question: "${answerContent.substring(0, 100)}..."`,
    relatedId: questionId,
    fromUserId: answerAuthorId
  });
}

// Helper function to create notification for question
export async function createQuestionNotification(
  groupMemberIds: string[],
  questionAuthorId: string,
  questionId: string,
  questionTitle: string,
  groupTitle: string
): Promise<void> {
  const notifications = groupMemberIds
    .filter(memberId => memberId !== questionAuthorId) // Don't notify self
    .map(memberId => createNotification({
      userId: memberId,
      type: 'question',
      title: 'New Question',
      message: `New question in ${groupTitle}: "${questionTitle}"`,
      relatedId: questionId,
      fromUserId: questionAuthorId
    }));

  await Promise.all(notifications);
}