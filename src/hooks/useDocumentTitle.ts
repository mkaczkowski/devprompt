import { useEffect, useRef } from 'react';

import { APP_CONFIG } from '@/lib/config';

/**
 * Sets the document title dynamically, with cleanup on unmount.
 *
 * @param title - The page title (will be formatted as "{title} | {APP_NAME}")
 */
export function useDocumentTitle(title?: string): void {
  const previousTitleRef = useRef<string | undefined>(undefined);

  useEffect(() => {
    if (typeof document === 'undefined') return;

    // Store previous title on first run
    if (previousTitleRef.current === undefined) {
      previousTitleRef.current = document.title;
    }

    // Format title as "{title} | {APP_NAME}" or just "{APP_NAME}" if empty
    document.title = title ? `${title} | ${APP_CONFIG.name}` : APP_CONFIG.name;

    return () => {
      // Restore previous title on unmount
      if (previousTitleRef.current !== undefined) {
        document.title = previousTitleRef.current;
      }
    };
  }, [title]);
}
