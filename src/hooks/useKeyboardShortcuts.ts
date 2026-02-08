import { useHotkeys } from 'react-hotkeys-hook';

import { KEYBOARD_SHORTCUTS } from '@/lib/keyboardShortcuts';

interface KeyboardShortcutHandlers {
  /** Handler for copy to clipboard (Cmd/Ctrl + Enter) */
  onCopy: () => void;
  /** Handler for opening new prompt dialog (Cmd/Ctrl + Alt + N) */
  onNewPrompt: () => void;
  /** Whether shortcuts are enabled (default: true). Set to false on mobile. */
  enabled?: boolean;
}

/**
 * Registers global keyboard shortcuts with platform-aware modifiers.
 *
 * Shortcuts are disabled in form inputs and contentEditable elements.
 *
 * @param handlers - Handler functions for each shortcut
 */
export function useKeyboardShortcuts(handlers: KeyboardShortcutHandlers): void {
  const { onCopy, onNewPrompt, enabled = true } = handlers;

  const hotkeyOptions = {
    enableOnFormTags: false,
    preventDefault: true,
    enabled,
  } as const;

  useHotkeys(KEYBOARD_SHORTCUTS.copy, onCopy, hotkeyOptions, [onCopy, enabled]);
  useHotkeys(KEYBOARD_SHORTCUTS.newPrompt, onNewPrompt, hotkeyOptions, [onNewPrompt, enabled]);
}
