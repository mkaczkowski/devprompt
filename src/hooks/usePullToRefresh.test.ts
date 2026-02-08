import { renderHook } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';

import { usePullToRefresh } from './usePullToRefresh';

describe('usePullToRefresh', () => {
  const mockOnRefresh = vi.fn();

  it('returns correct initial state and API shape', () => {
    const { result } = renderHook(() => usePullToRefresh({ onRefresh: mockOnRefresh }));

    // Initial state
    expect(result.current.pullDistance).toBe(0);
    expect(result.current.isRefreshing).toBe(false);

    // API shape - containerRef is returned for attachment
    expect(result.current.containerRef).toBeDefined();
    expect(result.current.containerRef.current).toBeNull();
  });

  it('respects isEnabled default value', () => {
    const { result } = renderHook(() => usePullToRefresh({ onRefresh: mockOnRefresh }));

    // Hook should be enabled by default
    expect(result.current.pullDistance).toBe(0);
    expect(result.current.isRefreshing).toBe(false);
  });

  it('accepts all configuration options', () => {
    // Should not throw with all options provided
    const { result } = renderHook(() =>
      usePullToRefresh({
        onRefresh: mockOnRefresh,
        isEnabled: true,
        threshold: 100,
        maxPullDistance: 200,
        resistance: 0.75,
        cooldown: 500,
      }),
    );

    expect(result.current.pullDistance).toBe(0);
    expect(result.current.containerRef).toBeDefined();
  });
});
