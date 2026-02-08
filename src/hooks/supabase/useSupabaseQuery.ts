/**
 * Generic Supabase query hook with TanStack Query and Clerk auth.
 */

import type { PostgrestError } from '@supabase/supabase-js';
import { useQuery, type UseQueryOptions, type UseQueryResult } from '@tanstack/react-query';

import { useSupabase } from '@/contexts/supabaseContext';
import type { TableName } from '@/types/database';

export interface UseSupabaseQueryOptions<TData> {
  /** Database table to query */
  table: TableName;
  /** Columns to select (defaults to '*') */
  select?: string;
  /** Filter function to apply conditions */
  filter?: (query: ReturnType<ReturnType<typeof useSupabase>['from']>) => unknown;
  /** Query key for caching (prefixed with ['supabase', table]) */
  queryKey: string[];
  /** Additional TanStack Query options */
  queryOptions?: Omit<UseQueryOptions<TData[], PostgrestError>, 'queryKey' | 'queryFn'>;
}

/** Generic SELECT query hook with RLS enforcement. */
export function useSupabaseQuery<TData>({
  table,
  select = '*',
  filter,
  queryKey,
  queryOptions,
}: UseSupabaseQueryOptions<TData>): UseQueryResult<TData[], PostgrestError> {
  const supabase = useSupabase();

  return useQuery<TData[], PostgrestError>({
    queryKey: ['supabase', table, ...queryKey],
    queryFn: async () => {
      let query = supabase.from(table).select(select);

      if (filter) {
        query = filter(query) as typeof query;
      }

      const { data, error } = await query;

      if (error) {
        throw error;
      }

      return (data ?? []) as TData[];
    },
    ...queryOptions,
  });
}
