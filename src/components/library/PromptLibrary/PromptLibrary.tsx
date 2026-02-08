import { useAuth, useClerk } from '@clerk/react-router';
import { Trans, useLingui } from '@lingui/react/macro';
import { useCallback, useMemo, useState } from 'react';
import { useNavigate } from 'react-router';
import { useShallow } from 'zustand/react/shallow';

import { LibraryEmptyState, LibraryHeader, PromptCard, PromptGroupHeader } from '@/components/library';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { PullToRefresh } from '@/components/ui/pull-to-refresh';
import { useMobileContext } from '@/contexts/mobileContext';
import { useProfile, useShareAction } from '@/hooks';
import { useUserPrompts } from '@/hooks/supabase';
import { getShareInfoFromCloudPrompt } from '@/hooks/supabase/useSharePrompt';
import { copyToClipboard } from '@/lib/clipboard';
import { formatSectionsForCopy } from '@/lib/parsePrompt';
import { createAndSavePrompt } from '@/lib/promptCreation';
import { loadPromptData } from '@/lib/promptStorage';
import { getEditorRoute } from '@/lib/routes';
import { hasNoSearchResults } from '@/lib/searchUtils';
import { toast } from '@/lib/toast';
import { showUndoToast } from '@/lib/undoToast';
import { useGroupedPrompts, useLibraryStore } from '@/stores';
import type { PromptMetadata } from '@/types';

