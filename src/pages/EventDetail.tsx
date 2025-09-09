import React, { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  Calendar, 
  MapPin, 
  ExternalLink, 
  Users, 
  Clock,
  CheckCircle2,
  AlertCircle,
  Download,
  Share2,
  ArrowLeft,
  UserPlus
} from 'lucide-react';
import { useTranslation } from '@/lib/i18n';
import { useEvent, RSVPStatus } from '@/hooks/useEvent';
import { AvatarClickable } from '@/components/common/AvatarClickable';
import { cn } from '@/lib/utils';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useEventManagement } from '@/hooks/useEventManagement';
import { useAuth } from '@/hooks/useAuth';

interface RSVPParticipant {
  id: string;
  display_name: string;
  avatar_url?: string;
  verified?: boolean;
  rsvp_status: RSVPStatus;
  rsvp_date: string;
}

export function EventDetail() {
  const { eventId } = useParams<{ eventId: string }>();
  const navigate = useNavigate();
  const { t } = useTranslation();
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState<'details' | 'participants'>('details');
  const [showManagement, setShowManagement] = useState(false);

  const {
    event,
    isLoading,
    error,
    rsvp,
    currentRSVP,
    downloadICS,
    isRSVPing,
    hasRSVPed
  } = useEvent({ eventId: eventId!, postId: eventId! });

  // Load participants data
  const { data: participants = [], isLoading: isLoadingParticipants } = useQuery({
    queryKey: ['eventParticipants', eventId],
    queryFn: async () => {
      if (!eventId) return [];
      
      const { data, error } = await supabase
        .from('event_rsvps')
        .select(`
          status,
          created_at,
          profiles!inner (
            id,
            display_name,
            avatar_url,
            verified
          )
        `)
        .eq('event_id', eventId)
        .order('created_at', { ascending: false });

      if (error) throw error;

      return data.map(rsvp => ({
        id: rsvp.profiles.id,
        display_name: rsvp.profiles.display_name,
        avatar_url: rsvp.profiles.avatar_url,
        verified: rsvp.profiles.verified,
        rsvp_status: rsvp.status as RSVPStatus,
        rsvp_date: rsvp.created_at
      })) as RSVPParticipant[];
    },
    enabled: !!eventId
  });

  // Event management hooks
  const {
    updateEvent,
    deleteEvent,
    cancelEvent,
    exportParticipants,
    sendReminder,
    isUpdating,
    isDeleting,
    isCancelling,
    isExporting,
    isSendingReminder
  } = useEventManagement({ eventId: eventId!, postId: eventId! });

  if (isLoading) {
    return (
      <div className="max-w-4xl mx-auto p-6">
        <div className="animate-pulse space-y-6">
          <div className="h-8 bg-muted rounded w-1/4"></div>
          <div className="h-64 bg-muted rounded"></div>
          <div className="h-32 bg-muted rounded"></div>
        </div>
      </div>
    );
  }

  if (error || !event) {
    return (
      <div className="max-w-4xl mx-auto p-6">
        <Card>
          <CardContent className="text-center py-8">
            <AlertCircle className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
            <h2 className="text-xl font-semibold mb-2">Event nicht gefunden</h2>
            <p className="text-muted-foreground mb-4">
              Das angeforderte Event konnte nicht geladen werden.
            </p>
            <Button onClick={() => navigate(-1)}>
              <ArrowLeft className="h-4 w-4 mr-2" />
              Zurück
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  const formatEventDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('de-DE', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const formatTimeRemaining = () => {
    if (!event.time_remaining) return '';
    
    const { days, hours, minutes, seconds } = event.time_remaining;
    
    if (days > 0) {
      return `${days}d ${hours}h ${minutes}m`;
    } else if (hours > 0) {
      return `${hours}h ${minutes}m`;
    } else if (minutes > 0) {
      return `${minutes}m ${seconds}s`;
    } else {
      return `${seconds}s`;
    }
  };

  const getEventStatus = () => {
    if (event.is_past) {
      return {
        text: 'Event beendet',
        variant: 'destructive' as const,
        icon: CheckCircle2
      };
    }
    
    if (event.is_ongoing) {
      return {
        text: 'Läuft gerade',
        variant: 'default' as const,
        icon: Clock
      };
    }
    
    if (event.is_full) {
      return {
        text: 'Ausgebucht',
        variant: 'secondary' as const,
        icon: AlertCircle
      };
    }
    
    return {
      text: `Startet in ${formatTimeRemaining()}`,
      variant: 'outline' as const,
      icon: Clock
    };
  };

  const getRSVPButton = (status: RSVPStatus) => {
    const isActive = currentRSVP === status;
    const isDisabled = event.is_past || (status === 'going' && event.is_full) || isRSVPing;

    const buttonText = {
      going: 'Zusagen',
      interested: 'Interessiert',
      declined: 'Absagen'
    };

    return (
      <Button
        key={status}
        variant={isActive ? 'default' : 'outline'}
        size="sm"
        onClick={() => rsvp(status)}
        disabled={isDisabled}
        className={cn(
          isActive && 'ring-2 ring-primary ring-offset-2'
        )}
      >
        {isActive && <CheckCircle2 className="h-4 w-4 mr-1" />}
        {buttonText[status]}
      </Button>
    );
  };

  const status = getEventStatus();
  const StatusIcon = status.icon;

  const goingParticipants = participants.filter(p => p.rsvp_status === 'going');
  const interestedParticipants = participants.filter(p => p.rsvp_status === 'interested');

  return (
    <div className="max-w-4xl mx-auto p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="sm" onClick={() => navigate(-1)}>
          <ArrowLeft className="h-4 w-4 mr-2" />
          Zurück
        </Button>
        <div className="flex-1">
          <h1 className="text-2xl font-bold">{event.title}</h1>
          <div className="flex items-center gap-4 mt-2 text-sm text-muted-foreground">
            <div className="flex items-center gap-1">
              <Calendar className="h-4 w-4" />
              <span>{formatEventDate(event.start_at)}</span>
            </div>
            <div className="flex items-center gap-1">
              {event.is_online ? (
                <ExternalLink className="h-4 w-4" />
              ) : (
                <MapPin className="h-4 w-4" />
              )}
              <span>{event.location || 'Online'}</span>
            </div>
            <div className="flex items-center gap-1">
              <Users className="h-4 w-4" />
              <span>
                {event.rsvp_count}
                {event.capacity && `/${event.capacity}`} Teilnehmer
              </span>
            </div>
          </div>
        </div>
        
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => setShowManagement(!showManagement)}
          >
            <UserPlus className="h-4 w-4 mr-1" />
            {showManagement ? 'Verstecken' : 'Verwalten'}
          </Button>
        <Badge variant={status.variant} className="text-sm">
          <StatusIcon className="h-4 w-4 mr-1" />
          {status.text}
        </Badge>
      </div>

      {/* Event Management Panel */}
      {showManagement && (
        <Card className="mb-6">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <UserPlus className="h-5 w-5" />
              Event-Verwaltung
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <Button
                variant="outline"
                onClick={exportParticipants}
                disabled={isExporting}
                className="flex flex-col items-center gap-2 h-20"
              >
                <Download className="h-5 w-5" />
                <span className="text-sm">Teilnehmer exportieren</span>
              </Button>
              
              <Button
                variant="outline"
                onClick={() => sendReminder('Erinnerung: Das Event startet bald!')}
                disabled={isSendingReminder || event.is_past}
                className="flex flex-col items-center gap-2 h-20"
              >
                <Share2 className="h-5 w-5" />
                <span className="text-sm">Erinnerung senden</span>
              </Button>
              
              <Button
                variant="outline"
                onClick={() => cancelEvent()}
                disabled={isCancelling || event.is_past}
                className="flex flex-col items-center gap-2 h-20"
              >
                <AlertCircle className="h-5 w-5" />
                <span className="text-sm">Event absagen</span>
              </Button>
              
              <Button
                variant="destructive"
                onClick={() => {
                  if (confirm('Möchtest du das Event wirklich löschen? Diese Aktion kann nicht rückgängig gemacht werden.')) {
                    deleteEvent();
                  }
                }}
                disabled={isDeleting}
                className="flex flex-col items-center gap-2 h-20"
              >
                <AlertCircle className="h-5 w-5" />
                <span className="text-sm">Event löschen</span>
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Main Content */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Event Details */}
        <div className="lg:col-span-2 space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Event-Details</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label className="text-sm font-medium text-muted-foreground">Start</Label>
                  <p className="text-sm">{formatEventDate(event.start_at)}</p>
                </div>
                <div>
                  <Label className="text-sm font-medium text-muted-foreground">Ende</Label>
                  <p className="text-sm">{formatEventDate(event.end_at)}</p>
                </div>
              </div>

              <div>
                <Label className="text-sm font-medium text-muted-foreground">
                  {event.is_online ? 'Online-Link' : 'Veranstaltungsort'}
                </Label>
                <p className="text-sm">{event.location || 'TBD'}</p>
              </div>

              {event.capacity && (
                <div>
                  <Label className="text-sm font-medium text-muted-foreground">Kapazität</Label>
                  <div className="space-y-2">
                    <div className="flex items-center justify-between text-sm">
                      <span>{event.rsvp_count} / {event.capacity} Teilnehmer</span>
                      <span>{Math.round((event.rsvp_count / event.capacity) * 100)}%</span>
                    </div>
                    <div className="w-full bg-muted rounded-full h-2">
                      <div 
                        className="bg-primary h-2 rounded-full transition-all duration-300"
                        style={{ 
                          width: `${Math.min((event.rsvp_count / event.capacity) * 100, 100)}%` 
                        }}
                      />
                    </div>
                  </div>
                </div>
              )}

              <div className="flex gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={downloadICS}
                >
                  <Download className="h-4 w-4 mr-1" />
                  Zum Kalender hinzufügen
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => {
                    const calendarEvent = {
                      title: event.title,
                      start: new Date(event.start_at).toISOString(),
                      end: new Date(event.end_at).toISOString(),
                      location: event.location || 'Online',
                      description: `Event: ${event.title}\n\nTeilnehmer: ${event.rsvp_count}${event.capacity ? `/${event.capacity}` : ''}\n\nLink: ${window.location.href}`
                    };
                    
                    // Google Calendar
                    const googleUrl = `https://calendar.google.com/calendar/render?action=TEMPLATE&text=${encodeURIComponent(calendarEvent.title)}&dates=${calendarEvent.start.replace(/[-:]/g, '').split('.')[0]}Z/${calendarEvent.end.replace(/[-:]/g, '').split('.')[0]}Z&details=${encodeURIComponent(calendarEvent.description)}&location=${encodeURIComponent(calendarEvent.location)}`;
                    window.open(googleUrl, '_blank');
                  }}
                >
                  <Calendar className="h-4 w-4 mr-1" />
                  Google Calendar
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => navigator.share?.({ title: event.title, url: window.location.href })}
                >
                  <Share2 className="h-4 w-4 mr-1" />
                  Teilen
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* Participants */}
          <Card>
            <CardHeader>
              <CardTitle>Teilnehmer</CardTitle>
            </CardHeader>
            <CardContent>
              <Tabs value={activeTab} onValueChange={(value) => setActiveTab(value as any)}>
                <TabsList className="grid w-full grid-cols-2">
                  <TabsTrigger value="details">
                    Zusagen ({goingParticipants.length})
                  </TabsTrigger>
                  <TabsTrigger value="participants">
                    Interessiert ({interestedParticipants.length})
                  </TabsTrigger>
                </TabsList>

                <TabsContent value="details" className="space-y-3">
                  {isLoadingParticipants ? (
                    <div className="space-y-3">
                      {[1, 2, 3].map((i) => (
                        <div key={i} className="flex items-center gap-3 animate-pulse">
                          <div className="h-8 w-8 bg-muted rounded-full"></div>
                          <div className="flex-1">
                            <div className="h-4 bg-muted rounded w-1/3 mb-1"></div>
                            <div className="h-3 bg-muted rounded w-1/4"></div>
                          </div>
                          <div className="h-6 bg-muted rounded w-16"></div>
                        </div>
                      ))}
                    </div>
                  ) : goingParticipants.length > 0 ? (
                    goingParticipants.map((participant) => (
                    <div key={participant.id} className="flex items-center gap-3">
                      <AvatarClickable
                        profileId={participant.id}
                        profileType="user"
                        className="h-8 w-8"
                      >
                        <Avatar className="h-8 w-8">
                          <AvatarImage src={participant.avatar_url} />
                          <AvatarFallback>
                            {participant.display_name.charAt(0).toUpperCase()}
                          </AvatarFallback>
                        </Avatar>
                      </AvatarClickable>
                      <div className="flex-1">
                        <div className="flex items-center gap-2">
                          <span className="text-sm font-medium">{participant.display_name}</span>
                          {participant.verified && (
                            <Badge variant="secondary" className="text-xs">✓</Badge>
                          )}
                        </div>
                        <p className="text-xs text-muted-foreground">
                          {new Date(participant.rsvp_date).toLocaleDateString('de-DE')}
                        </p>
                      </div>
                      <Badge variant="default" className="text-xs">
                        Zusagen
                      </Badge>
                    </div>
                    ))
                  ) : (
                    <div className="text-center py-8 text-muted-foreground">
                      <Users className="h-8 w-8 mx-auto mb-2" />
                      <p>Noch keine Teilnehmer</p>
                    </div>
                  )}
                </TabsContent>

                <TabsContent value="participants" className="space-y-3">
                  {isLoadingParticipants ? (
                    <div className="space-y-3">
                      {[1, 2, 3].map((i) => (
                        <div key={i} className="flex items-center gap-3 animate-pulse">
                          <div className="h-8 w-8 bg-muted rounded-full"></div>
                          <div className="flex-1">
                            <div className="h-4 bg-muted rounded w-1/3 mb-1"></div>
                            <div className="h-3 bg-muted rounded w-1/4"></div>
                          </div>
                          <div className="h-6 bg-muted rounded w-16"></div>
                        </div>
                      ))}
                    </div>
                  ) : interestedParticipants.length > 0 ? (
                    interestedParticipants.map((participant) => (
                      <div key={participant.id} className="flex items-center gap-3">
                        <AvatarClickable
                          profileId={participant.id}
                          profileType="user"
                          className="h-8 w-8"
                        >
                          <Avatar className="h-8 w-8">
                            <AvatarImage src={participant.avatar_url} />
                            <AvatarFallback>
                              {participant.display_name.charAt(0).toUpperCase()}
                            </AvatarFallback>
                          </Avatar>
                        </AvatarClickable>
                        <div className="flex-1">
                          <div className="flex items-center gap-2">
                            <span className="text-sm font-medium">{participant.display_name}</span>
                            {participant.verified && (
                              <Badge variant="secondary" className="text-xs">✓</Badge>
                            )}
                          </div>
                          <p className="text-xs text-muted-foreground">
                            {new Date(participant.rsvp_date).toLocaleDateString('de-DE')}
                          </p>
                        </div>
                        <Badge variant="outline" className="text-xs">
                          Interessiert
                        </Badge>
                      </div>
                    ))
                  ) : (
                    <div className="text-center py-8 text-muted-foreground">
                      <Users className="h-8 w-8 mx-auto mb-2" />
                      <p>Noch keine interessierten Teilnehmer</p>
                    </div>
                  )}
                </TabsContent>
              </Tabs>
            </CardContent>
          </Card>
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* RSVP Section */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <UserPlus className="h-5 w-5" />
                Teilnahme
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {!event.is_past ? (
                <>
                  <div className="space-y-2">
                    <p className="text-sm text-muted-foreground">
                      Möchtest du an diesem Event teilnehmen?
                    </p>
                    <div className="flex flex-col gap-2">
                      {getRSVPButton('going')}
                      {getRSVPButton('interested')}
                      {getRSVPButton('declined')}
                    </div>
                  </div>

                  {currentRSVP && (
                    <div className="p-3 bg-muted rounded-lg">
                      <p className="text-sm">
                        <strong>Dein Status:</strong> {
                          currentRSVP === 'going' ? 'Du gehst hin' :
                          currentRSVP === 'interested' ? 'Du bist interessiert' :
                          'Du sagst ab'
                        }
                      </p>
                    </div>
                  )}
                </>
              ) : (
                <div className="text-center py-4">
                  <AlertCircle className="h-8 w-8 mx-auto mb-2 text-muted-foreground" />
                  <p className="text-sm text-muted-foreground">
                    Dieses Event ist bereits beendet
                  </p>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Event Info */}
          <Card>
            <CardHeader>
              <CardTitle>Event-Info</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="flex items-center justify-between text-sm">
                <span className="text-muted-foreground">Typ:</span>
                <span>{event.is_online ? 'Online-Event' : 'Vor-Ort-Event'}</span>
              </div>
              <div className="flex items-center justify-between text-sm">
                <span className="text-muted-foreground">Status:</span>
                <Badge variant={status.variant} className="text-xs">
                  {status.text}
                </Badge>
              </div>
              {event.capacity && (
                <div className="flex items-center justify-between text-sm">
                  <span className="text-muted-foreground">Verfügbar:</span>
                  <span>{event.capacity - event.rsvp_count} Plätze</span>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
