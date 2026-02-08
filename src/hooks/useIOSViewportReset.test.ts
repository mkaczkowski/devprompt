import { renderHook } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';

import { useIOSViewportReset } from './useIOSViewportReset';

describe('useIOSViewportReset', () => {
  it('returns a stable blur handler function', () => {
    const { result, rerender } = renderHook(() => useIOSViewportReset());

    const firstRef = result.current;
    rerender();
    const secondRef = result.current;

    expect(typeof firstRef).toBe('function');
    expect(firstRef).toBe(secondRef);
  });

  it('scrolls to top when blur handler is called', () => {
    vi.useFakeTimers();
    const scrollToSpy = vi.spyOn(window, 'scrollTo').mockImplementation(() => {});

    const { result } = renderHook(() => useIOSViewportReset());

    // Call the blur handler
    result.current();

    // Should not scroll immediately
    expect(scrollToSpy).not.toHaveBeenCalled();

    // Advance past the 50ms delay
    vi.advanceTimersByTime(50);

    expect(scrollToSpy).toHaveBeenCalledWith(0, 0);

    scrollToSpy.mockRestore();
    vi.useRealTimers();
  });

  it('is safe to call handler multiple times', () => {
    vi.useFakeTimers();
    const scrollToSpy = vi.spyOn(window, 'scrollTo').mockImplementation(() => {});

    const { result } = renderHook(() => useIOSViewportReset());

    // Call multiple times
    result.current();
    result.current();
    result.current();

    vi.advanceTimersByTime(50);

    // Each call triggers a scroll
    expect(scrollToSpy).toHaveBeenCalledTimes(3);

    scrollToSpy.mockRestore();
    vi.useRealTimers();
  });
});
