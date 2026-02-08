import { beforeEach, describe, expect, it } from 'vitest';

import { extractPromptId, getAllAppKeys, isAppKey, STORAGE_KEYS } from './storageKeys';

describe('storageKeys', () => {
  describe('STORAGE_KEYS', () => {
    it('defines correct preferences key', () => {
      expect(STORAGE_KEYS.preferences).toBe('devprompt-preferences');
    });

    it('defines correct library key', () => {
      expect(STORAGE_KEYS.library).toBe('devprompt-library');
    });

    it('generates correct prompt key', () => {
      expect(STORAGE_KEYS.prompt('abc123')).toBe('devprompt-prompt-abc123');
      expect(STORAGE_KEYS.prompt('test-id')).toBe('devprompt-prompt-test-id');
    });
  });

  describe('isAppKey', () => {
    it('returns true for app keys', () => {
      expect(isAppKey('devprompt-preferences')).toBe(true);
      expect(isAppKey('devprompt-library')).toBe(true);
      expect(isAppKey('devprompt-prompt-abc123')).toBe(true);
    });

    it('returns false for non-app keys', () => {
      expect(isAppKey('other-app-key')).toBe(false);
      expect(isAppKey('preferences')).toBe(false);
      expect(isAppKey('')).toBe(false);
    });
  });

  describe('getAllAppKeys', () => {
    beforeEach(() => {
      localStorage.clear();
    });

    it('returns empty array when no app keys exist', () => {
      localStorage.setItem('other-app-key', 'value');
      expect(getAllAppKeys()).toEqual([]);
    });

    it('returns all app keys', () => {
      localStorage.setItem('devprompt-preferences', 'value1');
      localStorage.setItem('devprompt-library', 'value2');
      localStorage.setItem('devprompt-prompt-abc', 'value3');
      localStorage.setItem('other-key', 'value4');

      const keys = getAllAppKeys();
      expect(keys).toHaveLength(3);
      expect(keys).toContain('devprompt-preferences');
      expect(keys).toContain('devprompt-library');
      expect(keys).toContain('devprompt-prompt-abc');
      expect(keys).not.toContain('other-key');
    });
  });

  describe('extractPromptId', () => {
    it('extracts prompt ID from valid key', () => {
      expect(extractPromptId('devprompt-prompt-abc123')).toBe('abc123');
      expect(extractPromptId('devprompt-prompt-test-id')).toBe('test-id');
      expect(extractPromptId('devprompt-prompt-uuid-with-dashes')).toBe('uuid-with-dashes');
    });

    it('returns null for non-prompt keys', () => {
      expect(extractPromptId('devprompt-preferences')).toBeNull();
      expect(extractPromptId('devprompt-library')).toBeNull();
      expect(extractPromptId('other-key')).toBeNull();
    });

    it('returns null for empty prompt ID', () => {
      expect(extractPromptId('devprompt-prompt-')).toBeNull();
    });
  });
});
