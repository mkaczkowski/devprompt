import type { ReactNode } from 'react';

export interface VisuallyHiddenProps {
  children: ReactNode;
  as?: 'span' | 'div';
}

/**
 * Visually hidden content for screen readers.
 * Content is hidden visually but remains accessible to assistive technologies.
 */
export function VisuallyHidden({ children, as: Component = 'span' }: VisuallyHiddenProps) {
  return (
    <Component
      style={{
        position: 'absolute',
        width: '1px',
        height: '1px',
        padding: 0,
        margin: '-1px',
        overflow: 'hidden',
        clip: 'rect(0, 0, 0, 0)',
        whiteSpace: 'nowrap',
        border: 0,
      }}
    >
      {children}
    </Component>
  );
}

/**
 * Skip link for keyboard navigation.
 * Becomes visible on focus.
 */
export function SkipLink({
  href = '#main',
  children = 'Skip to main content',
}: {
  href?: string;
  children?: ReactNode;
}) {
  return (
    <a
      href={href}
      className="bg-background text-foreground ring-ring fixed top-4 left-4 z-50 -translate-y-16 rounded-md px-4 py-2 font-medium transition-transform focus:translate-y-0 focus:ring-1"
    >
      {children}
    </a>
  );
}
