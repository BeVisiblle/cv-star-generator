import { useState, useEffect, useCallback } from 'react';
import { NotificationService } from '@/services/notificationService';
import type { NotificationRow, RecipientType } from '@/types/notifications';

interface UseRecipientNotificationsResult {
  items: NotificationRow[];
  loading: boolean;
  hasMore: boolean;
  error: string | null;
  fetchPage: () => Promise<void>;
  markRead: (id: string) => Promise<void>;
  markAllRead: () => Promise<void>;
  reset: () => void;
}

export function useRecipientNotifications(
  recipientType: RecipientType,
  recipientId: string | null
): UseRecipientNotificationsResult {
  const [items, setItems] = useState<NotificationRow[]>([]);
  const [loading, setLoading] = useState(false);
  const [hasMore, setHasMore] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [cursor, setCursor] = useState<string | undefined>();

  const reset = useCallback(() => {
    setItems([]);
    setCursor(undefined);
    setHasMore(true);
    setError(null);
  }, []);

  const fetchPage = useCallback(async () => {
    if (!recipientId || loading) return;

    setLoading(true);
    setError(null);

    try {
      const result = await NotificationService.fetchPage({
        recipientType,
        recipientId,
        cursor,
      });

      if (result.error) {
        setError(result.error);
      } else {
        if (cursor) {
          setItems(prev => [...prev, ...result.data]);
        } else {
          setItems(result.data);
        }
        setHasMore(result.hasMore);
        setCursor(result.nextCursor);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unknown error');
    } finally {
      setLoading(false);
    }
  }, [recipientType, recipientId, cursor, loading]);

  const markRead = useCallback(async (id: string) => {
    const result = await NotificationService.markAsRead(id);
    if (result.success) {
      setItems(prev => prev.map(item => 
        item.id === id ? { ...item, read_at: new Date().toISOString() } : item
      ));
    }
  }, []);

  const markAllRead = useCallback(async () => {
    if (!recipientId) return;
    
    const result = await NotificationService.markAllAsRead(recipientType, recipientId);
    if (result.success) {
      const now = new Date().toISOString();
      setItems(prev => prev.map(item => ({ ...item, read_at: now })));
    }
  }, [recipientType, recipientId]);

  useEffect(() => {
    reset();
  }, [recipientType, recipientId, reset]);

  return {
    items,
    loading,
    hasMore,
    error,
    fetchPage,
    markRead,
    markAllRead,
    reset,
  };
}