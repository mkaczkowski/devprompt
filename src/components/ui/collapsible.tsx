import { ChevronDownIcon } from 'lucide-react';
import { Collapsible as CollapsiblePrimitive } from 'radix-ui';
import * as React from 'react';

import { cn } from '@/lib/utils';

function Collapsible({ className, ...props }: React.ComponentProps<typeof CollapsiblePrimitive.Root>) {
  return (
    <CollapsiblePrimitive.Root data-slot="collapsible" className={cn('group/collapsible', className)} {...props} />
  );
}

function CollapsibleTrigger({
  className,
  ...props
}: React.ComponentProps<typeof CollapsiblePrimitive.CollapsibleTrigger>) {
  return (
    <CollapsiblePrimitive.CollapsibleTrigger data-slot="collapsible-trigger" className={cn(className)} {...props} />
  );
}

function CollapsibleContent({
  className,
  ...props
}: React.ComponentProps<typeof CollapsiblePrimitive.CollapsibleContent>) {
  return (
    <CollapsiblePrimitive.CollapsibleContent
      data-slot="collapsible-content"
      className={cn(
        'data-[state=closed]:animate-collapsible-up data-[state=open]:animate-collapsible-down overflow-hidden',
        className,
      )}
      {...props}
    />
  );
}

/**
 * Animated chevron that rotates 180 degrees when collapsible is open.
 * Uses group/collapsible data-state for animation.
 */
function CollapsibleChevron({ className, ...props }: React.ComponentProps<typeof ChevronDownIcon>) {
  return (
    <ChevronDownIcon
      data-slot="collapsible-chevron"
      className={cn(
        'size-4 shrink-0 transition-transform duration-200 group-data-[state=open]/collapsible:rotate-180',
        className,
      )}
      {...props}
    />
  );
}

export { Collapsible, CollapsibleTrigger, CollapsibleContent, CollapsibleChevron };
