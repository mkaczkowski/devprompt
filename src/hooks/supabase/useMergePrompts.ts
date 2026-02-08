/**
 * Hook for merging local and cloud prompts.
 *
 * Provides bidirectional sync by fetching cloud prompts and merging
 * with local prompts using "latest timestamp wins" strategy.
 */

import { useCallback, useState } from 'react';

import { cloudToLocalData, cloudToLocalMetadata, mergePrompts, type MergeResult } from './mergePrompts';
import { toCloudPromptUpsert, useBulkUpsertPrompts, useUserPrompts } from './usePrompts';

import { loadPromptData, savePromptData } from '@/lib/promptStorage';
import { useLibraryStore } from '@/stores/libraryStore';
import type { CloudPrompt } from '@/types/database';

export interface UseMergePromptsReturn {
  /** Execute the merge operation */
  merge: () => Promise<MergeResult | null>;
  /** Whether a merge is currently in progress */
  isMerging: boolean;
  /** Error from the last merge attempt */
  error: Error | null;
}

/**
 * Hook that provides bidirectional prompt synchronization.
 *
 * When merge() is called:
 * 1. Fetches latest cloud prompts
 * 2. Compares with local prompts using timestamps
 * 3. Adds/updates local prompts that are newer in cloud
 * 4. Uploads local prompts that are newer or cloud-only
 */
export function useMergePrompts(): UseMergePromptsReturn {
  const [isMerging, setIsMerging] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  const { refetch: refetchCloud } = useUserPrompts();
  const { mutateAsync: bulkUpsert } = useBulkUpsertPrompts();

  const merge = useCallback(async (): Promise<MergeResult | null> => {
    setIsMerging(true);
    setError(null);

    try {
      // 1. Fetch latest cloud prompts
      const { data: freshCloudPrompts, error: fetchError } = await refetchCloud();

      if (fetchError) {
        throw new Error(`Failed to fetch cloud prompts: ${fetchError.message}`);
      }

      const cloud = (freshCloudPrompts ?? []) as CloudPrompt[];

      // 2. Get local prompts
      const localPrompts = useLibraryStore.getState().prompts;

      // 3. Perform merge calculation
      const result = mergePrompts(localPrompts, cloud, loadPromptData);

      // 4. Apply cloud-to-local changes (add new prompts from cloud)
      if (result.addToLocal.length > 0) {
        const newMetadata = result.addToLocal.map(cloudToLocalMetadata);

        // Save data to localStorage first
        for (const cloudPrompt of result.addToLocal) {
          const data = cloudToLocalData(cloudPrompt);
          savePromptData(cloudPrompt.id, data);
        }

        // Then update Zustand store
        useLibraryStore.getState().addPromptsFromCloud(newMetadata);
      }

      // 5. Apply cloud-to-local changes (update existing prompts from cloud)
      if (result.updateLocal.length > 0) {
        const updatedMetadata = result.updateLocal.map(cloudToLocalMetadata);

        // Update localStorage data
        for (const cloudPrompt of result.updateLocal) {
          const data = cloudToLocalData(cloudPrompt);
          savePromptData(cloudPrompt.id, data);
        }

        // Update Zustand store
        useLibraryStore.getState().updatePromptsFromCloud(updatedMetadata);
      }

      // 6. Apply local-to-cloud changes (upload newer local prompts)
      if (result.uploadToCloud.length > 0) {
        const cloudUpserts = result.uploadToCloud.map(({ meta, data }) =>
          toCloudPromptUpsert(
            meta.id,
            meta.title,
            meta.description,
            meta.sectionCount ?? data.sections.length,
            meta.tokenCount ?? data.tokenCount ?? 0,
            data,
            meta.createdAt,
            meta.updatedAt,
          ),
        );

        await bulkUpsert(cloudUpserts);
      }

      return result;
    } catch (err) {
      const mergeError = err instanceof Error ? err : new Error('Merge failed');
      setError(mergeError);
      return null;
    } finally {
      setIsMerging(false);
    }
  }, [refetchCloud, bulkUpsert]);

  return { merge, isMerging, error };
}
