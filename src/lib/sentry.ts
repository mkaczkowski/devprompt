import type * as SentryType from '@sentry/react';

let sentryInstance: typeof SentryType | null = null;

/**
 * Initialize Sentry error tracking.
 * Only runs in production when VITE_SENTRY_DSN is configured.
 */
export async function initSentry(): Promise<void> {
  // Skip in development or if already initialized
  if (import.meta.env.DEV || sentryInstance) return;

  const dsn = import.meta.env.VITE_SENTRY_DSN;
  if (!dsn) return;

  const sentry = await import('@sentry/react');

  sentry.init({
    dsn,
    environment: import.meta.env.MODE,
    sendDefaultPii: false,
    integrations: [sentry.browserTracingIntegration()],
    tracesSampleRate: 0.1,
  });

  sentryInstance = sentry;
}

/**
 * Lazily initialize Sentry after the app is interactive.
 * Uses requestIdleCallback with fallback for older browsers.
 */
export function lazySentryInit(): void {
  const init = () => void initSentry();

  if ('requestIdleCallback' in window) {
    window.requestIdleCallback(init, { timeout: 2000 });
  } else {
    setTimeout(init, 1000);
  }
}

interface CaptureContext {
  componentStack?: string;
}

/**
 * Capture an exception to Sentry.
 * No-op if Sentry is not initialized.
 */
export function captureException(error: unknown, context?: CaptureContext): void {
  sentryInstance?.captureException(error, {
    extra: context?.componentStack ? { componentStack: context.componentStack } : undefined,
  });
}
