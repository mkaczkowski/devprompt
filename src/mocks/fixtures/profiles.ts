/**
 * Mock profile fixtures for testing.
 * Used by MSW handlers to simulate Supabase responses.
 */

import { MOCK_TIMESTAMPS, MOCK_USER } from '../constants';

import type { Profile } from '@/types/database';

/** Counter for unique ID generation */
let idCounter = 0;

/**
 * Sample profiles for MSW handlers.
 */
export const mockProfiles: Profile[] = [
  {
    id: MOCK_USER.id,
    email: MOCK_USER.email,
    full_name: MOCK_USER.fullName,
    avatar_url: null,
    sync_enabled: false,
    created_at: MOCK_TIMESTAMPS.created,
    updated_at: MOCK_TIMESTAMPS.updated,
  },
];

/**
 * Create a profile with optional overrides.
 */
export function createProfile(overrides: Partial<Profile> = {}): Profile {
  const now = new Date().toISOString();
  return {
    id: `user_${Date.now()}_${idCounter++}`,
    email: MOCK_USER.email,
    full_name: MOCK_USER.fullName,
    avatar_url: null,
    sync_enabled: false,
    created_at: now,
    updated_at: now,
    ...overrides,
  };
}

/**
 * Create multiple profiles.
 */
export function createProfiles(count: number, overrides: Partial<Profile> = {}): Profile[] {
  return Array.from({ length: count }, (_, i) =>
    createProfile({
      id: `user_${i + 1}`,
      email: `user${i + 1}@example.com`,
      full_name: `User ${i + 1}`,
      ...overrides,
    }),
  );
}
