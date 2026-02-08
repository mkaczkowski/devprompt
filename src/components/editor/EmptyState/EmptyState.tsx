import type { LucideIcon } from 'lucide-react';
import { Plus } from 'lucide-react';

import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

export interface EmptyStateProps {
  /** Icon component to display */
  icon?: LucideIcon;
  /** Primary title text */
  title?: string;
  /** Secondary description text */
  description?: string;
  /** Action button label */
  actionLabel?: string;
  /** Called when the action button is clicked */
  onAction?: () => void;
  /** Additional CSS classes */
  className?: string;
}

/**
 * Reusable empty state with glass morphism styling.
 * Supports optional title, description, and action button.
 */
export function EmptyState({ icon: Icon, title, description, actionLabel, onAction, className }: EmptyStateProps) {
  return (
    <div
      className={cn(
        'flex h-full w-full flex-1 flex-col items-center justify-center text-center',
        'glass-subtle',
        'rounded-xl',
        className,
      )}
    >
      {Icon && (
        <div
          className={cn(
            'flex h-12 w-12 items-center justify-center rounded-full',
            'bg-muted/40',
            'border-border/30 border',
          )}
        >
          <Icon className="text-muted-foreground/50 size-5" />
        </div>
      )}
      {title && <p className="text-foreground mt-4 text-sm font-medium">{title}</p>}
      {description && (
        <p className="text-muted-foreground/70 mt-1.5 max-w-[200px] text-sm leading-relaxed">{description}</p>
      )}
      {onAction && actionLabel && (
        <Button variant="outline" size="sm" onClick={onAction} className="mt-4 gap-1.5">
          <Plus className="size-4" />
          {actionLabel}
        </Button>
      )}
    </div>
  );
}
