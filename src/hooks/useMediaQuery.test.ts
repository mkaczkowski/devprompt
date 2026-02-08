import { act, renderHook } from '@testing-library/react';
import { beforeEach, describe, expect, it, vi } from 'vitest';

import { BREAKPOINTS, useIsDesktop, useIsMobile, useMediaQuery } from '@/hooks/useMediaQuery';
import { mockMatchMedia } from '@/test';

describe('useMediaQuery', () => {
  beforeEach(() => {
    window.matchMedia = mockMatchMedia(false);
  });

  it.each([
    { matches: false, expected: false },
    { matches: true, expected: true },
  ])('returns $expected when query matches=$matches', ({ matches, expected }) => {
    window.matchMedia = mockMatchMedia(matches);
    const { result } = renderHook(() => useMediaQuery('(min-width: 768px)'));
    expect(result.current).toBe(expected);
  });

  it('updates when media query changes', () => {
    let listener: ((e: MediaQueryListEvent) => void) | null = null;
    window.matchMedia = vi.fn().mockImplementation((query: string) => ({
      matches: false,
      media: query,
      addEventListener: vi.fn((_: string, cb: (e: MediaQueryListEvent) => void) => {
        listener = cb;
      }),
      removeEventListener: vi.fn(),
    }));

    const { result } = renderHook(() => useMediaQuery('(min-width: 768px)'));
    expect(result.current).toBe(false);

    act(() => listener?.({ matches: true } as MediaQueryListEvent));
    expect(result.current).toBe(true);
  });
});

describe('BREAKPOINTS', () => {
  it('has correct values', () => {
    expect(BREAKPOINTS).toEqual({ sm: 640, md: 768, lg: 1024, xl: 1280 });
  });
});

describe('useIsMobile / useIsDesktop', () => {
  it.each([
    { hook: useIsMobile, matches: false, expected: true, name: 'useIsMobile (mobile)' },
    { hook: useIsMobile, matches: true, expected: false, name: 'useIsMobile (desktop)' },
    { hook: useIsDesktop, matches: true, expected: true, name: 'useIsDesktop (desktop)' },
    { hook: useIsDesktop, matches: false, expected: false, name: 'useIsDesktop (mobile)' },
  ])('$name returns $expected', ({ hook, matches, expected }) => {
    window.matchMedia = mockMatchMedia(matches);
    const { result } = renderHook(() => hook());
    expect(result.current).toBe(expected);
  });
});
