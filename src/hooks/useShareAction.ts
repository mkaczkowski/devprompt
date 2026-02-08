/**
 * Hook for handling prompt share/unshare actions with clipboard and toast feedback.
 * Provides a unified interface for share operations across the app.
 */

import { useLingui } from '@lingui/react/macro';
import { useCallback, useMemo } from 'react';

import { useSharePrompt, useUnsharePrompt } from './supabase/useSharePrompt';

import { copyToClipboard } from '@/lib/clipboard';
import { getSharedPromptUrl } from '@/lib/routes';
import { toast } from '@/lib/toast';

interface ShareActionState {
  isSharing: boolean;
  isUnsharing: boolean;
  isLoading: boolean;
}

interface ShareActionHandlers {
  /**
   * Share a prompt and copy the share URL to clipboard.
   * @param promptId - The ID of the prompt to share
   * @returns Promise resolving to the share token if successful
   */
  share: (promptId: string) => Promise<string | null>;

  /**
   * Unshare a prompt (remove public access).
   * @param promptId - The ID of the prompt to unshare
   * @returns Promise resolving to true if successful
   */
  unshare: (promptId: string) => Promise<boolean>;

  /**
   * Copy an existing share URL to clipboard.
   * @param shareToken - The share token to copy URL for
   */
  copyShareUrl: (shareToken: string) => Promise<boolean>;
}

export interface UseShareActionReturn extends ShareActionState, ShareActionHandlers {}

/**
 * Hook for managing prompt sharing actions.
 * Provides share, unshare, and copy URL functionality with toast feedback.
 */
export function useShareAction(): UseShareActionReturn {
  const { t } = useLingui();
  const shareMutation = useSharePrompt();
  const unshareMutation = useUnsharePrompt();

  const isSharing = shareMutation.isPending;
  const isUnsharing = unshareMutation.isPending;
  const isLoading = isSharing || isUnsharing;

  const copyShareUrl = useCallback(
    async (shareToken: string): Promise<boolean> => {
      const url = getSharedPromptUrl(shareToken);
      const success = await copyToClipboard(url);

      if (success) {
        toast.success(t`Link copied to clipboard`);
      } else {
        toast.error(t`Failed to Copy link`);
      }

      return success;
    },
    [t],
  );

  const share = useCallback(
    async (promptId: string): Promise<string | null> => {
      try {
        const result = await shareMutation.mutateAsync(promptId);

        // Copy URL to clipboard
        const url = getSharedPromptUrl(result.shareToken);
        const copySuccess = await copyToClipboard(url);

        if (copySuccess) {
          toast.success(t`Prompt shared! Link copied to clipboard`);
        } else {
          toast.success(t`Prompt shared!`, {
            description: t`Share link: ${url}`,
          });
        }

        return result.shareToken;
      } catch (error) {
        const message = error instanceof Error ? error.message : t`Unknown error`;
        toast.error(t`Failed to share prompt`, {
          description: message,
        });
        return null;
      }
    },
    [shareMutation, t],
  );

  const unshare = useCallback(
    async (promptId: string): Promise<boolean> => {
      try {
        await unshareMutation.mutateAsync(promptId);
        toast.success(t`Prompt is no longer shared`);
        return true;
      } catch (error) {
        const message = error instanceof Error ? error.message : t`Unknown error`;
        toast.error(t`Failed to unshare prompt`, {
          description: message,
        });
        return false;
      }
    },
    [unshareMutation, t],
  );

  return useMemo(
    () => ({
      isSharing,
      isUnsharing,
      isLoading,
      share,
      unshare,
      copyShareUrl,
    }),
    [isSharing, isUnsharing, isLoading, share, unshare, copyShareUrl],
  );
}
