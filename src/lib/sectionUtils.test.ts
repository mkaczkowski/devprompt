import { describe, expect, it } from 'vitest';

import { areAllCollapsed, canCopySections, findSectionById, hasEnabledContent } from './sectionUtils';

import type { Section } from '@/types';

const createSection = (overrides: Partial<Section> = {}): Section => ({
  id: 'test-id',
  title: 'Test',
  content: 'Content',
  enabled: true,
  collapsed: false,
  ...overrides,
});

describe('sectionUtils', () => {
  describe('hasEnabledContent', () => {
    it('returns true for enabled section with content, false otherwise', () => {
      expect(hasEnabledContent([createSection()])).toBe(true);
      expect(hasEnabledContent([])).toBe(false);
      expect(hasEnabledContent([createSection({ enabled: false })])).toBe(false);
      expect(hasEnabledContent([createSection({ content: '   ' })])).toBe(false);
    });
  });

  describe('canCopySections', () => {
    it('requires non-empty array with enabled content', () => {
      expect(canCopySections([createSection()])).toBe(true);
      expect(canCopySections([])).toBe(false);
    });
  });

  describe('areAllCollapsed', () => {
    it('checks if all sections are collapsed', () => {
      expect(areAllCollapsed([createSection({ collapsed: true })])).toBe(true);
      expect(areAllCollapsed([createSection({ collapsed: false })])).toBe(false);
      expect(areAllCollapsed([])).toBe(false);
    });
  });

  describe('findSectionById', () => {
    it('finds section or returns undefined', () => {
      const section = createSection({ id: 'target' });
      expect(findSectionById([section], 'target')).toBe(section);
      expect(findSectionById([section], 'missing')).toBeUndefined();
    });
  });
});
