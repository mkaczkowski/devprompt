import { useLingui } from '@lingui/react/macro';
import { Code, Eye, FileText } from 'lucide-react';
import { lazy, Suspense, useCallback, useMemo, useRef, useState } from 'react';
import { useParams } from 'react-router';

import { CopyPromptButton, EmptyState, SharePromptButton } from '@/components/editor';
import { MarkdownSkeleton, SyntaxHighlightedTextarea } from '@/components/shared';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip';
import { useMobileContext } from '@/contexts/mobileContext';
import { useProfile, useSyncedState } from '@/hooks';
import { useUserPrompts } from '@/hooks/supabase';
import { getShareInfoFromCloudPrompt } from '@/hooks/supabase/useSharePrompt';
import { formatSectionsForCopy, parseRawTextToPromptData } from '@/lib/parsePrompt';
import { hasEnabledContent } from '@/lib/sectionUtils';
import { usePreferencesStore } from '@/stores/preferencesStore';
import { usePromptStore } from '@/stores/promptStore';
import type { Section } from '@/types';
import type { PreviewFormat } from '@/types/preferences';

/** Preview formats that support syntax highlighting */
type HighlightableFormat = Exclude<PreviewFormat, 'preview'>;

/** Maps preview format to syntax highlighting language */
const FORMAT_TO_LANGUAGE: Record<HighlightableFormat, 'xml' | 'markdown'> = {
  xml: 'xml',
  markdown: 'markdown',
};

/** Type guard to check if format supports syntax highlighting */
function isHighlightableFormat(format: PreviewFormat): format is HighlightableFormat {
  return format !== 'preview';
}

// Lazy load markdown renderer
const MarkdownRenderer = lazy(() =>
  import('@/components/shared/MarkdownRenderer').then((mod) => ({
    default: mod.MarkdownRenderer,
  })),
);

interface PromptPreviewProps {
  /** Sections to display */
  sections: Section[];
  /** Whether editing in markdown/xml mode updates the store */
  editable?: boolean;
  /** Whether copy button can be used */
  canCopy?: boolean;
}

/**
 * Preview panel showing formatted prompt output with format tabs.
 */
