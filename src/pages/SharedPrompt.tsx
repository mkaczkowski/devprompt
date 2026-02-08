import { Trans, useLingui } from '@lingui/react/macro';
import { ArrowLeft, Braces, Code, Download, Eye, FileText, Layers, Link2Off, User } from 'lucide-react';
import { lazy, Suspense, useCallback, useMemo, useState } from 'react';
import { useNavigate, useParams } from 'react-router';

import { CopyPromptButton } from '@/components/editor';
import { MarkdownSkeleton, SEO, SyntaxHighlightedTextarea } from '@/components/shared';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { PageLoading } from '@/components/ui/loading';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip';
import { useMobileContext } from '@/contexts/mobileContext';
import { useDocumentTitle, useTouchSizes } from '@/hooks';
import { useSharedPrompt } from '@/hooks/supabase/useSharePrompt';
import { calculateSectionsTokenCount } from '@/lib/estimateTokens';
import { formatCompactNumber } from '@/lib/format';
import { formatSectionsForCopy } from '@/lib/parsePrompt';
import { savePromptData } from '@/lib/promptStorage';
import { getEditorRoute } from '@/lib/routes';
import { toast } from '@/lib/toast';
import { cn } from '@/lib/utils';
import { useLibraryStore } from '@/stores';
import { usePreferencesStore } from '@/stores/preferencesStore';
import type { PreviewFormat } from '@/types/preferences';

// Lazy load markdown renderer
const MarkdownRenderer = lazy(() =>
  import('@/components/shared/MarkdownRenderer').then((mod) => ({
    default: mod.MarkdownRenderer,
  })),
);

type MobileTab = 'info' | 'preview';

/**
 * Page for viewing a publicly shared prompt.
 * Accessible to anyone with the share link (no authentication required).
 */
