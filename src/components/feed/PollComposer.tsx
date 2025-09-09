import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Plus, X, BarChart3 } from 'lucide-react';
import { useTranslation } from '@/lib/i18n';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

interface PollOption {
  id: string;
  text: string;
}

interface PollComposerProps {
  onPollCreated?: (pollId: string) => void;
  className?: string;
}

export function PollComposer({ onPollCreated, className }: PollComposerProps) {
  const { t } = useTranslation();
  const { user } = useAuth();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isOpen, setIsOpen] = useState(false);

  const [pollData, setPollData] = useState({
    question: '',
    options: [{ id: '1', text: '' }, { id: '2', text: '' }],
    duration: '7d',
    multipleChoice: false,
    showResultsAfterVote: false,
  });

  const addPollOption = () => {
    if (pollData.options.length < 6) {
      const newId = (pollData.options.length + 1).toString();
      setPollData(prev => ({
        ...prev,
        options: [...prev.options, { id: newId, text: '' }]
      }));
    }
  };

  const removePollOption = (id: string) => {
    if (pollData.options.length > 2) {
      setPollData(prev => ({
        ...prev,
        options: prev.options.filter(option => option.id !== id)
      }));
    }
  };

  const updatePollOption = (id: string, text: string) => {
    setPollData(prev => ({
      ...prev,
      options: prev.options.map(option => 
        option.id === id ? { ...option, text } : option
      )
    }));
  };

  const getDurationInHours = (duration: string): number => {
    switch (duration) {
      case '24h': return 24;
      case '3d': return 72;
      case '7d': return 168;
      case '14d': return 336;
      default: return 168;
    }
  };

  const handleSubmit = async () => {
    if (!user) return;

    // Validation
    if (!pollData.question.trim()) {
      toast.error('Bitte gib eine Frage ein');
      return;
    }

    const validOptions = pollData.options.filter(opt => opt.text.trim());
    if (validOptions.length < 2) {
      toast.error('Mindestens 2 Optionen sind erforderlich');
      return;
    }

    setIsSubmitting(true);

    try {
      // Create post
      const { data: post, error: postError } = await supabase
        .from('posts')
        .insert({
          content: pollData.question,
          post_type: 'poll',
          author_id: user.id,
          author_type: 'user',
          status: 'published',
          visibility: 'CommunityAndCompanies',
          published_at: new Date().toISOString(),
        })
        .select()
        .single();

      if (postError) throw postError;

      // Create poll
      const endsAt = new Date();
      endsAt.setHours(endsAt.getHours() + getDurationInHours(pollData.duration));

      const { data: poll, error: pollError } = await supabase
        .from('post_polls')
        .insert({
          post_id: post.id,
          question: pollData.question,
          ends_at: endsAt.toISOString(),
          multiple_choice: pollData.multipleChoice,
          show_results_after_vote: pollData.showResultsAfterVote,
        })
        .select()
        .single();

      if (pollError) throw pollError;

      // Create poll options
      const { error: optionsError } = await supabase
        .from('post_poll_options')
        .insert(
          validOptions.map(option => ({
            poll_id: poll.id,
            option_text: option.text,
          }))
        );

      if (optionsError) throw optionsError;

      toast.success('Umfrage erfolgreich erstellt!');
      
      // Reset form
      setPollData({
        question: '',
        options: [{ id: '1', text: '' }, { id: '2', text: '' }],
        duration: '7d',
        multipleChoice: false,
        showResultsAfterVote: false,
      });
      
      setIsOpen(false);
      onPollCreated?.(poll.id);

    } catch (error) {
      console.error('Error creating poll:', error);
      toast.error('Fehler beim Erstellen der Umfrage: ' + error.message);
    } finally {
      setIsSubmitting(false);
    }
  };

  const canSubmit = () => {
    return pollData.question.trim().length > 0 && 
           pollData.options.filter(opt => opt.text.trim()).length >= 2;
  };

  if (!isOpen) {
    return (
      <Button
        onClick={() => setIsOpen(true)}
        variant="outline"
        className={className}
      >
        <BarChart3 className="h-4 w-4 mr-2" />
        Umfrage erstellen
      </Button>
    );
  }

  return (
    <Card className={className}>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <BarChart3 className="h-5 w-5" />
          {t('feed.composer.tab_poll')}
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="poll-question">{t('feed.composer.poll.question')}</Label>
          <Input
            id="poll-question"
            placeholder="Deine Frage hier..."
            value={pollData.question}
            onChange={(e) => setPollData(prev => ({ ...prev, question: e.target.value }))}
            maxLength={140}
          />
          <p className="text-sm text-muted-foreground">
            {pollData.question.length}/140 Zeichen
          </p>
        </div>

        <div className="space-y-2">
          <Label>Optionen</Label>
          {pollData.options.map((option, index) => (
            <div key={option.id} className="flex items-center gap-2">
              <Input
                placeholder={`Option ${index + 1}`}
                value={option.text}
                onChange={(e) => updatePollOption(option.id, e.target.value)}
              />
              {pollData.options.length > 2 && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => removePollOption(option.id)}
                >
                  <X className="h-4 w-4" />
                </Button>
              )}
            </div>
          ))}
          {pollData.options.length < 6 && (
            <Button
              variant="outline"
              size="sm"
              onClick={addPollOption}
              className="w-full"
            >
              <Plus className="h-4 w-4 mr-2" />
              {t('feed.composer.poll.add_option')}
            </Button>
          )}
        </div>

        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <Label htmlFor="poll-duration">{t('feed.composer.poll.duration')}</Label>
            <Select
              value={pollData.duration}
              onValueChange={(value) => setPollData(prev => ({ ...prev, duration: value }))}
            >
              <SelectTrigger className="w-32">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="24h">{t('feed.composer.poll.durations.24h')}</SelectItem>
                <SelectItem value="3d">{t('feed.composer.poll.durations.3d')}</SelectItem>
                <SelectItem value="7d">{t('feed.composer.poll.durations.7d')}</SelectItem>
                <SelectItem value="14d">{t('feed.composer.poll.durations.14d')}</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="flex items-center justify-between">
            <Label htmlFor="multiple-choice">{t('feed.composer.poll.multiple')}</Label>
            <Switch
              id="multiple-choice"
              checked={pollData.multipleChoice}
              onCheckedChange={(checked) => setPollData(prev => ({ ...prev, multipleChoice: checked }))}
            />
          </div>

          <div className="flex items-center justify-between">
            <Label htmlFor="show-results">{t('feed.composer.poll.show_after_vote')}</Label>
            <Switch
              id="show-results"
              checked={pollData.showResultsAfterVote}
              onCheckedChange={(checked) => setPollData(prev => ({ ...prev, showResultsAfterVote: checked }))}
            />
          </div>
        </div>

        <div className="flex gap-2 pt-4">
          <Button
            onClick={handleSubmit}
            disabled={!canSubmit() || isSubmitting}
            className="flex-1"
          >
            {isSubmitting ? 'Erstelle...' : 'Umfrage erstellen'}
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

