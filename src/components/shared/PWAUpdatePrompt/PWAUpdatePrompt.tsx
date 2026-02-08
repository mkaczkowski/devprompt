import { useEffect } from 'react';
import { useRegisterSW } from 'virtual:pwa-register/react';

import { toast } from '@/lib/toast';

const UPDATE_CHECK_INTERVAL = 60 * 60 * 1000; // 1 hour

/** Registers the service worker and shows toast notifications for PWA updates. Renders nothing. */
export function PWAUpdatePrompt() {
  const {
    needRefresh: [needRefresh],
    offlineReady: [offlineReady],
    updateServiceWorker,
  } = useRegisterSW({
    onRegisteredSW(_swUrl, registration) {
      if (!registration) return;
      setInterval(() => {
        registration.update();
      }, UPDATE_CHECK_INTERVAL);
    },
  });

  useEffect(() => {
    if (offlineReady) {
      toast.success('App ready to work offline');
    }
  }, [offlineReady]);

  useEffect(() => {
    if (needRefresh) {
      toast('New version available', {
        duration: Infinity,
        action: {
          label: 'Reload',
          onClick: () => updateServiceWorker(true),
        },
      });
    }
  }, [needRefresh, updateServiceWorker]);

  return null;
}
