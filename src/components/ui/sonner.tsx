import { CircleCheckIcon, InfoIcon, Loader2Icon, OctagonXIcon, TriangleAlertIcon } from 'lucide-react';
import React, { useCallback, useRef } from 'react';
import { toast, Toaster as Sonner, type ToasterProps } from 'sonner';

import { usePreferencesStore } from '@/stores';

const Toaster = ({ ...props }: ToasterProps) => {
  const getResolvedTheme = usePreferencesStore((state) => state.getResolvedTheme);
  const containerRef = useRef<HTMLDivElement>(null);

  const handleClick = useCallback((e: React.MouseEvent<HTMLDivElement>) => {
    const target = e.target as HTMLElement;
    const toastEl = target.closest<HTMLElement>('[data-sonner-toast]');
    if (!toastEl) return;

    // Don't dismiss toasts with action/cancel buttons
    if (toastEl.querySelector('[data-action]') || toastEl.querySelector('[data-cancel]')) return;

    const toastId = toastEl.getAttribute('data-sonner-toast');
    if (toastId) toast.dismiss(toastId);
  }, []);

  return (
    // eslint-disable-next-line jsx-a11y/click-events-have-key-events, jsx-a11y/no-static-element-interactions
    <div ref={containerRef} onClick={handleClick} className="cursor-pointer">
      <Sonner
        theme={getResolvedTheme()}
        className="toaster group"
        duration={2000}
        icons={{
          success: <CircleCheckIcon className="size-4" />,
          info: <InfoIcon className="size-4" />,
          warning: <TriangleAlertIcon className="size-4" />,
          error: <OctagonXIcon className="size-4" />,
          loading: <Loader2Icon className="size-4 animate-spin" />,
        }}
        style={
          {
            '--normal-bg': 'var(--popover)',
            '--normal-text': 'var(--popover-foreground)',
            '--normal-border': 'var(--border)',
            '--border-radius': 'var(--radius)',
          } as React.CSSProperties
        }
        {...props}
      />
    </div>
  );
};

export { Toaster };
