/**
 * Prompt hooks for Supabase cloud sync.
 * Operations scoped via RLS to current user.
 */

import { useUser } from '@clerk/react-router';
import type { PostgrestError } from '@supabase/supabase-js';
import { useMutation, useQueryClient } from '@tanstack/react-query';

import { useSupabaseQuery } from './useSupabaseQuery';

import { useSupabase } from '@/contexts/supabaseContext';
import type { CloudPrompt, CloudPromptInsert, Json } from '@/types/database';
import type { PromptData } from '@/types/prompt';
import type { CloudPromptUpsert } from '@/types/sync';

/**
 * Converts PromptData to Supabase's Json type.
 * Supabase generates `Json` as a generic union type that doesn't match
 * our specific interface. This helper centralizes the type coercion.
 */
function toJsonField(data: PromptData): Json {
  // PromptData is JSON-serializable and matches the Json type at runtime
  return data as unknown as Json;
}

/** Fetches all prompts for current user. */
export function useUserPrompts() {
  const { user, isLoaded } = useUser();
  const userId = user?.id;

  return useSupabaseQuery<CloudPrompt>({
    table: 'prompts',
    filter: (query) => query.eq('user_id', userId ?? '').order('client_updated_at', { ascending: false }),
    queryKey: ['user', userId ?? ''],
    queryOptions: {
      enabled: isLoaded && !!userId,
    },
  });
}

/** Creates or updates a prompt in the cloud. */
export function useUpsertPrompt() {
  const { user } = useUser();
  const supabase = useSupabase();
  const queryClient = useQueryClient();

  return useMutation<CloudPrompt, PostgrestError, CloudPromptUpsert>({
    mutationFn: async (prompt) => {
      if (!user?.id) {
        throw new Error('No authenticated user');
      }

      const insertData: CloudPromptInsert = {
        ...prompt,
        user_id: user.id,
        data: toJsonField(prompt.data),
      };

      const { data, error } = await supabase
        .from('prompts')
        .upsert(insertData, { onConflict: 'user_id,id' })
        .select()
        .single();

      if (error) throw error;
      return data as CloudPrompt;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['supabase', 'prompts'] });
    },
  });
}

/** Bulk upserts multiple prompts (for initial sync). */
export function useBulkUpsertPrompts() {
  const { user } = useUser();
  const supabase = useSupabase();
  const queryClient = useQueryClient();

  return useMutation<CloudPrompt[], PostgrestError, CloudPromptUpsert[]>({
    mutationFn: async (prompts) => {
      if (!user?.id) {
        throw new Error('No authenticated user');
      }

      if (prompts.length === 0) {
        return [];
      }

      const promptsWithUser: CloudPromptInsert[] = prompts.map((prompt) => ({
        ...prompt,
        user_id: user.id,
        data: toJsonField(prompt.data),
      }));

      const { data, error } = await supabase
        .from('prompts')
        .upsert(promptsWithUser, { onConflict: 'user_id,id' })
        .select();

      if (error) throw error;
      return (data ?? []) as CloudPrompt[];
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['supabase', 'prompts'] });
    },
  });
}

/** Deletes a prompt from the cloud. */
export function useDeleteCloudPrompt() {
  const { user } = useUser();
  const supabase = useSupabase();
  const queryClient = useQueryClient();

  return useMutation<void, PostgrestError, string>({
    mutationFn: async (promptId) => {
      if (!user?.id) {
        throw new Error('No authenticated user');
      }

      const { error } = await supabase.from('prompts').delete().eq('user_id', user.id).eq('id', promptId);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['supabase', 'prompts'] });
    },
  });
}

/**
 * Converts local prompt metadata + data to cloud prompt upsert format.
 * Note: user_id is added by the mutation hooks.
 */
export function toCloudPromptUpsert(
  id: string,
  title: string,
  description: string | undefined,
  sectionCount: number,
  tokenCount: number,
  data: PromptData,
  createdAt: number,
  updatedAt: number,
): CloudPromptUpsert {
  return {
    id,
    title,
    description: description ?? null,
    section_count: sectionCount,
    token_count: tokenCount,
    data,
    client_created_at: createdAt,
    client_updated_at: updatedAt,
  };
}
