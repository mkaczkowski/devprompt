import { calculateSectionsTokenCount } from '@/lib/estimateTokens';
import { savePromptData } from '@/lib/promptStorage';
import type { PromptData, Section } from '@/types';

/**
 * Create default prompt data with a single empty section.
 */
export function createDefaultPromptData(): PromptData {
  const defaultSection: Section = {
    id: crypto.randomUUID(),
    title: '',
    content: '',
    enabled: true,
    collapsed: false,
  };

  return {
    title: 'Untitled Prompt',
    sections: [defaultSection],
  };
}

/**
 * Create a new prompt with default data, save it, and return the ID.
 */
export function createAndSavePrompt(
  addPrompt: (metadata: { title: string; sectionCount: number; tokenCount: number }) => string,
): string {
  const promptData = createDefaultPromptData();

  const newId = addPrompt({
    title: promptData.title ?? 'Untitled Prompt',
    sectionCount: promptData.sections.length,
    tokenCount: calculateSectionsTokenCount(promptData.sections),
  });

  savePromptData(newId, promptData);
  return newId;
}
