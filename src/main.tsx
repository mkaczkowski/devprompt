import { I18nProvider } from '@lingui/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { ReactQueryDevtools } from '@tanstack/react-query-devtools';
import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { BrowserRouter } from 'react-router';

import './index.css';
import App from './App';

import { ErrorBoundary } from '@/components/shared';
import { Toaster } from '@/components/ui/sonner';
import { ClerkThemeProvider, SupabaseProvider } from '@/contexts';
import { MobileProvider } from '@/contexts/mobileContext';
import { CLERK_CONFIG } from '@/lib/config';
import { i18n, initI18n } from '@/lib/i18n';
import { initPreferencesSync } from '@/stores/preferencesStore';

// Create a client for TanStack Query
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 1000 * 60 * 5, // 5 minutes
      retry: 1,
    },
  },
});

// Initialize multi-tab sync for preferences
const cleanupPreferencesSync = initPreferencesSync();

// Initialize i18n before rendering (with error handling to ensure app renders)
initI18n()
  .catch((error) => {
    console.error('Failed to initialize i18n:', error);
  })
  .finally(() => {
    createRoot(document.getElementById('root')!).render(
      <StrictMode>
        <BrowserRouter>
          <I18nProvider i18n={i18n}>
            <QueryClientProvider client={queryClient}>
              <ClerkThemeProvider publishableKey={CLERK_CONFIG.publishableKey}>
                <SupabaseProvider>
                  <MobileProvider>
                    <ErrorBoundary>
                      <App />
                      <Toaster />
                    </ErrorBoundary>
                  </MobileProvider>
                </SupabaseProvider>
              </ClerkThemeProvider>
              <ReactQueryDevtools initialIsOpen={false} />
            </QueryClientProvider>
          </I18nProvider>
        </BrowserRouter>
      </StrictMode>,
    );
  });

// Cleanup on HMR (development only)
if (import.meta.hot) {
  import.meta.hot.dispose(() => {
    cleanupPreferencesSync();
  });
}
