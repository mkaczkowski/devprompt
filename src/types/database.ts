/**
 * Database type aliases and re-exports.
 *
 * This file provides a database-agnostic public API for type imports.
 * The underlying types are auto-generated in supabase.ts via `npm run db:types`.
 *
 * Usage:
 *   import type { Profile, ProfileInsert, ProfileUpdate } from '@/types/database';
 *
 * When adding new tables:
 *   1. Run `npm run db:types` to regenerate supabase.ts
 *   2. Add convenience aliases here for your new tables
 */

// Re-export everything from the auto-generated Supabase types
export * from './supabase';

// Re-import for creating aliases
import type { Database, Json, Tables, TablesInsert, TablesUpdate } from './supabase';

// =============================================================================
// Generic Table Types
// =============================================================================

/**
 * Table names available in the database schema.
 */
export type TableName = keyof Database['public']['Tables'];

/**
 * Row type for a given table.
 */
export type TableRowType<T extends TableName> = Database['public']['Tables'][T]['Row'];

// =============================================================================
// Profile Types
// =============================================================================

/** Profile row type (read operations) */
export type Profile = Tables<'profiles'>;

/** Profile insert type (create operations) */
export type ProfileInsert = TablesInsert<'profiles'>;

/** Profile update type (update operations) */
export type ProfileUpdate = TablesUpdate<'profiles'>;

// =============================================================================
// Prompt Types (Cloud Sync)
// =============================================================================

/** Cloud prompt row type (read operations) */
export type CloudPrompt = Tables<'prompts'>;

/** Cloud prompt insert type (create operations) */
export type CloudPromptInsert = TablesInsert<'prompts'>;

/** Cloud prompt update type (update operations) */
export type CloudPromptUpdate = TablesUpdate<'prompts'>;

// =============================================================================
// RPC Response Types (Shared Prompts)
// =============================================================================

/**
 * Raw response from get_shared_prompt_by_token RPC function.
 * The deployed function returns a JSON object with nested author info.
 */
export interface SharedPromptRpcResponse {
  id: string;
  title: string;
  description: string | null;
  data: Json;
  share_token: string;
  shared_at: string | null;
  user_id: string;
  author: {
    id: string;
    full_name: string;
    avatar_url: string | null;
  };
}
