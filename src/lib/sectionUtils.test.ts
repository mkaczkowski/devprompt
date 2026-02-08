import { describe, expect, it } from 'vitest';

import {
  areAllCollapsed,
  canCopySections,
  findSectionById,
  getEnabledSections,
  getSectionsWithContent,
  getTotalContentLength,
  hasEnabledContent,
} from './sectionUtils';

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

  describe('getEnabledSections', () => {
    it('returns only enabled sections', () => {
      const enabled = createSection({ id: '1', enabled: true });
      const disabled = createSection({ id: '2', enabled: false });
      expect(getEnabledSections([enabled, disabled])).toEqual([enabled]);
    });

    it('returns empty array when none enabled', () => {
      expect(getEnabledSections([createSection({ enabled: false })])).toEqual([]);
    });
  });

  describe('getSectionsWithContent', () => {
    it('returns sections with non-empty trimmed content', () => {
      const withContent = createSection({ id: '1', content: 'Hello' });
      const empty = createSection({ id: '2', content: '   ' });
      expect(getSectionsWithContent([withContent, empty])).toEqual([withContent]);
    });
  });

  describe('getTotalContentLength', () => {
    it('sums content length of enabled sections only', () => {
      const a = createSection({ id: '1', enabled: true, content: 'abc' });
      const b = createSection({ id: '2', enabled: true, content: 'de' });
      const c = createSection({ id: '3', enabled: false, content: 'fghij' });
      expect(getTotalContentLength([a, b, c])).toBe(5);
    });

    it('returns 0 for empty array', () => {
      expect(getTotalContentLength([])).toBe(0);
    });
  });
});
