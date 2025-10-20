import { useEffect } from 'react';
import { EmptyState } from '@/components/shared/EmptyState';
import { LoadingSkeleton } from '@/components/shared/LoadingSkeleton';
import { useNotifications } from '@/hooks/useNotifications';
import type { NotificationRow, NotifType } from '@/types/notifications';
import type { RecipientType } from '@/types/notifications';
import NotificationCard from './NotificationCard';

type Props = {
  recipientType: RecipientType;
  recipientId: string | null;
  filter?: NotifType[] | 'unread' | null;
  onAction?: Parameters<typeof NotificationCard>[0]['onAction'];
};

export default function NotificationsList({ recipientType, recipientId, filter, onAction }: Props) {
  const { items, loading, hasMore, error, fetchPage, markRead, reset } =
    useNotifications(recipientType, recipientId);

  // Filter items based on filter prop
  const filteredItems = items.filter(n => {
    if (!filter) return true;
    if (filter === 'unread') return !n.read_at;
    if (Array.isArray(filter)) return filter.includes(n.type);
    return true;
  });

  useEffect(() => {
    reset();
  }, [recipientId, recipientType, reset]);

  useEffect(() => {
    fetchPage();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [recipientId]);

  if (error) {
    return (
      <div className="space-y-3">
        <EmptyState 
          text={`Fehler beim Laden der Benachrichtigungen: ${error}`}
          icon="⚠️"
          action={
            <button 
              onClick={fetchPage}
              className="text-sm text-primary hover:underline"
            >
              Erneut versuchen
            </button>
          }
        />
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {filteredItems.map(n => (
        <NotificationCard key={n.id} n={n} onRead={markRead} onAction={onAction} />
      ))}

      {loading && <LoadingSkeleton rows={2} showAvatar={false} />}

      {!loading && hasMore && (
        <button
          onClick={fetchPage}
          className="mx-auto block rounded-xl border px-4 py-2 text-sm hover:bg-accent"
        >
          Mehr laden
        </button>
      )}

      {!loading && filteredItems.length === 0 && (
        <EmptyState 
          text="Keine Benachrichtigungen." 
          icon="🔔"
        />
      )}
    </div>
  );
}