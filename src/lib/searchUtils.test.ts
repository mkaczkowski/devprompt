import { describe, expect, it } from 'vitest';

import { hasNoSearchResults, isSearchQueryActive } from './searchUtils';

describe('searchUtils', () => {
  describe('isSearchQueryActive', () => {
    it('returns true for non-empty query, false for empty/whitespace', () => {
      expect(isSearchQueryActive('test')).toBe(true);
      expect(isSearchQueryActive('')).toBe(false);
      expect(isSearchQueryActive('   ')).toBe(false);
    });
  });

  describe('hasNoSearchResults', () => {
    it('returns true when no results and query is active', () => {
      expect(hasNoSearchResults(0, 'search')).toBe(true);
      expect(hasNoSearchResults(5, 'search')).toBe(false);
      expect(hasNoSearchResults(0, '')).toBe(false);
    });
  });
});
