import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import type { RecipientType } from '@/types/notifications';

export function useNotificationCount(
  recipientType: RecipientType,
  recipientId: string | null
) {
  return useQuery({
    queryKey: ['notification-count', recipientType, recipientId],
    queryFn: async () => {
      if (!recipientId) return { unreadCount: 0 };

      const { count, error } = await supabase
        .from('notifications')
        .select('*', { count: 'exact', head: true })
        .eq('recipient_type', recipientType)
        .eq('recipient_id', recipientId)
        .is('read_at', null)
        .is('deleted_at', null);

      if (error) throw error;
      return { unreadCount: count || 0 };
    },
    enabled: !!recipientId,
    refetchInterval: 30000, // Refetch every 30s
  });
}
