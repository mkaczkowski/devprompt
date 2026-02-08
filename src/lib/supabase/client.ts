/**
 * Supabase client factory with Clerk authentication.
 * @see https://supabase.com/docs/guides/auth/third-party/clerk
 */

import { createClient, type SupabaseClient } from '@supabase/supabase-js';

import { SUPABASE_CONFIG } from '../config';

import type { Database } from '@/types/database';

export type TypedSupabaseClient = SupabaseClient<Database>;
export type GetTokenFn = () => Promise<string | null>;

/**
 * Creates a Supabase client with Clerk auth token injection.
 * @throws Error if Supabase env vars are missing
 */
export function createSupabaseClient(getToken: GetTokenFn): TypedSupabaseClient {
  if (!SUPABASE_CONFIG.url || !SUPABASE_CONFIG.anonKey) {
    throw new Error(
      'Missing Supabase environment variables. ' +
        'Set VITE_SUPABASE_DATABASE_URL and VITE_SUPABASE_ANON_KEY in your .env file.',
    );
  }

  return createClient<Database>(SUPABASE_CONFIG.url, SUPABASE_CONFIG.anonKey, {
    accessToken: getToken,
  });
}
