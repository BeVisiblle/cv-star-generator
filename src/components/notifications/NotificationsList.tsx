import { useEffect } from 'react';
import NotificationCard from './NotificationCard';
import { useNotifications } from '@/hooks/useNotifications';
import type { RecipientType } from '@/types/notifications';

type Props = {
  recipientType: RecipientType;
  recipientId: string | null;
  onAction?: Parameters<typeof NotificationCard>[0]['onAction'];
};

export default function NotificationsList({ recipientType, recipientId, onAction }: Props) {
  const { items, loading, hasMore, fetchPage, markRead, reset } =
    useNotifications(recipientType, recipientId);

  useEffect(() => {
    reset();
  }, [recipientId, recipientType, reset]);

  useEffect(() => {
    fetchPage();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [recipientId]);

  return (
    <div className="space-y-3">
      {items.map(n => (
        <NotificationCard key={n.id} n={n} onRead={markRead} onAction={onAction} />
      ))}

      {loading && (
        <div className="rounded-2xl border bg-card p-4">
          <div className="h-4 w-40 animate-pulse rounded bg-muted" />
          <div className="mt-2 h-4 w-64 animate-pulse rounded bg-muted" />
        </div>
      )}

      {!loading && hasMore && (
        <button
          onClick={fetchPage}
          className="mx-auto block rounded-xl border px-4 py-2 text-sm hover:bg-accent"
        >
          Mehr laden
        </button>
      )}

      {!loading && !items.length && (
        <div className="rounded-2xl border bg-card p-8 text-center text-sm text-muted-foreground">
          Keine Benachrichtigungen.
        </div>
      )}
    </div>
  );
}