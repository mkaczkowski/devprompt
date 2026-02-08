/**
 * Supabase context with Clerk auth integration.
 * @see https://supabase.com/docs/guides/auth/third-party/clerk
 */

import { useSession } from '@clerk/react-router';
import { createContext, type ReactNode, useContext, useMemo } from 'react';

import { createSupabaseClient, type TypedSupabaseClient } from '@/lib/supabase';

const SupabaseContext = createContext<TypedSupabaseClient | null>(null);

interface SupabaseProviderProps {
  children: ReactNode;
}

/** Provides Supabase client with Clerk tokens. Must be inside ClerkProvider. */
export function SupabaseProvider({ children }: SupabaseProviderProps) {
  const { session } = useSession();

  // Create client with stable getToken reference
  // Only recreate when session ID changes (sign in/out), not on every render
  const supabase = useMemo(
    () =>
      createSupabaseClient(async () => {
        if (!session) return null;
        return session.getToken();
      }),
    // eslint-disable-next-line react-hooks/exhaustive-deps -- session.id is stable, session object is not
    [session?.id],
  );

  return <SupabaseContext.Provider value={supabase}>{children}</SupabaseContext.Provider>;
}

/**
 * Returns typed Supabase client with Clerk auth.
 * @throws Error if used outside SupabaseProvider
 */
export function useSupabase(): TypedSupabaseClient {
  const context = useContext(SupabaseContext);

  if (!context) {
    throw new Error('useSupabase must be used within a SupabaseProvider');
  }

  return context;
}
