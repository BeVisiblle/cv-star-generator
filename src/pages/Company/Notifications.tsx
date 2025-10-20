import { useState } from 'react';
import { NotificationsListWithFilters } from '@/components/notifications/NotificationsListWithFilters';
import { NotificationPreferencesDialog } from '@/components/notifications/NotificationPreferencesDialog';
import { useCompany } from '@/hooks/useCompany';
import { useNotifications } from '@/hooks/useNotifications';
import { Settings } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/hooks/useAuth';

export default function CompanyNotifications() {
  const { company } = useCompany();
  const { profile } = useAuth();
  const [prefsOpen, setPrefsOpen] = useState(false);
  
  const { markAllRead } = useNotifications(
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
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setPrefsOpen(true)}
            >
              <Settings className="h-4 w-4 mr-2" />
              Einstellungen
            </Button>
            <button
              onClick={markAllRead}
              className="rounded-lg border px-4 py-2 text-sm hover:bg-accent transition-colors"
              title="Alle ungelesenen Benachrichtigungen als gelesen markieren"
            >
              Alle als gelesen markieren
            </button>
          </div>
        </div>

        {/* Notifications List */}
        <div className="bg-card rounded-lg border p-4">
          <NotificationsListWithFilters
            recipientType="company"
            recipientId={company.id}
            onAction={(notification, action) => {
              console.log('Company notification action:', notification.id, action);
            }}
          />
        </div>

        {profile && (
          <NotificationPreferencesDialog
            open={prefsOpen}
            onOpenChange={setPrefsOpen}
            userId={profile.id}
          />
        )}
      </div>
    </main>
  );
}