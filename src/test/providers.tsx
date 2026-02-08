import { I18nProvider } from '@lingui/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { render, type RenderOptions } from '@testing-library/react';
import { type ReactElement, type ReactNode } from 'react';
import { MemoryRouter } from 'react-router';

import { MobileProvider } from '@/contexts/mobileContext';
import { i18n } from '@/lib/i18n';

interface WrapperProps {
  children: ReactNode;
}

// Create a new QueryClient for each test to avoid shared state
function createTestQueryClient() {
  return new QueryClient({
    defaultOptions: {
      queries: {
        retry: false, // Don't retry failed queries in tests
        gcTime: 0, // Garbage collect immediately
      },
      mutations: {
        retry: false,
      },
    },
  });
}

function AllProviders({ children }: WrapperProps) {
  const queryClient = createTestQueryClient();

  return (
    <MemoryRouter>
      <I18nProvider i18n={i18n}>
        <QueryClientProvider client={queryClient}>
          <MobileProvider>{children}</MobileProvider>
        </QueryClientProvider>
      </I18nProvider>
    </MemoryRouter>
  );
}

function customRender(ui: ReactElement, options?: Omit<RenderOptions, 'wrapper'>) {
  return render(ui, { wrapper: AllProviders, ...options });
}

export { customRender as render };
