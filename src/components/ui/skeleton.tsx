import { cn } from '@/lib/utils';

export type SkeletonProps = React.HTMLAttributes<HTMLDivElement>;

export function Skeleton({ className, ...props }: SkeletonProps) {
  return <div className={cn('bg-muted animate-pulse rounded-md', className)} {...props} />;
}

/**
 * Skeleton for text content
 */
export function SkeletonText({ className, lines = 1 }: { className?: string; lines?: number }) {
  return (
    <div className={cn('space-y-2', className)}>
      {Array.from({ length: lines }).map((_, i) => (
        <Skeleton key={i} className={cn('h-4', i === lines - 1 && lines > 1 ? 'w-3/4' : 'w-full')} />
      ))}
    </div>
  );
}

/**
 * Skeleton for card content
 */
export function SkeletonCard({ className }: { className?: string }) {
  return (
    <div
      className={cn(
        'flex flex-col gap-2.5 rounded-2xl p-4',
        'bg-glass-subtle',
        'border-glass-border/50 border',
        'shadow-glass-shadow shadow-sm',
        'animate-pulse',
        className,
      )}
    >
      <Skeleton className="mb-4 h-32 w-full" />
      <Skeleton className="mb-2 h-4 w-3/4" />
      <Skeleton className="h-4 w-1/2" />
    </div>
  );
}

/**
 * Skeleton for avatar
 */
export function SkeletonAvatar({
  className,
  size = 'default',
}: {
  className?: string;
  size?: 'sm' | 'default' | 'lg';
}) {
  const sizeClasses = {
    sm: 'size-8',
    default: 'size-10',
    lg: 'size-12',
  };

  return <Skeleton className={cn('rounded-full', sizeClasses[size], className)} />;
}
