import React, { useEffect, useState } from 'react';
import { getAnalytics, getAnalyticsSummary, trackPageView } from '@/lib/telemetry';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';

export default function Analytics() {
  const [summary, setSummary] = useState<any>(null);
  const [events, setEvents] = useState<any[]>([]);

  useEffect(() => {
    trackPageView('Analytics Dashboard');
    
    const loadAnalytics = () => {
      setSummary(getAnalyticsSummary());
      setEvents(getAnalytics());
    };
    
    loadAnalytics();
    
    // Refresh every 5 seconds
    const interval = setInterval(loadAnalytics, 5000);
    return () => clearInterval(interval);
  }, []);

  if (!summary) {
    return <div className="p-8">Lade Analytics...</div>;
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
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 p-8">
      <div className="max-w-7xl mx-auto space-y-8">
        <div>
          <h1 className="text-4xl font-bold text-slate-900">Analytics Dashboard</h1>
          <p className="text-slate-600 mt-2">Übersicht über Button-Klicks und Seitenaufrufe</p>
        </div>

        {/* Summary Cards */}
        <div className="grid gap-6 md:grid-cols-4">
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
              <CardTitle className="text-3xl text-[#5170ff]">{summary.calendlyClicks}</CardTitle>
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
                {pageViewsData.map((item) => (
                  <div key={item.page} className="flex items-center justify-between p-3 bg-slate-50 rounded-lg">
                    <span className="font-medium">{item.page}</span>
                    <span className="text-2xl font-bold text-[#5170ff]">{item.views}</span>
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
                  <div key={item.label} className="flex items-center justify-between p-3 bg-slate-50 rounded-lg">
                    <span className="font-medium text-sm">{item.label}</span>
                    <span className="text-2xl font-bold text-[#5170ff]">{item.clicks}</span>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        )}

        {/* Recent Events */}
        <Card>
          <CardHeader>
            <CardTitle>Letzte Events</CardTitle>
            <CardDescription>Die 20 neuesten aufgezeichneten Events</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-2 max-h-96 overflow-auto">
              {events.slice(-20).reverse().map((event, idx) => (
                <div
                  key={idx}
                  className="flex items-center justify-between p-3 bg-slate-50 rounded-lg hover:bg-slate-100 transition"
                >
                  <div className="flex-1">
                    <div className="flex items-center gap-2">
                      <span className={`px-2 py-1 rounded text-xs font-semibold ${
                        event.type === 'page_view' 
                          ? 'bg-blue-100 text-blue-700' 
                          : event.buttonType === 'calendly'
                          ? 'bg-purple-100 text-purple-700'
                          : 'bg-green-100 text-green-700'
                      }`}>
                        {event.type === 'page_view' ? '👁️ Page View' : '🖱️ Click'}
                      </span>
                      {event.buttonType === 'calendly' && (
                        <span className="px-2 py-1 rounded text-xs font-semibold bg-[#5170ff] text-white">
                          📅 Calendly
                        </span>
                      )}
                    </div>
                    <p className="text-sm font-medium text-slate-900 mt-1">
                      {event.type === 'page_view' ? event.page : event.buttonLabel}
                    </p>
                    {event.page && event.type === 'button_click' && (
                      <p className="text-xs text-slate-500">auf {event.page}</p>
                    )}
                  </div>
                  <div className="text-right">
                    <p className="text-xs text-slate-500">
                      {new Date(event.timestamp).toLocaleString('de-DE')}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        <Card className="bg-blue-50 border-blue-200">
          <CardHeader>
            <CardTitle>💡 Hinweis</CardTitle>
            <CardDescription>
              Die Analytics-Daten werden im Browser (localStorage) gespeichert. Um die Daten zu exportieren, öffnen Sie die Browser-Konsole und führen Sie aus:
            </CardDescription>
          </CardHeader>
          <CardContent>
            <code className="block bg-white p-3 rounded text-sm">
              JSON.stringify(JSON.parse(localStorage.getItem('bevisiblle_analytics')), null, 2)
            </code>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
