/**
 * Supabase hooks exports.
 *
 * Note: Generic mutation hooks were removed in favor of table-specific hooks
 * (like useProfiles) which provide better type safety with Supabase's complex types.
 */

// Generic query hook
export { useSupabaseQuery, type UseSupabaseQueryOptions } from './useSupabaseQuery';

// Domain-specific hooks (type-safe mutations)
export { useCurrentProfile, useProfile, useUpsertProfile, useUpdateProfile, useDeleteProfile } from './useProfiles';

// Prompt sync hooks
export {
  useUserPrompts,
  useUpsertPrompt,
  useBulkUpsertPrompts,
  useDeleteCloudPrompt,
  toCloudPromptUpsert,
} from './usePrompts';

// Merge utilities
export {
  mergePrompts,
  cloudToLocalMetadata,
  cloudToLocalData,
  type MergeResult,
  type MergeStats,
} from './mergePrompts';
export { useMergePrompts, type UseMergePromptsReturn } from './useMergePrompts';

// Sync orchestration
export { usePromptSync } from './usePromptSync';

// Share functionality
export { useSharePrompt, useUnsharePrompt, useSharedPrompt, getShareInfoFromCloudPrompt } from './useSharePrompt';
