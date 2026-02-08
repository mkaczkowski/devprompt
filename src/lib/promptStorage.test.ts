import { beforeEach, describe, expect, it } from 'vitest';

import { deletePromptData, getEffectiveTitle, hasCustomTitle, loadPromptData, savePromptData } from './promptStorage';
import { STORAGE_KEYS } from './storageKeys';

import type { PromptData, Section } from '@/types';

describe('promptStorage', () => {
  beforeEach(() => {
    localStorage.clear();
  });

  const createSection = (overrides: Partial<Section> = {}): Section => ({
    id: 'section-1',
    title: 'Section Title',
    content: 'Section content here',
    enabled: true,
    collapsed: false,
    ...overrides,
  });

  describe('loadPromptData', () => {
    it('returns null when prompt does not exist', () => {
      expect(loadPromptData('nonexistent')).toBeNull();
    });

    it('loads valid prompt data', () => {
      const data: PromptData = {
        title: 'Test Prompt',
        sections: [createSection()],
        tokenCount: 10,
      };
      localStorage.setItem(STORAGE_KEYS.prompt('test-id'), JSON.stringify(data));

      const loaded = loadPromptData('test-id');
      expect(loaded).toEqual(data);
    });

    it('returns null for invalid JSON', () => {
      localStorage.setItem(STORAGE_KEYS.prompt('test-id'), 'invalid-json');
      expect(loadPromptData('test-id')).toBeNull();
    });

    it('returns null for data without sections array', () => {
      localStorage.setItem(STORAGE_KEYS.prompt('test-id'), JSON.stringify({ title: 'No sections' }));
      expect(loadPromptData('test-id')).toBeNull();
    });

    it('handles data with optional fields missing', () => {
      const data = { sections: [createSection()] };
      localStorage.setItem(STORAGE_KEYS.prompt('test-id'), JSON.stringify(data));

      const loaded = loadPromptData('test-id');
      expect(loaded?.title).toBeUndefined();
      expect(loaded?.tokenCount).toBeUndefined();
      expect(loaded?.sections).toHaveLength(1);
    });

    it('returns null when sections field is not an array', () => {
      const data = { sections: 'not-an-array' };
      localStorage.setItem(STORAGE_KEYS.prompt('test-id'), JSON.stringify(data));
      expect(loadPromptData('test-id')).toBeNull();
    });

    it('filters out invalid sections missing required fields', () => {
      const data = {
        title: 'Test',
        sections: [
          createSection({ id: 'valid-1' }),
          { id: 'invalid-1', title: 'Missing other fields' }, // missing content, enabled, collapsed
          createSection({ id: 'valid-2' }),
        ],
      };
      localStorage.setItem(STORAGE_KEYS.prompt('test-id'), JSON.stringify(data));

      const loaded = loadPromptData('test-id');
      expect(loaded?.sections).toHaveLength(2);
      expect(loaded?.sections[0].id).toBe('valid-1');
      expect(loaded?.sections[1].id).toBe('valid-2');
    });

    it('filters out sections with wrong field types', () => {
      const data = {
        sections: [
          createSection({ id: 'valid' }),
          { id: 123, title: 'Wrong id type', content: '', enabled: true, collapsed: false }, // id should be string
          { id: 'wrong-enabled', title: 'Test', content: '', enabled: 'yes', collapsed: false }, // enabled should be boolean
        ],
      };
      localStorage.setItem(STORAGE_KEYS.prompt('test-id'), JSON.stringify(data));

      const loaded = loadPromptData('test-id');
      expect(loaded?.sections).toHaveLength(1);
      expect(loaded?.sections[0].id).toBe('valid');
    });

    it('handles empty sections array', () => {
      const data = { title: 'Empty', sections: [] };
      localStorage.setItem(STORAGE_KEYS.prompt('test-id'), JSON.stringify(data));

      const loaded = loadPromptData('test-id');
      expect(loaded?.sections).toEqual([]);
    });

    it('loads instructions and instructionsCollapsed fields', () => {
      const data: PromptData = {
        title: 'Test',
        sections: [createSection()],
        instructions: 'Test instructions content',
        instructionsCollapsed: true,
      };
      localStorage.setItem(STORAGE_KEYS.prompt('test-id'), JSON.stringify(data));

      const loaded = loadPromptData('test-id');
      expect(loaded?.instructions).toBe('Test instructions content');
      expect(loaded?.instructionsCollapsed).toBe(true);
    });

    it('returns undefined for instructions when not in storage (migration)', () => {
      const data = { title: 'Old format', sections: [createSection()] };
      localStorage.setItem(STORAGE_KEYS.prompt('test-id'), JSON.stringify(data));

      const loaded = loadPromptData('test-id');
      expect(loaded?.instructions).toBeUndefined();
      expect(loaded?.instructionsCollapsed).toBeUndefined();
    });
  });

  describe('savePromptData', () => {
    it('saves prompt data with token count', () => {
      const data = {
        title: 'Test Prompt',
        sections: [createSection({ content: 'test content' })],
      };
      savePromptData('test-id', data);

      const saved = JSON.parse(localStorage.getItem(STORAGE_KEYS.prompt('test-id'))!);
      expect(saved.title).toBe('Test Prompt');
      expect(saved.sections).toHaveLength(1);
      expect(saved.tokenCount).toBeGreaterThan(0);
    });

    it('recalculates token count on every save', () => {
      savePromptData('test-id', {
        title: 'Short',
        sections: [createSection({ content: 'a' })],
      });
      const first = JSON.parse(localStorage.getItem(STORAGE_KEYS.prompt('test-id'))!);

      savePromptData('test-id', {
        title: 'Short',
        sections: [createSection({ content: 'a'.repeat(100) })],
      });
      const second = JSON.parse(localStorage.getItem(STORAGE_KEYS.prompt('test-id'))!);

      expect(second.tokenCount).toBeGreaterThan(first.tokenCount);
    });

    it('saves prompt data without throwing on valid input', () => {
      expect(() =>
        savePromptData('test-id', {
          title: 'Test',
          sections: [],
        }),
      ).not.toThrow();

      const saved = localStorage.getItem(STORAGE_KEYS.prompt('test-id'));
      expect(saved).not.toBeNull();
    });

    it('saves instructions and instructionsCollapsed fields', () => {
      savePromptData('test-id', {
        title: 'Test',
        sections: [],
        instructions: 'Important instructions',
        instructionsCollapsed: true,
      });

      const saved = JSON.parse(localStorage.getItem(STORAGE_KEYS.prompt('test-id'))!);
      expect(saved.instructions).toBe('Important instructions');
      expect(saved.instructionsCollapsed).toBe(true);
    });

    it('includes instructions in token count calculation', () => {
      // Save with no instructions
      savePromptData('test-id', {
        title: 'Test',
        sections: [createSection({ content: 'short' })],
      });
      const withoutInstructions = JSON.parse(localStorage.getItem(STORAGE_KEYS.prompt('test-id'))!);

      // Save with instructions
      savePromptData('test-id', {
        title: 'Test',
        sections: [createSection({ content: 'short' })],
        instructions: 'a'.repeat(100), // Add 100 chars of instructions
      });
      const withInstructions = JSON.parse(localStorage.getItem(STORAGE_KEYS.prompt('test-id'))!);

      expect(withInstructions.tokenCount).toBeGreaterThan(withoutInstructions.tokenCount);
    });
  });

  describe('deletePromptData', () => {
    it('removes prompt data from localStorage', () => {
      localStorage.setItem(STORAGE_KEYS.prompt('test-id'), JSON.stringify({ sections: [] }));
      deletePromptData('test-id');
      expect(localStorage.getItem(STORAGE_KEYS.prompt('test-id'))).toBeNull();
    });

    it('handles delete of nonexistent key gracefully', () => {
      expect(() => deletePromptData('nonexistent')).not.toThrow();
    });

    it('can delete multiple prompts', () => {
      localStorage.setItem(STORAGE_KEYS.prompt('test-1'), JSON.stringify({ sections: [] }));
      localStorage.setItem(STORAGE_KEYS.prompt('test-2'), JSON.stringify({ sections: [] }));

      deletePromptData('test-1');
      deletePromptData('test-2');

      expect(localStorage.getItem(STORAGE_KEYS.prompt('test-1'))).toBeNull();
      expect(localStorage.getItem(STORAGE_KEYS.prompt('test-2'))).toBeNull();
    });
  });

  describe('getEffectiveTitle', () => {
    it('returns explicit title when set', () => {
      const data: PromptData = {
        title: 'Explicit Title',
        sections: [createSection({ title: 'First Section' })],
      };
      expect(getEffectiveTitle(data)).toBe('Explicit Title');
    });

    it('returns first section title when no explicit title', () => {
      const data: PromptData = {
        sections: [createSection({ title: 'First Section' })],
      };
      expect(getEffectiveTitle(data)).toBe('First Section');
    });

    it('returns Untitled when no title and no sections', () => {
      const data: PromptData = { sections: [] };
      expect(getEffectiveTitle(data)).toBe('Untitled');
    });

    it('returns Untitled when first section has no title', () => {
      const data: PromptData = {
        sections: [createSection({ title: '' })],
      };
      expect(getEffectiveTitle(data)).toBe('Untitled');
    });
  });

  describe('hasCustomTitle', () => {
    it('returns true when explicit title is set', () => {
      const data: PromptData = {
        title: 'Custom Title',
        sections: [],
      };
      expect(hasCustomTitle(data)).toBe(true);
    });

    it('returns false when title is undefined', () => {
      const data: PromptData = { sections: [] };
      expect(hasCustomTitle(data)).toBe(false);
    });

    it('returns false when title is empty string', () => {
      const data: PromptData = { title: '', sections: [] };
      expect(hasCustomTitle(data)).toBe(false);
    });
  });
});
