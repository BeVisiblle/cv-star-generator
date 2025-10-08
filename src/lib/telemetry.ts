// Telemetry functions for tracking user interactions and performance

// Store analytics data in localStorage for now (can be sent to backend later)
const ANALYTICS_KEY = 'bevisiblle_analytics';

interface AnalyticsEvent {
  type: 'button_click' | 'page_view';
  timestamp: string;
  page?: string;
  buttonLabel?: string;
  buttonType?: string;
  url?: string;
}

function saveEvent(event: AnalyticsEvent) {
  try {
    const stored = localStorage.getItem(ANALYTICS_KEY);
    const events: AnalyticsEvent[] = stored ? JSON.parse(stored) : [];
    events.push(event);
    localStorage.setItem(ANALYTICS_KEY, JSON.stringify(events));
    console.log(`[Analytics] Event tracked:`, event);
  } catch (error) {
    console.error('[Analytics] Failed to save event:', error);
  }
}

// Get all analytics events
export function getAnalytics() {
  try {
    const stored = localStorage.getItem(ANALYTICS_KEY);
    return stored ? JSON.parse(stored) : [];
  } catch (error) {
    console.error('[Analytics] Failed to get analytics:', error);
    return [];
  }
}

// Get analytics summary
export function getAnalyticsSummary() {
  const events = getAnalytics();
  const summary = {
    totalEvents: events.length,
    buttonClicks: events.filter((e: AnalyticsEvent) => e.type === 'button_click').length,
    pageViews: events.filter((e: AnalyticsEvent) => e.type === 'page_view').length,
    calendlyClicks: events.filter((e: AnalyticsEvent) => e.buttonType === 'calendly').length,
    pageViewsByPage: {} as Record<string, number>,
    buttonClicksByLabel: {} as Record<string, number>,
  };

  events.forEach((event: AnalyticsEvent) => {
    if (event.type === 'page_view' && event.page) {
      summary.pageViewsByPage[event.page] = (summary.pageViewsByPage[event.page] || 0) + 1;
    }
    if (event.type === 'button_click' && event.buttonLabel) {
      summary.buttonClicksByLabel[event.buttonLabel] = (summary.buttonClicksByLabel[event.buttonLabel] || 0) + 1;
    }
  });

  return summary;
}

// Track page views
export function trackPageView(page: string) {
  saveEvent({
    type: 'page_view',
    timestamp: new Date().toISOString(),
    page,
    url: window.location.href,
  });
}

// Track button clicks
export function trackButtonClick(buttonLabel: string, buttonType?: string) {
  saveEvent({
    type: 'button_click',
    timestamp: new Date().toISOString(),
    buttonLabel,
    buttonType,
    page: window.location.pathname,
  });
}

// Track Calendly button clicks specifically
export function trackCalendlyClick(buttonLabel: string, page: string) {
  trackButtonClick(buttonLabel, 'calendly');
  console.log(`[Calendly] Button "${buttonLabel}" clicked on ${page}`);
}

export function trackJobSearchEvent(event: string, data: Record<string, any> = {}) {
  console.log(`[Telemetry] Job Search - ${event}:`, data);
  // Telemetry service implementation pending
}

export function trackForYouEvent(event: string, data: Record<string, any> = {}) {
  console.log(`[Telemetry] ForYou - ${event}:`, data);
  // Telemetry service implementation pending
}

export function trackCompanyMatchingEvent(event: string, data: Record<string, any> = {}) {
  console.log(`[Telemetry] Company Matching - ${event}:`, data);
  // Telemetry service implementation pending
}

export function trackJobCardEvent(event: string, data: Record<string, any> = {}) {
  console.log(`[Telemetry] Job Card - ${event}:`, data);
  // Telemetry service implementation pending
}
