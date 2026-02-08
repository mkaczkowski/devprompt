/**
 * Mock prompt fixtures for testing.
 * Used by MSW handlers to simulate Supabase responses.
 */

import { MOCK_USER } from '../constants';

import type { CloudPrompt } from '@/types/database';
import type { PromptData } from '@/types/prompt';

/** Counter for unique ID generation */
let idCounter = 0;

/** Sample prompt data for testing */
const samplePromptData: PromptData = {
  title: 'Test Prompt',
  sections: [
    {
      id: 'section_1',
      title: 'Introduction',
      content: 'This is a test section.',
      enabled: true,
      collapsed: false,
    },
  ],
  tokenCount: 10,
};

/**
 * Sample prompts for MSW handlers.
 * Starts empty - prompts are added via mock upserts.
 */
export const mockPrompts: CloudPrompt[] = [];

/**
 * Create a cloud prompt with optional overrides.
 */
export function createCloudPrompt(overrides: Partial<CloudPrompt> = {}): CloudPrompt {
  const now = new Date().toISOString();
  const clientNow = Date.now();
  return {
    id: `prompt_${Date.now()}_${idCounter++}`,
    user_id: MOCK_USER.id,
    title: 'Test Prompt',
    description: null,
    section_count: 1,
    token_count: 10,
    data: samplePromptData as unknown as CloudPrompt['data'],
    created_at: now,
    updated_at: now,
    client_created_at: clientNow,
    client_updated_at: clientNow,
    share_token: null,
    shared_at: null,
    ...overrides,
  };
}

/**
 * Create multiple prompts for the mock user.
 */
export function createPrompts(count: number, overrides: Partial<CloudPrompt> = {}): CloudPrompt[] {
  return Array.from({ length: count }, (_, i) =>
    createCloudPrompt({
      id: `prompt_${i + 1}`,
      title: `Prompt ${i + 1}`,
      ...overrides,
    }),
  );
}

/**
 * Reset mock prompts to empty state.
 */
export function resetMockPrompts(): void {
  mockPrompts.length = 0;
}

/**
 * Add a prompt to the mock store.
 */
export function addMockPrompt(prompt: CloudPrompt): void {
  const existingIndex = mockPrompts.findIndex((p) => p.id === prompt.id && p.user_id === prompt.user_id);
  if (existingIndex >= 0) {
    mockPrompts[existingIndex] = prompt;
  } else {
    mockPrompts.push(prompt);
  }
}

/**
 * Remove a prompt from the mock store.
 */
export function removeMockPrompt(userId: string, promptId: string): boolean {
  const index = mockPrompts.findIndex((p) => p.id === promptId && p.user_id === userId);
  if (index >= 0) {
    mockPrompts.splice(index, 1);
    return true;
  }
  return false;
}
