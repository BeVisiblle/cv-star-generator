import { useState } from 'react';
import { NotificationsListWithFilters } from '@/components/notifications/NotificationsListWithFilters';
import { NotificationPreferencesDialog } from '@/components/notifications/NotificationPreferencesDialog';
import { useAuth } from '@/hooks/useAuth';
import { useNotifications } from '@/hooks/useNotifications';
import { LeftPanel } from '@/components/dashboard/LeftPanel';
import { RightPanel } from '@/components/dashboard/RightPanel';
import { Settings } from 'lucide-react';
import { Button } from '@/components/ui/button';

export default function NotificationsPage() {
  const { profile } = useAuth();
  const isCompany = false;
  const companyId = null;
  const [prefsOpen, setPrefsOpen] = useState(false);

  const { markAllRead } = useNotifications(
    isCompany ? 'company' : 'profile',
    isCompany ? companyId : profile?.id ?? null
  );

  return (
    <main className="w-full overflow-x-hidden">
      <h1 className="sr-only">Benachrichtigungen</h1>
      <div className="mx-auto max-w-screen-2xl px-3 sm:px-6 lg:px-8 py-3 md:py-4">
        <div className="flex gap-4 lg:gap-6">
          {/* Left column (fixed width) */}
          <aside className="hidden lg:block w-[280px] xl:w-[320px] shrink-0">
            <div className="sticky top-14 space-y-4">
              <LeftPanel />
            </div>
          </aside>

          {/* Center column (flex grows) */}
          <section className="flex-1 min-w-0">
            <div className="w-full max-w-[560px] mx-auto px-4 md:max-w-none md:px-0 space-y-4">
              {/* Header with "Mark all as read" button */}
              <div className="sticky top-14 z-30 -mx-4 mb-2 bg-background/70 px-4 py-2 backdrop-blur md:mx-0 md:rounded-2xl md:border">
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <span className="text-lg font-medium">Benachrichtigungen</span>
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
                      className="rounded-lg border px-3 py-1.5 text-xs hover:bg-accent"
                      title="Alle ungelesenen Benachrichtigungen als gelesen markieren"
                    >
                      Alle als gelesen markieren
                    </button>
                  </div>
                </div>
              </div>

              <NotificationsListWithFilters
                recipientType={isCompany ? 'company' : 'profile'}
                recipientId={isCompany ? companyId : profile?.id ?? null}
                onAction={(n, action) => {
                  console.log('action', n.id, action);
                }}
              />

              {profile && (
                <NotificationPreferencesDialog
                  open={prefsOpen}
                  onOpenChange={setPrefsOpen}
                  userId={profile.id}
                />
              )}
            </div>
          </section>

          {/* Right column (fixed width) */}
          <aside className="hidden xl:block w-[320px] shrink-0">
            <div className="sticky top-14 space-y-4">
              <RightPanel />
            </div>
          </aside>
        </div>
      </div>
    </main>
  );
}