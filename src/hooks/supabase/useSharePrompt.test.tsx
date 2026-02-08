import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { act, renderHook } from '@testing-library/react';
import { type ReactNode } from 'react';
import { beforeEach, describe, expect, it } from 'vitest';

import { getShareInfoFromCloudPrompt, useSharePrompt, useUnsharePrompt } from './useSharePrompt';

import { resetClerkMocks, setMockClerkSignedIn } from '@/test/clerkMock';
import { resetSupabaseMocks, setMockSupabaseError } from '@/test/supabaseMock';
import type { CloudPrompt } from '@/types/database';

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

describe('useSharePrompt', () => {
  beforeEach(() => {
    resetClerkMocks();
    resetSupabaseMocks();
    setMockClerkSignedIn(true);
  });

  describe('useSharePrompt hook', () => {
    it('returns a share token on success', async () => {
      const { result } = renderHook(() => useSharePrompt(), { wrapper: createWrapper() });

      await act(async () => {
        const res = await result.current.mutateAsync('prompt-1');
        expect(res.shareToken).toBeDefined();
        expect(typeof res.sharedAt).toBe('number');
      });
    });

    it('throws when user is not authenticated', async () => {
      setMockClerkSignedIn(false);
      const { result } = renderHook(() => useSharePrompt(), { wrapper: createWrapper() });

      await expect(act(() => result.current.mutateAsync('prompt-1'))).rejects.toThrow('No authenticated user');
    });

    it('throws on supabase error', async () => {
      setMockSupabaseError({ message: 'DB error', code: '500' });
      const { result } = renderHook(() => useSharePrompt(), { wrapper: createWrapper() });

      await expect(act(() => result.current.mutateAsync('prompt-1'))).rejects.toMatchObject({ message: 'DB error' });
    });
  });

  describe('useUnsharePrompt hook', () => {
    it('returns promptId on success', async () => {
      const { result } = renderHook(() => useUnsharePrompt(), { wrapper: createWrapper() });

      await act(async () => {
        const res = await result.current.mutateAsync('prompt-1');
        expect(res.promptId).toBe('prompt-1');
      });
    });

    it('throws when user is not authenticated', async () => {
      setMockClerkSignedIn(false);
      const { result } = renderHook(() => useUnsharePrompt(), { wrapper: createWrapper() });

      await expect(act(() => result.current.mutateAsync('prompt-1'))).rejects.toThrow('No authenticated user');
    });

    it('throws on supabase error', async () => {
      setMockSupabaseError({ message: 'Forbidden', code: '403' });
      const { result } = renderHook(() => useUnsharePrompt(), { wrapper: createWrapper() });

      await expect(act(() => result.current.mutateAsync('prompt-1'))).rejects.toMatchObject({ message: 'Forbidden' });
    });
  });

  describe('getShareInfoFromCloudPrompt', () => {
    it('returns null for undefined prompt', () => {
      expect(getShareInfoFromCloudPrompt(undefined)).toBeNull();
    });

    it('returns null when share_token is missing', () => {
      const prompt = { id: '1' } as CloudPrompt;
      expect(getShareInfoFromCloudPrompt(prompt)).toBeNull();
    });

    it('returns share info with shared_at date', () => {
      const prompt = {
        id: '1',
        share_token: 'tok-abc',
        shared_at: '2024-01-01T00:00:00Z',
      } as CloudPrompt & { share_token: string; shared_at: string };

      const result = getShareInfoFromCloudPrompt(prompt);
      expect(result).toEqual({
        shareToken: 'tok-abc',
        sharedAt: new Date('2024-01-01T00:00:00Z').getTime(),
      });
    });

    it('uses Date.now() when shared_at is null', () => {
      const now = Date.now();
      const prompt = {
        id: '1',
        share_token: 'tok-abc',
        shared_at: null,
      } as CloudPrompt & { share_token: string; shared_at: null };

      const result = getShareInfoFromCloudPrompt(prompt);
      expect(result!.shareToken).toBe('tok-abc');
      expect(result!.sharedAt).toBeGreaterThanOrEqual(now);
    });
  });
});
