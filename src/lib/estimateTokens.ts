import type { Section } from '@/types';

/**
 * Average characters per token for English text.
 * This is a rough approximation; actual tokenization varies by model.
 */
const CHARS_PER_TOKEN = 4;

/**
 * Estimate token count for a string using character-based approximation.
 * For more accurate counts, use a tokenizer library like tiktoken.
 */
export function estimateTokens(text: string): number {
  if (!text) return 0;
  return Math.ceil(text.length / CHARS_PER_TOKEN);
}

/**
 * Calculate total token count for a section (title + content).
 */
export function calculateSectionTokenCount(section: Section): number {
  const titleTokens = estimateTokens(section.title);
  const contentTokens = estimateTokens(section.content);
  return titleTokens + contentTokens;
}

/**
 * Calculate total token count for all enabled sections.
 */
export function calculateSectionsTokenCount(sections: Section[]): number {
  return sections
    .filter((section) => section.enabled)
    .reduce((total, section) => total + calculateSectionTokenCount(section), 0);
}
