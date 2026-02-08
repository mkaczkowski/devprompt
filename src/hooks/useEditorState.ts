import { useLibraryStore } from '@/stores/libraryStore';
import { usePreferencesStore } from '@/stores/preferencesStore';
import { usePromptStore } from '@/stores/promptStore';

/**
 * Hook that aggregates editor-related store state and actions.
 * Reduces boilerplate in Editor.tsx by providing a single source for editor state.
 */
export function useEditorState() {
  // Prompt store
  const loadPrompt = usePromptStore((state) => state.loadPrompt);
  const promptTitle = usePromptStore((state) => state.promptTitle);
  const sections = usePromptStore((state) => state.sections);
  const setPromptTitle = usePromptStore((state) => state.setPromptTitle);

  // Preferences store
  const viewModes = usePreferencesStore((state) => state.viewModes);
  const previewFormat = usePreferencesStore((state) => state.previewFormat);

  // Library store
  const addPrompt = useLibraryStore((state) => state.addPrompt);
  const updatePrompt = useLibraryStore((state) => state.updatePrompt);

  return {
    // State
    promptTitle,
    sections,
    viewModes,
    previewFormat,
    // Actions
    loadPrompt,
    setPromptTitle,
    addPrompt,
    updatePrompt,
  };
}
