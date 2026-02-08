/**
 * Profile hooks for Supabase. Operations scoped via RLS to current user.
 */

import { useUser } from '@clerk/react-router';
import type { PostgrestError } from '@supabase/supabase-js';
import { useMutation, useQueryClient } from '@tanstack/react-query';

import { useSupabaseQuery } from './useSupabaseQuery';

import { useSupabase } from '@/contexts/supabaseContext';
import type { Profile, ProfileInsert, ProfileUpdate } from '@/types/database';

/** Fetches current user's profile (returns array). */
export function useCurrentProfile() {
  const { user, isLoaded } = useUser();
  const userId = user?.id;

  return useSupabaseQuery<Profile>({
    table: 'profiles',
    filter: (query) => query.eq('id', userId ?? ''),
    queryKey: ['current', userId ?? ''],
    queryOptions: {
      enabled: isLoaded && !!userId,
    },
  });
}

/** Fetches current user's profile as single object (convenience wrapper). */
export function useProfile() {
  const query = useCurrentProfile();
  const profile = query.data?.[0] ?? null;

  return {
    profile,
    exists: profile !== null,
    isLoading: query.isLoading,
    isFetching: query.isFetching,
    error: query.error,
    refetch: query.refetch,
  };
}

/** Creates or updates user profile (upsert). */
export function useUpsertProfile() {
  const supabase = useSupabase();
  const queryClient = useQueryClient();

  return useMutation<Profile, PostgrestError, ProfileInsert>({
    mutationFn: async (profile) => {
      const { data, error } = await supabase.from('profiles').upsert(profile, { onConflict: 'id' }).select().single();

      if (error) throw error;
      return data as Profile;
    },
    onSuccess: () => {
      // Invalidate profile queries to refetch fresh data
      queryClient.invalidateQueries({ queryKey: ['supabase', 'profiles'] });
    },
  });
}

/** Updates specified fields on current user's profile. */
export function useUpdateProfile() {
  const { user } = useUser();
  const supabase = useSupabase();
  const queryClient = useQueryClient();

  return useMutation<Profile, PostgrestError, ProfileUpdate>({
    mutationFn: async (updates) => {
      if (!user?.id) {
        throw new Error('No authenticated user');
      }

      const { data, error } = await supabase.from('profiles').update(updates).eq('id', user.id).select().single();

      if (error) throw error;
      return data as Profile;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['supabase', 'profiles'] });
    },
  });
}

/** Deletes current user's profile permanently. */
export function useDeleteProfile() {
  const { user } = useUser();
  const supabase = useSupabase();
  const queryClient = useQueryClient();

  return useMutation<void, PostgrestError, void>({
    mutationFn: async () => {
      if (!user?.id) {
        throw new Error('No authenticated user');
      }

      const { error } = await supabase.from('profiles').delete().eq('id', user.id);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.removeQueries({ queryKey: ['supabase', 'profiles'] });
    },
  });
}
