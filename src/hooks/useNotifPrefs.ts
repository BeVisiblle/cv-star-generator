import { useEffect, useMemo, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import type { NotifPrefRow, NotifType } from '@/types/notifications';

export const DEFAULT_TYPES: NotifType[] = [
  'company_unlocked_you',
  'follow_request_received',
  'pipeline_move_for_you',
  'post_interaction',
  'profile_incomplete_reminder',
  'weekly_digest_user',
  'new_matches_available',
  'follow_accepted_chat_unlocked',
  'candidate_response_to_unlock',
  'pipeline_activity_team',
  'low_tokens',
  'weekly_digest_company',
  'billing_update',
  'product_update',
];

export function useNotifPrefs(userId: string | null) {
  const [rows, setRows] = useState<NotifPrefRow[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    (async () => {
      if (!userId) return;
      setLoading(true);
      const { data, error } = await supabase.from('notification_prefs').select('*').eq('user_id', userId);
      if (!error && data) setRows(data as any);
      setLoading(false);
    })();
  }, [userId]);

  const upsert = async (type: NotifType, patch: Partial<Pick<NotifPrefRow, 'in_app' | 'email'>>) => {
    const existing = rows.find(r => r.type === type);
    const payload = {
      user_id: userId!,
      type,
      in_app: existing?.in_app ?? true,
      email: existing?.email ?? false,
      ...patch,
    };
    setRows(prev => {
      const next = prev.filter(p => p.type !== type);
      return [...next, { ...(existing as any), ...payload } as any];
    });
    const { error } = await supabase.from('notification_prefs').upsert(payload, { onConflict: 'user_id,type' });
    if (error) console.error(error);
  };

  return { rows, loading, upsert };
}