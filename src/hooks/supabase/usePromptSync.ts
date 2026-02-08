/**
 * Prompt sync orchestration hook.
 *
 * Handles bidirectional syncing of prompts with Supabase when sync is enabled:
 * - Monitors sync_enabled state from user profile
 * - Merges local and cloud prompts on app startup (for returning users)
 * - Merges when sync is first enabled
 * - Syncs CRUD operations in real-time
 * - Debounces content edits to reduce API calls
 */

import { useCallback, useEffect, useRef } from 'react';

import { useMergePrompts } from './useMergePrompts';
import { useProfile } from './useProfiles';
import { toCloudPromptUpsert, useDeleteCloudPrompt, useUpsertPrompt } from './usePrompts';

import { useDebouncedCallback } from '@/hooks/useDebouncedCallback';
import { TIMING } from '@/lib/constants';
import { loadPromptData } from '@/lib/promptStorage';
import { isCloudSyncInProgress, useLibraryStore } from '@/stores/libraryStore';
import type { PromptMetadata } from '@/types';

interface UsePromptSyncReturn {
  /** Whether sync is currently enabled */
  syncEnabled: boolean;
  /** Whether a merge operation is in progress */
  isMerging: boolean;
  /** Error from sync operations */
  error: Error | null;
  /** Manually trigger sync for a specific prompt */
  syncPrompt: (promptId: string) => void;
  /** Manually trigger deletion sync for a prompt */
  syncDelete: (promptId: string) => void;
  /** Manually trigger a merge operation */
  triggerMerge: () => Promise<void>;
}

/**
 * Hook to orchestrate prompt syncing with Supabase.
 *
 * Usage: Call this hook once at the app level (e.g., in App.tsx or a provider)
 * to enable automatic syncing when the user has sync enabled.
 */
