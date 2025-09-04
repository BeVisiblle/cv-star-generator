import NotificationsList from '@/components/notifications/NotificationsList';
import { useCompany } from '@/hooks/useCompany';
import { useRecipientNotifications } from '@/hooks/useRecipientNotifications';

export default function CompanyNotifications() {
  const { company } = useCompany();
  
  const { markAllRead } = useRecipientNotifications(
    'company',
    company?.id ?? null
  );

  if (!company) {
    return (
      <div className="flex items-center justify-center min-h-96">
        <div className="text-center">
          <p className="text-muted-foreground">Unternehmen nicht gefunden</p>
        </div>
      </div>
    );
  }

  return (
    <main className="w-full overflow-x-hidden p-6">
      <div className="mx-auto max-w-4xl">
        {/* Header with "Mark all as read" button */}
        <div className="mb-6 flex items-center justify-between">
          <h1 className="text-2xl font-semibold">Benachrichtigungen</h1>
          <button
            onClick={markAllRead}
            className="rounded-lg border px-4 py-2 text-sm hover:bg-accent transition-colors"
            title="Alle ungelesenen Benachrichtigungen als gelesen markieren"
          >
            Alle als gelesen markieren
          </button>
        </div>

        {/* Notifications List */}
        <div className="bg-card rounded-lg border">
          <NotificationsList
            recipientType="company"
            recipientId={company.id}
            onAction={(notification, action) => {
              console.log('Company notification action:', notification.id, action);
              // TODO: Add specific company notification actions if needed
            }}
          />
        </div>
      </div>
    </main>
  );
}