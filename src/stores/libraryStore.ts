import { useMemo } from 'react';
import { create } from 'zustand';
import { devtools, persist } from 'zustand/middleware';
import { useShallow } from 'zustand/react/shallow';

import { createSelectors } from '@/lib/createSelectors';
import type { DateGroup } from '@/lib/dateGroups';
import { groupPromptsByDate } from '@/lib/dateGroups';
import { calculateSectionsTokenCount } from '@/lib/estimateTokens';
import { deletePromptData, loadPromptData, savePromptData } from '@/lib/promptStorage';
import { STORAGE_KEYS } from '@/lib/storageKeys';
import type { DeletedPromptResult, PromptData, PromptMetadata, SortDirection, SortOption } from '@/types';

interface LibraryState {
  prompts: PromptMetadata[];
  searchQuery: string;
  sortBy: SortOption;
  sortDirection: SortDirection;
}

/**
 * Module-level flag to track cloud sync operations.
 * Using a module variable instead of state avoids subscription timing issues.
 */
let _isCloudSyncInProgress = false;

/** Check if a cloud sync operation is in progress */
export function isCloudSyncInProgress(): boolean {
  return _isCloudSyncInProgress;
}

interface LibraryActions {
  refreshPrompts: () => void;
  setSearchQuery: (query: string) => void;
  setSortBy: (sortBy: SortOption) => void;
  setSortDirection: (direction: SortDirection) => void;
  deletePrompt: (id: string) => DeletedPromptResult | null;
  restorePrompt: (id: string, data: PromptData) => void;
  duplicatePrompt: (id: string) => string;
  exportPrompt: (id: string, title: string) => void;
  canDelete: (id: string) => boolean;
  addPrompt: (metadata: Omit<PromptMetadata, 'id' | 'createdAt' | 'updatedAt'>) => string;
  updatePrompt: (id: string, updates: Partial<Omit<PromptMetadata, 'id'>>) => void;
  reset: () => void;
  /** Add prompts from cloud sync (doesn't trigger re-sync to cloud) */
  addPromptsFromCloud: (prompts: PromptMetadata[]) => void;
  /** Update prompts from cloud sync (doesn't trigger re-sync to cloud) */
  updatePromptsFromCloud: (prompts: PromptMetadata[]) => void;
}

type LibraryStore = LibraryState & LibraryActions;

const initialState: LibraryState = {
  prompts: [],
  searchQuery: '',
  sortBy: 'dateModified',
  sortDirection: 'desc',
};

/**
 * Generate a unique ID for prompts.
 */
function generateId(): string {
  return crypto.randomUUID();
}

/** Current schema version for library store persistence */
const LIBRARY_STORE_VERSION = 2;