export default function SharedPromptPage() {
  const { shareToken } = useParams<{ shareToken: string }>();
  const { t } = useLingui();
  const navigate = useNavigate();
  const { isMobile } = useMobileContext();
  const sizes = useTouchSizes();
  const addPrompt = useLibraryStore((s) => s.addPrompt);

  const [mobileTab, setMobileTab] = useState<MobileTab>('info');
  const [isImporting, setIsImporting] = useState(false);

  const previewFormat = usePreferencesStore((state) => state.previewFormat);
  const setPreviewFormat = usePreferencesStore((state) => state.setPreviewFormat);

  // Fetch shared prompt data
  const { data: sharedPrompt, isLoading, error } = useSharedPrompt(shareToken);

  // Document title
  useDocumentTitle(sharedPrompt?.title ?? t`Shared Prompt`);

  // Format sections for preview (uses current format)
  const formattedPreview = useMemo(() => {
    if (!sharedPrompt?.data?.sections) return '';
    return formatSectionsForCopy(sharedPrompt.data.sections, previewFormat, sharedPrompt.data.instructions);
  }, [sharedPrompt, previewFormat]);

  // Get author initials for avatar fallback
  const authorInitials = sharedPrompt?.author?.name
    ? sharedPrompt.author.name
        .split(' ')
        .map((n) => n[0])
        .join('')
        .toUpperCase()
        .slice(0, 2)
    : '?';

  // Import prompt to local library
  const handleImport = useCallback(async () => {
    if (!sharedPrompt || isImporting) return;

    setIsImporting(true);
    try {
      // Add to library store
      const newId = addPrompt({
        title: sharedPrompt.title,
        description: sharedPrompt.description,
        sectionCount: sharedPrompt.sectionCount,
        tokenCount: sharedPrompt.tokenCount,
      });

      // Save prompt data to localStorage
      savePromptData(newId, sharedPrompt.data);

      toast.success(t`Prompt imported to your library`);
      navigate(getEditorRoute(newId));
    } catch {
      toast.error(t`Failed to import prompt`);
      setIsImporting(false);
    }
  }, [sharedPrompt, isImporting, addPrompt, navigate, t]);

  // Handle mobile tab change
  const handleMobileTabChange = useCallback((value: string) => {
    if (value === 'info' || value === 'preview') {
      setMobileTab(value);
    }
  }, []);

  // Handle format toggle change
  const handleFormatChange = useCallback(
    (value: string) => {
      if (value === 'preview' || value === 'markdown' || value === 'xml') {
        setPreviewFormat(value as PreviewFormat);
      }
    },
    [setPreviewFormat],
  );

  // Loading state
  if (isLoading) {
    return (
      <div className="bg-background flex h-[calc(100vh-3.5rem)] flex-col overflow-hidden">
        <SEO title={t`Shared Prompt`} description={t`Loading shared prompt`} />
        <PageLoading />
      </div>
    );
  }

  // Error or not found state
  if (error || !sharedPrompt) {
    return (
      <div className="bg-background flex h-[calc(100vh-3.5rem)] flex-col items-center justify-center overflow-hidden px-4 text-center">
        <SEO
          title={t`Prompt Not Found`}
          description={t`This shared prompt doesn't exist or has been removed`}
          noIndex
        />
        <div
          className={cn(
            'flex h-12 w-12 items-center justify-center rounded-full',
            'bg-muted/40',
            'border-border/30 border',
          )}
        >
          <Link2Off className="text-muted-foreground/50 size-5" />
        </div>
        <p className="text-foreground mt-4 text-sm font-medium">{t`Prompt not found`}</p>
        <p className="text-muted-foreground/70 mt-1.5 max-w-[240px] text-xs leading-relaxed md:text-sm">
          <Trans>This shared prompt doesn&apos;t exist or has been removed by the author.</Trans>
        </p>
        <Button variant="outline" size={sizes.buttonSm} onClick={() => navigate('/')} className="mt-5 gap-1.5">
          <ArrowLeft className="size-4" />
          <Trans>Go to Library</Trans>
        </Button>
      </div>
    );
  }

  const sectionCount = sharedPrompt.sectionCount ?? sharedPrompt.data?.sections?.length ?? 0;
  const tokenCount = sharedPrompt.tokenCount ?? calculateSectionsTokenCount(sharedPrompt.data?.sections ?? []);

  // Info panel content
  const infoContent = (
    <div className="space-y-6 p-4 sm:p-6">
      {/* Author attribution */}
      <Card className="bg-primary/5 border-primary/20">
        <CardContent className="flex items-center gap-4 px-4 py-1.5">
          <Avatar size="lg">
            {sharedPrompt.author.avatarUrl && <AvatarImage src={sharedPrompt.author.avatarUrl} />}
            <AvatarFallback>{authorInitials}</AvatarFallback>
          </Avatar>
          <div className="min-w-0 flex-1">
            <p className="text-muted-foreground text-xs">
              <Trans>Shared by</Trans>
            </p>
            <p className="truncate font-medium">{sharedPrompt.author.name}</p>
          </div>
        </CardContent>
      </Card>

      {/* Title and description */}
      <div>
        <h1 className="text-xl font-semibold">{sharedPrompt.title}</h1>
        {sharedPrompt.description && <p className="text-muted-foreground mt-2">{sharedPrompt.description}</p>}
      </div>

      {/* Metadata */}
      <div className="text-muted-foreground flex flex-wrap items-center gap-3 text-sm">
        <span className="inline-flex items-center gap-1">
          <Layers className="size-4" />
          {sectionCount} {sectionCount === 1 ? t`section` : t`sections`}
        </span>
        <span className="text-muted-foreground/50">·</span>
        <span className="inline-flex items-center gap-1">
          <Braces className="size-4" />
          {formatCompactNumber(tokenCount)} {t`tokens`}
        </span>
      </div>

      {/* Import button */}
      <Button
        variant="outline"
        size={sizes.button}
        onClick={handleImport}
        disabled={isImporting}
        className="w-full sm:w-auto"
        aria-label={t`Import to library`}
      >
        <Download className="mr-2 size-4" />
        {isImporting ? t`Importing...` : t`Import to Library`}
      </Button>
    </div>
  );

  // Format toolbar (shared between mobile and desktop)
  const formatToolbar = (
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

      <CopyPromptButton
        iconOnly={isMobile}
        sections={sharedPrompt.data?.sections}
        instructions={sharedPrompt.data?.instructions}
      />
    </div>
  );

  // Preview panel content
  const previewContent = (
    <div className="flex h-full flex-col">
      {formatToolbar}
      <div className="dark:bg-input/30 flex-1 overflow-y-auto bg-transparent">
        {previewFormat === 'preview' ? (
          <Suspense
            fallback={
              <div className="p-4">
                <MarkdownSkeleton />
              </div>
            }
          >
            <div className="p-4">
              <MarkdownRenderer content={formattedPreview} className="text-sm" />
            </div>
          </Suspense>
        ) : (
          <div className="h-full p-1.5">
            <SyntaxHighlightedTextarea
              value={formattedPreview}
              language={previewFormat === 'xml' ? 'xml' : 'markdown'}
              readOnly
              placeholder={t`No content to display`}
              className="h-full min-h-full resize-none rounded-none border-0 bg-transparent focus-visible:ring-0 dark:bg-transparent"
            />
          </div>
        )}
      </div>
    </div>
  );

  return (
    <div className="bg-background flex h-[calc(100vh-3.5rem)] flex-col overflow-hidden">
      <SEO
        title={sharedPrompt.title}
        description={sharedPrompt.description || t`View a shared AI prompt on DevPrompt`}
      />

      {/* Mobile view with tabs */}
      {isMobile ? (
        <>
          <div className="from-muted/60 dark:from-glass-subtle bg-gradient-to-b to-transparent px-4 py-3">
            <Tabs value={mobileTab} onValueChange={handleMobileTabChange}>
              <TabsList size={sizes.tabs} className="w-full">
                <TabsTrigger value="info" className="flex-1">
                  <User className="mr-2 size-4" />
                  {t`Info`}
                </TabsTrigger>
                <TabsTrigger value="preview" className="flex-1">
                  {t`Preview`}
                </TabsTrigger>
              </TabsList>
              <TabsContent value="info" className="hidden" />
              <TabsContent value="preview" className="hidden" />
            </Tabs>
          </div>
          <div className="flex-1 overflow-y-auto">{mobileTab === 'info' ? infoContent : previewContent}</div>
        </>
      ) : (
        /* Desktop view with side-by-side layout */
        <div className="flex flex-1 overflow-hidden">
          <div className={cn('w-full max-w-md flex-shrink-0 overflow-y-auto border-r', 'border-border')}>
            {infoContent}
          </div>
          <div className="flex-1 overflow-hidden">{previewContent}</div>
        </div>
      )}
    </div>
  );
}
