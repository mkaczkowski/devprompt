/**
 * Sort options for the library.
 */
export type SortOption = 'name' | 'dateModified';

/**
 * Sort direction.
 */
export type SortDirection = 'asc' | 'desc';

/**
 * Date group keys for grouping prompts by relative date.
 */
export type DateGroupKey =
  | 'today'
  | 'yesterday'
  | 'thisWeek'
  | 'lastWeek'
  | 'thisMonth'
  | 'lastMonth'
  | 'thisYear'
  | 'older';
