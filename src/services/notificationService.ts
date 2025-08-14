import { supabase } from '@/integrations/supabase/client';
import type { NotificationRow, RecipientType } from '@/types/notifications';

export interface NotificationQuery {
  recipientType: RecipientType;
  recipientId: string;
  cursor?: string;
  limit?: number;
}

export interface NotificationResponse {
  data: NotificationRow[];
  hasMore: boolean;
  nextCursor?: string;
  error?: string;
}

/**
 * Service for handling notification-related API calls
 * Centralizes all Supabase interactions for notifications
 */
export class NotificationService {
  private static readonly PAGE_SIZE = 20;

  /**
   * Fetch a page of notifications with cursor-based pagination
   */
  static async fetchPage(query: NotificationQuery): Promise<NotificationResponse> {
    const { recipientType, recipientId, cursor, limit = this.PAGE_SIZE } = query;

    try {
      const q = supabase
        .from('notifications')
        .select('*')
        .eq('recipient_type', recipientType)
        .eq('recipient_id', recipientId)
        .order('created_at', { ascending: false })
        .limit(limit);

      if (cursor) {
        q.lt('created_at', cursor);
      }

      const { data, error } = await q;

      if (error) {
        console.error('NotificationService.fetchPage:', error);
        return { data: [], hasMore: false, error: error.message };
      }

      const notifications = (data || []) as NotificationRow[];
      const hasMore = notifications.length === limit;
      const nextCursor = notifications.length > 0 
        ? notifications[notifications.length - 1].created_at 
        : undefined;

      return {
        data: notifications,
        hasMore,
        nextCursor,
      };
    } catch (error) {
      console.error('NotificationService.fetchPage:', error);
      return { 
        data: [], 
        hasMore: false, 
        error: error instanceof Error ? error.message : 'Unknown error' 
      };
    }
  }

  /**
   * Mark a single notification as read
   */
  static async markAsRead(notificationId: string): Promise<{ success: boolean; error?: string }> {
    try {
      const { error } = await supabase
        .from('notifications')
        .update({ read_at: new Date().toISOString() })
        .eq('id', notificationId);

      if (error) {
        console.error('NotificationService.markAsRead:', error);
        return { success: false, error: error.message };
      }

      return { success: true };
    } catch (error) {
      console.error('NotificationService.markAsRead:', error);
      return { 
        success: false, 
        error: error instanceof Error ? error.message : 'Unknown error' 
      };
    }
  }

  /**
   * Mark all unread notifications as read for a recipient
   */
  static async markAllAsRead(
    recipientType: RecipientType, 
    recipientId: string
  ): Promise<{ success: boolean; error?: string }> {
    try {
      const { error } = await supabase
        .from('notifications')
        .update({ read_at: new Date().toISOString() })
        .eq('recipient_type', recipientType)
        .eq('recipient_id', recipientId)
        .is('read_at', null);

      if (error) {
        console.error('NotificationService.markAllAsRead:', error);
        return { success: false, error: error.message };
      }

      return { success: true };
    } catch (error) {
      console.error('NotificationService.markAllAsRead:', error);
      return { 
        success: false, 
        error: error instanceof Error ? error.message : 'Unknown error' 
      };
    }
  }

  /**
   * Subscribe to real-time notification updates
   */
  static subscribeToUpdates(
    recipientType: RecipientType,
    recipientId: string,
    onInsert: (notification: NotificationRow) => void
  ) {
    const channel = supabase
      .channel(`notif-${recipientType}-${recipientId}`)
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'notifications',
          filter: `recipient_type=eq.${recipientType},recipient_id=eq.${recipientId}`,
        },
        (payload: any) => {
          onInsert(payload.new as NotificationRow);
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }
}