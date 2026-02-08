/**
 * Centralized timing constants for consistent UX across the application.
 * Use these instead of magic numbers to ensure consistency.
 */
export const TIMING = {
  /** Debounce delay for user input in milliseconds */
  DEBOUNCE_DELAY: 300,
  /** Duration to show "Copied!" feedback in milliseconds */
  COPY_FEEDBACK_DURATION: 2000,
  /** Debounce delay for cloud sync operations in milliseconds */
  SYNC_DEBOUNCE_DELAY: 1000,
} as const;
