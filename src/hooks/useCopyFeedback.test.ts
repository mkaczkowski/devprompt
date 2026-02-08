import { act, renderHook } from '@testing-library/react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import { useCopyFeedback } from './useCopyFeedback';

import { TIMING } from '@/lib/constants';

describe('useCopyFeedback', () => {
  beforeEach(() => {
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it('returns isCopied: false initially', () => {
    const { result } = renderHook(() => useCopyFeedback());
    expect(result.current.isCopied).toBe(false);
  });

  it('sets isCopied to true when triggerCopied is called', () => {
    const { result } = renderHook(() => useCopyFeedback());

    act(() => {
      result.current.triggerCopied();
    });

    expect(result.current.isCopied).toBe(true);
  });

  it('resets isCopied to false after default duration', () => {
    const { result } = renderHook(() => useCopyFeedback());

    act(() => {
      result.current.triggerCopied();
    });
    expect(result.current.isCopied).toBe(true);

    // Just before duration ends
    act(() => {
      vi.advanceTimersByTime(TIMING.COPY_FEEDBACK_DURATION - 1);
    });
    expect(result.current.isCopied).toBe(true);

    // At duration
    act(() => {
      vi.advanceTimersByTime(1);
    });
    expect(result.current.isCopied).toBe(false);
  });

  it('respects custom duration', () => {
    const customDuration = 1000;
    const { result } = renderHook(() => useCopyFeedback(customDuration));

    act(() => {
      result.current.triggerCopied();
    });

    act(() => {
      vi.advanceTimersByTime(customDuration - 1);
    });
    expect(result.current.isCopied).toBe(true);

    act(() => {
      vi.advanceTimersByTime(1);
    });
    expect(result.current.isCopied).toBe(false);
  });

  it('resets timer if triggered again quickly', () => {
    const duration = 1000;
    const { result } = renderHook(() => useCopyFeedback(duration));

    act(() => {
      result.current.triggerCopied();
    });

    // Wait 500ms
    act(() => {
      vi.advanceTimersByTime(500);
    });
    expect(result.current.isCopied).toBe(true);

    // Trigger again - resets timer
    act(() => {
      result.current.triggerCopied();
    });

    // Wait another 500ms (1000ms total from first trigger)
    act(() => {
      vi.advanceTimersByTime(500);
    });
    expect(result.current.isCopied).toBe(true);

    // Wait remaining 500ms from second trigger
    act(() => {
      vi.advanceTimersByTime(500);
    });
    expect(result.current.isCopied).toBe(false);
  });

  it('cleans up timeout on unmount', () => {
    const { result, unmount } = renderHook(() => useCopyFeedback(1000));

    act(() => {
      result.current.triggerCopied();
    });

    // Unmount before timeout completes - should not cause errors
    unmount();

    // This should not throw
    act(() => {
      vi.advanceTimersByTime(1000);
    });
  });

  it('maintains stable triggerCopied reference', () => {
    const { result, rerender } = renderHook(() => useCopyFeedback());

    const firstRef = result.current.triggerCopied;
    rerender();
    const secondRef = result.current.triggerCopied;

    expect(firstRef).toBe(secondRef);
  });
});
