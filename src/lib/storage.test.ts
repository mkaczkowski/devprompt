import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import { clearAppStorage, getStorageItem, removeStorageItem, setStorageItem } from '@/lib/storage';
import { STORAGE_KEYS } from '@/lib/storageKeys';

describe('storage utilities', () => {
  beforeEach(() => localStorage.clear());
  afterEach(() => {
    localStorage.clear();
    vi.restoreAllMocks();
  });

  describe('setStorageItem', () => {
    it('stores values and returns true', () => {
      expect(setStorageItem(STORAGE_KEYS.preferences, { theme: 'dark' })).toBe(true);
      expect(localStorage.getItem(STORAGE_KEYS.preferences)).toBe('{"theme":"dark"}');
    });

    it('returns false on storage failure', () => {
      vi.spyOn(console, 'error').mockImplementation(() => {});
      vi.spyOn(Storage.prototype, 'setItem').mockImplementation(() => {
        throw new Error('QuotaExceeded');
      });

      expect(setStorageItem(STORAGE_KEYS.preferences, {})).toBe(false);
    });
  });

  describe('getStorageItem', () => {
    it.each([
      { stored: '{"theme":"dark"}', defaultVal: { theme: 'light' }, expected: { theme: 'dark' } },
      { stored: null, defaultVal: { theme: 'light' }, expected: { theme: 'light' } },
      { stored: 'not-json', defaultVal: 'en', expected: 'not-json' },
    ])('retrieves stored value or default', ({ stored, defaultVal, expected }) => {
      if (stored) localStorage.setItem(STORAGE_KEYS.preferences, stored);
      expect(getStorageItem(STORAGE_KEYS.preferences, defaultVal)).toEqual(expected);
    });

    it('returns default when storage cleared during parse', () => {
      let callCount = 0;
      vi.spyOn(Storage.prototype, 'getItem').mockImplementation(() => {
        callCount++;
        return callCount === 1 ? 'invalid{' : null;
      });

      expect(getStorageItem(STORAGE_KEYS.preferences, 'default')).toBe('default');
    });
  });

  describe('removeStorageItem', () => {
    it('removes value and returns true', () => {
      localStorage.setItem(STORAGE_KEYS.preferences, '{}');
      expect(removeStorageItem(STORAGE_KEYS.preferences)).toBe(true);
      expect(localStorage.getItem(STORAGE_KEYS.preferences)).toBeNull();
    });

    it('returns false on failure', () => {
      vi.spyOn(console, 'error').mockImplementation(() => {});
      vi.spyOn(Storage.prototype, 'removeItem').mockImplementation(() => {
        throw new Error();
      });

      expect(removeStorageItem(STORAGE_KEYS.preferences)).toBe(false);
    });
  });

  describe('clearAppStorage', () => {
    it('clears only app keys', () => {
      localStorage.setItem(STORAGE_KEYS.preferences, '{}');
      localStorage.setItem('other-key', 'value');

      expect(clearAppStorage()).toBe(true);
      expect(localStorage.getItem(STORAGE_KEYS.preferences)).toBeNull();
      expect(localStorage.getItem('other-key')).toBe('value');
    });

    it('returns false on failure', () => {
      vi.spyOn(console, 'error').mockImplementation(() => {});
      vi.spyOn(Storage.prototype, 'removeItem').mockImplementation(() => {
        throw new Error();
      });

      expect(clearAppStorage()).toBe(false);
    });
  });
});
