import { createContext, type ReactNode, useContext, useEffect, useMemo, useState } from 'react';

import { BREAKPOINTS } from '@/hooks/useMediaQuery';

interface MobileContextValue {
  isMobile: boolean;
  isTablet: boolean;
  isDesktop: boolean;
  /** Current viewport width in pixels */
  width: number;
}

const MobileContext = createContext<MobileContextValue | null>(null);

/**
 * Optimized MobileProvider that uses a single resize listener
 * instead of multiple matchMedia listeners.
 */
export function MobileProvider({ children }: { children: ReactNode }) {
  const [width, setWidth] = useState(() => {
    if (typeof window === 'undefined') return BREAKPOINTS.lg;
    return window.innerWidth;
  });

  useEffect(() => {
    let rafId: number;
    let lastWidth = window.innerWidth;

    const handleResize = () => {
      // Debounce with requestAnimationFrame for performance
      cancelAnimationFrame(rafId);
      rafId = requestAnimationFrame(() => {
        const newWidth = window.innerWidth;
        // Only update if width actually changed to prevent unnecessary re-renders
        if (newWidth !== lastWidth) {
          lastWidth = newWidth;
          setWidth(newWidth);
        }
      });
    };

    window.addEventListener('resize', handleResize, { passive: true });
    return () => {
      window.removeEventListener('resize', handleResize);
      cancelAnimationFrame(rafId);
    };
  }, []);

  const value = useMemo(() => {
    const isMobile = width < BREAKPOINTS.md;
    const isTablet = width >= BREAKPOINTS.md && width < BREAKPOINTS.lg;
    const isDesktop = width >= BREAKPOINTS.lg;

    return { isMobile, isTablet, isDesktop, width };
  }, [width]);

  return <MobileContext.Provider value={value}>{children}</MobileContext.Provider>;
}

export function useMobileContext(): MobileContextValue {
  const context = useContext(MobileContext);
  if (!context) {
    throw new Error('useMobileContext must be used within MobileProvider');
  }
  return context;
}
