import { renderHook } from '@testing-library/react';
import { useHotkeys } from 'react-hotkeys-hook';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import { useKeyboardShortcuts } from './useKeyboardShortcuts';

import { KEYBOARD_SHORTCUTS } from '@/lib/keyboardShortcuts';

// Mock react-hotkeys-hook
vi.mock('react-hotkeys-hook', () => ({
  useHotkeys: vi.fn(),
}));

describe('useKeyboardShortcuts', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  afterEach(() => {
    vi.clearAllMocks();
  });

  it('registers both shortcut handlers', () => {
    const handlers = {
      onCopy: vi.fn(),
      onNewPrompt: vi.fn(),
    };

    renderHook(() => useKeyboardShortcuts(handlers));

    expect(useHotkeys).toHaveBeenCalledTimes(2);
  });

  it('uses correct key combinations from KEYBOARD_SHORTCUTS', () => {
    const handlers = {
      onCopy: vi.fn(),
      onNewPrompt: vi.fn(),
    };

    renderHook(() => useKeyboardShortcuts(handlers));

    // Check that each shortcut is registered with correct key combination (4 args: key, handler, options, deps)
    expect(useHotkeys).toHaveBeenCalledWith(
      KEYBOARD_SHORTCUTS.copy,
      expect.any(Function),
      expect.any(Object),
      expect.any(Array),
    );
    expect(useHotkeys).toHaveBeenCalledWith(
      KEYBOARD_SHORTCUTS.newPrompt,
      expect.any(Function),
      expect.any(Object),
      expect.any(Array),
    );
  });

  it('disables shortcuts in form inputs', () => {
    const handlers = {
      onCopy: vi.fn(),
      onNewPrompt: vi.fn(),
    };

    renderHook(() => useKeyboardShortcuts(handlers));

    // Check options passed to useHotkeys include enableOnFormTags: false
    const calls = vi.mocked(useHotkeys).mock.calls;
    calls.forEach((call) => {
      const options = call[2];
      expect(options).toHaveProperty('enableOnFormTags', false);
    });
  });

  it('prevents default browser behavior', () => {
    const handlers = {
      onCopy: vi.fn(),
      onNewPrompt: vi.fn(),
    };

    renderHook(() => useKeyboardShortcuts(handlers));

    // Check options passed to useHotkeys include preventDefault: true
    const calls = vi.mocked(useHotkeys).mock.calls;
    calls.forEach((call) => {
      const options = call[2];
      expect(options).toHaveProperty('preventDefault', true);
    });
  });

  it('calls handler when shortcut is triggered', () => {
    const onCopy = vi.fn();
    const handlers = {
      onCopy,
      onNewPrompt: vi.fn(),
    };

    renderHook(() => useKeyboardShortcuts(handlers));

    // Get the callback registered for the copy shortcut
    const calls = vi.mocked(useHotkeys).mock.calls;
    const copyCall = calls.find((call) => call[0] === KEYBOARD_SHORTCUTS.copy);

    if (copyCall) {
      const callback = copyCall[1] as () => void;
      callback();
      expect(onCopy).toHaveBeenCalledTimes(1);
    }
  });

  it('enables shortcuts by default', () => {
    const handlers = {
      onCopy: vi.fn(),
      onNewPrompt: vi.fn(),
    };

    renderHook(() => useKeyboardShortcuts(handlers));

    const calls = vi.mocked(useHotkeys).mock.calls;
    calls.forEach((call) => {
      const options = call[2];
      expect(options).toHaveProperty('enabled', true);
    });
  });

  it('disables shortcuts when enabled is false', () => {
    const handlers = {
      onCopy: vi.fn(),
      onNewPrompt: vi.fn(),
      enabled: false,
    };

    renderHook(() => useKeyboardShortcuts(handlers));

    const calls = vi.mocked(useHotkeys).mock.calls;
    calls.forEach((call) => {
      const options = call[2];
      expect(options).toHaveProperty('enabled', false);
    });
  });
});
