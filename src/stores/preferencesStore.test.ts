import { act } from '@testing-library/react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import { STORAGE_KEYS } from '@/lib/storageKeys';
import { initPreferencesSync, usePreferencesStore } from '@/stores/preferencesStore';
import { mockMatchMedia } from '@/test';

describe('preferencesStore', () => {
  beforeEach(() => {
    usePreferencesStore.setState({
      theme: 'light',
      previewFormat: 'markdown',
      viewModes: [],
    });
    window.matchMedia = mockMatchMedia(false);
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  describe('setTheme', () => {
    it.each(['light', 'dark', 'system'] as const)('sets theme to %s', (theme) => {
      act(() => usePreferencesStore.getState().setTheme(theme));
      expect(usePreferencesStore.getState().theme).toBe(theme);
    });
  });

  describe('setPreviewFormat', () => {
    it.each(['markdown', 'xml', 'preview'] as const)('sets previewFormat to %s', (format) => {
      act(() => usePreferencesStore.getState().setPreviewFormat(format));
      expect(usePreferencesStore.getState().previewFormat).toBe(format);
    });
  });

  describe('setViewModes', () => {
    it.each([
      { modes: [], description: 'empty array' },
      { modes: ['code'] as const, description: 'code only' },
      { modes: ['preview'] as const, description: 'preview only' },
      { modes: ['code', 'preview'] as const, description: 'both modes' },
    ])('sets viewModes to $description', ({ modes }) => {
      act(() => usePreferencesStore.getState().setViewModes([...modes]));
      expect(usePreferencesStore.getState().viewModes).toEqual(modes);
    });
  });

  describe('toggleTheme', () => {
    it.each([
      { initial: 'light', systemDark: false, expected: 'dark' },
      { initial: 'dark', systemDark: false, expected: 'light' },
      { initial: 'system', systemDark: false, expected: 'dark' },
      { initial: 'system', systemDark: true, expected: 'light' },
    ] as const)('toggles from $initial to $expected', ({ initial, systemDark, expected }) => {
      window.matchMedia = mockMatchMedia(systemDark);
      usePreferencesStore.setState({ theme: initial });

      act(() => usePreferencesStore.getState().toggleTheme());

      expect(usePreferencesStore.getState().theme).toBe(expected);
    });
  });

  describe('getResolvedTheme', () => {
    it.each([
      { theme: 'light', systemDark: false, expected: 'light' },
      { theme: 'dark', systemDark: false, expected: 'dark' },
      { theme: 'system', systemDark: false, expected: 'light' },
      { theme: 'system', systemDark: true, expected: 'dark' },
    ] as const)('resolves $theme to $expected', ({ theme, systemDark, expected }) => {
      window.matchMedia = mockMatchMedia(systemDark);
      usePreferencesStore.setState({ theme });
      expect(usePreferencesStore.getState().getResolvedTheme()).toBe(expected);
    });
  });

  describe('reset', () => {
    it('resets to initial state', () => {
      usePreferencesStore.setState({
        theme: 'dark',
        previewFormat: 'xml',
        viewModes: ['code'],
      });
      act(() => usePreferencesStore.getState().reset());

      const state = usePreferencesStore.getState();
      expect(state.theme).toBe('system');
      expect(state.previewFormat).toBe('markdown');
      expect(state.viewModes).toEqual([]);
    });
  });

  describe('initPreferencesSync', () => {
    it('adds and removes storage event listener', () => {
      const addSpy = vi.spyOn(window, 'addEventListener');
      const removeSpy = vi.spyOn(window, 'removeEventListener');

      const cleanup = initPreferencesSync();

      expect(addSpy).toHaveBeenCalledWith('storage', expect.any(Function));

      cleanup();

      expect(removeSpy).toHaveBeenCalledWith('storage', expect.any(Function));
    });

    it('updates store when valid storage event is received', () => {
      usePreferencesStore.setState({ theme: 'light' });
      initPreferencesSync();

      const storageEvent = new StorageEvent('storage', {
        key: STORAGE_KEYS.preferences,
        newValue: JSON.stringify({ state: { theme: 'dark' } }),
      });

      act(() => {
        window.dispatchEvent(storageEvent);
      });

      expect(usePreferencesStore.getState().theme).toBe('dark');
    });

    it('ignores storage events for other keys', () => {
      usePreferencesStore.setState({ theme: 'light' });
      initPreferencesSync();

      const storageEvent = new StorageEvent('storage', {
        key: 'other-key',
        newValue: JSON.stringify({ state: { theme: 'dark' } }),
      });

      act(() => {
        window.dispatchEvent(storageEvent);
      });

      expect(usePreferencesStore.getState().theme).toBe('light');
    });

    it('ignores storage events with null newValue', () => {
      usePreferencesStore.setState({ theme: 'light' });
      initPreferencesSync();

      const storageEvent = new StorageEvent('storage', {
        key: STORAGE_KEYS.preferences,
        newValue: null,
      });

      act(() => {
        window.dispatchEvent(storageEvent);
      });

      expect(usePreferencesStore.getState().theme).toBe('light');
    });

    it('ignores storage events with invalid JSON', () => {
      usePreferencesStore.setState({ theme: 'light' });
      initPreferencesSync();

      const storageEvent = new StorageEvent('storage', {
        key: STORAGE_KEYS.preferences,
        newValue: 'invalid-json',
      });

      act(() => {
        window.dispatchEvent(storageEvent);
      });

      expect(usePreferencesStore.getState().theme).toBe('light');
    });

    it('ignores storage events without state property', () => {
      usePreferencesStore.setState({ theme: 'light' });
      initPreferencesSync();

      const storageEvent = new StorageEvent('storage', {
        key: STORAGE_KEYS.preferences,
        newValue: JSON.stringify({ foo: 'bar' }),
      });

      act(() => {
        window.dispatchEvent(storageEvent);
      });

      expect(usePreferencesStore.getState().theme).toBe('light');
    });
  });
});
