import { describe, expect, it } from 'vitest';

import { getDateGroupKey, getDateGroupLabel, groupPromptsByDate } from './dateGroups';

import type { PromptMetadata } from '@/types';

function makePrompt(id: string, updatedAt: number): PromptMetadata {
  return { id, title: `Prompt ${id}`, createdAt: updatedAt, updatedAt, sectionCount: 1, tokenCount: 100 };
}

describe('getDateGroupKey', () => {
  // Fixed reference: Wednesday 2025-01-15 12:00:00 UTC
  const now = new Date(2025, 0, 15, 12, 0, 0).getTime();
  const startOfToday = new Date(2025, 0, 15, 0, 0, 0).getTime();

  it('classifies timestamp from today as "today"', () => {
    expect(getDateGroupKey(startOfToday + 1000, now)).toBe('today');
    expect(getDateGroupKey(now - 1000, now)).toBe('today');
  });

  it('classifies timestamp from yesterday as "yesterday"', () => {
    const yesterday = startOfToday - 1; // last ms of yesterday
    expect(getDateGroupKey(yesterday, now)).toBe('yesterday');

    const startOfYesterday = startOfToday - 86_400_000;
    expect(getDateGroupKey(startOfYesterday, now)).toBe('yesterday');
  });

  it('classifies earlier this week as "thisWeek"', () => {
    // Jan 15 is Wednesday, Monday is Jan 13
    const monday = new Date(2025, 0, 13, 10, 0, 0).getTime();
    expect(getDateGroupKey(monday, now)).toBe('thisWeek');
  });

  it('classifies last week as "lastWeek"', () => {
    // Last Monday = Jan 6
    const lastMonday = new Date(2025, 0, 6, 10, 0, 0).getTime();
    expect(getDateGroupKey(lastMonday, now)).toBe('lastWeek');

    // Last Sunday = Jan 12
    const lastSunday = new Date(2025, 0, 12, 23, 59, 0).getTime();
    expect(getDateGroupKey(lastSunday, now)).toBe('lastWeek');
  });

  it('classifies earlier this month as "thisMonth"', () => {
    const earlyMonth = new Date(2025, 0, 2, 10, 0, 0).getTime();
    expect(getDateGroupKey(earlyMonth, now)).toBe('thisMonth');
  });

  it('classifies last month as "lastMonth"', () => {
    // Dec 2024 is last month relative to Jan 15, 2025
    const lastMonth = new Date(2024, 11, 25, 10, 0, 0).getTime();
    expect(getDateGroupKey(lastMonth, now)).toBe('lastMonth');

    const startOfLastMonth = new Date(2024, 11, 1, 0, 0, 0).getTime();
    expect(getDateGroupKey(startOfLastMonth, now)).toBe('lastMonth');
  });

  it('classifies earlier this year as "thisYear"', () => {
    // Use a reference date later in the year: June 15, 2025
    const juneNow = new Date(2025, 5, 15, 12, 0, 0).getTime();

    // March 2025 — earlier this year but not this/last month
    const march = new Date(2025, 2, 10, 10, 0, 0).getTime();
    expect(getDateGroupKey(march, juneNow)).toBe('thisYear');

    // January 2025 — also this year
    const january = new Date(2025, 0, 5, 10, 0, 0).getTime();
    expect(getDateGroupKey(january, juneNow)).toBe('thisYear');
  });

  it('classifies previous years as "older"', () => {
    const lastYear = new Date(2024, 11, 25, 10, 0, 0).getTime();
    // Use June 2025 reference so Dec 2024 is not "lastMonth"
    const juneNow = new Date(2025, 5, 15, 12, 0, 0).getTime();
    expect(getDateGroupKey(lastYear, juneNow)).toBe('older');

    const longAgo = new Date(2023, 5, 1).getTime();
    expect(getDateGroupKey(longAgo, now)).toBe('older');
  });
});

describe('getDateGroupLabel', () => {
  it('returns English label by default', () => {
    expect(getDateGroupLabel('today')).toBe('Today');
    expect(getDateGroupLabel('yesterday')).toBe('Yesterday');
    expect(getDateGroupLabel('thisWeek')).toBe('This Week');
    expect(getDateGroupLabel('lastWeek')).toBe('Last Week');
    expect(getDateGroupLabel('thisMonth')).toBe('This Month');
    expect(getDateGroupLabel('lastMonth')).toBe('Last Month');
    expect(getDateGroupLabel('thisYear')).toBe('This Year');
    expect(getDateGroupLabel('older')).toBe('Older');
  });

  it('uses translation function when provided', () => {
    const t = (label: string) => `[${label}]`;
    expect(getDateGroupLabel('today', t)).toBe('[Today]');
  });
});

describe('groupPromptsByDate', () => {
  it('returns empty array for empty input', () => {
    expect(groupPromptsByDate([], 'desc')).toEqual([]);
  });

  it('groups prompts and returns in desc order (recent first)', () => {
    const now = Date.now();
    const prompts = [
      makePrompt('a', now - 1000), // today
      makePrompt('b', now - 86_400_000 * 3), // a few days ago
      makePrompt('c', now - 500), // today (more recent)
    ];

    const groups = groupPromptsByDate(prompts, 'desc');

    // Today group should come first in desc order
    expect(groups[0].key).toBe('today');
    expect(groups[0].prompts).toHaveLength(2);
    // Within group, desc order: c before a
    expect(groups[0].prompts[0].id).toBe('c');
    expect(groups[0].prompts[1].id).toBe('a');
  });

  it('groups prompts in asc order (oldest first)', () => {
    const now = Date.now();
    const prompts = [
      makePrompt('a', now - 1000), // today
      makePrompt('b', now - 86_400_000 * 400), // older (over a year ago)
    ];

    const groups = groupPromptsByDate(prompts, 'asc');

    // Older group should come first in asc order
    expect(groups[0].key).toBe('older');
    expect(groups[groups.length - 1].key).toBe('today');
  });

  it('sorts prompts within a group in asc order', () => {
    const now = Date.now();
    const prompts = [makePrompt('newer', now - 100), makePrompt('older', now - 5000)];

    const groups = groupPromptsByDate(prompts, 'asc');
    expect(groups[0].prompts[0].id).toBe('older');
    expect(groups[0].prompts[1].id).toBe('newer');
  });

  it('omits empty groups', () => {
    const now = Date.now();
    const prompts = [makePrompt('a', now - 1000)]; // only today

    const groups = groupPromptsByDate(prompts, 'desc');
    expect(groups).toHaveLength(1);
    expect(groups[0].key).toBe('today');
  });
});
