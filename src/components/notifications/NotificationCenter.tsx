import React from 'react';
import { Bell, X, Check, Trash2, MessageSquare, Users, FileText, UserPlus } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Separator } from '@/components/ui/separator';
import { useAuth } from '@/hooks/useAuth';
import { useRecipientNotifications } from '@/hooks/useRecipientNotifications';
import { formatDistanceToNow } from 'date-fns';
import { de } from 'date-fns/locale';
import type { NotificationRow, NotifType } from '@/types/notifications';

interface NotificationCenterProps {
  isOpen: boolean;
  onClose: () => void;
}

export const NotificationCenter: React.FC<NotificationCenterProps> = ({
  isOpen,
  onClose
}) => {
  const { profile } = useAuth();
  const { items: notifications, loading, markRead, markAllRead } = useRecipientNotifications(
    'profile',
    profile?.id || null
  );

  const unreadCount = notifications.filter(n => !n.read_at).length;

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

  const handleMarkAsRead = async (notificationId: string) => {
    try {
      await markRead(notificationId);
    } catch (error) {
      console.error('Failed to mark notification as read:', error);
    }
  };

  const handleMarkAllAsRead = async () => {
    try {
      await markAllRead();
    } catch (error) {
      console.error('Failed to mark all notifications as read:', error);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 bg-black/50" onClick={onClose}>
      <div className="fixed right-4 top-16 w-96 max-h-[80vh] bg-background border rounded-lg shadow-lg" onClick={(e) => e.stopPropagation()}>
        <Card className="h-full">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-lg font-semibold">
              Notifications
              {unreadCount > 0 && (
                <Badge variant="destructive" className="ml-2">
                  {unreadCount}
                </Badge>
              )}
            </CardTitle>
            <div className="flex items-center gap-2">
              {unreadCount > 0 && (
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={handleMarkAllAsRead}
                  >
                  <Check className="h-4 w-4" />
                  Mark all read
                </Button>
              )}
              <Button variant="ghost" size="sm" onClick={onClose}>
                <X className="h-4 w-4" />
              </Button>
            </div>
          </CardHeader>
          
          <Separator />
          
          <CardContent className="p-0">
            <ScrollArea className="h-[400px]">
              {loading ? (
                <div className="flex items-center justify-center p-8">
                  <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-primary"></div>
                </div>
              ) : notifications.length === 0 ? (
                <div className="flex flex-col items-center justify-center p-8 text-muted-foreground">
                  <Bell className="h-12 w-12 mb-4 opacity-50" />
                  <p>No notifications yet</p>
                  <p className="text-sm">We'll notify you when something happens</p>
                </div>
              ) : (
                <div className="p-2">
                  {notifications.map((notification) => (
                    <div
                      key={notification.id}
                      className={`p-3 rounded-lg mb-2 transition-colors ${
                        notification.read_at 
                          ? 'bg-muted/30' 
                          : 'bg-primary/5 border-l-2 border-l-primary'
                      }`}
                    >
                      <div className="flex items-start gap-3">
                        <div className={`mt-1 ${getNotificationColor(notification.type)}`}>
                          {getNotificationIcon(notification.type)}
                        </div>
                        
                        <div className="flex-1 min-w-0">
                          <div className="flex items-start justify-between">
                            <div className="flex-1">
                              <h4 className="font-medium text-sm">{notification.title}</h4>
                              <p className="text-sm text-muted-foreground mt-1">
                                {notification.body}
                              </p>
                              <div className="flex items-center gap-2 mt-2">
                                <span className="text-xs text-muted-foreground">
                                  {formatDistanceToNow(new Date(notification.created_at), { 
                                    addSuffix: true, 
                                    locale: de 
                                  })}
                                </span>
                              </div>
                            </div>
                            
                            <div className="flex items-center gap-1 ml-2">
                              {!notification.read_at && (
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  onClick={() => handleMarkAsRead(notification.id)}
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
                  ))}
                </div>
              )}
            </ScrollArea>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};
