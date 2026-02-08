/**
 * Merge algorithm for bidirectional prompt synchronization.
 *
 * Compares local and cloud prompts, determines which need to be
 * synced in each direction using "latest timestamp wins" strategy.
 */

import type { CloudPrompt } from '@/types/database';
import type { PromptData, PromptMetadata } from '@/types/prompt';

/**
 * Statistics from a merge operation.
 */
export interface MergeStats {
  /** Prompts that exist only locally */
  localOnly: number;
  /** Prompts that exist only in cloud */
  cloudOnly: number;
  /** Conflicts where local version was newer */
  conflictsLocalWins: number;
  /** Conflicts where cloud version was newer */
  conflictsCloudWins: number;
  /** Prompts with identical timestamps (no action needed) */
  unchanged: number;
}

/**
 * Result of merging local and cloud prompts.
 */
export interface MergeResult {
  /** Cloud prompts to add to local storage */
  addToLocal: CloudPrompt[];
  /** Cloud prompts to update in local storage (newer than local) */
  updateLocal: CloudPrompt[];
  /** Local prompts to upload to cloud (local-only or newer than cloud) */
  uploadToCloud: { meta: PromptMetadata; data: PromptData }[];
  /** Summary statistics */
  stats: MergeStats;
}

/**
 * Merges local and cloud prompts using "latest timestamp wins" strategy.
 *
 * @param localPrompts - Array of local prompt metadata
 * @param cloudPrompts - Array of cloud prompts from Supabase
 * @param loadLocalData - Function to load full prompt data from localStorage
 * @returns MergeResult with actions to take for each direction
 */
export function mergePrompts(
  localPrompts: PromptMetadata[],
  cloudPrompts: CloudPrompt[],
  loadLocalData: (id: string) => PromptData | null,
): MergeResult {
  const result: MergeResult = {
    addToLocal: [],
    updateLocal: [],
    uploadToCloud: [],
    stats: {
      localOnly: 0,
      cloudOnly: 0,
      conflictsLocalWins: 0,
      conflictsCloudWins: 0,
      unchanged: 0,
    },
  };

  // Create lookup map for cloud prompts for efficient comparison
  const cloudMap = new Map(cloudPrompts.map((p) => [p.id, p]));
  const processedIds = new Set<string>();

  // Process all local prompts
  for (const localMeta of localPrompts) {
    processedIds.add(localMeta.id);
    const cloudPrompt = cloudMap.get(localMeta.id);

    if (!cloudPrompt) {
      // LOCAL ONLY: Upload to cloud
      const data = loadLocalData(localMeta.id);
      if (data) {
        result.uploadToCloud.push({ meta: localMeta, data });
        result.stats.localOnly++;
      }
    } else {
      // EXISTS IN BOTH: Compare timestamps
      const localUpdatedAt = localMeta.updatedAt;
      const cloudUpdatedAt = cloudPrompt.client_updated_at;

      if (localUpdatedAt > cloudUpdatedAt) {
        // Local is newer - upload to cloud
        const data = loadLocalData(localMeta.id);
        if (data) {
          result.uploadToCloud.push({ meta: localMeta, data });
          result.stats.conflictsLocalWins++;
        }
      } else if (cloudUpdatedAt > localUpdatedAt) {
        // Cloud is newer - update local
        result.updateLocal.push(cloudPrompt);
        result.stats.conflictsCloudWins++;
      } else {
        // Same timestamp - no action needed
        result.stats.unchanged++;
      }
    }
  }

  // Process cloud-only prompts (not in local)
  for (const cloudPrompt of cloudPrompts) {
    if (!processedIds.has(cloudPrompt.id)) {
      result.addToLocal.push(cloudPrompt);
      result.stats.cloudOnly++;
    }
  }

  return result;
}

/**
 * Converts a CloudPrompt to local PromptMetadata format.
 */
export function cloudToLocalMetadata(cloud: CloudPrompt): PromptMetadata {
  return {
    id: cloud.id,
    title: cloud.title,
    description: cloud.description ?? undefined,
    createdAt: cloud.client_created_at,
    updatedAt: cloud.client_updated_at,
    sectionCount: cloud.section_count ?? undefined,
    tokenCount: cloud.token_count ?? undefined,
  };
}

/**
 * Extracts PromptData from a CloudPrompt.
 * The data field is stored as JSONB and contains the full PromptData structure.
 */
export function cloudToLocalData(cloud: CloudPrompt): PromptData {
  const data = cloud.data as unknown as PromptData;
  return {
    title: data.title,
    sections: data.sections ?? [],
    tokenCount: data.tokenCount,
  };
}
