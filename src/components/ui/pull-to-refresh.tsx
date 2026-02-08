import type { ReactNode } from 'react';

import { Spinner } from '@/components/ui/spinner';
import { usePullToRefresh } from '@/hooks/usePullToRefresh';
import { cn } from '@/lib/utils';

interface PullToRefreshProps {
  /** Content to wrap with pull-to-refresh functionality */
  children: ReactNode;
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
  /** Additional class name for the container */
  className?: string;
}

/**
 * Wrapper component that adds pull-to-refresh functionality to its children.
 * Designed for mobile touch interactions.
 */
export function PullToRefresh({
  children,
  onRefresh,
  isEnabled = true,
  threshold = 80,
  maxPullDistance = 150,
  resistance,
  className,
}: PullToRefreshProps) {
  const { pullDistance, isRefreshing, containerRef } = usePullToRefresh({
    onRefresh,
    isEnabled,
    threshold,
    maxPullDistance,
    resistance,
  });

  // Calculate indicator opacity and position
  const progress = Math.min(pullDistance / threshold, 1);
  const showIndicator = pullDistance > 0 || isRefreshing;
  // During refresh, use fixed threshold height; otherwise use pull distance
  const indicatorHeight = isRefreshing ? threshold : pullDistance;
  // Track if we're animating back to resting position
  const isAnimatingBack = !isRefreshing && pullDistance === 0;

  if (!isEnabled) {
    return <div className={className}>{children}</div>;
  }

  return (
    <div
      ref={containerRef}
      className={cn('relative overscroll-none', className)}
      style={{
        // Prevent browser's native pull-to-refresh and overscroll
        touchAction: 'pan-x pinch-zoom',
      }}
      data-testid="pull-to-refresh-container"
    >
      {/* Pull indicator */}
      {showIndicator && (
        <div
          className="pointer-events-none absolute right-0 left-0 z-10 flex items-center justify-center"
          style={{
            top: 0,
            height: indicatorHeight,
            opacity: isRefreshing ? 1 : progress,
            transition: isAnimatingBack ? 'all 200ms ease-out' : 'none',
          }}
          data-testid="pull-to-refresh-indicator"
        >
          <div
            className={cn(
              'bg-background flex size-10 items-center justify-center rounded-full shadow-md',
              isRefreshing && 'animate-pulse',
            )}
            style={{
              // Full scale during refresh, otherwise based on progress
              transform: `scale(${isRefreshing ? 1 : 0.5 + progress * 0.5})`,
              transition: isAnimatingBack ? 'transform 200ms ease-out' : 'none',
            }}
          >
            <Spinner size="sm" className={cn(!isRefreshing && 'opacity-70')} />
          </div>
        </div>
      )}

      {/* Content wrapper with transform */}
      <div
        style={{
          transform: indicatorHeight > 0 ? `translateY(${indicatorHeight}px)` : undefined,
          transition: isAnimatingBack ? 'transform 200ms ease-out' : 'none',
        }}
        data-testid="pull-to-refresh-content"
      >
        {children}
      </div>
    </div>
  );
}
