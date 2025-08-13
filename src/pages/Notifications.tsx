import NotificationsList from '@/components/notifications/NotificationsList';
import NotifSettingsPanel from '@/components/notifications/NotifSettingsPanel';
import { useAuth } from '@/hooks/useAuth';
import { useNotifications } from '@/hooks/useNotifications';
import { Card, CardContent } from '@/components/ui/card';

export default function NotificationsPage() {
  const { profile } = useAuth();
  const isCompany = false; // TODO: Implement company context detection
  const companyId = null; // TODO: Get from company context

  const { markAllRead } = useNotifications(
    isCompany ? 'company' : 'profile',
    isCompany ? companyId : profile?.id ?? null
  );

  return (
    <div className="min-h-screen bg-background">
      <div className="mx-auto grid max-w-[1200px] grid-cols-1 gap-6 p-3 md:grid-cols-[280px_minmax(0,1fr)_280px] md:p-6">
        {/* Linke Rail: Mini-Profil */}
        <aside className="space-y-3">
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <div className="h-10 w-10 rounded-full bg-muted" />
                <div>
                  <div className="text-sm font-semibold">
                    {profile?.display_name || 'Dein Profil'}
                  </div>
                  <div className="text-xs text-muted-foreground">
                    {isCompany ? 'Unternehmen' : 'Profil'}
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          <a href="/settings/notifications" className="block rounded-2xl border bg-card p-4 text-sm hover:bg-accent">
            Einstellungen
          </a>

          {/* Settings direkt einblenden */}
          <NotifSettingsPanel userId={profile?.id ?? null} />
        </aside>

        {/* Mitte: Notifications */}
        <main className="space-y-3">
          <div className="sticky top-14 z-10 -mx-3 mb-2 bg-background/70 px-3 py-2 backdrop-blur md:mx-0 md:rounded-2xl md:border">
            <div className="flex flex-wrap items-center justify-between gap-2">
              <span className="text-sm font-medium">Benachrichtigungen</span>
              <button
                onClick={markAllRead}
                className="rounded-lg border px-3 py-1.5 text-xs hover:bg-accent"
                title="Alle ungelesenen Benachrichtigungen als gelesen markieren"
              >
                Alle als gelesen markieren
              </button>
            </div>
          </div>

          <NotificationsList
            recipientType={isCompany ? 'company' : 'profile'}
            recipientId={isCompany ? companyId : profile?.id ?? null}
            onAction={(n, action) => {
              // TODO: verbinde mit deinen Edge Functions (accept/decline/etc.)
              console.log('action', n.id, action);
            }}
          />
        </main>

        {/* Rechte Rail: Werbung / Promo */}
        <aside className="space-y-3">
          <Card>
            <CardContent className="p-4">
              <div className="text-sm font-semibold">Sponsored</div>
              <div className="mt-2 h-24 rounded-lg bg-muted" />
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4">
              <div className="text-sm font-semibold">Interessante Unternehmen</div>
              <ul className="mt-2 space-y-2 text-sm text-muted-foreground">
                <li><a href="#" className="underline hover:text-foreground">Muster GmbH</a></li>
                <li><a href="#" className="underline hover:text-foreground">Elektro & Co.</a></li>
              </ul>
            </CardContent>
          </Card>
        </aside>
      </div>
    </div>
  );
}