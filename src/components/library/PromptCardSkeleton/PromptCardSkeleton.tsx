import { cn } from '@/lib/utils';

interface PromptCardSkeletonProps {
  variant?: 'tile' | 'list';
}

export function PromptCardSkeleton({ variant = 'tile' }: PromptCardSkeletonProps) {
  if (variant === 'list') {
    return (
      <div className={cn('border-border flex items-center gap-3 rounded-xl border px-4 py-3', 'bg-card animate-pulse')}>
        <div className="bg-muted h-4 w-40 rounded-md" />
        <div className="ml-auto flex gap-2">
          <div className="bg-muted/70 h-3 w-24 rounded-md" />
        </div>
      </div>
    );
  }

  return (
    <div
      className={cn(
        'border-border flex flex-col gap-2.5 rounded-2xl border p-4',
        'bg-card shadow-glass-shadow animate-pulse shadow-sm',
      )}
    >
      <div className="bg-muted h-4 w-3/4 rounded-md" />
      <div className="bg-muted h-4 w-1/2 rounded-md" />
      <div className="bg-muted/70 mt-0.5 h-3 w-2/3 rounded-md" />
    </div>
  );
}
