/**
 * Application configuration.
 * Centralized config for feature flags, etc.
 */

export const APP_CONFIG = {
  name: import.meta.env.VITE_APP_NAME || 'DevPrompt',
  url: import.meta.env.VITE_APP_URL || 'http://localhost:5173',
} as const;

/**
 * Clerk authentication configuration.
 */
export const CLERK_CONFIG = {
  publishableKey: import.meta.env.VITE_CLERK_PUBLISHABLE_KEY || '',
} as const;

/**
 * Supabase database configuration.
 */
export const SUPABASE_CONFIG = {
  url: import.meta.env.VITE_SUPABASE_DATABASE_URL,
  anonKey: import.meta.env.VITE_SUPABASE_ANON_KEY,
} as const;
