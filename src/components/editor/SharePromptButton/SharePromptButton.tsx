import { Trans, useLingui } from '@lingui/react/macro';
import { Link2, Link2Off, Loader2 } from 'lucide-react';
import { useCallback } from 'react';

import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip';
import { useMobileContext } from '@/contexts/mobileContext';
import { useShareAction, useTouchSizes } from '@/hooks';

interface SharePromptButtonProps {
  /** Prompt ID to share/unshare */
  promptId: string;
  /** Whether the prompt is currently shared */
  isShared: boolean;
  /** Existing share token (if shared) */
  shareToken?: string;
  /** Whether sharing is available (sync enabled) */
  canShare: boolean;
  /** Callback after share state changes */
  onShareChange?: (isShared: boolean, shareToken?: string) => void;
  /** Render as icon-only button (for desktop compact layouts) */
  iconOnly?: boolean;
}

/**
 * Button to share/unshare a prompt with public link.
 * Only available when cloud sync is enabled.
 *
 * When not shared: clicking shares and copies link to clipboard.
 * When shared: shows dropdown with options to Copy link or unshare.
 */
export function SharePromptButton({
  promptId,
  isShared,
  shareToken,
  canShare,
  onShareChange,
  iconOnly = false,
}: SharePromptButtonProps) {
  const { t } = useLingui();
  const { isMobile } = useMobileContext();
  const sizes = useTouchSizes();
  const { share, unshare, copyShareUrl, isLoading } = useShareAction();

  const handleShare = useCallback(async () => {
    if (isLoading) return;

    const token = await share(promptId);
    if (token) {
      onShareChange?.(true, token);
    }
  }, [promptId, share, isLoading, onShareChange]);

  const handleUnshare = useCallback(async () => {
    if (isLoading) return;

    const success = await unshare(promptId);
    if (success) {
      onShareChange?.(false, undefined);
    }
  }, [promptId, unshare, isLoading, onShareChange]);

  const handleCopyLink = useCallback(async () => {
    if (shareToken) {
      await copyShareUrl(shareToken);
    }
  }, [shareToken, copyShareUrl]);

  // Don't render if sharing isn't available
  if (!canShare) {
    return null;
  }

  // On mobile, always show label with icon for better UX
  const showLabel = !iconOnly || isMobile;

  // Loading state
  if (isLoading) {
    return (
      <Button
        variant="ghost"
        size={showLabel ? sizes.button : sizes.iconButton}
        disabled
        aria-label={t`Share loading`}
        aria-busy="true"
        className="text-muted-foreground/60"
      >
        <Loader2 className="size-4 animate-spin" aria-hidden="true" />
        {showLabel && <span className="ml-2">{t`Loading`}</span>}
      </Button>
    );
  }

  // Not shared - simple share button
  if (!isShared) {
    return (
      <Tooltip>
        <TooltipTrigger asChild>
          <Button
            variant="ghost"
            size={showLabel ? sizes.button : sizes.iconButton}
            onClick={handleShare}
            aria-label={t`Share prompt`}
            className="text-muted-foreground/60 hover:text-foreground"
          >
            <Link2 className="size-4" aria-hidden="true" />
            {showLabel && <span className="ml-2">{t`Share`}</span>}
          </Button>
        </TooltipTrigger>
        <TooltipContent>{t`Share prompt`}</TooltipContent>
      </Tooltip>
    );
  }

  // Shared - dropdown with Copy link and unshare options
  return (
    <DropdownMenu>
      <Tooltip>
        <TooltipTrigger asChild>
          <DropdownMenuTrigger asChild>
            <Button
              variant="ghost"
              size={showLabel ? sizes.button : sizes.iconButton}
              aria-label={t`Share options`}
              className="text-foreground"
            >
              <Link2 className="size-4" aria-hidden="true" />
              {showLabel && <span className="ml-2">{t`Shared`}</span>}
            </Button>
          </DropdownMenuTrigger>
        </TooltipTrigger>
        <TooltipContent>{t`Share options`}</TooltipContent>
      </Tooltip>
      <DropdownMenuContent align="end" className="min-w-[148px]">
        <DropdownMenuItem onClick={handleCopyLink}>
          <Link2 className="mr-2 size-4" aria-hidden="true" />
          <Trans>Copy link</Trans>
        </DropdownMenuItem>
        <DropdownMenuItem variant="destructive" onClick={handleUnshare}>
          <Link2Off className="mr-2 size-4" aria-hidden="true" />
          <Trans>Stop sharing</Trans>
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
