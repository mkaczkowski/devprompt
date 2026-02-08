import { calculateSectionsTokenCount, estimateTokens } from './estimateTokens';
import { STORAGE_KEYS } from './storageKeys';

import type { PromptData, Section } from '@/types';

/**
 * Type guard to validate Section objects loaded from storage.
 * Required fields: id, title, content, enabled, collapsed
 */
function isValidSection(obj: unknown): obj is Section {
  if (typeof obj !== 'object' || obj === null) return false;
  const section = obj as Record<string, unknown>;
  return (
    typeof section.id === 'string' &&
    typeof section.title === 'string' &&
    typeof section.content === 'string' &&
    typeof section.enabled === 'boolean' &&
    typeof section.collapsed === 'boolean'
  );
}

/**
 * Load prompt data from localStorage.
 * Returns null if the prompt doesn't exist or data is invalid.
 * Invalid sections are filtered out with a warning.
 */
export function loadPromptData(promptId: string): PromptData | null {
  if (typeof window === 'undefined') return null;

  try {
    const key = STORAGE_KEYS.prompt(promptId);
    const raw = localStorage.getItem(key);
    if (!raw) return null;

    const parsed: unknown = JSON.parse(raw);

    // Validate structure and return typed data
    if (parsed && typeof parsed === 'object' && 'sections' in parsed) {
      const obj = parsed as {
        title?: string;
        sections: unknown;
        instructions?: string;
        instructionsCollapsed?: boolean;
        tokenCount?: number;
      };
      if (Array.isArray(obj.sections)) {
        const validSections = obj.sections.filter(isValidSection);
        const invalidCount = obj.sections.length - validSections.length;
        if (invalidCount > 0) {
          console.warn(`Filtered out ${invalidCount} invalid section(s) from prompt "${promptId}"`);
        }
        return {
          title: typeof obj.title === 'string' ? obj.title : undefined,
          sections: validSections,
          instructions: typeof obj.instructions === 'string' ? obj.instructions : undefined,
          instructionsCollapsed: typeof obj.instructionsCollapsed === 'boolean' ? obj.instructionsCollapsed : undefined,
          tokenCount: typeof obj.tokenCount === 'number' ? obj.tokenCount : undefined,
        };
      }
    }
    return null;
  } catch (error) {
    console.warn('Failed to load prompt data:', error);
    return null;
  }
}

/**
 * Save prompt data to localStorage.
 * Token count is recalculated on every save.
 */
export function savePromptData(promptId: string, data: Omit<PromptData, 'tokenCount'>): void {
  if (typeof window === 'undefined') return;

  try {
    const key = STORAGE_KEYS.prompt(promptId);
    // Calculate and cache token count on every save (includes instructions)
    const sectionsTokens = calculateSectionsTokenCount(data.sections);
    const instructionsTokens = data.instructions ? estimateTokens(data.instructions) : 0;
    const tokenCount = sectionsTokens + instructionsTokens;
    const dataWithTokens: PromptData = { ...data, tokenCount };
    localStorage.setItem(key, JSON.stringify(dataWithTokens));
  } catch (error) {
    console.error('Failed to save prompt data:', error);
  }
}

/**
 * Delete prompt data from localStorage.
 */
export function deletePromptData(promptId: string): void {
  if (typeof window === 'undefined') return;

  try {
    const key = STORAGE_KEYS.prompt(promptId);
    localStorage.removeItem(key);
  } catch (error) {
    console.error('Failed to delete prompt data:', error);
  }
}

/**
 * Get the effective title for display.
 * Returns explicit title if set, otherwise derives from first section.
 */
export function getEffectiveTitle(data: PromptData): string {
  if (data.title) return data.title;
  if (data.sections.length > 0 && data.sections[0].title) {
    return data.sections[0].title;
  }
  return 'Untitled';
}

/**
 * Check if prompt has an explicit title (not derived from sections).
 */
export function hasCustomTitle(data: PromptData): boolean {
  return data.title !== undefined && data.title.length > 0;
}
