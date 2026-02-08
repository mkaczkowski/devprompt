// State management hooks
export { useLocalStorage } from './useLocalStorage';
export { useSyncedState } from './useSyncedState';
export { useSyncedFormData } from './useSyncedFormData';
export { useEditorState } from './useEditorState';

// Timing and feedback hooks
export { useDebouncedCallback } from './useDebouncedCallback';
export { useCopyFeedback } from './useCopyFeedback';

// File handling hooks
export { useFileDrop } from './useFileDrop';

// Browser and DOM hooks
export { useMediaQuery, BREAKPOINTS, useIsMobile, useIsDesktop } from './useMediaQuery';
export { useDocumentTitle } from './useDocumentTitle';
export { useIOSViewportReset } from './useIOSViewportReset';
export { usePullToRefresh } from './usePullToRefresh';

// UI and responsive hooks
export { useTouchSizes } from './useTouchSizes';
export { useThemeEffect } from './useThemeEffect';

// i18n hooks
export { useLanguage, type SupportedLocale } from './useLanguage';

// Keyboard hooks
export { useKeyboardShortcuts } from './useKeyboardShortcuts';

// Supabase hooks
export {
  useSupabaseQuery,
  useCurrentProfile,
  useProfile,
  useUpsertProfile,
  useUpdateProfile,
  useDeleteProfile,
} from './supabase';

// Share hooks
export { useShareAction, type UseShareActionReturn } from './useShareAction';

// Re-exported from contexts for convenience
export { useMobileContext } from '@/contexts/mobileContext';
