import { arrayMove } from '@dnd-kit/sortable';
import { create } from 'zustand';
import { devtools, subscribeWithSelector } from 'zustand/middleware';

import { createSelectors } from '@/lib/createSelectors';
import { calculateSectionsTokenCount, estimateTokens } from '@/lib/estimateTokens';
import { loadPromptData, savePromptData } from '@/lib/promptStorage';
import { useLibraryStore } from '@/stores/libraryStore';
import type { RemovedSectionResult, Section, SectionInitialData } from '@/types';

interface PromptState {
  promptId: string | null;
  promptTitle: string | undefined;
  sections: Section[];
  newSectionId: string | null;
  instructions: string;
  instructionsCollapsed: boolean;
}

interface PromptActions {
  loadPrompt: (promptId: string | undefined) => void;
  setPromptTitle: (title: string | undefined) => void;
  toggleEnabled: (id: string) => void;
  toggleCollapsed: (id: string) => void;
  toggleAllCollapsed: () => void;
  removeSection: (id: string) => RemovedSectionResult | null;
  restoreSection: (section: Section, index: number) => void;
  updateContent: (id: string, content: string) => void;
  updateTitle: (id: string, title: string) => void;
  addSection: (initialData?: SectionInitialData) => void;
  duplicateSection: (id: string) => void;
  reorderSections: (activeId: string, overId: string) => void;
  setSections: (sections: Section[]) => void;
  updateInstructions: (content: string) => void;
  toggleInstructionsCollapsed: () => void;
  reset: () => void;
}

type PromptStore = PromptState & PromptActions;

const initialState: PromptState = {
  promptId: null,
  promptTitle: undefined,
  sections: [],
  newSectionId: null,
  instructions: '',
  instructionsCollapsed: false,
};

/**
 * Generate a unique ID for sections.
 */
function generateId(): string {
  return crypto.randomUUID();
}

const usePromptStoreBase = create<PromptStore>()(
  devtools(
    subscribeWithSelector((set, get) => ({
      ...initialState,

      loadPrompt: (promptId) => {
        if (!promptId) {
          set(initialState, undefined, 'prompt/loadPrompt');
          return;
        }

        const data = loadPromptData(promptId);
        set(
          {
            promptId,
            promptTitle: data?.title,
            sections: data?.sections ?? [],
            newSectionId: null,
            instructions: data?.instructions ?? '',
            instructionsCollapsed: data?.instructionsCollapsed ?? false,
          },
          undefined,
          'prompt/loadPrompt',
        );
      },

      setPromptTitle: (title) => set({ promptTitle: title }, undefined, 'prompt/setPromptTitle'),

      toggleEnabled: (id) =>
        set(
          (state) => ({
            sections: state.sections.map((section) =>
              section.id === id ? { ...section, enabled: !section.enabled } : section,
            ),
          }),
          undefined,
          'prompt/toggleEnabled',
        ),

      toggleCollapsed: (id) =>
        set(
          (state) => ({
            sections: state.sections.map((section) =>
              section.id === id ? { ...section, collapsed: !section.collapsed } : section,
            ),
          }),
          undefined,
          'prompt/toggleCollapsed',
        ),

      toggleAllCollapsed: () =>
        set(
          (state) => {
            const allSectionsCollapsed = state.sections.length === 0 || state.sections.every((s) => s.collapsed);
            const allCollapsed = allSectionsCollapsed && state.instructionsCollapsed;
            return {
              sections: state.sections.map((section) => ({
                ...section,
                collapsed: !allCollapsed,
              })),
              instructionsCollapsed: !allCollapsed,
            };
          },
          undefined,
          'prompt/toggleAllCollapsed',
        ),

      removeSection: (id) => {
        const state = get();
        const index = state.sections.findIndex((s) => s.id === id);
        if (index === -1) return null;

        const section = state.sections[index];
        set(
          {
            sections: state.sections.filter((s) => s.id !== id),
          },
          undefined,
          'prompt/removeSection',
        );

        return { section, index };
      },

      restoreSection: (section, index) =>
        set(
          (state) => {
            const newSections = [...state.sections];
            newSections.splice(index, 0, section);
            return { sections: newSections };
          },
          undefined,
          'prompt/restoreSection',
        ),

      updateContent: (id, content) =>
        set(
          (state) => ({
            sections: state.sections.map((section) => (section.id === id ? { ...section, content } : section)),
          }),
          undefined,
          'prompt/updateContent',
        ),

      updateTitle: (id, title) =>
        set(
          (state) => ({
            sections: state.sections.map((section) => (section.id === id ? { ...section, title } : section)),
          }),
          undefined,
          'prompt/updateTitle',
        ),

      addSection: (initialData) => {
        const newId = generateId();
        set(
          (state) => ({
            sections: [
              ...state.sections,
              {
                id: newId,
                title: initialData?.title ?? '',
                content: initialData?.content ?? '',
                enabled: true,
                collapsed: false,
              },
            ],
            newSectionId: newId,
          }),
          undefined,
          'prompt/addSection',
        );
      },

      duplicateSection: (id) => {
        const state = get();
        const section = state.sections.find((s) => s.id === id);
        if (!section) return;

        const newId = generateId();
        const index = state.sections.findIndex((s) => s.id === id);

        set(
          {
            sections: [
              ...state.sections.slice(0, index + 1),
              { ...section, id: newId, title: `${section.title} (copy)` },
              ...state.sections.slice(index + 1),
            ],
            newSectionId: newId,
          },
          undefined,
          'prompt/duplicateSection',
        );
      },

      reorderSections: (activeId, overId) =>
        set(
          (state) => {
            const oldIndex = state.sections.findIndex((s) => s.id === activeId);
            const newIndex = state.sections.findIndex((s) => s.id === overId);
            if (oldIndex === -1 || newIndex === -1) return state;

            return {
              sections: arrayMove(state.sections, oldIndex, newIndex),
            };
          },
          undefined,
          'prompt/reorderSections',
        ),

      setSections: (sections) => set({ sections, newSectionId: null }, undefined, 'prompt/setSections'),

      updateInstructions: (content) => set({ instructions: content }, undefined, 'prompt/updateInstructions'),

      toggleInstructionsCollapsed: () =>
        set(
          (state) => ({ instructionsCollapsed: !state.instructionsCollapsed }),
          undefined,
          'prompt/toggleInstructionsCollapsed',
        ),

      reset: () => set(initialState, undefined, 'prompt/reset'),
    })),
    { name: 'prompt', enabled: process.env.NODE_ENV === 'development' },
  ),
);

