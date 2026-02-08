import { useCallback, useEffect, useMemo, useRef } from 'react';

import { TIMING } from '@/lib/constants';

/** Debounced callback with cancel capability */
export interface DebouncedCallback<T extends (...args: never[]) => void> {
  /** Call the debounced function */
  call: (...args: Parameters<T>) => void;
  /** Cancel any pending debounced calls */
  cancel: () => void;
}

/**
 * Returns a debounced version of a callback that only fires after a delay
 * since the last call.
 *
 * @param callback - Function to debounce
 * @param delay - Delay in ms (defaults to TIMING.DEBOUNCE_DELAY)
 * @returns Object with `call()` to invoke the debounced function and `cancel()` to clear pending calls
 */
export function useDebouncedCallback<T extends (...args: never[]) => void>(
  callback: T,
  delay: number = TIMING.DEBOUNCE_DELAY,
): DebouncedCallback<T> {
  const callbackRef = useRef(callback);
  const timeoutRef = useRef<ReturnType<typeof setTimeout> | undefined>(undefined);

  // Keep callback ref up to date without restarting debounce
  useEffect(() => {
    callbackRef.current = callback;
  }, [callback]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, []);

  // Cancel function
  const cancel = useCallback(() => {
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
      timeoutRef.current = undefined;
    }
  }, []);

  // Debounced call function
  const call = useCallback(
    (...args: Parameters<T>) => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
      timeoutRef.current = setTimeout(() => {
        callbackRef.current(...args);
      }, delay);
    },
    [delay],
  );

  // Return stable object reference
  return useMemo(() => ({ call, cancel }), [call, cancel]);
}
