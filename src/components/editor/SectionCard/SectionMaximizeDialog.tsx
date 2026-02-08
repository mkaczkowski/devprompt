import { useLingui } from '@lingui/react/macro';
import { Check, Copy, Eye, FileText, X } from 'lucide-react';
import { lazy, Suspense, useCallback, useMemo, useState } from 'react';

import type { ViewModeOption } from '@/components/shared';
import { MarkdownSkeleton, SyntaxHighlightedTextarea, ViewModeToggle } from '@/components/shared';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Drawer, DrawerContent, DrawerDescription, DrawerHeader, DrawerTitle } from '@/components/ui/drawer';
import { Separator } from '@/components/ui/separator';
import { useMobileContext } from '@/contexts/mobileContext';
import { useCopyFeedback, useSyncedState } from '@/hooks';
import { copyToClipboard } from '@/lib/clipboard';
import { toast } from '@/lib/toast';
import type { Section } from '@/types';

const MarkdownRenderer = lazy(() =>
  import('@/components/shared/MarkdownRenderer').then((mod) => ({
    default: mod.MarkdownRenderer,
  })),
);

type ViewMode = 'source' | 'rendered';

const TEXTAREA_CLASSES =
  'h-full min-h-full resize-none rounded-md border border-border bg-transparent focus-visible:ring-0';

export interface SectionMaximizeDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  section: Section;
  /** Called when content changes and dialog closes */
  onContentChange?: (content: string) => void;
}

/**
 * Full-screen dialog for editing section content.
 * Supports syntax-highlighted source and rendered markdown views.
 * Content is saved when the dialog closes.
 */
export function SectionMaximizeDialog({ open, onOpenChange, section, onContentChange }: SectionMaximizeDialogProps) {
  const { t } = useLingui();
  const { isMobile } = useMobileContext();
  const { isCopied, triggerCopied } = useCopyFeedback();

  const [viewMode, setViewMode] = useState<ViewMode>('rendered');
  const [localContent, setLocalContent] = useSyncedState(section.content, open);
  const [isDirty, setIsDirty] = useState(false);

  const viewModeOptions = useMemo<ViewModeOption<ViewMode>[]>(
    () => [
      { value: 'rendered', icon: Eye, label: t`Rendered` },
      { value: 'source', icon: FileText, label: t`Source` },
    ],
    [t],
  );

  const hasContent = Boolean(localContent?.trim());
  const title = section.title || t`Untitled Section`;
  const description = t`Section content`;

  const handleClose = useCallback(() => {
    if (isDirty) {
      onContentChange?.(localContent);
    }
    onOpenChange(false);
  }, [isDirty, localContent, onContentChange, onOpenChange]);

  const handleOpenChange = useCallback(
    (newOpen: boolean) => {
      if (newOpen) {
        setIsDirty(false);
      } else {
        handleClose();
        return;
      }
      onOpenChange(newOpen);
    },
    [handleClose, onOpenChange],
  );

  const handleCopy = useCallback(async () => {
    if (!localContent) return;
    const success = await copyToClipboard(localContent);
    if (success) {
      triggerCopied();
    } else {
      toast.error(t`Failed to copy to clipboard`);
    }
  }, [localContent, triggerCopied, t]);

  const handleContentChange = useCallback(
    (e: React.ChangeEvent<HTMLTextAreaElement>) => {
      setLocalContent(e.target.value);
      setIsDirty(true);
    },
    [setLocalContent],
  );

  const renderContent = () => {
    switch (viewMode) {
      case 'source':
        return (
          <SyntaxHighlightedTextarea
            value={localContent}
            onChange={handleContentChange}
            language="markdown"
            placeholder={t`Enter section content...`}
            className={TEXTAREA_CLASSES}
          />
        );
      case 'rendered':
        if (!hasContent) {
          return <p className="text-muted-foreground text-center text-sm">{t`No content`}</p>;
        }
        return (
          <div className="border-border dark:bg-input/30 h-full rounded-md border bg-transparent p-4">
            <Suspense fallback={<MarkdownSkeleton />}>
              <MarkdownRenderer content={localContent} className="text-sm" />
            </Suspense>
          </div>
        );
      default: {
        const _exhaustiveCheck: never = viewMode;
        return _exhaustiveCheck;
      }
    }
  };

  const header = (
    <div className="flex items-center justify-between border-b px-6 py-4">
      <div className="min-w-0 flex-1">
        <h2 className="truncate text-lg font-semibold">{title}</h2>
      </div>

      <div className="ml-4 flex shrink-0 items-center gap-3">
        <ViewModeToggle value={viewMode} onValueChange={setViewMode} options={viewModeOptions} />

        <Separator orientation="vertical" className="h-6" />

        <Button
          variant="ghost"
          size="sm"
          onClick={handleCopy}
          disabled={!hasContent}
          aria-label={isCopied ? t`Copied` : t`Copy content`}
        >
          <span className="grid size-4 place-items-center">
            <Copy
              className={`col-start-1 row-start-1 size-4 transition-opacity duration-150 ${isCopied ? 'opacity-0' : 'opacity-100'}`}
            />
            <Check
              className={`col-start-1 row-start-1 size-4 transition-opacity duration-150 ${isCopied ? 'opacity-100' : 'opacity-0'}`}
            />
          </span>
          <span className="ml-2 grid">
            <span className={`col-start-1 row-start-1 ${isCopied ? 'invisible' : ''}`}>{t`Copy`}</span>
            <span className={`col-start-1 row-start-1 ${isCopied ? '' : 'invisible'}`}>{t`Copied`}</span>
          </span>
        </Button>

        {!isMobile && (
          <>
            <Separator orientation="vertical" className="h-6" />
            <Button variant="ghost" size="icon" onClick={handleClose} aria-label={t`Close`}>
              <X className="size-4" />
            </Button>
          </>
        )}
      </div>
    </div>
  );

  const body = <div className="flex-1 overflow-y-auto p-6">{renderContent()}</div>;

  if (isMobile) {
    return (
      <Drawer open={open} onOpenChange={handleOpenChange}>
        <DrawerContent className="flex h-[95dvh] flex-col">
          <DrawerHeader className="sr-only">
            <DrawerTitle>{title}</DrawerTitle>
            <DrawerDescription>{description}</DrawerDescription>
          </DrawerHeader>
          {header}
          {body}
        </DrawerContent>
      </Drawer>
    );
  }

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent
        showCloseButton={false}
        className="flex h-[90vh] max-h-[90vh] w-[95vw] max-w-6xl flex-col gap-0 p-0 sm:max-w-6xl"
      >
        <DialogHeader className="sr-only">
          <DialogTitle>{title}</DialogTitle>
          <DialogDescription>{description}</DialogDescription>
        </DialogHeader>
        {header}
        {body}
      </DialogContent>
    </Dialog>
  );
}
