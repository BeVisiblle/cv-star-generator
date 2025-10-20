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
  jobs: ['pipeline_activity_team', 'new_matches_available', 'pipeline_move_for_you'],
  profile: ['company_unlocked_you', 'follow_request_received', 'profile_incomplete_reminder'],
  social: ['post_interaction', 'follow_accepted_chat_unlocked', 'employment_request', 'employment_accepted', 'employment_declined'],
};

export function NotificationsListWithFilters({ recipientType, recipientId, onAction }: Props) {
  const [filter, setFilter] = useState<keyof typeof FILTER_GROUPS>('all');

  return (
    <Tabs value={filter} onValueChange={(v) => setFilter(v as any)}>
      <TabsList className="w-full justify-start mb-4">
        <TabsTrigger value="all">Alle</TabsTrigger>
        <TabsTrigger value="unread">Ungelesen</TabsTrigger>
        <TabsTrigger value="jobs">Jobs</TabsTrigger>
        <TabsTrigger value="profile">Profil</TabsTrigger>
        <TabsTrigger value="social">Social</TabsTrigger>
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
  );
}
