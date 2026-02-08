import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { renderHook } from '@testing-library/react';
import { type ReactNode } from 'react';
import { beforeEach, describe, expect, it } from 'vitest';

import { usePromptSync } from './usePromptSync';

import { mockProfiles } from '@/mocks/fixtures/profiles';
import { resetClerkMocks, setMockClerkSignedIn } from '@/test/clerkMock';
import { resetSupabaseMocks, setMockSupabaseData } from '@/test/supabaseMock';

// Create a wrapper with QueryClient for hook testing
function createWrapper() {
  const queryClient = new QueryClient({
    defaultOptions: {
      queries: { retry: false },
      mutations: { retry: false },
    },
  });

  return function Wrapper({ children }: { children: ReactNode }) {
    return <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>;
  };
}

describe('usePromptSync', () => {
  beforeEach(() => {
    resetClerkMocks();
    resetSupabaseMocks();
    mockProfiles[0].sync_enabled = false;
  });

  describe('return interface', () => {
    it('returns expected shape when signed out', () => {
      setMockClerkSignedIn(false);

      const { result } = renderHook(() => usePromptSync(), { wrapper: createWrapper() });

      expect(result.current).toEqual({
        syncEnabled: false,
        isMerging: false,
        error: null,
        syncPrompt: expect.any(Function),
        syncDelete: expect.any(Function),
        triggerMerge: expect.any(Function),
      });
    });

    it('returns expected shape when signed in with sync disabled', () => {
      setMockClerkSignedIn(true);
      setMockSupabaseData([{ ...mockProfiles[0], sync_enabled: false }]);

      const { result } = renderHook(() => usePromptSync(), { wrapper: createWrapper() });

      expect(result.current.syncEnabled).toBe(false);
      expect(result.current.isMerging).toBe(false);
      expect(result.current.error).toBeNull();
      expect(typeof result.current.syncPrompt).toBe('function');
      expect(typeof result.current.syncDelete).toBe('function');
      expect(typeof result.current.triggerMerge).toBe('function');
    });
  });

  describe('syncEnabled state', () => {
    it('defaults to false when profile not loaded', () => {
      setMockClerkSignedIn(true);

      const { result } = renderHook(() => usePromptSync(), { wrapper: createWrapper() });

      // syncEnabled should be false by default (profile not yet loaded)
      expect(result.current.syncEnabled).toBe(false);
    });
  });

  describe('manual sync functions', () => {
    it('syncPrompt does not throw when called with sync disabled', () => {
      setMockClerkSignedIn(true);
      mockProfiles[0].sync_enabled = false;

      const { result } = renderHook(() => usePromptSync(), { wrapper: createWrapper() });

      // Should not throw when sync is disabled
      expect(() => result.current.syncPrompt('some-prompt-id')).not.toThrow();
    });

    it('syncDelete does not throw when called with sync disabled', () => {
      setMockClerkSignedIn(true);
      mockProfiles[0].sync_enabled = false;

      const { result } = renderHook(() => usePromptSync(), { wrapper: createWrapper() });

      // Should not throw when sync is disabled
      expect(() => result.current.syncDelete('some-prompt-id')).not.toThrow();
    });

    it('triggerMerge does not throw when called with sync disabled', async () => {
      setMockClerkSignedIn(true);
      mockProfiles[0].sync_enabled = false;

      const { result } = renderHook(() => usePromptSync(), { wrapper: createWrapper() });

      // Should not throw when sync is disabled
      await expect(result.current.triggerMerge()).resolves.not.toThrow();
    });
  });
});
