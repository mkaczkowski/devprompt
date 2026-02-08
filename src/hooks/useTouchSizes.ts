import { useMemo } from 'react';

import { useMobileContext } from '@/contexts/mobileContext';

/**
 * Returns responsive size props for WCAG 2.1 AAA touch targets (44px minimum) on mobile.
 */
export function useTouchSizes() {
  const { isMobile } = useMobileContext();

  return useMemo(
    () =>
      ({
        button: isMobile ? 'touch' : 'default',
        buttonSm: isMobile ? 'touch' : 'sm',
        iconButton: isMobile ? 'icon-touch' : 'icon-sm',
        iconButtonLg: isMobile ? 'icon-touch' : 'icon',
        responsiveButton: isMobile ? 'icon-touch' : 'default',
        input: isMobile ? 'touch' : 'default',
        select: isMobile ? 'touch' : 'default',
        tabs: isMobile ? 'touch' : 'default',
        toggle: isMobile ? 'touch' : 'sm',
        textarea: isMobile ? 'touch' : 'default',
      }) as const,
    [isMobile],
  );
}
