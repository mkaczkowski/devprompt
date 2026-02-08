import { RedirectToSignIn, useAuth } from '@clerk/react-router';
import type { ReactNode } from 'react';

import { PageLoading } from '@/components/ui/loading';

interface ProtectedRouteProps {
  children: ReactNode;
}

/**
 * Wraps routes that require authentication.
 * Shows loading state while auth loads, redirects to sign-in if not authenticated.
 *
 * @example
 * ```tsx
 * <Route path="/dashboard" element={
 *   <ProtectedRoute>
 *     <DashboardPage />
 *   </ProtectedRoute>
 * } />
 * ```
 */
export function ProtectedRoute({ children }: ProtectedRouteProps) {
  const { isLoaded, isSignedIn } = useAuth();

  if (!isLoaded) {
    return <PageLoading />;
  }

  if (!isSignedIn) {
    return <RedirectToSignIn />;
  }

  return <>{children}</>;
}
