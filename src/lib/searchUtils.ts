/**
 * Pure utility functions for search-related validation.
 */

/**
 * Checks if a search query is active (non-empty after trimming).
 */
export function isSearchQueryActive(query: string): boolean {
  return query.trim().length > 0;
}

/**
 * Checks if search results are empty while a search is active.
 */
export function hasNoSearchResults(resultsCount: number, query: string): boolean {
  return resultsCount === 0 && isSearchQueryActive(query);
}
