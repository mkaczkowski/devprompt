import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import { getShortcutKeys, getShortcutLabel, KEYBOARD_SHORTCUTS } from './keyboardShortcuts';

describe('KEYBOARD_SHORTCUTS', () => {
  it('defines copy shortcut', () => {
    expect(KEYBOARD_SHORTCUTS.copy).toBe('mod+enter');
  });

  it('defines newPrompt shortcut', () => {
    expect(KEYBOARD_SHORTCUTS.newPrompt).toBe('mod+alt+n');
  });
});

describe('getShortcutLabel', () => {
  const originalNavigator = globalThis.navigator;

  beforeEach(() => {
    vi.stubGlobal('navigator', { platform: '' });
  });

  afterEach(() => {
    vi.stubGlobal('navigator', originalNavigator);
  });

  describe('on Mac platform', () => {
    beforeEach(() => {
      vi.stubGlobal('navigator', { platform: 'MacIntel' });
    });

    it('returns Mac symbols for copy shortcut', () => {
      expect(getShortcutLabel('copy')).toBe('⌘+Enter');
    });

    it('returns Mac symbols for newPrompt shortcut', () => {
      expect(getShortcutLabel('newPrompt')).toBe('⌘+⌥+N');
    });
  });

  describe('on Windows/Linux platform', () => {
    beforeEach(() => {
      vi.stubGlobal('navigator', { platform: 'Win32' });
    });

    it('returns Ctrl for copy shortcut', () => {
      expect(getShortcutLabel('copy')).toBe('Ctrl+Enter');
    });

    it('returns Ctrl+Alt for newPrompt shortcut', () => {
      expect(getShortcutLabel('newPrompt')).toBe('Ctrl+Alt+N');
    });
  });

  describe('on iPhone platform', () => {
    beforeEach(() => {
      vi.stubGlobal('navigator', { platform: 'iPhone' });
    });

    it('returns Mac symbols', () => {
      expect(getShortcutLabel('copy')).toBe('⌘+Enter');
    });
  });

  describe('on iPad platform', () => {
    beforeEach(() => {
      vi.stubGlobal('navigator', { platform: 'iPad' });
    });

    it('returns Mac symbols', () => {
      expect(getShortcutLabel('copy')).toBe('⌘+Enter');
    });
  });
});

describe('getShortcutKeys', () => {
  const originalNavigator = globalThis.navigator;

  beforeEach(() => {
    vi.stubGlobal('navigator', { platform: '' });
  });

  afterEach(() => {
    vi.stubGlobal('navigator', originalNavigator);
  });

  describe('on Mac platform', () => {
    beforeEach(() => {
      vi.stubGlobal('navigator', { platform: 'MacIntel' });
    });

    it('returns array of Mac keys for copy shortcut', () => {
      expect(getShortcutKeys('copy')).toEqual(['⌘', 'Enter']);
    });

    it('returns array of Mac keys for newPrompt shortcut', () => {
      expect(getShortcutKeys('newPrompt')).toEqual(['⌘', '⌥', 'N']);
    });
  });

  describe('on Windows/Linux platform', () => {
    beforeEach(() => {
      vi.stubGlobal('navigator', { platform: 'Win32' });
    });

    it('returns array of keys for copy shortcut', () => {
      expect(getShortcutKeys('copy')).toEqual(['Ctrl', 'Enter']);
    });

    it('returns array of keys for newPrompt shortcut', () => {
      expect(getShortcutKeys('newPrompt')).toEqual(['Ctrl', 'Alt', 'N']);
    });
  });
});