export function usePromptSync(): UsePromptSyncReturn {
  const { profile, isLoading: isProfileLoading } = useProfile();
  const { mutate: upsertPrompt, error: upsertError } = useUpsertPrompt();
  const { merge, isMerging, error: mergeError } = useMergePrompts();
  const { mutate: deletePrompt, error: deleteError } = useDeleteCloudPrompt();

  const syncEnabled = profile?.sync_enabled ?? false;
  const hasInitialMerged = useRef(false);
  // Use undefined to distinguish "unknown initial state" from "known disabled"
  const previousSyncEnabled = useRef<boolean | undefined>(undefined);

  /**
   * Sync a single prompt to the cloud.
   */
  const syncPrompt = useCallback(
    (promptId: string) => {
      if (!syncEnabled) return;

      const prompts = useLibraryStore.getState().prompts;
      const meta = prompts.find((p) => p.id === promptId);
      if (!meta) return;

      const data = loadPromptData(promptId);
      if (!data) return;

      const cloudPrompt = toCloudPromptUpsert(
        meta.id,
        meta.title,
        meta.description,
        meta.sectionCount ?? data.sections.length,
        meta.tokenCount ?? data.tokenCount ?? 0,
        data,
        meta.createdAt,
        meta.updatedAt,
      );

      upsertPrompt(cloudPrompt);
    },
    [syncEnabled, upsertPrompt],
  );

  /**
   * Debounced sync for content edits.
   */
  const debouncedSyncPrompt = useDebouncedCallback(syncPrompt, TIMING.SYNC_DEBOUNCE_DELAY);

  /**
   * Sync prompt deletion to the cloud.
   */
  const syncDelete = useCallback(
    (promptId: string) => {
      if (!syncEnabled) return;
      deletePrompt(promptId);
    },
    [syncEnabled, deletePrompt],
  );

  /**
   * Helper to sync a prompt from metadata.
   */
  const syncPromptFromMeta = useCallback(
    (meta: PromptMetadata) => {
      if (!syncEnabled) return;

      const data = loadPromptData(meta.id);
      if (!data) return;

      const cloudPrompt = toCloudPromptUpsert(
        meta.id,
        meta.title,
        meta.description,
        meta.sectionCount ?? data.sections.length,
        meta.tokenCount ?? data.tokenCount ?? 0,
        data,
        meta.createdAt,
        meta.updatedAt,
      );

      upsertPrompt(cloudPrompt);
    },
    [syncEnabled, upsertPrompt],
  );

  /**
   * Manually trigger merge (exposed for manual sync or debugging).
   */
  const triggerMerge = useCallback(async () => {
    if (!syncEnabled) return;
    await merge();
  }, [syncEnabled, merge]);

  /**
   * Initial merge: Sync local and cloud prompts bidirectionally.
   * Triggers on:
   * - App startup for returning users with sync enabled
   * - When user explicitly enables sync
   */
  useEffect(() => {
    // Skip if profile is still loading or sync is not enabled
    if (isProfileLoading || !syncEnabled) return;

    // Skip if we've already done initial merge
    if (hasInitialMerged.current) return;

    // If previousSyncEnabled is undefined, this is the first profile load.
    const isFirstLoad = previousSyncEnabled.current === undefined;
    const wasJustEnabled = previousSyncEnabled.current === false && syncEnabled;

    // For returning users (sync already enabled), perform merge on first load
    if (isFirstLoad && syncEnabled) {
      hasInitialMerged.current = true;
      merge();
      return;
    }

    // For users who just enabled sync, also perform merge
    if (wasJustEnabled) {
      hasInitialMerged.current = true;
      merge();
      return;
    }

    hasInitialMerged.current = true;
  }, [syncEnabled, isProfileLoading, merge]);

  /**
   * Track sync enabled state changes.
   * Also cancel pending debounced syncs when sync is disabled.
   */
  useEffect(() => {
    // Cancel pending debounced calls when sync is disabled
    if (previousSyncEnabled.current === true && !syncEnabled) {
      debouncedSyncPrompt.cancel();
    }
    previousSyncEnabled.current = syncEnabled;
  }, [syncEnabled, debouncedSyncPrompt]);

  /**
   * Subscribe to library store changes for CRUD sync.
   * Skips changes that originated from cloud sync to prevent loops.
   */
  useEffect(() => {
    if (!syncEnabled) return;

    let previousPrompts = useLibraryStore.getState().prompts;

    const unsubscribe = useLibraryStore.subscribe((state) => {
      // Skip if this change came from cloud sync (prevents sync loops)
      if (isCloudSyncInProgress()) {
        previousPrompts = state.prompts;
        return;
      }

      const currentPrompts = state.prompts;

      // Detect new prompts (additions)
      const addedPrompts = currentPrompts.filter((p) => !previousPrompts.some((prev) => prev.id === p.id));

      // Detect deleted prompts
      const deletedPrompts = previousPrompts.filter((p) => !currentPrompts.some((curr) => curr.id === p.id));

      // Detect updated prompts (same ID, different updatedAt)
      const updatedPrompts = currentPrompts.filter((p) => {
        const prev = previousPrompts.find((prev) => prev.id === p.id);
        return prev && prev.updatedAt !== p.updatedAt;
      });

      // Sync additions immediately
      addedPrompts.forEach((meta) => {
        syncPromptFromMeta(meta);
      });

      // Sync deletions immediately
      deletedPrompts.forEach((meta) => {
        deletePrompt(meta.id);
      });

      // Sync updates with debouncing
      updatedPrompts.forEach((meta) => {
        debouncedSyncPrompt.call(meta.id);
      });

      previousPrompts = currentPrompts;
    });

    return unsubscribe;
  }, [syncEnabled, debouncedSyncPrompt, deletePrompt, syncPromptFromMeta]);

  // Combine errors from all mutation hooks
  const error = upsertError ?? mergeError ?? deleteError ?? null;

  return {
    syncEnabled,
    isMerging,
    error,
    syncPrompt,
    syncDelete,
    triggerMerge,
  };
}
