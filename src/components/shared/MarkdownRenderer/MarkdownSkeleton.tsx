import { Skeleton } from '@/components/ui/skeleton';

/**
 * Loading skeleton for MarkdownRenderer.
 * Uses contrast-friendly colors for dark backgrounds.
 */
export function MarkdownSkeleton() {
  const skeletonClass = 'bg-muted dark:bg-border/50';
  return (
    <div className="space-y-3">
      <Skeleton className={`h-6 w-3/4 ${skeletonClass}`} />
      <Skeleton className={`h-4 w-full ${skeletonClass}`} />
      <Skeleton className={`h-4 w-5/6 ${skeletonClass}`} />
      <Skeleton className={`h-4 w-full ${skeletonClass}`} />
      <Skeleton className={`h-6 w-1/2 ${skeletonClass}`} />
      <Skeleton className={`h-4 w-4/5 ${skeletonClass}`} />
    </div>
  );
}
