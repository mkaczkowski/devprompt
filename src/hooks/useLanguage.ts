import { useLingui } from '@lingui/react';
import { useCallback, useEffect, useRef, useState } from 'react';

import { useLocalStorage } from './useLocalStorage';

import { loadCatalog, type Locale, locales } from '@/lib/i18n';
import { STORAGE_KEYS } from '@/lib/storageKeys';

/** Supported locales type */
export type SupportedLocale = Locale;

/**
 * Provides language state management and switching functionality for LinguiJS.
 */
export function useLanguage(): {
  locale: string;
  isLoading: boolean;
  changeLanguage: (locale: SupportedLocale) => Promise<void>;
  availableLocales: typeof locales;
} {
  const { i18n } = useLingui();
  const [isLoading, setIsLoading] = useState(false);
  const [, setStoredLocale] = useLocalStorage<SupportedLocale>(`${STORAGE_KEYS.preferences}-locale`, 'en');

  // Track mounted state to avoid state updates after unmount
  const mountedRef = useRef(true);
  useEffect(() => {
    return () => {
      mountedRef.current = false;
    };
  }, []);

  const changeLanguage = useCallback(
    async (locale: SupportedLocale) => {
      setIsLoading(true);
      try {
        await loadCatalog(locale);
        if (mountedRef.current) {
          setStoredLocale(locale);
        }
      } finally {
        if (mountedRef.current) {
          setIsLoading(false);
        }
      }
    },
    [setStoredLocale],
  );

  return {
    locale: i18n.locale,
    isLoading,
    changeLanguage,
    availableLocales: locales,
  };
}
