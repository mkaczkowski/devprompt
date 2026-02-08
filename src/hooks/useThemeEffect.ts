import { useEffect } from 'react';

import { usePreferencesStore } from '@/stores';

/**
 * Hook that syncs the theme preference to the DOM.
 * Handles 'system' theme by listening to prefers-color-scheme changes.
 */
export function useThemeEffect() {
  const theme = usePreferencesStore((state) => state.theme);
  const getResolvedTheme = usePreferencesStore((state) => state.getResolvedTheme);

  useEffect(() => {
    // Apply the resolved theme to the DOM
    const applyTheme = () => {
      const resolved = getResolvedTheme();
      document.documentElement.classList.toggle('dark', resolved === 'dark');
    };

    applyTheme();

    // If theme is 'system', listen for system preference changes
    if (theme === 'system') {
      const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
      const handleChange = () => applyTheme();

      mediaQuery.addEventListener('change', handleChange);
      return () => mediaQuery.removeEventListener('change', handleChange);
    }
  }, [theme, getResolvedTheme]);
}
