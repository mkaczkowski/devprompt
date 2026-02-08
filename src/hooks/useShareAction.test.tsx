import { I18nProvider } from '@lingui/react';
import { renderHook, act } from '@testing-library/react';
import { type ReactNode } from 'react';
import { beforeEach, describe, expect, it, vi } from 'vitest';

import { useShareAction } from './useShareAction';

import * as clipboard from '@/lib/clipboard';
import { i18n } from '@/lib/i18n';
import { toast } from '@/lib/toast';

// Mock dependencies
vi.mock('@/lib/clipboard', () => ({
  copyToClipboard: vi.fn(),
}));

vi.mock('@/lib/toast', () => ({
  toast: Object.assign(vi.fn(), {
    success: vi.fn(),
    error: vi.fn(),
  }),
}));

const mockMutateAsync = vi.fn();
const mockUnshareMutateAsync = vi.fn();

vi.mock('./supabase/useSharePrompt', () => ({
  useSharePrompt: () => ({
    isPending: false,
    mutateAsync: mockMutateAsync,
  }),
  useUnsharePrompt: () => ({
    isPending: false,
    mutateAsync: mockUnshareMutateAsync,
  }),
}));

function wrapper({ children }: { children: ReactNode }) {
  return <I18nProvider i18n={i18n}>{children}</I18nProvider>;
}

describe('useShareAction', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('returns initial state with loading flags false', () => {
    const { result } = renderHook(() => useShareAction(), { wrapper });

    expect(result.current.isSharing).toBe(false);
    expect(result.current.isUnsharing).toBe(false);
    expect(result.current.isLoading).toBe(false);
  });

  describe('copyShareUrl', () => {
    it('copies URL and shows success toast', async () => {
      vi.mocked(clipboard.copyToClipboard).mockResolvedValue(true);
      const { result } = renderHook(() => useShareAction(), { wrapper });

      let success: boolean;
      await act(async () => {
        success = await result.current.copyShareUrl('abc');
      });

      expect(clipboard.copyToClipboard).toHaveBeenCalledWith(expect.stringContaining('/s/abc'));
      expect(toast.success).toHaveBeenCalled();
      expect(success!).toBe(true);
    });

    it('shows error toast when clipboard fails', async () => {
      vi.mocked(clipboard.copyToClipboard).mockResolvedValue(false);
      const { result } = renderHook(() => useShareAction(), { wrapper });

      let success: boolean;
      await act(async () => {
        success = await result.current.copyShareUrl('abc');
      });

      expect(toast.error).toHaveBeenCalled();
      expect(success!).toBe(false);
    });
  });

  describe('share', () => {
    it('shares prompt and copies URL on success', async () => {
      mockMutateAsync.mockResolvedValue({ shareToken: 'tok-1' });
      vi.mocked(clipboard.copyToClipboard).mockResolvedValue(true);
      const { result } = renderHook(() => useShareAction(), { wrapper });

      let token: string | null;
      await act(async () => {
        token = await result.current.share('prompt-1');
      });

      expect(mockMutateAsync).toHaveBeenCalledWith('prompt-1');
      expect(toast.success).toHaveBeenCalled();
      expect(token!).toBe('tok-1');
    });

    it('shows share link in description when clipboard fails', async () => {
      mockMutateAsync.mockResolvedValue({ shareToken: 'tok-2' });
      vi.mocked(clipboard.copyToClipboard).mockResolvedValue(false);
      const { result } = renderHook(() => useShareAction(), { wrapper });

      await act(async () => {
        await result.current.share('prompt-1');
      });

      expect(toast.success).toHaveBeenCalledWith(
        expect.any(String),
        expect.objectContaining({
          description: expect.stringContaining('/s/tok-2'),
        }),
      );
    });

    it('shows error toast on mutation failure with Error message', async () => {
      mockMutateAsync.mockRejectedValue(new Error('Network error'));
      const { result } = renderHook(() => useShareAction(), { wrapper });

      let token: string | null;
      await act(async () => {
        token = await result.current.share('prompt-1');
      });

      expect(toast.error).toHaveBeenCalledWith(
        expect.any(String),
        expect.objectContaining({ description: 'Network error' }),
      );
      expect(token!).toBeNull();
    });

    it('shows "Unknown error" for non-Error throws', async () => {
      mockMutateAsync.mockRejectedValue('something');
      const { result } = renderHook(() => useShareAction(), { wrapper });

      await act(async () => {
        await result.current.share('prompt-1');
      });

      expect(toast.error).toHaveBeenCalledWith(
        expect.any(String),
        expect.objectContaining({ description: expect.any(String) }),
      );
    });
  });

  describe('unshare', () => {
    it('unshares prompt and shows success toast', async () => {
      mockUnshareMutateAsync.mockResolvedValue(undefined);
      const { result } = renderHook(() => useShareAction(), { wrapper });

      let success: boolean;
      await act(async () => {
        success = await result.current.unshare('prompt-1');
      });

      expect(mockUnshareMutateAsync).toHaveBeenCalledWith('prompt-1');
      expect(toast.success).toHaveBeenCalled();
      expect(success!).toBe(true);
    });

    it('shows error toast on unshare failure with Error message', async () => {
      mockUnshareMutateAsync.mockRejectedValue(new Error('Forbidden'));
      const { result } = renderHook(() => useShareAction(), { wrapper });

      let success: boolean;
      await act(async () => {
        success = await result.current.unshare('prompt-1');
      });

      expect(toast.error).toHaveBeenCalledWith(
        expect.any(String),
        expect.objectContaining({ description: 'Forbidden' }),
      );
      expect(success!).toBe(false);
    });

    it('shows "Unknown error" for non-Error throws', async () => {
      mockUnshareMutateAsync.mockRejectedValue(42);
      const { result } = renderHook(() => useShareAction(), { wrapper });

      await act(async () => {
        await result.current.unshare('prompt-1');
      });

      expect(toast.error).toHaveBeenCalledWith(
        expect.any(String),
        expect.objectContaining({ description: expect.any(String) }),
      );
    });
  });
});
