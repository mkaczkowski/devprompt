import { useCallback, useEffect, useRef, useState } from 'react';

interface UsePullToRefreshOptions {
  /** Callback function to execute when refresh is triggered */
  onRefresh: () => void | Promise<void>;
  /** Whether pull-to-refresh is enabled (default: true) */
  isEnabled?: boolean;
  /** Distance in pixels required to trigger refresh (default: 80) */
  threshold?: number;
  /** Maximum pull distance in pixels (default: 150) */
  maxPullDistance?: number;
  /** Resistance factor applied during pull (default: 0.5) */
  resistance?: number;
  /** Cooldown period in ms between refreshes (default: 1000) */
  cooldown?: number;
}

interface UsePullToRefreshReturn {
  /** Current pull distance in pixels (with resistance applied) */
  pullDistance: number;
  /** Whether a refresh is currently in progress */
  isRefreshing: boolean;
  /** Ref to attach to the scrollable container */
  containerRef: React.RefObject<HTMLDivElement | null>;
}

/**
 * Hook for implementing pull-to-refresh functionality.
 * Only triggers when the container is scrolled to the top.
 *
 * Uses native event listeners with { passive: false } to allow preventDefault().
 */
export function usePullToRefresh({
  onRefresh,
  isEnabled = true,
  threshold = 80,
  maxPullDistance = 150,
  resistance = 0.5,
  cooldown = 1000,
}: UsePullToRefreshOptions): UsePullToRefreshReturn {
  const [pullDistance, setPullDistance] = useState(0);
  const [isRefreshing, setIsRefreshing] = useState(false);

  const containerRef = useRef<HTMLDivElement | null>(null);
  const startYRef = useRef<number | null>(null);
  const lastRefreshTimeRef = useRef<number>(0);
  // Use ref to track pull distance for async handler (avoids stale closure)
  const pullDistanceRef = useRef(0);
  // Track if component is mounted for cleanup
  const isMountedRef = useRef(true);
  // Track if we're actively pulling (for preventDefault)
  const isPullingRef = useRef(false);
  // Track if refresh is in progress (ref for event handlers)
  const isRefreshingRef = useRef(false);

  // Sync state to refs
  useEffect(() => {
    pullDistanceRef.current = pullDistance;
  }, [pullDistance]);

  useEffect(() => {
    isRefreshingRef.current = isRefreshing;
  }, [isRefreshing]);

  // Cleanup on unmount
  useEffect(() => {
    isMountedRef.current = true;
    return () => {
      isMountedRef.current = false;
    };
  }, []);

  const handleTouchStart = useCallback(
    (e: TouchEvent) => {
      if (!isEnabled) return;

      // Only start tracking if scrolled to top
      const container = containerRef.current;
      if (!container || container.scrollTop > 0) {
        startYRef.current = null;
        isPullingRef.current = false;
        return;
      }

      startYRef.current = e.touches[0].clientY;
    },
    [isEnabled],
  );

  const handleTouchMove = useCallback(
    (e: TouchEvent) => {
      if (!isEnabled || startYRef.current === null || isRefreshingRef.current) return;

      const container = containerRef.current;
      if (!container) return;

      // If user has scrolled down, reset
      if (container.scrollTop > 0) {
        startYRef.current = null;
        isPullingRef.current = false;
        setPullDistance(0);
        return;
      }

      const currentY = e.touches[0].clientY;
      const rawDistance = currentY - startYRef.current;

      // Only track downward pulls
      if (rawDistance <= 0) {
        isPullingRef.current = false;
        setPullDistance(0);
        return;
      }

      // We're actively pulling - prevent default to avoid browser interference
      isPullingRef.current = true;
      e.preventDefault();

      // Apply resistance and cap at max distance
      const resistedDistance = Math.min(rawDistance * resistance, maxPullDistance);
      setPullDistance(resistedDistance);
    },
    [isEnabled, resistance, maxPullDistance],
  );

  const handleTouchEnd = useCallback(
    async (e: TouchEvent) => {
      if (!isEnabled || startYRef.current === null) return;

      // Prevent default if we were pulling
      if (isPullingRef.current) {
        e.preventDefault();
      }

      // Use ref value to avoid stale closure
      const currentPullDistance = pullDistanceRef.current;
      const shouldRefresh = currentPullDistance >= threshold;

      if (shouldRefresh && !isRefreshingRef.current) {
        const now = Date.now();
        const timeSinceLastRefresh = now - lastRefreshTimeRef.current;

        if (timeSinceLastRefresh >= cooldown) {
          setIsRefreshing(true);
          isRefreshingRef.current = true;
          lastRefreshTimeRef.current = now;

          // Keep content pulled at threshold during refresh
          setPullDistance(threshold);

          try {
            await onRefresh();
          } finally {
            // Only update state if still mounted
            if (isMountedRef.current) {
              setIsRefreshing(false);
              isRefreshingRef.current = false;
              setPullDistance(0);
            }
          }

          startYRef.current = null;
          isPullingRef.current = false;
          return;
        }
      }

      startYRef.current = null;
      isPullingRef.current = false;
      setPullDistance(0);
    },
    [isEnabled, threshold, cooldown, onRefresh],
  );

  // Attach native event listeners with { passive: false } to allow preventDefault
  useEffect(() => {
    const container = containerRef.current;
    if (!container || !isEnabled) return;

    // Use { passive: false } to allow preventDefault() on touch events
    container.addEventListener('touchstart', handleTouchStart, { passive: true });
    container.addEventListener('touchmove', handleTouchMove, { passive: false });
    container.addEventListener('touchend', handleTouchEnd, { passive: false });

    return () => {
      container.removeEventListener('touchstart', handleTouchStart);
      container.removeEventListener('touchmove', handleTouchMove);
      container.removeEventListener('touchend', handleTouchEnd);
    };
  }, [isEnabled, handleTouchStart, handleTouchMove, handleTouchEnd]);

  return {
    pullDistance,
    isRefreshing,
    containerRef,
  };
}
