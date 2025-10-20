import { useEffect } from 'react';
import { Bell } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useNavigate } from 'react-router-dom';
import { useNotificationCount } from '@/hooks/useNotificationCount';
import { toast } from 'sonner';
import { supabase } from '@/integrations/supabase/client';
import type { RecipientType } from '@/types/notifications';

interface NotificationBellProps {
  recipientType: RecipientType;
  recipientId: string | null;
}

export function NotificationBell({ recipientType, recipientId }: NotificationBellProps) {
  const navigate = useNavigate();
  const { data, refetch } = useNotificationCount(recipientType, recipientId);
  const unreadCount = data?.unreadCount || 0;

  // Show toast on new notifications
  useEffect(() => {
    if (!recipientId) return;

    const channel = supabase
      .channel(`notif-bell-${recipientType}-${recipientId}`)
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'notifications',
          filter: `recipient_type=eq.${recipientType},recipient_id=eq.${recipientId}`,
        },
        (payload: any) => {
          const notif = payload.new;
          toast(notif.title, {
            description: notif.body,
            action: {
              label: 'Ansehen',
              onClick: () => navigate(recipientType === 'company' ? '/company/notifications' : '/notifications'),
            },
          });
          refetch();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [recipientId, recipientType, refetch, navigate]);

  return (
    <Button
      variant="ghost"
      size="icon"
      className="relative"
      onClick={() => navigate(recipientType === 'company' ? '/company/notifications' : '/notifications')}
    >
      <Bell className="h-5 w-5" />
      {unreadCount > 0 && (
        <Badge
          variant="destructive"
          className="absolute -top-1 -right-1 h-5 w-5 flex items-center justify-center p-0 text-xs"
        >
          {unreadCount > 9 ? '9+' : unreadCount}
        </Badge>
      )}
    </Button>
  );
}
