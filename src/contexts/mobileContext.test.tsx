import { act, renderHook } from '@testing-library/react';
import type { ReactNode } from 'react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import { MobileProvider, useMobileContext } from '@/contexts/mobileContext';

const wrapper = ({ children }: { children: ReactNode }) => <MobileProvider>{children}</MobileProvider>;

describe('MobileProvider', () => {
  let rafCallback: FrameRequestCallback | null = null;

  beforeEach(() => {
    vi.spyOn(window, 'requestAnimationFrame').mockImplementation((cb) => {
      rafCallback = cb;
      return 1;
    });
    vi.spyOn(window, 'cancelAnimationFrame').mockImplementation(() => {});
  });

  afterEach(() => {
    rafCallback = null;
    vi.restoreAllMocks();
  });

  it.each([
    { width: 500, isMobile: true, isTablet: false, isDesktop: false },
    { width: 800, isMobile: false, isTablet: true, isDesktop: false },
    { width: 1200, isMobile: false, isTablet: false, isDesktop: true },
  ])('detects viewport at $width px', ({ width, isMobile, isTablet, isDesktop }) => {
    Object.defineProperty(window, 'innerWidth', { value: width, writable: true, configurable: true });
    const { result } = renderHook(() => useMobileContext(), { wrapper });
    expect(result.current).toMatchObject({ isMobile, isTablet, isDesktop, width });
  });

  it('updates on resize', () => {
    Object.defineProperty(window, 'innerWidth', { value: 1200, writable: true, configurable: true });
    const { result } = renderHook(() => useMobileContext(), { wrapper });

    expect(result.current.isDesktop).toBe(true);

    act(() => {
      Object.defineProperty(window, 'innerWidth', { value: 500, writable: true, configurable: true });
      window.dispatchEvent(new Event('resize'));
      rafCallback?.(0);
    });

    expect(result.current.isMobile).toBe(true);
  });

  it('throws when used outside provider', () => {
    vi.spyOn(console, 'error').mockImplementation(() => {});
    expect(() => renderHook(() => useMobileContext())).toThrow('useMobileContext must be used within MobileProvider');
  });
});
