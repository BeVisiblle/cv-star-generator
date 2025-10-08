import React, { useEffect, useState } from 'react';
import { trackPageView } from '@/lib/telemetry';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { supabase } from '@/integrations/supabase/client';

interface AnalyticsSummary {
  totalEvents: number;
  buttonClicks: number;
  pageViews: number;
  calendlyClicks: number;
  pageViewsByPage: Record<string, number>;
  buttonClicksByLabel: Record<string, number>;
}

export default function AnalyticsPage() {
  const [summary, setSummary] = useState<AnalyticsSummary | null>(null);
  const [events, setEvents] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    trackPageView('Admin Analytics Dashboard');
    
    const loadAnalytics = async () => {
      try {
        // Fetch last 1000 events
        const { data: eventsData, error } = await supabase
          .from('analytics_events')
          .select('*')
          .order('created_at', { ascending: false })
          .limit(1000);

        if (error) throw error;

        setEvents(eventsData || []);

        // Calculate summary
        const summary: AnalyticsSummary = {
          totalEvents: eventsData?.length || 0,
          buttonClicks: eventsData?.filter(e => e.event_type === 'button_click').length || 0,
          pageViews: eventsData?.filter(e => e.event_type === 'page_view').length || 0,
          calendlyClicks: eventsData?.filter(e => e.button_type === 'calendly').length || 0,
          pageViewsByPage: {},
          buttonClicksByLabel: {},
        };

        eventsData?.forEach(event => {
          if (event.event_type === 'page_view' && event.event_name) {
            summary.pageViewsByPage[event.event_name] = (summary.pageViewsByPage[event.event_name] || 0) + 1;
          }
          if (event.event_type === 'button_click' && event.button_label) {
            summary.buttonClicksByLabel[event.button_label] = (summary.buttonClicksByLabel[event.button_label] || 0) + 1;
          }
        });

        setSummary(summary);
      } catch (error) {
        console.error('Error loading analytics:', error);
      } finally {
        setLoading(false);
      }
    };
    
    loadAnalytics();
    
    // Refresh every 30 seconds
    const interval = setInterval(loadAnalytics, 30000);
    return () => clearInterval(interval);
  }, []);

  if (loading) {
    return (
      <div className="px-3 sm:px-6 py-6 max-w-[1400px] mx-auto">
        <div className="animate-pulse space-y-4">
          <div className="h-8 bg-muted rounded w-48" />
          <div className="grid gap-4 md:grid-cols-4">
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className="h-24 bg-muted rounded" />
            ))}
          </div>
        </div>
      </div>
    );
  }

  if (!summary) {
    return (
      <div className="px-3 sm:px-6 py-6 max-w-[1400px] mx-auto">
        <p className="text-muted-foreground">Keine Daten verfügbar</p>
      </div>
    );
  }

  const pageViewsData = Object.entries(summary.pageViewsByPage).map(([page, count]) => ({
    page,
    views: count as number,
  }));

  const buttonClicksData = Object.entries(summary.buttonClicksByLabel).map(([label, count]) => ({
    label,
    clicks: count as number,
  }));

  return (
    <div className="px-3 sm:px-6 py-6 max-w-[1400px] mx-auto space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Analytics Dashboard</h1>
        <p className="text-muted-foreground mt-1">Live-Daten von bevisiblle.de - Button-Klicks und Seitenaufrufe</p>
      </div>

      {/* Summary Cards */}
      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardHeader className="pb-2">
            <CardDescription>Gesamt Events</CardDescription>
            <CardTitle className="text-3xl">{summary.totalEvents}</CardTitle>
          </CardHeader>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardDescription>Seitenaufrufe</CardDescription>
            <CardTitle className="text-3xl">{summary.pageViews}</CardTitle>
          </CardHeader>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardDescription>Button Klicks</CardDescription>
            <CardTitle className="text-3xl">{summary.buttonClicks}</CardTitle>
          </CardHeader>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardDescription>Calendly Klicks</CardDescription>
            <CardTitle className="text-3xl text-primary">{summary.calendlyClicks}</CardTitle>
          </CardHeader>
        </Card>
      </div>

      {/* Page Views Table */}
      {pageViewsData.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Seitenaufrufe pro Seite</CardTitle>
            <CardDescription>Anzahl der Aufrufe jeder Seite</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {pageViewsData.sort((a, b) => b.views - a.views).map((item) => (
                <div key={item.page} className="flex items-center justify-between p-3 bg-muted/50 rounded-lg">
                  <span className="font-medium">{item.page}</span>
                  <span className="text-2xl font-bold text-primary">{item.views}</span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Button Clicks Table */}
      {buttonClicksData.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Button Klicks</CardTitle>
            <CardDescription>Häufigkeit der Button-Klicks nach Label</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {buttonClicksData.sort((a, b) => b.clicks - a.clicks).map((item) => (
                <div key={item.label} className="flex items-center justify-between p-3 bg-muted/50 rounded-lg">
                  <span className="font-medium text-sm">{item.label}</span>
                  <span className="text-2xl font-bold text-primary">{item.clicks}</span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Recent Events */}
      <Card>
        <CardHeader>
          <CardTitle>Letzte Events (Live)</CardTitle>
          <CardDescription>Die neuesten 50 Events von bevisiblle.de</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-2 max-h-96 overflow-auto">
            {events.slice(0, 50).map((event, idx) => (
              <div
                key={idx}
                className="flex items-center justify-between p-3 bg-muted/50 rounded-lg hover:bg-muted transition"
              >
                <div className="flex-1">
                  <div className="flex items-center gap-2">
                    <span className={`px-2 py-1 rounded text-xs font-semibold ${
                      event.event_type === 'page_view' 
                        ? 'bg-blue-100 text-blue-700 dark:bg-blue-900 dark:text-blue-300' 
                        : event.button_type === 'calendly'
                        ? 'bg-purple-100 text-purple-700 dark:bg-purple-900 dark:text-purple-300'
                        : 'bg-green-100 text-green-700 dark:bg-green-900 dark:text-green-300'
                    }`}>
                      {event.event_type === 'page_view' ? '👁️ Page View' : '🖱️ Click'}
                    </span>
                    {event.button_type === 'calendly' && (
                      <span className="px-2 py-1 rounded text-xs font-semibold bg-primary text-primary-foreground">
                        📅 Calendly
                      </span>
                    )}
                  </div>
                  <p className="text-sm font-medium mt-1">
                    {event.event_name}
                  </p>
                  {event.page_path && event.event_type === 'button_click' && (
                    <p className="text-xs text-muted-foreground">auf {event.page_path}</p>
                  )}
                </div>
                <div className="text-right">
                  <p className="text-xs text-muted-foreground">
                    {new Date(event.created_at).toLocaleString('de-DE')}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      <Card className="bg-primary/5 border-primary/20">
        <CardHeader>
          <CardTitle>💡 Hinweis</CardTitle>
          <CardDescription>
            Diese Analytics zeigen echte Daten von bevisiblle.de in Echtzeit. Alle Events werden in der Supabase-Datenbank gespeichert und sind persistent.
          </CardDescription>
        </CardHeader>
      </Card>
    </div>
  );
}
