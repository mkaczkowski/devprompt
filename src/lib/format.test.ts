import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import { formatCompactNumber, formatRelativeTime } from './format';

describe('formatCompactNumber', () => {
  it('returns number as-is below 1000', () => {
    expect(formatCompactNumber(0)).toBe('0');
    expect(formatCompactNumber(1)).toBe('1');
    expect(formatCompactNumber(999)).toBe('999');
  });

  it('formats thousands with k suffix', () => {
    expect(formatCompactNumber(1000)).toBe('1k');
    expect(formatCompactNumber(1500)).toBe('1.5k');
    expect(formatCompactNumber(12345)).toBe('12.3k');
    expect(formatCompactNumber(999999)).toBe('1000k');
  });

  it('formats millions with M suffix', () => {
    expect(formatCompactNumber(1000000)).toBe('1M');
    expect(formatCompactNumber(1500000)).toBe('1.5M');
    expect(formatCompactNumber(12345678)).toBe('12.3M');
  });

  it('removes trailing .0', () => {
    expect(formatCompactNumber(2000)).toBe('2k');
    expect(formatCompactNumber(3000000)).toBe('3M');
  });
});

describe('formatRelativeTime', () => {
  const NOW = 1700000000000;

  beforeEach(() => {
    vi.useFakeTimers();
    vi.setSystemTime(NOW);
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it('returns "Just now" for recent timestamps', () => {
    expect(formatRelativeTime(NOW)).toBe('Just now');
    expect(formatRelativeTime(NOW - 30000)).toBe('Just now');
  });

  it('returns minutes ago', () => {
    expect(formatRelativeTime(NOW - 60000)).toBe('1m ago');
    expect(formatRelativeTime(NOW - 5 * 60000)).toBe('5m ago');
    expect(formatRelativeTime(NOW - 59 * 60000)).toBe('59m ago');
  });

  it('returns hours ago', () => {
    expect(formatRelativeTime(NOW - 60 * 60000)).toBe('1h ago');
    expect(formatRelativeTime(NOW - 12 * 60 * 60000)).toBe('12h ago');
    expect(formatRelativeTime(NOW - 23 * 60 * 60000)).toBe('23h ago');
  });

  it('returns days ago', () => {
    expect(formatRelativeTime(NOW - 24 * 60 * 60000)).toBe('1d ago');
    expect(formatRelativeTime(NOW - 7 * 24 * 60 * 60000)).toBe('7d ago');
    expect(formatRelativeTime(NOW - 30 * 24 * 60 * 60000)).toBe('30d ago');
  });

  it('returns formatted date for >30 days', () => {
    const oldTimestamp = NOW - 31 * 24 * 60 * 60000;
    const result = formatRelativeTime(oldTimestamp);

    expect(result).toMatch(/^\d{1,2}\/\d{1,2}\/\d{4}$/);
  });
});
