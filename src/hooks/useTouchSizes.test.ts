import { renderHook } from '@testing-library/react';
import { beforeEach, describe, expect, it, vi } from 'vitest';

import { useTouchSizes } from './useTouchSizes';

import { useMobileContext } from '@/contexts/mobileContext';

// Mock the mobile context
vi.mock('@/contexts/mobileContext', () => ({
  useMobileContext: vi.fn(),
}));

describe('useTouchSizes', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it.each([
    {
      isMobile: false,
      expected: {
        button: 'default',
        buttonSm: 'sm',
        iconButton: 'icon-sm',
        iconButtonLg: 'icon',
        responsiveButton: 'default',
        input: 'default',
        select: 'default',
        tabs: 'default',
        toggle: 'sm',
        textarea: 'default',
      },
    },
    {
      isMobile: true,
      expected: {
        button: 'touch',
        buttonSm: 'touch',
        iconButton: 'icon-touch',
        iconButtonLg: 'icon-touch',
        responsiveButton: 'icon-touch',
        input: 'touch',
        select: 'touch',
        tabs: 'touch',
        toggle: 'touch',
        textarea: 'touch',
      },
    },
  ])('returns $expected.button sizes when isMobile=$isMobile', ({ isMobile, expected }) => {
    vi.mocked(useMobileContext).mockReturnValue({
      isMobile,
      isTablet: false,
      isDesktop: !isMobile,
      width: isMobile ? 375 : 1024,
    });

    const { result } = renderHook(() => useTouchSizes());

    expect(result.current).toEqual(expected);
  });
});
