import { create } from 'zustand';
import { devtools, persist } from 'zustand/middleware';

import { createSelectors } from '@/lib/createSelectors';
import { STORAGE_KEYS } from '@/lib/storageKeys';
import type { Preferences, PreviewFormat, Theme, ViewMode } from '@/types';

// Re-export types for backward compatibility
export type { Preferences, Theme } from '@/types';

interface PreferencesState extends Preferences {
  setTheme: (theme: Theme) => void;
  toggleTheme: () => void;
  setPreviewFormat: (format: PreviewFormat) => void;
  setViewModes: (modes: ViewMode[]) => void;
  reset: () => void;
  /**
   * Get the resolved theme (light/dark) based on system preference when theme is 'system'
   */
  getResolvedTheme: () => 'light' | 'dark';
}

const initialState: Preferences = {
  theme: 'system',
  previewFormat: 'markdown',
  viewModes: [],
};

/**
 * Get the system's preferred color scheme
 */
function getSystemTheme(): 'light' | 'dark' {
  if (typeof window === 'undefined') return 'light';
  return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
}

/** Current schema version for preferences store persistence */
const PREFERENCES_STORE_VERSION = 2;

const usePreferencesStoreBase = create<PreferencesState>()(
  devtools(
    persist(
      (set, get) => ({
        ...initialState,
        setTheme: (theme) => set({ theme }, undefined, 'preferences/setTheme'),
        toggleTheme: () =>
          set(
            (state) => {
              const resolved = state.theme === 'system' ? getSystemTheme() : state.theme;
              return { theme: resolved === 'light' ? 'dark' : 'light' };
            },
            undefined,
            'preferences/toggleTheme',
          ),
        setPreviewFormat: (previewFormat) => set({ previewFormat }, undefined, 'preferences/setPreviewFormat'),
        setViewModes: (viewModes) => set({ viewModes }, undefined, 'preferences/setViewModes'),
        reset: () => set(initialState, undefined, 'preferences/reset'),
        getResolvedTheme: () => {
          const { theme } = get();
          return theme === 'system' ? getSystemTheme() : theme;
        },
      }),
      {
        name: STORAGE_KEYS.preferences,
        version: PREFERENCES_STORE_VERSION,
        partialize: (state): Preferences => ({
          theme: state.theme,
          previewFormat: state.previewFormat,
          viewModes: state.viewModes,
        }),
        migrate: (persisted, version) => {
          const state = persisted as Preferences & { libraryViewMode?: string };
          if (version === 0 || version === 1) {
            // v0/v1 → v2: Remove deprecated libraryViewMode
            // eslint-disable-next-line @typescript-eslint/no-unused-vars
            const { libraryViewMode, ...rest } = state;
            return rest as Preferences;
          }
          return state as Preferences;
        },
        onRehydrateStorage: () => (_state, error) => {
          if (error) {
            console.error('Failed to hydrate preferences store:', error);
          }
        },
      },
    ),
    { name: 'preferences', enabled: process.env.NODE_ENV === 'development' },
  ),
);

/** Preferences store with auto-generated selectors */
export const usePreferencesStore = createSelectors(usePreferencesStoreBase);

/**
 * Initialize multi-tab sync for preferences.
 * Call this once at app startup.
 */
export function initPreferencesSync(): () => void {
  if (typeof window === 'undefined') return () => {};

  const handleStorage = (e: StorageEvent) => {
    if (e.key === STORAGE_KEYS.preferences && e.newValue) {
      try {
        const parsed = JSON.parse(e.newValue);
        if (parsed.state) {
          usePreferencesStore.setState(parsed.state);
        }
      } catch {
        // Ignore parse errors
      }
    }
  };

  window.addEventListener('storage', handleStorage);

  return () => {
    window.removeEventListener('storage', handleStorage);
  };
}