const useLibraryStoreBase = create<LibraryStore>()(
  devtools(
    persist(
      (set, get) => ({
        ...initialState,

        refreshPrompts: () => {
          // This would typically load from an API or scan localStorage
          // For now, it's a no-op since prompts are managed via add/delete
          set((state) => ({ prompts: [...state.prompts] }), undefined, 'library/refreshPrompts');
        },

        setSearchQuery: (query) => set({ searchQuery: query }, undefined, 'library/setSearchQuery'),

        setSortBy: (sortBy) =>
          set({ sortBy, sortDirection: sortBy === 'dateModified' ? 'desc' : 'asc' }, undefined, 'library/setSortBy'),

        setSortDirection: (direction) => set({ sortDirection: direction }, undefined, 'library/setSortDirection'),

        deletePrompt: (id) => {
          const state = get();
          const prompt = state.prompts.find((p) => p.id === id);
          if (!prompt) return null;

          // Load the full data before deleting
          const data = loadPromptData(id);
          if (!data) return null;

          // Remove from library
          set({ prompts: state.prompts.filter((p) => p.id !== id) }, undefined, 'library/deletePrompt');

          // Delete from localStorage
          deletePromptData(id);

          return { id, data };
        },

        restorePrompt: (id, data) => {
          const state = get();
          const existingPrompt = state.prompts.find((p) => p.id === id);

          if (existingPrompt) {
            // Prompt metadata exists, just restore the data
            savePromptData(id, data);
          } else {
            // Re-add metadata to library with section and token counts
            const now = Date.now();
            set(
              {
                prompts: [
                  ...state.prompts,
                  {
                    id,
                    title: data.title ?? 'Untitled',
                    createdAt: now,
                    updatedAt: now,
                    sectionCount: data.sections.length,
                    tokenCount: calculateSectionsTokenCount(data.sections),
                  },
                ],
              },
              undefined,
              'library/restorePrompt',
            );
            savePromptData(id, data);
          }
        },

        duplicatePrompt: (id) => {
          const state = get();
          const original = state.prompts.find((p) => p.id === id);
          if (!original) return '';

          const data = loadPromptData(id);
          if (!data) return '';

          const newId = generateId();
          const now = Date.now();
          const newSections = data.sections.map((s) => ({ ...s, id: crypto.randomUUID() }));

          // Add to library with section and token counts
          set(
            {
              prompts: [
                ...state.prompts,
                {
                  id: newId,
                  title: `${original.title} (Copy)`,
                  description: original.description,
                  createdAt: now,
                  updatedAt: now,
                  sectionCount: newSections.length,
                  tokenCount: calculateSectionsTokenCount(newSections),
                },
              ],
            },
            undefined,
            'library/duplicatePrompt',
          );

          // Save the data
          savePromptData(newId, {
            title: `${data.title} (Copy)`,
            sections: newSections,
          });

          return newId;
        },

        exportPrompt: (id, title) => {
          const data = loadPromptData(id);
          if (!data) return;

          // Create and download a JSON file
          const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
          const url = URL.createObjectURL(blob);
          const a = document.createElement('a');
          a.href = url;
          a.download = `${title.replace(/[^a-z0-9]/gi, '_')}.json`;
          document.body.appendChild(a);
          a.click();
          document.body.removeChild(a);
          URL.revokeObjectURL(url);
        },

        canDelete: (id) => {
          const state = get();
          return state.prompts.some((p) => p.id === id);
        },

        addPrompt: (metadata) => {
          const id = generateId();
          const now = Date.now();

          set(
            (state) => ({
              prompts: [
                ...state.prompts,
                {
                  ...metadata,
                  id,
                  createdAt: now,
                  updatedAt: now,
                },
              ],
            }),
            undefined,
            'library/addPrompt',
          );

          // Initialize empty prompt data
          savePromptData(id, { title: metadata.title, sections: [] });

          return id;
        },

        updatePrompt: (id, updates) =>
          set(
            (state) => ({
              prompts: state.prompts.map((p) => (p.id === id ? { ...p, ...updates, updatedAt: Date.now() } : p)),
            }),
            undefined,
            'library/updatePrompt',
          ),

        reset: () => set(initialState, undefined, 'library/reset'),

        addPromptsFromCloud: (prompts) => {
          _isCloudSyncInProgress = true;
          set(
            (state) => ({
              prompts: [
                ...state.prompts,
                ...prompts.filter((p) => !state.prompts.some((existing) => existing.id === p.id)),
              ],
            }),
            undefined,
            'library/addPromptsFromCloud',
          );
          _isCloudSyncInProgress = false;
        },

        updatePromptsFromCloud: (updates) => {
          _isCloudSyncInProgress = true;
          set(
            (state) => ({
              prompts: state.prompts.map((p) => {
                const update = updates.find((u) => u.id === p.id);
                return update ? { ...p, ...update } : p;
              }),
            }),
            undefined,
            'library/updatePromptsFromCloud',
          );
          _isCloudSyncInProgress = false;
        },
      }),
      {
        name: STORAGE_KEYS.library,
        version: LIBRARY_STORE_VERSION,
        partialize: (state): Pick<LibraryState, 'prompts' | 'sortBy' | 'sortDirection'> => ({
          prompts: state.prompts,
          sortBy: state.sortBy,
          sortDirection: state.sortDirection,
        }),
        migrate: (persisted, version) => {
          let state = persisted as Pick<LibraryState, 'prompts' | 'sortBy' | 'sortDirection'>;
          if (version === 0) {
            // v0 → v1: Ensure sortDirection exists with default value
            state = { ...state, sortDirection: state.sortDirection ?? 'desc' };
          }
          if (version <= 1) {
            // v1 → v2: Reset to dateModified desc so date grouping is visible by default
            state = { ...state, sortBy: 'dateModified', sortDirection: 'desc' };
          }
          return state;
        },
        onRehydrateStorage: () => (_state, error) => {
          if (error) {
            console.error('Failed to hydrate library store:', error);
          }
        },
      },
    ),
    { name: 'library', enabled: process.env.NODE_ENV === 'development' },
  ),
);

