import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import { Calendar, MapPin, ExternalLink, Users } from 'lucide-react';
import { useTranslation } from '@/lib/i18n';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

interface EventComposerProps {
  onEventCreated?: (eventId: string) => void;
  className?: string;
}

export function EventComposer({ onEventCreated, className }: EventComposerProps) {
  const { t } = useTranslation();
  const { user } = useAuth();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isOpen, setIsOpen] = useState(false);

  const [eventData, setEventData] = useState({
    title: '',
    description: '',
    startDate: '',
    startTime: '',
    endDate: '',
    endTime: '',
    location: '',
    isOnline: true,
    capacity: undefined as number | undefined,
  });

  const handleSubmit = async () => {
    if (!user) return;

    // Validation
    if (!eventData.title.trim()) {
      toast.error('Bitte gib einen Eventtitel ein');
      return;
    }

    if (!eventData.startDate || !eventData.startTime) {
      toast.error('Startdatum und -zeit sind erforderlich');
      return;
    }

    if (!eventData.isOnline && !eventData.location.trim()) {
      toast.error('Bitte gib einen Veranstaltungsort ein');
      return;
    }

    setIsSubmitting(true);

    try {
      const startDateTime = new Date(`${eventData.startDate}T${eventData.startTime}`);
      const endDateTime = eventData.endDate && eventData.endTime 
        ? new Date(`${eventData.endDate}T${eventData.endTime}`)
        : new Date(startDateTime.getTime() + 2 * 60 * 60 * 1000); // Default 2 hours

      // Create post
      const { data: post, error: postError } = await supabase
        .from('posts')
        .insert({
          content: eventData.description || eventData.title,
          post_type: 'event',
          author_id: user.id,
          author_type: 'user',
          status: 'published',
          visibility: 'CommunityAndCompanies',
          published_at: new Date().toISOString(),
        })
        .select()
        .single();

      if (postError) throw postError;

      // Create event
      const { data: event, error: eventError } = await supabase
        .from('post_events')
        .insert({
          post_id: post.id,
          title: eventData.title,
          is_online: eventData.isOnline,
          location: eventData.location || null,
          link_url: eventData.isOnline ? eventData.location : null,
          start_at: startDateTime.toISOString(),
          end_at: endDateTime.toISOString(),
          capacity: eventData.capacity || null,
        })
        .select()
        .single();

      if (eventError) throw eventError;

      toast.success('Event erfolgreich erstellt!');
      
      // Reset form
      setEventData({
        title: '',
        description: '',
        startDate: '',
        startTime: '',
        endDate: '',
        endTime: '',
        location: '',
        isOnline: true,
        capacity: undefined,
      });
      
      setIsOpen(false);
      onEventCreated?.(event.id);

    } catch (error) {
      console.error('Error creating event:', error);
      toast.error('Fehler beim Erstellen des Events: ' + error.message);
    } finally {
      setIsSubmitting(false);
    }
  };

  const canSubmit = () => {
    return eventData.title.trim().length > 0 && 
           eventData.startDate && 
           eventData.startTime &&
           (eventData.isOnline || eventData.location.trim().length > 0);
  };

  if (!isOpen) {
    return (
      <Button
        onClick={() => setIsOpen(true)}
        variant="outline"
        className={className}
      >
        <Calendar className="h-4 w-4 mr-2" />
        Event erstellen
      </Button>
    );
  }

  return (
    <Card className={className}>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Calendar className="h-5 w-5" />
          {t('feed.composer.tab_event')}
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="event-title">{t('feed.composer.event.title')}</Label>
          <Input
            id="event-title"
            placeholder="Eventtitel"
            value={eventData.title}
            onChange={(e) => setEventData(prev => ({ ...prev, title: e.target.value }))}
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="event-description">{t('feed.composer.event.description')}</Label>
          <Textarea
            id="event-description"
            placeholder="Eventbeschreibung (optional)"
            value={eventData.description}
            onChange={(e) => setEventData(prev => ({ ...prev, description: e.target.value }))}
            className="min-h-[80px]"
          />
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="start-date">{t('feed.composer.event.starts')}</Label>
            <Input
              id="start-date"
              type="date"
              value={eventData.startDate}
              onChange={(e) => setEventData(prev => ({ ...prev, startDate: e.target.value }))}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="start-time">Uhrzeit</Label>
            <Input
              id="start-time"
              type="time"
              value={eventData.startTime}
              onChange={(e) => setEventData(prev => ({ ...prev, startTime: e.target.value }))}
            />
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="end-date">{t('feed.composer.event.ends')}</Label>
            <Input
              id="end-date"
              type="date"
              value={eventData.endDate}
              onChange={(e) => setEventData(prev => ({ ...prev, endDate: e.target.value }))}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="end-time">Uhrzeit</Label>
            <Input
              id="end-time"
              type="time"
              value={eventData.endTime}
              onChange={(e) => setEventData(prev => ({ ...prev, endTime: e.target.value }))}
            />
          </div>
        </div>

        <div className="flex items-center justify-between">
          <Label htmlFor="is-online">Online-Event</Label>
          <Switch
            id="is-online"
            checked={eventData.isOnline}
            onCheckedChange={(checked) => setEventData(prev => ({ ...prev, isOnline: checked }))}
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="event-location">
            {eventData.isOnline ? 'Online-Link oder Meeting-ID' : t('feed.composer.event.location')}
          </Label>
          <Input
            id="event-location"
            placeholder={eventData.isOnline ? 'https://meet.google.com/...' : 'Veranstaltungsort'}
            value={eventData.location}
            onChange={(e) => setEventData(prev => ({ ...prev, location: e.target.value }))}
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="capacity">{t('feed.composer.event.capacity')}</Label>
          <Input
            id="capacity"
            type="number"
            placeholder="Maximale Teilnehmerzahl (optional)"
            value={eventData.capacity || ''}
            onChange={(e) => setEventData(prev => ({ 
              ...prev, 
              capacity: e.target.value ? parseInt(e.target.value) : undefined 
            }))}
            min="1"
          />
        </div>

        <div className="flex gap-2 pt-4">
          <Button
            onClick={handleSubmit}
            disabled={!canSubmit() || isSubmitting}
            className="flex-1"
          >
            {isSubmitting ? 'Erstelle...' : 'Event erstellen'}
          </Button>
          <Button
            variant="outline"
            onClick={() => setIsOpen(false)}
            disabled={isSubmitting}
          >
            Abbrechen
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}

