import { useLingui } from '@lingui/react/macro';
import { startTransition, useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { useNavigate, useParams } from 'react-router';

import { PromptPreview, SectionList } from '@/components/editor';
import { SEO } from '@/components/shared';
import { ResizableHandle, ResizablePanel, ResizablePanelGroup } from '@/components/ui/resizable';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useHeaderContext, useMobileContext } from '@/contexts';
import { useDocumentTitle, useEditorState, useKeyboardShortcuts, useTouchSizes } from '@/hooks';
import { copyToClipboard } from '@/lib/clipboard';
import { scheduleMarkdownPrefetch } from '@/lib/markdown';
import { formatSectionsForCopy } from '@/lib/parsePrompt';
import { createAndSavePrompt } from '@/lib/promptCreation';
import { getEffectiveTitle } from '@/lib/promptStorage';
import { getEditorRoute } from '@/lib/routes';
import { STORAGE_KEYS } from '@/lib/storageKeys';
import { toast } from '@/lib/toast';

type MobileTab = 'edit' | 'view';

interface PanelLayout {
  code: number;
  preview: number;
}

export default function EditorPage() {
  const { id: promptId } = useParams<{ id: string }>();
  const { t } = useLingui();
  const navigate = useNavigate();
  const sizes = useTouchSizes();
  const { isMobile } = useMobileContext();
  const { setHeaderState, resetHeaderState } = useHeaderContext();

  const loadedPromptIdRef = useRef<string | undefined>(undefined);
  const [mobileTab, setMobileTab] = useState<MobileTab>('edit');

  // Aggregated editor state from stores
  const { loadPrompt, promptTitle, sections, setPromptTitle, updatePrompt, viewModes, previewFormat, addPrompt } =
    useEditorState();

  // Prefetch markdown chunk
  useEffect(() => {
    scheduleMarkdownPrefetch();
  }, []);

  // Load prompt when URL changes
  useEffect(() => {
    if (promptId !== loadedPromptIdRef.current) {
      loadedPromptIdRef.current = promptId;
      loadPrompt(promptId);
      startTransition(() => {
        setMobileTab('edit');
      });
    }
  }, [promptId, loadPrompt]);

  // Compute effective title
  const effectiveTitle = useMemo(() => {
    return getEffectiveTitle({ title: promptTitle, sections });
  }, [promptTitle, sections]);

  // Document title
  useDocumentTitle(effectiveTitle || t`Editor`);

  // Panel layout
  const userWantsCode = viewModes.length === 0 || viewModes.includes('code');
  const userWantsPreview = viewModes.length === 0 || viewModes.includes('preview');
  const showCode = isMobile ? mobileTab === 'edit' : userWantsCode;
  const showPreview = isMobile ? mobileTab === 'view' : userWantsPreview;
  const showBothPanels = !isMobile && showCode && showPreview;

  // Panel layout persistence
  const panelLayout = useMemo((): PanelLayout | undefined => {
    if (showBothPanels) {
      try {
        const savedLayout = localStorage.getItem(STORAGE_KEYS.panelLayout);
        if (savedLayout) {
          const parsed = JSON.parse(savedLayout) as PanelLayout;
          if (parsed && typeof parsed.code === 'number' && typeof parsed.preview === 'number') {
            return parsed;
          }
        }
      } catch (error) {
        console.warn('Failed to parse saved panel layout:', error);
      }
      return { code: 50, preview: 50 };
    }
    return undefined;
  }, [showBothPanels]);

  const handleLayoutChange = useCallback(
    (layout: Record<string, number>) => {
      if (showBothPanels) {
        const codeSize = layout['code-panel'] ?? 50;
        const previewSize = layout['preview-panel'] ?? 50;
        const panelLayout: PanelLayout = { code: codeSize, preview: previewSize };
        localStorage.setItem(STORAGE_KEYS.panelLayout, JSON.stringify(panelLayout));
      }
    },
    [showBothPanels],
  );

  const handleTitleConfirm = useCallback(
    (newTitle: string) => {
      const title = newTitle || undefined;
      setPromptTitle(title);
      if (promptId) {
        const effectiveTitle = getEffectiveTitle({ title, sections });
        updatePrompt(promptId, { title: effectiveTitle });
      }
    },
    [setPromptTitle, updatePrompt, promptId, sections],
  );

  // Set up header breadcrumb
  useEffect(() => {
    setHeaderState({
      isEditorView: true,
      promptTitle: effectiveTitle,
      onTitleChange: handleTitleConfirm,
    });

    return () => {
      resetHeaderState();
    };
  }, [effectiveTitle, handleTitleConfirm, setHeaderState, resetHeaderState]);

  const handleMobileTabChange = useCallback((value: string) => {
    setMobileTab(value as MobileTab);
  }, []);

  // Keyboard shortcut: Copy prompt to clipboard
  const handleCopy = useCallback(async () => {
    const hasEnabledSections = sections.some((s) => s.enabled && s.content.trim().length > 0);
    if (sections.length === 0 || !hasEnabledSections) return;

    const formattedText = formatSectionsForCopy(sections, previewFormat);
    if (!formattedText) return;

    const success = await copyToClipboard(formattedText);
    if (success) {
      toast.success(t`Copied to clipboard`);
    } else {
      toast.error(t`Failed to copy to clipboard`, {
        description: t`Try selecting the text manually and using Ctrl+C / Cmd+C`,
      });
    }
  }, [sections, previewFormat, t]);

  // Keyboard shortcut: Create new prompt instantly
  const handleNewPrompt = useCallback(() => {
    const newId = createAndSavePrompt(addPrompt);
    navigate(getEditorRoute(newId));
  }, [addPrompt, navigate]);

  // Register keyboard shortcuts (desktop only)
  useKeyboardShortcuts({
    onCopy: handleCopy,
    onNewPrompt: handleNewPrompt,
    enabled: !isMobile,
  });

  return (
    <div className="bg-background flex h-[calc(100vh-3.5rem)] flex-col overflow-hidden">
      <SEO title={effectiveTitle || t`Editor`} description={t`Create and edit structured AI prompts with sections`} />

      {/* Mobile Tabs */}
      {isMobile && (
        <div className="from-muted/60 dark:from-glass-subtle bg-gradient-to-b to-transparent px-4 py-3">
          <Tabs value={mobileTab} onValueChange={handleMobileTabChange}>
            <TabsList size={sizes.tabs} className="w-full">
              <TabsTrigger value="edit" className="flex-1">
                {t`Edit`}
              </TabsTrigger>
              <TabsTrigger value="view" className="flex-1">
                {t`Preview`}
              </TabsTrigger>
            </TabsList>
            {/* Hidden TabsContent for ARIA compliance */}
            <TabsContent value="edit" className="hidden" />
            <TabsContent value="view" className="hidden" />
          </Tabs>
        </div>
      )}

      {/* Main Content */}
      <div className="flex-1 overflow-hidden">
        {showBothPanels ? (
          <ResizablePanelGroup
            orientation="horizontal"
            onLayoutChange={handleLayoutChange}
            key={`panel-${showBothPanels}`}
          >
            <ResizablePanel id="code-panel" defaultSize={panelLayout?.code ?? 50} minSize={20} data-testid="code-panel">
              <SectionList isMobile={false} />
            </ResizablePanel>
            <ResizableHandle withHandle />
            <ResizablePanel
              id="preview-panel"
              defaultSize={panelLayout?.preview ?? 50}
              minSize={20}
              data-testid="preview-panel"
            >
              <PromptPreview sections={sections} />
            </ResizablePanel>
          </ResizablePanelGroup>
        ) : (
          <>
            {showCode && <SectionList isMobile={isMobile} />}
            {showPreview && <PromptPreview sections={sections} />}
          </>
        )}
      </div>
    </div>
  );
}
