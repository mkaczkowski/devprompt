/**
 * Keyboard shortcut configuration.
 * Uses modifier notation: mod = Cmd on Mac, Ctrl on Windows/Linux
 *
 * Shortcuts are disabled in form inputs and contentEditable elements by default.
 */

/**
 * Application keyboard shortcuts configuration.
 * Used by useKeyboardShortcuts hook.
 */
export const KEYBOARD_SHORTCUTS = {
  /** Copy prompt to clipboard */
  copy: 'mod+enter',
  /** Open new prompt dialog */
  newPrompt: 'mod+alt+n',
} as const;

export type ShortcutKey = keyof typeof KEYBOARD_SHORTCUTS;

/**
 * Detects if the current platform is macOS/iOS.
 */
export function isMacPlatform(): boolean {
  if (typeof navigator === 'undefined') return false;
  return /Mac|iPod|iPhone|iPad/.test(navigator.platform);
}

/**
 * Returns a platform-aware human-readable label for a keyboard shortcut.
 * On Mac: uses ⌘ and ⌥ symbols
 * On Windows/Linux: uses Ctrl and Alt text
 *
 * @param shortcut - The shortcut key from KEYBOARD_SHORTCUTS
 * @returns Human-readable label like "⌘+Enter" or "Ctrl+Enter"
 */
export function getShortcutLabel(shortcut: ShortcutKey): string {
  const isMac = isMacPlatform();
  const modifier = isMac ? '⌘' : 'Ctrl';
  const optionKey = isMac ? '⌥' : 'Alt';

  const labels: Record<ShortcutKey, string> = {
    copy: `${modifier}+Enter`,
    newPrompt: `${modifier}+${optionKey}+N`,
  };

  return labels[shortcut];
}

/**
 * Returns an array of key labels for rendering with Kbd components.
 * On Mac: uses ⌘ and ⌥ symbols
 * On Windows/Linux: uses Ctrl and Alt text
 *
 * @param shortcut - The shortcut key from KEYBOARD_SHORTCUTS
 * @returns Array of key labels like ['⌘', 'Enter'] or ['Ctrl', 'Enter']
 */
export function getShortcutKeys(shortcut: ShortcutKey): string[] {
  const isMac = isMacPlatform();
  const modifier = isMac ? '⌘' : 'Ctrl';
  const optionKey = isMac ? '⌥' : 'Alt';

  const keys: Record<ShortcutKey, string[]> = {
    copy: [modifier, 'Enter'],
    newPrompt: [modifier, optionKey, 'N'],
  };

  return keys[shortcut];
}
