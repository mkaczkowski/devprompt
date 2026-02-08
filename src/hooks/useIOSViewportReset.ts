import { useCallback } from 'react';

/**
 * Returns a blur handler that fixes iOS Safari's viewport scroll bug
 * when the keyboard is dismissed.
 *
 * Uses a 50ms delay to allow the viewport to settle before resetting.
 */
export function useIOSViewportReset(): () => void {
  const handleBlur = useCallback(() => {
    // Use setTimeout to allow viewport to settle after keyboard dismissal
    setTimeout(() => {
      window.scrollTo(0, 0);
    }, 50);
  }, []);

  return handleBlur;
}
