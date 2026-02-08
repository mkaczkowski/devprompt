/**
 * Types for cloud sync functionality.
 */

import type { PromptData } from './prompt';

/**
 * Cloud prompt record for upsert operations.
 * Maps to the Supabase prompts table insert/update schema.
 * Note: user_id is added by the mutation hooks.
 */
export interface CloudPromptUpsert {
  id: string;
  title: string;
  description?: string | null;
  section_count: number;
  token_count: number;
  data: PromptData;
  client_created_at: number;
  client_updated_at: number;
}
