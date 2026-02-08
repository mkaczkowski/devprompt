import { useEffect, useRef, useState } from 'react';

export const BREAKPOINTS = {
  sm: 640,
  md: 768,
  lg: 1024,
  xl: 1280,
} as const;

/**
 * Hook to track a media query match status.
 * Optimized to reuse matchMedia objects when the query doesn't change.
 */
export function useMediaQuery(query: string): boolean {
  const [matches, setMatches] = useState(() => {
    if (typeof window !== 'undefined') {
      return window.matchMedia(query).matches;
    }
    return false;
  });

  // Use ref to store the MediaQueryList to avoid recreating on every render
  const mediaQueryRef = useRef<MediaQueryList | null>(null);

  useEffect(() => {
    // Create or update the MediaQueryList only when query changes
    mediaQueryRef.current = window.matchMedia(query);

    const handler = (e: MediaQueryListEvent) => setMatches(e.matches);

    // Sync initial state
    setMatches(mediaQueryRef.current.matches);

    mediaQueryRef.current.addEventListener('change', handler);

    return () => {
      mediaQueryRef.current?.removeEventListener('change', handler);
    };
  }, [query]);

  return matches;
}

/**
 * Convenience hooks for common breakpoints
 */
export function useIsMobile(): boolean {
  return !useMediaQuery(`(min-width: ${BREAKPOINTS.md}px)`);
}

export function useIsDesktop(): boolean {
  return useMediaQuery(`(min-width: ${BREAKPOINTS.lg}px)`);
}
