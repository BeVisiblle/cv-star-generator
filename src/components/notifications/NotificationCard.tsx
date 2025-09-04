import React from 'react';
import { formatDistanceToNow } from 'date-fns';
import { de } from 'date-fns/locale';
import { Check, Bell, MessageSquare, Users, UserPlus, FileText } from 'lucide-react';
import { Button } from '@/components/ui/button';
import type { NotificationRow, NotifType } from '@/types/notifications';

interface NotificationCardProps {
  n: NotificationRow;
  onRead: (id: string) => Promise<void>;
  onAction?: (notification: NotificationRow, action: string) => void;
}

export default function NotificationCard({ n, onRead, onAction }: NotificationCardProps) {
  const getNotificationIcon = (type: NotifType) => {
    switch (type) {
      case 'post_interaction':
        return <MessageSquare className="h-4 w-4" />;
      case 'follow_request_received':
        return <UserPlus className="h-4 w-4" />;
      case 'employment_request':
        return <FileText className="h-4 w-4" />;
      case 'company_unlocked_you':
        return <Users className="h-4 w-4" />;
      default:
        return <Bell className="h-4 w-4" />;
    }
  };

  const getNotificationColor = (type: NotifType) => {
    switch (type) {
      case 'post_interaction':
        return 'text-green-600';
      case 'follow_request_received':
        return 'text-blue-600';
      case 'employment_request':
        return 'text-purple-600';
      case 'company_unlocked_you':
        return 'text-orange-600';
      default:
        return 'text-gray-600';
    }
  };

  return (
    <div
      className={`p-4 rounded-lg border transition-colors ${
        n.read_at 
          ? 'bg-muted/30' 
          : 'bg-primary/5 border-l-4 border-l-primary'
      }`}
    >
      <div className="flex items-start gap-3">
        <div className={`mt-1 ${getNotificationColor(n.type)}`}>
          {getNotificationIcon(n.type)}
        </div>
        
        <div className="flex-1 min-w-0">
          <div className="flex items-start justify-between">
            <div className="flex-1">
              <h4 className="font-medium text-sm">{n.title}</h4>
              <p className="text-sm text-muted-foreground mt-1">
                {n.body}
              </p>
              <div className="flex items-center gap-2 mt-2">
                <span className="text-xs text-muted-foreground">
                  {formatDistanceToNow(new Date(n.created_at), { 
                    addSuffix: true, 
                    locale: de 
                  })}
                </span>
              </div>
            </div>
            
            <div className="flex items-center gap-1 ml-2">
              {!n.read_at && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => onRead(n.id)}
                  className="h-6 w-6 p-0"
                >
                  <Check className="h-3 w-3" />
                </Button>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}