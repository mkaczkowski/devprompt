import { act, renderHook } from '@testing-library/react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import { useThemeEffect } from '@/hooks/useThemeEffect';
import { usePreferencesStore } from '@/stores/preferencesStore';
import { mockMatchMedia } from '@/test';

describe('useThemeEffect', () => {
  beforeEach(() => {
    usePreferencesStore.setState({ theme: 'light' });
    document.documentElement.classList.remove('dark');
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it.each([
    { theme: 'light', systemDark: false, expectDark: false },
    { theme: 'dark', systemDark: false, expectDark: true },
    { theme: 'system', systemDark: true, expectDark: true },
    { theme: 'system', systemDark: false, expectDark: false },
  ] as const)('applies dark=$expectDark for theme=$theme (system=$systemDark)', ({ theme, systemDark, expectDark }) => {
    usePreferencesStore.setState({ theme });
    window.matchMedia = mockMatchMedia(systemDark);

    renderHook(() => useThemeEffect());

    expect(document.documentElement.classList.contains('dark')).toBe(expectDark);
  });

  it('updates theme when store changes', () => {
    window.matchMedia = mockMatchMedia(false);
    renderHook(() => useThemeEffect());

    expect(document.documentElement.classList.contains('dark')).toBe(false);

    act(() => usePreferencesStore.setState({ theme: 'dark' }));

    expect(document.documentElement.classList.contains('dark')).toBe(true);
  });
});
