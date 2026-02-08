/**
 * PromptSync component.
 *
 * Invisible component that orchestrates prompt syncing with Supabase.
 * Must be rendered inside SignedIn and SupabaseProvider context.
 */

import { useLingui } from '@lingui/react/macro';
import { useEffect, useRef } from 'react';

import { usePromptSync } from '@/hooks/supabase';
import { toast } from '@/lib/toast';

export function PromptSync() {
  const { t } = useLingui();
  const { error } = usePromptSync();
  const hasShownError = useRef(false);

  useEffect(() => {
    if (error && !hasShownError.current) {
      hasShownError.current = true;
      toast.error(t`Cloud sync failed`, {
        description: error.message,
      });
    }
    if (!error) {
      hasShownError.current = false;
    }
  }, [error, t]);

  return null;
}