export function PromptPreview({ sections, editable = true, canCopy = true }: PromptPreviewProps) {
  const { t } = useLingui();
  const { isMobile } = useMobileContext();
  const { id: promptId } = useParams<{ id: string }>();

  // Profile state for share capability
  const { profile } = useProfile();
  const canShare = profile?.sync_enabled ?? false;

  // Cloud prompts for share state
  const { data: cloudPrompts } = useUserPrompts();

  // Get share info for current prompt
  const shareInfo = useMemo(() => {
    if (!promptId || !cloudPrompts) return null;
    const cloudPrompt = cloudPrompts.find((cp) => cp.id === promptId);
    return getShareInfoFromCloudPrompt(cloudPrompt);
  }, [promptId, cloudPrompts]);

  // Derive share token from cloud data
  const currentShareToken = shareInfo?.shareToken;

  const previewFormat = usePreferencesStore((state) => state.previewFormat);
  const setPreviewFormat = usePreferencesStore((state) => state.setPreviewFormat);
  const setSections = usePromptStore((state) => state.setSections);
  const setPromptTitle = usePromptStore((state) => state.setPromptTitle);
  const instructions = usePromptStore((state) => state.instructions);

  // Format the sections based on current format (including instructions)
  const formattedText = useMemo(
    () => formatSectionsForCopy(sections, previewFormat, instructions),
    [sections, previewFormat, instructions],
  );

  // Local state for textarea editing
  const [localText, setLocalText] = useSyncedState(formattedText, false);
  const [isDirty, setIsDirty] = useState(false);
  const [textOnFocus, setTextOnFocus] = useState(formattedText);
  const isEscapingRef = useRef(false);

  const hasContent = hasEnabledContent(sections) || Boolean(instructions?.trim());

  const handleFormatChange = useCallback(
    (value: string) => {
      // Tabs component returns string, validate it's a valid PreviewFormat
      if (value === 'preview' || value === 'markdown' || value === 'xml') {
        setPreviewFormat(value);
      }
    },
    [setPreviewFormat],
  );

  const handleTextChange = useCallback(
    (e: React.ChangeEvent<HTMLTextAreaElement>) => {
      setLocalText(e.target.value);
      setIsDirty(true);
    },
    [setLocalText],
  );

  const handleFocus = useCallback(() => {
    setTextOnFocus(localText);
  }, [localText]);

  const handleBlur = useCallback(() => {
    if (isEscapingRef.current) {
      isEscapingRef.current = false;
      return;
    }

    if (isDirty && editable) {
      // Parse the edited text back to sections
      const data = parseRawTextToPromptData(localText);
      setPromptTitle(data.title);
      setSections(data.sections);
      setIsDirty(false);
    }
  }, [isDirty, localText, editable, setPromptTitle, setSections]);

  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
      if (e.key === 'Escape') {
        isEscapingRef.current = true;
        setLocalText(textOnFocus);
        setIsDirty(false);
        e.currentTarget.blur();
      }
    },
    [textOnFocus, setLocalText],
  );

  return (
    <div className="flex h-full flex-col">
      {/* Toolbar */}
      <div className="from-muted/60 dark:from-glass-subtle flex items-center justify-between bg-gradient-to-b to-transparent px-4 py-[14px] sm:px-6 sm:py-[18px]">
        <Tabs value={previewFormat} onValueChange={handleFormatChange}>
          <TabsList variant="minimal" size="none">
            <TabsTrigger value="preview" aria-label={t`Rendered preview`}>
              <Tooltip>
                <TooltipTrigger asChild>
                  <span className="flex items-center justify-center">
                    <Eye className="size-4" />
                  </span>
                </TooltipTrigger>
                <TooltipContent>{t`Rendered preview`}</TooltipContent>
              </Tooltip>
            </TabsTrigger>

            <TabsTrigger value="markdown" aria-label={t`Markdown`}>
              <Tooltip>
                <TooltipTrigger asChild>
                  <span className="flex items-center justify-center">
                    <FileText className="size-4" />
                  </span>
                </TooltipTrigger>
                <TooltipContent>{t`Markdown`}</TooltipContent>
              </Tooltip>
            </TabsTrigger>

            <TabsTrigger value="xml" aria-label={t`XML`}>
              <Tooltip>
                <TooltipTrigger asChild>
                  <span className="flex items-center justify-center">
                    <Code className="size-4" />
                  </span>
                </TooltipTrigger>
                <TooltipContent>{t`XML`}</TooltipContent>
              </Tooltip>
            </TabsTrigger>
          </TabsList>

          {/* Hidden TabsContent for ARIA compliance */}
          <TabsContent value="preview" className="hidden" />
          <TabsContent value="markdown" className="hidden" />
          <TabsContent value="xml" className="hidden" />
        </Tabs>

        <div className="flex items-center gap-2">
          {promptId && canShare && (
            <SharePromptButton
              promptId={promptId}
              isShared={!!currentShareToken}
              shareToken={currentShareToken}
              canShare={canShare}
              iconOnly={!isMobile}
            />
          )}
          {canCopy && <CopyPromptButton iconOnly={isMobile} />}
        </div>
      </div>

      {/* Content */}
      <div className="bg-muted dark:bg-card/80 flex-1 overflow-y-auto">
        {!hasContent ? (
          <EmptyState description={t`Add instructions to see the preview`} />
        ) : previewFormat === 'preview' ? (
          <Suspense
            fallback={
              <div className="p-4">
                <MarkdownSkeleton />
              </div>
            }
          >
            <div className="p-4">
              <MarkdownRenderer content={formattedText} className="text-sm" />
            </div>
          </Suspense>
        ) : isHighlightableFormat(previewFormat) ? (
          <div className="h-full p-1.5">
            <SyntaxHighlightedTextarea
              value={localText}
              language={FORMAT_TO_LANGUAGE[previewFormat]}
              onChange={handleTextChange}
              onFocus={handleFocus}
              onBlur={handleBlur}
              onKeyDown={handleKeyDown}
              placeholder={t`No content to display`}
              className="h-full min-h-full resize-none rounded-none border-0 bg-transparent focus-visible:ring-0 dark:bg-transparent"
            />
          </div>
        ) : null}
      </div>
    </div>
  );
}
