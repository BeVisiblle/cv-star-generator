import { useNotifPrefs, DEFAULT_TYPES } from '@/hooks/useNotifPrefs';
import type { NotifType } from '@/types/notifications';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

type Props = { userId: string | null };

const LABELS: Record<NotifType, string> = {
  company_unlocked_you: 'Unternehmen hat dich freigeschaltet',
  follow_request_received: 'Neue Kontaktanfrage',
  pipeline_move_for_you: 'Pipeline-Status geändert',
  post_interaction: 'Interaktionen mit deinen Posts',
  profile_incomplete_reminder: 'Erinnerung: Profil vervollständigen',
  weekly_digest_user: 'Wöchentlicher Überblick (User)',
  new_matches_available: 'Neue passende Kandidaten verfügbar',
  follow_accepted_chat_unlocked: 'Follow akzeptiert (Chat frei)',
  candidate_response_to_unlock: 'Reaktion auf Freischaltung',
  pipeline_activity_team: 'Pipeline-Aktivität im Team',
  low_tokens: 'Tokens niedrig',
  weekly_digest_company: 'Wöchentlicher Überblick (Unternehmen)',
  billing_update: 'Rechnungen / Plan-Updates',
  product_update: 'Produkt-Updates',
  employment_request: 'Neue Beschäftigungsanfrage',
  employment_accepted: 'Beschäftigung bestätigt',
  employment_declined: 'Beschäftigung abgelehnt',
};

export default function NotifSettingsPanel({ userId }: Props) {
  const { rows, loading, upsert } = useNotifPrefs(userId);

  const get = (t: NotifType) => rows.find(r => r.type === t);

  return (
    <Card>
      <CardHeader>
        <CardTitle>Benachrichtigungseinstellungen</CardTitle>
        <p className="text-sm text-muted-foreground">
          Lege fest, welche Benachrichtigungen du in der App und per E‑Mail erhalten möchtest.
        </p>
      </CardHeader>
      <CardContent>
        <div className="divide-y">
          {DEFAULT_TYPES.map((type) => {
            const row = get(type);
            return (
              <div key={type} className="flex items-center justify-between py-3">
                <div className="pr-4">
                  <div className="text-sm font-medium">{LABELS[type]}</div>
                </div>
                <div className="flex items-center gap-4">
                  <label className="flex items-center gap-2 text-sm">
                    <input
                      type="checkbox"
                      className="h-4 w-4"
                      checked={row?.in_app ?? true}
                      onChange={(e) => upsert(type, { in_app: e.target.checked })}
                    />
                    In‑App
                  </label>
                  <label className="flex items-center gap-2 text-sm">
                    <input
                      type="checkbox"
                      className="h-4 w-4"
                      checked={row?.email ?? false}
                      onChange={(e) => upsert(type, { email: e.target.checked })}
                    />
                    E‑Mail
                  </label>
                </div>
              </div>
            );
          })}
        </div>

        {loading && (
          <div className="mt-3 text-sm text-muted-foreground">Lade Einstellungen …</div>
        )}
      </CardContent>
    </Card>
  );
}