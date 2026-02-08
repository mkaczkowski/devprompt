import * as React from 'react';

import { cn } from '@/lib/utils';

/**
 * Kbd component for displaying keyboard keys.
 * Use inside tooltips to show keyboard shortcuts.
 */
const Kbd = React.forwardRef<HTMLElement, React.ComponentProps<'kbd'>>(({ className, ...props }, ref) => {
  return (
    <kbd
      ref={ref}
      className={cn(
        'bg-muted text-muted-foreground pointer-events-none inline-flex h-5 items-center justify-center gap-1 rounded border px-1.5 font-mono text-[10px] font-medium',
        className,
      )}
      {...props}
    />
  );
});
Kbd.displayName = 'Kbd';

/**
 * KbdGroup component for grouping multiple Kbd components.
 * Displays keys with visual separator.
 */
const KbdGroup = React.forwardRef<HTMLSpanElement, React.ComponentProps<'span'>>(({ className, ...props }, ref) => {
  return <span ref={ref} className={cn('inline-flex items-center gap-0.5', className)} {...props} />;
});
KbdGroup.displayName = 'KbdGroup';

export { Kbd, KbdGroup };
