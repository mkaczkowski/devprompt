/**
 * Mock user fixtures for testing.
 * Used by Clerk mocks to simulate authenticated users.
 */

import { MOCK_USER } from '../constants';

/**
 * Mock user type matching Clerk's user object structure.
 */
export interface MockUser {
  id: string;
  primaryEmailAddress: {
    emailAddress: string;
  } | null;
  fullName: string | null;
  imageUrl: string | null;
}

/** Counter for unique ID generation */
let idCounter = 0;

/**
 * Default mock user for testing.
 */
export const defaultUser: MockUser = {
  id: MOCK_USER.id,
  primaryEmailAddress: {
    emailAddress: MOCK_USER.email,
  },
  fullName: MOCK_USER.fullName,
  imageUrl: null,
};

/**
 * Sample users for MSW handlers.
 */
export const mockUsers: MockUser[] = [defaultUser];

/**
 * Create a user with optional overrides.
 */
export function createUser(overrides: Partial<MockUser> = {}): MockUser {
  return {
    id: `user_${Date.now()}_${idCounter++}`,
    primaryEmailAddress: {
      emailAddress: 'user@example.com',
    },
    fullName: 'Mock User',
    imageUrl: null,
    ...overrides,
  };
}

/**
 * Create multiple users.
 */
export function createUsers(count: number, overrides: Partial<MockUser> = {}): MockUser[] {
  return Array.from({ length: count }, (_, i) =>
    createUser({
      id: `user_${i + 1}`,
      primaryEmailAddress: {
        emailAddress: `user${i + 1}@example.com`,
      },
      fullName: `User ${i + 1}`,
      ...overrides,
    }),
  );
}
