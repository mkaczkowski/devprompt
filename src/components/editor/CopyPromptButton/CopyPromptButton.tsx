import { useLingui } from '@lingui/react/macro';
import { Check, Copy } from 'lucide-react';
import { useCallback } from 'react';

import { Button } from '@/components/ui/button';
import { useMobileContext } from '@/contexts/mobileContext';
import { useCopyFeedback, useTouchSizes } from '@/hooks';
import { copyToClipboard } from '@/lib/clipboard';
import { formatSectionsForCopy } from '@/lib/parsePrompt';
import { canCopySections } from '@/lib/sectionUtils';
import { toast } from '@/lib/toast';
import { usePreferencesStore } from '@/stores/preferencesStore';
import { usePromptStore } from '@/stores/promptStore';
import type { Section } from '@/types';

interface CopyPromptButtonProps {
  /** Render as icon-only button (for desktop compact layouts) */
  iconOnly?: boolean;
  /** Override sections (instead of reading from store) */
  sections?: Section[];
  /** Override instructions (instead of reading from store) */
  instructions?: string;
}

/**
 * Button to copy the current prompt to clipboard in the selected format.
 * On mobile, always shows icon + label for better UX.
 *
 * When `sections`/`instructions` props are provided, uses those instead of the prompt store.
 */
export function CopyPromptButton({
  iconOnly = false,
  sections: sectionsProp,
  instructions: instructionsProp,
}: CopyPromptButtonProps) {
  const { t } = useLingui();
  const { isMobile } = useMobileContext();
  const sizes = useTouchSizes();
  const storeSections = usePromptStore((state) => state.sections);
  const storeInstructions = usePromptStore((state) => state.instructions);
  const previewFormat = usePreferencesStore((state) => state.previewFormat);

  const sections = sectionsProp ?? storeSections;
  const instructions = instructionsProp ?? storeInstructions;
  const { isCopied, triggerCopied } = useCopyFeedback();

  const canCopy = canCopySections(sections) || Boolean(instructions?.trim());

  const handleCopy = useCallback(async () => {
    if (!canCopy || isCopied) return;

    const formattedText = formatSectionsForCopy(sections, previewFormat, instructions);
    if (!formattedText) return;

    const success = await copyToClipboard(formattedText);

    if (success) {
      triggerCopied();
      toast.success(t`Copied to clipboard`);
    } else {
      toast.error(t`Failed to copy to clipboard`, {
        description: t`Try selecting the text manually and using Ctrl+C / Cmd+C`,
      });
    }
  }, [sections, previewFormat, instructions, canCopy, isCopied, triggerCopied, t]);

  // On mobile, always show label with icon for better UX
  // iconOnly only applies to desktop compact layouts
  const showLabel = !iconOnly || isMobile;

  return (
    <Button
      variant={isCopied ? 'outline' : 'default'}
      size={showLabel ? sizes.button : sizes.iconButton}
      onClick={handleCopy}
      disabled={!canCopy || isCopied}
      aria-label={isCopied ? t`Copied` : t`Copy prompt`}
    >
      {isCopied ? <Check className="size-4" /> : <Copy className="size-4" />}
      {showLabel && <span className="ml-2">{isCopied ? t`Copied` : t`Copy`}</span>}
    </Button>
  );
}
