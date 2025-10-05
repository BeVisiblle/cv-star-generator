import { ReactNode } from 'react';

interface NewPostsNotificationProps {
  onRefresh?: () => void;
  currentPostIds?: string[];
  feedHeadHeight?: number;
}

export default function NewPostsNotification({ 
  onRefresh, 
  currentPostIds, 
  feedHeadHeight 
}: NewPostsNotificationProps): ReactNode {
  return null;
}
