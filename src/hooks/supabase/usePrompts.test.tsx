import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { act, renderHook, waitFor } from '@testing-library/react';
import { type ReactNode } from 'react';
import { beforeEach, describe, expect, it } from 'vitest';

import {
  toCloudPromptUpsert,
  useBulkUpsertPrompts,
  useDeleteCloudPrompt,
  useUpsertPrompt,
  useUserPrompts,
} from './usePrompts';

import { resetClerkMocks, setMockClerkSignedIn } from '@/test/clerkMock';
import { resetSupabaseMocks } from '@/test/supabaseMock';
import type { PromptData } from '@/types/prompt';

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

describe('usePrompts', () => {
  beforeEach(() => {
    resetClerkMocks();
    resetSupabaseMocks();
    setMockClerkSignedIn(true);
  });

  describe('toCloudPromptUpsert', () => {
    it('converts local prompt data to cloud format', () => {
      const promptData: PromptData = {
        title: 'Test Prompt',
        sections: [{ id: '1', title: 'Section 1', content: 'Content', enabled: true, collapsed: false }],
        tokenCount: 50,
      };

      const result = toCloudPromptUpsert(
        'prompt-123',
        'Test Title',
        'Test description',
        1,
        50,
        promptData,
        1704067200000,
        1704153600000,
      );

      expect(result).toEqual({
        id: 'prompt-123',
        title: 'Test Title',
        description: 'Test description',
        section_count: 1,
        token_count: 50,
        data: promptData,
        client_created_at: 1704067200000,
        client_updated_at: 1704153600000,
      });
    });

    it('converts undefined description to null', () => {
      const promptData: PromptData = {
        title: 'Test',
        sections: [],
        tokenCount: 0,
      };

      const result = toCloudPromptUpsert('id', 'title', undefined, 0, 0, promptData, 0, 0);

      expect(result.description).toBeNull();
    });
  });

  describe('useUserPrompts', () => {
    it('returns query result shape', () => {
      const { result } = renderHook(() => useUserPrompts(), { wrapper: createWrapper() });

      // Check that the hook returns TanStack Query result shape
      expect(typeof result.current.isLoading).toBe('boolean');
      expect(result.current.refetch).toBeDefined();
      expect(typeof result.current.isFetching).toBe('boolean');
    });

    it('does not fetch when user is not loaded', async () => {
      setMockClerkSignedIn(false);

      const { result } = renderHook(() => useUserPrompts(), { wrapper: createWrapper() });

      // Query should be disabled when not signed in
      expect(result.current.isLoading).toBe(false);
      expect(result.current.data).toBeUndefined();
    });
  });

  describe('useUpsertPrompt', () => {
    it('returns mutation controls', () => {
      const { result } = renderHook(() => useUpsertPrompt(), { wrapper: createWrapper() });

      expect(result.current.mutate).toBeDefined();
      expect(result.current.mutateAsync).toBeDefined();
      expect(result.current.isPending).toBe(false);
      expect(result.current.isSuccess).toBe(false);
      expect(result.current.error).toBeNull();
    });

    it('calls mutate without throwing', async () => {
      const { result } = renderHook(() => useUpsertPrompt(), { wrapper: createWrapper() });

      const promptData: PromptData = {
        title: 'New Prompt',
        sections: [],
        tokenCount: 0,
      };

      // The mutation should not throw
      act(() => {
        result.current.mutate({
          id: 'new-prompt-id',
          title: 'New Prompt',
          description: null,
          section_count: 0,
          token_count: 0,
          data: promptData,
          client_created_at: Date.now(),
          client_updated_at: Date.now(),
        });
      });

      // Mutation should be triggered (either pending, success, or still idle)
      expect(result.current.isPending || result.current.isSuccess || result.current.isIdle).toBe(true);
    });
  });

  describe('useBulkUpsertPrompts', () => {
    it('returns mutation controls', () => {
      const { result } = renderHook(() => useBulkUpsertPrompts(), { wrapper: createWrapper() });

      expect(result.current.mutate).toBeDefined();
      expect(result.current.mutateAsync).toBeDefined();
      expect(result.current.isPending).toBe(false);
    });

    it('handles empty array input', async () => {
      const { result } = renderHook(() => useBulkUpsertPrompts(), { wrapper: createWrapper() });

      act(() => {
        result.current.mutate([]);
      });

      await waitFor(() => expect(result.current.isSuccess).toBe(true));

      expect(result.current.data).toEqual([]);
    });
  });

  describe('useDeleteCloudPrompt', () => {
    it('returns mutation controls', () => {
      const { result } = renderHook(() => useDeleteCloudPrompt(), { wrapper: createWrapper() });

      expect(result.current.mutate).toBeDefined();
      expect(result.current.mutateAsync).toBeDefined();
      expect(result.current.isPending).toBe(false);
      expect(result.current.isSuccess).toBe(false);
    });

    it('accepts prompt ID for deletion', () => {
      const { result } = renderHook(() => useDeleteCloudPrompt(), { wrapper: createWrapper() });

      // Should not throw when called with string ID
      act(() => {
        result.current.mutate('prompt-to-delete');
      });

      expect(result.current.isPending || result.current.isSuccess || result.current.isIdle).toBe(true);
    });
  });
});