export function PromptLibrary() {
  const { t } = useLingui();
  const navigate = useNavigate();
  const { isMobile } = useMobileContext();

  // Auth state for share capability
  const { isSignedIn } = useAuth();
  const clerk = useClerk();
  const { profile } = useProfile();

  // Share action handlers
  const { share, unshare, copyShareUrl } = useShareAction();

  // Cloud prompts for share state (only fetch if sync enabled)
  const { data: cloudPrompts } = useUserPrompts();

  // Build map of shared prompts from cloud data
  const sharedPromptsMap = useMemo(() => {
    const map = new Map<string, string>();
    if (cloudPrompts) {
      for (const cp of cloudPrompts) {
        const shareInfo = getShareInfoFromCloudPrompt(cp);
        if (shareInfo) {
          map.set(cp.id, shareInfo.shareToken);
        }
      }
    }
    return map;
  }, [cloudPrompts]);

  // Store state - use useShallow to prevent unnecessary re-renders
  const promptListData = useGroupedPrompts();
  const { allPromptsCount, searchQuery, sortBy, sortDirection } = useLibraryStore(
    useShallow((s) => ({
      allPromptsCount: s.prompts.length,
      searchQuery: s.searchQuery,
      sortBy: s.sortBy,
      sortDirection: s.sortDirection,
    })),
  );

  // Store actions - grouped with useShallow (actions are stable but grouping is cleaner)
  const {
    setSearchQuery,
    setSortBy,
    setSortDirection,
    deletePrompt,
    restorePrompt,
    duplicatePrompt,
    exportPrompt,
    canDelete,
    addPrompt,
    refreshPrompts,
  } = useLibraryStore(
    useShallow((s) => ({
      setSearchQuery: s.setSearchQuery,
      setSortBy: s.setSortBy,
      setSortDirection: s.setSortDirection,
      deletePrompt: s.deletePrompt,
      restorePrompt: s.restorePrompt,
      duplicatePrompt: s.duplicatePrompt,
      exportPrompt: s.exportPrompt,
      canDelete: s.canDelete,
      addPrompt: s.addPrompt,
      refreshPrompts: s.refreshPrompts,
    })),
  );

  // Dialog states
  const [promptToDelete, setPromptToDelete] = useState<PromptMetadata | null>(null);

  // Handlers
  const handlePromptClick = useCallback(
    (promptId: string) => {
      navigate(getEditorRoute(promptId));
    },
    [navigate],
  );

  const handleDuplicate = useCallback(
    (promptId: string) => {
      const newId = duplicatePrompt(promptId);
      if (newId) {
        toast.success(t`Prompt duplicated`, {
          action: {
            label: t`Open`,
            onClick: () => navigate(getEditorRoute(newId)),
          },
        });
      }
    },
    [duplicatePrompt, navigate, t],
  );

  const handleCopyPrompt = useCallback(
    async (prompt: PromptMetadata) => {
      const data = loadPromptData(prompt.id);
      if (!data) {
        toast.error(t`Failed to load prompt data`);
        return;
      }

      const markdown = `# ${data.title || prompt.title}\n\n${formatSectionsForCopy(data.sections, 'markdown')}`;
      const success = await copyToClipboard(markdown);

      if (success) {
        toast.success(t`Prompt copied to clipboard`);
      } else {
        toast.error(t`Failed to copy prompt`);
      }
    },
    [t],
  );

  const handleExport = useCallback(
    (prompt: PromptMetadata) => {
      exportPrompt(prompt.id, prompt.title);
      toast.success(t`Prompt exported`);
    },
    [exportPrompt, t],
  );

  const handleConfirmDelete = useCallback(() => {
    if (promptToDelete) {
      const result = deletePrompt(promptToDelete.id);
      setPromptToDelete(null);

      if (result) {
        showUndoToast(t`Prompt deleted`, () => restorePrompt(result.id, result.data), {
          undoneMessage: t`Prompt restored`,
          undoLabel: t`Undo`,
        });
      }
    }
  }, [promptToDelete, deletePrompt, restorePrompt, t]);

  const handleCreatePrompt = useCallback(() => {
    const newId = createAndSavePrompt(addPrompt);
    navigate(getEditorRoute(newId));
  }, [addPrompt, navigate]);

  const handleRefresh = useCallback(() => {
    refreshPrompts();
    toast.success(t`Library refreshed`);
  }, [refreshPrompts, t]);

  const hasNoPrompts = allPromptsCount === 0;

  // Count total visible prompts for search result detection
  const visibleCount = promptListData.grouped
    ? promptListData.groups.reduce((sum, g) => sum + g.prompts.length, 0)
    : promptListData.prompts.length;
  const noSearchResults = hasNoSearchResults(visibleCount, searchQuery);

  const renderCard = (prompt: PromptMetadata) => {
    const shareToken = sharedPromptsMap.get(prompt.id);
    const isShared = !!shareToken;

    return (
      <PromptCard
        key={prompt.id}
        prompt={prompt}
        onClick={() => handlePromptClick(prompt.id)}
        onCopyPrompt={() => handleCopyPrompt(prompt)}
        onDuplicate={() => handleDuplicate(prompt.id)}
        onDelete={() => setPromptToDelete(prompt)}
        onExport={() => handleExport(prompt)}
        canDelete={canDelete(prompt.id)}
        canShare
        isShared={isShared}
        onShare={() => {
          if (isSignedIn === false) {
            clerk.openSignIn();
            return;
          }
          if (!profile?.sync_enabled) {
            toast.info(t`Enable cloud sync to share prompts`);
            return;
          }
          share(prompt.id);
        }}
        onUnshare={() => unshare(prompt.id)}
        onCopyShareLink={shareToken ? () => copyShareUrl(shareToken) : undefined}
      />
    );
  };

  const gridClassName = 'grid gap-3 sm:grid-cols-1 md:grid-cols-2 lg:grid-cols-3';

  const renderContent = () => {
    if (hasNoPrompts) {
      return <LibraryEmptyState onCreatePrompt={handleCreatePrompt} />;
    }

    if (noSearchResults) {
      return <LibraryEmptyState isSearchResult onCreatePrompt={handleCreatePrompt} />;
    }

    const promptGrid = promptListData.grouped ? (
      <div data-testid="prompt-grid" className="flex flex-col gap-[18px]">
        {promptListData.groups.map((group) => (
          <div key={group.key} className="flex flex-col">
            <PromptGroupHeader label={group.label} />
            <div className={gridClassName}>{group.prompts.map(renderCard)}</div>
          </div>
        ))}
      </div>
    ) : (
      <div data-testid="prompt-grid" className={gridClassName}>
        {promptListData.prompts.map(renderCard)}
      </div>
    );

    return promptGrid;
  };

  return (
    <div className="flex flex-1 flex-col overflow-hidden">
      {/* Header with search, sort, and controls - hidden when no prompts */}
      {!hasNoPrompts && (
        <div className="from-muted/60 dark:from-glass-subtle bg-gradient-to-b to-transparent px-4 py-[14px] sm:px-6 sm:py-[18px]">
          <LibraryHeader
            searchQuery={searchQuery}
            onSearchChange={setSearchQuery}
            sortBy={sortBy}
            onSortChange={setSortBy}
            sortDirection={sortDirection}
            onSortDirectionChange={setSortDirection}
            onNewPrompt={handleCreatePrompt}
          />
        </div>
      )}

      {/* Content area */}
      <PullToRefresh
        onRefresh={handleRefresh}
        isEnabled={isMobile && !hasNoPrompts}
        className="flex-1 overflow-y-auto p-4 sm:p-6 sm:pt-1"
      >
        {renderContent()}
      </PullToRefresh>

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={!!promptToDelete} onOpenChange={(open) => !open && setPromptToDelete(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>
              <Trans>Delete prompt?</Trans>
            </AlertDialogTitle>
            <AlertDialogDescription>
              <Trans>
                This will permanently delete &quot;{promptToDelete?.title}&quot;. This action cannot be undone.
              </Trans>
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>
              <Trans>Cancel</Trans>
            </AlertDialogCancel>
            <AlertDialogAction variant="destructive" onClick={handleConfirmDelete}>
              <Trans>Delete</Trans>
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
