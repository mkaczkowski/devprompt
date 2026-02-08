/**
 * Hooks for prompt sharing functionality.
 * Handles share/unshare mutations and fetching shared prompts.
 */

import { useUser } from '@clerk/react-router';
import type { PostgrestError } from '@supabase/supabase-js';
import { createClient } from '@supabase/supabase-js';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';

import { useSupabase } from '@/contexts/supabaseContext';
import { SUPABASE_CONFIG } from '@/lib/config';
import type { CloudPrompt, Database, SharedPromptRpcResponse } from '@/types/database';
import type { PromptData, SharedPromptData } from '@/types/prompt';

/**
 * Creates an anonymous Supabase client for public access.
 * Used to fetch shared prompts without authentication.
 */
function createAnonSupabaseClient() {
  if (!SUPABASE_CONFIG.url || !SUPABASE_CONFIG.anonKey) {
    throw new Error('Missing Supabase configuration');
  }

  return createClient<Database>(SUPABASE_CONFIG.url, SUPABASE_CONFIG.anonKey);
}

/**
 * Generates a unique share token (UUID v4).
 */
function generateShareToken(): string {
  return crypto.randomUUID();
}

/**
 * Transform RPC response to SharedPromptData.
 * The deployed function returns a nested author object and
 * does not include section_count/token_count at the top level.
 */
function transformRpcResponse(response: SharedPromptRpcResponse): SharedPromptData {
  const data = response.data as unknown as PromptData;
  return {
    id: response.id,
    title: response.title,
    description: response.description ?? undefined,
    sectionCount: data?.sections?.length ?? 0,
    tokenCount: data?.tokenCount ?? 0,
    data,
    sharedAt: response.shared_at ? new Date(response.shared_at).getTime() : Date.now(),
    author: {
      id: response.author.id,
      name: response.author.full_name ?? 'Anonymous',
      avatarUrl: response.author.avatar_url ?? undefined,
    },
  };
}

interface SharePromptResult {
  shareToken: string;
  sharedAt: number;
}

interface UnsharePromptResult {
  promptId: string;
}

/**
 * Hook to share a prompt (generate share token).
 * Returns mutation for enabling public sharing on a prompt.
 */
export function useSharePrompt() {
  const { user } = useUser();
  const supabase = useSupabase();
  const queryClient = useQueryClient();

  return useMutation<SharePromptResult, PostgrestError, string>({
    mutationFn: async (promptId) => {
      if (!user?.id) {
        throw new Error('No authenticated user');
      }

      const shareToken = generateShareToken();
      const sharedAt = new Date().toISOString();

      const { error } = await supabase
        .from('prompts')
        .update({
          share_token: shareToken,
          shared_at: sharedAt,
        })
        .eq('user_id', user.id)
        .eq('id', promptId);

      if (error) throw error;

      return {
        shareToken,
        sharedAt: new Date(sharedAt).getTime(),
      };
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['supabase', 'prompts'] });
    },
  });
}

/**
 * Hook to unshare a prompt (remove share token).
 * Returns mutation for disabling public sharing on a prompt.
 */
export function useUnsharePrompt() {
  const { user } = useUser();
  const supabase = useSupabase();
  const queryClient = useQueryClient();

  return useMutation<UnsharePromptResult, PostgrestError, string>({
    mutationFn: async (promptId) => {
      if (!user?.id) {
        throw new Error('No authenticated user');
      }

      const { error } = await supabase
        .from('prompts')
        .update({
          share_token: null,
          shared_at: null,
        })
        .eq('user_id', user.id)
        .eq('id', promptId);

      if (error) throw error;

      return { promptId };
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['supabase', 'prompts'] });
    },
  });
}

/**
 * Hook to fetch a shared prompt by its share token.
 * Uses anonymous client for public access (no authentication required).
 */
export function useSharedPrompt(shareToken: string | undefined) {
  return useQuery<SharedPromptData | null, Error>({
    queryKey: ['shared-prompt', shareToken],
    queryFn: async () => {
      if (!shareToken) return null;

      const anonClient = createAnonSupabaseClient();

      const { data, error } = await anonClient.rpc('get_shared_prompt_by_token', {
        p_share_token: shareToken,
      });

      if (error) {
        throw new Error(error.message);
      }

      if (!data) return null;

      // Handle both array (RETURNS TABLE) and single object (RETURNS JSON) responses
      const response = (Array.isArray(data) ? data[0] : data) as SharedPromptRpcResponse | undefined;
      if (!response) return null;

      return transformRpcResponse(response);
    },
    enabled: !!shareToken,
    staleTime: 5 * 60 * 1000, // 5 minutes
    gcTime: 10 * 60 * 1000, // 10 minutes
  });
}

/**
 * Get share info for a specific prompt from cached cloud prompts.
 * Returns shareToken and sharedAt if the prompt is shared.
 */
export function getShareInfoFromCloudPrompt(
  cloudPrompt: CloudPrompt | undefined,
): { shareToken: string; sharedAt: number } | null {
  if (!cloudPrompt) return null;

  // Access share_token and shared_at from the cloud prompt
  // These fields are added by the migration but may not be in the generated types yet
  const promptWithShare = cloudPrompt as CloudPrompt & {
    share_token?: string | null;
    shared_at?: string | null;
  };

  if (!promptWithShare.share_token) return null;

  return {
    shareToken: promptWithShare.share_token,
    sharedAt: promptWithShare.shared_at ? new Date(promptWithShare.shared_at).getTime() : Date.now(),
  };
}