/** Prompt store with auto-generated selectors */
export const usePromptStore = createSelectors(usePromptStoreBase);

// Auto-save subscription with throttling using subscribeWithSelector
let saveTimeout: ReturnType<typeof setTimeout> | null = null;
const SAVE_DELAY = 500;

// Subscribe to changes in promptId, promptTitle, sections, and instructions
usePromptStoreBase.subscribe(
  (state) => ({
    promptId: state.promptId,
    promptTitle: state.promptTitle,
    sections: state.sections,
    instructions: state.instructions,
    instructionsCollapsed: state.instructionsCollapsed,
  }),
  ({ promptId, promptTitle, sections, instructions, instructionsCollapsed }, prev) => {
    // Only save if we have a promptId and something changed
    if (!promptId) return;
    if (
      sections === prev.sections &&
      promptTitle === prev.promptTitle &&
      instructions === prev.instructions &&
      instructionsCollapsed === prev.instructionsCollapsed
    )
      return;
    if (sections.length === 0 && !instructions?.trim()) return; // Don't save empty state

    // Throttle saves
    if (saveTimeout) clearTimeout(saveTimeout);
    saveTimeout = setTimeout(() => {
      savePromptData(promptId, {
        title: promptTitle,
        sections,
        instructions,
        instructionsCollapsed,
      });

      // Sync metadata (tokenCount, sectionCount) to the library store
      const sectionsTokens = calculateSectionsTokenCount(sections);
      const instructionsTokens = instructions ? estimateTokens(instructions) : 0;
      useLibraryStore.getState().updatePrompt(promptId, {
        tokenCount: sectionsTokens + instructionsTokens,
        sectionCount: sections.length,
      });
    }, SAVE_DELAY);
  },
  {
    equalityFn: (a, b) =>
      a.promptId === b.promptId &&
      a.sections === b.sections &&
      a.promptTitle === b.promptTitle &&
      a.instructions === b.instructions &&
      a.instructionsCollapsed === b.instructionsCollapsed,
  },
);

// Re-export types for convenience
export type { RemovedSectionResult, SectionInitialData } from '@/types';
