/**
 * Mock constants for testing.
 * Provides consistent values for auth tokens, user IDs, and timestamps.
 */

/** Mock Supabase URL for testing */
export const MOCK_SUPABASE_URL = 'https://test-project.supabase.co';

/** Mock authentication token */
export const MOCK_AUTH_TOKEN = 'mock-clerk-jwt-token';

/** Mock session ID */
export const MOCK_SESSION_ID = 'sess_mock123';

/** Mock user data */
export const MOCK_USER = {
  id: 'user_123',
  email: 'test@example.com',
  fullName: 'Test User',
} as const;

/** Mock timestamps for consistent test data */
export const MOCK_TIMESTAMPS = {
  created: '2024-01-01T00:00:00.000Z',
  updated: '2024-01-02T00:00:00.000Z',
} as const;
