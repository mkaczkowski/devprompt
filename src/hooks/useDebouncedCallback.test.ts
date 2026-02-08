import { act, renderHook } from '@testing-library/react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import { useDebouncedCallback } from './useDebouncedCallback';

import { TIMING } from '@/lib/constants';

describe('useDebouncedCallback', () => {
  beforeEach(() => {
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it('debounces callback execution', () => {
    const callback = vi.fn();
    const { result } = renderHook(() => useDebouncedCallback(callback));

    act(() => {
      result.current.call('arg1');
      result.current.call('arg2');
      result.current.call('arg3');
    });

    // Not called yet
    expect(callback).not.toHaveBeenCalled();

    // Advance time past debounce delay
    act(() => {
      vi.advanceTimersByTime(TIMING.DEBOUNCE_DELAY);
    });

    // Called once with last arguments
    expect(callback).toHaveBeenCalledTimes(1);
    expect(callback).toHaveBeenCalledWith('arg3');
  });

  it('uses default delay from TIMING.DEBOUNCE_DELAY', () => {
    const callback = vi.fn();
    const { result } = renderHook(() => useDebouncedCallback(callback));

    act(() => {
      result.current.call();
    });

    // Just before default delay
    act(() => {
      vi.advanceTimersByTime(TIMING.DEBOUNCE_DELAY - 1);
    });
    expect(callback).not.toHaveBeenCalled();

    // At default delay
    act(() => {
      vi.advanceTimersByTime(1);
    });
    expect(callback).toHaveBeenCalledTimes(1);
  });

  it('respects custom delay', () => {
    const callback = vi.fn();
    const customDelay = 500;
    const { result } = renderHook(() => useDebouncedCallback(callback, customDelay));

    act(() => {
      result.current.call();
    });

    act(() => {
      vi.advanceTimersByTime(customDelay - 1);
    });
    expect(callback).not.toHaveBeenCalled();

    act(() => {
      vi.advanceTimersByTime(1);
    });
    expect(callback).toHaveBeenCalledTimes(1);
  });

  it('resets timer on each call', () => {
    const callback = vi.fn();
    const delay = 100;
    const { result } = renderHook(() => useDebouncedCallback(callback, delay));

    act(() => {
      result.current.call();
    });

    // Advance halfway
    act(() => {
      vi.advanceTimersByTime(50);
    });

    // Call again - resets timer
    act(() => {
      result.current.call();
    });

    // Advance another 50ms (100ms total from first call)
    act(() => {
      vi.advanceTimersByTime(50);
    });
    expect(callback).not.toHaveBeenCalled();

    // Advance remaining 50ms
    act(() => {
      vi.advanceTimersByTime(50);
    });
    expect(callback).toHaveBeenCalledTimes(1);
  });

  it('maintains stable object reference', () => {
    const callback = vi.fn();
    const { result, rerender } = renderHook(() => useDebouncedCallback(callback, 100));

    const firstRef = result.current;
    rerender();
    const secondRef = result.current;

    // Object reference is stable
    expect(firstRef).toBe(secondRef);
  });

  it('uses latest callback version', () => {
    let counter = 0;
    const { result, rerender } = renderHook(({ cb }) => useDebouncedCallback(cb, 100), {
      initialProps: { cb: () => counter++ },
    });

    act(() => {
      result.current.call();
    });

    // Update callback before debounce fires
    const newCallback = vi.fn(() => (counter = 100));
    rerender({ cb: newCallback });

    act(() => {
      vi.advanceTimersByTime(100);
    });

    // Should have used the new callback
    expect(counter).toBe(100);
    expect(newCallback).toHaveBeenCalled();
  });

  it('cleans up timeout on unmount', () => {
    const callback = vi.fn();
    const { result, unmount } = renderHook(() => useDebouncedCallback(callback, 100));

    act(() => {
      result.current.call();
    });

    unmount();

    act(() => {
      vi.advanceTimersByTime(100);
    });

    // Callback should not be called after unmount
    expect(callback).not.toHaveBeenCalled();
  });

  it('cancels pending call when cancel() is invoked', () => {
    const callback = vi.fn();
    const { result } = renderHook(() => useDebouncedCallback(callback, 100));

    act(() => {
      result.current.call();
    });

    // Advance halfway
    act(() => {
      vi.advanceTimersByTime(50);
    });
    expect(callback).not.toHaveBeenCalled();

    // Cancel the pending call
    act(() => {
      result.current.cancel();
    });

    // Advance past the delay
    act(() => {
      vi.advanceTimersByTime(100);
    });

    // Callback should not be called after cancel
    expect(callback).not.toHaveBeenCalled();
  });

  it('cancel is a no-op when no call is pending', () => {
    const callback = vi.fn();
    const { result } = renderHook(() => useDebouncedCallback(callback, 100));

    // Cancel without prior call — should not throw
    act(() => {
      result.current.cancel();
    });

    act(() => {
      vi.advanceTimersByTime(100);
    });

    expect(callback).not.toHaveBeenCalled();
  });

  it('can call again after cancel', () => {
    const callback = vi.fn();
    const { result } = renderHook(() => useDebouncedCallback(callback, 100));

    // First call
    act(() => {
      result.current.call();
    });

    // Cancel
    act(() => {
      result.current.cancel();
    });

    // New call
    act(() => {
      result.current.call();
    });

    // Advance past the delay
    act(() => {
      vi.advanceTimersByTime(100);
    });

    // New call should have executed
    expect(callback).toHaveBeenCalledTimes(1);
  });
});
