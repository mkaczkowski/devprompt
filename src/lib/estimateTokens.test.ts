import { describe, expect, it } from 'vitest';

import { calculateSectionsTokenCount, calculateSectionTokenCount, estimateTokens } from './estimateTokens';

import type { Section } from '@/types';

describe('estimateTokens', () => {
  describe('estimateTokens', () => {
    it('returns 0 for empty string', () => {
      expect(estimateTokens('')).toBe(0);
    });

    it('estimates tokens based on character count', () => {
      // With 4 chars per token average
      expect(estimateTokens('test')).toBe(1); // 4 chars = 1 token
      expect(estimateTokens('testtest')).toBe(2); // 8 chars = 2 tokens
      expect(estimateTokens('a')).toBe(1); // 1 char = 1 token (ceil)
    });

    it('rounds up partial tokens', () => {
      expect(estimateTokens('hello')).toBe(2); // 5 chars / 4 = 1.25, ceil = 2
    });
  });

  describe('calculateSectionTokenCount', () => {
    const createSection = (title: string, content: string): Section => ({
      id: 'test',
      title,
      content,
      enabled: true,
      collapsed: false,
    });

    it('counts tokens from title and content', () => {
      const section = createSection('test', 'content1'); // 4 + 8 = 12 chars = 3 tokens
      expect(calculateSectionTokenCount(section)).toBe(3);
    });

    it('handles empty title', () => {
      const section = createSection('', 'testtest'); // 8 chars = 2 tokens
      expect(calculateSectionTokenCount(section)).toBe(2);
    });

    it('handles empty content', () => {
      const section = createSection('test', ''); // 4 chars = 1 token
      expect(calculateSectionTokenCount(section)).toBe(1);
    });

    it('handles both empty', () => {
      const section = createSection('', '');
      expect(calculateSectionTokenCount(section)).toBe(0);
    });
  });

  describe('calculateSectionsTokenCount', () => {
    const createSection = (id: string, enabled: boolean, content: string): Section => ({
      id,
      title: '',
      content,
      enabled,
      collapsed: false,
    });

    it('sums tokens from all enabled sections', () => {
      const sections = [
        createSection('1', true, 'test'), // 1 token
        createSection('2', true, 'testtest'), // 2 tokens
      ];
      expect(calculateSectionsTokenCount(sections)).toBe(3);
    });

    it('ignores disabled sections', () => {
      const sections = [
        createSection('1', true, 'test'), // 1 token
        createSection('2', false, 'testtest'), // ignored
      ];
      expect(calculateSectionsTokenCount(sections)).toBe(1);
    });

    it('returns 0 for empty array', () => {
      expect(calculateSectionsTokenCount([])).toBe(0);
    });

    it('returns 0 when all sections disabled', () => {
      const sections = [createSection('1', false, 'test'), createSection('2', false, 'testtest')];
      expect(calculateSectionsTokenCount(sections)).toBe(0);
    });
  });
});
