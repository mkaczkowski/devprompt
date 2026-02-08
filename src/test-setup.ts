import '@testing-library/jest-dom/vitest';
import { afterAll, afterEach, beforeAll, vi } from 'vitest';

import { loadCatalog } from '@/lib/i18n';
import { server } from '@/mocks/node';

// =============================================================================
// Sentry Mocks
// =============================================================================

// Mock Sentry to prevent actual error reporting during tests
vi.mock('@sentry/react', () => ({
  init: vi.fn(),
  browserTracingIntegration: vi.fn(() => ({})),
  captureException: vi.fn(),
}));

// =============================================================================
// Clerk Mocks
// =============================================================================

// Mock Clerk to avoid auth-related errors during tests
vi.mock('@clerk/react-router', async () => {
  const clerkMock = await import('@/test/clerkMock');
  return {
    ClerkProvider: clerkMock.ClerkProvider,
    SignedIn: clerkMock.SignedIn,
    SignedOut: clerkMock.SignedOut,
    SignInButton: clerkMock.SignInButton,
    SignUpButton: clerkMock.SignUpButton,
    UserButton: clerkMock.UserButton,
    RedirectToSignIn: clerkMock.RedirectToSignIn,
    useAuth: clerkMock.useAuth,
    useUser: clerkMock.useUser,
    useSession: clerkMock.useSession,
  };
});

// =============================================================================
// Supabase Context Mocks
// =============================================================================

// Mock Supabase context
vi.mock('@/contexts/supabaseContext', async () => {
  const supabaseMock = await import('@/test/supabaseMock');
  return {
    SupabaseProvider: supabaseMock.SupabaseProvider,
    useSupabase: supabaseMock.useSupabase,
  };
});

// =============================================================================
// MSW Server Setup
// =============================================================================

// Start MSW server before all tests and initialize i18n
beforeAll(async () => {
  // Initialize i18n with default locale
  await loadCatalog('en');

  server.listen({
    onUnhandledRequest: 'warn', // Warn about unhandled requests during tests
  });
});

// Reset handlers after each test to ensure test isolation
afterEach(() => {
  server.resetHandlers();
});

// Close MSW server after all tests complete
afterAll(() => {
  server.close();
});

// =============================================================================
// Browser API Mocks
// =============================================================================

// Mock ResizeObserver
global.ResizeObserver = class ResizeObserver {
  observe() {}
  unobserve() {}
  disconnect() {}
};

// Mock matchMedia
Object.defineProperty(window, 'matchMedia', {
  writable: true,
  value: (query: string) => ({
    matches: false,
    media: query,
    onchange: null,
    addListener: () => {},
    removeListener: () => {},
    addEventListener: () => {},
    removeEventListener: () => {},
    dispatchEvent: () => false,
  }),
});

// Mock scrollTo
window.scrollTo = () => {};
