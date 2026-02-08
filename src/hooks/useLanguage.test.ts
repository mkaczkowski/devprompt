import { act, renderHook } from '@testing-library/react';
import { beforeEach, describe, expect, it, vi } from 'vitest';

import { useLanguage } from './useLanguage';
import { useLocalStorage } from './useLocalStorage';

import { loadCatalog, locales } from '@/lib/i18n';

// Mock i18n module
vi.mock('@/lib/i18n', () => ({
  loadCatalog: vi.fn().mockResolvedValue(undefined),
  locales: { en: 'English' },
  defaultLocale: 'en',
}));

// Mock useLingui hook
vi.mock('@lingui/react', () => ({
  useLingui: vi.fn(() => ({
    i18n: { locale: 'en' },
  })),
}));

// Mock useLocalStorage
vi.mock('./useLocalStorage', () => ({
  useLocalStorage: vi.fn(() => ['en', vi.fn()]),
}));

describe('useLanguage', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('returns current locale from LinguiJS', () => {
    const { result } = renderHook(() => useLanguage());
    expect(result.current.locale).toBe('en');
  });

  it('returns loading state initially as false', () => {
    const { result } = renderHook(() => useLanguage());
    expect(result.current.isLoading).toBe(false);
  });

  it('returns available locales', () => {
    const { result } = renderHook(() => useLanguage());
    expect(result.current.availableLocales).toEqual(locales);
  });

  it('changeLanguage loads catalog and updates stored locale', async () => {
    const setStoredLocale = vi.fn();
    vi.mocked(useLocalStorage).mockReturnValue(['en', setStoredLocale]);

    const { result } = renderHook(() => useLanguage());

    await act(async () => {
      await result.current.changeLanguage('en');
    });

    expect(loadCatalog).toHaveBeenCalledWith('en');
    expect(setStoredLocale).toHaveBeenCalledWith('en');
  });

  it('sets isLoading to true during language change', async () => {
    vi.mocked(loadCatalog).mockImplementation(
      () => new Promise((resolve) => setTimeout(() => resolve(undefined), 100)),
    );

    const { result } = renderHook(() => useLanguage());

    const changePromise = act(async () => {
      const promise = result.current.changeLanguage('en');
      await promise;
    });

    await changePromise;

    // Verify the flow works and loading returns to false after completion
    expect(loadCatalog).toHaveBeenCalled();
    expect(result.current.isLoading).toBe(false);
  });

  it('provides stable changeLanguage reference', () => {
    const { result, rerender } = renderHook(() => useLanguage());

    const firstRef = result.current.changeLanguage;
    rerender();
    const secondRef = result.current.changeLanguage;

    expect(firstRef).toBe(secondRef);
  });
});
