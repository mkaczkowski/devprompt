/**
 * Clerk authentication mocks for testing.
 *
 * Provides mock implementations of Clerk components and hooks,
 * with state controls for testing different auth scenarios.
 */

import type { ReactNode } from 'react';

import { MOCK_AUTH_TOKEN, MOCK_SESSION_ID } from '@/mocks/constants';
import { defaultUser, type MockUser } from '@/mocks/fixtures/users';

// Re-export user fixtures for test convenience
export { createUser, createUsers, defaultUser, mockUsers, type MockUser } from '@/mocks/fixtures/users';

// =============================================================================
// Types
// =============================================================================

interface ClerkMockState {
  isSignedIn: boolean;
  isLoaded: boolean;
  user: MockUser;
}

// =============================================================================
// Default State
// =============================================================================

const defaultState: ClerkMockState = {
  isSignedIn: true,
  isLoaded: true,
  user: defaultUser,
};

let mockState: ClerkMockState = { ...defaultState };

// =============================================================================
// State Controls
// =============================================================================

/** Set whether the user is signed in */
export function setMockClerkSignedIn(value: boolean) {
  mockState.isSignedIn = value;
}

/** Set whether Clerk has finished loading */
export function setMockClerkLoaded(value: boolean) {
  mockState.isLoaded = value;
}

/** Set multiple Clerk state values at once */
export function setMockClerkState(state: Partial<ClerkMockState>) {
  mockState = { ...mockState, ...state };
}

/** Set mock user properties */
export function setMockClerkUser(user: Partial<MockUser>) {
  mockState.user = { ...mockState.user, ...user };
}

/** Reset all Clerk mocks to default state */
export function resetClerkMocks() {
  mockState = { ...defaultState, user: { ...defaultUser } };
}

// =============================================================================
// Mock Components
// =============================================================================

export function SignedIn({ children }: { children: ReactNode }) {
  return mockState.isLoaded && mockState.isSignedIn ? <>{children}</> : null;
}

export function SignedOut({ children }: { children: ReactNode }) {
  return mockState.isLoaded && !mockState.isSignedIn ? <>{children}</> : null;
}

export function SignInButton({ children }: { children?: ReactNode; mode?: string }) {
  return <div data-testid="sign-in-button">{children}</div>;
}

export function SignUpButton({ children }: { children?: ReactNode; mode?: string }) {
  return <div data-testid="sign-up-button">{children}</div>;
}

export function UserButton() {
  return <button data-testid="user-button">User</button>;
}

export function RedirectToSignIn() {
  return <div data-testid="redirect-to-sign-in" />;
}

export function ClerkProvider({
  children,
}: {
  children: ReactNode;
  publishableKey?: string;
  afterSignOutUrl?: string;
  appearance?: unknown;
}) {
  return <>{children}</>;
}

// =============================================================================
// Mock Hooks
// =============================================================================

export function useAuth() {
  return {
    isLoaded: mockState.isLoaded,
    isSignedIn: mockState.isSignedIn,
    userId: mockState.isSignedIn ? mockState.user.id : null,
    sessionId: mockState.isSignedIn ? MOCK_SESSION_ID : null,
    getToken: async () => (mockState.isSignedIn ? MOCK_AUTH_TOKEN : null),
  };
}

export function useUser() {
  return {
    isLoaded: mockState.isLoaded,
    user: mockState.isSignedIn ? mockState.user : null,
  };
}

export function useSession() {
  return {
    isLoaded: mockState.isLoaded,
    session: mockState.isSignedIn
      ? {
          id: MOCK_SESSION_ID,
          getToken: async () => MOCK_AUTH_TOKEN,
        }
      : null,
  };
}
