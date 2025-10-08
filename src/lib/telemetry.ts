// Telemetry functions for tracking user interactions and performance
import { supabase } from '@/integrations/supabase/client';

// Generate a session ID for this browsing session
const SESSION_ID = crypto.randomUUID();

interface AnalyticsEvent {
  event_type: 'button_click' | 'page_view';
  event_name: string;
  page_url?: string;
  page_path?: string;
  button_label?: string;
  button_type?: string;
  session_id?: string;
  user_agent?: string;
  referrer?: string;
  metadata?: Record<string, any>;
}

async function saveEvent(event: AnalyticsEvent) {
  try {
    // Don't track admin pages
    const currentPath = window.location.pathname;
    if (currentPath.startsWith('/admin')) {
      console.log('[Analytics] Skipping admin page tracking:', currentPath);
      return;
    }

    const eventData = {
      ...event,
      session_id: SESSION_ID,
      user_agent: navigator.userAgent,
      referrer: document.referrer || undefined,
      page_url: window.location.href,
      page_path: window.location.pathname,
    };

    // Save to Supabase
    const { error } = await supabase
      .from('analytics_events')
      .insert([eventData]);

    if (error) {
      console.error('[Analytics] Failed to save event:', error);
    } else {
      console.log(`[Analytics] Event tracked:`, event);
    }
  } catch (error) {
    console.error('[Analytics] Failed to save event:', error);
  }
}

// Track page views
export function trackPageView(page: string) {
  saveEvent({
    event_type: 'page_view',
    event_name: page,
  });
}

// Track button clicks
export function trackButtonClick(buttonLabel: string, buttonType?: string) {
  saveEvent({
    event_type: 'button_click',
    event_name: buttonLabel,
    button_label: buttonLabel,
    button_type: buttonType,
  });
}

// Track Calendly button clicks specifically
export function trackCalendlyClick(buttonLabel: string, page: string) {
  trackButtonClick(buttonLabel, 'calendly');
  console.log(`[Calendly] Button "${buttonLabel}" clicked on ${page}`);
}

export function trackJobSearchEvent(event: string, data: Record<string, any> = {}) {
  console.log(`[Telemetry] Job Search - ${event}:`, data);
}

export function trackForYouEvent(event: string, data: Record<string, any> = {}) {
  console.log(`[Telemetry] ForYou - ${event}:`, data);
}

export function trackCompanyMatchingEvent(event: string, data: Record<string, any> = {}) {
  console.log(`[Telemetry] Company Matching - ${event}:`, data);
}

export function trackJobCardEvent(event: string, data: Record<string, any> = {}) {
  console.log(`[Telemetry] Job Card - ${event}:`, data);
}
