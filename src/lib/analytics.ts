'use client';

export const GA_MEASUREMENT_ID = process.env.NEXT_PUBLIC_GA_ID;

/**
 * Log a GA4 event
 * @param eventName The name of the event (e.g., 'searched', 'ask_question')
 * @param params Optional event parameters
 */
export const trackEvent = (eventName: string, params?: Record<string, any>) => {
  if (typeof window !== 'undefined' && (window as any).gtag) {
    (window as any).gtag('event', eventName, params);
  } else if (process.env.NODE_ENV === 'development') {
    // Optional: Log to console in dev mode
    console.log(`[Analytics] ${eventName}:`, params);
  }
};
