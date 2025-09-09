import React, { useEffect, useMemo, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Loader2, MessageCircle, Heart, Share2, FileText } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';
import { de } from 'date-fns/locale';

interface ActivityItem {
  kind: 'post' | 'like' | 'comment' | 'share';
  ref_id: string;
  created_at: string;
  post_kind?: string;
  actor_user_id?: string;
  actor_org_id?: string;
  job_id?: string;
  body_md?: string;
  like_count?: number;
  comment_count?: number;
  share_count?: number;
  comment_id?: string;
  share_id?: string;
}

interface ActivityTabProps {
  userId?: string;
  orgId?: string;
}

const getActivityIcon = (kind: string) => {
  switch (kind) {
    case 'post':
      return <FileText className="h-4 w-4" />;
    case 'like':
      return <Heart className="h-4 w-4" />;
    case 'comment':
      return <MessageCircle className="h-4 w-4" />;
    case 'share':
      return <Share2 className="h-4 w-4" />;
    default:
      return <FileText className="h-4 w-4" />;
  }
};

const getActivityLabel = (kind: string) => {
  switch (kind) {
    case 'post':
      return 'Beitrag erstellt';
    case 'like':
      return 'Beitrag geliked';
    case 'comment':
      return 'Kommentar geschrieben';
    case 'share':
      return 'Beitrag geteilt';
    default:
      return 'Aktivität';
  }
};

const getActivityColor = (kind: string) => {
  switch (kind) {
    case 'post':
      return 'bg-blue-100 text-blue-800';
    case 'like':
      return 'bg-red-100 text-red-800';
    case 'comment':
      return 'bg-green-100 text-green-800';
    case 'share':
      return 'bg-purple-100 text-purple-800';
    default:
      return 'bg-gray-100 text-gray-800';
  }
};

export default function ActivityTab({ userId, orgId }: ActivityTabProps) {
  const [activities, setActivities] = useState<ActivityItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const supabaseClient = useMemo(() => supabase, []);

  useEffect(() => {
    loadActivities();
  }, [userId, orgId, supabaseClient]);

  const loadActivities = async () => {
    if (!userId && !orgId) return;

    setLoading(true);
    setError(null);

    try {
      const functionName = userId ? 'get_activity_for_user' : 'get_activity_for_org';
      const params = userId ? { p_user: userId } : { p_org: orgId };

      const { data, error } = await supabaseClient.rpc(functionName as any, params as any);

      if (error) {
        console.error('Error loading activities:', error);
        setError('Fehler beim Laden der Aktivitäten');
        return;
      }

      // Sort activities by created_at descending
      const sortedActivities = (data || []).sort((a: ActivityItem, b: ActivityItem) => 
        new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
      );

      setActivities(sortedActivities);
    } catch (err) {
      console.error('Error loading activities:', err);
      setError('Ein unerwarteter Fehler ist aufgetreten');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-8">
        <Loader2 className="h-6 w-6 animate-spin" />
        <span className="ml-2">Lade Aktivitäten...</span>
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center py-8">
        <p className="text-red-600 mb-4">{error}</p>
        <button 
          onClick={loadActivities}
          className="text-blue-600 hover:text-blue-800 underline"
        >
          Erneut versuchen
        </button>
      </div>
    );
  }

  if (activities.length === 0) {
    return (
      <div className="text-center py-8">
        <p className="text-muted-foreground">Noch keine Aktivitäten vorhanden.</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {activities.map((activity, index) => (
        <Card key={`${activity.kind}-${activity.ref_id}-${index}`} className="p-4">
          <CardContent className="p-0">
            <div className="flex items-start gap-3">
              <div className={`p-2 rounded-full ${getActivityColor(activity.kind)}`}>
                {getActivityIcon(activity.kind)}
              </div>
              
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-2">
                  <Badge variant="secondary" className={getActivityColor(activity.kind)}>
                    {getActivityLabel(activity.kind)}
                  </Badge>
                  <span className="text-sm text-muted-foreground">
                    {formatDistanceToNow(new Date(activity.created_at), { 
                      addSuffix: true, 
                      locale: de 
                    })}
                  </span>
                </div>

                {activity.kind === 'post' && activity.body_md && (
                  <div className="mt-2 text-sm whitespace-pre-wrap bg-muted/50 p-3 rounded-md">
                    {activity.body_md}
                  </div>
                )}

                {activity.kind === 'comment' && activity.body_md && (
                  <div className="mt-2 text-sm">
                    <span className="text-muted-foreground">Kommentar:</span>
                    <div className="mt-1 bg-muted/50 p-3 rounded-md whitespace-pre-wrap">
                      {activity.body_md}
                    </div>
                  </div>
                )}

                {(activity.kind === 'like' || activity.kind === 'share') && (
                  <div className="mt-2 text-sm text-muted-foreground">
                    {activity.kind === 'like' && 'Hat einen Beitrag geliked.'}
                    {activity.kind === 'share' && 'Hat einen Beitrag geteilt.'}
                  </div>
                )}

                {/* Show engagement stats for posts */}
                {activity.kind === 'post' && (
                  <div className="flex items-center gap-4 mt-3 text-xs text-muted-foreground">
                    {activity.like_count && activity.like_count > 0 && (
                      <span className="flex items-center gap-1">
                        <Heart className="h-3 w-3" />
                        {activity.like_count}
                      </span>
                    )}
                    {activity.comment_count && activity.comment_count > 0 && (
                      <span className="flex items-center gap-1">
                        <MessageCircle className="h-3 w-3" />
                        {activity.comment_count}
                      </span>
                    )}
                    {activity.share_count && activity.share_count > 0 && (
                      <span className="flex items-center gap-1">
                        <Share2 className="h-3 w-3" />
                        {activity.share_count}
                      </span>
                    )}
                  </div>
                )}
              </div>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
