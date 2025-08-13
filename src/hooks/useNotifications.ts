import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import type { NotificationRow, RecipientType } from '@/types/notifications';

const PAGE_SIZE = 20;

export function useNotifications(recipientType: RecipientType, recipientId: string | null) {
  const [items, setItems] = useState<NotificationRow[]>([]);
  const [loading, setLoading] = useState(false);
  const [hasMore, setHasMore] = useState(true);
  const cursorRef = useRef<string | null>(null); // created_at cursor (ISO)

  const fetchPage = useCallback(async () => {
    if (!recipientId || loading || !hasMore) return;
    setLoading(true);

    const q = supabase
      .from('notifications')
      .select('*')
      .eq('recipient_type', recipientType)
      .eq('recipient_id', recipientId)
      .order('created_at', { ascending: false })
      .limit(PAGE_SIZE);

    if (cursorRef.current) {
      // naive pagination: fetch older than cursor
      q.lt('created_at', cursorRef.current);
    }

    const { data, error } = await q;
    if (error) {
      console.error(error);
      setLoading(false);
      return;
    }

    if (data && data.length) {
      setItems(prev => [...prev, ...(data as NotificationRow[])]);
      cursorRef.current = data[data.length - 1].created_at;
      if (data.length < PAGE_SIZE) setHasMore(false);
    } else {
      setHasMore(false);
    }
    setLoading(false);
  }, [recipientId, recipientType, loading, hasMore]);

  // Realtime: prepend newest
  useEffect(() => {
    if (!recipientId) return;
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
          setItems(prev => [payload.new as NotificationRow, ...prev]);
        }
      )
      .subscribe();
    return () => {
      supabase.removeChannel(channel);
    };
  }, [recipientId, recipientType]);

  const markRead = useCallback(
    async (id: string) => {
      setItems(prev =>
        prev.map(n => (n.id === id ? { ...n, read_at: new Date().toISOString() } : n))
      );
      const { error } = await supabase.from('notifications').update({ read_at: new Date().toISOString() }).eq('id', id);
      if (error) console.error('markRead failed', error);
    },
    []
  );

  const markAllRead = useCallback(async () => {
    if (!recipientId) return;
    const now = new Date().toISOString();

    // Optimistisch im Client
    setItems(prev => prev.map(n => ({ ...n, read_at: n.read_at ?? now })));

    // Server
    const { error } = await supabase
      .from('notifications')
      .update({ read_at: now })
      .eq('recipient_type', recipientType)
      .eq('recipient_id', recipientId)
      .is('read_at', null);
    if (error) console.error('markAllRead failed', error);
  }, [recipientId, recipientType]);

  const reset = useCallback(() => {
    setItems([]);
    setHasMore(true);
    cursorRef.current = null;
  }, []);

  return { items, loading, hasMore, fetchPage, markRead, markAllRead, reset };
}