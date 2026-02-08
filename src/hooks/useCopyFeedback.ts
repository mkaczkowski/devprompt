import { useCallback, useEffect, useRef, useState } from 'react';

import { TIMING } from '@/lib/constants';

/**
 * Manages temporary "Copied!" feedback state with automatic reset after a duration.
 *
 * @param duration - How long to show feedback (defaults to TIMING.COPY_FEEDBACK_DURATION)
 */
export function useCopyFeedback(duration: number = TIMING.COPY_FEEDBACK_DURATION): {
  isCopied: boolean;
  triggerCopied: () => void;
} {
  const [isCopied, setIsCopied] = useState(false);
  const timeoutRef = useRef<ReturnType<typeof setTimeout> | undefined>(undefined);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, []);

  const triggerCopied = useCallback(() => {
    // Clear any existing timeout
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }

    setIsCopied(true);

    // Reset after duration
    timeoutRef.current = setTimeout(() => {
      setIsCopied(false);
    }, duration);
  }, [duration]);

  return { isCopied, triggerCopied };
}