/** Library store with auto-generated selectors */
export const useLibraryStore = createSelectors(useLibraryStoreBase);

/**
 * Check if a prompt matches the search query.
 */
function matchesSearch(prompt: PromptMetadata, query: string): boolean {
  if (!query.trim()) return true;
  const searchLower = query.toLowerCase();
  return (
    prompt.title.toLowerCase().includes(searchLower) ||
    (prompt.description?.toLowerCase().includes(searchLower) ?? false)
  );
}

/**
 * Sort prompts by the specified field and direction.
 */
function sortPrompts(a: PromptMetadata, b: PromptMetadata, sortBy: SortOption, direction: SortDirection): number {
  let comparison = 0;

  if (sortBy === 'name') {
    comparison = a.title.localeCompare(b.title);
  } else if (sortBy === 'dateModified') {
    comparison = a.updatedAt - b.updatedAt;
  }

  return direction === 'asc' ? comparison : -comparison;
}

/**
 * Hook that returns filtered and sorted prompts based on library state.
 * Uses useShallow to prevent unnecessary re-renders when unrelated state changes.
 */
export function useFilteredPrompts(): PromptMetadata[] {
  const { prompts, searchQuery, sortBy, sortDirection } = useLibraryStore(
    useShallow((state) => ({
      prompts: state.prompts,
      searchQuery: state.searchQuery,
      sortBy: state.sortBy,
      sortDirection: state.sortDirection,
    })),
  );

  return useMemo(() => {
    return prompts
      .filter((p) => matchesSearch(p, searchQuery))
      .sort((a, b) => sortPrompts(a, b, sortBy, sortDirection));
  }, [prompts, searchQuery, sortBy, sortDirection]);
}

/**
 * Discriminated union for prompt list data.
 * Grouped when sorted by date, flat when sorted by name.
 */
export type PromptListData = { grouped: true; groups: DateGroup[] } | { grouped: false; prompts: PromptMetadata[] };

/**
 * Hook that returns grouped prompts when sorted by date, flat list when sorted by name.
 * Uses useShallow to prevent unnecessary re-renders.
 */
export function useGroupedPrompts(): PromptListData {
  const { prompts, searchQuery, sortBy, sortDirection } = useLibraryStore(
    useShallow((state) => ({
      prompts: state.prompts,
      searchQuery: state.searchQuery,
      sortBy: state.sortBy,
      sortDirection: state.sortDirection,
    })),
  );

  return useMemo(() => {
    const filtered = prompts.filter((p) => matchesSearch(p, searchQuery));

    if (sortBy === 'dateModified') {
      return { grouped: true, groups: groupPromptsByDate(filtered, sortDirection) };
    }

    const sorted = [...filtered].sort((a, b) => sortPrompts(a, b, sortBy, sortDirection));
    return { grouped: false, prompts: sorted };
  }, [prompts, searchQuery, sortBy, sortDirection]);
}

// Re-export types for convenience
export type { DeletedPromptResult } from '@/types';
