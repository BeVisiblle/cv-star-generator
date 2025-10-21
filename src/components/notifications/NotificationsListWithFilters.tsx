import { useState } from 'react';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import NotificationsList from './NotificationsList';
import type { RecipientType, NotifType } from '@/types/notifications';

interface Props {
  recipientType: RecipientType;
  recipientId: string | null;
  onAction?: (notification: any, action: string) => void;
}

const FILTER_GROUPS: Record<string, NotifType[] | 'unread' | null> = {
  all: null,
  unread: 'unread',
  jobs: ['pipeline_activity_team', 'new_matches_available', 'pipeline_move_for_you', 'application_received', 'application_withdrawn', 'job_post_approved', 'job_post_rejected', 'job_post_expiring'],
  profile: ['company_unlocked_you', 'follow_request_received', 'profile_incomplete_reminder'],
  social: ['post_interaction', 'follow_accepted_chat_unlocked', 'employment_request', 'employment_accepted', 'employment_declined', 'candidate_message'],
  billing: ['billing_update', 'billing_invoice_ready', 'low_tokens'],
};

export function NotificationsListWithFilters({ recipientType, recipientId, onAction }: Props) {
  const [filter, setFilter] = useState<keyof typeof FILTER_GROUPS>('all');

  return (
    <div className="w-full">
      <Tabs value={filter} onValueChange={(v) => setFilter(v as any)} className="w-full">
        <TabsList className="w-full grid grid-cols-6 mb-4">
          <TabsTrigger value="all">Alle</TabsTrigger>
          <TabsTrigger value="unread">Ungelesen</TabsTrigger>
          <TabsTrigger value="jobs">Jobs</TabsTrigger>
          <TabsTrigger value="profile">Profil</TabsTrigger>
          <TabsTrigger value="social">Social</TabsTrigger>
          <TabsTrigger value="billing">Abrechnung</TabsTrigger>
        </TabsList>

        <TabsContent value={filter} className="mt-0">
          <NotificationsList
            recipientType={recipientType}
            recipientId={recipientId}
            filter={FILTER_GROUPS[filter]}
            onAction={onAction}
          />
        </TabsContent>
      </Tabs>
    </div>
  );
}
