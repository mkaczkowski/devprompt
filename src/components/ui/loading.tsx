import { Spinner } from './spinner';

import { cn } from '@/lib/utils';

export interface LoadingProps {
  className?: string;
  text?: string;
  fullScreen?: boolean;
}

/**
 * Loading indicator with optional text
 */
export function Loading({ className, text, fullScreen }: LoadingProps) {
  const content = (
    <div className={cn('flex flex-col items-center justify-center gap-3', className)}>
      <Spinner size="lg" />
      {text && <p className="text-muted-foreground text-sm">{text}</p>}
    </div>
  );

  if (fullScreen) {
    return (
      <div className="bg-background/80 fixed inset-0 z-50 flex items-center justify-center backdrop-blur-sm">
        {content}
      </div>
    );
  }

  return content;
}

/**
 * Page-level loading state
 */
export function PageLoading() {
  return (
    <div className="flex min-h-[calc(100vh-3.5rem)] items-center justify-center">
      <Loading text="Loading..." />
    </div>
  );
}

/**
 * Inline loading for buttons/small areas
 */
export function InlineLoading({ className }: { className?: string }) {
  return (
    <span className={cn('inline-flex items-center gap-2', className)}>
      <Spinner size="sm" />
      <span className="text-muted-foreground text-sm">Loading...</span>
    </span>
  );
}
